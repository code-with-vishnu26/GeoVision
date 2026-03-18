import { useState, useMemo } from "react";
import { BarChart3, Download } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ChartCard from "@/components/shared/ChartCard";
import ModuleHeader from "@/components/shared/ModuleHeader";
import { radarData, monthlyTrends, countryRankings, CHART_COLORS } from "@/services/mockData";
import { exportCSV, exportPDF } from "@/services/exportUtils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const moduleKeys = ["deforestation", "water", "crop", "flood", "heat", "pollution"] as const;
const moduleLabels: Record<string, string> = { deforestation: "Deforestation", water: "Water", crop: "Crop", flood: "Flood", heat: "Heat", pollution: "Pollution" };

const Analytics = () => {
  const { role } = useAuth();
  const [sortAsc, setSortAsc] = useState(false);
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>(
    Object.fromEntries(moduleKeys.map((k) => [k, true]))
  );

  const sortedCountries = useMemo(() => {
    return [...countryRankings].sort((a, b) => sortAsc ? a.score - b.score : b.score - a.score);
  }, [sortAsc]);

  const filteredRadar = radarData.filter((d) => activeModules[d.module.toLowerCase()]);

  const handleExportCSV = () => {
    const data = sortedCountries.map((c, i) => ({ Rank: i + 1, Country: c.country, Score: c.score, Change: c.change }));
    exportCSV(data, ["Rank", "Country", "Score", "Change"], "analytics_rankings.csv");
    toast({ title: "CSV Exported", description: "Country rankings downloaded." });
  };

  const handleExportPDF = () => {
    const data = sortedCountries.map((c, i) => ({ Rank: i + 1, Country: c.country, Score: c.score, Change: c.change }));
    exportPDF("GeoVision Analytics — Country Rankings", data, ["Rank", "Country", "Score", "Change"], "analytics_rankings.pdf");
    toast({ title: "PDF Exported", description: "Country rankings PDF downloaded." });
  };

  const canExport = role === "admin" || role === "analyst";

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader title="Global Analytics" description="Composite sustainability scoring and cross-module analysis" icon={BarChart3} iconColor="text-primary" />

      {/* Module toggles */}
      <div className="flex flex-wrap items-center gap-3 glass-card-solid p-3">
        <span className="text-xs text-muted-foreground">Modules:</span>
        {moduleKeys.map((k) => (
          <div key={k} className="flex items-center gap-1.5">
            <Switch
              id={`analytics-${k}`}
              checked={activeModules[k]}
              onCheckedChange={(v) => setActiveModules((prev) => ({ ...prev, [k]: v }))}
              className="scale-75"
            />
            <Label htmlFor={`analytics-${k}`} className="text-[11px] cursor-pointer capitalize">{moduleLabels[k]}</Label>
          </div>
        ))}
      </div>

      {/* Composite Score */}
      <div className="glass-card-solid p-6 text-center">
        <p className="text-sm text-muted-foreground mb-1">Global Sustainability Composite Score</p>
        <p className="text-5xl font-bold text-gradient">72</p>
        <p className="text-sm text-muted-foreground mt-1">/100 — Moderate Risk</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Module Radar Analysis" subtitle="Risk scores across selected modules">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={filteredRadar}>
              <PolarGrid stroke="hsl(222, 15%, 18%)" />
              <PolarAngleAxis dataKey="module" stroke="hsl(215, 15%, 55%)" fontSize={11} />
              <PolarRadiusAxis stroke="hsl(215, 15%, 55%)" fontSize={10} />
              <Radar name="Risk Score" dataKey="score" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Trend Comparison" subtitle="Selected modules monthly trends">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
              <XAxis dataKey="month" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
              {activeModules.deforestation && <Area type="monotone" dataKey="deforestation" stroke={CHART_COLORS.accent} fillOpacity={0} strokeWidth={1.5} />}
              {activeModules.water && <Area type="monotone" dataKey="water" stroke={CHART_COLORS.blue} fillOpacity={0} strokeWidth={1.5} />}
              {activeModules.heat && <Area type="monotone" dataKey="heat" stroke={CHART_COLORS.warning} fillOpacity={0} strokeWidth={1.5} />}
              {activeModules.pollution && <Area type="monotone" dataKey="pollution" stroke={CHART_COLORS.danger} fillOpacity={0} strokeWidth={1.5} />}
              {activeModules.crop && <Area type="monotone" dataKey="crop" stroke={CHART_COLORS.primary} fillOpacity={0} strokeWidth={1.5} />}
              {activeModules.flood && <Area type="monotone" dataKey="flood" stroke={CHART_COLORS.purple} fillOpacity={0} strokeWidth={1.5} />}
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Country Rankings */}
      <div className="glass-card-solid p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Country Risk Rankings</h3>
          {canExport && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setSortAsc(!sortAsc)}>
                Sort {sortAsc ? "↑" : "↓"}
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={handleExportCSV}><Download className="h-3 w-3" />CSV</Button>
              <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={handleExportPDF}><Download className="h-3 w-3" />PDF</Button>
            </div>
          )}
          {!canExport && (
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setSortAsc(!sortAsc)}>
              Sort {sortAsc ? "↑" : "↓"}
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">Rank</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Country</th>
                <th className="text-left py-2 text-muted-foreground font-medium cursor-pointer hover:text-foreground" onClick={() => setSortAsc(!sortAsc)}>Score {sortAsc ? "↑" : "↓"}</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {sortedCountries.map((c, i) => (
                <tr key={c.country} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="py-2.5 text-muted-foreground">{i + 1}</td>
                  <td className="py-2.5 text-foreground font-medium">{c.country}</td>
                  <td className="py-2.5">
                    <span className={`text-sm font-semibold ${c.score < 40 ? "text-destructive" : c.score < 60 ? "text-warning" : "text-success"}`}>{c.score}</span>
                  </td>
                  <td className={`py-2.5 text-sm ${c.change < 0 ? "text-destructive" : "text-success"}`}>{c.change > 0 ? "+" : ""}{c.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
