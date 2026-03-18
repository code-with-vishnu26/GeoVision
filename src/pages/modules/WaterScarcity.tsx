import { useState } from "react";
import { Droplets, Waves, AlertTriangle, MapPin, Download } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import StatCard from "@/components/shared/StatCard";
import ChartCard from "@/components/shared/ChartCard";
import RiskCard from "@/components/shared/RiskCard";
import ModuleHeader from "@/components/shared/ModuleHeader";
import { waterData, CHART_COLORS } from "@/services/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const reservoirs = ["All Reservoirs", "Lake Chad", "Aral Sea", "Dead Sea", "Lake Mead", "Lake Poopo"];
const seasons = ["All Seasons", "Spring", "Summer", "Autumn", "Winter"];

const WaterScarcity = () => {
  const [reservoir, setReservoir] = useState("All Reservoirs");
  const [season, setSeason] = useState("All Seasons");

  const seasonMonths: Record<string, number[]> = { Spring: [2,3,4], Summer: [5,6,7], Autumn: [8,9,10], Winter: [11,0,1] };
  const filteredNdwi = season === "All Seasons" ? waterData.ndwiTrend : waterData.ndwiTrend.filter((_, i) => seasonMonths[season]?.includes(i));
  const mul = reservoir === "All Reservoirs" ? 1 : 0.5 + reservoirs.indexOf(reservoir) * 0.12;

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader title="Water Scarcity Monitoring" description="Reservoir tracking, NDWI analysis, and water stress intelligence" icon={Droplets} iconColor="text-blue-400" />

      <div className="flex flex-wrap items-center gap-3 glass-card-solid p-3">
        <Select value={reservoir} onValueChange={setReservoir}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{reservoirs.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={season} onValueChange={setSeason}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{seasons.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="ml-auto gap-1.5 text-xs" onClick={() => toast({ title: "Report Generated", description: "Water Risk Report (mock) ready." })}>
          <Download className="h-3 w-3" /> Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Reservoirs Critical" value={Math.round(23 * mul)} trend={15.2} negative icon={Droplets} iconColor="text-blue-400" />
        <StatCard label="NDWI Index" value={+(0.31 * mul).toFixed(2)} trend={-8.4} negative icon={Waves} iconColor="text-primary" decimals={2} />
        <StatCard label="Water Stress Regions" value={Math.round(67 * mul)} trend={4.1} negative icon={MapPin} iconColor="text-warning" />
        <StatCard label="Risk Score" value={Math.round(72 * mul)} suffix="/100" trend={3.8} negative icon={AlertTriangle} iconColor="text-destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="NDWI & Water Stress" subtitle={`${reservoir} · ${season}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredNdwi}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
              <XAxis dataKey="month" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis yAxisId="left" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
              <Area yAxisId="left" type="monotone" dataKey="ndwi" stroke={CHART_COLORS.blue} fill={CHART_COLORS.blue} fillOpacity={0.15} strokeWidth={2} name="NDWI" />
              <Area yAxisId="right" type="monotone" dataKey="stress" stroke={CHART_COLORS.warning} fill={CHART_COLORS.warning} fillOpacity={0.1} strokeWidth={2} name="Stress %" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="High-Risk Regions" subtitle="Water stress index by region">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterData.regionRisk} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
              <XAxis type="number" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis dataKey="region" type="category" stroke="hsl(215, 15%, 55%)" fontSize={11} width={90} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
              <Bar dataKey="risk" fill={CHART_COLORS.blue} radius={[0, 4, 4, 0]} name="Risk Score" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <RiskCard title="Middle East" score={Math.round(92 * mul)} description="Extreme water scarcity. Groundwater depletion accelerating." />
        <RiskCard title="North Africa" score={Math.round(85 * mul)} description="Reservoir levels critically low across the Sahel." />
        <RiskCard title="South Asia" score={Math.round(78 * mul)} description="Monsoon variability increasing water stress." />
      </div>
    </div>
  );
};

export default WaterScarcity;
