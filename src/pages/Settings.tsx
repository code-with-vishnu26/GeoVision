import { Settings as SettingsIcon, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ModuleHeader from "@/components/shared/ModuleHeader";
import { useApp } from "@/context/AppContext";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const { theme, toggleTheme, settings, updateSettings } = useApp();

  const handleSave = () => {
    toast({ title: "Settings Saved", description: "Your preferences have been updated." });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <ModuleHeader title="Settings" description="Configure platform preferences and alert thresholds" icon={SettingsIcon} iconColor="text-muted-foreground" />

      <div className="glass-card-solid p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">Display</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch id="dark-mode" checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Data Refresh</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Auto-refresh Interval</Label>
              <Select value={String(settings.refreshInterval)} onValueChange={(v) => updateSettings({ refreshInterval: Number(v) })}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                  <SelectItem value="0">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Data Source</Label>
              <Select value={settings.dataSource} onValueChange={(v) => updateSettings({ dataSource: v })}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="ground">Ground</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Alert Thresholds</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Forest Loss Threshold</Label>
                <span className="text-xs text-muted-foreground">{settings.forestLossThreshold}%</span>
              </div>
              <Slider value={[settings.forestLossThreshold]} onValueChange={([v]) => updateSettings({ forestLossThreshold: v })} max={50} step={1} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Water Stress Threshold</Label>
                <span className="text-xs text-muted-foreground">{settings.waterStressThreshold}%</span>
              </div>
              <Slider value={[settings.waterStressThreshold]} onValueChange={([v]) => updateSettings({ waterStressThreshold: v })} max={100} step={1} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Heat Anomaly Threshold</Label>
                <span className="text-xs text-muted-foreground">{settings.heatAnomalyThreshold}°C</span>
              </div>
              <Slider value={[settings.heatAnomalyThreshold]} onValueChange={([v]) => updateSettings({ heatAnomalyThreshold: v })} max={10} step={0.5} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Pollution Index Threshold</Label>
                <span className="text-xs text-muted-foreground">{settings.pollutionIndexThreshold}</span>
              </div>
              <Slider value={[settings.pollutionIndexThreshold]} onValueChange={([v]) => updateSettings({ pollutionIndexThreshold: v })} max={100} step={1} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Push Notifications</Label>
              <Switch id="notifications" checked={settings.pushNotifications} onCheckedChange={(v) => updateSettings({ pushNotifications: v })} />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
