# Stripe Checkout Integration Guide & TODO

This document is the single source of truth for the Stripe Hosted Checkout integration on OnlyAgents.

---

## Values to Replace

The following values are placeholders and must be updated before going live.

**Files containing placeholders:**
- [server.js](server.js)
- [.env](.env)

| Field | Current Value | What to Set |
|-------|--------------|-------------|
| `mode` | `subscription` | Set to `"payment"` for one-time buyout charges or `"subscription"` for recurring monthly agent billing. |
| `success_url` | `${domain}/success?session_id={CHECKOUT_SESSION_ID}` | Your actual post-payment success page URL. Keep the `{CHECKOUT_SESSION_ID}` template parameter for order verification. |
| `cancel_url` | `${domain}` | Your actual cancel/return page URL when a user exits checkout. |
| `line_items[].price` / `STRIPE_PRICE_ID` | `price_...` | Your actual Stripe Price ID from the Stripe Dashboard ([https://dashboard.stripe.com/prices](https://dashboard.stripe.com/prices)) or created via API. |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Your secret API key from the Stripe Dashboard ([https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)). |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Your publishable API key from the Stripe Dashboard. |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Your webhook endpoint signing secret from Stripe Workbench ([https://dashboard.stripe.com/workbench/webhooks](https://dashboard.stripe.com/workbench/webhooks)) or the Stripe CLI. |
| `DOMAIN` | `http://localhost:3000` | The public URL of your deployed application or custom domain in production. |

---

## Configured Parameters

These parameters were configured in Checkout Studio and are already set correctly in `server.js`.

**Files containing these parameters:**
- [server.js](server.js)

| Parameter | Value | Description |
|-----------|-------|-------------|
| `ui_mode` | `hosted_page` | Uses Stripe's hosted payment page (*Note: For Stripe SDK versions below 21.0.0, use `hosted` if required by the SDK*). |
| `billing_address_collection` | `auto` | Automatically requests billing address when needed for tax or fraud mitigation. |
| `phone_number_collection` | `{"enabled": false}` | Disables phone number collection during checkout. |
| `automatic_tax` | `{"enabled": false}` | Automatic tax calculation disabled. |
| `allow_promotion_codes` | `false` | Promo code input field disabled in Checkout. |
| `payment_method_collection` | `always` | Collects payment method details for recurring subscriptions. |
| `submit_type` | `auto` | Uses default submit button copy suited to the checkout mode. |
| `integration_identifier` | `hosted_web_0001` | Checkout studio integration tag. |
| `origin_context` | `web` | Web client execution context. |

---

## Setup and Next Steps

### 1. Environment Variables & Credentials
1. Copy `.env.example` to `.env` if not already present:
   ```bash
   cp .env.example .env
   ```
2. Populate `.env` with your Stripe test credentials:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `STRIPE_PUBLISHABLE_KEY=pk_test_...`
   - `STRIPE_PRICE_ID=price_...`
   - `DOMAIN=http://localhost:3000`

### 2. Project Structure
The following server files were added:
```
onlyagents/
├── server.js                   # Express server with /api/create-checkout-session and /api/webhook
├── package.json                # Server dependencies (express, stripe, dotenv)
├── .env                        # Local secret keys and environment config (git-ignored)
├── .env.example                # Template for environment variables
├── STRIPE_INTEGRATION_TODO.md  # Single source of truth for Stripe setup
├── index.html                  # Landing page & agent marketplace frontend
└── index.md                    # Landing page markdown documentation
```

### 3. How the Integration Works (Flow Overview)
1. **User Action:** The user browses agents in OnlyAgents, selects a plan ($1–$3/mo or one-time), and clicks **Unlock Agent** / **Hire Agent**.
2. **Session Creation:** The browser submits a request to `POST /api/create-checkout-session`.
3. **Stripe Redirect:** The backend generates a Stripe Checkout Session with all `fixed_by_ui` parameters and returns a `303` redirect directly to Stripe's secure payment page (`session.url`).
4. **Completion:** Upon successful payment, Stripe redirects the buyer back to `success_url` (`${DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`).
5. **Webhook Fulfillment:** Stripe sends a `checkout.session.completed` event to `POST /api/webhook`. The server verifies the cryptographic signature with `STRIPE_WEBHOOK_SECRET`, provisions the buyer's scoped API key, and activates access.

### 4. Running Locally
Start the server with Node:
```bash
npm start
```
The server will start at `http://localhost:3000`, serving the landing page and the Stripe Checkout API.

### 5. Local Webhook Testing with Stripe CLI
To test webhooks locally:
1. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli).
2. Authenticate:
   ```bash
   stripe login
   ```
3. Forward events to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```
4. Copy the webhook signing secret printed by the CLI (`whsec_...`) into your `.env` file as `STRIPE_WEBHOOK_SECRET`.

### 6. Test Card Numbers
Use the following test payment details in Stripe Test Mode:
- **Card number:** `4242 4242 4242 4242`
- **Expiration:** Any future date (e.g., `12/34`)
- **CVC:** Any 3 digits (e.g., `123`)
- **Postal Code:** Any valid ZIP code (e.g., `90210`)

### 7. Production Checklist & Resources
- Replace test keys (`sk_test_...`) with restricted production keys (`rk_live_...`).
- Register your production webhook endpoint in the [Stripe Dashboard](https://dashboard.stripe.com/webhooks).
- Verify terms of service and business profile requirements.
- Resources:
  - [Stripe Support](https://support.stripe.com)
  - [Stripe Documentation & MCP](https://docs.stripe.com/mcp)
  - [Stripe Checkout Guide](https://docs.stripe.com/payments/checkout)
