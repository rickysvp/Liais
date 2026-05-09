# Liais Production Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current Linktree-style AI business secretary demo into a secure, multi-user, launch-ready product that helps profile owners qualify inbound connections and act on the right next step.

**Architecture:** Keep the current Vite + React + Express + Prisma shape, but introduce explicit product boundaries: authenticated owner workspace, public visitor intake, AI screening pipeline, decision inbox, and billing/usage controls. Replace demo identity, mock data, global inbox reads, and hardcoded operational assumptions with owner-scoped APIs and durable product flows.

**Tech Stack:** React 19, Vite 6, Express 4, Prisma 5, SQLite for local development, production Postgres recommended, Zod, Gemini API, Vitest/Supertest, Helmet, express-rate-limit, future Stripe/Auth provider integration.

---

## Low-Cost MVP Operating Constraint

The MVP should be optimized for learning before infrastructure spend, but AI usage must be protected by payment and hard usage limits from day one. Default to free or near-free managed infrastructure, keep the architecture portable, and use Stripe immediately for subscriptions and credit packs so users, not the founder, fund variable AI costs.

Recommended MVP stack:

- **Hosting:** Vercel Hobby for frontend and lightweight API routes/serverless endpoints where possible. Current official pricing lists Hobby as free, with included bandwidth/function allowances and usage monitoring.
- **Database/Auth/Storage:** Supabase Free for Postgres, Auth, and small file storage. Current official limits include 2 free projects, 500 MB database size, 50,000 monthly active users, 1 GB storage, and pausing after inactivity.
- **Email:** Resend Free for launch notifications and owner alerts. Current official limits include 3,000 emails/month and 100 emails/day.
- **Rate limit/cache:** Upstash Redis Free only if in-memory rate limiting is insufficient. Current official limits include 256 MB data and 500k monthly commands.
- **AI:** Use the existing Gemini key path initially, but meter every AI call internally. Prefer one AI call per visitor intake, cache generated profile content, and avoid background AI jobs during MVP.
- **Payments:** Implement Stripe immediately. Use Stripe Billing + Checkout Sessions for subscriptions, Stripe Checkout Sessions for one-time credit packs, and Stripe Customer Portal for self-service plan/payment changes.

MVP cost guardrails:

- No background workers, queues, cron jobs, custom observability add-ons, paid log drains, or custom Supabase API domains in the first public test.
- No automatic AI reprocessing; all AI calls must be user-triggered or intake-triggered.
- No paid AI screening for unpaid users. Free users may preview onboarding/profile generation within a strict small allowance, but public visitor intake AI screening requires an active plan or purchased credits.
- Keep uploaded assets out of scope unless needed for conversion.
- Keep data retention short and simple: delete test visitor data manually/admin-side during private beta, then formalize retention before paid launch.
- Instrument usage in the database first; only add paid monitoring after product-market signals justify it.

Development environment requirements:

- Local development should continue to run with SQLite or local Supabase-compatible environment, but production/staging should use Supabase Postgres.
- Add `.env.example` entries for both local SQLite and Supabase deployment so the app can switch via `DATABASE_URL`.
- Keep Express routes deployable as Vercel serverless functions or migrate the backend to Next.js/API routes only if that reduces deployment complexity.
- Prefer a single Vercel project plus one Supabase project for MVP.
- Stripe must be configured in test mode locally/staging and live mode only for production env vars.

---

## Current Quality Findings

