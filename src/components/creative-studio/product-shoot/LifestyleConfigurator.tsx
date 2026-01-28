import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  LifestyleShotConfig,
  LifestylePose,
  LifestyleTrouserStyle,
  LifestyleTopStyle,
  LifestyleOutfitColor,
  ModelGender,
  lifestylePoseOptions,
  lifestyleTrouserStyleOptions,
  lifestyleTopStyleOptions,
  lifestyleOutfitColorOptions,
  genderOptions,
} from "./shotTypeConfigs";
import { ethnicityOptions } from "./types";

interface LifestyleConfiguratorProps {
  config: LifestyleShotConfig;
  onConfigChange: (updates: Partial<LifestyleShotConfig>) => void;
}

export const LifestyleConfigurator = ({
  config,
  onConfigChange,
}: LifestyleConfiguratorProps) => {
  return (
    <div className="space-y-4 mt-4 p-4 rounded-xl bg-muted/30 border border-border/50">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Full Body Shot Options
      </div>
      
      {/* Model Gender */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Gender</label>
        <Select
          value={config.gender}
          onValueChange={(value) => onConfigChange({ gender: value as ModelGender })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            {genderOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model Ethnicity */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Ethnicity / Diversity</label>
        <Select
          value={config.ethnicity}
          onValueChange={(value) => onConfigChange({ ethnicity: value })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select ethnicity" />
          </SelectTrigger>
          <SelectContent>
            {ethnicityOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      {/* Pose */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Pose</label>
        <Select
          value={config.pose}
          onValueChange={(value) => onConfigChange({ pose: value as LifestylePose })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select pose" />
          </SelectTrigger>
          <SelectContent>
            {lifestylePoseOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Poses are natural and commercially realistic — never exaggerated
        </p>
      </div>

      <Separator className="my-4" />

      {/* Trouser Style */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Trouser Style</label>
        <Select
          value={config.trouserStyle}
          onValueChange={(value) => onConfigChange({ trouserStyle: value as LifestyleTrouserStyle })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            {lifestyleTrouserStyleOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Top Style */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Top / Upper Body</label>
        <Select
          value={config.topStyle}
          onValueChange={(value) => onConfigChange({ topStyle: value as LifestyleTopStyle })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            {lifestyleTopStyleOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Outfit Color */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Color Palette</label>
        <Select
          value={config.outfitColor}
          onValueChange={(value) => onConfigChange({ outfitColor: value as LifestyleOutfitColor })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select color" />
          </SelectTrigger>
          <SelectContent>
            {lifestyleOutfitColorOptions.map(opt => (
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
          <li>• Full body, head cropped, shoulders to feet</li>
          <li>• Pure white seamless studio background</li>
          <li>• Product integrity preserved exactly</li>
          <li>• Clean studio lighting with soft shadows</li>
          <li>• No logos, graphics, or bold textures on clothing</li>
        </ul>
      </div>
    </div>
  );
};
