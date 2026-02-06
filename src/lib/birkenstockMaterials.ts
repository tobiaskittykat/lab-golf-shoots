/**
 * Birkenstock Material & Color Reference Library
 * Curated options for shoe component customization
 */

// Material option interface with category support
export interface MaterialOption {
  value: string;
  label: string;
  category?: string;
}

// Materials organized by component type with categories for UI grouping
export const COMPONENT_MATERIALS: Record<string, MaterialOption[]> = {
  upper: [
    // Natural Leathers
    { value: 'Oiled Leather', label: 'Oiled Leather', category: 'Natural Leathers' },
    { value: 'Smooth Leather', label: 'Smooth Leather', category: 'Natural Leathers' },
    { value: 'Nubuck', label: 'Nubuck (Leather)', category: 'Natural Leathers' },
    { value: 'Suede', label: 'Suede', category: 'Natural Leathers' },
    { value: 'Patent Leather', label: 'Patent Leather', category: 'Natural Leathers' },
    { value: 'Shearling', label: 'Shearling', category: 'Natural Leathers' },
    // Birkenstock Synthetics
    { value: 'Birko-Flor', label: 'Birko-Flor (Smooth)', category: 'Synthetics' },
    { value: 'Birko-Flor Nubuck', label: 'Birko-Flor Nubuck', category: 'Synthetics' },
    { value: 'Birko-Flor Patent', label: 'Birko-Flor Patent', category: 'Synthetics' },
    { value: 'Birkibuc', label: 'Birkibuc', category: 'Synthetics' },
    { value: 'EVA', label: 'EVA (Molded)', category: 'Synthetics' },
    // Textiles
    { value: 'Wool Felt', label: 'Wool Felt', category: 'Textiles' },
    { value: 'Canvas', label: 'Canvas', category: 'Textiles' },
    { value: 'Fabric', label: 'Fabric (Woven)', category: 'Textiles' },
    { value: 'Mesh', label: 'Mesh (Breathable)', category: 'Textiles' },
    { value: 'Recycled PET', label: 'Recycled PET (Eco)', category: 'Textiles' },
  ],
  footbed: [
    { value: 'Cork-Latex', label: 'Cork-Latex (Original)', category: 'Standard' },
    { value: 'Soft Footbed', label: 'Soft Footbed (Blue Label)', category: 'Standard' },
    { value: 'EVA', label: 'EVA', category: 'Standard' },
    { value: 'Exquisite', label: 'Exquisite (Leather-Wrapped)', category: 'Premium' },
  ],
  sole: [
    { value: 'EVA', label: 'EVA (Standard)', category: 'Standard' },
    { value: 'Rubber', label: 'Rubber', category: 'Standard' },
    { value: 'Polyurethane', label: 'Polyurethane (PU)', category: 'Standard' },
    { value: 'Cork', label: 'Cork', category: 'Premium' },
  ],
  buckles: [
    // Metal finishes
    { value: 'Metal (Brass)', label: 'Metal (Brass/Gold)', category: 'Metal' },
    { value: 'Metal (Silver)', label: 'Metal (Silver)', category: 'Metal' },
    { value: 'Metal (Copper)', label: 'Metal (Copper)', category: 'Metal' },
    { value: 'Metal (Rose Gold)', label: 'Metal (Rose Gold)', category: 'Metal' },
    { value: 'Antique Brass', label: 'Antique Brass', category: 'Metal' },
    // Plastic finishes
    { value: 'Matte Plastic', label: 'Matte Plastic', category: 'Plastic' },
    { value: 'Matte Plastic (Coordinated)', label: 'Matte Plastic (Color-Matched)', category: 'Plastic' },
    // Translucent/Big Buckle options
    { value: 'Translucent', label: 'Translucent (Clear)', category: 'Special' },
    { value: 'Translucent Rose Gold', label: 'Translucent (Rose Gold)', category: 'Special' },
    { value: 'Metallic Rose Gold', label: 'Metallic (Rose Gold Big Buckle)', category: 'Special' },
  ],
  heelstrap: [
    { value: 'Suede', label: 'Suede', category: 'Natural Leathers' },
    { value: 'Oiled Leather', label: 'Oiled Leather', category: 'Natural Leathers' },
    { value: 'Smooth Leather', label: 'Smooth Leather', category: 'Natural Leathers' },
    { value: 'Nubuck', label: 'Nubuck', category: 'Natural Leathers' },
    { value: 'Birko-Flor', label: 'Birko-Flor', category: 'Synthetics' },
    { value: 'Birko-Flor Nubuck', label: 'Birko-Flor Nubuck', category: 'Synthetics' },
  ],
  lining: [
    { value: 'Shearling (Cream)', label: 'Shearling (Cream)', category: 'Shearling' },
    { value: 'Shearling (Black)', label: 'Shearling (Black)', category: 'Shearling' },
    { value: 'Suede', label: 'Suede', category: 'Standard' },
    { value: 'Wool Felt', label: 'Wool Felt', category: 'Standard' },
    { value: 'Microfiber', label: 'Microfiber', category: 'Standard' },
    { value: 'EVA', label: 'EVA (Molded)', category: 'Standard' },
  ],
};

