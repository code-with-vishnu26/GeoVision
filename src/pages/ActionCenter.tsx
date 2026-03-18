import { useState, useRef, useEffect } from "react";
import { Zap, Map, Route as RouteIcon, ShieldAlert, Trees, Send, ChevronRight, AlertTriangle, CheckCircle2, Activity, Helipad, Helicopter, Users, Stethoscope, Download, Globe2, ExternalLink } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const mockActiveAlerts = [
  { id: "1", type: "Flood", region: "Ganges Delta", severity: "Critical" },
  { id: "2", type: "Deforestation", region: "Amazon Basin", severity: "High" },
  { id: "3", type: "Urban Heat", region: "New Delhi", severity: "High" },
];

const ActionCenter = () => {
  const [activeTab, setActiveTab] = useState<"evacuation" | "carbon" | "emergency" | "dispatch" | "ngo">("evacuation");
  
  // Evacuation State
  const [selectedDisaster, setSelectedDisaster] = useState("");
  const [evacuationPlan, setEvacuationPlan] = useState<{ zone: string, route: string, time: string } | null>(null);
  
  // Carbon State
  const [deforestationArea, setDeforestationArea] = useState("");
  const [carbonImpact, setCarbonImpact] = useState<{ loss: number, treesNeeded: number, cost: number } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  // Emergency State
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [alertSent, setAlertSent] = useState(false);

  // Dispatch State
  const [assignedResources, setAssignedResources] = useState<Record<string, string>>({});

  // NGO Data State
  const [reliefwebData, setReliefwebData] = useState<any[]>([]);
  const [isLoadingRelief, setIsLoadingRelief] = useState(false);

  // Handlers
  const handleGenerateEvacuation = () => {
    if (!selectedDisaster) return;
    setEvacuationPlan({
      zone: "Shelter Point Alpha (Elevated Ground, 12km N)",
      route: "Highway 44 North -> Bypass Road B -> Safe Zone",
      time: "Approx. 45 mins driving",
    });
  };

  const handleCalculateImpact = () => {
    const area = parseFloat(deforestationArea);
    if (!area || isNaN(area)) return;
    const co2Loss = area * 500;
    const trees = co2Loss;
    const cost = trees * 2.5;
    setCarbonImpact({ loss: co2Loss, treesNeeded: trees, cost });
  };

  const exportPDF = async () => {
    if (!pdfRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("GeoVision_Impact_Report.pdf");
    } catch (error) {
      console.error("PDF Export failed", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendAlert = () => {
    if (!broadcastMessage) return;
    setAlertSent(true);
    setTimeout(() => {
      setAlertSent(false);
      setBroadcastMessage("");
    }, 3000);
  };

  const assignResource = (alertId: string, resource: string) => {
    setAssignedResources(prev => ({ ...prev, [alertId]: resource }));
  };

  const fetchReliefWeb = async () => {
    setIsLoadingRelief(true);
    try {
      // the reliefweb api endpoint for disasters
      const response = await fetch("https://api.reliefweb.int/v1/disasters?appname=geovision&limit=5&preset=latest&profile=list");
      const json = await response.json();
      setReliefwebData(json.data || []);
    } catch (e) {
      console.error("Reliefweb fetch failed", e);
    } finally {
      setIsLoadingRelief(false);
    }
  };

  useEffect(() => {
    if (activeTab === "ngo" && reliefwebData.length === 0) {
      fetchReliefWeb();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Action Center</h1>
        <p className="text-muted-foreground mt-1">
          Transform environmental intelligence into tangible, real-world solutions.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 pb-2 border-b border-border overflow-x-auto">
        <button
          onClick={() => setActiveTab("evacuation")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === "evacuation" ? "bg-secondary text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-secondary/50"
          }`}
        >
          <RouteIcon className="h-4 w-4" /> Evacuation Planner
        </button>
        <button
          onClick={() => setActiveTab("carbon")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === "carbon" ? "bg-secondary text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-secondary/50"
          }`}
        >
          <Trees className="h-4 w-4" /> Carbon Offset (PDF)
        </button>
        <button
          onClick={() => setActiveTab("dispatch")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === "dispatch" ? "bg-secondary text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-secondary/50"
          }`}
        >
          <Helicopter className="h-4 w-4" /> Resource Dispatch
        </button>
        <button
          onClick={() => setActiveTab("emergency")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === "emergency" ? "bg-secondary text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-secondary/50"
          }`}
        >
          <ShieldAlert className="h-4 w-4" /> Emergency Broadcast
        </button>
        <button
          onClick={() => setActiveTab("ngo")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === "ngo" ? "bg-secondary text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-secondary/50"
          }`}
        >
          <Globe2 className="h-4 w-4" /> ReliefWeb NGO Data
        </button>
      </div>

      <div className="mt-6">
        {/* EVACUATION PLANNER */}
        {activeTab === "evacuation" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card-solid p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Map className="h-5 w-5 text-accent" />
                Disaster Evacuation Planner
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Calculate safe zones and generate evacuation routes for areas with active critical alerts.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Select Active Disaster Zone</label>
                  <select
                    className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2.5 outline-none focus:border-primary"
                    value={selectedDisaster}
                    onChange={(e) => { setSelectedDisaster(e.target.value); setEvacuationPlan(null); }}
                  >
                    <option value="">-- Select a Critical Region --</option>
                    {mockActiveAlerts.map(alert => (
                      <option key={alert.id} value={alert.region}>{alert.region} ({alert.type})</option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={handleGenerateEvacuation}
                  disabled={!selectedDisaster}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Safe Route
                </button>
              </div>
            </div>

            {evacuationPlan && (
              <div className="glass-card p-6 border-accent/20 border flex flex-col justify-center animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-[100px] -z-10" />
                <h3 className="font-semibold text-accent mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Route Generated Successfully
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1">Designated Safe Zone</span>
                    <p className="text-foreground text-sm font-medium p-3 bg-secondary/50 rounded-md border border-border/50">{evacuationPlan.zone}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1">Primary Route</span>
                    <p className="text-foreground text-sm font-medium p-3 bg-secondary/50 rounded-md border border-border/50">{evacuationPlan.route}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1">Estimated Travel Time</span>
                    <p className="text-foreground text-sm font-medium">{evacuationPlan.time}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CARBON OFFSET CALCULATOR with PDF Export */}
        {activeTab === "carbon" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card-solid p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Trees className="h-5 w-5 text-green-500" />
                Carbon Offset & Mitigation
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Calculate the estimated carbon footprint of detected deforestation events and generate mitigation quotas for reforestation NGOs.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Estimated Area Lost (Hectares)</label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2.5 outline-none focus:border-primary"
                    value={deforestationArea}
                    onChange={(e) => setDeforestationArea(e.target.value)}
                  />
                </div>
                
                <button
                  onClick={handleCalculateImpact}
                  disabled={!deforestationArea}
                  className="w-full bg-green-600 text-white hover:bg-green-700 font-medium text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Calculate Impact & Quotas
                </button>
              </div>
            </div>

            {carbonImpact && (
              <div className="space-y-4 animate-fade-in">
                <div 
                  ref={pdfRef} 
                  className="glass-card p-6 border-green-500/20 border flex flex-col justify-center relative bg-background"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-[100px] pointer-events-none" />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
                        GeoVision <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 rounded">Report</span>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">Environmental Impact & Mitigation Assesment</p>
                    </div>
                    <Trees className="h-8 w-8 text-green-500/50" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-secondary/40 rounded-lg border border-border/30">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Est. CO₂ Loss</span>
                      <p className="text-2xl font-bold text-foreground mt-1">{carbonImpact.loss.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">tons</span></p>
                    </div>
                    <div className="p-4 bg-secondary/40 rounded-lg border border-border/30">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Trees Required</span>
                      <p className="text-2xl font-bold text-foreground mt-1">{carbonImpact.treesNeeded.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <span className="text-[10px] text-green-500/80 uppercase font-bold tracking-wider">Estimated NGO Restauration Cost</span>
                    <p className="text-xl font-bold text-green-500 mt-1">${carbonImpact.cost.toLocaleString()}</p>
                  </div>
                  
                  <p className="text-[10px] text-muted-foreground text-center mt-6">Generated automatically by GeoVision AI Platform.</p>
                </div>
                
                <button
                  onClick={exportPDF}
                  disabled={isExporting}
                  className="w-full flex justify-center items-center gap-2 bg-secondary text-foreground hover:bg-secondary/80 font-medium text-sm py-2.5 rounded-lg border border-border transition-colors"
                >
                  {isExporting ? <Activity className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {isExporting ? "Generating PDF..." : "Export Official PDF Report"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESOURCE DISPATCH DASHBOARD */}
        {activeTab === "dispatch" && (
          <div className="glass-card-solid overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-2">
                <Helicopter className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Emergency Resource Allocation</h3>
              </div>
              <span className="text-xs text-muted-foreground">Drag/Select to assign units</span>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockActiveAlerts.map(alert => (
                  <div key={alert.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/50 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`h-2 w-2 rounded-full ${alert.severity === 'Critical' ? 'bg-destructive' : 'bg-warning'}`} />
                        <h4 className="font-medium text-sm">{alert.region}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground ml-4">Incident: {alert.type}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => assignResource(alert.id, "Medical")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-colors border ${
                          assignedResources[alert.id] === "Medical" ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-background border-border hover:bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Stethoscope className="h-3 w-3" /> Medical Team
                      </button>
                      <button 
                        onClick={() => assignResource(alert.id, "Aviation")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-colors border ${
                          assignedResources[alert.id] === "Aviation" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-background border-border hover:bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Helipad className="h-3 w-3" /> Aviation Unit
                      </button>
                      <button 
                         onClick={() => assignResource(alert.id, "Evac")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-colors border ${
                          assignedResources[alert.id] === "Evac" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-background border-border hover:bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Users className="h-3 w-3" /> Evac Transport
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RELIEFWEB API INTEGRATION */}
        {activeTab === "ngo" && (
          <div className="glass-card-solid overflow-hidden">
            <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-blue-500/5">
              <div className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-blue-400" />
                <div>
                  <h3 className="font-semibold text-foreground">ReliefWeb Live Disasters</h3>
                  <p className="text-[10px] text-muted-foreground">Authorized API Integration with United Nations OCHA</p>
                </div>
              </div>
              <button onClick={fetchReliefWeb} disabled={isLoadingRelief} className="text-xs px-3 py-1.5 bg-blue-500/20 text-blue-400 font-semibold rounded hover:bg-blue-500/30 transition-colors flex items-center gap-2">
                {isLoadingRelief ? <Activity className="h-3 w-3 animate-spin"/> : <Globe2 className="h-3 w-3" />}
                Sync Live Data
              </button>
            </div>
            
            <div className="p-0">
              {isLoadingRelief && reliefwebData.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                  <Activity className="h-8 w-8 animate-spin mb-4 text-blue-400" />
                  <p className="text-sm">Connecting to ReliefWeb API...</p>
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Disaster Title</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-right">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reliefwebData.map((disaster: any) => (
                      <tr key={disaster.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-4 font-medium text-foreground">{disaster.fields.name}</td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-1 rounded bg-accent/20 text-accent font-semibold text-[10px]">Ongoing</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <a href={disaster.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300">
                            View JSON <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                    {reliefwebData.length === 0 && !isLoadingRelief && (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No data available from API.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* EMERGENCY BROADCAST */}
        {activeTab === "emergency" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card-solid p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                Emergency Alert Dispatch
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Push immediate SMS and Email warnings to local authorities, registered NGOs, and local populations in risk zones.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Target Region</label>
                  <select className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2.5 outline-none focus:border-primary">
                    <option>Ganges Delta [Flood Zone Active]</option>
                    <option>Borneo Rainforest [Deforestation Active]</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Message Payload</label>
                  <textarea
                    rows={4}
                    placeholder="Enter urgent instructions here..."
                    className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2.5 outline-none focus:border-primary resize-none"
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                  />
                </div>
                
                <button
                  onClick={handleSendAlert}
                  disabled={!broadcastMessage || alertSent}
                  className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium text-sm flex justify-center items-center gap-2 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  {alertSent ? "Dispatched Successfully" : "Broadcast to Region"}
                </button>
              </div>
            </div>

            <div className="glass-card p-6 border border-border flex flex-col bg-secondary/20 justify-center">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-2">
                  <Zap className="h-6 w-6 text-warning" />
                </div>
                <h3 className="font-medium text-foreground">Mock Integration Notice</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  This system integrates with Twilio for SMS dispatch and SendGrid for automated emails in production. Emergency broadcasting requires local regulatory approval.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionCenter;
