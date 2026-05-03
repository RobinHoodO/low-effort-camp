# Low Effort Camp — Redesign Spec

## Mission
Rebuild the UI to be bright, light, and minimalist. Sync both ways with Google Sheets.

## Visual Direction
- **Theme**: Light mode only. White/off-white backgrounds.
- **Palette**: 
  - Background: `#ffffff`, `#f8f9fa`, `#f1f3f4`
  - Text: `#1a1a1a`, `#5f6368`, `#9aa0a6`
  - Accent: `#e8710a` (warm orange) — sparingly
  - Success: `#34a853`, Warning: `#f9ab00`, Danger: `#ea4335`
- **Typography**: Clean, airy. `font-sans` with generous line-height.
- **Spacing**: More whitespace. Less borders, more subtle dividers.
- **Cards**: Subtle shadow (`shadow-sm`, `shadow-md`), rounded-xl, white bg.
- **No dark mode**. Remove all dark/zinc/slate color classes.

## Layout Simplification
- **Single sidebar** (desktop), **bottom nav** (mobile) — keep but lighter
- **Dashboard** becomes the single source of truth — editable inline
- **Remove separate pages** where possible — use tabs/modals instead
  - Keep: Dashboard, Shifts, Points
  - Merge: Campers + Layout + Kitchen into Dashboard as sections/tabs
- **Top bar**: Just the camp name + identity selector

## Dashboard Structure (editable inline)
1. **Identity bar** — who you are, quick switch
2. **Stats row** — campers, peak day, transport, dietary — compact pills
3. **My Status** (if logged in) — points, shifts, attendance — editable
4. **Timeline** — attendance per day — click to toggle your status
5. **Campers** — clean list, expandable rows, inline edit
6. **Shifts** — sign up directly from dashboard or go to Shifts page
7. **Points** — mini leaderboard, expand for details
8. **Alerts** — low points, missing transport, dietary

## Google Sheets Sync
- Replace localStorage with API calls to Google Apps Script
- Read on load, write on change
- Optimistic UI + sync indicator
- Fallback to localStorage if offline

## API Surface (Google Apps Script)
```
GET  ?action=getAll              → full camp data
POST ?action=updateShift         → {shiftId, day, name, add}
POST ?action=updateAttendance    → {camperId, day, status}
POST ?action=updateCamper        → {camperId, field, value}
POST ?action=updateKitchen       → {index, field, value}
POST ?action=updateExtraPoints   → {name, additional, reason}
```

## File Changes
- `src/index.css` — rebuild with light theme tokens
- `src/App.tsx` — simplify routing, add API provider
- `src/hooks/useCampData.ts` — replace with API-backed version
- `src/components/layout/AppShell.tsx` — light redesign
- `src/pages/Dashboard.tsx` — complete rebuild, inline editing
- `src/pages/Shifts.tsx` — lighter design
- `src/pages/Points.tsx` — lighter design
- Remove: Layout.tsx, Kitchen.tsx (merge into Dashboard)
