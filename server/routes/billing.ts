import { Router } from "express";
import { z } from "zod";

import { authMiddleware } from "../lib/auth";
import { prisma } from "../lib/db";
import { getStripe, isStripeConfigured } from "../lib/stripe";
import { getAvailableCredits } from "../lib/usage";
import {
  fulfillCheckoutSession,
  fulfillSubscriptionChange,
  processStripeEventOnce,
} from "../lib/billingFulfillment";

export const billingRouter = Router();
export const billingWebhookRouter = Router();

const checkoutSchema = z.object({
  priceLookupKey: z.enum(["starter_monthly", "pro_monthly", "credit_pack_small", "credit_pack_medium"]),
});

const portalSchema = z.object({
  returnUrl: z.string().url().optional(),
});

const priceEnvByLookupKey: Record<z.infer<typeof checkoutSchema>["priceLookupKey"], string> = {
  starter_monthly: "STRIPE_PRICE_STARTER_MONTHLY",
  pro_monthly: "STRIPE_PRICE_PRO_MONTHLY",
  credit_pack_small: "STRIPE_PRICE_CREDIT_PACK_SMALL",
  credit_pack_medium: "STRIPE_PRICE_CREDIT_PACK_MEDIUM",
};

function checkoutModeForLookupKey(
  priceLookupKey: z.infer<typeof checkoutSchema>["priceLookupKey"]
): "subscription" | "payment" {
  return priceLookupKey.startsWith("credit_pack_") ? "payment" : "subscription";
}

billingRouter.post("/billing/checkout-session", authMiddleware, async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      res.status(503).json({ error: "Stripe is not configured. Set STRIPE_SECRET_KEY." });
      return;
    }

    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    const priceId = process.env[priceEnvByLookupKey[parsed.data.priceLookupKey]];
    if (!priceId) {
      res.status(503).json({ error: `Stripe price is not configured for ${parsed.data.priceLookupKey}.` });
      return;
    }

    const stripe = getStripe();
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    const appUrl = process.env.APP_URL || process.env.FRONTEND_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: checkoutModeForLookupKey(parsed.data.priceLookupKey),
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/upgrade?checkout=success`,
      cancel_url: `${appUrl}/dashboard/upgrade?checkout=cancelled`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        priceLookupKey: parsed.data.priceLookupKey,
      },
      subscription_data: checkoutModeForLookupKey(parsed.data.priceLookupKey) === "subscription"
        ? {
            metadata: {
              userId: user.id,
              priceLookupKey: parsed.data.priceLookupKey,
            },
          }
        : undefined,
    });

    res.json({ url: session.url });
  } catch (e: any) {
    console.error("[Billing Checkout Error]", e.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

billingRouter.get("/billing/summary", authMiddleware, async (req, res) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: req.userId },
      orderBy: { updatedAt: "desc" },
    });
    const ledger = await prisma.usageLedger.aggregate({
      where: { userId: req.userId },
      _sum: { creditsDelta: true },
    });

    const monthlyCredits = subscription?.monthlyCredits ?? 0;
    const purchasedCredits = subscription?.purchasedCredits ?? 0;
    const ledgerCreditsDelta = ledger._sum.creditsDelta ?? 0;

    res.json({
      planName: subscription?.planName || "Free",
      status: subscription?.status || "inactive",
      monthlyCredits,
      purchasedCredits,
      ledgerCreditsDelta,
      availableCredits: getAvailableCredits({
        monthlyIncludedCredits: monthlyCredits,
        purchasedCredits: 0,
        ledgerCreditsDelta,
      }),
      currentPeriodEnd: subscription?.currentPeriodEnd || null,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
    });
  } catch (e: any) {
    console.error("[Billing Summary Error]", e.message);
    res.status(500).json({ error: "Failed to fetch billing summary" });
  }
});

billingRouter.post("/billing/portal-session", authMiddleware, async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      res.status(503).json({ error: "Stripe is not configured. Set STRIPE_SECRET_KEY." });
      return;
    }

    const parsed = portalSchema.safeParse(req.body || {});
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user?.stripeCustomerId) {
      res.status(404).json({ error: "Stripe customer not found" });
      return;
    }

    const appUrl = process.env.APP_URL || process.env.FRONTEND_URL || "http://localhost:3000";
    const session = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: parsed.data.returnUrl || `${appUrl}/dashboard/upgrade`,
    });

    res.json({ url: session.url });
  } catch (e: any) {
    console.error("[Billing Portal Error]", e.message);
    res.status(500).json({ error: "Failed to create billing portal session" });
  }
});

billingWebhookRouter.post("/", async (req, res) => {
  try {
    if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
      res.status(503).json({ error: "Stripe webhook is not configured." });
      return;
    }

    const signature = req.headers["stripe-signature"];
    if (!signature || Array.isArray(signature)) {
      res.status(400).json({ error: "Missing Stripe signature" });
      return;
    }

    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    await processStripeEventOnce(prisma, event, async () => {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = await stripe.checkout.sessions.retrieve(
            (event.data.object as any).id,
            { expand: ["line_items"] }
          );
          await fulfillCheckoutSession(prisma, session);
          break;
        }
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          await fulfillSubscriptionChange(prisma, event.data.object as any);
          break;
        case "invoice.payment_failed": {
          const subscriptionId = (event.data.object as any).subscription;
          if (typeof subscriptionId === "string") {
            await prisma.subscription.updateMany({
              where: { stripeSubscriptionId: subscriptionId },
              data: { status: "past_due" },
            });
          }
          break;
        }
        case "invoice.paid":
          break;
        default:
          break;
      }
    });

    res.json({ received: true });
  } catch (e: any) {
    console.error("[Stripe Webhook Error]", e.message);
    res.status(400).json({ error: "Invalid Stripe webhook" });
  }
});
