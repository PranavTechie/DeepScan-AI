import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Image, Video, Mic } from "lucide-react";
import ParticleField from "@/components/ParticleField";
import StatsCounter from "@/components/StatsCounter";
import type { DemoTab } from "@/components/LiveDemoSection";

interface HeroSectionProps {
  onDemoTabSelect?: (tab: DemoTab) => void;
}

const HeroSection = ({ onDemoTabSelect }: HeroSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("animate-fade-up");
        });
      },
      { threshold: 0.1 }
    );
    const els = sectionRef.current?.querySelectorAll(".reveal");
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToDemo = (tab: DemoTab) => {
    onDemoTabSelect?.(tab);
    setTimeout(() => {
      document.querySelector("#demo")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-glow/8 blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-primary/4 blur-[80px] animate-float" />
      </div>
      <ParticleField />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="reveal opacity-0 inline-block mb-6 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium shimmer-badge">
          AI-Powered Verification Platform
        </div>
        <h1 className="reveal opacity-0 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight max-w-4xl mx-auto" style={{ animationDelay: "0.1s" }}>
          AI-Powered Content Authenticity{" "}
          <span className="gradient-blue-text">& Deepfake Risk Analysis.</span>
        </h1>
        <p className="reveal opacity-0 mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" style={{ animationDelay: "0.2s" }}>
          Harness the power of advanced neural networks to verify content authenticity
          in real-time. Protect yourself from misinformation and manipulated media.
        </p>
        <div className="reveal opacity-0 mt-10 flex flex-col xs:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4" style={{ animationDelay: "0.3s" }}>
          <Button
            size="lg"
            onClick={() => scrollToDemo("text")}
            className="gradient-blue text-primary-foreground border-0 text-base px-8 h-12 hover:opacity-90 hover:scale-105 transition-all duration-300 glow-blue-sm hover:shadow-lg hover:shadow-primary/25 w-auto max-xs:w-full"
          >
            <FileText className="h-5 w-5 mr-2" />
            Analyze Text
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => scrollToDemo("image")}
            className="text-base px-8 h-12 border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:scale-105 transition-all duration-300 w-auto max-xs:w-full"
          >
            <Image className="h-5 w-5 mr-2" />
            Scan Image
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => scrollToDemo("video")}
            className="text-base px-8 h-12 border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:scale-105 transition-all duration-300 w-auto max-xs:w-full"
          >
            <Video className="h-5 w-5 mr-2" />
            Check Video
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => scrollToDemo("audio")}
            className="text-base px-8 h-12 border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:scale-105 transition-all duration-300 w-auto max-xs:w-full"
          >
            <Mic className="h-5 w-5 mr-2" />
            Detect Audio
          </Button>
        </div>

        {/* Animated Stats */}
        <div className="reveal opacity-0 mt-16" style={{ animationDelay: "0.4s" }}>
          <StatsCounter />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
