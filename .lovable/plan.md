
# Fix: "Create Moodboard" Button Not Working on Homepage

## Problem Analysis

Looking at the screenshot, the user sees:
1. The **Moodboard Section** with the header "Sunlit Steps: Begin Your Yellow Diamond Story"
2. A **"Campaign Concept" card** with description text about diamonds
3. Tags: "Radiant", "Empowering", "Editorial", "Modern", "Aspirational"  
4. A coral **"Create Moodboard"** button at the bottom

However, this content **does not exist in the current codebase**. The current `Index.tsx` shows:
- Lines 689-731: Moodboard section header (static title)
- Lines 733-808: `CollapsibleContent` with the new MoodboardBuilder integration

The new integration shows either:
- **Empty state**: "Build with AI" / "Browse Gallery" buttons
- **Building state**: Inline `MoodboardBuilder` component
- **Completed state**: Success message with options

## Root Cause

The "Campaign Concept" card with "Create Moodboard" button that the user sees must be **OLD static content** that either:
1. Was not properly removed during the integration
2. Exists elsewhere in the file and is being rendered OUTSIDE the `CollapsibleContent`
3. The preview has cached content that hasn't refreshed

After reviewing lines 689-820 of `Index.tsx`, I confirmed:
- There is NO "Campaign Concept" card in the current code
- The `CollapsibleContent` correctly contains the new dynamic states
- The old static content appears to have been removed

## Solution

The issue is that the static "Campaign Concept" card shown in the screenshot was never actually replaced. The previous integration added the new content INSIDE `CollapsibleContent` but did NOT remove the old static content that was likely OUTSIDE or BEFORE the `CollapsibleContent`.

### Changes Required

**File: `src/pages/Index.tsx`**

1. **Remove old static "Campaign Concept" card** - Find and remove any remaining static content between the header (line ~731) and the `CollapsibleContent` (line 733) or anywhere else in the moodboard section

2. **Wire the "+" button in header** - The Plus button at line 727-729 should trigger `setIsBuildingMoodboard(true)` or `setShowMoodboardModal(true)`:
   ```typescript
   <button 
     onClick={() => setIsBuildingMoodboard(true)}
     className="p-2.5 rounded-xl border border-border hover:bg-secondary transition-colors"
   >
     <Plus className="w-5 h-5 text-muted-foreground" />
   </button>
   ```

3. **Ensure section is expanded by default** - Verify `isMoodboardOpen` is initialized to `true` (it currently is at line 163)

4. **Look for old "Create Moodboard" button** - Search the file for any remaining static "Create Moodboard" button text and remove/replace it

### What the User Should See

After the fix, when the Moodboard section is expanded, users will see:
- A centered "Create Your Moodboard" card with an icon
- Description text about building AI-curated moodboards
- Two buttons: **"Build with AI"** and **"Browse Gallery"**

Clicking "Build with AI" will reveal the inline `MoodboardBuilder` component with:
- Mood description input
- Style preference buttons (Editorial/Mixed/Commercial)
- Temperature slider
- Image grid after generation
- Save/Cancel actions

## Technical Details

Lines to modify in `src/pages/Index.tsx`:
- **Line 727-729**: Add `onClick={() => setIsBuildingMoodboard(true)}` to the Plus button
- **Search for any old static content** between header and CollapsibleContent that may not have been removed
- The file currently has 934 lines; the moodboard section spans lines 689-822

## Summary

The MoodboardBuilder component exists and is correctly integrated inside the CollapsibleContent, but the user is seeing old static content (the "Campaign Concept" card with "Create Moodboard" button) that was never removed. The fix is to:
1. Remove any remaining old static content
2. Wire the header "+" button to trigger the moodboard builder
3. Ensure the CollapsibleContent is visible and showing the new dynamic UI
