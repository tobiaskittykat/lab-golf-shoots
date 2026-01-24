import { useState, useEffect } from 'react';
import { Tag, AlertCircle, Check } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { CustomizationSection } from './CustomizationSection';
import { LogoPlacement, LogoPosition } from '@/lib/imageCompositing';
import { useBrandImages, BrandImage } from '@/hooks/useBrandImages';
import { cn } from '@/lib/utils';

interface BrandingSectionProps {
  logoPlacement: LogoPlacement;
  onUpdate: (updates: Partial<LogoPlacement>) => void;
}

const positionOptions: { value: LogoPosition; label: string; shortLabel: string }[] = [
  { value: 'top-left', label: 'Top Left', shortLabel: 'TL' },
  { value: 'top-right', label: 'Top Right', shortLabel: 'TR' },
  { value: 'center', label: 'Center', shortLabel: 'C' },
  { value: 'bottom-left', label: 'Bottom Left', shortLabel: 'BL' },
  { value: 'bottom-right', label: 'Bottom Right', shortLabel: 'BR' },
];

export const BrandingSection = ({ logoPlacement, onUpdate }: BrandingSectionProps) => {
  const { images, fetchImages, isLoading } = useBrandImages();
  const [logoImage, setLogoImage] = useState<BrandImage | null>(null);

  // Fetch brand images on mount
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Find logo image
  useEffect(() => {
    const logo = images.find(img => img.category === 'logo');
    setLogoImage(logo || null);
  }, [images]);

  const hasLogo = !!logoImage;

  return (
    <CustomizationSection
      title="Branding"
      icon={<Tag className="w-4 h-4" />}
      defaultOpen={false}
    >
      <div className="space-y-5">
        {/* Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Add logo to images</label>
            <p className="text-xs text-muted-foreground">
              Overlay your brand logo on generated images
            </p>
          </div>
          <Switch
            checked={logoPlacement.enabled}
            onCheckedChange={(checked) => onUpdate({ enabled: checked })}
            disabled={!hasLogo}
          />
        </div>

        {/* No logo warning */}
        {!hasLogo && !isLoading && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-warning mb-1">No logo uploaded yet</p>
              <p>
                Go to <span className="font-medium">Brand → Brand DNA</span> tab to upload your logo.
              </p>
            </div>
          </div>
        )}

        {/* Logo preview and settings - only show when logo exists */}
        {hasLogo && (
          <>
            {/* Logo preview */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Your brand logo</label>
              <div className="max-w-[120px] h-16 rounded-lg border border-border bg-secondary/30 overflow-hidden flex items-center justify-center">
                <img
                  src={logoImage.image_url}
                  alt="Brand logo"
                  className="w-auto h-full max-w-full object-contain p-1"
                />
              </div>
            </div>

            {/* Position selector */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Position</label>
              <div className="flex gap-1.5">
                {positionOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onUpdate({ position: option.value })}
                    className={cn(
                      "flex-1 py-2 px-2 text-xs font-medium rounded-lg border transition-all",
                      logoPlacement.position === option.value
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-secondary/50 border-border hover:bg-secondary text-muted-foreground"
                    )}
                    title={option.label}
                  >
                    {option.shortLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* Size slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Size</label>
                <span className="text-xs font-medium">{logoPlacement.sizePercent}%</span>
              </div>
              <Slider
                value={[logoPlacement.sizePercent]}
                onValueChange={([value]) => onUpdate({ sizePercent: value })}
                min={5}
                max={25}
                step={1}
                className="w-full"
              />
            </div>

            {/* Opacity slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Opacity</label>
                <span className="text-xs font-medium">{logoPlacement.opacity}%</span>
              </div>
              <Slider
                value={[logoPlacement.opacity]}
                onValueChange={([value]) => onUpdate({ opacity: value })}
                min={20}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Preview hint */}
            {logoPlacement.enabled && (
              <div className="flex items-center gap-2 text-xs text-accent">
                <Check className="w-3.5 h-3.5" />
                Logo will be applied to generated images
              </div>
            )}
          </>
        )}
      </div>
    </CustomizationSection>
  );
};
