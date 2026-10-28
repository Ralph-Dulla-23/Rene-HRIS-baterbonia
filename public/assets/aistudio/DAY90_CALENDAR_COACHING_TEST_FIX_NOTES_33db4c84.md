# SiBS HRIS — Day 90 Calendar & Coaching Test Runner Fix

Based on the latest uploaded `remix-remix-sibs-hris (5)(1).zip`.

## Changes

1. `src/components/journey/traineeCalendarUtils.ts` — Training calendar maximum date is **start date + 89 days (Day 90 inclusive)**. It no longer extends to the simulated current date after Day 90. Historical Journey records remain accessible in their normal views.
2. `scripts/test-trainer-coaching.ts` — Replaced `import.meta.url`/`fileURLToPath` path resolution with a project-root-relative path. This permits the existing CommonJS-based `scripts/run-local-tests.cjs` to execute the coaching test while remaining compatible with `npm run test:coaching` from the project root.
3. `scripts/test-trainee-calendar.ts` — Five added assertions for expired Day 90 windows and calendar/navigation/assignment boundaries; clarified an old assertion description.

## Test commands (from the project root)

```bash
node scripts/run-local-tests.cjs scripts/test-regression.ts
node scripts/run-local-tests.cjs scripts/test-demo-auth.ts
node scripts/run-local-tests.cjs scripts/test-trainer-coaching.ts
node scripts/run-local-tests.cjs scripts/test-trainee-calendar.ts
node scripts/check-nho-design.mjs
```

With dependencies installed, the existing `npm run test:coaching` / `npm run test:calendar` commands may also be used.

## Results

- Workflow: 125/125 passed
- Demo authentication: 17/17 passed
- Trainer coaching: 18/18 passed (no temporary workaround)
- Calendar: 40/40 passed
- NHO design consistency check: passed
- Coaching UI render smoke checks: 4/4 passed
- Calendar UI render smoke checks: 3/3 passed
- TypeScript/TSX transpilation syntax checks: passed (count reported separately)

**Scope:** No business workflow, styling, authentication, production database, or deployment changes. Full Vite build and visual browser validation not performed without installed dependencies.

## Using flat changed-files ZIP

The changed-files archive contains files without folder paths, as requested. **Replace these existing files rather than adding new copies:**

- `traineeCalendarUtils.ts` → `src/components/journey/traineeCalendarUtils.ts`
- `test-trainee-calendar.ts` → `scripts/test-trainee-calendar.ts`
- `test-trainer-coaching.ts` → `scripts/test-trainer-coaching.ts`

The implementation notes can be kept at the project root if desired.
