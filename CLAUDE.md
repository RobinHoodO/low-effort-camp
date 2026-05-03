# Low Effort Leftovers — Camp Management App

## Project Overview

A burner camp management webapp for **Low Effort Leftovers** camp at **Borderland 2026**. The camp runs from Aug 15 (build) through Aug 27 (strike). This app replaces the Google Sheets mess with a clean, mobile-friendly dashboard that works offline.

## Tech Stack

- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS v4** for styling
- **shadcn/ui** components (installed via CLI)
- **localStorage** for persistence (no backend — this is a burner camp)
- **Export/Import JSON** for data portability between devices
- Static export deployable to GitHub Pages

## Core Features

### 1. Dashboard (Home)
- Camp stats: total campers, how many confirmed for each day, transport summary (cars vs needs rides), dietary restrictions summary
- Visual timeline showing Build (Aug 15-19) → Borderland (Aug 20-26) → Strike (Aug 27)
- Alert cards: who hasn't signed up for enough shifts (needs 3 points), who has missing transport info
- Quick actions: export data, import data, copy emergency contact list

### 2. Campers (Roster)
- Filterable/searchable table of all campers
- Columns: name, membership status, camp fee paid, email, phone, dietary, allergies, transport, attendance
- Attendance shown as a mini timeline (X = confirmed, ? = maybe, empty = no)
- Click a camper to open detail modal with full info
- Inline edit capability (double-click or edit button)
- Sort by any column

### 3. Shifts (Rotas)
- Interactive shift board organized by category: LNT, Breakfast, Dinner
- Each shift shows: name, day slots (Mon-Sun), points value, who signed up, notes
- Click an empty slot to sign someone up (dropdown of camper names)
- Click a filled slot to remove someone
- Visual indicators for shift fullness
- Total points counter per person shown alongside
- "My Shifts" filter to see one person's schedule

### 4. Points Tracker
- Table showing each camper's points breakdown
- Columns: name, total points, 1-pt shifts, 2-pt shifts, 3-pt shifts, additional points, status
- Status: green (≥3 pts), yellow (1-2 pts), red (0 pts)
- Special rule: if not doing build/strike, need 5 points
- Build/strike bonus (+4), lead role bonus (+3), Fri/Sat dinner bonus (+2)

### 5. Camp Layout
- Simple list view of tent/RV spacing assignments
- Shows who, size, type (tent/RV/bobil), notes

### 6. Kitchen Inventory
- List of gear with provider, bringer, notes
- Checkbox to mark "confirmed brought"

## Data Model

See `src/data/seed-data.ts` for the full initial dataset. Key types:

```ts
interface Camper {
  id: number;
  name: string;
  membership: boolean;
  campFeePaid: boolean;
  email: string;
  phone: string;
  dietary: string;
  allergies: string;
  transport: string;
  spacingAdded: boolean;
  attendance: Record<string, 'confirmed' | 'maybe' | 'no'>;
}

interface Shift {
  id: string;
  category: 'LNT' | 'Breakfast' | 'Dinner' | 'Pre-Dinner';
  name: string;
  days: Record<string, string[]>; // day -> array of camper names
  points: number;
  slots: number | null;
  notes: string;
}

interface CamperPoints {
  name: string;
  total: number;
  onePoint: number;
  twoPoint: number;
  threePoint: number;
  additional: number;
  reason: string;
}
```

## Design System

- **Dark theme** by default (burner aesthetic): bg `#0a0a0f`, surface `#14141f`, border `#252535`
- **Accent color**: amber/orange `#f59e0b` (fire/camp vibe)
- **Success**: green `#22c55e`, **Warning**: yellow `#eab308`, **Danger**: red `#ef4444`
- **Typography**: Inter or system sans-serif
- Mobile-first responsive design

## Key UI Patterns

- All tables should be horizontally scrollable on mobile
- Use cards for dashboard stats
- Modals for detail views and editing
- Toast notifications for actions (shift signed up, data exported, etc.)
- Sticky header on tables
- Search/filter bar above every list

## Data Persistence

- All data stored in `localStorage` under key `low-effort-camp-data`
- Auto-save on every change (debounced 500ms)
- "Export Data" button downloads JSON file
- "Import Data" button accepts JSON file upload and merges/replaces
- On first load, seed data from `seed-data.ts` is loaded

## Pages/Routes

Using React Router v7 (or wouter for simplicity):
- `/` — Dashboard
- `/campers` — Roster
- `/shifts` — Shift board
- `/points` — Points tracker
- `/layout` — Camp layout
- `/kitchen` — Kitchen inventory
- Bottom nav bar on mobile, sidebar on desktop

## Build & Deploy

- `npm run build` produces static files in `dist/`
- `npm run deploy` pushes `dist/` to `gh-pages` branch
- Configure GitHub Pages to serve from `gh-pages` branch

## File Structure

```
src/
  components/
    ui/           # shadcn components
    layout/       # Nav, Sidebar, BottomNav
    campers/      # CamperTable, CamperModal
    shifts/       # ShiftBoard, ShiftSlot
    dashboard/    # StatCards, Timeline
    points/       # PointsTable
  data/
    seed-data.ts  # Initial camp data
    types.ts      # TypeScript interfaces
  hooks/
    useCampData.ts   # localStorage CRUD
    useExport.ts     # JSON export/import
  pages/
    Dashboard.tsx
    Campers.tsx
    Shifts.tsx
    Points.tsx
    Layout.tsx
    Kitchen.tsx
  App.tsx
  main.tsx
```

## Important Notes

- This app is for ~30 people at a burner camp. Performance is not a concern.
- No authentication needed — it's a shared device/browser app.
- The app must work fully offline after first load (no external API calls).
- Keep it FUN — burner culture is playful. Add small delights: emoji, camp fire animations, etc.
- The seed data represents the CURRENT state from the Google Sheets. Preserve all names, emails, signed-up shifts, etc.
