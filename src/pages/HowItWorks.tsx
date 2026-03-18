import { Globe, Upload, Cpu, BarChart3, Database, Monitor, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Upload,
    title: "01 — Upload Image",
    description: "Upload satellite imagery (Sentinel-2, Landsat) or aerial/drone photographs. Supports JPG, PNG, and TIFF formats up to 10MB.",
    details: ["Auto-format validation", "Image preview", "Source detection", "Drag & drop support"],
  },
  {
    icon: Cpu,
    title: "02 — Preprocessing",
    description: "Images are automatically resized to 224×224, pixel values normalized, and RGB channels standardized for model input.",
    details: ["Resize & crop", "Pixel normalization", "RGB standardization", "Source-agnostic pipeline"],
  },
  {
    icon: Database,
    title: "03 — CNN Classification",
    description: "A transfer-learning CNN (ResNet/EfficientNet backbone) extracts spatial features and runs softmax classification across land-use categories.",
    details: ["Transfer learning", "Feature extraction", "Softmax output", "Probability scoring"],
  },
  {
    icon: BarChart3,
    title: "04 — Results & Visualization",
    description: "View the predicted land class, confidence percentage, and full probability distribution chart. Export reports for further analysis.",
    details: ["Predicted class label", "Confidence gauge", "Probability bar chart", "CSV/PDF export"],
  },
];

const archLayers = [
  { label: "Browser (React UI)", color: "bg-primary/20 text-primary border-primary/30" },
  { label: "REST API (FastAPI)", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { label: "Preprocessing Engine", color: "bg-warning/20 text-warning border-warning/30" },
  { label: "CNN Model (ResNet)", color: "bg-accent/20 text-accent border-accent/30" },
  { label: "Prediction Engine", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { label: "JSON Response", color: "bg-success/20 text-success border-success/30" },
];

const HowItWorks = () => (
  <div className="min-h-screen bg-background">
    {/* Hero */}
    <section className="py-20 px-4 text-center border-b border-border">
      <div className="max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6">
          <Globe className="h-4 w-4 text-primary" />
          <span className="text-xs text-primary font-medium">System Architecture</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">How <span className="text-gradient">GeoVision</span> Works</h1>
        <p className="text-lg text-muted-foreground">From image upload to AI classification — a complete pipeline for satellite-driven land use intelligence.</p>
      </div>
    </section>

    {/* Steps */}
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {steps.map((step, i) => (
          <div key={i} className="glass-card-solid p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="p-4 rounded-xl bg-primary/10 shrink-0">
              <step.icon className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{step.description}</p>
              <div className="grid grid-cols-2 gap-2">
                {step.details.map((d) => (
                  <span key={d} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-primary" /> {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Architecture Diagram */}
    <section className="py-16 px-4 border-t border-border">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-foreground mb-8">System Architecture</h2>
        <div className="space-y-3">
          {archLayers.map((layer, i) => (
            <div key={i}>
              <div className={`inline-block px-6 py-3 rounded-lg border text-sm font-medium ${layer.color}`}>
                {layer.label}
              </div>
              {i < archLayers.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 px-4 border-t border-border text-center">
      <h2 className="text-2xl font-bold text-foreground mb-4">Ready to classify?</h2>
      <div className="flex gap-3 justify-center">
        <Button asChild size="lg"><Link to="/upload">Try Upload & Classify</Link></Button>
        <Button asChild variant="outline" size="lg"><Link to="/dashboard">View Dashboard</Link></Button>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-border py-8 px-4 text-center">
      <p className="text-xs text-muted-foreground">© 2026 GeoVision GSIS. All rights reserved.</p>
    </footer>
  </div>
);

export default HowItWorks;
