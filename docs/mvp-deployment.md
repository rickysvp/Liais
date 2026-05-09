# Liais MVP Deployment

## Target Stack

- Vercel Hobby for frontend and serverless API.
- Supabase Free for Postgres and Auth.
- Stripe Billing for subscriptions, one-time credit packs, and Customer Portal.
- Gemini API for paid AI screening only.

## Environment Variables

Set these in Vercel:

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STARTER_MONTHLY`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_CREDIT_PACK_SMALL`
- `STRIPE_PRICE_CREDIT_PACK_MEDIUM`
- `APP_URL`
- `FRONTEND_URL`

## Database Setup

1. Create a Supabase project.
2. Copy the pooled Postgres connection string into `DATABASE_URL`.
3. Run migrations:

```bash
npx prisma migrate deploy
```

## Stripe Setup

1. Create Starter and Pro recurring Prices in Stripe.
2. Create small and medium one-time credit pack Prices.
3. Copy the Price IDs into Vercel env vars.
4. Create a webhook endpoint:

```text
https://YOUR_DOMAIN/api/billing/webhook
```

5. Subscribe to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

## Smoke Test

After deployment:

1. Create/login owner account.
2. Complete onboarding and publish profile.
3. Confirm `/u/:slug` renders public profile.
4. Submit visitor intake before payment and verify no AI credits are consumed.
5. Buy subscription in Stripe test mode.
6. Verify webhook updates billing summary.
7. Submit visitor intake again and verify AI screening consumes credits.
8. Open inbox and update a conversation status.
9. Open Billing Portal.

