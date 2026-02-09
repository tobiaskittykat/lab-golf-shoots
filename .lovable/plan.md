

# Infuse Birkenstock Campaign Aesthetic into Outdoor Backgrounds

## Scope

**Outdoor backgrounds only** (19 total). Studio backgrounds stay untouched -- as your reference photos confirm, Birkenstock studio shoots use clean, bright white backdrops, so those prompts are already correct.

## What's Wrong Today

The current outdoor prompts read like stock photography descriptions: "soft sandy beach background, golden hour sunlight, ocean in distance, relaxed coastal vibe." They produce generic travel-blog imagery rather than the grounded, tactile, editorially crafted settings that define Birkenstock campaign photography.

## Birkenstock Outdoor DNA

Every outdoor prompt will be rewritten with these principles drawn from actual Birkenstock campaigns:

- **Raw natural textures** over polished scenery -- sun-baked stone, wind-worn wood, wild meadow grass
- **Earthy, muted tones** -- sand, terracotta, sage, ochre, stone grey -- not oversaturated postcard colors
- **Editorial composition language** -- "soft depth of field," "natural imperfections," "organic irregularity"
- **Mediterranean / European sensibility** -- cobblestones, aged sandstone, olive groves, artisan markets
- **Grounded warmth** -- golden hour but not "vacation sunset"; more contemplative, quiet, crafted

## Changes (3 files + 19 thumbnail regenerations)

### 1. `src/components/creative-studio/product-shoot/presets.ts`

Rewrite the `prompt` field for all 19 outdoor backgrounds. Studio backgrounds remain unchanged.

| ID | Current Prompt | New Birkenstock-Style Prompt |
|---|---|---|
| outdoor-beach | "soft sandy beach background, golden hour sunlight, ocean in distance, relaxed coastal vibe" | "warm golden sand with natural ripple texture, soft golden hour light, distant ocean blur, raw coastal Mediterranean atmosphere, Birkenstock summer campaign" |
| outdoor-urban | "urban city street background, modern architecture, stylish metropolitan setting" | "sun-warmed cobblestone European side street, aged sandstone walls, warm afternoon light with long shadows, lived-in urban character, Birkenstock city editorial" |
| outdoor-park | "lush green park setting, dappled sunlight through trees, natural fresh atmosphere" | "wild meadow grass with wildflowers, dappled golden sunlight through mature trees, natural organic parkland, Birkenstock nature campaign" |
| outdoor-cafe | "charming European cafe terrace, cobblestone street, bistro chairs, warm afternoon light" | "weathered wooden bistro table on aged cobblestones, terracotta-toned walls, warm Mediterranean afternoon light, artisan cafe culture, Birkenstock European editorial" |
| outdoor-desert | "dramatic desert landscape, sand dunes, warm golden hour light, minimalist vast backdrop" | "sculptural desert dune with wind-carved ridges, warm amber golden hour, vast minimalist landscape, raw earth textures, Birkenstock nature campaign" |
| outdoor-forest | "serene forest path, filtered sunlight through trees, natural earthy tones, peaceful setting" | "dappled light through ancient oak canopy, moss-covered forest floor, rich earthy greens and browns, organic natural sanctuary, Birkenstock woodland editorial" |
| outdoor-rooftop | "modern rooftop setting, city skyline in background, golden hour, urban lifestyle" | "weathered terracotta rooftop terrace, potted olive trees, warm golden hour cityscape, Mediterranean lifestyle, Birkenstock summer editorial" |
| outdoor-pool | "luxury poolside setting, turquoise water, white deck, resort vibes, bright daylight" | "natural stone pool edge with sun-warmed travertine deck, turquoise water reflections, Mediterranean resort warmth, Birkenstock summer campaign" |
| outdoor-mountain | "mountain hiking trail, scenic overlook, adventurous outdoor setting, natural beauty" | "rugged mountain trail with worn natural stone, alpine wildflowers, expansive valley vista, raw outdoor adventure, Birkenstock hiking editorial" |
| outdoor-vineyard | "rolling vineyard hills, golden afternoon light, Tuscan countryside aesthetic, sophisticated" | "sun-drenched vineyard rows with gnarled old vines, golden Tuscan light, terracotta earth between rows, artisanal wine country, Birkenstock countryside editorial" |
| outdoor-boardwalk | "wooden boardwalk by the sea, coastal breeze, vacation vibes, relaxed summer setting" | "sun-bleached weathered timber boardwalk, natural wood grain and patina, coastal salt air atmosphere, Birkenstock seaside campaign" |
| outdoor-market | "vibrant street market, colorful stalls, bustling atmosphere, authentic local setting" | "artisan outdoor market with handwoven textiles and ceramics, warm natural materials, Mediterranean bazaar atmosphere, Birkenstock cultural editorial" |
| outdoor-cactus-garden | "southwestern desert setting with prickly pear cactus, sandy beige ground, natural desert flora backdrop" | "southwestern desert garden with sculptural prickly pear cactus, warm sandy earth, terracotta and sage tones, raw natural desert flora, Birkenstock desert editorial" |
| outdoor-cracked-earth | "dry cracked earth surface, deep fissures in clay ground, dramatic arid landscape texture" | "sun-baked cracked clay earth with deep fissures, warm ochre and sienna tones, raw elemental texture, Birkenstock earth editorial" |
| outdoor-salt-flats | "white crystalline salt flat surface, turquoise mineral deposits, otherworldly natural phenomenon" | "crystalline salt flat surface with mineral deposits, otherworldly natural landscape, warm reflected light, raw geological wonder, Birkenstock nature editorial" |
| outdoor-picnic | "red gingham picnic blanket on green grass, casual outdoor lifestyle setting, summer day" | "faded vintage gingham blanket on wild meadow grass, casual golden afternoon, handmade wicker basket vibe, Birkenstock lifestyle editorial" |
| outdoor-rocky-shore | "natural limestone rock surface, turquoise water edge, spa-like serene coastal setting" | "sun-warmed limestone rocks meeting clear turquoise shallows, natural coastal erosion texture, Mediterranean cove atmosphere, Birkenstock coastal editorial" |
| outdoor-weathered-metal | "oxidized metal surface with rust patina, golden hour tones, industrial artistic texture" | "naturally oxidized copper and iron surface with warm patina, golden rust tones, industrial craft texture with organic aging, Birkenstock artisan editorial" |
| outdoor-grass-concrete | "clean concrete pavement meets lush green grass, modern architectural transition, urban nature" | "raw concrete slab edge meeting wild grass and clover, warm natural light, architectural meets organic, Birkenstock urban nature editorial" |

