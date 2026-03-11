// L.A.B. Golf DF3i putter variant configuration
// Colors and alignment marks available for the DF3i putter

import alignmentMarkA from '@/assets/lab-golf/alignment_mark_a.png';
import alignmentMarkB from '@/assets/lab-golf/alignment_mark_b.png';
import alignmentMarkC from '@/assets/lab-golf/alignment_mark_c.png';

import df3i_0 from '@/assets/lab-golf/df3i_0.png';
import df3i_1 from '@/assets/lab-golf/df3i_1.png';
import df3i_2 from '@/assets/lab-golf/df3i_2.png';
import df3i_3 from '@/assets/lab-golf/df3i_3.png';
import df3i_4 from '@/assets/lab-golf/df3i_4.png';
import df3i_5 from '@/assets/lab-golf/df3i_5.png';

export interface PutterColor {
  id: string;
  name: string;
  hex: string;
  promptDescription: string;
}

export interface AlignmentMark {
  id: string;
  name: string;
  thumbnail: string;
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
  { id: 'mark-a', name: 'Mark A', thumbnail: alignmentMarkA, promptDescription: 'alignment mark style A — a single thin line marking on the top of the putter blade' },
  { id: 'mark-b', name: 'Mark B', thumbnail: alignmentMarkB, promptDescription: 'alignment mark style B — a crosshair/plus-sign alignment marking on the top of the putter blade' },
  { id: 'mark-c', name: 'Mark C', thumbnail: alignmentMarkC, promptDescription: 'alignment mark style C — a dot-pattern alignment marking on the top of the putter blade' },
];

export const df3iReferenceImages = [df3i_0, df3i_1, df3i_2, df3i_3, df3i_4, df3i_5];
