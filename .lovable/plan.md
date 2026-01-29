

# Set White Studio Background and Sunny as Defaults with Exact Hardcoded Output

## Overview

Configure the white studio cyclorama background preset to produce the **exact same hardcoded output** you had before, and set "sunny" as the default weather selection.

---

## Changes Required

### 1. Update White Cyclorama Preset (`presets.ts`)

Update the `studio-white` preset to produce the exact background output:

| Current | Updated |
|---------|---------|
| `clean white studio cyclorama background, professional product photography lighting, seamless white backdrop` | Custom handling in `buildBackgroundSection` |

The background section will output:
```text
BACKGROUND (MANDATORY):
- Pure white seamless studio background
- Visible floor and wall plane
- Soft cast shadows grounding the model
```

### 2. Update Lighting for White Studio (`shotTypeConfigs.ts`)

Update `buildLightingSection` to detect `studio-white` specifically and output:
```text
LIGHTING & TECHNICAL (MANDATORY):
- Clean, diffused studio light
- Soft contact shadows under the soles
```

### 3. Set Default Weather to "Sunny" (`types.ts`)

Change `initialProductShootState.weatherCondition` from `'auto'` to `'sunny'`.

---

## File Changes

### `src/components/creative-studio/product-shoot/presets.ts`

No changes needed - the current `studio-white` preset is fine. The special handling will be in the prompt builders.

### `src/components/creative-studio/product-shoot/types.ts`

Update `initialProductShootState`:

```typescript
// Line 148
weatherCondition: 'sunny',  // Changed from 'auto'
```

### `src/components/creative-studio/product-shoot/shotTypeConfigs.ts`

**Update `buildBackgroundSection` function (lines 21-47):**

Add special case for `studio-white` to produce exact hardcoded output:
```typescript
if (context.backgroundId === 'studio-white') {
  sections.push("BACKGROUND (MANDATORY):");
  sections.push("- Pure white seamless studio background");
  sections.push("- Visible floor and wall plane");
  sections.push("- Soft cast shadows grounding the model");
  return sections;
}
```

**Update `buildLightingSection` function (lines 52-77):**

Add special case for `studio-white` to produce exact hardcoded lighting:
```typescript
if (context.backgroundId === 'studio-white') {
  sections.push("LIGHTING & TECHNICAL (MANDATORY):");
  sections.push("- Clean, diffused studio light");
  sections.push("- Soft contact shadows under the soles");
  return sections;
}
```

---

## Result

When a user enters Product Shoot, the defaults will be:
- **Background**: White Cyclorama (studio-white)
- **Weather**: Sunny (for outdoor backgrounds)

When generating with `studio-white` selected, the prompt will include the **exact** hardcoded sections:

```text
BACKGROUND (MANDATORY):
- Pure white seamless studio background
- Visible floor and wall plane
- Soft cast shadows grounding the model

LIGHTING & TECHNICAL (MANDATORY):
- Clean, diffused studio light
- Soft contact shadows under the soles
```

Other studio backgrounds will use the generic studio lighting, and outdoor backgrounds will use natural lighting with the selected weather condition (defaulting to sunny).

