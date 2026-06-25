---
name: CSS var standardisation rules
description: Design token policy and exceptions for admin-portal, customer-portal, and symposium marketing site.
---

## The rule
Zero hardcoded hex (`#RRGGBB`) in any `.tsx` page or component. Always use CSS custom properties from `gentelella-v4.css`.

## Token map
| Hex | CSS var |
|-----|---------|
| `#0B2744` | `var(--navy)` |
| `#0E6E74` | `var(--teal)` |
| `#C89B3C` | `var(--gold)` |
| success green | `var(--status-success-bg/text)` |
| warning amber | `var(--status-warning-bg/text)` |
| danger red | `var(--status-danger-bg/text/border)` |
| light gold bg | `var(--gold-lt)`, dark `var(--gold-dk)` |
| light teal bg | `var(--teal-lt)`, dark `var(--teal-dk)` |
| muted text | `var(--text-muted)`, secondary `var(--text-secondary)`, disabled `var(--text-disabled)` |
| surface bg | `var(--bg-surface)`, secondary `var(--bg-surface-secondary)` |
| borders | `var(--border-color)`, light `var(--border-color-light)` |
| error inline | `var(--red)` |

## Accepted exceptions
1. **Recharts data-viz** — `fill=`, `stroke=`, `stopColor=` attrs on SVG/recharts elements stay as hex (library requirement).
2. **`#fff` structural white** — acceptable for text-on-dark-bg where a var would be awkward.
3. **Print HTML template in Reports.tsx** — inline `<style>` injected into a new `window.open()` context; app CSS vars are not guaranteed to resolve there. Hex stays in that template string.
4. **`rgba(...)` with no hex component** — allowed (e.g. `rgba(200,155,60,0.15)` for translucent gold).

## Architecture reminder
- `admin-portal` Vite aliases `@` → `artifacts/symposium/src` — all shared pages live there.
- CSS vars defined in `artifacts/symposium/src/gentelella-v4.css`, imported by all three apps.
- Admin portal: `var(--primary)` = gold. Customer portal: `var(--primary)` = teal.
- `localStorage` key `satbds_token` — do NOT rename.
- Do NOT modify `form-primitives` components.

**Why:** Enforces consistent theming across all portals and makes future brand-colour updates a single-file change in gentelella-v4.css.
