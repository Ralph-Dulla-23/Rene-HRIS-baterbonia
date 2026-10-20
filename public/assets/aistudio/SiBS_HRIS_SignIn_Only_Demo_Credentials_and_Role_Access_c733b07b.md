# SiBS HRIS — Sign-In Only, Demo Credentials & Role-Based Access

## Purpose

This is a **Google AI Studio functional wireframe/prototype** of the SiBS HRIS. Its login exists to demonstrate how roles determine the home dashboard, sidebar navigation, NHO workspace, and Employee Journey information. It does **not** provide production authentication or security.

## Login UI

- Keep the existing centered SiBS-branded login card, navy background, orange action button, and HRIS typography.
- **Sign In only.** No Sign Up tab, registration form, or user-created accounts.
- Fields: **SIBS ID**, **Password**, password-visibility control, **Login**.
- Under the form, show the complete demo-credential list. Selecting a demo account fills in its demo ID and the shared password; the user still clicks Login.
- Keep the public application and candidate survey links, where present.
- Display a brief indication that these are demonstration identities, not real company credentials.

## Static demo credentials

**Shared password for every account: `Demo123!`**

| Demo role | SIBS ID | Default landing page |
| --- | --- | --- |
| Employee | `DEMO-EMP` | Employee Dashboard |
| Talent Acquisition (TA) | `DEMO-TA` | TA Dashboard |
| IT | `DEMO-IT` | New Hire Orientation — IT |
| QDS | `DEMO-QDS` | Employee Journey — QDS Dashboard |
| Trainer | `DEMO-TRN` | Employee Journey — Trainer Monitoring |
| WFM | `DEMO-WFM` | Workforce Hiring |
| HR | `DEMO-HR` | HR Admin Dashboard |
| HR Admin | `DEMO-HRADMIN` | HR Admin Dashboard |
| Team Leader | `DEMO-TL` | OM Dashboard |
| Manager | `DEMO-MGR` | OM Dashboard |
| SOM | `DEMO-SOM` | OM Dashboard |
| Super Admin | `DEMO-ADMIN` | Super Admin Dashboard |

The seeded Employee demo identity is associated with the existing sample employee Journey for Alyssa Rivera (`SIBS-2901`). This is **illustrative sample data** and not a real employee identity.

## Login and session behavior

1. On load, if there is no valid demo session, display the Sign In screen.
2. Validate the ID/password pair against the fixed list of demo accounts.
3. Incorrect IDs or passwords show an error, without logging the user in.
4. After successful sign-in, use the account role to open its default dashboard and to filter navigation.
5. The header shows the selected demo identity and a **Sign Out** action.
6. Sign Out clears only the current demo session. **It must not erase NHO, trainee, assessment, or 30/60/90 Journey demonstration data.**
7. The logged-in role applies to visible actions and content, not just sidebar labels. Employee views should not expose other employees' personal demo records.
8. The fixed account IDs remain the only permitted sign-in identities; previously created local sign-up accounts are ignored.

## Role-based module behavior

- **Employee:** personal dashboard, read-only personal attendance/leave/resignation placeholders, and own linked Trainee Dashboard; no company-wide employee registers.
- **TA:** candidate pipeline, offers, NHO scheduling, attendance, documents, and relevant recruitment tools.
- **IT:** NHO IT provisioning/endorsement workspace.
- **QDS:** QDS oversight and NHO trainer/material assignment actions.
- **Trainer:** assigned trainee monitoring, learning-material verification, and relevant staff assessments.
- **WFM:** workforce and NHO seating tasks.
- **HR / HR Admin:** HR modules, NHO final handoff, 30/60/90 Benchmark, and Journey oversight.
- **Team Leader / Manager / SOM:** operations dashboard, coaching and relevant Journey reviews.
- **Super Admin:** broad prototype module access and demo-role preview where supported.

Role visibility follows the current centralized policy in `src/auth/roleAccess.ts`; do not replace it with independent hard-coded rules scattered among pages.

## Key source files

| File | Responsibility |
| --- | --- |
| `src/components/SibsLoginLandingPage.tsx` | SiBS sign-in-only UI and visible selectable demo credentials |
| `src/auth/demoAccounts.ts` | Seeded account list and login validation; no sign-up |
| `src/auth/demoAuthTypes.ts` | Demo account and role type definitions |
| `src/auth/roleAccess.ts` | Default landing pages, allowed modules, Journey tabs and NHO role mappings |
| `src/auth/DemoAuthContext.tsx` | Browser demo session and sign-out |
| `src/App.tsx` | Authentication gate and page selection |
| `src/components/Sidebar.tsx` | Role-filtered HRIS navigation |
| `src/components/Header.tsx` | Current account identity and Sign Out |
| `src/components/nho/NHOContext.tsx` | Map login roles to NHO demo roles without changing NHO process logic |
| `src/components/journey/EmployeeJourneyModule.tsx` | Role-scoped Journey navigation and selection |
| `src/components/journey/views/TraineeDashboardView.tsx` | Personal linked trainee view |
| `src/components/EmployeeSelfServiceView.tsx` | Employee-facing personal demo panels |
| `scripts/test-demo-auth.ts` | Prototype authentication and role tests |

The sign-in-only revision itself changed six packaged files; other integration files above were changed in the earlier role-auth implementation and remain relevant to its operation.

## Preserve existing business workflows

- NHO: TA → Applicant → IT → QDS assigns Trainer/materials → Trainer accepts; WFM seating proceeds independently → HR accepts the **2/2** post-IT workstreams.
- An accepted NHO handoff links to the existing Employee Journey logic.
- Training progression: FST Days 1–14, PST Days 15–28, Day 30 / 60 / 90 reviews, with separate QA and trainer assessments.
- Changing demo accounts must show the next role's correct tasks, using the **same persisted prototype records**.
- Do not invent performance scores, automatically approve milestones, or infer a hire/start date from the NHO scheduling date.
- Keep the current SiBS HRIS navy/orange theme and approved dashboard layouts.

## Suggested verification checklist

- [ ] No Sign Up tab or user registration path exists.
- [ ] All 12 static demo account IDs can sign in with `Demo123!`.
- [ ] Invalid login attempts are rejected.
- [ ] Demo credential list is visible and clickable on the login screen.
- [ ] Each role opens the correct landing page and permitted sidebar items.
- [ ] Employee cannot browse the company-wide registers or another person's Journey.
- [ ] NHO role follows the logged-in demo account.
- [ ] NHO and Journey changes remain after sign-out, sign-in, and browser refresh.
- [ ] SiBS appearance, routing and approved workflows remain intact.

## Development and testing

Run with project dependencies installed:

```bash
npm install
npm run dev
npm run test
npm run test:auth
npm run lint
npm run build
```

**Previous recorded validation:** 125/125 NHO/workflow regression checks passed; 17/17 demo-auth checks passed; 141/141 TS/TSX syntax checks passed. These were source-level checks, **not** confirmation of a full Vite production build or browser end-to-end scenario; the installed-dependency build had not been run.

## Prototype limitations

Demo passwords and role policy are visible to the browser. Browser storage is not a secure credential database, and browser-side role checks are not enforceable server authorization. Use fake demonstration identities/data only. A real deployed HRIS would require server-based identity verification and role permissions; **that is outside the scope of this prototype**.
