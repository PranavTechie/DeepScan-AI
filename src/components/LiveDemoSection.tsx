import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Loader2, CheckCircle2, AlertTriangle, XCircle, FileText, Image, Video, Mic, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export type DemoTab = "text" | "image" | "video" | "audio";

type Result = {
  score: number;
  risk: "Low" | "Medium" | "High";
  breakdown: { label: string; value: number }[];
};

const tabConfig: Record<DemoTab, { label: string; icon: typeof FileText; accept: string; placeholder: string; breakdownLabels: string[] }> = {
  text: { label: "Text Analysis", icon: FileText, accept: ".txt,text/plain", placeholder: "Paste an article, URL, or any text to analyze…", breakdownLabels: ["Source Credibility", "Language Analysis", "Fact Consistency", "Cross-Reference"] },
  image: { label: "Image Scanner", icon: Image, accept: "image/png,image/jpeg", placeholder: "Describe the image source or paste a URL…", breakdownLabels: ["AI Generation Score", "Pixel Manipulation", "Metadata Integrity", "EXIF Analysis"] },
  video: { label: "Video Checker", icon: Video, accept: "video/mp4,video/webm,video/mov,video/avi", placeholder: "Paste a video URL or describe the content…", breakdownLabels: ["Deepfake Probability", "Face Consistency", "Lip-Sync Analysis", "Temporal Coherence"] },
  audio: { label: "Audio Analyzer", icon: Mic, accept: "audio/mp3,audio/wav,audio/mpeg,audio/ogg,audio/webm", placeholder: "Paste an audio URL or describe the content…", breakdownLabels: ["Synthetic Voice Score", "Spectral Analysis", "Voice Cloning Detection", "Background Artifacts"] },
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

interface LiveDemoSectionProps {
  activeTab?: DemoTab;
  onTabChange?: (tab: DemoTab) => void;
}

const LiveDemoSection = ({ activeTab, onTabChange }: LiveDemoSectionProps) => {
  const [tab, setTab] = useState<DemoTab>(activeTab || "text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (activeTab && activeTab !== tab) {
      setTab(activeTab);
      setResult(null);
      setText("");
      setFile(null);
    }
  }, [activeTab]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("animate-fade-up")),
      { threshold: 0.1 }
    );
    sectionRef.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleTabChange = (v: string) => {
    const newTab = v as DemoTab;
    setTab(newTab);
    onTabChange?.(newTab);
    setResult(null);
    setText("");
    setFile(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

const analyze = async () => {
  if (!text.trim() && !file) return;

  setLoading(true);
  setResult(null);

  try {
    let content = text.trim();
    let fileBase64: string | undefined;
    let fileMimeType: string | undefined;

if (file) {
  if (tab === "image") {
    if (
      file.type !== "image/png" &&
      file.type !== "image/jpeg"
    ) {
      throw new Error("Only PNG and JPG supported");
    }

    const base64Full = await fileToBase64(file);
    fileBase64 = base64Full.split(",")[1];
    fileMimeType = file.type;
    content = `Analyze this image file: ${file.name}`;
  }

  else if (tab === "text") {
    if (file.type !== "text/plain") {
      throw new Error("Only .txt files supported");
    }

    content = await file.text();
  }

else {
  setLoading(false);
  toast({
    title: "Coming Soon",
    description: "This feature is under development.",
  });
  return;
}
}

const response = await fetch("/api/analyze", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    type: tab,
    content,
    fileBase64,
    fileMimeType,
  }),
});

const data = await response.json();

if (!response.ok) {
  toast({
    title: "Analysis Failed",
    description: data.error || "Something went wrong.",
    variant: "destructive",
  });
  return;
}

setResult(data);

  } catch (err: any) {
    toast({
    title: "Analysis Failed",
    description: err.message || "Unexpected error occurred.",
    variant: "destructive",
  });
  } finally {
    setLoading(false);
  }
};

  const riskIcon = result?.risk === "Low" ? CheckCircle2 : result?.risk === "Medium" ? AlertTriangle : XCircle;
  const riskColor =
    result?.risk === "Low"
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      : result?.risk === "Medium"
      ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
      : "bg-red-500/10 text-red-600 border-red-500/20";

  const cfg = tabConfig[tab];

  return (
    <section id="demo" ref={sectionRef} className="py-24 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="reveal opacity-0 text-center mb-16">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
            Live Demo
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Try It <span className="gradient-blue-text">Right Now</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Select a detection type and test our AI verification in action.
          </p>
        </div>

        <div className="reveal opacity-0 max-w-3xl mx-auto">
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList className="flex w-full justify-center gap-2 mb-6 bg-transparent h-auto p-0">
              {(Object.keys(tabConfig) as DemoTab[]).map((key) => {
                const Icon = tabConfig[key].icon;
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm transition-all data-[state=active]:gradient-blue data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=inactive]:bg-secondary/60 data-[state=inactive]:hover:bg-secondary">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tabConfig[key].label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {(Object.keys(tabConfig) as DemoTab[]).map((key) => (
              <TabsContent key={key} value={key}>
                {key === "video" || key === "audio" ? (
                  <div className="glass-card rounded-2xl p-12 text-center space-y-4 animate-fade-up">
                    <Clock className="h-12 w-12 mx-auto text-primary/60 animate-pulse" />
                    <h3 className="font-display text-2xl font-bold text-foreground">Coming Soon</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      This feature is under development. Stay tuned!
                    </p>
                  </div>
                ) : (
                  <div className="glass-card rounded-2xl p-8 space-y-6">
                    {/* Drop zone */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInput.current?.click()}
                      className={`cursor-pointer border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
                        dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-primary/[0.02]"
                      }`}
                    >
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      {file ? (
                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-foreground">Drag & drop a file here</p>
                          <p className="text-xs text-muted-foreground mt-1">Accepted: {tabConfig[key].accept}</p>
                        </>
                      )}
                      <input
                        ref={fileInput}
                        type="file"
                        className="hidden"
                        accept={tabConfig[key].accept}
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </div>

                    {key === "text" && (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="h-px flex-1 bg-border" />
                          <span className="text-xs text-muted-foreground">or paste text</span>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        <Textarea
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder={cfg.placeholder}
                          rows={4}
                          className="bg-background/50 border-border/50 focus:border-primary/40 resize-none"
                        />
                      </>
                    )}

                    <Button
                      onClick={analyze}
                      disabled={loading || (!text.trim() && !file)}
                      className="w-full gradient-blue text-primary-foreground border-0 h-12 text-base hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Analyzing with AI…
                        </>
                      ) : (
                        `Analyze ${tabConfig[key].label}`
                      )}
                    </Button>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* Results */}
          {result && (
            <div className="mt-8 glass-card rounded-2xl p-8 animate-fade-up space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-muted-foreground mb-1">Authenticity Score</p>
                  <p className="font-display text-5xl font-bold text-foreground">
                    {result.score}
                    <span className="text-2xl text-muted-foreground">%</span>
                  </p>
                </div>
                <Badge className={`${riskColor} border text-sm px-4 py-1.5 gap-1.5`}>
                  {(() => { const Icon = riskIcon; return <Icon className="h-4 w-4" />; })()}
                  {result.risk} Risk
                </Badge>
              </div>

              <div className="space-y-4">
                {result.breakdown.map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">{b.label}</span>
                      <span className="font-medium text-foreground">{b.value}%</span>
                    </div>
                    <Progress value={b.value} className="h-2 bg-secondary" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LiveDemoSection;
