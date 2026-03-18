import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

const ChartCard = ({ title, subtitle, children, className = "" }: ChartCardProps) => (
  <div className={`glass-card-solid p-5 ${className}`}>
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    <div className="h-64">{children}</div>
  </div>
);

export default ChartCard;
