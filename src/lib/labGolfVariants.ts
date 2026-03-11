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
 * STEP 1 — Color swap with 1:1 replacement.
 *
 * The AI receives:
 *   - The SOURCE image (the photo containing the current club)
 *   - 6 DF3i REFERENCE images showing the club from every angle
 *
 * Goal: Replace ONLY the putter head in the source image with the DF3i
 * in the selected color. Everything else stays pixel-identical:
 * background, hands, shaft alignment, camera angle, lighting, shadows.
 * All alignment marks must be removed — clean, unmarked head.
 */
export function buildDF3iRemixPrompt(opts: {
  selectedColor?: PutterColor | null;
}): string {
  const { selectedColor } = opts;

  return `TASK: 1-to-1 PUTTER HEAD REPLACEMENT

You are given TWO types of images:
1. A SOURCE photograph — this is the scene you must preserve.
2. Multiple REFERENCE images of the L.A.B. Golf DF3i putter — these show the exact putter head you must place into the scene.

YOUR JOB:
Replace the putter head visible in the SOURCE photograph with the L.A.B. Golf DF3i putter head shown in the REFERENCE images. This is a surgical swap — a 1:1 replacement of the club head only.

WHAT MUST CHANGE:
• The putter head is replaced with the DF3i head from the reference images.
• The DF3i head must match the EXACT silhouette, proportions, cavity architecture, milling texture, hosel geometry, and construction visible in the references.
${selectedColor ? `• Apply a ${selectedColor.promptDescription} to the entire putter head (approximate hex: ${selectedColor.hex}). The finish must be uniform, smooth, and photorealistic on CNC-milled metal.` : '• Keep the putter head in its original/default color as shown in the references.'}

WHAT MUST NOT CHANGE (PIXEL-IDENTICAL):
• The position, angle, and orientation of the club in the scene — the new head sits exactly where the old one was, at the same tilt and rotation.
• The shaft — same position, angle, length visible.
• Hands, grip, golfer body (if present) — completely unchanged.
• Background, environment, surface, props — completely unchanged.
• Lighting direction, intensity, color temperature — unchanged.
• Camera angle, focal length, depth of field — unchanged.
• Shadows — re-rendered naturally for the new head shape but matching the existing light direction.

TECHNICAL QUALITY:
• Photorealistic result indistinguishable from a real photograph.
• Metal surfaces must show realistic reflections, specular highlights, and micro-texture consistent with CNC-milled stainless steel.
• Sharp, clean edges on the putter geometry — no painterly softness or AI artifacts.
• Color accuracy is critical under the scene's existing lighting.

The SOURCE image is the LAST image attached. All other attached images are REFERENCE images of the DF3i putter from various angles.`;
}

/**
 * STEP 2 — Apply alignment mark ONLY.
 *
 * The AI receives:
 *   - The Step 1 RESULT image (clean putter head, no marks)
 *   - ONE reference image of the alignment mark to apply
 *
 * Goal: Add the alignment mark to the putter head. Nothing else changes.
 * The club, color, background, lighting — all stay identical.
 * This step is ONLY about painting the mark onto the top surface.
 */
export function buildDF3iMarkPrompt(opts: {
  selectedMark: AlignmentMark;
  selectedColor?: PutterColor | null;
}): string {
  const { selectedMark, selectedColor } = opts;

  const colorContext = selectedColor
    ? `The putter head has a ${selectedColor.promptDescription} (hex ~${selectedColor.hex}).`
    : 'The putter head color is as shown in the image.';

  return `TASK: ADD ALIGNMENT MARK TO PUTTER HEAD — NOTHING ELSE CHANGES

You are given TWO images:
1. A photograph of a L.A.B. Golf DF3i putter (the FIRST/MAIN image) — this is the image you will edit.
2. A REFERENCE image showing the exact alignment mark design to apply (the SECOND image).

${colorContext}

YOUR ONLY JOB:
Add the alignment mark shown in the reference image onto the flat top surface of the putter head in the main image. That is the ONLY change.

MARK SPECIFICATION:
• The mark is: ${selectedMark.promptDescription}.
• Copy the EXACT shape, line weight, and style from the reference image.
• Position the mark centered on the flat top surface of the putter blade, along the front-to-back center line (the aiming axis).
• The mark must contrast with the head color — use white or light-colored marking on a dark head, dark marking on a light head.
• The mark must appear factory-applied: perfectly aligned, uniform line weight, crisp edges, no smudging.
• The mark should interact with existing lighting — slight specular highlights on mark edges are expected.

ABSOLUTELY DO NOT CHANGE ANYTHING ELSE:
• The putter head shape, color, finish, geometry — UNCHANGED.
• The shaft, hands, grip, golfer — UNCHANGED.
• Background, environment, surfaces, props — UNCHANGED.
• Lighting, camera angle, depth of field — UNCHANGED.
• Shadows — UNCHANGED.
• The ONLY modification is painting the alignment mark onto the top surface of the putter head.

If you change anything other than adding the mark, the result is a failure.`;
}
