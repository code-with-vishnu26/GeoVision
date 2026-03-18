import { useState } from "react";
import { TrendingUp, Calendar, ArrowRight, Activity, Thermometer, Droplets, Leaf } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import ChartCard from "@/components/shared/ChartCard";
import StatCard from "@/components/shared/StatCard";
import { CHART_COLORS } from "@/services/mockData";

// Generate mock historical + predicted time-series data
const generatePredictionData = () => {
  const data = [];
  const currentDate = new Date();
  
  for (let i = -12; i <= 6; i++) {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + i);
    
    // Base trends
    const monthIndex = d.getMonth();
    const isFuture = i > 0;
    
    // Simulate seasonal waves + long-term climate shift
    const ndviBase = 0.65 + Math.sin(monthIndex * Math.PI / 6) * 0.15;
    const heatBase = 25 + Math.cos((monthIndex - 6) * Math.PI / 6) * 10;
    
    let ndvi = ndviBase + (Math.random() * 0.05);
    let heat = heatBase + (Math.random() * 2);
    let water = 0.2 + Math.sin(monthIndex * Math.PI / 6) * 0.15 + (Math.random() * 0.05);

    // If future, simulate a worsening drought scenario for predictive modeling
    if (isFuture) {
      ndvi -= (i * 0.02); // Gradual vegetation loss
      heat += (i * 0.5);  // Gradual temperature rise
      water -= (i * 0.03); // Gradual water loss
    }

    data.push({
      date: d.toLocaleDateString('default', { month: 'short', year: '2-digit' }),
      isFuture,
      ndvi: Number(ndvi.toFixed(3)),
      heat: Number(heat.toFixed(1)),
      water: Number(water.toFixed(3)),
    });
  }
  return data;
};

const predictionData = generatePredictionData();

const PredictiveAnalytics = () => {
  const [region, setRegion] = useState("Ganges Delta Region");

  const currentNdvi = predictionData[12].ndvi;
  const predictedNdvi = predictionData[18].ndvi;
  const ndviDrop = ((currentNdvi - predictedNdvi) / currentNdvi * 100).toFixed(1);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Predictive Forward-Modeling
          </h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
            Go beyond real-time monitoring. Our time-series AI analyzes historical environmental shifts to forecast future crises before they occur.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-secondary/30 p-2 rounded-lg border border-border">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Forecast Horizon: <span className="text-primary font-bold">6 Months</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card-solid p-6 flex flex-col justify-between border-l-4 border-l-warning">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="h-4 w-4 text-warning" />
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Temperature Forecast</h3>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">+2.4°C</p>
            <p className="text-xs text-muted-foreground">Predicted rise over next 6 months in {region}</p>
          </div>
          <div className="mt-4 p-3 bg-secondary/50 rounded-lg text-xs font-medium border border-border">
            <span className="text-warning">⚠️ High Risk of Heatwaves</span> during summer peak.
          </div>
        </div>

        <div className="glass-card-solid p-6 flex flex-col justify-between border-l-4 border-l-green-500">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="h-4 w-4 text-green-500" />
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">NDVI Degradation</h3>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">-{ndviDrop}%</p>
            <p className="text-xs text-muted-foreground">Predicted severe vegetation stress trajectory</p>
          </div>
          <div className="mt-4 p-3 bg-secondary/50 rounded-lg text-xs font-medium border border-border">
            <span className="text-destructive">Critical Crop Failure Alert</span> projected by month 4.
          </div>
        </div>

        <div className="glass-card-solid p-6 flex flex-col justify-between border-l-4 border-l-blue-400">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="h-4 w-4 text-blue-400" />
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Drought Probability</h3>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">84%</p>
            <p className="text-xs text-muted-foreground">Based on NDWI dropping below 0.1 threshold</p>
          </div>
          <div className="mt-4 p-3 bg-secondary/50 rounded-lg text-xs font-medium border border-border">
            Suggest immediate reservoir conservation.
          </div>
        </div>
      </div>

      {/* Main Predictive Chart */}
      <div className="glass-card p-6 h-[500px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">6-Month Environmental Forecast</h2>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /> NDVI (Vegetation)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-400" /> NDWI (Water)</div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={predictionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorNdvi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorNdwi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" vertical={false} />
            <XAxis dataKey="date" stroke="hsl(215, 15%, 55%)" fontSize={12} tickMargin={10} />
            <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} tickMargin={10} />
            <Tooltip 
              contentStyle={{ backgroundColor: "hsl(222, 35%, 8%)", border: "1px solid hsl(222, 15%, 18%)", borderRadius: "8px" }} 
              labelStyle={{ color: "hsl(210, 20%, 98%)", marginBottom: "4px", fontWeight: "bold" }}
            />
            {/* Division Line for Present / Future */}
            <ReferenceLine x={predictionData[12].date} stroke="hsl(0, 84%, 60%)" strokeDasharray="3 3" label={{ position: 'top', value: 'TODAY', fill: 'hsl(0, 84%, 60%)', fontSize: 12, fontWeight: 'bold' }} />
            
            <Area type="monotone" dataKey="ndvi" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorNdvi)" />
            <Area type="monotone" dataKey="water" name="ndwi" stroke="#60a5fa" strokeWidth={3} fillOpacity={1} fill="url(#colorNdwi)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
