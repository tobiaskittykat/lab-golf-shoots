import { Check, AlertTriangle, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface IntegrityDetails {
  colorMatch: { score: number; notes: string };
  silhouetteMatch: { score: number; notes: string };
  featureMatch: { score: number; notes: string };
  materialMatch: { score: number; notes: string };
}

export interface ProductIntegrityResult {
  score: number;
  issues: string[];
  passesCheck: boolean;
  analyzed?: boolean;
  analyzedAt?: string;
  details?: IntegrityDetails;
}

interface ProductIntegrityBadgeProps {
  result?: ProductIntegrityResult;
  isAnalyzing?: boolean;
  onRegenerate?: () => void;
  compact?: boolean;
}

export const ProductIntegrityBadge = ({ result, isAnalyzing = false, onRegenerate, compact = false }: ProductIntegrityBadgeProps) => {
  if (isAnalyzing) {
    return (
      <div className={`flex items-center gap-1.5 ${compact ? '' : 'px-2 py-1'} rounded-full bg-muted/80`}>
        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
        {!compact && <span className="text-xs text-muted-foreground">Analyzing...</span>}
      </div>
    );
  }
  if (!result) return null;

  const { score, issues, passesCheck, details } = result;
  let badgeClass = '', Icon = Check, label = 'Good';
  if (score >= 80) { badgeClass = 'bg-green-100 text-green-700 border-green-200'; Icon = Check; label = 'Excellent'; }
  else if (score >= 60) { badgeClass = 'bg-yellow-100 text-yellow-700 border-yellow-200'; Icon = AlertTriangle; label = 'Fair'; }
  else { badgeClass = 'bg-red-100 text-red-700 border-red-200'; Icon = XCircle; label = 'Issues'; }

  const badge = (
    <div className={`flex items-center gap-1.5 ${compact ? 'p-1' : 'px-2 py-1'} rounded-full border ${badgeClass}`}>
      <Icon className="w-3.5 h-3.5" />
      {!compact && (<><span className="text-xs font-medium">{score}</span><span className="text-xs">{label}</span></>)}
    </div>
  );

  if (issues.length > 0 || !passesCheck || details) {
    return (
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <div className="font-medium text-sm">Product Integrity: {score}/100</div>
              {details && (
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Color:</span><span className="font-medium">{details.colorMatch.score}%</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Shape:</span><span className="font-medium">{details.silhouetteMatch.score}%</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Features:</span><span className="font-medium">{details.featureMatch.score}%</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Materials:</span><span className="font-medium">{details.materialMatch.score}%</span></div>
                </div>
              )}
              {issues.length > 0 && (
                <ul className="text-xs space-y-0.5">
                  {issues.slice(0, 3).map((issue, i) => (<li key={i} className="flex items-start gap-1"><span className="text-yellow-500">•</span>{issue}</li>))}
                  {issues.length > 3 && <li className="text-muted-foreground">+{issues.length - 3} more issues</li>}
                </ul>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
        {onRegenerate && !passesCheck && (
          <button onClick={onRegenerate} className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs hover:bg-accent/20 transition-colors">
            <RefreshCw className="w-3 h-3" />Regenerate
          </button>
        )}
      </div>
    );
  }
  return badge;
};
