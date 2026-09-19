# Auth — Clerk (Gated)

Default: `CLERK_ENABLED=false`. The judging flow (Explore → Maxx → Results) is **fully stateless** and never requires login.

---

## When to Enable (Phase 4+, Only If Core Is Done)

- Saves / bookmarks + personal picks.
- Frontend: wrap app in `ClerkProvider` only when the flag is on; gate only the bookmark button.
- Backend: verify Clerk JWT on a future `POST /picks` route. **Not scaffolded yet — don't add until Phase 4.**

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Frontend clerk initialization |
| `CLERK_SECRET_KEY` | Backend JWT verification |

> **Never commit.** Never demo login as the happy path — judges score the stateless flow.
