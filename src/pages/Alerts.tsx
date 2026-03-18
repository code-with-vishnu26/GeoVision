import { useState } from "react";
import { Bell, Check, Trash2, Plus, X } from "lucide-react";
import ModuleHeader from "@/components/shared/ModuleHeader";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const severityColors: Record<string, string> = {
  critical: "bg-destructive/20 text-destructive border-destructive/30",
  high: "bg-warning/20 text-warning border-warning/30",
  medium: "bg-primary/20 text-primary border-primary/30",
  low: "bg-muted text-muted-foreground border-border",
};

const moduleOptions = ["All", "Deforestation", "Water Scarcity", "Crop Stress", "Flood Monitoring", "Urban Heat", "Pollution"];
const regionOptions = ["All", "South America", "Africa", "South Asia", "SE Asia", "North America"];
const severityOptions = ["all", "critical", "high", "medium", "low"];

const Alerts = () => {
  const { alerts, resolveAlert, deleteAlert, createAlert, role } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [newAlert, setNewAlert] = useState({ title: "", module: "Deforestation", region: "South America", severity: "medium" as "critical" | "high" | "medium" | "low" });

  const filtered = alerts.filter((a) => {
    if (statusFilter === "active" && a.resolved) return false;
    if (statusFilter === "resolved" && !a.resolved) return false;
    if (severityFilter !== "all" && a.severity !== severityFilter) return false;
    if (moduleFilter !== "All" && a.module !== moduleFilter) return false;
    if (regionFilter !== "All" && a.region !== regionFilter) return false;
    return true;
  });

  const handleCreate = () => {
    if (!newAlert.title.trim()) return;
    createAlert({ title: newAlert.title, module: newAlert.module, region: newAlert.region, severity: newAlert.severity, time: "Just now" });
    toast({ title: "Alert Created", description: newAlert.title });
    setNewAlert({ title: "", module: "Deforestation", region: "South America", severity: "medium" });
    setShowCreate(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <ModuleHeader title="Alert Management" description="Monitor, filter, and resolve environmental alerts across all modules" icon={Bell} iconColor="text-warning" />
        {role !== "viewer" && (
          <Button onClick={() => setShowCreate(!showCreate)} className="gap-1.5" size="sm">
            {showCreate ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            {showCreate ? "Cancel" : "New Alert"}
          </Button>
        )}
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="glass-card-solid p-4 space-y-3 animate-fade-in">
          <h4 className="text-sm font-semibold text-foreground">Create New Alert</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">Title</Label>
              <Input value={newAlert.title} onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })} placeholder="Alert description..." className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Module</Label>
              <Select value={newAlert.module} onValueChange={(v) => setNewAlert({ ...newAlert, module: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{moduleOptions.filter((m) => m !== "All").map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Severity</Label>
              <Select value={newAlert.severity} onValueChange={(v) => setNewAlert({ ...newAlert, severity: v as typeof newAlert.severity })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{severityOptions.filter((s) => s !== "all").map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreate} size="sm" className="w-full h-8">Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex flex-wrap gap-2">
          {["all", "active", "resolved"].map((f) => (
            <Button key={f} variant={statusFilter === f ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(f)} className="capitalize text-xs">
              {f}
            </Button>
          ))}
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>{severityOptions.map((s) => <SelectItem key={s} value={s} className="capitalize">{s === "all" ? "All Severity" : s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{moduleOptions.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{regionOptions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} alerts</span>
      </div>

      {/* Alert List */}
      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No alerts match your filters</p>}
        {filtered.map((alert) => (
          <div key={alert.id} className={`glass-card-solid p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${alert.resolved ? "opacity-50" : ""}`}>
            <div className="flex items-start gap-3 flex-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wide mt-0.5 ${severityColors[alert.severity]}`}>
                {alert.severity}
              </span>
              <div>
                <p className="text-sm text-foreground font-medium">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.module} · {alert.region} · {alert.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!alert.resolved && role !== "viewer" && (
                <Button variant="outline" size="sm" onClick={() => { resolveAlert(alert.id); toast({ title: "Alert Resolved" }); }} className="gap-1.5 text-xs">
                  <Check className="h-3 w-3" /> Resolve
                </Button>
              )}
              {alert.resolved && <span className="text-xs text-success font-medium">Resolved</span>}
              {role === "admin" && (
                <Button variant="ghost" size="sm" onClick={() => { deleteAlert(alert.id); toast({ title: "Alert Deleted", variant: "destructive" }); }} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;
