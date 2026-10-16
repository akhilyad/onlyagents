// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");
const agentsData = require("./agents.js");

const app = express();
const port = process.env.PORT || 3000;

// Agent prices in agents.js are displayed in USD on the marketplace.
const AGENT_CURRENCY = "usd";
const PLANS = ["monthly", "onetime"];

// Reads an env var, treating blanks and copied placeholders like "sk_test_..." as unset.
function env(name) {
  const value = (process.env[name] || "").trim();
  return value && !value.includes("...") ? value : "";
}

let stripeClient = null;
function getStripe() {
  if (!stripeClient) {
    stripeClient = Stripe(env("STRIPE_SECRET_KEY"), { apiVersion: "2026-03-25.dahlia" });
  }
  return stripeClient;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function wantsJson(req) {
  return req.is("json") || req.xhr || (req.headers.accept || "").includes("application/json");
}

function sendError(req, res, status, title, message) {
  if (wantsJson(req)) {
    return res.status(status).json({ error: message });
  }
  res.status(status).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} · OnlyAgents</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <section class="status-card">
    <div class="status-icon status-icon--error" aria-hidden="true">!</div>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    <div class="status-actions">
      <a class="btn btn-primary" href="/">Back to marketplace</a>
    </div>
  </section>
</body>
</html>`);
}

// Returns false (and responds) when the server can't talk to Stripe yet.
function checkCredentials(req, res) {
  if (env("STRIPE_SECRET_KEY")) return true;
  console.error("[Stripe] STRIPE_SECRET_KEY is not set. Add it to .env locally, or to Vercel → Project Settings → Environment Variables and redeploy.");
  sendError(req, res, 503, "Checkout unavailable",
    "Checkout isn't configured yet (STRIPE_SECRET_KEY is missing on the server). Please try again shortly.");
  return false;
}

function findAgent(handle) {
  if (!handle) return null;
  const normalized = String(handle).startsWith("@") ? String(handle) : `@${handle}`;
  return agentsData.find((agent) => agent.handle === normalized) || null;
}

function parseEmail(value) {
  const email = String(value || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined;
}

// Builds the line item: a specific agent is priced from agents.js (so Stripe charges
// exactly what the card shows); no agent falls back to the STRIPE_PRICE_ID membership.
function buildLineItem(agent, plan) {
  if (!agent) {
    const priceId = env("STRIPE_PRICE_ID");
    if (!priceId) {
      const err = new Error("STRIPE_PRICE_ID is not set on the server.");
      err.statusCode = 503;
      throw err;
    }
    return { price: priceId, quantity: 1 };
  }

  const isMonthly = plan === "monthly";
  return {
    quantity: 1,
    price_data: {
      currency: AGENT_CURRENCY,
      unit_amount: Math.round((isMonthly ? agent.priceMonthly : agent.priceOneTime) * 100),
      ...(isMonthly && { recurring: { interval: "month" } }),
      product_data: {
        name: `${agent.name} — ${isMonthly ? "Monthly plan" : "Lifetime access"}`,
        description: agent.description,
        metadata: { agent: agent.handle },
      },
    },
  };
}

// Brand name + OA icon shown top-left on Stripe's checkout page. Stripe fetches the icon
// from our own site, so it's only set on public https domains (not localhost).
function brandingSettings(domain) {
  return {
    display_name: "OnlyAgents",
    ...(domain.startsWith("https://") && { icon: { type: "url", url: `${domain}/brand/icon.png` } }),
  };
}

// Creates a Stripe Checkout Session with Studio parameters and graceful terms fallback
async function createCheckoutSession(domain, { agent, plan, email }) {
  const isSubscription = !agent || plan === "monthly";
  const metadata = agent ? { agent: agent.handle, plan } : { plan: "membership" };

  const sessionParams = {
    ui_mode: "hosted_page",
    mode: isSubscription ? "subscription" : "payment",
    billing_address_collection: "auto",
    allow_promotion_codes: false,
    consent_collection: {
      terms_of_service: "required",
    },
    submit_type: "auto",
    integration_identifier: "hosted_web_0001",
    origin_context: "web",
    branding_settings: brandingSettings(domain),
    success_url: `${domain}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${domain}/cancel`,
    line_items: [buildLineItem(agent, plan)],
    metadata,
    ...(email && { customer_email: email }),
    ...(isSubscription
      ? { payment_method_collection: "always", subscription_data: { metadata } }
      : { payment_intent_data: { metadata } }),
  };

  const stripe = getStripe();
  try {
    return await stripe.checkout.sessions.create(sessionParams);
  } catch (err) {
    // If Stripe Dashboard public business details don't have a Terms of Service URL set yet:
    if (err.message && err.message.toLowerCase().includes("terms of service")) {
      console.warn("[Stripe Notice] Terms of service URL is not yet configured in Stripe Dashboard (https://dashboard.stripe.com/settings/public). Creating session without consent_collection.");
      const { consent_collection, ...fallbackParams } = sessionParams;
      return await stripe.checkout.sessions.create(fallbackParams);
    }
    throw err;
  }
}

// Dynamic domain resolution supporting localhost and serverless deployments (Vercel)
function getDomain(req) {
  const configured = env("DOMAIN");
  if (configured && !configured.includes("localhost")) {
    return configured.replace(/\/$/, "");
  }
  const proto = String(req.headers["x-forwarded-proto"] || req.protocol || "https").split(",")[0].trim();
  const host = String(req.headers["x-forwarded-host"] || req.get("host") || "").split(",")[0].trim();
  if (host) return `${proto}://${host}`;
  return configured || `http://localhost:${port}`;
}

