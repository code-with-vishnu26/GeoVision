import { Link, useLocation } from "react-router-dom";
import { Globe, Trees, Droplets, Wheat, CloudRain, Thermometer, Factory, BarChart3, Bell, Zap, TrendingUp, Settings, Info, X, Satellite, Upload, History, Shield, Activity, Users } from "lucide-react";

const navigation = [
  {
    group: "Overview",
    items: [{ title: "Global Dashboard", path: "/dashboard", icon: Globe }],
  },
  {
    group: "Modules",
    items: [
      { title: "Deforestation", path: "/modules/deforestation", icon: Trees },
      { title: "Water Scarcity", path: "/modules/water", icon: Droplets },
      { title: "Crop Stress", path: "/modules/crop", icon: Wheat },
      { title: "Flood Monitoring", path: "/modules/flood", icon: CloudRain },
      { title: "Urban Heat", path: "/modules/heat", icon: Thermometer },
      { title: "Pollution", path: "/modules/pollution", icon: Factory },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { title: "Analytics", path: "/analytics", icon: BarChart3 },
      { title: "Action Center", path: "/action-center", icon: Zap },
      { title: "Predictive Analytics", path: "/predictive-analytics", icon: TrendingUp },
      { title: "Community Portal", path: "/community-portal", icon: Users },
      { title: "Alerts", path: "/alerts", icon: Bell },
      { title: "Trends", path: "/trends", icon: TrendingUp },
      { title: "Upload & Classify", path: "/upload", icon: Upload },
      { title: "My History", path: "/history", icon: History },
    ],
  },
  {
    group: "System",
    items: [
      { title: "Admin Panel", path: "/admin", icon: Shield },
      { title: "System Health", path: "/system-health", icon: Activity },
      { title: "Settings", path: "/settings", icon: Settings },
      { title: "About", path: "/about", icon: Info },
    ],
  },
];

interface AppSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const AppSidebar = ({ mobileOpen, onClose }: AppSidebarProps) => {
  const location = useLocation();

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      {/* Brand */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Satellite className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="font-bold text-foreground text-sm tracking-wide">GeoVision</span>
            <span className="text-[10px] text-muted-foreground block -mt-0.5">GSIS Platform</span>
          </div>
        </Link>
        <button onClick={onClose} className="lg:hidden p-1 rounded text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
        {navigation.map((group) => (
          <div key={group.group}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-2">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${active
                      ? "bg-sidebar-accent text-primary font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                      }`}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-muted-foreground">Systems operational</span>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
