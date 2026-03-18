import { Menu, RefreshCw, Sun, Moon } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import SearchDropdown from "./SearchDropdown";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";

interface TopNavProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Global Dashboard",
  "/modules/deforestation": "Deforestation & Mining",
  "/modules/water": "Water Scarcity",
  "/modules/crop": "Crop Stress",
  "/modules/flood": "Flood Monitoring",
  "/modules/heat": "Urban Heat Islands",
  "/modules/pollution": "Industrial Pollution",
  "/analytics": "Analytics",
  "/alerts": "Alerts",
  "/trends": "Historical Trends",
  "/settings": "Settings",
  "/about": "About",
};

const statusColors: Record<string, string> = {
  live: "bg-success",
  delayed: "bg-warning",
  error: "bg-destructive",
};

const TopNav = ({ onMenuClick }: TopNavProps) => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "GeoVision GSIS";
  const { theme, toggleTheme, dataStatus, lastUpdated, refreshData, isRefreshing } = useApp();

  const timeAgo = () => {
    const diff = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <SearchDropdown />

        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground mr-1">
          <div className={`h-2 w-2 rounded-full ${statusColors[dataStatus]}`} />
          <span className="capitalize">{dataStatus}</span>
          <span className="text-[10px]">· {timeAgo()}</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={refreshData}
          disabled={isRefreshing}
          title="Refresh data"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <NotificationDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default TopNav;
