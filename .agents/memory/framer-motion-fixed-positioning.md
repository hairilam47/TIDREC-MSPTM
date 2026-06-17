---
name: Framer Motion breaks fixed positioning
description: CSS transforms on motion.div ancestors cause fixed-position modals to clip to the animated element, not the viewport. Fix is React portals.
---

# Framer Motion transforms break `position: fixed` descendants

## The rule
Any element with a CSS `transform` (including Framer Motion's `y` translate) becomes a **new containing block** for `position: fixed` children. Fixed overlays/modals rendered inside a `motion.div` will be clipped to that element, not the full viewport.

**Why:** AdminLayout wraps all page content in `<motion.div initial={{ y: 10 }} animate={{ y: 0 }}>`. Any modal with `fixed inset-0` inside a page is actually `fixed` relative to that `motion.div`, not the browser viewport — so the backdrop never covers the sidebar or header.

**How to apply:** Always render modals and overlays via `ReactDOM.createPortal(content, document.body)`. This escapes all ancestor containing blocks. Applied in `artifacts/symposium/src/components/ui/form-primitives.tsx` — both `ModalShell` and `ConfirmDialog` use `createPortal`. Use z-index `9999` on portalled overlays to clear the admin header's `z-40`.
