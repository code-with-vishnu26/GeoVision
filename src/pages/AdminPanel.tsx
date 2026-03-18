import { useState, useEffect } from "react";
import { Shield, Users, Upload, BarChart3, Settings, AlertTriangle, Trash2, Loader2 } from "lucide-react";
import ModuleHeader from "@/components/shared/ModuleHeader";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { fetchAdminUsers } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";
import type { AdminUser } from "@/services/api";

interface UploadRecord {
    id: string;
    user_id: string;
    image_url: string;
    predicted_class: string | null;
    confidence: number | null;
    source: string | null;
    created_at: string;
}

const AdminPanel = () => {
    const { role } = useAuth();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [allUploads, setAllUploads] = useState<UploadRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"uploads" | "users" | "settings">("uploads");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const u = await fetchAdminUsers();
                setUsers(u.users);
            } catch { /* backend offline */ }

            // Fetch all uploads (admin RLS should allow this — if not, shows own)
            const { data } = await supabase.from("uploads").select("*").order("created_at", { ascending: false }).limit(100);
            if (data) setAllUploads(data as UploadRecord[]);
            setLoading(false);
        };
        load();
    }, []);

    const handleDelete = async (id: string) => {
        await supabase.from("uploads").delete().eq("id", id);
        setAllUploads((prev) => prev.filter((u) => u.id !== id));
        toast({ title: "Record Deleted" });
    };

    if (role !== "admin") {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-foreground">Admin Access Required</h2>
                    <p className="text-sm text-muted-foreground mt-2">This page is restricted to administrators.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <ModuleHeader title="Admin Control Panel" description="System administration, user management, and data oversight" icon={Shield} iconColor="text-destructive" />

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-lg bg-secondary w-fit">
                <Button size="sm" variant={tab === "uploads" ? "default" : "ghost"} onClick={() => setTab("uploads")} className="text-xs gap-1.5"><Upload className="h-3 w-3" />All Uploads</Button>
                <Button size="sm" variant={tab === "users" ? "default" : "ghost"} onClick={() => setTab("users")} className="text-xs gap-1.5"><Users className="h-3 w-3" />Users</Button>
                <Button size="sm" variant={tab === "settings" ? "default" : "ghost"} onClick={() => setTab("settings")} className="text-xs gap-1.5"><Settings className="h-3 w-3" />Settings</Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
                <>
                    {/* Stats row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="glass-card-solid p-4 text-center"><p className="text-3xl font-bold text-primary">{allUploads.length}</p><p className="text-xs text-muted-foreground">Total Uploads</p></div>
                        <div className="glass-card-solid p-4 text-center"><p className="text-3xl font-bold text-accent">{users.length}</p><p className="text-xs text-muted-foreground">Users</p></div>
                        <div className="glass-card-solid p-4 text-center"><p className="text-3xl font-bold text-success">{allUploads.filter(u => (u.confidence ?? 0) >= 80).length}</p><p className="text-xs text-muted-foreground">High Confidence</p></div>
                        <div className="glass-card-solid p-4 text-center"><p className="text-3xl font-bold text-warning">{new Set(allUploads.map(u => u.predicted_class)).size}</p><p className="text-xs text-muted-foreground">Unique Classes</p></div>
                    </div>

                    {/* Uploads tab */}
                    {tab === "uploads" && (
                        <div className="glass-card-solid overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-muted-foreground">#</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground">User ID</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground">Class</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground">Confidence</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground">Source</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground">Date</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground">Actions</th>
                                </tr></thead>
                                <tbody>{allUploads.map((u, i) => (
                                    <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/50">
                                        <td className="py-2 px-4 text-muted-foreground">{i + 1}</td>
                                        <td className="py-2 px-4 text-foreground font-mono text-[10px] truncate max-w-[100px]">{u.user_id.slice(0, 8)}...</td>
                                        <td className="py-2 px-4 text-foreground font-medium">{u.predicted_class ?? "—"}</td>
                                        <td className="py-2 px-4"><span className={`font-semibold ${(u.confidence ?? 0) >= 80 ? "text-success" : (u.confidence ?? 0) >= 50 ? "text-warning" : "text-destructive"}`}>{u.confidence ?? 0}%</span></td>
                                        <td className="py-2 px-4 text-muted-foreground capitalize">{u.source ?? "—"}</td>
                                        <td className="py-2 px-4 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                                        <td className="py-2 px-4"><Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => handleDelete(u.id)}><Trash2 className="h-3 w-3" /></Button></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    )}

                    {/* Users tab */}
                    {tab === "users" && (
                        <div className="glass-card-solid overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-muted-foreground">Email</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground">Role</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground">Uploads</th>
                                </tr></thead>
                                <tbody>{users.map((u) => (
                                    <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/50">
                                        <td className="py-3 px-4 text-foreground">{u.email}</td>
                                        <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.role === "admin" ? "bg-destructive/20 text-destructive" : u.role === "analyst" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>{u.role}</span></td>
                                        <td className="py-3 px-4 text-foreground font-semibold">{u.uploads}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    )}

                    {/* Settings tab */}
                    {tab === "settings" && (
                        <div className="glass-card-solid p-6 space-y-6">
                            <h4 className="text-sm font-semibold text-foreground">System Configuration</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground">NDVI Alert Threshold</label>
                                    <input type="range" min="-0.5" max="1" step="0.05" defaultValue="0.2" className="w-full accent-primary" />
                                    <p className="text-[10px] text-muted-foreground">Alert when NDVI drops below this value</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground">NDWI Flood Threshold</label>
                                    <input type="range" min="-0.5" max="1" step="0.05" defaultValue="0.3" className="w-full accent-blue-500" />
                                    <p className="text-[10px] text-muted-foreground">Trigger flood alert when NDWI exceeds this</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground">Max Batch Size</label>
                                    <input type="number" defaultValue={20} className="w-full h-8 rounded bg-secondary border border-border px-2 text-sm text-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground">Rate Limit (req/min)</label>
                                    <input type="number" defaultValue={30} className="w-full h-8 rounded bg-secondary border border-border px-2 text-sm text-foreground" />
                                </div>
                            </div>
                            <Button className="gap-2"><Settings className="h-4 w-4" />Save Configuration</Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminPanel;
