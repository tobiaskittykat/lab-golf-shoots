

# Hide Bottom Floating Bar in Set-Up Product Mode

## Problem
The Set-Up Product flow has its own "Generate N Product Images" button built into the `SetupProductStep2` component. The floating bottom bar (which also has a Generate button) is redundant and confusing in this mode -- it shows a second generate button with different logic.

## Solution
Add a condition to hide the floating footer bar when `shootMode === 'setup'`.

## Change

### File: `src/components/creative-studio/CreativeStudioWizard.tsx`

**Line 1001**: Add `shootMode !== 'setup'` to the floating footer condition.

Change:
```
{floating.active && state.step === 2 && (
```
to:
```
{floating.active && state.step === 2 && !(state.useCase === 'product' && state.productShoot.shootMode === 'setup') && (
```

This hides the entire floating bottom bar (Back, indicators, Generate button) only when in Set-Up Product mode, while keeping it for New Shoot, Remix, and all lifestyle flows.

