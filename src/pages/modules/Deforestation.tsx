import { useState, useMemo } from "react";
import { Trees, Axe, TreePine, AlertTriangle, Download } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import StatCard from "@/components/shared/StatCard";
import ChartCard from "@/components/shared/ChartCard";
import RiskCard from "@/components/shared/RiskCard";
import ModuleHeader from "@/components/shared/ModuleHeader";
import { deforestationData, CHART_COLORS } from "@/services/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const PIE_COLORS = [CHART_COLORS.accent, CHART_COLORS.primary, CHART_COLORS.warning, CHART_COLORS.blue, CHART_COLORS.purple];
const regions = ["All Regions", "Amazon", "Congo Basin", "SE Asia", "Central America"];
const timeRanges = ["12 months", "6 months", "3 months"];

const Deforestation = () => {
  const [region, setRegion] = useState("All Regions");
  const [timeRange, setTimeRange] = useState("12 months");
  const [miningToggle, setMiningToggle] = useState(true);

  const months = timeRange === "3 months" ? 3 : timeRange === "6 months" ? 6 : 12;
  const filteredNdvi = deforestationData.ndviTrend.slice(-months);
  const regionMul = region === "All Regions" ? 1 : 0.5 + regions.indexOf(region) * 0.15;

  const exportReport = () => toast({ title: "Report Exported", description: "Deforestation report (mock PDF) downloaded." });

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader title="Deforestation & Illegal Mining" description="Forest loss monitoring, NDVI trends, and mining detection" icon={Trees} iconColor="text-accent" />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 glass-card-solid p-3">
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{timeRanges.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
        <div className="flex items-center gap-1.5">
          <Switch id="mining" checked={miningToggle} onCheckedChange={setMiningToggle} className="scale-75" />
          <Label htmlFor="mining" className="text-xs cursor-pointer">Mining Detection</Label>
        </div>
        <Button variant="outline" size="sm" className="ml-auto gap-1.5 text-xs" onClick={exportReport}>
          <Download className="h-3 w-3" /> Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Forest Loss (km²)" value={Math.round(12480 * regionMul)} trend={8.2} negative icon={TreePine} iconColor="text-accent" />
        <StatCard label="NDVI Index" value={+(0.42 * regionMul).toFixed(2)} trend={-3.1} negative icon={Trees} iconColor="text-success" decimals={2} />
        {miningToggle && <StatCard label="Mining Sites" value={Math.round(347 * regionMul)} trend={12.5} negative icon={Axe} iconColor="text-warning" />}
        <StatCard label="Risk Score" value={Math.round(78 * regionMul)} suffix="/100" trend={5.3} negative icon={AlertTriangle} iconColor="text-destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="NDVI Trend Analysis" subtitle={`${region} · ${timeRange}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredNdvi}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
              <XAxis dataKey="month" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
              <Area type="monotone" dataKey="baseline" stroke={CHART_COLORS.accent} fill={CHART_COLORS.accent} fillOpacity={0.05} strokeWidth={2} strokeDasharray="5 5" name="Baseline" />
              <Area type="monotone" dataKey="ndvi" stroke={CHART_COLORS.danger} fill={CHART_COLORS.danger} fillOpacity={0.15} strokeWidth={2} name="Current NDVI" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Annual Forest Loss" subtitle="Total area lost per year (km²)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deforestationData.forestLoss}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
              <XAxis dataKey="year" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
              <Bar dataKey="loss" fill={CHART_COLORS.danger} radius={[4, 4, 0, 0]} name="Forest Loss (km²)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Regional Breakdown" subtitle="Forest loss by region (%)">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={deforestationData.regionBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                {deforestationData.regionBreakdown.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RiskCard title="Amazon Basin" score={Math.round(92 * regionMul)} description="Critical deforestation rates detected via NDVI anomaly." />
          <RiskCard title="Congo Basin" score={Math.round(78 * regionMul)} description="Accelerating forest loss near mining operations." />
          <RiskCard title="Southeast Asia" score={Math.round(72 * regionMul)} description="Palm oil expansion driving habitat loss." />
          <RiskCard title="Central America" score={Math.round(58 * regionMul)} description="Moderate deforestation with seasonal patterns." />
        </div>
      </div>
    </div>
  );
};

export default Deforestation;
