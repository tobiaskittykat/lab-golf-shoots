

# Fix Literal `\n` in Footbed Branding Text

## Problem

The Vision AI returns multi-line footbed text as `"BIRKENSTOCK\nMADE IN GERMANY"`. This gets injected raw into the generation prompt. Simply replacing `\n` with `/` risks the image generator rendering a literal slash on the footbed.

## Fix

In `supabase/functions/generate-image/index.ts`, on the line where `footbedText` is injected into the creative brief, split the text on newlines and format as a natural-language description of separate lines:

```
// Before
sections.push(`Footbed text: ${branding.footbedText}`);

// After  
const footbedLines = branding.footbedText.split('\n').filter(Boolean);
if (footbedLines.length > 1) {
  const described = footbedLines.map((line, i) => `"${line.trim()}"`).join(', ');
  sections.push(`Footbed text (multi-line stamp): ${described}`);
} else {
  sections.push(`Footbed text: ${branding.footbedText}`);
}
```

This turns `"BIRKENSTOCK\nMADE IN GERMANY"` into:

> Footbed text (multi-line stamp): "BIRKENSTOCK", "MADE IN GERMANY"

No special characters that could be rendered literally. The quoted strings clearly communicate each line of text, and the "(multi-line stamp)" label tells the prompt agent these are separate stamped lines.

## Files changed

| File | Change |
|------|--------|
| `supabase/functions/generate-image/index.ts` | Split `footbedText` on newlines and format as quoted, comma-separated values with a descriptive label |

