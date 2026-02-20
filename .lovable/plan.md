

# Redesign Buckle Engravings Section for Detailed Editing

## Problem
Each buckle engraving is currently a single cramped row with three tiny inline inputs ("Text", "Style", "Location") that are hard to read and interact with. There's no labeling, no guidance, and the fields are too narrow (w-24, w-28) to show real content.

## Solution
Replace the inline row layout with a **card-per-engraving** design where each engraving gets its own bordered card with properly labeled fields stacked vertically.

### New Engraving Card Layout

Each engraving becomes a card with:
- **Header row**: "Engraving #1" title + Delete button
- **Inscription Text**: Full-width Input with label and placeholder (e.g., "BIRKENSTOCK")
- **Two-column row**: Style (dropdown-like input with placeholder "e.g., inscribed, embossed") + Location (placeholder "e.g., single buckle, left strap")
- Proper spacing, text-sm sizing, clear labels above every field

### Visual Layout per Card
```text
+------------------------------------------+
| Engraving 1                          [X] |
|                                          |
| Inscription Text                         |
| [BIRKENSTOCK________________________]    |
|                                          |
| Style                  Location          |
| [inscribed___]         [single buckle__] |
+------------------------------------------+
```

## Technical Details

### File: `src/components/creative-studio/product-shoot/EditableAnalysisPanel.tsx`

**Changes to the Buckle Engravings section (lines ~449-488):**

1. Replace the flat `flex items-center` row per engraving with a card-style `div` containing:
   - A header with "Engraving {i+1}" label and the delete button
   - A full-width `FieldRow` for "Inscription Text" (currently `text` field) with placeholder "e.g., BIRKENSTOCK"
   - A 2-column grid with `FieldRow` for "Style" (placeholder "e.g., inscribed, embossed, molded") and "Location" (placeholder "e.g., single buckle, left strap, right strap")

2. Update the "Add" button to say "+ Add Engraving" for clarity

3. Update the empty state text from "No engravings detected" to "No engravings detected. Click 'Add Engraving' to add one."

No other files need changes -- the data structure (`{ text, style, location }`) remains the same.

