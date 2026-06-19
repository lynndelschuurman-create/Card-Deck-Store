import { Router, type IRouter, type Request, type Response } from "express";
import Stripe from "stripe";
import { db, purchasesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

// POST /api/stripe/webhook
// Body arrives as raw Buffer (see app.ts — express.raw applied before express.json for this path)
router.post("/stripe/webhook", async (req: Request, res: Response) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error("STRIPE_WEBHOOK_SECRET not set — cannot verify webhook");
    res.status(500).json({ error: "Webhook secret not configured" });
    return;
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    res.status(400).json({ error: "Missing stripe-signature header" });
    return;
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logger.error({ err }, `Webhook signature verification failed: ${msg}`);
    res.status(400).json({ error: `Webhook Error: ${msg}` });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email ?? session.customer_email;

    if (email) {
      const normalised = email.trim().toLowerCase();
      try {
        await db
          .insert(purchasesTable)
          .values({ email: normalised, stripeSessionId: session.id })
          .onConflictDoNothing();
        logger.info({ email: normalised }, "Purchase recorded");
      } catch (err) {
        logger.error({ err }, "Failed to record purchase");
        res.status(500).json({ error: "Database error" });
        return;
      }
    } else {
      logger.warn({ sessionId: session.id }, "No email on completed checkout session");
    }
  }

  res.json({ received: true });
});

// GET /api/purchases/verify?email=
router.get("/purchases/verify", async (req: Request, res: Response) => {
  const { email } = req.query;
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "email query param required" });
    return;
  }

  const normalised = email.trim().toLowerCase();
  const rows = await db
    .select({ id: purchasesTable.id })
    .from(purchasesTable)
    .where(eq(purchasesTable.email, normalised))
    .limit(1);

  res.json({ purchased: rows.length > 0 });
});

export default router;
