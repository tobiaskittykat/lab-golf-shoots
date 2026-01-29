import React from 'react';
import { Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductFocusAngle, productFocusAngleOptions } from './shotTypeConfigs';

// Import angle thumbnails
import angleHero from '@/assets/product-angles/angle-hero.jpg';
import angleSideProfile from '@/assets/product-angles/angle-side-profile.jpg';
import angleTopDown from '@/assets/product-angles/angle-top-down.jpg';
import angleSole from '@/assets/product-angles/angle-sole.jpg';
import angleDetail from '@/assets/product-angles/angle-detail.jpg';
import anglePair from '@/assets/product-angles/angle-pair.jpg';
import angleLifestyle from '@/assets/product-angles/angle-lifestyle.jpg';

// Map thumbnail filenames to imports
const thumbnailMap: Record<string, string> = {
  'angle-hero.jpg': angleHero,
  'angle-side-profile.jpg': angleSideProfile,
  'angle-top-down.jpg': angleTopDown,
  'angle-sole.jpg': angleSole,
  'angle-detail.jpg': angleDetail,
  'angle-pair.jpg': anglePair,
  'angle-lifestyle.jpg': angleLifestyle,
};

interface CameraAngleSelectorProps {
  value: ProductFocusAngle;
  onChange: (value: ProductFocusAngle) => void;
}

export function CameraAngleSelector({ value, onChange }: CameraAngleSelectorProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground">Camera Angle</label>
      <div className="flex gap-1">
        {productFocusAngleOptions.map((option) => {
          const isSelected = value === option.value;
          const thumbnailSrc = option.thumbnail ? thumbnailMap[option.thumbnail] : null;
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "relative flex flex-col items-center rounded border transition-all overflow-hidden flex-1 min-w-0",
                "hover:border-accent/50 hover:bg-accent/5",
                isSelected 
                  ? "border-accent bg-accent/10 ring-1 ring-accent/30" 
                  : "border-border/40 bg-muted/20"
              )}
            >
              {/* Thumbnail or icon */}
              <div className="w-full aspect-square relative">
                {thumbnailSrc ? (
                  <img 
                    src={thumbnailSrc} 
                    alt={option.label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/50">
                    <Grid3X3 className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}
                
                {/* Selection indicator overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-accent/10 pointer-events-none" />
                )}
              </div>
              
              {/* Label */}
              <div className={cn(
                "w-full px-0.5 py-0.5 text-center text-[7px] font-medium truncate leading-tight",
                isSelected ? "text-accent" : "text-muted-foreground"
              )}>
                {option.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