- Critical: authentication is demo-only. `server/lib/auth.ts` trusts `x-user-id`, and onboarding creates arbitrary users from client-provided IDs. This is not safe for production.
- Critical: several protected resources are not scoped by owner. `server/routes/inbox.ts` returns every conversation and lets status updates by ID without authentication.
- Critical: owner dashboard fetches protected endpoints without credentials. `src/pages/Settings.tsx` and `src/pages/DashboardRoutes.tsx` call `/api/me/profile` without `x-user-id`, so real profile loading is broken unless the API is loosened.
- High: inbox status update route mismatch. `src/pages/Inbox.tsx` calls `PUT /api/inbox/:id`, but the server only implements `PUT /api/inbox/:id/status`.
- High: production server bundling is risky. `npm run build` emits an esbuild warning because `server.ts` uses `import.meta.url` while the server bundle is CJS.
- High: public intake accepts any `profileId` and spends credits after the fact; there is no published-profile check, consent enforcement, anti-spam policy, or credit exhaustion handling.
- Medium: database is SQLite demo state with committed `.db` files. Production needs migrations, backups, and secrets/env separation.
- Medium: AI outputs are parsed directly and not validated with Zod, so malformed model output can degrade core flows.
- Medium: dashboard contains mock metrics and mock fallbacks, which can hide broken backend behavior.
- Medium: test coverage is thin. `npm test` passes when allowed to listen locally, but only covers four profile API cases.

## Product Principles

- The BIO link should immediately answer: who this person is, what they welcome, what is not a fit, and what happens after submitting.
- Visitors should feel guided, not interrogated. The intake should collect enough signal to qualify intent while preserving trust and consent.
- Owners should see decisions, not raw messages. Every inbound item needs reason, fit score, risk flags, recommended next action, and a prepared draft where appropriate.
- Liais should be opinionated but reversible. AI can filter, classify, summarize, and draft, but user-controlled boundaries and audit history must stay visible.
- Security and privacy are product features here, not back-office chores.

---

### Task 1: Stabilize Local Verification and Low-Cost Deployment Shape

**Files:**
- Modify: `package.json`
- Modify: `server.ts`
- Modify: `backend-server.ts` or remove after consolidating entrypoints
- Create: `server/app.ts`
- Create: `vercel.json`
- Test: `tests/app-smoke.test.ts`

- [x] **Step 1: Extract Express app creation**

Create `server/app.ts` with a `createApp()` function that installs middleware and routes without listening on a port. Keep server startup in `server.ts`.

- [x] **Step 2: Make server build ESM-safe**

Change the server bundle to ESM or remove `import.meta.url` from bundled CJS output. Prefer:

```json
"build": "vite build && esbuild server.ts --platform=node --format=esm --bundle --external:vite --external:express --external:cors --external:@prisma/client --external:dotenv --outfile=dist/server.mjs",
"start": "node dist/server.mjs"
```

- [x] **Step 3: Add a health smoke test**

Test `GET /api/version` or `/api/health` via the extracted app without binding a real port when possible.

- [x] **Step 4: Verify**

Run:

```bash
npm run lint
npm test
npm run build
```

Expected: all pass with no production bundle warning.

- [x] **Step 5: Confirm Vercel deployment path**

Choose the cheapest path:

1. Keep Vite frontend on Vercel and expose the Express API as serverless-compatible functions.
2. If Express serverless adaptation becomes awkward, migrate only the API layer to Vercel functions while preserving route behavior.

Expected: one Vercel Hobby project can run the MVP without a separate paid backend host.

---

### Task 2: Replace Demo Identity With Real Authentication Boundary

**Files:**
- Modify: `server/lib/auth.ts`
- Modify: `server/routes/profile.ts`
- Modify: `src/pages/OnboardingFlow.tsx`
- Create: `src/lib/api.ts`
- Create: `server/lib/session.ts`
- Test: `tests/auth.test.ts`

- [x] **Step 1: Pick production auth provider**

Recommended for lowest-cost launch: Supabase Auth Free. If keeping custom auth temporarily, use secure HTTP-only session cookies, not `localStorage` IDs.

- [x] **Step 2: Replace `x-user-id` trust**

`authMiddleware` should derive `req.userId` from a verified session/JWT. Delete client-controlled user creation from `POST /api/profile/publish`.

- [x] **Step 3: Add frontend API wrapper**

Create `src/lib/api.ts` with `apiGet`, `apiPost`, and `apiPut` helpers that include credentials, parse errors consistently, and centralize redirect-on-401.

