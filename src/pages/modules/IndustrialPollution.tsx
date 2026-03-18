import { useState } from "react";
import { Factory, Flame, AlertTriangle, Droplets, CheckCircle } from "lucide-react";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import StatCard from "@/components/shared/StatCard";
import ChartCard from "@/components/shared/ChartCard";
import RiskCard from "@/components/shared/RiskCard";
import ModuleHeader from "@/components/shared/ModuleHeader";
import { pollutionData, CHART_COLORS } from "@/services/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { toast } from "@/hooks/use-toast";

const PIE_COLORS = [CHART_COLORS.danger, CHART_COLORS.warning, CHART_COLORS.primary, CHART_COLORS.accent];
const zones = ["All Zones", "Ganges Basin", "Pearl River Delta", "Gulf Coast", "Rhine Valley", "Mekong Delta"];
const severities = ["All", "Critical", "High", "Medium", "Low"];

const IndustrialPollution = () => {
  const { role } = useApp();
  const [zone, setZone] = useState("All Zones");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [investigated, setInvestigated] = useState<string[]>([]);

  const markInvestigated = (zoneName: string) => {
    setInvestigated((prev) => [...prev, zoneName]);
    toast({ title: "Violation Investigated", description: `${zoneName} marked as investigated.` });
  };

  const filteredSeverity = severityFilter === "All"
    ? pollutionData.severityBreakdown
    : pollutionData.severityBreakdown.filter((s) => s.name === severityFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader title="Industrial Pollution Detection" description="Emission monitoring, thermal anomalies, and water contamination tracking" icon={Factory} iconColor="text-destructive" />

      <div className="flex flex-wrap items-center gap-3 glass-card-solid p-3">
        <Select value={zone} onValueChange={setZone}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{zones.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{severities.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <div className="flex items-center gap-2 ml-auto">
          <div className={`h-2.5 w-2.5 rounded-full ${zone !== "All Zones" ? "bg-destructive" : "bg-warning"}`} />
          <span className="text-xs text-muted-foreground">Water Contamination: {zone !== "All Zones" ? "Detected" : "45 sites"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Industrial Zones" value={234} trend={3.4} negative icon={Factory} iconColor="text-muted-foreground" />
        <StatCard label="Thermal Anomalies" value={89} trend={11.2} negative icon={Flame} iconColor="text-warning" />
        <StatCard label="Pollution Index" value={74} suffix="/100" trend={6.8} negative icon={AlertTriangle} iconColor="text-destructive" />
        <StatCard label="Water Contamination" value={45} suffix=" sites" trend={9.1} negative icon={Droplets} iconColor="text-blue-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Thermal Anomalies & Violations" subtitle={`${zone} · Monthly trends`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pollutionData.thermalTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
              <XAxis dataKey="month" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
              <Area type="monotone" dataKey="anomalies" stroke={CHART_COLORS.warning} fill={CHART_COLORS.warning} fillOpacity={0.1} strokeWidth={2} name="Anomalies" />
              <Area type="monotone" dataKey="violations" stroke={CHART_COLORS.danger} fill={CHART_COLORS.danger} fillOpacity={0.15} strokeWidth={2} name="Violations" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Severity Distribution" subtitle="Alert severity breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={filteredSeverity} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                {filteredSeverity.map((entry, index) => {
                  const colorIdx = pollutionData.severityBreakdown.findIndex((s) => s.name === entry.name);
                  return <Cell key={index} fill={PIE_COLORS[colorIdx >= 0 ? colorIdx : index]} />;
                })}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Ganges Basin", score: 88, desc: "Severe industrial discharge and water contamination." },
          { title: "Pearl River Delta", score: 78, desc: "Dense industrial zones with thermal anomalies." },
          { title: "Gulf Coast, USA", score: 65, desc: "Petrochemical emissions above threshold." },
        ].map((item) => (
          <div key={item.title} className="space-y-2">
            <RiskCard title={item.title} score={item.score} description={item.desc} />
            {role !== "viewer" && (
              <Button
                variant={investigated.includes(item.title) ? "ghost" : "outline"}
                size="sm"
                className="w-full text-xs gap-1.5"
                disabled={investigated.includes(item.title)}
                onClick={() => markInvestigated(item.title)}
              >
                <CheckCircle className="h-3 w-3" />
                {investigated.includes(item.title) ? "Investigated" : "Mark Investigated"}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndustrialPollution;
