import React, { useState } from 'react';
import { ChevronDown, ChevronRight, SlidersHorizontal, Sun } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ProductFocusShotConfig,
  ProductFocusAngle,
  ProductFocusLighting,
  productFocusAngleOptions,
  productFocusLightingOptions,
} from './shotTypeConfigs';

interface ProductFocusConfiguratorProps {
  config: ProductFocusShotConfig;
  onConfigChange: (updates: Partial<ProductFocusShotConfig>) => void;
}

export function ProductFocusConfigurator({ config, onConfigChange }: ProductFocusConfiguratorProps) {
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
            {/* Camera Angle */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Camera Angle</label>
              <Select 
                value={config.cameraAngle} 
                onValueChange={(v) => onConfigChange({ cameraAngle: v as ProductFocusAngle })}
              >
                <SelectTrigger className="bg-muted/50 border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productFocusAngleOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lighting */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sun className="w-3 h-3" />
                Lighting
              </label>
              <Select 
                value={config.lighting} 
                onValueChange={(v) => onConfigChange({ lighting: v as ProductFocusLighting })}
              >
                <SelectTrigger className="bg-muted/50 border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productFocusLightingOptions.map(opt => (
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
}
