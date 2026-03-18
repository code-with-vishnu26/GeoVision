import { useState, useEffect } from "react";
import { Activity, Server, Cpu, HardDrive, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import ModuleHeader from "@/components/shared/ModuleHeader";
import { Button } from "@/components/ui/button";
import { fetchSystemHealth } from "@/services/api";
import type { SystemHealth as HealthData } from "@/services/api";

const SystemHealth = () => {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const loadHealth = async () => {
        setLoading(true); setError(false);
        try {
            const data = await fetchSystemHealth();
            setHealth(data);
        } catch {
            setError(true);
        }
        setLoading(false);
    };

    useEffect(() => { loadHealth(); }, []);

    const StatusBadge = ({ ok }: { ok: boolean }) => (
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${ok ? "text-success" : "text-destructive"}`}>
            {ok ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
            {ok ? "Online" : "Offline"}
        </span>
    );

    const PercentBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">{label}</span><span className="text-foreground font-semibold">{value.toFixed(1)}%</span></div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} /></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl">
            <div className="flex items-center justify-between">
                <ModuleHeader title="System Health" description="Monitor backend infrastructure and service status" icon={Activity} iconColor="text-accent" />
                <Button variant="outline" size="sm" onClick={loadHealth} className="gap-1.5 text-xs"><RefreshCw className="h-3 w-3" />Refresh</Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : error ? (
                <div className="glass-card-solid p-8 text-center">
                    <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
                    <p className="text-lg font-bold text-foreground">Backend Unreachable</p>
                    <p className="text-sm text-muted-foreground mt-2">Cannot connect to <code className="text-primary">localhost:8000</code></p>
                    <p className="text-xs text-muted-foreground mt-1">Run: <code>cd gsis-backend && uvicorn main:app --reload</code></p>
                    <Button onClick={loadHealth} className="mt-4 gap-2"><RefreshCw className="h-4 w-4" />Retry</Button>
                </div>
            ) : health && (
                <>
                    {/* Status banner */}
                    <div className="glass-card-solid p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`h-3 w-3 rounded-full ${health.status === "healthy" ? "bg-success animate-pulse" : "bg-destructive"}`} />
                            <div>
                                <p className="text-foreground font-semibold">GSIS Backend</p>
                                <p className="text-xs text-muted-foreground">v{health.model_version} · Python {health.python_version.split(" ")[0]}</p>
                            </div>
                        </div>
                        <StatusBadge ok={health.status === "healthy"} />
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="glass-card-solid p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10"><Server className="h-5 w-5 text-primary" /></div>
                            <div><p className="text-[10px] text-muted-foreground">Uptime</p><p className="text-lg font-bold text-foreground">{health.uptime_human}</p></div>
                        </div>
                        <div className="glass-card-solid p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-accent/10"><Activity className="h-5 w-5 text-accent" /></div>
                            <div><p className="text-[10px] text-muted-foreground">Model Version</p><p className="text-lg font-bold text-foreground">v{health.model_version}</p></div>
                        </div>
                        <div className="glass-card-solid p-4 flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${health.rasterio_available ? "bg-success/10" : "bg-destructive/10"}`}>{health.rasterio_available ? <CheckCircle className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}</div>
                            <div><p className="text-[10px] text-muted-foreground">Rasterio (GeoTIFF)</p><p className="text-sm font-bold text-foreground">{health.rasterio_available ? "Available" : "Not Installed"}</p></div>
                        </div>
                        <div className="glass-card-solid p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10"><Activity className="h-5 w-5 text-blue-400" /></div>
                            <div><p className="text-[10px] text-muted-foreground">Last Check</p><p className="text-sm font-bold text-foreground">{new Date(health.timestamp).toLocaleTimeString()}</p></div>
                        </div>
                    </div>

                    {/* Resource usage */}
                    {health.cpu_percent !== undefined && (
                        <div className="glass-card-solid p-5 space-y-4">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Cpu className="h-4 w-4 text-primary" />Resource Usage</h4>
                            <PercentBar label="CPU" value={health.cpu_percent} color="hsl(217, 91%, 60%)" />
                            {health.memory_percent !== undefined && <PercentBar label="Memory" value={health.memory_percent} color="hsl(142, 71%, 45%)" />}
                            {health.disk_percent !== undefined && <PercentBar label="Disk" value={health.disk_percent} color="hsl(262, 83%, 58%)" />}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SystemHealth;
