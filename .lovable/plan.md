

# Force Logout All Active Sessions

## What This Does
Two changes to ensure every user must re-authenticate:

1. **Invalidate all beta gate sessions** -- Change the localStorage key from `beta_access` to `beta_access_v2`. All existing users will see the password prompt again since their old key no longer matches.

2. **Invalidate all auth sessions** -- No server-side mechanism exists to revoke all JWTs globally. However, changing the beta gate key already forces everyone through the gate again before they can reach any authenticated page.

## Changes

| File | Change |
|------|--------|
| `src/components/BetaGate.tsx` | Change `STORAGE_KEY` from `"beta_access"` to `"beta_access_v2"` |

One line change. Every user will need to re-enter the beta password on their next visit.

