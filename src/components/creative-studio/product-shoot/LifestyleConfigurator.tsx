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
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
