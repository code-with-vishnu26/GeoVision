import { useState } from "react";
import { Wheat, Leaf, AlertTriangle, TrendingDown, Download } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import StatCard from "@/components/shared/StatCard";
import ChartCard from "@/components/shared/ChartCard";
import RiskCard from "@/components/shared/RiskCard";
import ModuleHeader from "@/components/shared/ModuleHeader";
import { cropData, CHART_COLORS } from "@/services/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const cropTypes = ["All Crops", "Wheat", "Rice", "Corn", "Soy"];

const CropStress = () => {
  const [cropType, setCropType] = useState("All Crops");
  const yieldData = cropType === "All Crops" ? cropData.yieldForecast : cropData.yieldForecast.filter((c) => c.crop === cropType);

  const exportCSV = () => {
    const csv = "Crop,Current,Predicted\n" + cropData.yieldForecast.map((c) => `${c.crop},${c.current},${c.predicted}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "crop_stress_report.csv"; a.click();
    toast({ title: "CSV Exported", description: "Crop stress data downloaded." });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader title="Crop Stress & Food Security" description="Agricultural health monitoring, drought risk, and yield predictions" icon={Wheat} iconColor="text-success" />

      <div className="flex flex-wrap items-center gap-3 glass-card-solid p-3">
        <Select value={cropType} onValueChange={setCropType}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{cropTypes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="ml-auto gap-1.5 text-xs" onClick={exportCSV}>
          <Download className="h-3 w-3" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Stressed Regions" value={84} trend={6.7} negative icon={Wheat} iconColor="text-success" />
        <StatCard label="NDVI Anomaly" value={-0.12} trend={-2.1} negative icon={Leaf} iconColor="text-warning" decimals={2} />
        <StatCard label="Drought Risk Areas" value={42} trend={8.9} negative icon={AlertTriangle} iconColor="text-destructive" />
        <StatCard label="Yield Forecast" value={8} suffix="% loss" trend={-3.5} negative icon={TrendingDown} iconColor="text-warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Crop Health Index" subtitle="Monthly vegetation health and anomaly">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cropData.healthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
              <XAxis dataKey="month" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
              <Area type="monotone" dataKey="health" stroke={CHART_COLORS.accent} fill={CHART_COLORS.accent} fillOpacity={0.15} strokeWidth={2} name="Health Index" />
              <Area type="monotone" dataKey="anomaly" stroke={CHART_COLORS.danger} fill={CHART_COLORS.danger} fillOpacity={0.1} strokeWidth={2} name="Anomaly" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Yield Forecast" subtitle={cropType !== "All Crops" ? cropType : "All crops comparison"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yieldData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
              <XAxis dataKey="crop" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
              <Bar dataKey="current" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} name="Current" />
              <Bar dataKey="predicted" fill={CHART_COLORS.warning} radius={[4, 4, 0, 0]} name="Predicted" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <RiskCard title="East Africa" score={82} description="Severe drought conditions impacting crop yields." />
        <RiskCard title="South Asia" score={72} description="Monsoon irregularity causing crop stress." />
        <RiskCard title="Central America" score={58} description="Moderate drought risk with declining soil health." />
      </div>
    </div>
  );
};

export default CropStress;
