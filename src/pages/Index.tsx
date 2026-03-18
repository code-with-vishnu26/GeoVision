import { Link } from "react-router-dom";
import { Globe, Trees, Droplets, Wheat, CloudRain, Thermometer, Factory, Shield, Activity, MapPin, Satellite, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { modules } from "@/services/mockData";
import heroImage from "@/assets/hero-earth.jpg";

const iconMap: Record<string, React.ElementType> = {
  deforestation: Trees,
  water: Droplets,
  crop: Wheat,
  flood: CloudRain,
  heat: Thermometer,
  pollution: Factory,
};

const stats = [
  { label: "Sustainability Score", value: 72, suffix: "/100", icon: Shield },
  { label: "Active Alerts", value: 847, suffix: "", icon: Activity },
  { label: "Monitored Regions", value: 195, suffix: "", icon: MapPin },
  { label: "Satellite Sources", value: 24, suffix: "", icon: Satellite },
];

const StatCounter = ({ value, suffix, label, icon: Icon }: { value: number; suffix: string; label: string; icon: React.ElementType }) => {
  const count = useAnimatedCounter(value, 2000);
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center p-3 rounded-xl bg-primary/10 mb-3">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <p className="text-3xl md:text-4xl font-bold text-foreground">{count}{suffix}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary font-medium">AI-Powered Environmental Intelligence</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 tracking-tight">
            <span className="text-gradient">GeoVision</span>{" "}
            <span className="text-foreground">GSIS</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Real-time satellite-driven environmental risk monitoring. Six integrated modules delivering global sustainability intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="text-base px-8 gap-2">
              <Link to="/dashboard">
                <Globe className="h-5 w-5" />
                View Global Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base px-8">
              <Link to="/how-it-works">How It Works</Link>
            </Button>
          </div>
          <div className="flex gap-3 justify-center mt-4">
            <Button asChild variant="ghost" size="sm" className="text-sm">
              <Link to="/signin">Sign In</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-sm">
              <Link to="/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-b border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <StatCounter key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Six Intelligence Modules</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Comprehensive environmental monitoring powered by satellite imagery and AI analytics.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((mod) => {
              const Icon = iconMap[mod.id] || Globe;
              return (
                <Link
                  key={mod.id}
                  to={mod.path}
                  className="glass-card-solid p-6 hover:glow-border transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-lg bg-secondary ${mod.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-muted-foreground">Risk: {mod.risk}/100</span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{mod.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{mod.description}</p>
                  <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                    <span>Explore Module</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Satellite className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">GeoVision GSIS</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 GeoVision Global Sustainability Intelligence System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
