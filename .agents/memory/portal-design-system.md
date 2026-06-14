---
name: Portal Design System
description: Visual design conventions and differentiation rules for admin portal vs customer portal
---

## Portal differentiation
The two portals share a Navy #0B2744 sidebar but are visually differentiated by accent colour:
- **Admin portal** — Gold (#C89B3C) accent. Sidebar header border-bottom 3px solid #C89B3C. Header bar border-top 3px solid #C89B3C. Logo icon bg #C89B3C. "Admin" badge: filled gold (#C89B3C) with white text. Sidebar section label colour rgba(200,155,60,0.5). Active nav item: gold text + left border 2px #C89B3C. Main bg #EEF1F5.
- **Customer portal** — Teal (#0E6E74) accent. Sidebar header border-bottom 3px solid #0E6E74. Header bar border-top 3px solid #0E6E74. Logo icon bg #0E6E74. "Participant Portal" text #4DC8CE. Sidebar section label colour rgba(77,200,206,0.5). Active nav item: teal text + left border 2px #0E6E74. Main bg #F5F7FA.

**Why:** Both portals previously looked identical (same Navy sidebar, same white header) — admins couldn't tell which portal they were in. Gold/teal accent colour language is the single strongest differentiator.

## Shared design tokens (inline, no CSS variables)
- **CARD_STYLE**: `{ border: "1px solid #e9ecef", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }` — apply to all white surface cards
- **Badge / status pill**: `text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize leading-none`
- **Section header**: 14px semibold title + ArrowRight "View all" link at 12px in teal (#0E6E74)
- **Table thead**: bg #f8f9fa, th text 11px semibold uppercase tracking-wider #6c757d, border-bottom #e9ecef
- **Table row**: hover:bg-gray-50, border-bottom #f1f3f5
- **KPI / stat cards**: 3px coloured top accent strip, icon in 9×9 rounded-lg, 28px bold value, 11px uppercase label, 12px muted sub

## Status badge colours (shared across admin and portal)
- submitted: bg #e6f4f5 color #0E6E74
- under_review: bg #fff3cd color #856404
- accepted: bg #d1e7dd color #0a5c39
- rejected: bg #f8d7da color #842029
- revision_requested: bg #fff3cd color #856404 label "Revision Needed" (NOT "Revision")
- paid: bg #d1e7dd color #0a5c39
- pending: bg #fff3cd color #856404
- overdue: bg #f8d7da color #842029
- waived: bg #e6f4f5 color #0E6E74
