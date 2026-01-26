

# Integrate Moodboard Builder into Homepage

## Overview

The homepage has a dedicated **Moodboard Section** (lines 673-750 in `Index.tsx`) that currently shows a static "Create Moodboard" button and placeholder content. We'll integrate the `MoodboardBuilder` component here so users can build AI-curated moodboards directly from the homepage.

---

## Current State

The homepage moodboard section contains:
- A collapsible header with the title "Sunlit Steps: Begin Your Yellow Diamond Story"
- A static "Campaign Concept" card with placeholder text
- A "Create Moodboard" button that does nothing

---

## Solution

### 1. Add MoodboardBuilder Integration

Replace the static placeholder content with an interactive experience:

**Option A: Inline Builder (Recommended)**
- Show the MoodboardBuilder directly in the section when user clicks "Create Moodboard"
- More seamless experience - no modal popup
- User stays on homepage while building

**Option B: Modal Trigger**  
- Open the existing MoodboardModal with "Build Your Own" tab pre-selected
- Reuses existing code

I'll implement **Option A** for a better inline experience, with the ability to also open the full modal for browsing.

---

## Implementation Plan

### File: `src/pages/Index.tsx`

#### Step 1: Add State and Imports

```typescript
// Add to imports (around line 10)
import { MoodboardBuilder } from "@/components/creative-studio/MoodboardBuilder";
import { MoodboardModal } from "@/components/creative-studio/MoodboardModal";

// Add new state variables (around line 164)
const [isBuilding, setIsBuilding] = useState(false);
const [showMoodboardModal, setShowMoodboardModal] = useState(false);
const [createdMoodboard, setCreatedMoodboard] = useState<{ id: string; name: string } | null>(null);
```

#### Step 2: Add Handlers

```typescript
// Handle moodboard creation complete
const handleMoodboardComplete = (moodboardId: string) => {
  setIsBuilding(false);
  setCreatedMoodboard({ id: moodboardId, name: 'AI-Built Moodboard' });
  toast({ title: 'Moodboard created!', description: 'Your moodboard is ready to use.' });
};
```

#### Step 3: Update Moodboard Section UI (lines 673-750)

Replace the static content with a dynamic experience:

```text
┌─────────────────────────────────────────────────────────────────┐
│  Moodboard Section                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  IF not building AND no createdMoodboard:                       │
│    ┌──────────────────────────────────────────────────────┐     │
│    │  Empty state with two options:                        │     │
│    │  [🪄 Build with AI]    [📁 Browse Gallery]            │     │
│    └──────────────────────────────────────────────────────┘     │
│                                                                 │
│  IF isBuilding:                                                 │
│    ┌──────────────────────────────────────────────────────┐     │
│    │  <MoodboardBuilder                                    │     │
│    │     onComplete={handleMoodboardComplete}              │     │
│    │     onCancel={() => setIsBuilding(false)}             │     │
│    │  />                                                   │     │
│    └──────────────────────────────────────────────────────┘     │
│                                                                 │
│  IF createdMoodboard:                                           │
│    ┌──────────────────────────────────────────────────────┐     │
│    │  ✓ Moodboard: [name]                                  │     │
│    │  [View] [Create Another] [Browse Gallery]             │     │
│    └──────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## UI Details

### Empty State (No Moodboard)
Show two action buttons:
- **Build with AI** - Expands the MoodboardBuilder inline
- **Browse Gallery** - Opens MoodboardModal to browse/upload existing

### Building State
Shows the full `MoodboardBuilder` component inline with:
- Mood input
- Style preference buttons
- Temperature slider
- Generated image grid
- Save/Cancel buttons

### Completed State
Shows success message with:
- Moodboard name/preview
- Option to create another
- Option to browse gallery

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Import MoodboardBuilder & MoodboardModal, add state, update moodboard section JSX |

---

## Summary

This integration allows users to:
1. Build AI-curated moodboards directly from the homepage
2. Browse existing moodboards via modal
3. See their created moodboard inline after completion
4. Start a new moodboard or switch to gallery browsing

The experience feels native to the homepage rather than requiring navigation to a separate flow.

