
# Fix "Reset to Default" Button in AI Settings

## Summary

The "Reset to Default" buttons in the AI Settings page are not working correctly. The issue is that the prompt state variables are initialized with empty strings (`""`), but the disabled state comparison checks against the default prompt constants. This creates a timing issue during initial load.

---

## Root Cause

| Issue | Current Code | Problem |
|-------|-------------|---------|
| Initial state | `useState("")` | Empty strings don't match defaults |
| Disabled check | `disabled={prompt === DEFAULT_*}` | Always `false` initially |
| Effect timing | Sets defaults in `useEffect` | Race condition with renders |

When the page loads:
1. State initializes to `""`
2. Component renders with button enabled (since `"" !== DEFAULT_*`)
3. Effect runs and sets state to default
4. Button should now be disabled

But if the user clicks before step 3 completes, or if the comparison fails due to the initial empty state, the button appears clickable when it shouldn't be.

---

## Solution

Initialize all prompt state variables with their default values instead of empty strings. This ensures:
1. Buttons are correctly disabled from the first render
2. No race condition with useEffect
3. Consistent behavior regardless of timing

---

## Changes

### File: `src/pages/Settings.tsx`

**Lines 34-40 - Update initial state:**

```typescript
// Before
const [conceptPrompt, setConceptPrompt] = useState("");
const [promptAgentPrompt, setPromptAgentPrompt] = useState("");
const [onFootPrompt, setOnFootPrompt] = useState("");
const [lifestylePrompt, setLifestylePrompt] = useState("");
const [productFocusPrompt, setProductFocusPrompt] = useState("");

// After
const [conceptPrompt, setConceptPrompt] = useState(DEFAULT_CONCEPT_AGENT_PROMPT);
const [promptAgentPrompt, setPromptAgentPrompt] = useState(DEFAULT_PROMPT_AGENT_PROMPT);
const [onFootPrompt, setOnFootPrompt] = useState(DEFAULT_ON_FOOT_SHOT_PROMPT);
const [lifestylePrompt, setLifestylePrompt] = useState(DEFAULT_LIFESTYLE_SHOT_PROMPT);
const [productFocusPrompt, setProductFocusPrompt] = useState(DEFAULT_PRODUCT_FOCUS_SHOT_PROMPT);
```

This single change ensures:
- Buttons are disabled correctly when prompts match defaults
- Reset works immediately when user HAS customized prompts
- No empty state flicker during initial load

---

## Technical Details

The `useEffect` on lines 52-63 will still run and update the state if custom prompts exist in `brand_context.aiPrompts`. But now:
- If no custom prompts exist: state already has defaults, no change needed
- If custom prompts exist: state updates to custom values, button becomes enabled
- Clicking reset: sets back to default, button becomes disabled

---

## Testing

After the fix:
1. Load Settings page → all "Reset to Default" buttons should be disabled (showing defaults)
2. Edit any prompt → button becomes enabled
3. Click "Reset to Default" → textarea reverts to default, button becomes disabled
4. Save with custom prompt, reload → button should be enabled
5. Click reset → works correctly
