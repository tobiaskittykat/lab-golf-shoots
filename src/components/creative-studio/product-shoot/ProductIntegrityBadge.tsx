import { Check, AlertTriangle, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { ProductIntegrityResult } from "./types";

interface ProductIntegrityBadgeProps {
  result?: ProductIntegrityResult;
  isAnalyzing?: boolean;
  onRegenerate?: () => void;
  compact?: boolean;
}

export const ProductIntegrityBadge = ({
  result,
  isAnalyzing = false,
  onRegenerate,
  compact = false,
}: ProductIntegrityBadgeProps) => {
  // Loading state
  if (isAnalyzing) {
    return (
      <div className={`flex items-center gap-1.5 ${compact ? '' : 'px-2 py-1'} rounded-full bg-muted/80`}>
        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
        {!compact && <span className="text-xs text-muted-foreground">Analyzing...</span>}
      </div>
    );
  }

  // No result yet
  if (!result || !result.analyzed) {
    return null;
  }

  const { score, issues, passesCheck } = result;

  // Determine badge style based on score
  let badgeClass = '';
  let Icon = Check;
  let label = 'Good';

  if (score >= 80) {
    badgeClass = 'bg-green-100 text-green-700 border-green-200';
    Icon = Check;
    label = 'Excellent';
  } else if (score >= 60) {
    badgeClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
    Icon = AlertTriangle;
    label = 'Fair';
  } else {
    badgeClass = 'bg-red-100 text-red-700 border-red-200';
    Icon = XCircle;
    label = 'Issues';
  }

  const badge = (
    <div className={`flex items-center gap-1.5 ${compact ? 'p-1' : 'px-2 py-1'} rounded-full border ${badgeClass}`}>
      <Icon className="w-3.5 h-3.5" />
      {!compact && (
        <>
          <span className="text-xs font-medium">{score}</span>
          <span className="text-xs">{label}</span>
        </>
      )}
    </div>
  );

  // If there are issues, show tooltip with details
  if (issues.length > 0 || !passesCheck) {
    return (
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <div className="font-medium text-sm">Product Integrity: {score}/100</div>
              {issues.length > 0 && (
                <ul className="text-xs space-y-0.5">
                  {issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-yellow-500">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
        
        {onRegenerate && !passesCheck && (
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs hover:bg-accent/20 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Regenerate
          </button>
        )}
      </div>
    );
  }

  return badge;
};
