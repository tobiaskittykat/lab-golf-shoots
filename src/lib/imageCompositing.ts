/**
 * Client-side image compositing utilities using HTML Canvas API
 * Used for overlaying brand logos onto generated images
 */

export type LogoPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';

export interface LogoPlacement {
  enabled: boolean;
  position: LogoPosition;
  sizePercent: number; // 5-20% of image width
  opacity: number; // 0-100
  paddingPx: number; // pixels from edge
}

export const defaultLogoPlacement: LogoPlacement = {
  enabled: false, // OFF by default
  position: 'bottom-right',
  sizePercent: 10,
  opacity: 80,
  paddingPx: 20,
};

/**
 * Load an image from a URL and return as HTMLImageElement
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS for canvas operations
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Calculate the position coordinates for logo placement
 */
function calculatePosition(
  canvasWidth: number,
  canvasHeight: number,
  logoWidth: number,
  logoHeight: number,
  position: LogoPosition,
  padding: number
): { x: number; y: number } {
  switch (position) {
    case 'top-left':
      return { x: padding, y: padding };
    case 'top-right':
      return { x: canvasWidth - logoWidth - padding, y: padding };
    case 'bottom-left':
      return { x: padding, y: canvasHeight - logoHeight - padding };
    case 'bottom-right':
      return { x: canvasWidth - logoWidth - padding, y: canvasHeight - logoHeight - padding };
    case 'center':
      return {
        x: (canvasWidth - logoWidth) / 2,
        y: (canvasHeight - logoHeight) / 2
      };
    default:
      return { x: canvasWidth - logoWidth - padding, y: canvasHeight - logoHeight - padding };
  }
}

/**
 * Composite a logo onto an image using Canvas API
 * Returns a data URL of the composited image
 */
export async function compositeLogoOnImage(
  imageUrl: string,
  logoUrl: string,
  options: LogoPlacement
): Promise<string> {
  // Load both images
  const [mainImage, logo] = await Promise.all([
    loadImage(imageUrl),
    loadImage(logoUrl),
  ]);

  // Create canvas at main image dimensions
  const canvas = document.createElement('canvas');
  canvas.width = mainImage.width;
  canvas.height = mainImage.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context');
  }

  // Enable high-quality image scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw main image
  ctx.drawImage(mainImage, 0, 0);

  // Calculate logo dimensions (maintain aspect ratio)
  const logoWidth = mainImage.width * (options.sizePercent / 100);
  const logoHeight = logo.height * (logoWidth / logo.width);

  // Calculate position
  const { x, y } = calculatePosition(
    canvas.width,
    canvas.height,
    logoWidth,
    logoHeight,
    options.position,
    options.paddingPx
  );

  // Draw logo with opacity
  ctx.globalAlpha = options.opacity / 100;
  ctx.drawImage(logo, x, y, logoWidth, logoHeight);
  ctx.globalAlpha = 1; // Reset alpha

  // Return as PNG data URL
  return canvas.toDataURL('image/png');
}

/**
 * Calculate CSS styles for logo preview overlay
 * Used for real-time preview without canvas rendering
 */
export function getLogoOverlayStyles(
  position: LogoPosition,
  sizePercent: number,
  opacity: number,
  paddingPx: number
): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: `${sizePercent}%`,
    opacity: opacity / 100,
    pointerEvents: 'none',
    objectFit: 'contain',
  };

  switch (position) {
    case 'top-left':
      return { ...base, top: paddingPx, left: paddingPx };
    case 'top-right':
      return { ...base, top: paddingPx, right: paddingPx };
    case 'bottom-left':
      return { ...base, bottom: paddingPx, left: paddingPx };
    case 'bottom-right':
      return { ...base, bottom: paddingPx, right: paddingPx };
    case 'center':
      return {
        ...base,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    default:
      return { ...base, bottom: paddingPx, right: paddingPx };
  }
}
