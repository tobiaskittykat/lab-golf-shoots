import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ProductFocusShotConfig,
  ProductFocusAngle,
  ProductFocusLighting,
  productFocusAngleOptions,
  productFocusLightingOptions,
} from './shotTypeConfigs';
import { Camera, Sun, Info } from 'lucide-react';

interface ProductFocusConfiguratorProps {
  config: ProductFocusShotConfig;
  onConfigChange: (updates: Partial<ProductFocusShotConfig>) => void;
}

export function ProductFocusConfigurator({ config, onConfigChange }: ProductFocusConfiguratorProps) {
  return (
    <div className="mt-4 space-y-4 p-4 rounded-xl bg-muted/30 border border-border/50">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Camera className="w-4 h-4 text-accent" />
        Product Focus Options
      </div>

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

      {/* Always Enforced Info */}
      <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="font-medium text-foreground">Always Enforced</div>
            <ul className="space-y-0.5">
              <li>• Product only, no model</li>
              <li>• Birkenstock integrity preserved</li>
              <li>• Ultra-sharp focus on product</li>
              <li>• Professional e-commerce quality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