// Color presets based on Birkenstock's actual color palette
export const COLOR_PRESETS = [
  { name: 'Taupe', hex: '#B8A99A', category: 'neutral' },
  { name: 'Tobacco', hex: '#6F4E37', category: 'brown' },
  { name: 'Mocha', hex: '#967969', category: 'brown' },
  { name: 'Stone', hex: '#928E85', category: 'neutral' },
  { name: 'Black', hex: '#1C1C1C', category: 'basic' },
  { name: 'Habana', hex: '#5C4033', category: 'brown' },
  { name: 'Cognac', hex: '#834C24', category: 'brown' },
  { name: 'Sand', hex: '#C2B280', category: 'neutral' },
  { name: 'White', hex: '#FFFFFF', category: 'basic' },
  { name: 'Navy', hex: '#1E3A5F', category: 'color' },
  { name: 'Antique White', hex: '#FAEBD7', category: 'neutral' },
  { name: 'Chocolate', hex: '#3D2314', category: 'brown' },
  { name: 'Cork Brown', hex: '#8B7355', category: 'brown' },
  { name: 'Cream', hex: '#FFFDD0', category: 'neutral' },
  { name: 'Anthracite', hex: '#383838', category: 'basic' },
  { name: 'Desert Soil', hex: '#A67B5B', category: 'brown' },
  { name: 'Iron', hex: '#48494B', category: 'basic' },
  { name: 'Mink', hex: '#81715E', category: 'neutral' },
  { name: 'Port', hex: '#6C3461', category: 'color' },
  { name: 'Thyme', hex: '#6B8E4E', category: 'color' },
  // Summer/fabric colorways
  { name: 'Apricot', hex: '#E6A57E', category: 'color' },
  { name: 'Coral', hex: '#FF7F50', category: 'color' },
  { name: 'Peach', hex: '#FFDAB9', category: 'color' },
  // Metallic/Special
  { name: 'Rose Gold', hex: '#B76E79', category: 'metallic' },
  { name: 'Blush', hex: '#DE98AB', category: 'color' },
] as const;

// Component type definitions
export type ComponentType = 'upper' | 'footbed' | 'sole' | 'buckles' | 'heelstrap' | 'lining';

export interface ShoeComponent {
  material: string;
  color: string;
  colorHex?: string;
  confidence: number;
  notes?: string;
}

export interface ShoeComponents {
  upper: ShoeComponent;
  footbed: ShoeComponent;
  sole: ShoeComponent;
  buckles?: ShoeComponent | null;
  heelstrap?: ShoeComponent | null;
  lining?: ShoeComponent | null;
  analyzedAt?: string;
  analysisVersion?: string;
}

