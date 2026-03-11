import React from 'react';
import { Check } from 'lucide-react';
import { ProductShotType } from './shotTypeConfigs';

// Import example images
import productFocusImg from '@/assets/shot-references/product-focus.jpg';
import productOnModelImg from '@/assets/shot-references/product-on-model.jpg';
import onFootShoeImg from '@/assets/shot-references/on-foot-shoe-focus.jpg';

export interface VisualShotType {
  id: ProductShotType;
  name: string;
  description: string;
  exampleImage: string | null;
  promptHint: string;
  hasExtraConfig?: boolean; // Indicates shot type has additional options
}

export const visualShotTypes: VisualShotType[] = [
  {
    id: 'product-focus',
    name: 'Product Focus',
    description: 'Close-up, no model',
    exampleImage: productFocusImg,
    promptHint: 'product only, detailed close-up, no model, studio lighting, clean background',
    hasExtraConfig: true, // Has ProductFocusConfigurator
  },
  {
    id: 'on-foot',
    name: 'On Foot - Shoe Focus',
    description: 'Leg-down, product as hero',
    exampleImage: onFootShoeImg,
    // This is a simplified hint - the full prompt is built by buildOnFootPrompt()
    promptHint: 'leg-down product shot, mid-calf to floor framing, both feet fully visible and grounded, three-quarter side view, eye-level to slightly low camera, premium footwear e-commerce photography, ultra-sharp focus on footwear, clean diffused studio light, soft contact shadows',
    hasExtraConfig: true,
  },
  {
    id: 'lifestyle',
    name: 'Full Body on Model',
    description: 'Full outfit with product',
    exampleImage: productOnModelImg,
    promptHint: 'full body fashion shot, lifestyle, product visible, editorial style',
    hasExtraConfig: true, // Has LifestyleConfigurator
  },
];

interface ShotTypeVisualSelectorProps {
  selectedType: ProductShotType;
  onSelect: (type: ProductShotType) => void;
}

export function ShotTypeVisualSelector({ selectedType, onSelect }: ShotTypeVisualSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {visualShotTypes.map((shot) => (
        <button
          key={shot.id}
          type="button"
          onClick={() => onSelect(shot.id)}
          className={`relative rounded-xl overflow-hidden border-2 transition-all text-left ${
            selectedType === shot.id
              ? 'border-accent ring-2 ring-accent/30'
              : 'border-border hover:border-accent/40'
          }`}
        >
          {/* Example Image */}
          <div className="aspect-[4/5] bg-muted">
            {shot.exampleImage ? (
              <img
                src={shot.exampleImage}
                alt={shot.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <span className="text-4xl">📷</span>
                <span className="text-xs">Coming soon</span>
              </div>
            )}
          </div>

          {/* Label Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 pt-8">
            <div className="font-medium text-white text-sm">{shot.name}</div>
            <div className="text-xs text-white/70">{shot.description}</div>
          </div>

          {/* Selected Checkmark */}
          {selectedType === shot.id && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
