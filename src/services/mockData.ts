export const CHART_COLORS = {
  primary: "hsl(174, 70%, 42%)",
  accent: "hsl(152, 55%, 42%)",
  warning: "hsl(38, 92%, 50%)",
  danger: "hsl(0, 72%, 51%)",
  purple: "hsl(262, 55%, 55%)",
  blue: "hsl(217, 91%, 60%)",
};

export const monthlyTrends = [
  { month: "Jan", deforestation: 65, water: 72, crop: 58, flood: 45, heat: 38, pollution: 52 },
  { month: "Feb", deforestation: 68, water: 70, crop: 55, flood: 42, heat: 35, pollution: 54 },
  { month: "Mar", deforestation: 72, water: 65, crop: 60, flood: 48, heat: 42, pollution: 58 },
  { month: "Apr", deforestation: 70, water: 60, crop: 62, flood: 55, heat: 50, pollution: 56 },
  { month: "May", deforestation: 75, water: 55, crop: 65, flood: 60, heat: 58, pollution: 60 },
  { month: "Jun", deforestation: 78, water: 50, crop: 68, flood: 65, heat: 72, pollution: 62 },
  { month: "Jul", deforestation: 82, water: 48, crop: 62, flood: 70, heat: 80, pollution: 65 },
  { month: "Aug", deforestation: 80, water: 45, crop: 58, flood: 75, heat: 78, pollution: 68 },
  { month: "Sep", deforestation: 76, water: 52, crop: 55, flood: 68, heat: 65, pollution: 64 },
  { month: "Oct", deforestation: 72, water: 58, crop: 50, flood: 55, heat: 52, pollution: 58 },
  { month: "Nov", deforestation: 68, water: 64, crop: 48, flood: 48, heat: 42, pollution: 55 },
  { month: "Dec", deforestation: 64, water: 68, crop: 52, flood: 42, heat: 36, pollution: 50 },
];

export const deforestationData = {
  stats: [
    { label: "Forest Loss (km²)", value: 12480, trend: 8.2, negative: true },
    { label: "NDVI Index", value: 0.42, trend: -3.1, negative: true },
    { label: "Mining Sites", value: 347, trend: 12.5, negative: true },
    { label: "Risk Score", value: 78, suffix: "/100", trend: 5.3, negative: true },
  ],
  ndviTrend: [
    { month: "Jan", ndvi: 0.52, baseline: 0.58 },
    { month: "Feb", ndvi: 0.50, baseline: 0.57 },
    { month: "Mar", ndvi: 0.48, baseline: 0.56 },
    { month: "Apr", ndvi: 0.45, baseline: 0.55 },
    { month: "May", ndvi: 0.43, baseline: 0.55 },
    { month: "Jun", ndvi: 0.42, baseline: 0.54 },
    { month: "Jul", ndvi: 0.40, baseline: 0.54 },
    { month: "Aug", ndvi: 0.38, baseline: 0.53 },
    { month: "Sep", ndvi: 0.41, baseline: 0.54 },
    { month: "Oct", ndvi: 0.43, baseline: 0.55 },
    { month: "Nov", ndvi: 0.44, baseline: 0.56 },
    { month: "Dec", ndvi: 0.46, baseline: 0.57 },
  ],
  regionBreakdown: [
    { name: "Amazon", value: 42 },
    { name: "Congo Basin", value: 22 },
    { name: "SE Asia", value: 18 },
    { name: "Central America", value: 10 },
    { name: "Other", value: 8 },
  ],
  forestLoss: [
    { year: "2019", loss: 8200 },
    { year: "2020", loss: 9400 },
    { year: "2021", loss: 10100 },
    { year: "2022", loss: 11300 },
    { year: "2023", loss: 12480 },
  ],
};

export const waterData = {
  stats: [
    { label: "Reservoirs Critical", value: 23, trend: 15.2, negative: true },
    { label: "NDWI Index", value: 0.31, trend: -8.4, negative: true },
    { label: "Water Stress Regions", value: 67, trend: 4.1, negative: true },
    { label: "Risk Score", value: 72, suffix: "/100", trend: 3.8, negative: true },
  ],
  ndwiTrend: [
    { month: "Jan", ndwi: 0.45, stress: 52 },
    { month: "Feb", ndwi: 0.43, stress: 55 },
    { month: "Mar", ndwi: 0.40, stress: 60 },
    { month: "Apr", ndwi: 0.36, stress: 65 },
    { month: "May", ndwi: 0.33, stress: 70 },
    { month: "Jun", ndwi: 0.30, stress: 75 },
    { month: "Jul", ndwi: 0.28, stress: 78 },
    { month: "Aug", ndwi: 0.27, stress: 80 },
    { month: "Sep", ndwi: 0.30, stress: 74 },
    { month: "Oct", ndwi: 0.34, stress: 68 },
    { month: "Nov", ndwi: 0.38, stress: 60 },
    { month: "Dec", ndwi: 0.42, stress: 55 },
  ],
  regionRisk: [
    { region: "Middle East", risk: 92 },
    { region: "North Africa", risk: 85 },
    { region: "South Asia", risk: 78 },
    { region: "Central Asia", risk: 72 },
    { region: "Sub-Saharan", risk: 65 },
  ],
};

