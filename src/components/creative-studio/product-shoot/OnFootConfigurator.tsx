import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  OnFootShotConfig,
  PoseVariation,
  LegStyling,
  TrouserColor,
  poseVariationOptions,
  legStylingOptions,
  trouserColorOptions,
} from "./shotTypeConfigs";

interface OnFootConfiguratorProps {
  config: OnFootShotConfig;
  onConfigChange: (updates: Partial<OnFootShotConfig>) => void;
}

export const OnFootConfigurator = ({
  config,
  onConfigChange,
}: OnFootConfiguratorProps) => {
  return (
    <div className="space-y-4 mt-4 p-4 rounded-xl bg-muted/30 border border-border/50">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        On-Foot Shot Options
      </div>
      
      {/* Pose Variation */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Pose Variation</label>
        <Select
          value={config.poseVariation}
          onValueChange={(value) => onConfigChange({ poseVariation: value as PoseVariation })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select pose" />
          </SelectTrigger>
          <SelectContent>
            {poseVariationOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          All poses keep both feet fully grounded — no walking or fashion posing
        </p>
      </div>

      {/* Leg Styling */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Leg Styling</label>
        <Select
          value={config.legStyling}
          onValueChange={(value) => onConfigChange({ legStyling: value as LegStyling })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select leg style" />
          </SelectTrigger>
          <SelectContent>
            {legStylingOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Trouser Color */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Trouser/Pants Color</label>
        <Select
          value={config.trouserColor}
          onValueChange={(value) => onConfigChange({ trouserColor: value as TrouserColor })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select color" />
          </SelectTrigger>
          <SelectContent>
            {trouserColorOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Static Rules Reminder */}
      <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
        <div className="text-xs font-medium text-accent mb-1">Always Enforced</div>
        <ul className="text-xs text-muted-foreground space-y-0.5">
          <li>• Mid-calf to floor framing, both feet visible</li>
          <li>• Three-quarter side view, eye-level camera</li>
          <li>• Product integrity preserved exactly</li>
          <li>• Clean studio lighting with soft shadows</li>
        </ul>
      </div>
    </div>
  );
};
