import { useState } from "react";
import { CloudRain, Waves, AlertTriangle, Building, Play, Pause } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import StatCard from "@/components/shared/StatCard";
import ChartCard from "@/components/shared/ChartCard";
import RiskCard from "@/components/shared/RiskCard";
import ModuleHeader from "@/components/shared/ModuleHeader";
import { floodData, CHART_COLORS } from "@/services/mockData";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useApp } from "@/context/AppContext";
import { toast } from "@/hooks/use-toast";

const FloodMonitoring = () => {
  const { createAlert, role } = useApp();
  const [timelineIdx, setTimelineIdx] = useState(11);
  const [heatmapOn, setHeatmapOn] = useState(true);
  const [playing, setPlaying] = useState(false);

  const currentData = floodData.expansionTrend.slice(0, timelineIdx + 1);
  const latest = floodData.expansionTrend[timelineIdx];

  // Timeline playback
  useState(() => {
    if (!playing) return;
    const iv = setInterval(() => {
      setTimelineIdx((prev) => {
        if (prev >= 11) { setPlaying(false); return 11; }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(iv);
  });

  const triggerAlert = () => {
    createAlert({ title: "Emergency: Flash flood warning triggered", module: "Flood Monitoring", region: "South Asia", severity: "critical", time: "Just now" });
    toast({ title: "Emergency Alert Triggered", description: "Flash flood warning sent to all subscribers.", variant: "destructive" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader title="Flood & Disaster Monitoring" description="Real-time flood detection, severity assessment, and urban impact analysis" icon={CloudRain} iconColor="text-primary" />

      <div className="flex flex-wrap items-center gap-3 glass-card-solid p-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Timeline: {floodData.expansionTrend[timelineIdx]?.month}</Label>
          <Slider value={[timelineIdx]} onValueChange={([v]) => setTimelineIdx(v)} max={11} step={1} className="flex-1" />
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setTimelineIdx(0); setPlaying(!playing); }}>
            {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
        </div>
        <div className="flex items-center gap-1.5">
          <Switch id="heatmap" checked={heatmapOn} onCheckedChange={setHeatmapOn} className="scale-75" />
          <Label htmlFor="heatmap" className="text-xs cursor-pointer">Heatmap</Label>
        </div>
        {role !== "viewer" && (
          <Button variant="destructive" size="sm" className="text-xs gap-1.5" onClick={triggerAlert}>
            <AlertTriangle className="h-3 w-3" /> Trigger Alert
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Flood Zones" value={latest?.severity || 0} trend={22.5} negative icon={Waves} iconColor="text-primary" />
        <StatCard label="Affected Area (km²)" value={latest?.area || 0} trend={15.1} negative icon={AlertTriangle} iconColor="text-warning" />
        <StatCard label="Severity Index" value={latest?.severity || 0} suffix="/10" trend={10.2} negative icon={CloudRain} iconColor="text-destructive" decimals={1} />
        <StatCard label="Urban Impact" value={34} suffix="%" trend={7.8} negative icon={Building} iconColor="text-blue-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Flood Area Expansion" subtitle={`Up to ${floodData.expansionTrend[timelineIdx]?.month}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
              <XAxis dataKey="month" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis yAxisId="left" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
              <Area yAxisId="left" type="monotone" dataKey="area" stroke={CHART_COLORS.blue} fill={CHART_COLORS.blue} fillOpacity={0.15} strokeWidth={2} name="Area (km²)" />
              {heatmapOn && <Area yAxisId="right" type="monotone" dataKey="severity" stroke={CHART_COLORS.danger} fill={CHART_COLORS.danger} fillOpacity={0.1} strokeWidth={2} name="Severity" />}
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Urban Impact" subtitle="Flood impact score by city">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={floodData.urbanImpact} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
              <XAxis type="number" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis dataKey="city" type="category" stroke="hsl(215, 15%, 55%)" fontSize={11} width={70} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
              <Bar dataKey="impact" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} name="Impact Score" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <RiskCard title="Bangladesh Delta" score={92} description="Critical flash flood risk. Millions affected." />
        <RiskCard title="Mumbai Region" score={85} description="Monsoon flooding with severe urban impact." />
        <RiskCard title="Jakarta" score={80} description="Coastal flooding and land subsidence risk." />
      </div>
    </div>
  );
};

export default FloodMonitoring;
