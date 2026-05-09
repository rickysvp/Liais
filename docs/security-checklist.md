# Liais MVP Security Checklist

## Required Before Public MVP

- [x] Owner inbox routes require authentication and profile scoping.
- [x] Public profile response excludes internal `id` and `userId`.
- [x] Public intake uses slug URL and resolves profile server-side.
- [x] Visitor intake requires contact consent and at least one contact method.
- [x] AI screening is blocked without an active paid plan or purchased credits.
- [x] Stripe checkout and portal routes require authentication.
- [x] Stripe webhook route uses raw body parsing and signature verification.
- [x] `GEMINI_API_KEY` is not injected into the frontend bundle.
- [x] Production CORS is tied to `FRONTEND_URL` or `APP_URL`.
- [x] Production Helmet CSP is enabled.
- [x] `npm audit --audit-level=high` reports no high severity vulnerabilities.

## Still Needed

- [ ] Replace demo onboarding identity with real Supabase Auth UI.
- [ ] Add owner account deletion/export flows.
- [ ] Add stricter spam protection for public intake.
- [ ] Add structured request ids to logs.
- [ ] Add Stripe live-mode go-live checklist before accepting real payments.
- [ ] Add production backup and restore drill for Supabase.

