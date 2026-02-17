# UI Redesign Execution Plan (Reference-Locked)

## Plan Metadata
- **Owner:** OpenCode
- **Project:** SecYourFlow UI/UX redesign
- **Primary Tracker:** `UI.md`
- **Mirror Tracker:** `agents.md` (kept synchronized)
- **Status Convention:**
  - `[ ]` Not started
  - `[x]` Completed
- **Execution Rule:** A phase is only marked complete when all phase tasks and acceptance criteria are complete.

---

## Mandatory Reference Sources (must be followed exactly in style direction)
- `Screens UI Type/stitch (5)/code.html`
- `Screens UI Type/stitch (5)/screen.png`
- `Screens UI Type/stitch (6)/code.html`
- `Screens UI Type/stitch (6)/screen.png`

## Reference Intent To Preserve Across The App
- Cyber-glass visual language with neon-cyan accents.
- Tight alignment system (grid, spacing rhythm, card/table baselines, shell offsets).
- Typography pairing: expressive display headings + tactical mono metadata.
- Operational-console tone (status strips, command/filter bars, high-signal labels).
- Dense but readable SOC-oriented data layouts.
- Fully responsive behavior from mobile to large desktop screens.

---

# Phase 0 - Discovery and Alignment Lock
**Phase status:** `[x] Completed`

## Objective
Lock scope and map references to existing architecture before implementation.

## Completed Checklist
- [x] Located and reviewed all reference assets under `Screens UI Type`.
- [x] Identified shell foundations:
  - [x] `src/components/layout/DashboardLayout.tsx`
  - [x] `src/app/globals.css`
  - [x] `src/app/layout.tsx`
- [x] Identified shared UI primitives:
  - [x] `src/components/ui/PageHeader.tsx`
  - [x] `src/components/ui/Cards.tsx`
- [x] Identified high-impact pages for first-wave migration:
  - [x] `src/app/dashboard/page.tsx`
  - [x] `src/app/vulnerabilities/page.tsx`
  - [x] `src/app/assets/page.tsx`
  - [x] `src/app/users/page.tsx`
- [x] Mapped all pages using `<DashboardLayout>` for staged rollout.

## Acceptance Criteria
- [x] References and target files fully mapped.
- [x] Implementation scope segmented into clear phases.

---

# Phase 1 - Design Token Foundation (Global CSS System)
**Phase status:** `[x] Completed`

## Objective
Create a single, reusable token and utility layer that enforces the reference visual system globally.

## Detailed Tasks
- [x] Refactor `src/app/globals.css` into structured token domains:
  - [x] Surface stack (void, surface, elevated, glass).
  - [x] Accent + semantic palette (neon primary, critical, warning, success, muted neutral).
  - [x] Border/outline opacity tiers.
  - [x] Shadow and glow tiers (soft, neon, critical).
- [x] Introduce reusable utility classes for reference motifs:
  - [x] Glass container and panel utilities.
  - [x] Command-strip and console-bar utilities.
  - [x] Neon badge/chip states.
  - [x] Selected-row rail + gradient highlight patterns.
  - [x] Dense table row/header utility presets.
- [x] Normalize core dimensional system:
  - [x] Spacing scale for section/card/controls.
  - [x] Radius scale for chips, cards, containers.
  - [x] Standardized control heights (inputs, buttons, selects).
- [x] Standardize interaction design:
  - [x] Hover transitions.
  - [x] Focus visuals.
  - [x] Reduced-motion safe behavior.
- [x] Validate light-mode fallback behavior while maintaining dark mode as the primary reference target.

## Acceptance Criteria
- [x] Global tokens are centralized and reused.
- [x] One-off hard-coded style values reduced where token alternatives exist.
- [x] Shared utilities can reproduce reference styles without page-specific hacks.

---

# Phase 2 - Typography and Visual Hierarchy
**Phase status:** `[ ] Not started`

## Objective
Align app-wide typography to reference: strong display headlines, mono tactical labels, clear body text.

## Detailed Tasks
- [ ] Update font loading in `src/app/layout.tsx`:
  - [ ] Display family for section/page headings.
  - [ ] Mono family for telemetry labels, technical IDs, tactical tags.
  - [ ] Body sans family for readability.
- [ ] Define a consistent typographic scale:
  - [ ] Heading tiers across breakpoints.
  - [ ] Label/overline/caption sizing and letter-spacing.
  - [ ] Body and helper text line-height system.
- [ ] Apply hierarchy in shared surfaces:
  - [ ] `PageHeader`
  - [ ] Sidebar labels
  - [ ] Top bar status text
  - [ ] Table headers and metadata badges

## Acceptance Criteria
- [ ] Typography feels reference-consistent on every shell route.
- [ ] Technical labels and IDs have a coherent mono style.
- [ ] Mobile readability remains high with no cramped text blocks.

---

