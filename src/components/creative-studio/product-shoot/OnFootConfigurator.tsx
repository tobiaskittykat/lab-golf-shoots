import { useState } from "react";
import { ChevronDown, ChevronRight, SlidersHorizontal } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  OnFootShotConfig,
  PoseVariation,
  LegStyling,
  TrouserColor,
  ModelGender,
  poseVariationOptions,
  legStylingOptions,
  trouserColorOptions,
  genderOptions,
} from "./shotTypeConfigs";
import { ethnicityOptions } from "./types";

interface OnFootConfiguratorProps {
  config: OnFootShotConfig;
  onConfigChange: (updates: Partial<OnFootShotConfig>) => void;
}

export const OnFootConfigurator = ({
  config,
  onConfigChange,
}: OnFootConfiguratorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4 rounded-xl bg-muted/30 border border-border/50 overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <SlidersHorizontal className="w-4 h-4 text-accent" />
            Shot Options
          </div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-0 space-y-4">
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
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
