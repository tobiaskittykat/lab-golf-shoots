// L.A.B. Golf DF3i putter variant configuration
// Colors and alignment marks available for the DF3i putter
// Images hosted in brand-assets storage bucket for server-side access

// Keep local imports for UI thumbnails (PutterVariantSelector)
import alignmentMarkA from '@/assets/lab-golf/alignment_mark_a.png';
import alignmentMarkB from '@/assets/lab-golf/alignment_mark_b.png';
import alignmentMarkC from '@/assets/lab-golf/alignment_mark_c.png';

const STORAGE_BASE = 'https://zhevvyyxrjusxuyqxoxj.supabase.co/storage/v1/object/public/brand-assets/lab-golf';

export interface PutterColor {
  id: string;
  name: string;
  hex: string;
  promptDescription: string;
}

export interface AlignmentMark {
  id: string;
  name: string;
  thumbnail: string;        // local asset for UI display
  publicUrl: string;         // public storage URL for AI model
  promptDescription: string;
}

export const df3iColors: PutterColor[] = [
  { id: 'black', name: 'Black', hex: '#1a1a1a', promptDescription: 'matte black finish' },
  { id: 'burgundy', name: 'Burgundy', hex: '#6B1D2A', promptDescription: 'deep burgundy/maroon finish' },
  { id: 'cognac', name: 'Cognac', hex: '#8B5E3C', promptDescription: 'warm cognac brown finish' },
  { id: 'slate-blue', name: 'Slate Blue', hex: '#3D4F5F', promptDescription: 'dark slate blue finish' },
  { id: 'red-brick', name: 'Red Brick', hex: '#8B3A3A', promptDescription: 'brick red finish' },
  { id: 'pink', name: 'Pink', hex: '#C97B8B', promptDescription: 'soft pink finish' },
  { id: 'forest-green', name: 'Forest Green', hex: '#2D4A2D', promptDescription: 'deep forest green finish' },
  { id: 'purple', name: 'Purple', hex: '#5B3A7A', promptDescription: 'rich purple finish' },
];

export const df3iAlignmentMarks: AlignmentMark[] = [
  { id: 'mark-a', name: 'Mark A', thumbnail: alignmentMarkA, publicUrl: `${STORAGE_BASE}/alignment_mark_a.png`, promptDescription: 'alignment mark style A — a single thin line marking on the top of the putter blade' },
  { id: 'mark-b', name: 'Mark B', thumbnail: alignmentMarkB, publicUrl: `${STORAGE_BASE}/alignment_mark_b.png`, promptDescription: 'alignment mark style B — a crosshair/plus-sign alignment marking on the top of the putter blade' },
  { id: 'mark-c', name: 'Mark C', thumbnail: alignmentMarkC, publicUrl: `${STORAGE_BASE}/alignment_mark_c.png`, promptDescription: 'alignment mark style C — a dot-pattern alignment marking on the top of the putter blade' },
];

export const df3iReferenceImages: string[] = [
  `${STORAGE_BASE}/df3i_0.png`,
  `${STORAGE_BASE}/df3i_1.png`,
  `${STORAGE_BASE}/df3i_2.png`,
  `${STORAGE_BASE}/df3i_3.png`,
  `${STORAGE_BASE}/df3i_4.png`,
  `${STORAGE_BASE}/df3i_5.png`,
];

/**
 * STEP 1 prompt: Color swap with explicit mark removal.
 * Produces a clean, mark-free putter head in the selected color.
 */