- [ ] **Step 4: Gate owner workspace**

Dashboard, settings, inbox, contacts, billing, and AI secretary chat must require an authenticated owner.

- [x] **Step 5: Verify**

Add tests for missing session, invalid session, valid session, and cross-user access denial.

---

### Task 3: Scope All Owner Data by Profile/User

**Files:**
- Modify: `server/routes/inbox.ts`
- Modify: `server/routes/chat.ts`
- Modify: `server/routes/system.ts`
- Modify: `src/pages/Inbox.tsx`
- Modify: `src/pages/Contacts.tsx`
- Modify: `src/pages/VisitorDetail.tsx`
- Test: `tests/inbox-auth.test.ts`

- [x] **Step 1: Require auth on owner inbox routes**

`GET /api/inbox` should use `authMiddleware` and `profileMiddleware`, then query `where: { profileId: req.profileId }`.

- [x] **Step 2: Fix status route mismatch**

Update `src/pages/Inbox.tsx` to call `/api/inbox/${selectedId}/status`, or add a compatible server route and keep one canonical API contract.

- [x] **Step 3: Authorize status updates**

Status updates should use:

```ts
where: { id: req.params.id, profileId: req.profileId }
```

Return 404 when the conversation is not owned by the authenticated profile.

- [x] **Step 4: Fix visitor detail loading**

Add `GET /api/inbox/:id` instead of fetching the full inbox and filtering client-side.

- [x] **Step 5: Verify**

Test that user A cannot list, read, or update user B's conversations.

---

### Task 4: Harden Public Profile and Visitor Intake

**Files:**
- Modify: `server/routes/profile.ts`
- Modify: `server/routes/inbox.ts`
- Modify: `server/schemas.ts`
- Modify: `src/pages/PublicProfile.tsx`
- Test: `tests/public-intake.test.ts`

- [x] **Step 1: Public profile response minimization**

`GET /api/p/:slug` should return only public fields. Do not expose user IDs, internal profile IDs, private boundaries, or operational fields.

- [x] **Step 2: Submit intake by slug**

Change visitor submission from `/api/intake/:profileId` to `/api/p/:slug/intake`. Server resolves a published profile internally.

- [x] **Step 3: Validate consent and contact fields**

Require at least one contact method for high-intent requests and store explicit `consentToContact`.

- [ ] **Step 4: Add spam and abuse controls**

Use stricter rate limits on public intake by IP and profile slug. Add honeypot field and basic duplicate detection.

- [ ] **Step 5: Verify**

Test unpublished profile, missing contact, invalid URL/contact, duplicate spam, and successful submission.

---

### Task 5: Make AI Screening Deterministic and Auditable

**Files:**
- Modify: `server/lib/ai.ts`
- Modify: `server/routes/ai.ts`
- Modify: `server/routes/inbox.ts`
- Create: `server/lib/screening.ts`
- Create: `server/lib/aiSchemas.ts`
- Test: `tests/screening.test.ts`

- [x] **Step 1: Define typed AI output schemas**

Use Zod for `summaryText`, `qualificationLevel`, `suggestedAction`, `riskFlags`, `nextStepType`, `replyDraft`, and `confidence`.

- [ ] **Step 2: Add rule-based pre-classification**

Before AI, classify obvious spam, missing context, missing contact, and boundary-triggering requests.

- [x] **Step 3: Validate model JSON**

If Gemini returns malformed JSON, store a safe fallback plus an `aiError`/`needsReview` flag.

- [ ] **Step 4: Store screening rationale**

Extend Prisma with fields or a related table for classification rationale, confidence, risk flags, and prompt/model metadata.

- [x] **Step 5: Verify**

Unit-test each classification path and malformed model output.

---

### Task 6: Build the Owner Decision Workflow

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `server/routes/inbox.ts`
- Modify: `src/pages/Inbox.tsx`
- Modify: `src/pages/Contacts.tsx`
- Create: `src/components/inbox/DecisionPanel.tsx`
- Test: `tests/inbox-workflow.test.ts`

