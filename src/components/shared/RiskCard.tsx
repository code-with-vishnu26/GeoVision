interface RiskCardProps {
  title: string;
  score: number;
  description: string;
  color?: string;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "bg-destructive";
  if (score >= 60) return "bg-warning";
  if (score >= 40) return "bg-primary";
  return "bg-success";
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Moderate";
  return "Low";
};

const RiskCard = ({ title, score, description }: RiskCardProps) => (
  <div className="glass-card-solid p-4 hover:glow-border transition-all duration-300">
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-sm font-medium text-foreground">{title}</h4>
      <span className={`text-xs px-2 py-0.5 rounded-full ${getScoreColor(score)}/20 text-foreground font-medium`}>
        {getScoreLabel(score)}
      </span>
    </div>
    <div className="flex items-center gap-3 mb-2">
      <span className="text-2xl font-bold text-foreground">{score}</span>
      <span className="text-xs text-muted-foreground">/100</span>
    </div>
    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
      <div className={`h-full rounded-full ${getScoreColor(score)} transition-all duration-1000`} style={{ width: `${score}%` }} />
    </div>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);

export default RiskCard;
