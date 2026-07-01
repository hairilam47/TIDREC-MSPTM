---
name: Gentelella layout CSS
description: gentelella-v4.css is the admin/portal layout stylesheet; it must be imported in main.tsx
---

`artifacts/symposium/src/gentelella-v4.css` is the layout system for the admin and delegate portals. It defines:
- CSS custom properties for the shell (`body[data-shell="admin"]`, `body[data-shell="portal"]`)
- Sidebar structure (`.sidebar`, `.sidebar-nav`, `.sidebar-brand`, `.sidebar-footer`)
- Body-level layout classes (`.sidebar-rail`, `.sidebar-open`)
- Card, table, badge, and status-colour utilities used throughout admin/portal pages
- Design tokens (`--primary`, `--body-bg`, `--text`, `--border-color`, etc.)

It is imported in `artifacts/symposium/src/main.tsx` as:
```ts
import "./gentelella-v4.css";
```

**Why:** When the admin and portal pages were standalone artifacts they had their own CSS entry points. After consolidation into the symposium, only `index.css` was wired up, orphaning this file. Without it, all admin/portal layout styling disappears — sidebars collapse to unstyled text.

**How to apply:** Any time you touch `main.tsx` or add a new CSS entry point, verify both `index.css` AND `gentelella-v4.css` are imported. Never remove the gentelella import.
