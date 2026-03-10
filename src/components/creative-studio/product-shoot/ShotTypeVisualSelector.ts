// Shot Type Visual Selector - stub
export interface VisualShotType {
  id: string;
  name: string;
  description: string;
  promptHint: string;
  icon?: string;
}

export const visualShotTypes: VisualShotType[] = [
  {
    id: 'on-foot',
    name: 'On Foot',
    description: 'Shoe focus, mid-calf to floor',
    promptHint: 'On foot product shot, mid-calf to floor, three-quarter side view',
  },
  {
    id: 'lifestyle',
    name: 'Full Body',
    description: 'Full body on model, head cropped',
    promptHint: 'Full body lifestyle shot, upper chest to feet, head cropped',
  },
  {
    id: 'product-focus',
    name: 'Product Focus',
    description: 'Product only, no model',
    promptHint: 'Product focus shot, product only, no hands or models',
  },
];
