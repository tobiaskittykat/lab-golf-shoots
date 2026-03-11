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