// Stripe Webhook Endpoint for fulfillment.
// Registered before the JSON body parser: signature verification needs the raw body.
app.post("/api/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const endpointSecret = env("STRIPE_WEBHOOK_SECRET");
  if (!endpointSecret || !env("STRIPE_SECRET_KEY")) {
    console.error("[Webhook] STRIPE_WEBHOOK_SECRET / STRIPE_SECRET_KEY not set; refusing unverified event.");
    return res.status(503).send("Webhook not configured");
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, req.headers["stripe-signature"], endpointSecret);
  } catch (err) {
    console.log("Webhook signature verification failed.", err.message);
    return res.sendStatus(400);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("Checkout completed for session:", session.id, session.metadata);
      // TODO: Fulfill the purchase — grant agent API key & access for session.metadata.agent / plan.
      if (session.consent?.terms_of_service === "accepted") {
        console.log("Customer accepted terms of service");
      }
      if (session.consent?.promotions === "opt_in") {
        const email = session.customer_details?.email;
        console.log("Customer opted in for promotional emails:", email);
      }
      break;
    }
    default:
      console.log("Unhandled event type:", event.type);
  }

  res.sendStatus(200);
});

// Serve static frontend files; "/success" resolves to success.html, etc.
app.use(express.static(__dirname, { extensions: ["html"] }));

// Parse URL-encoded and JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Stripe Hosted Checkout Session creation. Accepts `agent` (handle), `plan`
// ("monthly" | "onetime") and optional `email` from a form post, JSON, or query string.
async function handleCreateCheckoutSession(req, res) {
  if (!checkCredentials(req, res)) return;

  const input = { ...req.query, ...(req.body || {}) };
  const agent = findAgent(input.agent);
  if (input.agent && !agent) {
    return sendError(req, res, 400, "Unknown agent", `We couldn't find an agent called "${input.agent}".`);
  }
  const plan = PLANS.includes(input.plan) ? input.plan : "monthly";

  try {
    const session = await createCheckoutSession(getDomain(req), { agent, plan, email: parseEmail(input.email) });

    if (!session.url) {
      throw new Error("Stripe did not return a session.url.");
    }

    if (wantsJson(req)) {
      return res.json({ url: session.url });
    }
    res.redirect(303, session.url);
  } catch (error) {
    console.error("Error creating Checkout Session:", error);
    sendError(req, res, error.statusCode || 500, "Couldn't start checkout", error.message);
  }
}

app
  .route(["/create-checkout-session", "/api/create-checkout-session"])
  .get(handleCreateCheckoutSession)
  .post(handleCreateCheckoutSession);

// Order summary for success.html. Session IDs are unguessable and only reach the
// buyer via Stripe's redirect, so returning their own order details is safe.
app.get("/api/checkout-session", async (req, res) => {
  res.set("Cache-Control", "no-store");
  if (!checkCredentials(req, res)) return;

  const sessionId = String(req.query.session_id || "");
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return res.status(400).json({ error: "Missing or invalid session_id." });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const agent = findAgent(session.metadata?.agent);
    res.json({
      status: session.status,
      paymentStatus: session.payment_status,
      mode: session.mode,
      plan: session.metadata?.plan || null,
      agentName: agent ? agent.name : null,
      agentHandle: agent ? agent.handle : null,
      email: session.customer_details?.email || session.customer_email || null,
      amountTotal: session.amount_total,
      currency: session.currency,
    });
  } catch (error) {
    console.error("Error retrieving Checkout Session:", error.message);
    res.status(404).json({ error: "We couldn't find that checkout session." });
  }
});

// Product summary for checkout.html, read from STRIPE_PRICE_ID so the page always
// shows what Stripe will actually charge. Cached briefly per server instance.
let membershipCache = null;
app.get("/api/membership", async (req, res) => {
  if (!checkCredentials(req, res)) return;
  if (!env("STRIPE_PRICE_ID")) {
    return res.status(503).json({ error: "STRIPE_PRICE_ID is not set on the server." });
  }

  try {
    if (!membershipCache || Date.now() - membershipCache.fetchedAt > 10 * 60 * 1000) {
      const price = await getStripe().prices.retrieve(env("STRIPE_PRICE_ID"), { expand: ["product"] });
      membershipCache = {
        fetchedAt: Date.now(),
        data: {
          name: price.product.name,
          description: price.product.description || null,
          image: (price.product.images && price.product.images[0]) || null,
          amount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring ? price.recurring.interval : null,
        },
      };
    }
    res.set("Cache-Control", "public, max-age=300").json(membershipCache.data);
  } catch (error) {
    console.error("Error loading membership price:", error.message);
    res.status(500).json({ error: "Couldn't load pricing from Stripe." });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`OnlyAgents server running on http://localhost:${port}`);
  });
}

module.exports = app;
