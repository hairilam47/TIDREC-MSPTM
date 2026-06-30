---
name: Symposium SPA routing
description: How path routing works for the symposium single-artifact SPA (marketing + admin + portal)
---

The symposium is a single Vite SPA at port 24486, registered with `previewPath = "/"`.
The Replit internal proxy at `localhost:80` correctly routes ALL paths (including `/admin/*`
and `/portal/*`) to this port — confirmed by curl returning 200.

When `/admin/` or `/portal/*` shows "404 Page Not Found — Did you forget to add the page
to the router?", the cause is **always the Wouter React Router inside the SPA**, not the
Replit proxy. The platform hands the HTML shell to the browser fine; it's the client-side
router that has no matching route.

**Why:** The admin and portal page components were built but never imported/registered in
`App.tsx`. Every new page added under `src/pages/admin/` or `src/pages/portal/` must also
get an import and a `<Route path="..." component={...} />` in `App.tsx`.

**How to apply:** When adding a new admin or portal page:
1. Create the component in `artifacts/symposium/src/pages/admin/` or `.../portal/`
2. Import it in `artifacts/symposium/src/App.tsx`
3. Add a `<Route path="/admin/your-page" component={YourPage} />` inside `<Switch>`

Route ordering: place specific portal/admin routes BEFORE the catch-all `<Route component={NotFound} />`.