# Phase 3 - App Shell Redesign (Sidebar, Topbar, Main Rail)
**Phase status:** `[ ] Not started`

## Objective
Rebuild shell-level alignment and behavior to match reference rhythm and responsiveness.

## Detailed Tasks
- [ ] Refactor `src/components/layout/DashboardLayout.tsx` sidebar:
  - [ ] Strict icon/text baseline alignment.
  - [ ] Active/hover states using reference-like neon cues.
  - [ ] Section dividers + tactical labels with consistent spacing.
  - [ ] Predictable desktop vs mobile drawer behavior.
- [ ] Refactor top bar:
  - [ ] Status-strip hierarchy and spacing.
  - [ ] Search/command area style consistency.
  - [ ] Notifications and utilities aligned to shared control styling.
- [ ] Main rail consistency:
  - [ ] Sidebar offset math fixed and stable.
  - [ ] Content paddings unified by breakpoint.
  - [ ] No visual jitter when sidebar opens/closes.
- [ ] Mobile hardening:
  - [ ] Overlay and drawer animation quality.
  - [ ] Touch target sizing.
  - [ ] No hidden critical actions.

## Acceptance Criteria
- [ ] Shell is alignment-stable at all breakpoints.
- [ ] No clipping, overlap, or overflow from shell interactions.
- [ ] Sidebar/topbar/content feel like one cohesive system.

---

# Phase 4 - Shared Component System Upgrade
**Phase status:** `[ ] Not started`

## Objective
Upgrade shared components so the redesign propagates consistently across routes.

## Detailed Tasks
- [ ] Redesign `src/components/ui/PageHeader.tsx`:
  - [ ] Tactical badge style.
  - [ ] Action cluster spacing.
  - [ ] Stats row rhythm and icon-shell consistency.
- [ ] Redesign `src/components/ui/Cards.tsx` primitives:
  - [ ] Card shell consistency.
  - [ ] Header/body spacing standards.
  - [ ] Empty-state and table wrapper consistency.
- [ ] Normalize control primitives:
  - [ ] Buttons (`primary`, `secondary`, `ghost`).
  - [ ] Input/select/checkbox styles.
  - [ ] Table row states (hover, selected, focused).
- [ ] Remove duplicated page-local styling where shared components now cover behavior.

## Acceptance Criteria
- [ ] Shared components define the dominant design language.
- [ ] Feature pages use shared styles with minimal overrides.
- [ ] Components remain responsive and accessible.

---

# Phase 5 - Dashboard Page Migration
**Phase status:** `[ ] Not started`

## Objective
Migrate `src/app/dashboard/page.tsx` to the new visual system without changing data semantics.

## Detailed Tasks
- [ ] Restyle header/hero area to command-surface format.
- [ ] Align metric cards to strict baseline grid.
- [ ] Standardize chart card structures and spacing.
- [ ] Normalize priority sections and alert callouts.
- [ ] Ensure list/activity blocks preserve visual rhythm.
- [ ] Keep motion purposeful and minimal.

## Acceptance Criteria
- [ ] Dashboard strongly reflects reference style language.
- [ ] Information hierarchy remains clear under high density.
- [ ] No data or interaction regressions.

---

# Phase 6 - Vulnerability Triage Page Migration
**Phase status:** `[ ] Not started`

## Objective
Transform `src/app/vulnerabilities/page.tsx` into a reference-style triage surface inspired by `stitch (6)`.

## Detailed Tasks
- [ ] Rebuild filter/search strip into command-console style.
- [ ] Refactor queue rows:
  - [ ] Uniform row height and column rhythm.
  - [ ] Consistent chip styling for severity/status/KEV/exploited states.
  - [ ] Strong selected and expanded states.
- [ ] Improve expanded row detail hierarchy:
  - [ ] Workflow transitions placement.
  - [ ] Risk analysis section readability.
- [ ] Standardize footer/pagination strip.
- [ ] Improve mobile metadata stacking for dense rows.

## Acceptance Criteria
- [ ] Queue style and behavior clearly align with `Screens UI Type/stitch (6)` intent.
- [ ] Row-to-row alignment is consistent.
- [ ] Responsive layouts are usable without visual breakage.

---

# Phase 7 - Users and Access Page Migration
**Phase status:** `[ ] Not started`

## Objective
Align `src/app/users/page.tsx` with `stitch (5)` visual language while preserving existing functions.

## Detailed Tasks
- [ ] Rework page header with tactical console identity.
- [ ] Redesign stats blocks with system-consistent glass/neon style.
- [ ] Refactor user listing/table:
  - [ ] Identity, role, and metadata alignment.
  - [ ] Inline role editing control consistency.
  - [ ] Last-active and action column baseline consistency.
- [ ] Restyle side cards (role permissions and access feed).
- [ ] Ensure spacing and border rhythm matches global shell system.

