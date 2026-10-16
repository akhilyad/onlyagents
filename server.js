// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
require("dotenv").config();
const express = require("express");
const path = require("path");
const stripeSecretKey = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim() !== ""
  ? process.env.STRIPE_SECRET_KEY.trim()
  : "sk_test_placeholder";
const stripe = require("stripe")(stripeSecretKey, {
  apiVersion: "2026-03-25.dahlia",
});

const app = express();
const port = process.env.PORT || 3000;

// Serve static frontend landing page files
app.use(express.static(__dirname));

// Parse URL-encoded and JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes for Stripe Checkout flow pages
app.get(["/success", "/success.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "success.html"));
});

app.get(["/cancel", "/cancel.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "cancel.html"));
});

app.get(["/checkout", "/checkout.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "checkout.html"));
});

// Helper to check credentials and render clear guidance
function checkCredentials(req, res) {
  const key = process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.trim() : "";
  if (!key || key === "" || key.includes("...")) {
    const isBlank = !key || key === "";
    const msg = isBlank
      ? "STRIPE_SECRET_KEY is empty in your .env file."
      : "STRIPE_SECRET_KEY in your .env file is still set to placeholder 'sk_test_...'.";

    if (req.headers.accept?.includes("application/json")) {
      res.status(500).json({
        error: msg,
        hint: "Add your secret key (sk_test_... or sk_live_...) to the .env file."
      });
      return false;
    }

    res.status(500).send(`
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 580px; margin: 40px auto; padding: 28px; border: 1px solid #E8E6DC; border-radius: 16px; background: #FAF9F5; color: #141413;">
        <h2 style="color: #BF4D43; margin-top: 0; font-size: 20px;">Stripe Secret Key Required</h2>
        <p style="color: #5E5D59; line-height: 1.6;">${msg}</p>
        <div style="background: #FFFFFF; border: 1px solid #E8E6DC; border-radius: 10px; padding: 16px; margin: 20px 0;">
          <strong style="color: #141413;">How to resolve:</strong>
          <ol style="margin: 10px 0 0 20px; line-height: 1.8; color: #5E5D59;">
            <li>Open your <code>.env</code> file in the project root.</li>
            <li>You configured <code>STRIPE_PUBLISHABLE_KEY</code>, but <code>STRIPE_SECRET_KEY=</code> is blank.</li>
            <li>Server-side session creation requires a <strong>Secret Key</strong> (starts with <code>sk_test_</code> or <code>sk_live_</code>).</li>
            <li>Add <code>STRIPE_SECRET_KEY=sk_...</code> and set <code>STRIPE_PRICE_ID=price_...</code>.</li>
          </ol>
        </div>
        <p style="margin-bottom: 0;"><a href="/checkout" style="color: #D97757; font-weight: 600; text-decoration: none;">&larr; Return to Checkout</a></p>
      </div>
    `);
    return false;
  }
  return true;
}

// Creates a Stripe Checkout Session with Studio parameters and graceful terms fallback
async function createCheckoutSession(domain) {
  const mode = "subscription"; // "subscription" for recurring agent access or "payment" for one-time unlock

  const sessionParams = {
    ui_mode: "hosted_page",
    mode: mode,
    billing_address_collection: "auto",
    payment_method_collection: "always",
    allow_promotion_codes: false,
    consent_collection: {
      terms_of_service: "required",
    },
    submit_type: "auto",
    integration_identifier: "hosted_web_0001",
    origin_context: "web",
    success_url: `${domain}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${domain}`,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
  };

  try {
    return await stripe.checkout.sessions.create(sessionParams);
  } catch (err) {
    // If Stripe Dashboard public business details don't have a Terms of Service URL set yet:
    if (err.message && err.message.includes("terms of service")) {
      console.warn("[Stripe Notice] Terms of service URL is not yet configured in Stripe Dashboard (https://dashboard.stripe.com/settings/public). Creating session without consent_collection.");
      const fallbackParams = { ...sessionParams };
      delete fallbackParams.consent_collection;
      return await stripe.checkout.sessions.create(fallbackParams);
    }
    throw err;
  }
}

