import { useEffect, useRef } from "react";
import { Check, X, Minus } from "lucide-react";

type CellValue = true | false | "partial" | string;

const features: {
  label: string;
  deepScan: CellValue;
  compA: CellValue;
  compB: CellValue;
}[] = [
  { label: "AI Text Authenticity Analysis", deepScan: true, compA: true, compB: true },
  { label: "AI Image Deepfake Detection", deepScan: true, compA: true, compB: false },
  { label: "Risk Level Classification", deepScan: true, compA: "partial", compB: false },
  { label: "Basic API Access", deepScan: true, compA: "partial", compB: true },
  { label: "Free Starter Plan", deepScan: true, compA: true, compB: false },
  { label: "Video Deepfake Scanner", deepScan: false, compA: false, compB: "partial" },
  { label: "Synthetic Voice Detection", deepScan: false, compA: false, compB: false },
  { label: "Batch Processing", deepScan: false, compA: false, compB: false },
  { label: "On-Premise Deployment", deepScan: false, compA: false, compB: false },
  { label: "Advanced Fact Verification Engine", deepScan: "coming soon", compA: true, compB: false },
];

const CellIcon = ({ value }: { value: CellValue }) => {
  if (value === true)
    return <Check className="h-5 w-5 text-emerald-500 mx-auto" />;
  if (value === false)
    return <X className="h-5 w-5 text-red-400 mx-auto" />;
  if (value === "partial")
    return <Minus className="h-5 w-5 text-amber-500 mx-auto" />;
  return <span className="text-xs text-muted-foreground">{value}</span>;
};

const ComparisonSection = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) =>
            e.isIntersecting && e.target.classList.add("animate-fade-up")
        ),
      { threshold: 0.1 }
    );
    ref.current
      ?.querySelectorAll(".reveal")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="reveal opacity-0 text-center mb-16">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
            Comparison
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Why Choose <span className="gradient-blue-text">DeepScan AI?</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparent comparison based on currently available features.
          </p>
        </div>

        <div className="reveal opacity-0 max-w-4xl mx-auto overflow-x-auto relative">
          <div className="md:hidden text-center mb-3">
            <span className="text-xs text-muted-foreground">
              ← Scroll to compare →
            </span>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden min-w-[500px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Feature
                  </th>
                  <th className="p-4 text-center">
                    <span className="font-display font-bold text-primary text-sm">
                      DeepScan AI
                    </span>
                  </th>
                  <th className="p-4 text-center">
                    <span className="font-display font-bold text-muted-foreground text-sm">
                      Competitor A
                    </span>
                  </th>
                  <th className="p-4 text-center">
                    <span className="font-display font-bold text-muted-foreground text-sm">
                      Competitor B
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {features.map((f, i) => (
                  <tr
                    key={f.label}
                    className={`${
                      i < features.length - 1
                        ? "border-b border-border/20"
                        : ""
                    } hover:bg-primary/[0.04] transition-colors duration-300`}
                  >
                    <td className="p-4 text-sm font-medium text-foreground">
                      {f.label}
                    </td>

                    <td className="p-4 text-center bg-primary/[0.03] relative">
                      <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none" />
                      <CellIcon value={f.deepScan} />
                    </td>

                    <td className="p-4 text-center">
                      <CellIcon value={f.compA} />
                    </td>

                    <td className="p-4 text-center">
                      <CellIcon value={f.compB} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;