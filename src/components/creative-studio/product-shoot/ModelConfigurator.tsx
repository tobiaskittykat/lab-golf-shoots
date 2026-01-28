import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ModelConfig, ModelGender, ModelClothing, ethnicityOptions } from "./types";

interface ModelConfiguratorProps {
  config: ModelConfig;
  onConfigChange: (config: Partial<ModelConfig>) => void;
  showModelOptions?: boolean; // Some shot types don't need a model
}

const genderOptions: { value: ModelGender; label: string }[] = [
  { value: 'auto', label: 'Auto / Brand Default' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'nonbinary', label: 'Non-binary' },
];

const clothingOptions: { value: ModelClothing; label: string }[] = [
  { value: 'auto', label: 'Auto / On-brand' },
  { value: 'casual', label: 'Casual' },
  { value: 'smart-casual', label: 'Smart Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'athletic', label: 'Athletic / Sporty' },
  { value: 'bohemian', label: 'Bohemian' },
];

export const ModelConfigurator = ({
  config,
  onConfigChange,
  showModelOptions = true,
}: ModelConfiguratorProps) => {
  if (!showModelOptions) {
    return (
      <div className="p-4 rounded-xl bg-muted/50 text-center">
        <p className="text-sm text-muted-foreground">
          No model needed for this shot type
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Use brand defaults toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
        <div>
          <div className="font-medium text-foreground">Use on-brand defaults</div>
          <div className="text-xs text-muted-foreground">
            Auto-apply brand guidelines for model styling
          </div>
        </div>
        <Switch
          checked={config.useOnBrandDefaults}
          onCheckedChange={(checked) => onConfigChange({ useOnBrandDefaults: checked })}
        />
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Gender</label>
        <Select
          value={config.gender}
          onValueChange={(value) => onConfigChange({ gender: value as ModelGender })}
          disabled={config.useOnBrandDefaults}
        >
          <SelectTrigger className={config.useOnBrandDefaults ? 'opacity-50' : ''}>
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

      {/* Ethnicity */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Ethnicity / Diversity</label>
        <Select
          value={config.ethnicity}
          onValueChange={(value) => onConfigChange({ ethnicity: value })}
          disabled={config.useOnBrandDefaults}
        >
          <SelectTrigger className={config.useOnBrandDefaults ? 'opacity-50' : ''}>
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

      {/* Clothing Style */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Clothing Style</label>
        <Select
          value={config.clothing}
          onValueChange={(value) => onConfigChange({ clothing: value as ModelClothing })}
          disabled={config.useOnBrandDefaults}
        >
          <SelectTrigger className={config.useOnBrandDefaults ? 'opacity-50' : ''}>
            <SelectValue placeholder="Select clothing style" />
          </SelectTrigger>
          <SelectContent>
            {clothingOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {config.useOnBrandDefaults && (
        <p className="text-xs text-muted-foreground text-center">
          Model settings will be determined by your Brand Brain configuration
        </p>
      )}
    </div>
  );
};