- [ ] **Step 1: Normalize statuses**

Replace mixed display strings with stable enum-like values: `new`, `needs_decision`, `ready_to_send`, `waiting_on_them`, `monitor_later`, `accepted`, `replied`, `archived`, `rejected`.

- [ ] **Step 2: Add next-step fields**

Store `nextStepType`, `ownerDecision`, `replyDraft`, `meetingLink`, `followUpAt`, and `lastActionAt`.

- [ ] **Step 3: Implement actions**

Actions: accept, archive, request more info, prepare reply, send meeting link, monitor later, mark replied.

- [ ] **Step 4: Remove mock fallback masking**

Empty state should say no real items yet. Seed/demo data should be behind a clear demo mode.

- [ ] **Step 5: Verify**

Test every status transition and UI action route.

---

### Task 7: Improve Onboarding Into a Real Profile Builder

**Files:**
- Modify: `src/pages/OnboardingFlow.tsx`
- Modify: `server/routes/onboarding.ts`
- Modify: `server/routes/profile.ts`
- Modify: `prisma/schema.prisma`
- Test: `tests/onboarding.test.ts`

- [ ] **Step 1: Save resumable drafts**

Use authenticated user or anonymous signed session token. Upsert drafts instead of creating a new row every save.

- [ ] **Step 2: Add slug editing and collision handling**

Generate stable slugs and resolve collisions with suffixes. Let the user edit before publish.

- [ ] **Step 3: Replace simulated LinkedIn import**

Either remove it for launch or clearly label it as manual URL enrichment. Do not imply scraping unless real and compliant.

- [ ] **Step 4: Capture boundaries during onboarding**

Ask what not to pass through, what requires manual approval, and what connections should be auto-archived.

- [ ] **Step 5: Verify**

Test draft resume, publish, slug collision, and profile update.

---

### Task 8: Stripe Billing, Credits, and AI Cost Controls

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `server/routes/system.ts`
- Modify: `server/routes/inbox.ts`
- Modify: `src/pages/Upgrade.tsx`
- Create: `server/routes/billing.ts`
- Create: `server/lib/stripe.ts`
- Create: `server/lib/usage.ts`
- Test: `tests/billing.test.ts`
- Test: `tests/usage.test.ts`

- [x] **Step 1: Define paid-first packaging**

Define a simple MVP pricing model:

- Free: profile draft + public page preview + very small AI preview allowance, no live AI screening.
- Starter subscription: live public link, monthly AI-screened intakes, owner inbox, basic reply drafts.
- Pro subscription: higher AI-screened intake quota, priority routing, more draft generation.
- Credit packs: one-time purchase for extra AI-screened intakes.

- [x] **Step 2: Add Stripe data model**

Extend Prisma with Stripe customer ID, subscription ID, price ID, subscription status, current period dates, monthly included credits, purchased credit balance, usage ledger, and webhook event idempotency table.

- [x] **Step 3: Create Checkout Sessions**

Use Stripe Checkout Sessions:

- `mode: "subscription"` for Starter/Pro plans.
- `mode: "payment"` for credit packs.
- Store `client_reference_id` or metadata with internal user ID.
- Use Stripe Prices, not deprecated Plans.

- [x] **Step 4: Add webhook fulfillment**

