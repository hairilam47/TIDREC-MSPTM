---
name: Admin portal Vite alias
description: The admin portal's @/ alias points to symposium/src, not admin-portal/src — edits to admin pages must go in artifacts/symposium/src/pages/admin/
---

## Rule
When editing any admin portal page component, the file to edit is in `artifacts/symposium/src/pages/admin/`, **not** `artifacts/admin-portal/src/pages/admin/`.

The admin portal's `vite.config.ts` sets:
```
"@": path.resolve(..., "symposium", "src")
```

So all `import "@/pages/admin/..."` imports resolve to `artifacts/symposium/src/pages/admin/`. The identical-looking files under `artifacts/admin-portal/src/pages/admin/` are **never served**.

**Why:** The admin portal was scaffolded to share components with the symposium artifact by aliasing `@/` to symposium's src. Both portals share the same component tree.

**How to apply:** Before touching any admin portal page, check which `src/` the Vite alias points to. For this project, always edit `artifacts/symposium/src/pages/admin/*.tsx` for admin UI changes.