export interface ComponentOverride {
  material: string;
  color: string;
  colorHex?: string;
}

export type ComponentOverrides = Partial<Record<ComponentType, ComponentOverride>>;

// Helper to get materials for a component type
export function getMaterialsForComponent(type: ComponentType): MaterialOption[] {
  return COMPONENT_MATERIALS[type] || [];
}

// Helper to find a color preset by name or hex
export function findColorPreset(colorOrHex: string) {
  const lower = colorOrHex.toLowerCase();
  return COLOR_PRESETS.find(
    c => c.name.toLowerCase() === lower || c.hex.toLowerCase() === lower
  );
}

// Helper to check if any overrides are set
export function hasAnyOverrides(overrides: ComponentOverrides | undefined, original: ShoeComponents | null): boolean {
  if (!overrides || !original) return false;
  
  const componentTypes: ComponentType[] = ['upper', 'footbed', 'sole', 'buckles', 'heelstrap', 'lining'];
  
  for (const type of componentTypes) {
    const override = overrides[type];
    const originalComponent = original[type];
    
    if (!override || !originalComponent) continue;
    
    if (
      override.material !== originalComponent.material ||
      override.color !== originalComponent.color
    ) {
      return true;
    }
  }
  
  return false;
}

// Helper to get a descriptive color name from override data (resolves "Custom" to hex)
function getColorDescription(override: { color: string; colorHex?: string }): string {
  if (override.color !== 'Custom' && override.color !== 'custom') {
    return override.color;
  }
  if (!override.colorHex) {
    return override.color;
  }
  const hex = override.colorHex.toUpperCase();
  const colorNames: Record<string, string> = {
    '#FF69B4': 'Hot Pink',
    '#FF1493': 'Deep Pink',
    '#FFC0CB': 'Pink',
    '#FFB6C1': 'Light Pink',
    '#FF0000': 'Red',
    '#00FF00': 'Lime Green',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#FFA500': 'Orange',
    '#800080': 'Purple',
    '#00FFFF': 'Cyan',
    '#000000': 'Black',
    '#FFFFFF': 'White',
  };
  const namedColor = colorNames[hex];
  return namedColor ? `${namedColor} (${hex})` : hex;
}

// Build override prompt section for image generation
export function buildComponentOverridePrompt(
  overrides: ComponentOverrides,
  original: ShoeComponents
): string {
  const lines: string[] = [];
  
  lines.push("=== PRODUCT COMPONENT OVERRIDES ===");
  lines.push("⚠️ IMPORTANT: The user has customized specific shoe components.");
  lines.push("Generate the product with THESE modifications while maintaining");
  lines.push("the original silhouette and proportions from reference images:");
  lines.push("");
  
  const componentTypes: ComponentType[] = ['upper', 'footbed', 'sole', 'buckles', 'heelstrap', 'lining'];
  
  for (const type of componentTypes) {
    const override = overrides[type];
    const originalComponent = original[type];
    
    if (!override) continue;
    
    const isChanged = !originalComponent ||
      override.material !== originalComponent.material ||
      override.color !== originalComponent.color;
    
    if (isChanged) {
      const colorDisplay = getColorDescription(override);
      lines.push(`${type.toUpperCase()}: ${override.material} in ${colorDisplay}`);
      if (originalComponent) {
        lines.push(`  (Original was: ${originalComponent.material} in ${originalComponent.color})`);
      }
    }
  }
  
  lines.push("");
  lines.push("Keep all OTHER components exactly as shown in reference images.");
  lines.push("The overall shoe silhouette/shape must remain unchanged.");
  
  return lines.join("\n");
}

// Component display labels
export const COMPONENT_LABELS: Record<ComponentType, string> = {
  upper: 'Upper',
  footbed: 'Footbed',
  sole: 'Sole',
  buckles: 'Buckles',
  heelstrap: 'Heel Strap',
  lining: 'Lining',
};
