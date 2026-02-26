# Fix Hero Angle: Shoe Must Rest Flat on Surface

## Problem

The hero (3/4 front) angle sometimes generates the shoe tilted or floating, with only the toe touching the ground (as seen in the user's reference image). The current prompt and narrative lack any grounding instruction — they describe rotation and camera position but never say the shoe should be resting flat.

## Changes

**File**: `src/components/creative-studio/product-shoot/shotTypeConfigs.ts` (lines 422-423)

### Prompt (line 422)

**Current**:

> "neutral eye-level three-quarter view, shoe rotated 30-45 degrees with toe toward bottom-right and heel toward center-left, capturing full side profile of sole, structural volume of upper, and clear view into interior footbed"

**New** (added grounding clause):

> "neutral eye-level three-quarter view, shoe resting flat on surface with entire sole, rotated 30-45 degrees with toe toward bottom-right and heel toward center-left, capturing full side profile of sole, structural volume of upper, and clear view into interior footbed"

### Narrative (line 423)

**Current** (excerpt -- no grounding language):

> "...The front of the shoe is physically closer to the lens than the heel, creating a natural sense of depth and scale. This specific orientation ensures..."

**New** (added grounding sentence after the depth/scale sentence):

> "...The front of the shoe is physically closer to the lens than the heel, creating a natural sense of depth and scale. The shoe rests flat and stable on the surface -- it is not tilted, propped, or floating. This specific orientation ensures..."

## Why This Wording Works

- **"resting flat on surface"** in the prompt is concise and unambiguous
- **"not tilted, propped, or floating"** uses negative reinforcement to explicitly ban the failure mode seen in the reference image
- Placed early in the prompt (before rotation details) so the AI treats it as a foundational constraint

## Scope

Single file, two fields updated (lines 422-423). No other files affected.