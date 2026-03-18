import { useState, useEffect } from "react";
import { TrendingUp, Play, Pause } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import ChartCard from "@/components/shared/ChartCard";
import ModuleHeader from "@/components/shared/ModuleHeader";
import { monthlyTrends, CHART_COLORS } from "@/services/mockData";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const regions = ["Global", "South America", "Africa", "South Asia", "SE Asia", "North America"];
const moduleKeys = ["deforestation", "water", "crop", "flood", "heat", "pollution"] as const;
const moduleColors: Record<string, string> = {
  deforestation: CHART_COLORS.accent,
  water: CHART_COLORS.blue,
  crop: CHART_COLORS.primary,
  flood: CHART_COLORS.purple,
  heat: CHART_COLORS.warning,
  pollution: CHART_COLORS.danger,
};

const HistoricalTrends = () => {
  const [region, setRegion] = useState("Global");
  const [playing, setPlaying] = useState(false);
  const [visibleMonths, setVisibleMonths] = useState(12);
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>(
    Object.fromEntries(moduleKeys.map((k) => [k, true]))
  );

  useEffect(() => {
    if (!playing) return;
    if (visibleMonths >= 12) { setPlaying(false); return; }
    const timer = setTimeout(() => setVisibleMonths((v) => Math.min(v + 1, 12)), 600);
    return () => clearTimeout(timer);
  }, [playing, visibleMonths]);

  const startPlayback = () => {
    setVisibleMonths(1);
    setPlaying(true);
  };

  const displayData = monthlyTrends.slice(0, visibleMonths);

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader title="Historical Trends" description="Multi-module trend analysis and forecasting over time" icon={TrendingUp} iconColor="text-accent" />

      <div className="flex flex-wrap items-center gap-3 glass-card-solid p-3">
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={startPlayback}>
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "Playing..." : "Play Timeline"}
        </Button>
        <div className="flex items-center gap-3 flex-wrap ml-auto">
          {moduleKeys.map((k) => (
            <div key={k} className="flex items-center gap-1.5">
              <Switch
                id={`trend-${k}`}
                checked={activeModules[k]}
                onCheckedChange={(v) => setActiveModules((prev) => ({ ...prev, [k]: v }))}
                className="scale-75"
              />
              <Label htmlFor={`trend-${k}`} className="text-[11px] cursor-pointer capitalize">{k}</Label>
            </div>
          ))}
        </div>
      </div>

      <ChartCard title="All Modules Timeline" subtitle={`${region} · ${visibleMonths} months shown`} className="col-span-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
            <XAxis dataKey="month" stroke="hsl(215, 15%, 55%)" fontSize={12} />
            <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
            {moduleKeys.filter((k) => activeModules[k]).map((k) => (
              <Line key={k} type="monotone" dataKey={k} stroke={moduleColors[k]} strokeWidth={2} dot={false} name={k.charAt(0).toUpperCase() + k.slice(1)} />
            ))}
            <Legend />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Deforestation vs Water Scarcity" subtitle="Correlation analysis">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
              <XAxis dataKey="month" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
              <Line type="monotone" dataKey="deforestation" stroke={CHART_COLORS.accent} strokeWidth={2} name="Deforestation" />
              <Line type="monotone" dataKey="water" stroke={CHART_COLORS.blue} strokeWidth={2} name="Water" />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Heat vs Pollution" subtitle="Urban environmental pressure trends">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
              <XAxis dataKey="month" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
              <Line type="monotone" dataKey="heat" stroke={CHART_COLORS.warning} strokeWidth={2} name="Heat" />
              <Line type="monotone" dataKey="pollution" stroke={CHART_COLORS.danger} strokeWidth={2} name="Pollution" />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Forecast section */}
      <div className="glass-card-solid p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Trend Forecast (Simulated)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {moduleKeys.map((k) => {
            const lastVal = monthlyTrends[11][k];
            const forecast = Math.round(lastVal * (1 + (Math.random() * 0.1 - 0.03)));
            const diff = forecast - lastVal;
            return (
              <div key={k} className="text-center p-3 rounded-lg bg-secondary/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide capitalize">{k}</p>
                <p className="text-lg font-bold text-foreground mt-1">{forecast}</p>
                <p className={`text-xs ${diff > 0 ? "text-destructive" : "text-success"}`}>{diff > 0 ? "+" : ""}{diff}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HistoricalTrends;