## Acceptance Criteria
- [ ] Users page visibly aligns with `Screens UI Type/stitch (5)` intent.
- [ ] Data remains readable and scannable.
- [ ] Responsive behavior maintains all key interactions.

---

# Phase 8 - Assets Page Migration
**Phase status:** `[ ] Not started`

## Objective
Bring `src/app/assets/page.tsx` list + map modes into the same reference-aligned design system.

## Detailed Tasks
- [ ] Restyle action/filter strips to shared command pattern.
- [ ] Refactor list rows:
  - [ ] Icon, metadata, status, and criticality alignment.
  - [ ] Selection and bulk operations styling consistency.
- [ ] Align side insight cards (distribution, environment, relationships, recent additions).
- [ ] Standardize map mode card/control styles.
- [ ] Ensure modals (lifecycle, discovery, add/edit) use upgraded shared primitives.

## Acceptance Criteria
- [ ] Assets route feels unified with dashboard/vulnerabilities/users.
- [ ] Dense metadata remains readable across breakpoints.
- [ ] No interaction regressions in list/map toggles.

---

# Phase 9 - Remaining DashboardLayout Route Rollout
**Phase status:** `[ ] Not started`

## Objective
Apply final design system to all remaining shell routes for full app consistency.

## Detailed Tasks
- [ ] Migrate remaining key routes:
  - [ ] `src/app/threats/page.tsx`
  - [ ] `src/app/compliance/page.tsx`
  - [ ] `src/app/reports/page.tsx`
  - [ ] `src/app/risk-register/page.tsx`
  - [ ] `src/app/settings/page.tsx`
  - [ ] `src/app/scanners/page.tsx`
  - [ ] `src/app/cves/page.tsx`
  - [ ] Other `DashboardLayout` consumers.
- [ ] Remove style drift and legacy one-off patterns.
- [ ] Normalize header/card/table behavior on each migrated route.

## Acceptance Criteria
- [ ] No old-style islands remain in app-shell pages.
- [ ] Route-to-route visual consistency is preserved.

---

# Phase 10 - Auth and Public Surface Alignment
**Phase status:** `[ ] Not started`

## Objective
Extend redesign language to auth and public pages while preserving usability and conversion clarity.

## Detailed Tasks
- [ ] Migrate auth screens:
  - [ ] `src/app/login/page.tsx`
  - [ ] `src/app/signup/page.tsx`
- [ ] Align auth controls/cards with shared token and component system.
- [ ] Decide and execute public-surface strategy:
  - [ ] Strict shell-style parity, or
  - [ ] Intentional variant using same design tokens.
- [ ] Update public pages accordingly:
  - [ ] `src/app/page.tsx`
  - [ ] policy/legal/contact routes as needed.

## Acceptance Criteria
- [ ] Auth pages are visually integrated with the redesigned app.
- [ ] Public pages follow the chosen strategy consistently.

---

# Phase 11 - Responsive, Accessibility, and QA Hardening
**Phase status:** `[ ] Not started`

## Objective
Finalize quality with responsive checks, accessibility validation, and engineering verification.

## Detailed Tasks
- [ ] Responsive QA at target widths:
  - [ ] 360, 390, 414 (mobile)
  - [ ] 768 (tablet)
  - [ ] 1024 (small laptop)
  - [ ] 1280, 1440+ (desktop)
- [ ] Behavioral QA:
  - [ ] No overflow/clipping.
  - [ ] Stable sticky and drawer behaviors.
  - [ ] Data tables degrade gracefully on small screens.
- [ ] Accessibility QA:
  - [ ] Visible focus states.
  - [ ] Keyboard navigation viability.
  - [ ] Contrast sanity for key text/chips.
- [ ] Motion QA:
  - [ ] Avoid excessive animation.
  - [ ] Respect reduced-motion preferences.
- [ ] Engineering checks:
  - [ ] `npm run lint`
  - [ ] `npm run typecheck`
- [ ] Final alignment polish pass for spacing and baseline precision.

## Acceptance Criteria
- [ ] Lint and typecheck pass.
- [ ] Responsive and accessibility checks pass.
- [ ] Final visual sign-off against references completed.

---

# Completion Log (tick phases as they close)
- [x] Phase 0 - Discovery and Alignment Lock
- [x] Phase 1 - Design Token Foundation
- [ ] Phase 2 - Typography and Visual Hierarchy
- [ ] Phase 3 - App Shell Redesign
- [ ] Phase 4 - Shared Component System Upgrade
- [ ] Phase 5 - Dashboard Migration
- [ ] Phase 6 - Vulnerability Migration
- [ ] Phase 7 - Users Migration
- [ ] Phase 8 - Assets Migration
- [ ] Phase 9 - Remaining DashboardLayout Routes
- [ ] Phase 10 - Auth and Public Surface Alignment
- [ ] Phase 11 - QA Hardening
