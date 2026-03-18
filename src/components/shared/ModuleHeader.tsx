import { LucideIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { toast } from "@/hooks/use-toast";

interface ModuleHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  exportData?: () => string;
  exportFilename?: string;
}

const ModuleHeader = ({ title, description, icon: Icon, iconColor = "text-primary", exportData, exportFilename = "report.csv" }: ModuleHeaderProps) => {
  const { role } = useApp();
  const canExport = role === "admin" || role === "analyst";

  const handleExport = () => {
    if (!exportData) {
      // Default mock export
      const csv = `Module,${title}\nDate,${new Date().toISOString()}\nStatus,Active\n`;
      const blob = new Blob([csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = exportFilename;
      a.click();
      URL.revokeObjectURL(a.href);
    } else {
      const csv = exportData();
      const blob = new Blob([csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = exportFilename;
      a.click();
      URL.revokeObjectURL(a.href);
    }
    toast({ title: "Report Exported", description: `${exportFilename} downloaded successfully.` });
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl bg-secondary ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {canExport && (
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      )}
    </div>
  );
};

export default ModuleHeader;
