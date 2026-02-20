

# Fix: Inject Actual Footbed Branding Text for Product-Focus Shots

## Problem

Line 660-663 of `supabase/functions/generate-image/index.ts` uses a generic descriptor for product-focus shots:

```
Footbed: branded Cork-latex footbed with maker's stamp and logo (as shown in reference images)
```

The Prompt Agent receives no actual text (like "BIRKENSTOCK", "MADE IN GERMANY"), so it omits footbed inscriptions from the refined prompt entirely.

## Fix

### File: `supabase/functions/generate-image/index.ts` (lines 660-663)

Replace the generic descriptor with logic that includes the real `branding.footbedText` and `branding.footbedLogo` when available:

```typescript
} else if (visualShotType === 'product-focus') {
  const footbedMaterial = orig.footbed?.material || 'cork';
  if (branding.footbedText) {
    const footbedLines = branding.footbedText.split('\n').filter(Boolean);
    if (footbedLines.length > 1) {
      const described = footbedLines.map((line: string) => `"${line.trim()}"`).join(', ');
      sections.push(`Footbed: branded ${footbedMaterial} footbed with stamped text (multi-line stamp): ${described}`);
    } else {
      sections.push(`Footbed: branded ${footbedMaterial} footbed with stamped text: "${branding.footbedText}"`);
    }
  } else {
    sections.push(`Footbed: branded ${footbedMaterial} footbed with maker's stamp (as shown in reference images)`);
  }
  if (branding.footbedLogo) {
    sections.push(`Footbed logo: ${branding.footbedLogo}`);
  }
}
```

This keeps the dynamic material name (e.g., "EVA", "Cork-latex") while restoring the actual analyzed inscription text. Falls back to generic descriptor only when no footbed text was analyzed.

The edge function will be redeployed automatically after the change.

