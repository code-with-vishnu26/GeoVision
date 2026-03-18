import { Info, Globe, Satellite, Shield, BarChart3, Bell, Trees } from "lucide-react";
import ModuleHeader from "@/components/shared/ModuleHeader";

const features = [
  { icon: Globe, title: "Global Coverage", desc: "195 countries monitored with real-time satellite data feeds." },
  { icon: Satellite, title: "Satellite Intelligence", desc: "Multi-spectral satellite imagery processed through AI models." },
  { icon: Shield, title: "Risk Assessment", desc: "Composite scoring algorithms for sustainability risk evaluation." },
  { icon: BarChart3, title: "Advanced Analytics", desc: "Cross-module analysis with trend forecasting capabilities." },
  { icon: Bell, title: "Alert System", desc: "Real-time alert management with severity classification." },
  { icon: Trees, title: "6 Modules", desc: "Deforestation, Water, Crop, Flood, Heat, and Pollution monitoring." },
];

const About = () => (
  <div className="space-y-6 animate-fade-in max-w-3xl">
    <ModuleHeader title="About GeoVision GSIS" description="Global Sustainability Intelligence System" icon={Info} iconColor="text-primary" />

    <div className="glass-card-solid p-6">
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        GeoVision GSIS is an AI-powered global environmental monitoring platform that leverages satellite imagery,
        spectral analysis, and machine learning to deliver real-time sustainability intelligence. The system tracks
        six critical environmental domains across 195 countries, providing government-level analytics for
        decision-makers, researchers, and organizations.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Built for enterprise-scale deployment, GSIS processes billions of data points from multiple satellite
        constellations to generate composite risk scores, trend analyses, and predictive forecasts.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {features.map((f) => (
        <div key={f.title} className="glass-card-solid p-4">
          <div className="p-2 rounded-lg bg-secondary text-primary w-fit mb-3">
            <f.icon className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>

    <div className="glass-card-solid p-6 text-center">
      <p className="text-xs text-muted-foreground">
        GeoVision GSIS v1.0 · © 2026 · Built with satellite intelligence
      </p>
    </div>
  </div>
);

export default About;
