
# Add New Outdoor Background Presets & Generate Thumbnails

## Analysis

The user has provided 9 reference images showing diverse outdoor/natural settings for product photography. Comparing these to the existing 12 outdoor backgrounds in `presets.ts`, I've identified several unique settings that aren't currently available:

**Current outdoor backgrounds:**
- Sandy Beach, Urban Street, Park Grass, Café Terrace, Desert Dunes, Forest Path, Rooftop, Poolside, Mountain Trail, Vineyard, Boardwalk, Street Market

**New backgrounds from user's images:**
1. **Cactus Garden** - Desert setting with prominent cactus plants and sandy ground (similar to existing "Desert Dunes" but with iconic southwestern flora)
2. **Cracked Earth** - Drought-affected ground with deep fissures and dry texture
3. **Salt Flats** - White crystalline surface with greenish mineral deposits (geothermal/natural phenomenon aesthetic)
4. **Picnic Setting** - Red gingham blanket on grass (casual, lifestyle-oriented)
5. **Rocky Shore** - Natural rock formations with turquoise water edge (spa/resort vibe)
6. **Weathered Metal** - Oxidized, rust-colored metal surface with golden tones (industrial/artistic)
7. **Grass + Concrete Edge** - Mixed natural/urban transition (modern architectural)

## Implementation Plan

### 1. Add New Background Presets to `presets.ts`

**File: `src/components/creative-studio/product-shoot/presets.ts`**

Add 7 new outdoor background presets to the `outdoorBackgrounds` array (increasing total from 12 to 19 outdoor options):

```typescript
// New imports for thumbnails (will be generated)
import outdoorCactusGarden from '@/assets/backgrounds/outdoor-cactus-garden.jpg';
import outdoorCrackedEarth from '@/assets/backgrounds/outdoor-cracked-earth.jpg';
import outdoorSaltFlats from '@/assets/backgrounds/outdoor-salt-flats.jpg';
import outdoorPicnic from '@/assets/backgrounds/outdoor-picnic.jpg';
import outdoorRockyShore from '@/assets/backgrounds/outdoor-rocky-shore.jpg';
import outdoorWeatheredMetal from '@/assets/backgrounds/outdoor-weathered-metal.jpg';
import outdoorGrassConcrete from '@/assets/backgrounds/outdoor-grass-concrete.jpg';

// Add to outdoorBackgrounds array after existing entries:
{ 
  id: 'outdoor-cactus-garden', 
  name: 'Cactus Garden', 
  category: 'outdoor', 
  thumbnail: outdoorCactusGarden, 
  prompt: 'southwestern desert setting with prickly pear cactus, sandy beige ground, natural desert flora backdrop',
  colorHint: 'linear-gradient(180deg, #8B9D83 0%, #D4C5A9 50%, #C8B896 100%)'
},
{ 
  id: 'outdoor-cracked-earth', 
  name: 'Cracked Earth', 
  category: 'outdoor', 
  thumbnail: outdoorCrackedEarth, 
  prompt: 'dry cracked earth surface, deep fissures in clay ground, dramatic arid landscape texture',
  colorHint: 'linear-gradient(180deg, #C8B896 0%, #A89968 100%)'
},
{ 
  id: 'outdoor-salt-flats', 
  name: 'Salt Flats', 
  category: 'outdoor', 
  thumbnail: outdoorSaltFlats, 
  prompt: 'white crystalline salt flat surface, turquoise mineral deposits, otherworldly natural phenomenon',
  colorHint: 'linear-gradient(135deg, #F0F8FF 0%, #B0E0E6 50%, #E0F7FA 100%)'
},
{ 
  id: 'outdoor-picnic', 
  name: 'Picnic Blanket', 
  category: 'outdoor', 
  thumbnail: outdoorPicnic, 
  prompt: 'red gingham picnic blanket on green grass, casual outdoor lifestyle setting, summer day',
  colorHint: 'linear-gradient(135deg, #DC143C 0%, #FFFFFF 25%, #DC143C 50%, #228B22 100%)'
},
{ 
  id: 'outdoor-rocky-shore', 
  name: 'Rocky Shore', 
  category: 'outdoor', 
  thumbnail: outdoorRockyShore, 
  prompt: 'natural limestone rock surface, turquoise water edge, spa-like serene coastal setting',
  colorHint: 'linear-gradient(180deg, #D3D3D3 0%, #40E0D0 100%)'
},
{ 
  id: 'outdoor-weathered-metal', 
  name: 'Weathered Metal', 
  category: 'outdoor', 
  thumbnail: outdoorWeatheredMetal, 
  prompt: 'oxidized metal surface with rust patina, golden hour tones, industrial artistic texture',
  colorHint: 'linear-gradient(135deg, #CD7F32 0%, #DAA520 50%, #B87333 100%)'
},
{ 
  id: 'outdoor-grass-concrete', 
  name: 'Grass Edge', 
  category: 'outdoor', 
  thumbnail: outdoorGrassConcrete, 
  prompt: 'clean concrete pavement meets lush green grass, modern architectural transition, urban nature',
  colorHint: 'linear-gradient(90deg, #228B22 0%, #C0C0C0 50%, #DCDCDC 100%)'
},
```

**Changes:**
- Line ~28: Add 7 new import statements for thumbnail images
- Line ~258: Insert 7 new background preset objects into `outdoorBackgrounds` array before the closing bracket

