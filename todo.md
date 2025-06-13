# Admin Panel Migration TODO

This checklist tracks the work to migrate all admin-only UI from `frontend` → `admin_frontend` (Next.js 15).

Legend: `[ ]` = todo • `[x]` = done • `[-]` = in-progress

## Foundation / Setup
- [x] Clone Next.js admin template into `admin_frontend`
- [x] Install dependencies & run dev server
- [x] Add `.env.local` with Clerk & Sentry keys
- [ ] Remove Clerk integration & switch to cookie-based JWT (in progress)
- [x] Set up typed API helper in `admin_frontend/src/lib/api.ts` that calls backend `/admin/*` endpoints using Clerk session

## Shared / UI
- [ ] Move shared shadcn UI primitives that exist in `frontend` into `admin_frontend/src/components/ui` (or extract to shared package)
- [ ] Recreate Admin navigation sidebar / top-bar (based on `adminNav.css`)

## Feature Pages to Port
- [ ] Dashboard (`dashboard.jsx` + `linechart.jsx`)
- [ ] Users (list + basic view)
- [ ] Statistics (`statistics.jsx`)
- [ ] Filter (`filter.jsx`, `AdminMFA` from `components/MFA/adminmfa`)
- [ ] Cashier (`cashier.jsx`, plus `Cashier/robuxtxs`, `Cashier/cryptotxs`)
- [ ] Rain (`rain.jsx`)
- [ ] Statsbook (`statsbook.jsx`)
- [ ] Cases management (`cases.jsx`, `casemodal.jsx`)
- [ ] SpinShield / Slots (`spinshield.jsx`, `SpinShield/*`)
- [ ] Settings (`settings.jsx`)

## Backend/API Integration
- [ ] Confirm all admin endpoints exist & permissions enforced by backend
- [ ] Update calls in ported pages to use new API helper

## Cleanup
- [ ] Remove admin routes/components from `frontend` once new panel is proven
- [ ] Update CI/CD scripts to build/deploy `admin_frontend`

---
Add new tasks as discovered during the migration. 