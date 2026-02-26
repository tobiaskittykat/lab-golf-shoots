

# Remove Product-Specific Language from Sole View Prompt

## Problem
The sole view narrative mentions "top straps" which is specific to sandals/strap-based footwear. Shoes like clogs, sneakers, or loafers don't have straps, and this language could confuse the AI into hallucinating straps on products that don't have them.

## Finding
- **Sole view narrative (line 447)**: Contains "showcasing the interior footbed and top straps" -- the "top straps" reference needs to go
- **Sole view prompt (line 446)**: Clean, no product-specific parts
- **Pair shot prompt + narrative (lines 462-463)**: Already clean, no straps/buckles/hardware mentioned

## Change

**File:** `src/components/creative-studio/product-shoot/shotTypeConfigs.ts` (line 447)

Replace "showcasing the interior footbed and top straps" with "showcasing the interior footbed and upper details"

This keeps the instruction to show the top of the shoe without assuming any specific hardware type. "Upper details" is universal footwear terminology that works for straps, laces, slip-ons, clogs, etc.

