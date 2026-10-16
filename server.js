// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
require("dotenv").config();
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 3000;

// Serve static frontend landing page files
app.use(express.static(__dirname));

// Parse URL-encoded and JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Stripe Hosted Checkout Session creation endpoint
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const domain = process.env.DOMAIN || `http://localhost:${port}`;
    const mode = "subscription"; // "subscription" for recurring agent access or "payment" for one-time unlock

    const sessionParams = {
      ui_mode: "hosted_page",
      mode: mode,
      billing_address_collection: "auto",
      phone_number_collection: {
        enabled: false,
      },
      automatic_tax: {
        enabled: false,
      },
      allow_promotion_codes: false,
      submit_type: "auto",
      integration_identifier: "hosted_web_0001",
      origin_context: "web",
      success_url: `${domain}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}`,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || "price_...",
          quantity: 1,
        },
      ],
    };

    if (mode === "subscription") {
      sessionParams.payment_method_collection = "always";
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.redirect(303, session.url);
  } catch (error) {
    console.error("Error creating Checkout Session:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET fallback support for direct links and browser triggers
app.get("/api/create-checkout-session", async (req, res) => {
  try {
    const domain = process.env.DOMAIN || `http://localhost:${port}`;
    const mode = "subscription";

    const sessionParams = {
      ui_mode: "hosted_page",
      mode: mode,
      billing_address_collection: "auto",
      phone_number_collection: {
        enabled: false,
      },
      automatic_tax: {
        enabled: false,
      },
      allow_promotion_codes: false,
      submit_type: "auto",
      integration_identifier: "hosted_web_0001",
      origin_context: "web",
      success_url: `${domain}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}`,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || "price_...",
          quantity: 1,
        },
      ],
    };

    if (mode === "subscription") {
      sessionParams.payment_method_collection = "always";
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.redirect(303, session.url);
  } catch (error) {
    console.error("Error creating Checkout Session:", error);
    res.status(500).json({ error: error.message });
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

app.listen(port, () => {
  console.log(`OnlyAgents server running on http://localhost:${port}`);
});
