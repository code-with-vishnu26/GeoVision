import { useState, useMemo, useEffect } from "react";
import { Globe, Shield, AlertTriangle, Activity, MapPin, Eye, EyeOff, Leaf, Droplets, Satellite } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/shared/StatCard";
import ChartCard from "@/components/shared/ChartCard";
import RiskCard from "@/components/shared/RiskCard";
import { monthlyTrends, modules, CHART_COLORS } from "@/services/mockData";
import { fetchStats, fetchDashboardRegions, getNdviColor, getRiskColor } from "@/services/api";
import type { MonitoredRegion } from "@/services/api";
import { useApp } from "@/context/AppContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const regions = ["Global", "South America", "Africa", "South Asia", "SE Asia", "North America", "Europe"];

const moduleKeys = ["deforestation", "water", "crop", "flood", "heat", "pollution"] as const;

const Dashboard = () => {
  const { alerts } = useApp();
  const navigate = useNavigate();
  const [region, setRegion] = useState("Global");
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>({
    deforestation: true, water: true, crop: true, flood: true, heat: true, pollution: true,
  });

  // Backend stats (optional, falls back to mock)
  const [backendStats, setBackendStats] = useState<{
    sustainability_score: number;
    active_alerts: number;
    monitored_regions: number;
    data_points_billions: number;
    indices?: { avg_ndvi: number; avg_ndwi: number; flood_risk_count: number; vegetation_stress_count: number };
  } | null>(null);

  useEffect(() => {
    fetchStats()
      .then((data) => setBackendStats(data))
      .catch(() => { /* Backend not available, use mock data */ });
  }, []);

  // Region monitoring data
  const [regionData, setRegionData] = useState<MonitoredRegion[]>([]);
  useEffect(() => {
    fetchDashboardRegions()
      .then((data) => setRegionData(data.regions))
      .catch(() => { /* Backend not available */ });
  }, []);

  const toggleModule = (key: string) => setActiveModules((prev) => ({ ...prev, [key]: !prev[key] }));

  const activeAlerts = alerts.filter((a) => !a.resolved);

  // Filter chart data based on active modules
  const filteredTrends = useMemo(() => {
    return monthlyTrends.map((row) => {
      const filtered: Record<string, unknown> = { month: row.month };
      moduleKeys.forEach((key) => {
        if (activeModules[key]) filtered[key] = row[key];
      });
      return filtered;
    });
  }, [activeModules]);

  const regionMultiplier = region === "Global" ? 1 : 0.6 + Math.random() * 0.4;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 glass-card-solid p-4">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Region</Label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-muted-foreground">Modules:</span>
          {modules.map((m) => (
            <div key={m.id} className="flex items-center gap-1.5">
              <Switch
                id={`toggle-${m.id}`}
                checked={activeModules[m.id]}
                onCheckedChange={() => toggleModule(m.id)}
                className="scale-75"
              />
              <Label htmlFor={`toggle-${m.id}`} className="text-[11px] cursor-pointer">{m.title.split(" ")[0]}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Sustainability Score" value={backendStats?.sustainability_score ?? Math.round(72 * regionMultiplier)} suffix="/100" trend={-2.3} negative icon={Shield} />
        <StatCard label="Active Alerts" value={backendStats?.active_alerts ?? activeAlerts.length} trend={12.5} negative icon={AlertTriangle} iconColor="text-warning" />
        <StatCard label="Monitored Regions" value={backendStats?.monitored_regions ?? 195} icon={MapPin} />
        <StatCard label="Data Points (B)" value={backendStats?.data_points_billions ?? 2.4} decimals={1} trend={8.1} icon={Activity} iconColor="text-accent" />
      </div>

      {/* Environmental Indices */}
      {backendStats?.indices && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card-solid p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><Leaf className="h-5 w-5 text-green-500" /></div>
            <div><p className="text-[10px] text-muted-foreground">Avg NDVI</p><p className="text-lg font-bold text-green-500">{backendStats.indices.avg_ndvi.toFixed(2)}</p></div>
          </div>
          <div className="glass-card-solid p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><Droplets className="h-5 w-5 text-blue-400" /></div>
            <div><p className="text-[10px] text-muted-foreground">Avg NDWI</p><p className="text-lg font-bold text-blue-400">{backendStats.indices.avg_ndwi.toFixed(2)}</p></div>
          </div>
          <div className="glass-card-solid p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
            <div><p className="text-[10px] text-muted-foreground">Flood Risk Zones</p><p className="text-lg font-bold text-destructive">{backendStats.indices.flood_risk_count}</p></div>
          </div>
          <div className="glass-card-solid p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10"><Leaf className="h-5 w-5 text-warning" /></div>
            <div><p className="text-[10px] text-muted-foreground">Vegetation Stress</p><p className="text-lg font-bold text-warning">{backendStats.indices.vegetation_stress_count}</p></div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Global Risk Trends" subtitle={`${region} · Monthly risk index`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
              <XAxis dataKey="month" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
              {activeModules.deforestation && <Area type="monotone" dataKey="deforestation" stroke={CHART_COLORS.accent} fill={CHART_COLORS.accent} fillOpacity={0.1} strokeWidth={2} />}
              {activeModules.water && <Area type="monotone" dataKey="water" stroke={CHART_COLORS.blue} fill={CHART_COLORS.blue} fillOpacity={0.1} strokeWidth={2} />}
              {activeModules.heat && <Area type="monotone" dataKey="heat" stroke={CHART_COLORS.warning} fill={CHART_COLORS.warning} fillOpacity={0.1} strokeWidth={2} />}
              {activeModules.crop && <Area type="monotone" dataKey="crop" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.1} strokeWidth={2} />}
              {activeModules.flood && <Area type="monotone" dataKey="flood" stroke={CHART_COLORS.purple} fill={CHART_COLORS.purple} fillOpacity={0.1} strokeWidth={2} />}
              {activeModules.pollution && <Area type="monotone" dataKey="pollution" stroke={CHART_COLORS.danger} fill={CHART_COLORS.danger} fillOpacity={0.1} strokeWidth={2} />}
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Module Risk Comparison" subtitle="Current risk scores by module">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modules.filter((m) => activeModules[m.id]).map((m) => ({ name: m.title.split(" ")[0], risk: Math.round(m.risk * regionMultiplier) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
              <XAxis dataKey="name" stroke="hsl(215, 15%, 55%)" fontSize={11} />
              <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
              <Bar dataKey="risk" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Module Risk Cards */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Module Risk Assessment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.filter((m) => activeModules[m.id]).map((mod) => (
            <div key={mod.id} className="cursor-pointer" onClick={() => navigate(mod.path)}>
              <RiskCard title={mod.title} score={Math.round(mod.risk * regionMultiplier)} description={mod.description} />
            </div>
          ))}
        </div>
      </div>

      {/* Regional Monitoring */}
      {regionData.length > 0 && (
        <div className="glass-card-solid overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Satellite className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">Regional Satellite Monitoring</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-semibold">🛰 Auto-24h</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border bg-secondary/30">
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Region</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">NDVI</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">NDWI</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Risk</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Last Processed</th>
              </tr></thead>
              <tbody>{regionData.map((r) => (
                <tr key={r.name} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2"><MapPin className="h-3 w-3 text-primary" /><span className="text-foreground font-medium">{r.name}</span></div>
                    <p className="text-[10px] text-muted-foreground ml-5">{r.latitude.toFixed(2)}°, {r.longitude.toFixed(2)}°</p>
                  </td>
                  <td className="py-2.5 px-4"><span className="font-bold" style={{ color: getNdviColor(r.average_ndvi ?? 0) }}>{r.average_ndvi?.toFixed(4) ?? "—"}</span></td>
                  <td className="py-2.5 px-4"><span className="font-bold text-blue-400">{r.average_ndwi?.toFixed(4) ?? "—"}</span></td>
                  <td className="py-2.5 px-4"><span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ color: getRiskColor(r.risk_level), backgroundColor: getRiskColor(r.risk_level) + "20" }}>{r.risk_level}</span></td>
                  <td className="py-2.5 px-4 text-muted-foreground">{r.last_processed ? new Date(r.last_processed).toLocaleString() : "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      <div className="glass-card-solid p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Recent Alerts</h3>
          <button onClick={() => navigate("/alerts")} className="text-xs text-primary hover:underline">View all →</button>
        </div>
        <div className="space-y-2">
          {activeAlerts.slice(0, 5).map((alert) => (
            <div key={alert.id} className="flex items-center justify-between py-2 px-3 rounded-md bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer" onClick={() => navigate("/alerts")}>
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${alert.severity === "critical" ? "bg-destructive" :
                  alert.severity === "high" ? "bg-warning" :
                    alert.severity === "medium" ? "bg-primary" : "bg-muted-foreground"
                  }`} />
                <span className="text-sm text-foreground">{alert.title}</span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{alert.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
