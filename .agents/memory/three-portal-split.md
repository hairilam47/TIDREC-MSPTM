---
name: Three-portal split pattern
description: How customer-portal and admin-portal are thin wrappers around symposium/src with zero code duplication
---

## The pattern

Both `artifacts/customer-portal` and `artifacts/admin-portal` are scaffold artifacts whose **entire page library lives in `artifacts/symposium/src`**. They share code via a Vite alias:

```ts
resolve: {
  alias: {
    "@": path.resolve(import.meta.dirname, "..", "symposium", "src"),
  },
},
server: { fs: { strict: false } }   // required to serve cross-artifact files
```

tsconfig.json paths updated to match:
```json
"paths": { "@/*": ["../symposium/src/*"] }
```

## Auth redirect fix

Symposium's `@/lib/auth.tsx` uses wouter's `setLocation("/login")`. With a wouter `base`, that resolves inside the base (e.g. `/portal/login`). The fix: each new artifact has its **own** `src/lib/auth.tsx` that uses `window.location.href = "/login"` for full-page cross-portal navigation. App.tsx imports from `"./lib/auth"` (relative) not `"@/lib/auth"`.

## Router base

Each new artifact uses `<WouterRouter base="">` (no base). The existing portal/admin page components contain absolute hrefs like `/portal/abstracts/new` — using base="" means these links work unchanged.

**Why:** If `base="/portal"` were used, wouter would prepend the base to all Link hrefs, doubling up the prefix (`/portal/portal/...`).

## Routing by path

- `artifacts/symposium`: `paths = ["/"]` — catch-all
- `artifacts/customer-portal`: `paths = ["/portal/"]` — longer prefix wins
- `artifacts/admin-portal`: `paths = ["/admin/"]` — longer prefix wins

Replit's proxy uses longest-prefix matching, so `/portal/*` and `/admin/*` are served by the dedicated portals; `/`, `/login`, `/register` etc. are served by symposium (Marketing Site).

## Dependencies

Both new artifacts need `@workspace/object-storage-web: workspace:*` in addition to the standard scaffold deps, to match what portal pages (e.g. NewAbstract) import.
