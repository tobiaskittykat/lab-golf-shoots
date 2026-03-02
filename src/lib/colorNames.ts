/**
 * Hex-to-Color-Name utility
 * Finds the nearest named color from an extended palette using weighted RGB distance.
 * Birkenstock brand colors take priority over generic CSS colors.
 */

// Brand-specific colors (checked first for priority)
const BRAND_COLORS: [string, string][] = [
  ['#B8A99A', 'Taupe'],
  ['#6F4E37', 'Tobacco'],
  ['#967969', 'Mocha'],
  ['#928E85', 'Stone'],
  ['#5C4033', 'Habana'],
  ['#834C24', 'Cognac'],
  ['#C2B280', 'Sand'],
  ['#FAEBD7', 'Antique White'],
  ['#3D2314', 'Chocolate'],
  ['#8B7355', 'Cork Brown'],
  ['#FFFDD0', 'Cream'],
  ['#383838', 'Anthracite'],
  ['#A67B5B', 'Desert Soil'],
  ['#48494B', 'Iron'],
  ['#81715E', 'Mink'],
  ['#6C3461', 'Port'],
  ['#6B8E4E', 'Thyme'],
  ['#E6A57E', 'Apricot'],
  ['#DE98AB', 'Blush'],
  ['#89CFF0', 'Baby Blue'],
  ['#87CEEB', 'Sky Blue'],
  ['#ADD8E6', 'Light Blue'],
  ['#B0E0E6', 'Powder Blue'],
  ['#4169E1', 'Royal Blue'],
  ['#8CA9BC', 'Dusty Blue'],
  ['#B76E79', 'Rose Gold'],
];