### 2. `supabase/functions/generate-image/index.ts`

Two changes:
- **Update all 19 outdoor entries** in the `backgroundPresets` lookup (lines 225-236) with the same new Birkenstock-style prompts
- **Add the 7 missing outdoor backgrounds** (`outdoor-cactus-garden`, `outdoor-cracked-earth`, `outdoor-salt-flats`, `outdoor-picnic`, `outdoor-rocky-shore`, `outdoor-weathered-metal`, `outdoor-grass-concrete`) that were never added to this file

Studio entries remain unchanged.

### 3. `supabase/functions/generate-background-thumbnails/index.ts`

Two changes:
- **Rewrite all 19 outdoor thumbnail prompts** (lines 24-42) with Birkenstock editorial language
- **Update the generation style instructions** (line 58) to enforce Birkenstock campaign photography aesthetic for outdoor settings:

```
"Generate a background preview image in the style of a Birkenstock campaign photograph.

Setting: {prompt}

Style requirements:
- Empty background only, absolutely no products, people, or objects
- Natural, earthy, grounded aesthetic -- NOT stock photography
- Warm natural lighting with organic textures visible
- Editorial photography feel with tactile materiality
- Muted, earthy color palette -- sand, terracotta, sage, stone
- 4:3 aspect ratio composition
- Suitable as a small selection thumbnail"
```

Studio backgrounds keep using the current neutral generation prompt.

### 4. Regenerate all 19 outdoor thumbnails

After deploying the updated edge function, trigger thumbnail generation for all outdoor backgrounds:

```json
POST /generate-background-thumbnails
{
  "ids": [
    "outdoor-beach", "outdoor-urban", "outdoor-park", "outdoor-cafe",
    "outdoor-desert", "outdoor-forest", "outdoor-rooftop", "outdoor-pool",
    "outdoor-mountain", "outdoor-vineyard", "outdoor-boardwalk", "outdoor-market",
    "outdoor-cactus-garden", "outdoor-cracked-earth", "outdoor-salt-flats",
    "outdoor-picnic", "outdoor-rocky-shore", "outdoor-weathered-metal",
    "outdoor-grass-concrete"
  ]
}
```

Download the generated images and replace all 19 `src/assets/backgrounds/outdoor-*.jpg` files.

## Files Changed

| File | Change |
|---|---|
| `src/components/creative-studio/product-shoot/presets.ts` | Rewrite 19 outdoor `prompt` fields with Birkenstock editorial language (studio untouched) |
| `supabase/functions/generate-image/index.ts` | Update 12 outdoor prompts + add 7 missing outdoor backgrounds to `backgroundPresets` lookup |
| `supabase/functions/generate-background-thumbnails/index.ts` | Rewrite 19 outdoor thumbnail prompts + add Birkenstock-specific generation style for outdoor |
| `src/assets/backgrounds/outdoor-*.jpg` (19 files) | Regenerate all outdoor thumbnails with Birkenstock aesthetic |

## What Stays Unchanged

- All 10 studio backgrounds (prompts, thumbnails, and `generate-image` entries) -- Birkenstock studio shoots use clean white/neutral backdrops, which the current prompts already deliver
- No frontend component changes needed -- BackgroundSelector automatically renders whatever is in the presets array
- Weather condition system continues to work as-is with the new prompts