Handle `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, and `invoice.payment_failed`. Webhooks must be idempotent and verify Stripe signatures.

- [x] **Step 5: Enforce credits before AI calls**

Before every paid AI operation, reserve or check available credits. If unavailable, return an upgrade/credit-pack response before calling Gemini.

- [x] **Step 6: Add Customer Portal**

Provide a backend route to create Stripe Customer Portal sessions for payment method updates, cancellation, and plan changes.

- [x] **Step 7: Show real billing and usage**

Upgrade page should fetch subscription status, plan, renewal date, monthly quota, used AI screenings, purchased credits, and Stripe checkout/portal URLs.

- [x] **Step 8: Verify**

Test no subscription, active subscription, canceled subscription, failed payment, credit pack purchase, duplicate webhook, and no-AI-call behavior after quota exhaustion.

---

### Task 9: Privacy, Security, and Compliance Launch Pass

**Files:**
- Modify: `server.ts`
- Modify: `backend-server.ts`
- Modify: `.env.example`
- Create: `docs/privacy-data-map.md`
- Create: `docs/security-checklist.md`
- Test: security smoke tests in `tests/security.test.ts`

- [x] **Step 1: Tighten CORS and CSP**

Remove wildcard CORS for production and restore Helmet CSP with explicit script/connect/img/style rules.

- [x] **Step 2: Add body limits consistently**

Use `express.json({ limit: "1mb" })` in the consolidated app.

- [x] **Step 3: Remove secret leakage risk**

Do not define `process.env.GEMINI_API_KEY` into frontend bundles in `vite.config.ts`.

- [x] **Step 4: Document data handling**

Map visitor PII, retention policy, deletion/export behavior, and AI provider data flow.

- [x] **Step 5: Verify**

Run dependency audit and security tests:

```bash
npm audit
npm run lint
npm test
```

---

### Task 10: Supabase/Vercel MVP Deployment

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `.env.example`
- Create: `prisma/migrations/*`
- Create: `vercel.json`
- Create: `docs/mvp-deployment.md`
- Test: deployment smoke checklist

- [x] **Step 1: Move MVP production to Supabase Postgres**

Keep SQLite only for quick local demo/dev if useful. Use Supabase Postgres for staging and MVP production.

- [x] **Step 2: Add migrations**

Generate Prisma migrations and stop relying on committed `.db` state.

- [x] **Step 3: Add free-tier environment matrix**

Document required env vars: Supabase URL/anon key/service key, database URL, Gemini key, app URL, frontend URL, Stripe secret key, Stripe webhook secret, Stripe price IDs, optional Resend key, optional Upstash Redis URL/token.

- [ ] **Step 4: Add zero-cost observability**

Use structured console logs plus database usage tables first. Log request IDs, AI errors, latency, and usage-limit denials without logging private full transcripts by default.

- [x] **Step 5: Verify**

Deploy preview, run smoke tests for onboarding, public link, paywall, Stripe Checkout test purchase, webhook fulfillment, intake, inbox decision, settings, usage limits, and auth logout/login.

---

## Suggested Milestones

- **Milestone 1: Paid-gated private alpha:** Tasks 1-4 plus Stripe test-mode skeleton from Task 8. Goal: Vercel + Supabase deployment, no data leaks, working profile/intake loop, AI screening gated by plan/credits.
- **Milestone 2: Paid AI secretary value loop:** Tasks 5-8. Goal: high-signal qualification, clear owner decisions, usable onboarding, Stripe subscription/credits, and no unmetered AI calls.
- **Milestone 3: Low-cost public MVP:** Tasks 9-10. Goal: secure Vercel/Supabase/Stripe launch, privacy docs, basic observability, clear upgrade threshold.

## Upgrade Triggers From Free MVP

Move from free-tier infrastructure to paid infrastructure only when one of these is true:

- Supabase Free project approaches 500 MB database size, 5 GB egress, or inactivity pausing becomes operationally painful.
- Vercel Hobby limits or commercial-use constraints conflict with the product test.
- Resend Free daily/monthly email caps block owner notifications.
- Stripe-paid usage proves demand and free-tier infrastructure becomes the bottleneck.
- Users require custom domains/SLAs/team access, or store sensitive business data at higher compliance expectations.

## Verification Snapshot From Initial Audit

- `npm run lint`: passed.
- `npm test`: passed when run with local-listen permission; sandbox-only run failed due `listen EPERM 0.0.0.0`.
- `npm run build`: frontend and server bundle completed, but emitted a CJS/import.meta production warning that must be fixed before launch.
