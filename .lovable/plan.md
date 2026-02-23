

# Beta Test Password Gate

## Overview
Add a simple password gate that blocks access to the entire application until the user enters the beta password `@dmin1`. This is a client-side gate stored in localStorage — not related to user authentication.

## How It Works
1. On any page load, check localStorage for a `beta_access` flag
2. If not set, show a fullscreen password prompt (styled to match the KittyKat brand)
3. On correct password entry, set the flag and reveal the app
4. The gate wraps the entire app, so it appears before login or any other page

## Changes

### 1. New Component: `src/components/BetaGate.tsx`
- Fullscreen overlay with the KittyKat logo, a password input, and a submit button
- Validates input against the hardcoded password `@dmin1`
- On success, stores `beta_access: true` in localStorage and renders children
- Shows error shake/message on wrong password
- Matches the existing login page aesthetic (glass card, gradient background)

### 2. Wrap App: `src/App.tsx`
- Wrap the entire app content inside `<BetaGate>` so it gates everything, including the login page

```
<BetaGate>
  <BrowserRouter>
    <AuthProvider>
      ...
    </AuthProvider>
  </BrowserRouter>
</BetaGate>
```

## Technical Details

| File | Change |
|------|--------|
| `src/components/BetaGate.tsx` | New file — password gate component with localStorage persistence |
| `src/App.tsx` | Wrap all content in `<BetaGate>` |

No database changes. No edge functions. Pure client-side gate.

