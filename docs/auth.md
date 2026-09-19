# Auth (Clerk — gated)

Default: `CLERK_ENABLED=false`. Judging flow (Explore → Maxx → results) is fully stateless and never requires login.

## When to enable (Phase 4+, only if core done)
- Saves/bookmarks + personal picks.
- Frontend: wrap app in `ClerkProvider` only when flag on; gate only the bookmark button.
- Backend: verify Clerk JWT on a future `POST /picks` route (not scaffolded — don't add until Phase 4).

## Env
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`. Never commit. Never demo login as the happy path — judges score the stateless flow.
