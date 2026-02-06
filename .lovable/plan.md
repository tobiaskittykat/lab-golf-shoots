

# Fix "All [Material]" to Include Footbed for EVA

## Problem
When user says "all eva version in baby blue", footbed and buckles stay unchanged because the current rules limit "all [material]" to only upper/sole/heelstrap.

For EVA specifically, footbed IS valid (molded EVA sandals like Boston exist), so "all EVA" should include it.

## Solution

Update the edge function prompt to be **material-aware**:

### Rule Updates

**Update Rule 7:**
```
Footbed stays cork UNLESS:
- User explicitly mentions footbed
- User says "all [material]" where material is valid for footbed (EVA, Soft Footbed)
```

**Update Rule 12:**
```
"all [material] in [color]" applies to ALL components where that material is valid:

EVA (valid for upper, sole, footbed, heelstrap):
→ "all EVA in baby blue" changes all 4 + buckles become coordinated plastic

Leather/Suede/Birko-Flor (valid for upper, heelstrap only):
→ "all leather in cognac" changes upper + heelstrap only
→ sole stays EVA/rubber, footbed stays cork
```

**Add buckle coordination rule:**
```
For "all [color]" or "all [material] in [color]" requests, 
buckles should switch to "Matte Plastic (Coordinated)" with matching color
```

### Updated Examples

```
- "all eva version in baby blue" → 
    upper: EVA/Baby Blue/#89CFF0
    sole: EVA/Baby Blue/#89CFF0
    footbed: EVA/Baby Blue/#89CFF0
    heelstrap: EVA/Baby Blue/#89CFF0
    buckles: Matte Plastic (Coordinated)/Baby Blue/#89CFF0

- "all leather in cognac" →
    upper: Smooth Leather/Cognac/#834C24
    heelstrap: Smooth Leather/Cognac/#834C24
    (sole, footbed, buckles: null - unchanged)
```

## File to Modify

| File | Changes |
|------|---------|
| `supabase/functions/interpret-shoe-customization/index.ts` | Update rules 7 and 12, add material validity table, add EVA footbed examples |

## Expected Result

**Input:** "all eva version in baby blue"

**Response:**
```json
{
  "upper": { "material": "EVA", "color": "Baby Blue", "colorHex": "#89CFF0" },
  "sole": { "material": "EVA", "color": "Baby Blue", "colorHex": "#89CFF0" },
  "footbed": { "material": "EVA", "color": "Baby Blue", "colorHex": "#89CFF0" },
  "heelstrap": { "material": "EVA", "color": "Baby Blue", "colorHex": "#89CFF0" },
  "buckles": { "material": "Matte Plastic (Coordinated)", "color": "Baby Blue", "colorHex": "#89CFF0" }
}
```

**Toast:** "Applied 5 component changes"

