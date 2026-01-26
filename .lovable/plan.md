

# Fix: Moodboard Quality Issues - Ancient Pottery Problem

## Problem Summary

Your "Mediterranean summer, terracotta, golden hour" moodboard included Greek pottery artifacts instead of beautiful Mediterranean lifestyle imagery because:

1. **AI Ranking Skipped**: The quality filter only runs when there are >12 images. With exactly 12, it was bypassed entirely
2. **"Terracotta" matched artifacts**: Openverse returned ancient Greek pottery for the "terracotta" search term
3. **No minimum quality threshold**: Even low-scoring images aren't filtered out - they're just sorted

## Root Cause

```typescript
// Line 103-106 in build-moodboard/index.ts
if (images.length <= 12) {
  return images;  // <-- SKIPS ALL RANKING!
}
```

## Solution

### 1. Always Run AI Quality Ranking

Remove the skip condition so ranking ALWAYS happens, even for small result sets.

### 2. Add Minimum Quality Threshold

Filter out images that score below 40/100 - this would eliminate obviously irrelevant results like ancient pottery.

### 3. Improve Ranking Prompt

Update the AI prompt to be more strict about relevance:
- Explicitly instruct to score 0-20 for completely irrelevant images (artifacts, museums, unrelated subjects)
- Add examples of what should score low
- Consider the "vibe" not just literal keyword matches

### 4. Smarter Search Terms

Add a filter in the search term expansion to avoid literal interpretations:
- "terracotta" should become "terracotta color", "terracotta tiles", "warm earth tones"
- NOT just "terracotta" which matches pottery artifacts

---

## Technical Changes

### File: `supabase/functions/build-moodboard/index.ts`

**Change 1: Remove skip condition (lines 103-106)**
```typescript
// BEFORE
if (images.length <= 12) {
  return images;
}

// AFTER
// Remove this entirely - always rank images
```

**Change 2: Add quality threshold (after line 163)**
```typescript
// Sort by score descending
scored.sort((a, b) => (b.score || 0) - (a.score || 0));

// NEW: Filter out low-quality images (score < 40)
const filtered = scored.filter(img => (img.score || 0) >= 40);

// Return filtered or at least top 3 if all filtered
return filtered.length >= 3 ? filtered : scored.slice(0, 6);
```

**Change 3: Improve ranking prompt (lines 119-128)**
```typescript
content: `You are a visual curator for fashion/lifestyle moodboards. Score images 0-100 based on how well they match: "${mood}"

SCORING GUIDE:
- 80-100: Perfect match - modern lifestyle photography, correct mood/aesthetic
- 60-79: Good match - relevant subject, some mood alignment
- 40-59: Partial match - somewhat relevant but not ideal
- 20-39: Poor match - tangentially related, wrong vibe
- 0-19: REJECT - completely irrelevant (museum artifacts, unrelated subjects, stock graphics)

CRITICAL: Score 0-19 for:
- Ancient artifacts, museum pieces, historical items
- Random stock photos unrelated to the mood
- Text-heavy graphics or logos
- Low-quality or blurry images

The mood is LIFESTYLE/FASHION oriented - prefer contemporary photography over historical/archival content.`
```

**Change 4: Smarter search term generation (lines 39-67)**

Update the AI prompt to generate aesthetic-focused terms:
```typescript
content: `Generate 10-12 SHORT search terms for finding ${style} imagery matching: "${mood}"

RULES:
1. Terms must be 1-3 words maximum
2. Focus on AESTHETIC/VISUAL terms, not literal objects
3. For colors like "terracotta", use: "terracotta tones", "warm earth palette", "rust color aesthetic"
4. Include: lighting moods, textures, settings, color palettes
5. AVOID terms that could match museum/artifact imagery

Example for "Mediterranean summer":
GOOD: "golden hour beach", "olive grove", "white linen", "warm sunset"
BAD: "Mediterranean" (too vague), "terracotta" (matches pottery)`
```

---

## Expected Results After Fix

| Before | After |
|--------|-------|
| 6 golden hour photos + 6 ancient Greek pottery | 12 Mediterranean lifestyle images |
| No quality filtering | Images below 40/100 rejected |
| Literal "terracotta" search | "terracotta tones", "warm earth" |
| Pottery artifacts included | Only modern photography |

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/build-moodboard/index.ts` | Remove skip condition, add quality threshold, improve prompts |

---

## Summary

The fix ensures:
1. AI ranking ALWAYS runs (no skip for small result sets)
2. Low-quality images (ancient pottery) are filtered out
3. Search terms are aesthetic-focused, not literal
4. Minimum quality threshold prevents irrelevant images from appearing

