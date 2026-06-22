---
name: Shared component BASE_URL pitfall
description: Why shared symposium components must use absolute /api paths, not import.meta.env.BASE_URL
---

## Rule
Any file under `artifacts/symposium/src/` that constructs API URLs must use hardcoded absolute `/api` paths, never `import.meta.env.BASE_URL`.

**Why:** The admin portal's vite.config.ts has `"@": path.resolve(import.meta.dirname, "..", "symposium", "src")` — its `@/` alias points directly into the symposium src tree. When a symposium component (e.g. ImageUploadField, resolveImageUrl) runs inside the admin portal build, `import.meta.env.BASE_URL` evaluates to `/admin/` (the admin portal's BASE_PATH), producing `/admin/api/...` URLs that 404 on the reverse proxy.

**How to apply:**
- In shared components/libs: always write `const API = "/api"` or `/api/...` literally.
- Only use `import.meta.env.BASE_URL` for things that truly belong to one specific artifact (e.g. asset paths in the symposium marketing site).
- Affected files already fixed: `ImageUploadField.tsx`, `resolveImageUrl.ts`.
