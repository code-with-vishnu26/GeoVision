import { useState, useEffect } from "react";
import { History, Loader2, ImageIcon, Trash2 } from "lucide-react";
import ModuleHeader from "@/components/shared/ModuleHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { exportCSV, exportPDF } from "@/services/exportUtils";
import { FileDown } from "lucide-react";

interface UploadRecord {
    id: string;
    image_url: string;
    predicted_class: string | null;
    confidence: number | null;
    source: string | null;
    created_at: string;
}

const AnalysisHistory = () => {
    const { user, role } = useAuth();
    const [records, setRecords] = useState<UploadRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("uploads")
            .select("id, image_url, predicted_class, confidence, source, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            setRecords((data as UploadRecord[]) ?? []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchHistory();
    }, [user]);

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from("uploads").delete().eq("id", id);
        if (error) {
            toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
        } else {
            setRecords((prev) => prev.filter((r) => r.id !== id));
            toast({ title: "Record Deleted" });
        }
    };

    const canExport = role === "admin" || role === "analyst";

    const handleExportCSV = () => {
        const data = records.map((r, i) => ({
            "#": i + 1,
            Class: r.predicted_class ?? "—",
            Confidence: r.confidence != null ? `${r.confidence}%` : "—",
            Source: r.source ?? "—",
            Date: new Date(r.created_at).toLocaleDateString(),
        }));
        exportCSV(data, ["#", "Class", "Confidence", "Source", "Date"], "analysis_history.csv");
        toast({ title: "CSV Exported" });
    };

    const handleExportPDF = () => {
        const data = records.map((r, i) => ({
            "#": i + 1,
            Class: r.predicted_class ?? "—",
            Confidence: r.confidence != null ? `${r.confidence}%` : "—",
            Source: r.source ?? "—",
            Date: new Date(r.created_at).toLocaleDateString(),
        }));
        exportPDF("GeoVision — Analysis History", data, ["#", "Class", "Confidence", "Source", "Date"], "analysis_history.pdf");
        toast({ title: "PDF Exported" });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <ModuleHeader
                title="My Analysis History"
                description="View all your past satellite image classifications and predictions"
                icon={History}
                iconColor="text-primary"
            />

            {/* Actions bar */}
            <div className="flex items-center justify-between glass-card-solid p-3">
                <p className="text-xs text-muted-foreground">
                    {loading ? "Loading..." : `${records.length} analysis record${records.length !== 1 ? "s" : ""}`}
                </p>
                {canExport && records.length > 0 && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={handleExportCSV}>
                            <FileDown className="h-3 w-3" /> CSV
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={handleExportPDF}>
                            <FileDown className="h-3 w-3" /> PDF
                        </Button>
                    </div>
                )}
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : records.length === 0 ? (
                <div className="glass-card-solid p-12 text-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No analyses yet. Go to the Upload page to classify your first image.</p>
                </div>
            ) : (
                <div className="glass-card-solid overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-3 px-4 text-muted-foreground font-medium">#</th>
                                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Preview</th>
                                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Predicted Class</th>
                                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Confidence</th>
                                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Source</th>
                                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((r, i) => (
                                <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                                    <td className="py-3 px-4 text-muted-foreground">{i + 1}</td>
                                    <td className="py-3 px-4">
                                        {r.image_url ? (
                                            <img src={r.image_url} alt="upload" className="h-10 w-10 rounded object-cover" />
                                        ) : (
                                            <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
                                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-foreground font-medium">{r.predicted_class ?? "—"}</td>
                                    <td className="py-3 px-4">
                                        {r.confidence != null ? (
                                            <span className={`text-sm font-semibold ${r.confidence >= 80 ? "text-success" : r.confidence >= 50 ? "text-warning" : "text-destructive"}`}>
                                                {r.confidence}%
                                            </span>
                                        ) : "—"}
                                    </td>
                                    <td className="py-3 px-4 text-muted-foreground capitalize">{r.source ?? "—"}</td>
                                    <td className="py-3 px-4 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                                    <td className="py-3 px-4">
                                        {role === "admin" && (
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AnalysisHistory;
