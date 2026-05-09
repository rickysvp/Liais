# Liais Privacy Data Map

## Data Collected

- **Owner account:** Supabase user id, email, display name.
- **Owner profile:** public slug, headline, work focus, accepted connection goals, social links, AI-generated profile copy.
- **Owner boundaries:** private screening rules and handoff rules.
- **Visitor intake:** visitor name, company, role/background, reason for reaching out, requested next step, contact methods, consent flag.
- **AI outputs:** summary, qualification level, suggested action, reply/next-step guidance when enabled.
- **Billing:** Stripe customer id, subscription id, price id, subscription status, credit balance, webhook event ids.
- **Usage:** AI credit ledger entries and timestamps.

## Data Shared With Providers

- **Supabase:** application database, auth identity, and storage if enabled later.
- **Stripe:** owner billing identity, checkout/portal sessions, subscriptions, payments, credit-pack purchases.
- **Gemini:** profile context, owner boundaries needed for screening, and visitor intake content only when the owner has an active plan or credits.
- **Vercel:** application hosting logs and serverless request metadata.

## MVP Retention

- Keep visitor intake data while the owner account is active.
- Allow manual deletion during private beta.
- Before paid public launch, add owner-facing export/delete controls and document formal retention periods.

## Logging Rules

- Do not log full visitor transcripts by default.
- Log request ids, route names, AI failures, Stripe event ids, and high-level usage outcomes.
- Never log Stripe secrets, Supabase service keys, Gemini keys, or raw authorization headers.

