import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Check, Rocket } from "lucide-react";
import { toast } from "sonner";

const features = [
  "AI Text Authenticity Analysis",
  "AI Image Deepfake Detection",
  "Basic Risk Scoring System",
  "Real-time Analysis Results",
  "Limited Requests (Rate Limited)",
];

const PricingSection = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && e.target.classList.add("animate-fade-up")
        ),
      { threshold: 0.1 }
    );
    ref.current
      ?.querySelectorAll(".reveal")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" ref={ref} className="py-24 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="reveal opacity-0 text-center mb-16">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
            Pricing
          </span>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Simple <span className="gradient-blue-text">Starter</span> Plan
          </h2>

          <p className="mt-4 text-muted-foreground text-sm max-w-xl mx-auto">
            DeepScan AI currently offers a free starter plan with core AI
            detection features. Advanced capabilities and higher limits will
            be available in upcoming premium plans.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="reveal opacity-0 group relative rounded-3xl p-[1px] bg-gradient-to-br from-primary via-primary/60 to-primary/20 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-700">
            <div className="relative h-full rounded-[calc(1.5rem-1px)] p-8 lg:p-10 bg-card transition-transform duration-700 group-hover:-translate-y-1">
              
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full shimmer-badge text-primary-foreground text-xs font-bold tracking-wide shadow-lg">
                🚀 Starter Plan
              </div>

              {/* Icon + Name */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center gradient-blue text-primary-foreground glow-blue-sm">
                  <Rocket className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Free Access
                </h3>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-display text-5xl font-bold gradient-blue-text">
                  $0
                </span>
                <span className="text-muted-foreground text-sm">
                  — Limited Usage
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-8">
                Access core AI detection tools for text and image analysis.
                Suitable for testing and light usage.
              </p>

              {/* Divider */}
              <div className="h-px mb-6 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

              {/* Features */}
              <ul className="space-y-4 mb-10">
                {features.map((f, i) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-sm text-foreground opacity-0 animate-fade-up"
                    style={{ animationDelay: `${0.4 + i * 0.08}s` }}
                  >
                    <div className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 gradient-blue text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                onClick={() =>
                  toast.success(
                    "Starter plan active. You can begin analyzing now."
                  )
                }
                size="lg"
                className="w-full font-semibold gradient-blue text-primary-foreground border-0 hover:opacity-90 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"
              >
                Start Using Free Plan
              </Button>

              {/* Note */}
              <p className="text-xs text-muted-foreground text-center mt-4">
                🔒 Rate limits apply to prevent abuse.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;