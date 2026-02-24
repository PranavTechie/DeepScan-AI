import crypto from "crypto";

const rateLimitStore: Record<
  string,
  { count: number; firstRequest: number; lastRequest: number }
> = {};

const responseCache: Record<string, any> = {};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ================= IP + RATE LIMIT =================
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "unknown";

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const cooldown = 15 * 1000;

    if (!rateLimitStore[ip]) {
      rateLimitStore[ip] = {
        count: 0,
        firstRequest: now,
        lastRequest: 0,
      };
    }

    const user = rateLimitStore[ip];

    // Reset after 1 hour
    if (now - user.firstRequest > oneHour) {
      user.count = 0;
      user.firstRequest = now;
    }

    // Cooldown check
    if (now - user.lastRequest < cooldown) {
      return res.status(429).json({
        error: "Please wait 15 seconds before next analysis.",
      });
    }

    // Rate limit check
    if (user.count >= 5) {
      return res.status(429).json({
        error: "Rate limit exceeded. Try again later.",
      });
    }

    user.count++;
    user.lastRequest = now;

    // ================= BODY =================
    const { type, content, fileBase64 } = req.body;

    if (!type) {
      return res.status(400).json({ error: "Missing type" });
    }

    if (type !== "text" && type !== "image") {
      return res
        .status(400)
        .json({ error: "Only 'text' and 'image' supported" });
    }

    // ================= CACHING =================
    const hash = crypto
      .createHash("sha256")
      .update(type + (content || "") + (fileBase64 || ""))
      .digest("hex");

    if (responseCache[hash]) {
      return res.status(200).json(responseCache[hash]);
    }

    // ============================================================
    // ====================== IMAGE CASE ===========================
    // ============================================================
    if (type === "image") {
      if (!fileBase64) {
        return res.status(400).json({ error: "Missing image data" });
      }

      const imageBuffer = Buffer.from(fileBase64, "base64");

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const hfResponse = await fetch(
        "https://router.huggingface.co/hf-inference/models/dima806/deepfake_vs_real_image_detection",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/octet-stream",
          },
          body: imageBuffer,
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      if (!hfResponse.ok) {
        const errorText = await hfResponse.text();
        return res.status(500).json({
          error: "HuggingFace request failed",
          details: errorText,
        });
      }

      const hfData = await hfResponse.json();

      if (!Array.isArray(hfData)) {
        return res.status(500).json({
          error: "Invalid HuggingFace response",
          details: hfData,
        });
      }

      const fakeResult = hfData.find((r: any) =>
        r.label.toLowerCase().includes("fake")
      );

      const realResult = hfData.find((r: any) =>
        r.label.toLowerCase().includes("real")
      );

      const fakeScore = fakeResult?.score ?? 0;
      const realScore = realResult?.score ?? 0;

      const authenticityScore = Math.round(realScore * 100);

      let risk: "Low" | "Medium" | "High" = "Low";
      if (authenticityScore < 60) risk = "High";
      else if (authenticityScore < 80) risk = "Medium";

      const resultData = {
        score: authenticityScore,
        risk,
        breakdown: [
          {
            label: "Deepfake Probability",
            value: Math.round(fakeScore * 100),
          },
          {
            label: "Real Probability",
            value: Math.round(realScore * 100),
          },
        ],
      };

      responseCache[hash] = resultData;

      return res.status(200).json(resultData);
    }

    // ============================================================
    // ====================== TEXT CASE ============================
    // ============================================================
    if (type === "text") {
      if (!content || content.length < 100) {
        return res.status(400).json({
          error: "Text must be at least 100 characters long.",
        });
      }

      const trimmedContent = String(content).slice(0, 4000);

      const systemPrompt = `
You are an advanced forensic text authenticity analyzer.

Strictly evaluate:
1. Logical consistency
2. Emotional manipulation
3. Unsupported claims
4. Fake statistics
5. Bias indicators

Return STRICT JSON:

{
  "score": number,
  "risk": "Low" | "Medium" | "High",
  "breakdown": [
    { "label": "Logical Consistency", "value": number },
    { "label": "Manipulation Signals", "value": number },
    { "label": "Source Credibility", "value": number }
  ]
}

Return only valid JSON.
`;

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: trimmedContent },
            ],
            temperature: 0, // more stable results
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        return res.status(500).json({
          error: "OpenRouter request failed",
          details: errText,
        });
      }

      const data = await response.json();

      let raw = data.choices?.[0]?.message?.content?.trim();

      if (!raw) {
        return res.status(500).json({
          error: "No AI response",
        });
      }

      if (raw.startsWith("```")) {
        raw = raw.replace(/```json|```/g, "").trim();
      }

      let parsed: any;

      try {
        parsed = JSON.parse(raw);
      } catch {
        return res.status(500).json({
          error: "Invalid JSON from model",
          raw,
        });
      }

      if (Array.isArray(parsed.breakdown)) {
        const avg =
          parsed.breakdown.reduce(
            (sum: number, b: any) => sum + Number(b.value || 0),
            0
          ) / parsed.breakdown.length;

        parsed.score = Math.round(avg);

        if (avg >= 80) parsed.risk = "Low";
        else if (avg >= 60) parsed.risk = "Medium";
        else parsed.risk = "High";
      }

      responseCache[hash] = parsed;

      return res.status(200).json(parsed);
    }
  } catch (error: any) {
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
}