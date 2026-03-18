import { useState, useRef, useEffect } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const severityDot: Record<string, string> = {
    critical: "bg-destructive",
    high: "bg-warning",
    medium: "bg-primary",
    low: "bg-muted-foreground",
  };

  return (
    <div ref={ref} className="relative">
      <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(!open)}>
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] text-foreground flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-popover border border-border rounded-lg shadow-xl z-50 animate-fade-in">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-xs font-semibold text-foreground">Notifications</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={markAllAsRead}>Mark all read</Button>
              <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={clearNotifications}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No notifications</p>
            )}
            {notifications.map((n) => (
              <button
                key={n.id}
                className={`w-full text-left px-3 py-2.5 hover:bg-secondary/80 transition-colors flex items-start gap-2.5 ${!n.read ? "bg-secondary/30" : ""}`}
                onClick={() => { markAsRead(n.id); navigate("/alerts"); setOpen(false); }}
              >
                <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${severityDot[n.severity] || "bg-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">{n.title}</p>
                  <p className="text-[10px] text-muted-foreground">{n.module} · {n.time}</p>
                </div>
                {!n.read && <Check className="h-3 w-3 text-muted-foreground mt-1 flex-shrink-0" />}
              </button>
            ))}
          </div>

          <div className="border-t border-border px-3 py-2">
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => { navigate("/alerts"); setOpen(false); }}>
              View all alerts
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