export const cropData = {
  stats: [
    { label: "Stressed Regions", value: 84, trend: 6.7, negative: true },
    { label: "NDVI Anomaly", value: -0.12, trend: -2.1, negative: true },
    { label: "Drought Risk Areas", value: 42, trend: 8.9, negative: true },
    { label: "Yield Forecast", value: -8, suffix: "%", trend: -3.5, negative: true },
  ],
  healthTrend: [
    { month: "Jan", health: 72, anomaly: -5 },
    { month: "Feb", health: 70, anomaly: -7 },
    { month: "Mar", health: 68, anomaly: -8 },
    { month: "Apr", health: 65, anomaly: -12 },
    { month: "May", health: 62, anomaly: -15 },
    { month: "Jun", health: 60, anomaly: -18 },
    { month: "Jul", health: 58, anomaly: -20 },
    { month: "Aug", health: 55, anomaly: -22 },
    { month: "Sep", health: 60, anomaly: -16 },
    { month: "Oct", health: 64, anomaly: -12 },
    { month: "Nov", health: 68, anomaly: -8 },
    { month: "Dec", health: 70, anomaly: -6 },
  ],
  yieldForecast: [
    { crop: "Wheat", current: 82, predicted: 75 },
    { crop: "Rice", current: 78, predicted: 70 },
    { crop: "Corn", current: 85, predicted: 78 },
    { crop: "Soy", current: 80, predicted: 74 },
  ],
};

export const floodData = {
  stats: [
    { label: "Active Flood Zones", value: 18, trend: 22.5, negative: true },
    { label: "Affected Pop. (M)", value: 4.2, trend: 15.1, negative: true },
    { label: "Severity Index", value: 8.4, suffix: "/10", trend: 10.2, negative: true },
    { label: "Urban Impact", value: 34, suffix: "%", trend: 7.8, negative: true },
  ],
  expansionTrend: [
    { month: "Jan", area: 1200, severity: 4 },
    { month: "Feb", area: 1100, severity: 3 },
    { month: "Mar", area: 1500, severity: 5 },
    { month: "Apr", area: 2200, severity: 6 },
    { month: "May", area: 3100, severity: 7 },
    { month: "Jun", area: 4500, severity: 8 },
    { month: "Jul", area: 5200, severity: 9 },
    { month: "Aug", area: 4800, severity: 8 },
    { month: "Sep", area: 3600, severity: 7 },
    { month: "Oct", area: 2400, severity: 5 },
    { month: "Nov", area: 1600, severity: 4 },
    { month: "Dec", area: 1300, severity: 3 },
  ],
  urbanImpact: [
    { city: "Dhaka", impact: 92 },
    { city: "Mumbai", impact: 85 },
    { city: "Jakarta", impact: 80 },
    { city: "Lagos", impact: 72 },
    { city: "Bangkok", impact: 68 },
  ],
};

export const heatData = {
  stats: [
    { label: "Heat Islands", value: 156, trend: 12.3, negative: true },
    { label: "Temp Anomaly (°C)", value: 3.8, trend: 8.5, negative: true },
    { label: "Urban Heat Score", value: 82, suffix: "/100", trend: 5.2, negative: true },
    { label: "Cooling Priority", value: 48, suffix: " zones", trend: 14.1, negative: true },
  ],
  temperatureTrend: [
    { month: "Jan", urban: 12, rural: 8, anomaly: 4 },
    { month: "Feb", urban: 14, rural: 10, anomaly: 4 },
    { month: "Mar", urban: 18, rural: 13, anomaly: 5 },
    { month: "Apr", urban: 24, rural: 18, anomaly: 6 },
    { month: "May", urban: 30, rural: 23, anomaly: 7 },
    { month: "Jun", urban: 35, rural: 27, anomaly: 8 },
    { month: "Jul", urban: 38, rural: 29, anomaly: 9 },
    { month: "Aug", urban: 37, rural: 28, anomaly: 9 },
    { month: "Sep", urban: 32, rural: 24, anomaly: 8 },
    { month: "Oct", urban: 26, rural: 19, anomaly: 7 },
    { month: "Nov", urban: 18, rural: 13, anomaly: 5 },
    { month: "Dec", urban: 13, rural: 9, anomaly: 4 },
  ],
  coverComparison: [
    { name: "Built-up", value: 62 },
    { name: "Green Cover", value: 18 },
    { name: "Water", value: 8 },
    { name: "Bare Soil", value: 12 },
  ],
};

