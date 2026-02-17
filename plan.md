# UI Redesign Plan (Execution Snapshot)

This document is a concise execution snapshot that complements `UI.md`.
Do not remove details from `UI.md`; keep both files aligned when decisions change.

## Master References (Exact)
- `Screens UI Type/stitch (5)/code.html`
- `Screens UI Type/stitch (5)/screen.png`
- `Screens UI Type/stitch (6)/code.html`
- `Screens UI Type/stitch (6)/screen.png`

## Locked Decisions
- Authenticated app-shell master reference: `stitch (6)`.
- Typography parity target: `stitch (6)`.
- Density profile: `stitch (6) relaxed` for 13-14" laptops.
- Breakpoint density policy:
  - `1024-1440`: relaxed spacing (+8-12%).
  - `>1440`: near-compact spacing for data-heavy views.
- Guardrail: no functionality or backend behavior changes.
  - UI-only changes are allowed (layout, visual styling, typography, spacing, responsiveness).
  - Do not change frontend logic semantics, API usage semantics, or workflow behavior.
  - Do not change backend/API routes, database schema, auth/session behavior, or contract shapes.
- Deferred to Phase 10:
  - `src/app/page.tsx`
  - `src/app/resources/page.tsx`
  - `src/app/terms-of-service/page.tsx`

## Phase Status Snapshot
- [x] Phase 0 - Discovery and Alignment Lock
- [x] Phase 1 - Design Token Foundation
- [x] Phase 2 - Typography and Visual Hierarchy
- [x] Phase 3 - App Shell Redesign
- [ ] Phase 4 - Shared Component System Upgrade
- [ ] Phase 5 - Dashboard Migration
- [ ] Phase 6 - Vulnerability Migration
- [ ] Phase 7 - Users Migration
- [ ] Phase 8 - Assets Migration
- [ ] Phase 9 - Remaining DashboardLayout Routes
- [ ] Phase 10 - Auth and Public Surface Alignment
- [ ] Phase 11 - QA Hardening

## Immediate Next Focus (Phase 4)
- Upgrade shared components and control primitives to the Phase 3 shell baseline.
- Remove remaining one-off route styling in shared UI surfaces.
- Keep redesign strictly UI-only with no functional/backend behavior changes.

## Redo Log
- [x] Phase 1 redone to stitch (6) token baseline with breakpoint density policy.
- [x] Phase 2 redone to stitch (6) typography parity baseline.