export function buildDF3iRemixPrompt(opts: {
  selectedColor?: PutterColor | null;
}): string {
  const { selectedColor } = opts;

  const productBlock = `PRODUCT IDENTITY — L.A.B. Golf DF3i Putter (LOCKED)
The product is the L.A.B. Golf DF3i putter, a premium Lie Angle Balance (LAB)
mallet-style putter. Key physical characteristics that MUST be preserved exactly:
  • Blade shape: wide, rounded mallet head with a smooth, flowing top-line and
    a distinctive rear cavity/channel running along the back of the head.
  • Face: flat, precision-milled striking face with fine horizontal milling lines.
  • Hosel: a short, minimal plumber-neck hosel connecting the shaft to the heel
    of the blade at an upright lie angle.
  • Shaft: a straight steel shaft entering the hosel from above.
  • Sole: flat sole with subtle beveled edges; the sole plate is flush-mounted.
  • Overall proportions: the head is wider than it is deep (front-to-back),
    with a low profile when viewed from the side.
  • Weight distribution: the mass is spread toward the perimeter of the head,
    giving the blade a substantial, balanced visual weight.

The reference images attached show the DF3i from 6 angles (front, side, top,
detail, angled, back). The generated putter MUST match the exact silhouette,
proportions, construction, hosel geometry, and cavity architecture visible in
those references. Do not redesign, simplify, or reinterpret the putter shape.`;

  const changeLines: string[] = [];

  if (selectedColor) {
    changeLines.push(`COLOR CHANGE (REQUIRED):
Apply a ${selectedColor.promptDescription} to the entire putter head.
  • The finish should be uniform, smooth, and photorealistic.
  • Approximate hex reference: ${selectedColor.hex}
  • The color replaces the original head color but does NOT alter geometry,
    milling pattern, cavity shape, or any structural feature.
  • Reflections and specular highlights should be consistent with the new color
    on a milled-metal surface.`);
  }

  // Always remove marks in Step 1
  changeLines.push(`ALIGNMENT MARKS — REMOVE (REQUIRED):
Remove ALL alignment marks, lines, dots, crosshairs, or any aiming aids from the
top surface of the putter head. The top surface must be completely clean, smooth,
and unmarked — showing only the bare metal/color finish with natural milling texture.
Do NOT add any new marks. The result must be a pristine, mark-free putter head.`);

  const changesBlock = `VARIANT MODIFICATIONS\n${changeLines.join('\n\n')}`;

  const sceneBlock = `SCENE PRESERVATION (MANDATORY)
Everything in the source image EXCEPT the putter/golf club must remain
pixel-identical or as close as possible:
  • Background, environment, props, surfaces — unchanged.
  • Lighting direction, intensity, color temperature — unchanged.
  • Camera angle, focal length, depth of field — unchanged.
  • Shadows cast by the putter should be re-rendered to match the new
    putter's geometry and the existing light sources.
  • If the source image contains a golfer or hands holding the club,
    the grip, hand position, and body remain unchanged — only the
    putter head (and optionally shaft) are swapped.`;

  const techBlock = `TECHNICAL QUALITY
  • The final image must be photorealistic, indistinguishable from an actual
    photograph of the DF3i putter in the scene.
  • Metal surfaces should exhibit realistic reflections, specular highlights,
    and micro-texture consistent with CNC-milled stainless steel.
  • Edges should be sharp and clean — no painterly softness or AI artifacts
    on the putter geometry.
  • Color accuracy is critical — the finish color must read true under the
    scene's existing lighting conditions.`;

  return [productBlock, changesBlock, sceneBlock, techBlock].join('\n\n');
}

/**
 * STEP 2 prompt: Apply an alignment mark to a clean putter head.
 * Input image should already have a clean, mark-free putter from Step 1.
 */
export function buildDF3iMarkPrompt(opts: {
  selectedMark: AlignmentMark;
  selectedColor?: PutterColor | null;
}): string {
  const { selectedMark, selectedColor } = opts;

  const colorContext = selectedColor
    ? `The putter head has a ${selectedColor.promptDescription} (hex ~${selectedColor.hex}).`
    : 'The putter head color is as shown in the image.';

  return `TASK: Add an alignment mark to the L.A.B. Golf DF3i putter head in this image.

${colorContext}

MARK SPECIFICATION:
Apply ${selectedMark.promptDescription}.
  • Use the attached alignment mark reference image as the EXACT template for the mark shape and style.
  • The mark sits on the flat top surface of the putter blade, centered along the aiming axis (front-to-back center line).
  • The mark must contrast with the head color — use white or light-colored marking on a dark head, dark marking on a light head.
  • The mark must be clean, crisp, and precisely positioned — it is a functional aiming aid, not a decorative element.
  • The mark should appear as if it was factory-applied: perfectly aligned, uniform line weight, no smudging or bleeding.

PRESERVATION (MANDATORY):
Everything in the image MUST remain pixel-identical or as close as possible:
  • The putter head shape, color, finish, geometry — all unchanged.
  • Background, environment, props, surfaces — unchanged.
  • Lighting direction, intensity, color temperature — unchanged.
  • Camera angle, focal length, depth of field — unchanged.
  • Shadows — unchanged.
  • The ONLY change is adding the alignment mark to the top surface of the putter head.

TECHNICAL QUALITY:
  • The mark must look photorealistic, as if engraved or painted onto the metal surface.
  • The mark should interact correctly with the existing lighting — slight specular highlights on the mark edges are expected.
  • No other modifications to the image whatsoever.`;
}
