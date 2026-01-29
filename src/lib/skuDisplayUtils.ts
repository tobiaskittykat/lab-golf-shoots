/**
 * SKU Display Utilities
 * Parses product SKU names and descriptions to extract structured display info
 */

export interface SKUDisplayInfo {
  brandName: string;
  modelName: string;
  material: string;
  color: string;
  productType: string;
  fullName: string;
}

// Known footwear brands for parsing
const KNOWN_BRANDS = ['birkenstock', 'nike', 'adidas', 'vans', 'converse', 'new balance', 'puma', 'reebok'];

// Known product types
const PRODUCT_TYPES = ['clog', 'clogs', 'sandal', 'sandals', 'boot', 'boots', 'shoe', 'shoes', 'sneaker', 'sneakers', 'slipper', 'slippers', 'mule', 'mules', 'loafer', 'loafers'];

// Known materials
const MATERIALS = ['suede', 'leather', 'eva', 'canvas', 'nubuck', 'shearling', 'wool', 'cork', 'rubber', 'mesh', 'knit', 'nylon', 'synthetic'];

// Known colors
const COLORS = ['taupe', 'brown', 'black', 'white', 'gray', 'grey', 'beige', 'tan', 'navy', 'blue', 'red', 'green', 'pink', 'tobacco', 'mocha', 'sand', 'stone', 'cream', 'olive', 'burgundy', 'cognac'];

interface SKUDescription {
  colors?: string[];
  materials?: string[];
  product_type?: string;
  style_keywords?: string[];
  hardware_finish?: string;
  summary?: string;
}

/**
 * Parse a SKU name and optional description JSONB to extract display attributes
 */
export function parseSkuDisplayInfo(
  name: string,
  description?: SKUDescription | null
): SKUDisplayInfo {
  const words = name.split(/\s+/);
  const lowerWords = words.map(w => w.toLowerCase());
  
  // Default result using full name
  const result: SKUDisplayInfo = {
    brandName: '',
    modelName: name,
    material: '',
    color: '',
    productType: '',
    fullName: name,
  };
  
  if (words.length < 2) {
    return result;
  }
  
  // Try to identify brand (first word if it's a known brand)
  const firstWordLower = lowerWords[0];
  const isKnownBrand = KNOWN_BRANDS.some(brand => 
    firstWordLower === brand || firstWordLower.startsWith(brand)
  );
  
  if (isKnownBrand) {
    result.brandName = words[0];
  }
  
  // Try to identify product type (usually last word)
  const lastWordLower = lowerWords[lowerWords.length - 1];
  if (PRODUCT_TYPES.includes(lastWordLower)) {
    result.productType = words[words.length - 1];
  }
  
  // Model name is typically the second word if we have a brand
  if (result.brandName && words.length >= 2) {
    result.modelName = words[1];
  }
  
  // Extract color and material from description JSONB if available
  if (description) {
    if (description.colors && description.colors.length > 0) {
      result.color = capitalizeFirst(description.colors[0]);
    }
    if (description.materials && description.materials.length > 0) {
      result.material = capitalizeFirst(description.materials[0]);
    }
    if (description.product_type) {
      result.productType = capitalizeFirst(description.product_type);
    }
  }
  
  // Fallback: try to extract color and material from name if not found in description
  if (!result.color || !result.material) {
    const middleWords = words.slice(
      result.brandName ? 2 : 1, 
      result.productType ? -1 : undefined
    );
    
    for (const word of middleWords) {
      const lower = word.toLowerCase();
      if (!result.color && COLORS.includes(lower)) {
        result.color = word;
      } else if (!result.material && MATERIALS.includes(lower)) {
        result.material = word;
      }
    }
  }
  
  return result;
}

/**
 * Format SKU display info as a single line subtitle
 * Example: "Birkenstock • Taupe Suede"
 */
export function formatSkuSubtitle(info: SKUDisplayInfo): string {
  const parts: string[] = [];
  
  if (info.brandName) {
    parts.push(info.brandName);
  }
  
  const attributes: string[] = [];
  if (info.color) attributes.push(info.color);
  if (info.material) attributes.push(info.material);
  
  if (attributes.length > 0) {
    parts.push(attributes.join(' '));
  }
  
  return parts.join(' • ');
}

/**
 * Get a compact display string for thumbnails
 * Returns color + material (e.g., "Taupe Suede")
 */
export function formatSkuAttributes(info: SKUDisplayInfo): string {
  const parts: string[] = [];
  if (info.color) parts.push(info.color);
  if (info.material) parts.push(info.material);
  return parts.join(' ');
}

function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
