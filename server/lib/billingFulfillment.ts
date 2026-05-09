import type Stripe from "stripe";

type PrismaLike = {
  stripeWebhookEvent: {
    findUnique(args: any): Promise<any>;
    create(args: any): Promise<any>;
  };
  subscription: {
    upsert(args: any): Promise<any>;
    updateMany(args: any): Promise<any>;
  };
  usageLedger: {
    create(args: any): Promise<any>;
  };
};

const MONTHLY_CREDITS_BY_ENV_KEY: Record<string, number> = {
  STRIPE_PRICE_STARTER_MONTHLY: 50,
  STRIPE_PRICE_PRO_MONTHLY: 250,
};

const CREDIT_PACK_CREDITS_BY_ENV_KEY: Record<string, number> = {
  STRIPE_PRICE_CREDIT_PACK_SMALL: 25,
  STRIPE_PRICE_CREDIT_PACK_MEDIUM: 100,
};

export function getMonthlyCreditsForPrice(priceId: string | null | undefined): number {
  if (!priceId) return 0;
  for (const [envKey, credits] of Object.entries(MONTHLY_CREDITS_BY_ENV_KEY)) {
    if (process.env[envKey] === priceId) return credits;
  }
  return 0;
}

export function getCreditPackCredits(priceId: string | null | undefined): number {
  if (!priceId) return 0;
  for (const [envKey, credits] of Object.entries(CREDIT_PACK_CREDITS_BY_ENV_KEY)) {
    if (process.env[envKey] === priceId) return credits;
  }
  return 0;
}

function toDateFromUnix(value: number | null | undefined): Date | null {
  return typeof value === "number" ? new Date(value * 1000) : null;
}

function firstPriceIdFromCheckoutSession(session: Stripe.Checkout.Session): string | null {
  const expandedLineItems = (session as any).line_items?.data;
  return expandedLineItems?.[0]?.price?.id || null;
}

function firstPriceIdFromSubscription(subscription: Stripe.Subscription): string | null {
  return subscription.items?.data?.[0]?.price?.id || null;
}

export async function fulfillCheckoutSession(
  prisma: PrismaLike,
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.client_reference_id || session.metadata?.userId;
  if (!userId) return;

  if (session.mode === "payment") {
    const priceId = firstPriceIdFromCheckoutSession(session);
    const purchasedCredits =
      getCreditPackCredits(priceId) ||
      getCreditPackCredits(process.env[`STRIPE_PRICE_${session.metadata?.priceLookupKey?.toUpperCase()}`]);

    if (purchasedCredits <= 0) return;

    await prisma.subscription.upsert({
      where: { userId },
      update: { purchasedCredits: { increment: purchasedCredits } },
      create: {
        userId,
        planName: "Free",
        status: "inactive",
        monthlyCredits: 0,
        purchasedCredits,
      },
    });

    await prisma.usageLedger.create({
      data: {
        userId,
        actionType: "Stripe Credit Pack Purchase",
        creditsDelta: purchasedCredits,
        stripeEventId: session.id,
      },
    });
  }
}

export async function fulfillSubscriptionChange(
  prisma: PrismaLike,
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const priceId = firstPriceIdFromSubscription(subscription);
  const monthlyCredits = getMonthlyCreditsForPrice(priceId);
  const planName = monthlyCredits >= 250 ? "Pro" : monthlyCredits > 0 ? "Starter" : "Free";
  const data = {
    userId,
    planName,
    status: subscription.status,
    monthlyCredits,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    currentPeriodStart: toDateFromUnix((subscription as any).current_period_start),
    currentPeriodEnd: toDateFromUnix((subscription as any).current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
  };

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: data,
    create: {
      ...data,
      purchasedCredits: 0,
    },
  });
}

export async function processStripeEventOnce(
  prisma: PrismaLike,
  event: Stripe.Event,
  handler: () => Promise<void> | void
): Promise<boolean> {
  const existing = await prisma.stripeWebhookEvent.findUnique({ where: { id: event.id } });
  if (existing) return false;

  await handler();
  await prisma.stripeWebhookEvent.create({
    data: {
      id: event.id,
      type: event.type,
    },
  });

  return true;
}
