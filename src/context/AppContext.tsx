import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { alerts as initialAlerts } from "@/services/mockData";
import { useAuth } from "@/hooks/useAuth";

export type UserRole = "admin" | "analyst" | "viewer";
export type DataStatus = "live" | "delayed" | "error";

export interface AppNotification {
  id: number;
  title: string;
  module: string;
  severity: string;
  time: string;
  read: boolean;
}

export interface AppSettings {
  theme: "dark" | "light";
  refreshInterval: number;
  dataSource: string;
  criticalThreshold: number;
  pushNotifications: boolean;
  forestLossThreshold: number;
  waterStressThreshold: number;
  heatAnomalyThreshold: number;
  pollutionIndexThreshold: number;
}

interface Alert {
  id: number;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  module: string;
  region: string;
  time: string;
  resolved: boolean;
}

interface AppContextType {
  // Theme
  theme: "dark" | "light";
  toggleTheme: () => void;

  // User role
  role: UserRole;
  setRole: (role: UserRole) => void;

  // Notifications
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;

  // Alerts
  alerts: Alert[];
  resolveAlert: (id: number) => void;
  deleteAlert: (id: number) => void;
  createAlert: (alert: Omit<Alert, "id" | "resolved">) => void;

  // Data status
  dataStatus: DataStatus;
  lastUpdated: Date;
  refreshData: () => void;
  isRefreshing: boolean;

  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Loading
  isLoading: boolean;
}

const defaultSettings: AppSettings = {
  theme: "dark",
  refreshInterval: 30,
  dataSource: "satellite",
  criticalThreshold: 80,
  pushNotifications: true,
  forestLossThreshold: 10,
  waterStressThreshold: 70,
  heatAnomalyThreshold: 3,
  pollutionIndexThreshold: 75,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Get role from auth context if available
  let authRole: UserRole = "viewer";
  try {
    const auth = useAuth();
    authRole = auth.role;
  } catch {
    // Auth provider may not be available
  }

  // Theme
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("gsis-theme");
    return (saved === "light" ? "light" : "dark");
  });

  useEffect(() => {
    localStorage.setItem("gsis-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Role - use auth role as source of truth, with local override for dev
  const [role, setRole] = useState<UserRole>(authRole);
  useEffect(() => { setRole(authRole); }, [authRole]);

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    initialAlerts.slice(0, 5).map((a) => ({
      id: a.id,
      title: a.title,
      module: a.module,
      severity: a.severity,
      time: a.time,
      read: false,
    }))
  );
  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAsRead = (id: number) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllAsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const clearNotifications = () => setNotifications([]);

  // Alerts
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const resolveAlert = (id: number) => setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
  const deleteAlert = (id: number) => setAlerts((prev) => prev.filter((a) => a.id !== id));
  const createAlert = (alert: Omit<Alert, "id" | "resolved">) => {
    const newAlert: Alert = { ...alert, id: Date.now(), resolved: false };
    setAlerts((prev) => [newAlert, ...prev]);
    setNotifications((prev) => [
      { id: newAlert.id, title: newAlert.title, module: newAlert.module, severity: newAlert.severity, time: "Just now", read: false },
      ...prev,
    ]);
  };

  // Data status & refresh
  const [dataStatus, setDataStatus] = useState<DataStatus>("live");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = useCallback(() => {
    setIsRefreshing(true);
    setDataStatus("delayed");
    setTimeout(() => {
      setLastUpdated(new Date());
      setDataStatus("live");
      setIsRefreshing(false);
    }, 1500);
  }, []);

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("gsis-settings");
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem("gsis-settings", JSON.stringify(next));
      if (partial.theme) setTheme(partial.theme);
      return next;
    });
  };

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Loading simulation
  const [isLoading] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>("[data-search-input]")?.focus();
      }
      if (e.key === "Escape") {
        setSearchQuery("");
        (document.activeElement as HTMLElement)?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (settings.refreshInterval > 0) {
      const interval = setInterval(refreshData, settings.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [settings.refreshInterval, refreshData]);

  return (
    <AppContext.Provider
      value={{
        theme, toggleTheme,
        role, setRole,
        notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications,
        alerts, resolveAlert, deleteAlert, createAlert,
        dataStatus, lastUpdated, refreshData, isRefreshing,
        settings, updateSettings,
        searchQuery, setSearchQuery,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
