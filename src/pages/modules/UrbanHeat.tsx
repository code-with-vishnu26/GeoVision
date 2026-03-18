import { useState } from "react";
import { Thermometer, Sun, Building, MapPin } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import StatCard from "@/components/shared/StatCard";
import ChartCard from "@/components/shared/ChartCard";
import RiskCard from "@/components/shared/RiskCard";
import ModuleHeader from "@/components/shared/ModuleHeader";
import { heatData, CHART_COLORS } from "@/services/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PIE_COLORS = [CHART_COLORS.danger, CHART_COLORS.accent, CHART_COLORS.blue, CHART_COLORS.warning];
const cities = ["All Cities", "Phoenix", "Delhi NCR", "Dubai", "Bangkok", "Lagos"];

const riskLevels: Record<string, { label: string; color: string }> = {
  "All Cities": { label: "Critical", color: "bg-destructive" },
  "Phoenix": { label: "Critical", color: "bg-destructive" },
  "Delhi NCR": { label: "High", color: "bg-warning" },
  "Dubai": { label: "High", color: "bg-warning" },
  "Bangkok": { label: "Moderate", color: "bg-primary" },
  "Lagos": { label: "Moderate", color: "bg-primary" },
};

const UrbanHeat = () => {
  const [city, setCity] = useState("All Cities");
  const risk = riskLevels[city] || riskLevels["All Cities"];

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader title="Urban Heat Islands" description="Thermal anomaly mapping, heat scores, and cooling zone analysis" icon={Thermometer} iconColor="text-warning" />

      <div className="flex flex-wrap items-center gap-3 glass-card-solid p-3">
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground">Risk Level:</span>
          <span className={`text-xs px-2 py-0.5 rounded-full text-foreground font-semibold ${risk.color}`}>{risk.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Heat Islands" value={156} trend={12.3} negative icon={Thermometer} iconColor="text-warning" />
        <StatCard label="Temp Anomaly (°C)" value={3.8} trend={8.5} negative icon={Sun} iconColor="text-destructive" decimals={1} />
        <StatCard label="Urban Heat Score" value={82} suffix="/100" trend={5.2} negative icon={Building} iconColor="text-warning" />
        <StatCard label="Cooling Priority" value={48} suffix=" zones" trend={14.1} negative icon={MapPin} iconColor="text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Temperature Anomaly" subtitle={`${city} · Urban vs rural (°C)`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={heatData.temperatureTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
              <XAxis dataKey="month" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
              <Line type="monotone" dataKey="urban" stroke={CHART_COLORS.danger} strokeWidth={2} dot={false} name="Urban" />
              <Line type="monotone" dataKey="rural" stroke={CHART_COLORS.accent} strokeWidth={2} dot={false} name="Rural" />
              <Line type="monotone" dataKey="anomaly" stroke={CHART_COLORS.warning} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Anomaly" />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Land Cover" subtitle="Built-up vs green cover distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={heatData.coverComparison} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                {heatData.coverComparison.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Cooling Priority Zones */}
      <div className="glass-card-solid p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Cooling Priority Zones</h3>
        <div className="space-y-2">
          {["Zone A - Downtown Core", "Zone B - Industrial District", "Zone C - Residential East", "Zone D - Highway Corridor", "Zone E - Commercial Strip"].map((zone, i) => (
            <div key={zone} className="flex items-center justify-between py-2 px-3 rounded-md bg-secondary/50">
              <span className="text-sm text-foreground">{zone}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-warning rounded-full" style={{ width: `${90 - i * 15}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-8">{90 - i * 15}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <RiskCard title="Phoenix, USA" score={88} description="Extreme urban heat with minimal green cover." />
        <RiskCard title="Delhi NCR" score={85} description="Severe heat island effect in dense urban areas." />
        <RiskCard title="Dubai, UAE" score={82} description="Desert urban heat amplified by construction." />
      </div>
    </div>
  );
};

export default UrbanHeat;
