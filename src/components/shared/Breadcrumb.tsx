import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const routeNames: Record<string, string> = {
  dashboard: "Dashboard",
  modules: "Modules",
  deforestation: "Deforestation",
  water: "Water Scarcity",
  crop: "Crop Stress",
  flood: "Flood Monitoring",
  heat: "Urban Heat",
  pollution: "Pollution",
  analytics: "Analytics",
  alerts: "Alerts",
  trends: "Trends",
  settings: "Settings",
  about: "About",
};

const Breadcrumb = () => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
      <Link to="/dashboard" className="hover:text-foreground transition-colors">
        <Home className="h-3 w-3" />
      </Link>
      {segments.map((seg, i) => {
        const path = "/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        const name = routeNames[seg] || seg;

        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className="text-foreground font-medium">{name}</span>
            ) : (
              <Link to={path} className="hover:text-foreground transition-colors">{name}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