// Extended CSS named colors
const CSS_COLORS: [string, string][] = [
  // Reds
  ['#FF0000', 'Red'],
  ['#DC143C', 'Crimson'],
  ['#B22222', 'Firebrick'],
  ['#8B0000', 'Dark Red'],
  ['#CD5C5C', 'Indian Red'],
  ['#F08080', 'Light Coral'],
  ['#E9967A', 'Dark Salmon'],
  ['#FA8072', 'Salmon'],
  ['#FFA07A', 'Light Salmon'],
  // Pinks
  ['#FF69B4', 'Hot Pink'],
  ['#FF1493', 'Deep Pink'],
  ['#FFC0CB', 'Pink'],
  ['#FFB6C1', 'Light Pink'],
  ['#DB7093', 'Pale Violet Red'],
  ['#C71585', 'Medium Violet Red'],
  // Oranges
  ['#FFA500', 'Orange'],
  ['#FF8C00', 'Dark Orange'],
  ['#FF7F50', 'Coral'],
  ['#FF6347', 'Tomato'],
  ['#FF4500', 'Orange Red'],
  ['#FFDAB9', 'Peach'],
  // Yellows
  ['#FFFF00', 'Yellow'],
  ['#FFD700', 'Gold'],
  ['#FFA500', 'Orange'],
  ['#FFFFE0', 'Light Yellow'],
  ['#FFFACD', 'Lemon Chiffon'],
  ['#FAFAD2', 'Light Goldenrod'],
  ['#F0E68C', 'Khaki'],
  ['#BDB76B', 'Dark Khaki'],
  ['#EEE8AA', 'Pale Goldenrod'],
  // Greens
  ['#00FF00', 'Lime'],
  ['#008000', 'Green'],
  ['#006400', 'Dark Green'],
  ['#228B22', 'Forest Green'],
  ['#32CD32', 'Lime Green'],
  ['#90EE90', 'Light Green'],
  ['#98FB98', 'Pale Green'],
  ['#3CB371', 'Medium Sea Green'],
  ['#2E8B57', 'Sea Green'],
  ['#00FA9A', 'Medium Spring Green'],
  ['#00FF7F', 'Spring Green'],
  ['#556B2F', 'Dark Olive Green'],
  ['#6B8E23', 'Olive Drab'],
  ['#808000', 'Olive'],
  ['#9ACD32', 'Yellow Green'],
  ['#ADFF2F', 'Green Yellow'],
  ['#7CFC00', 'Lawn Green'],
  ['#66CDAA', 'Medium Aquamarine'],
  ['#8FBC8F', 'Dark Sea Green'],
  ['#20B2AA', 'Light Sea Green'],
  // Blues
  ['#0000FF', 'Blue'],
  ['#00008B', 'Dark Blue'],
  ['#0000CD', 'Medium Blue'],
  ['#000080', 'Navy'],
  ['#191970', 'Midnight Blue'],
  ['#1E90FF', 'Dodger Blue'],
  ['#6495ED', 'Cornflower Blue'],
  ['#4682B4', 'Steel Blue'],
  ['#5F9EA0', 'Cadet Blue'],
  ['#00BFFF', 'Deep Sky Blue'],
  ['#00CED1', 'Dark Turquoise'],
  ['#40E0D0', 'Turquoise'],
  ['#48D1CC', 'Medium Turquoise'],
  ['#AFEEEE', 'Pale Turquoise'],
  ['#7FFFD4', 'Aquamarine'],
  ['#00FFFF', 'Cyan'],
  ['#008B8B', 'Dark Cyan'],
  ['#008080', 'Teal'],
  ['#B0C4DE', 'Light Steel Blue'],
  // Purples
  ['#800080', 'Purple'],
  ['#8B008B', 'Dark Magenta'],
  ['#FF00FF', 'Magenta'],
  ['#EE82EE', 'Violet'],
  ['#DA70D6', 'Orchid'],
  ['#BA55D3', 'Medium Orchid'],
  ['#9932CC', 'Dark Orchid'],
  ['#8A2BE2', 'Blue Violet'],
  ['#9400D3', 'Dark Violet'],
  ['#DDA0DD', 'Plum'],
  ['#D8BFD8', 'Thistle'],
  ['#E6E6FA', 'Lavender'],
  ['#4B0082', 'Indigo'],
  ['#7B68EE', 'Medium Slate Blue'],
  ['#6A5ACD', 'Slate Blue'],
  ['#483D8B', 'Dark Slate Blue'],
  ['#663399', 'Rebecca Purple'],
  // Browns
  ['#A52A2A', 'Brown'],
  ['#8B4513', 'Saddle Brown'],
  ['#A0522D', 'Sienna'],
  ['#D2691E', 'Chocolate Brown'],
  ['#CD853F', 'Peru'],
  ['#DEB887', 'Burlywood'],
  ['#F4A460', 'Sandy Brown'],
  ['#D2B48C', 'Tan'],
  ['#BC8F8F', 'Rosy Brown'],
  ['#FFE4C4', 'Bisque'],
  ['#FFDEAD', 'Navajo White'],
  ['#F5DEB3', 'Wheat'],
  ['#DAA520', 'Goldenrod'],
  ['#B8860B', 'Dark Goldenrod'],
  // Neutrals
  ['#FFFFFF', 'White'],
  ['#000000', 'Black'],
  ['#808080', 'Gray'],
  ['#A9A9A9', 'Dark Gray'],
  ['#C0C0C0', 'Silver'],
  ['#D3D3D3', 'Light Gray'],
  ['#DCDCDC', 'Gainsboro'],
  ['#F5F5F5', 'White Smoke'],
  ['#F5F5DC', 'Beige'],
  ['#FFFFF0', 'Ivory'],
  ['#FAF0E6', 'Linen'],
  ['#FFF5EE', 'Seashell'],
  ['#FFF8DC', 'Cornsilk'],
  ['#FFFAF0', 'Floral White'],
  ['#F0FFF0', 'Honeydew'],
  ['#F5FFFA', 'Mint Cream'],
  ['#F0FFFF', 'Azure'],
  ['#F0F8FF', 'Alice Blue'],
  ['#FFF0F5', 'Lavender Blush'],
  ['#FFE4E1', 'Misty Rose'],
  ['#708090', 'Slate Gray'],
  ['#778899', 'Light Slate Gray'],
  ['#2F4F4F', 'Dark Slate Gray'],
  ['#696969', 'Dim Gray'],
  ['#FFEFD5', 'Papaya Whip'],
  ['#FFE4B5', 'Moccasin'],
  ['#FFDAB9', 'Peach Puff'],
];

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace(/^#/, '');
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ];
}

/** Weighted RGB distance (human-perception-adjusted) */
function colorDistance(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const dr = rgb1[0] - rgb2[0];
  const dg = rgb1[1] - rgb2[1];
  const db = rgb1[2] - rgb2[2];
  // Weighted: green most sensitive, red medium, blue least
  return Math.sqrt(0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db);
}

/**
 * Returns the nearest human-readable color name for a given hex code.
 * Brand-specific colors are checked first for priority matching.
 */
export function hexToColorName(hex: string): string {
  const normalized = hex.startsWith('#') ? hex.toUpperCase() : '#' + hex.toUpperCase();
  
  if (!/^#[0-9A-F]{6}$/.test(normalized)) return 'Custom';

  const inputRgb = hexToRgb(normalized);
  let bestName = 'Custom';
  let bestDist = Infinity;

  // Check brand colors first (priority)
  for (const [h, name] of BRAND_COLORS) {
    const dist = colorDistance(inputRgb, hexToRgb(h));
    if (dist < bestDist) {
      bestDist = dist;
      bestName = name;
    }
    if (dist === 0) return name; // Exact match
  }

  // Check CSS colors (only replace if significantly closer)
  for (const [h, name] of CSS_COLORS) {
    const dist = colorDistance(inputRgb, hexToRgb(h));
    if (dist < bestDist) {
      bestDist = dist;
      bestName = name;
    }
    if (dist === 0) return name;
  }

  return bestName;
}