// Dynamic domain resolution supporting localhost and serverless deployments (Vercel)
function getDomain(req) {
  if (process.env.DOMAIN && !process.env.DOMAIN.includes("localhost")) {
    return process.env.DOMAIN.replace(/\/$/, "");
  }
  if (req) {
    const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.headers["x-forwarded-host"] || req.get("host");
    if (host) return `${proto}://${host}`;
  }
  return process.env.DOMAIN || `http://localhost:${port}`;
}

// Stripe Hosted Checkout Session creation endpoint (supports both /create-checkout-session and /api/create-checkout-session)
app.post(["/create-checkout-session", "/api/create-checkout-session"], async (req, res) => {
  if (!checkCredentials(req, res)) return;

  try {
    const domain = getDomain(req);
    const session = await createCheckoutSession(domain);

    if (!session.url) {
      throw new Error("Stripe did not return a session.url.");
    }

    if (req.is("json") || req.headers.accept?.includes("application/json") || req.xhr) {
      return res.json({ url: session.url });
    }

    res.redirect(303, session.url);
  } catch (error) {
    console.error("Error creating Checkout Session:", error);
    if (req.headers.accept?.includes("application/json")) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).send(`
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 580px; margin: 40px auto; padding: 28px; border: 1px solid #E8E6DC; border-radius: 16px; background: #FAF9F5; color: #141413;">
        <h2 style="color: #BF4D43; margin-top: 0; font-size: 20px;">Stripe API Error: ${error.type || "Checkout Error"}</h2>
        <p style="color: #5E5D59; line-height: 1.6;">${error.message}</p>
        <p style="margin-top: 20px; margin-bottom: 0;"><a href="/checkout" style="color: #D97757; font-weight: 600; text-decoration: none;">&larr; Return to Checkout</a></p>
      </div>
    `);
  }
});

// GET fallback support for direct links and browser triggers
app.get(["/create-checkout-session", "/api/create-checkout-session"], async (req, res) => {
  if (!checkCredentials(req, res)) return;

  try {
    const domain = getDomain(req);
    const session = await createCheckoutSession(domain);

    if (!session.url) {
      throw new Error("Stripe did not return a session.url.");
    }

    if (req.is("json") || req.headers.accept?.includes("application/json") || req.xhr) {
      return res.json({ url: session.url });
    }

    res.redirect(303, session.url);
  } catch (error) {
    console.error("Error creating Checkout Session:", error);
    if (req.headers.accept?.includes("application/json")) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).send(`
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 580px; margin: 40px auto; padding: 28px; border: 1px solid #E8E6DC; border-radius: 16px; background: #FAF9F5; color: #141413;">
        <h2 style="color: #BF4D43; margin-top: 0; font-size: 20px;">Stripe API Error: ${error.type || "Checkout Error"}</h2>
        <p style="color: #5E5D59; line-height: 1.6;">${error.message}</p>
        <p style="margin-top: 20px; margin-bottom: 0;"><a href="/checkout" style="color: #D97757; font-weight: 600; text-decoration: none;">&larr; Return to Checkout</a></p>
      </div>
    `);
  }
});

// Stripe Webhook Endpoint for fulfillment
app.post("/api/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event = req.body;

  if (endpointSecret) {
    const signature = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    } catch (err) {
      console.log("Webhook signature verification failed.", err.message);
      return res.sendStatus(400);
    }
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("Checkout completed for session:", session.id);
      // Fulfill the purchase, grant agent API key & subscription access
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

if (require.main === module) {
  app.listen(port, () => {
    console.log(`OnlyAgents server running on http://localhost:${port}`);
  });
}

module.exports = app;