### 2. Update Background Thumbnail Generator Edge Function

**File: `supabase/functions/generate-background-thumbnails/index.ts`**

Add the 7 new backgrounds to the `BACKGROUNDS` array with optimized prompts for thumbnail generation:

```typescript
// Add after line 22 (after existing outdoor backgrounds):
{ id: 'outdoor-cactus-garden', prompt: 'Southwestern desert landscape with large prickly pear cactus plants, sandy beige ground, natural desert setting, no people, no products' },
{ id: 'outdoor-cracked-earth', prompt: 'Dry cracked earth surface with deep fissures, drought affected clay ground, dramatic arid texture, no people, no products' },
{ id: 'outdoor-salt-flats', prompt: 'White crystalline salt flat surface with turquoise and green mineral deposits, otherworldly geothermal landscape, no people, no products' },
{ id: 'outdoor-picnic', prompt: 'Red and white gingham checked picnic blanket spread on green grass, casual summer outdoor setting, no people, no products' },
{ id: 'outdoor-rocky-shore', prompt: 'Natural weathered limestone rock surface meeting turquoise clear water, serene coastal spa atmosphere, no people, no products' },
{ id: 'outdoor-weathered-metal', prompt: 'Oxidized rusted metal surface with copper and golden patina, industrial artistic texture with warm tones, no people, no products' },
{ id: 'outdoor-grass-concrete', prompt: 'Clean concrete pavement edge meeting vibrant green grass, modern architectural urban nature transition, no people, no products' },
```

**Changes:**
- Line ~22: Insert 7 new background definition objects into the `BACKGROUNDS` array

### 3. Create Placeholder Thumbnail Assets

While we generate the AI thumbnails, we need placeholder image files so the imports don't break. These will be 1x1 pixel transparent PNGs that get replaced once the thumbnails are generated.

**Files to create:**
- `src/assets/backgrounds/outdoor-cactus-garden.jpg`
- `src/assets/backgrounds/outdoor-cracked-earth.jpg`
- `src/assets/backgrounds/outdoor-salt-flats.jpg`
- `src/assets/backgrounds/outdoor-picnic.jpg`
- `src/assets/backgrounds/outdoor-rocky-shore.jpg`
- `src/assets/backgrounds/outdoor-weathered-metal.jpg`
- `src/assets/backgrounds/outdoor-grass-concrete.jpg`

Each file will be a minimal placeholder image until AI generation completes.

### 4. Generate AI Thumbnails

After code changes are deployed, call the `generate-background-thumbnails` edge function with the specific IDs to generate only the new backgrounds:

```json
POST /generate-background-thumbnails
{
  "ids": [
    "outdoor-cactus-garden",
    "outdoor-cracked-earth", 
    "outdoor-salt-flats",
    "outdoor-picnic",
    "outdoor-rocky-shore",
    "outdoor-weathered-metal",
    "outdoor-grass-concrete"
  ]
}
```

The function will:
- Generate 7 thumbnail images using Gemini Flash Image (google/gemini-2.5-flash-image)
- Upload to Supabase Storage at `brand-assets/bg-thumbnails/{id}.png`
- Return public URLs for each generated thumbnail

### 5. Replace Placeholder Assets

Once thumbnails are generated, download the generated images from the storage URLs and replace the placeholder files in `src/assets/backgrounds/`.

## Impact

**User Experience:**
- Adds 7 new distinctive outdoor background options (58% increase in outdoor backgrounds)
- Total background library grows from 22 to 29 presets
- Provides more specific environmental aesthetics (cactus garden, salt flats, weathered surfaces)
- Better variety for product shoots requiring unique natural textures

**Technical:**
- All new backgrounds integrate seamlessly with existing weather condition system
- Thumbnail generation uses same AI pipeline as existing backgrounds
- No changes to BackgroundSelector UI component needed (automatically renders new options)
- Background prioritization/last-used logic continues to work

## Files Changed

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/presets.ts` | Add 7 new outdoor background presets with imports and definitions |
| `supabase/functions/generate-background-thumbnails/index.ts` | Add 7 new backgrounds to generation array with optimized prompts |
| `src/assets/backgrounds/outdoor-cactus-garden.jpg` | Create placeholder thumbnail asset (to be replaced by AI generation) |
| `src/assets/backgrounds/outdoor-cracked-earth.jpg` | Create placeholder thumbnail asset |
| `src/assets/backgrounds/outdoor-salt-flats.jpg` | Create placeholder thumbnail asset |
| `src/assets/backgrounds/outdoor-picnic.jpg` | Create placeholder thumbnail asset |
| `src/assets/backgrounds/outdoor-rocky-shore.jpg` | Create placeholder thumbnail asset |
| `src/assets/backgrounds/outdoor-weathered-metal.jpg` | Create placeholder thumbnail asset |
| `src/assets/backgrounds/outdoor-grass-concrete.jpg` | Create placeholder thumbnail asset |

## Post-Implementation Steps

1. Deploy code changes
2. Call `generate-background-thumbnails` edge function with new IDs
3. Monitor generation progress (7 thumbnails × ~2 seconds delay = ~14-20 seconds total)
4. Download generated images from storage URLs
5. Replace placeholder assets in `src/assets/backgrounds/`
6. Verify new backgrounds appear in BackgroundSelector UI
7. Test background selection and image generation with new presets
