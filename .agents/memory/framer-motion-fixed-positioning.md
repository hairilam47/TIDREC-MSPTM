---
name: Framer Motion + modal overlay fixes
description: Three compounding issues cause modals to bleed through on mobile. All three must be fixed together.
---

# Modal overlay bleed-through — three compounding causes

## The rules

### 1. Framer Motion y-transform breaks position:fixed
Any element with a CSS `transform` (Framer Motion's `y` translate) becomes a **new containing block** for `position: fixed` children. Fixed overlays inside a `motion.div` clip to that element, not the viewport.

**Fix:** Use `createPortal(content, document.body)` to escape the React tree. Also remove `y` translate from `AnimatePresence` wrappers — use opacity-only animation. Both applied in AdminLayout.tsx.

### 2. iOS Safari compositor bleed-through
iOS Safari has a rendering bug: when `document.body` is scrollable and a `position:fixed` overlay is open, the background page content renders "through" the overlay during touch compositing. Appears as page content interleaved with modal fields.

**Fix:** Lock body scroll on modal open with `document.body.style.overflow = 'hidden'`; restore on close. Implemented via `useBodyScrollLock()` hook in `form-primitives.tsx`.

### 3. z-index collision with Replit dev-banner
`@replit/vite-plugin-dev-banner` (v0.1.2) injects a `position: fixed; z-index: 9999` banner on `*.replit.dev` URLs. Any modal also using `z-index: 9999` can conflict.

**Fix:** Use `z-index: 99999` (inline style, not Tailwind class) on modal overlays.

### 4. iOS dynamic viewport height
`max-h-[90vh]` is too tall on iOS when the browser chrome (address bar) is visible. Use `max-height: 90dvh` (`dvh` = dynamic viewport height, accounts for browser chrome).

## How to apply
All fixes live in `artifacts/symposium/src/components/ui/form-primitives.tsx`:
- `useBodyScrollLock()` hook — called by both `ModalShell` and `ConfirmDialog`
- `createPortal(content, document.body)` — escapes transform containing blocks
- `style={{ zIndex: 99999 }}` — beats dev-banner and other system overlays
- `maxHeight: "90dvh"` — correct height on iOS Safari

**Why all three matter:** Each fix alone is insufficient. The portal escapes the tree but iOS still bleeds through without scroll lock. Scroll lock alone doesn't fix the transform containing block. z-index alone doesn't fix either.
