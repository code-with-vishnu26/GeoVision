import { useState, useRef, useEffect } from "react";
import { Settings, LogOut, Shield, BarChart3, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp, type UserRole } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const roles: { value: UserRole; label: string; icon: React.ElementType }[] = [
  { value: "admin", label: "Admin", icon: Shield },
  { value: "analyst", label: "Analyst", icon: BarChart3 },
  { value: "viewer", label: "Viewer", icon: Eye },
];

const ProfileDropdown = () => {
  const { role, setRole } = useApp();
  const { user, signOut } = useAuth();
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

  const currentRole = roles.find((r) => r.value === role)!;
  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "GV";

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
    navigate("/signin");
    toast({ title: "Logged Out", description: "Session ended." });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold hover:bg-primary/30 transition-colors"
        title={`Role: ${currentRole.label}`}
      >
        {initials}
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 w-56 bg-popover border border-border rounded-lg shadow-xl z-50 animate-fade-in">
          <div className="px-3 py-2.5 border-b border-border">
            <p className="text-sm font-medium text-foreground truncate">{user?.user_metadata?.full_name || user?.email || "GeoVision User"}</p>
            <p className="text-[10px] text-muted-foreground">Role: {currentRole.label}</p>
          </div>

          <div className="py-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-3 py-1.5">Switch Role (Dev)</p>
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => {
                  setRole(r.value);
                  toast({ title: "Role Changed", description: `Switched to ${r.label} role` });
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary/80 transition-colors ${role === r.value ? "text-primary" : "text-foreground"}`}
              >
                <r.icon className="h-3.5 w-3.5" />
                <span>{r.label}</span>
                {role === r.value && <span className="ml-auto text-[10px] text-primary">●</span>}
              </button>
            ))}
          </div>

          <div className="border-t border-border py-1">
            <button onClick={() => { navigate("/settings"); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-secondary/80">
              <Settings className="h-3.5 w-3.5" />
              <span>Settings</span>
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-secondary/80">
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
