import { useState } from "react";
import { Users, Camera, MapPin, CheckCircle2, XCircle, AlertTriangle, Upload, Image as ImageIcon } from "lucide-react";

interface PendingAlert {
  id: string;
  region: string;
  type: string;
  confidence: number;
  date: string;
}

const pendingAlerts: PendingAlert[] = [
  { id: "1", region: "Amazon Basin Sector 4", type: "Deforestation", confidence: 92, date: "2026-03-18" },
  { id: "2", region: "Ganges Delta Region B", type: "Flooding", confidence: 85, date: "2026-03-17" },
  { id: "3", region: "Borneo Rainforest Zone 12", type: "Deforestation", confidence: 78, date: "2026-03-16" },
];

const CommunityPortal = () => {
  const [selectedAlert, setSelectedAlert] = useState<PendingAlert | null>(null);
  const [reportText, setReportText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);

  const handleSubmit = (status: 'confirm' | 'dismiss') => {
    if (!selectedAlert) return;
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setValidationSuccess(true);
      setTimeout(() => {
        setValidationSuccess(false);
        setSelectedAlert(null);
        setReportText("");
      }, 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Community Ground-Truthing
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Validate AI-generated satellite alerts through crowdsourced local evidence. Your verified field reports help prevent false positives and train our global models.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Alerts List */}
        <div className="glass-card flex flex-col h-[600px]">
          <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
            <h2 className="font-semibold text-sm">Pending Alerts Awaiting Validation</h2>
            <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full font-medium">{pendingAlerts.length} Active</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {pendingAlerts.map(alert => (
              <div 
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`p-4 rounded-lg cursor-pointer transition-all border ${
                  selectedAlert?.id === alert.id ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(45,212,191,0.1)]' : 'border-border/50 bg-secondary/20 hover:bg-secondary/40'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    <span className="font-medium text-sm text-foreground">{alert.region}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{alert.date}</span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs font-semibold px-2 py-1 bg-background rounded border border-border">AI Tag: {alert.type}</span>
                  <span className="text-xs text-muted-foreground">Confidence: <span className="font-medium text-primary">{alert.confidence}%</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Validation Form */}
        <div className="glass-card-solid flex flex-col h-[600px] overflow-hidden relative">
          {!selectedAlert ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Select an Alert to Validate</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Choose a pending satellite alert from the list to upload ground-level photographic evidence from your location.
              </p>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="p-4 border-b border-border bg-primary/5 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-sm">Validating: {selectedAlert.region}</h3>
                  <p className="text-xs text-muted-foreground">AI Suspects: {selectedAlert.type}</p>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-5">
                {validationSuccess && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                    <CheckCircle2 className="h-16 w-16 text-primary mb-4 animate-bounce" />
                    <h2 className="text-xl font-bold">Report Submitted Successfully</h2>
                    <p className="text-muted-foreground text-sm mt-2">Thank you for validating this regional alert!</p>
                  </div>
                )}
                
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Upload Photo Evidence</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-secondary/20 transition-colors cursor-pointer group">
                    <div className="p-3 bg-secondary rounded-full mb-3 group-hover:scale-110 transition-transform">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Click to browse or drag image here</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG with EXIF GPS Data</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Field Notes / Observations</label>
                  <textarea 
                    className="w-full bg-background border border-border rounded-lg text-sm px-3 py-3 outline-none focus:border-primary resize-none h-28"
                    placeholder="Describe what you see on the ground. e.g. 'Confirmed extensive logging activity near the riverbank...'"
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                  />
                </div>

                <div className="pt-2 grid grid-cols-2 gap-4">
                  <button 
                    disabled={isUploading}
                    onClick={() => handleSubmit('confirm')}
                    className="flex justify-center items-center gap-2 bg-success text-white py-3 rounded-lg text-sm font-medium hover:bg-success/90 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? <Upload className="h-4 w-4 animate-bounce" /> : <CheckCircle2 className="h-4 w-4" />}
                    Confirm AI Tag
                  </button>
                  <button 
                    disabled={isUploading}
                    onClick={() => handleSubmit('dismiss')}
                    className="flex justify-center items-center gap-2 bg-destructive text-white py-3 rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Dismiss as False Positive
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPortal;