export const pollutionData = {
  stats: [
    { label: "Industrial Zones", value: 234, trend: 3.4, negative: true },
    { label: "Thermal Anomalies", value: 89, trend: 11.2, negative: true },
    { label: "Pollution Index", value: 74, suffix: "/100", trend: 6.8, negative: true },
    { label: "Water Contamination", value: 45, suffix: " sites", trend: 9.1, negative: true },
  ],
  thermalTrend: [
    { month: "Jan", anomalies: 62, violations: 12 },
    { month: "Feb", anomalies: 65, violations: 14 },
    { month: "Mar", anomalies: 70, violations: 16 },
    { month: "Apr", anomalies: 75, violations: 18 },
    { month: "May", anomalies: 80, violations: 22 },
    { month: "Jun", anomalies: 85, violations: 25 },
    { month: "Jul", anomalies: 89, violations: 28 },
    { month: "Aug", anomalies: 87, violations: 26 },
    { month: "Sep", anomalies: 82, violations: 22 },
    { month: "Oct", anomalies: 76, violations: 18 },
    { month: "Nov", anomalies: 70, violations: 15 },
    { month: "Dec", anomalies: 65, violations: 13 },
  ],
  severityBreakdown: [
    { name: "Critical", value: 15 },
    { name: "High", value: 28 },
    { name: "Medium", value: 35 },
    { name: "Low", value: 22 },
  ],
};

export const alerts = [
  { id: 1, title: "Critical deforestation spike in Amazon Basin", severity: "critical" as const, module: "Deforestation", region: "South America", time: "2 min ago", resolved: false },
  { id: 2, title: "Water reservoir below 15% in Lake Chad", severity: "high" as const, module: "Water Scarcity", region: "Africa", time: "15 min ago", resolved: false },
  { id: 3, title: "Flash flood warning in Bangladesh delta", severity: "critical" as const, module: "Flood Monitoring", region: "South Asia", time: "32 min ago", resolved: false },
  { id: 4, title: "Urban heat anomaly detected in Phoenix", severity: "medium" as const, module: "Urban Heat", region: "North America", time: "1 hr ago", resolved: false },
  { id: 5, title: "Industrial discharge detected near Ganges", severity: "high" as const, module: "Pollution", region: "South Asia", time: "2 hr ago", resolved: false },
  { id: 6, title: "Crop stress indicators rising in East Africa", severity: "medium" as const, module: "Crop Stress", region: "Africa", time: "3 hr ago", resolved: true },
  { id: 7, title: "Illegal mining activity in Congo Basin", severity: "high" as const, module: "Deforestation", region: "Africa", time: "4 hr ago", resolved: false },
  { id: 8, title: "Coastal flooding risk in Vietnam", severity: "low" as const, module: "Flood Monitoring", region: "SE Asia", time: "5 hr ago", resolved: true },
  { id: 9, title: "Heat wave intensifying in Delhi NCR", severity: "critical" as const, module: "Urban Heat", region: "South Asia", time: "6 hr ago", resolved: false },
  { id: 10, title: "Water contamination in Mekong Delta", severity: "medium" as const, module: "Pollution", region: "SE Asia", time: "8 hr ago", resolved: true },
];

export const countryRankings = [
  { country: "Brazil", score: 38, change: -5 },
  { country: "India", score: 42, change: -3 },
  { country: "Indonesia", score: 45, change: -4 },
  { country: "DR Congo", score: 35, change: -7 },
  { country: "China", score: 52, change: 2 },
  { country: "Nigeria", score: 40, change: -2 },
  { country: "Bangladesh", score: 36, change: -6 },
  { country: "Pakistan", score: 44, change: -1 },
  { country: "Mexico", score: 55, change: 1 },
  { country: "Australia", score: 62, change: -3 },
];

export const radarData = [
  { module: "Deforestation", score: 78, fullMark: 100 },
  { module: "Water", score: 72, fullMark: 100 },
  { module: "Crop", score: 65, fullMark: 100 },
  { module: "Flood", score: 58, fullMark: 100 },
  { module: "Heat", score: 82, fullMark: 100 },
  { module: "Pollution", score: 74, fullMark: 100 },
];

export const modules = [
  { id: "deforestation", title: "Deforestation & Mining", description: "Monitor forest loss, NDVI trends, and illegal mining detection using satellite imagery.", path: "/modules/deforestation", color: "text-accent", risk: 78 },
  { id: "water", title: "Water Scarcity", description: "Track reservoir levels, water stress indices, and drought risk across global regions.", path: "/modules/water", color: "text-blue-400", risk: 72 },
  { id: "crop", title: "Crop Stress", description: "Analyze crop health, yield predictions, and food security indicators worldwide.", path: "/modules/crop", color: "text-success", risk: 65 },
  { id: "flood", title: "Flood & Disaster", description: "Real-time flood detection, disaster severity assessment, and urban impact analysis.", path: "/modules/flood", color: "text-primary", risk: 58 },
  { id: "heat", title: "Urban Heat Islands", description: "Map thermal anomalies, urban heat scores, and cooling priority zones.", path: "/modules/heat", color: "text-warning", risk: 82 },
  { id: "pollution", title: "Industrial Pollution", description: "Detect industrial emissions, water contamination, and environmental violations.", path: "/modules/pollution", color: "text-destructive", risk: 74 },
];
