---
name: Dynamic categories architecture
description: Registration categories are stored in the DB and served via API — no more hardcoded label/fee maps anywhere in the codebase.
---

# Dynamic Registration Categories

## Rule
Never hardcode `CATEGORY_LABELS`, `CATEGORY_FEES`, or `REGISTRATION_TYPES` maps in any component. Always fetch from the API.

**Why:** Categories and pricing are admin-configurable via `/admin/registration-categories`. Any hardcoded map breaks the moment an admin adds, renames, or reprices a category.

## How to apply
- Public (delegates): `useGetRegistrationCategories()` → active categories only, no auth required. Endpoint: `GET /api/registration-categories`
- Admin (all including inactive): `useGetAllRegistrationCategories()` → requires admin session. Endpoint: `GET /api/admin/registration-categories`
- To display a label: `categories.find(c => c.slug === row.category)?.label ?? row.category.replace(/_/g, " ")`
- To auto-fill price: `categories.find(c => c.slug === slug)?.priceMyr`

## Key files
- Schema: `lib/db/src/schema/registration_categories.ts`
- Route: `artifacts/api-server/src/routes/registrationCategories.ts`
- Hooks: `lib/api-client-react/src/generated/api.ts` (search `useGetRegistrationCategories`)
- Admin CRUD page: `artifacts/symposium/src/pages/admin/RegistrationCategories.tsx`
- `users.category` column is plain `text` (was `delegateCategoryEnum` — enum dropped)
