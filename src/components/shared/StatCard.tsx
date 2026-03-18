import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  trend?: number;
  negative?: boolean;
  icon: LucideIcon;
  iconColor?: string;
  decimals?: number;
}

const StatCard = ({ label, value, suffix = "", trend, negative, icon: Icon, iconColor = "text-primary", decimals = 0 }: StatCardProps) => {
  const animatedValue = useAnimatedCounter(value, 1500, decimals);
  const trendUp = trend && trend > 0;

  return (
    <div className="glass-card-solid p-4 hover:glow-border transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-secondary ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${negative ? (trendUp ? "text-destructive" : "text-success") : (trendUp ? "text-success" : "text-destructive")}`}>
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{animatedValue}{suffix}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
};

export default StatCard;
