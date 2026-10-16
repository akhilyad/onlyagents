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
| `mode` | per request | Chosen automatically: `"subscription"` for an agent's monthly plan or the `/checkout` membership, `"payment"` for an agent's lifetime (one-time) plan. |
| `success_url` | `${domain}/success?session_id={CHECKOUT_SESSION_ID}` | Your actual post-payment success page URL. Keep the `{CHECKOUT_SESSION_ID}` template parameter for order verification. |
| `cancel_url` | `${domain}/cancel` | Page shown when a user exits checkout without paying. |
| `line_items[].price` / `STRIPE_PRICE_ID` | `price_...` | Price ID for the generic OnlyAgents membership sold on `/checkout` ([https://dashboard.stripe.com/prices](https://dashboard.stripe.com/prices)). Individual agents use inline `price_data` built from `agents.js` (USD), so the amount charged always matches the marketplace card. |
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
| `payment_method_collection` | `always` | Collects payment method details for recurring subscriptions. |
| `allow_promotion_codes` | `false` | Promo code input field disabled in Checkout. |
| `consent_collection` | `{"terms_of_service": "required"}` | Requires customers to explicitly accept Terms of Service during checkout. |
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
├── api/
│   └── index.js                # Serverless function bridge for Vercel deployments
├── vercel.json                 # Vercel routing rules and serverless rewrites
├── server.js                   # Express server: checkout session, order lookup, membership price, webhook
├── agents.js                   # Marketplace catalog shared by index.html and server.js (prices live here)
├── .vercelignore               # Keeps internal *.md docs off the public deployment
├── package.json                # Server dependencies (express, stripe, dotenv)
├── .env                        # Local secret keys and environment config (git-ignored)
├── .env.example                # Template for environment variables
├── STRIPE_INTEGRATION_TODO.md  # Single source of truth for Stripe setup
├── success.html                # Post-payment order confirmation page
├── cancel.html                 # Post-checkout cancellation return page
├── checkout.html               # Standalone product checkout page
├── style.css                   # Styles for checkout and confirmation cards
├── index.html                  # Landing page & agent marketplace frontend
└── index.md                    # Landing page markdown documentation
```

### 3. Vercel Deployment Requirements
Because `.env` is git-ignored, you must configure the following in your **Vercel Dashboard** under **Project Settings → Environment Variables** (then redeploy — env changes only apply to new deployments). Without `STRIPE_SECRET_KEY` the checkout endpoint returns *"Checkout isn't configured yet"*:
- `STRIPE_SECRET_KEY`: `sk_live_...` (or `sk_test_...`)
- `STRIPE_PUBLISHABLE_KEY`: `pk_live_...` (or `pk_test_...`)
- `STRIPE_PRICE_ID`: `price_1Tu8wxE8UUeJxyCSg5p5uNBJ`
- `STRIPE_WEBHOOK_SECRET`: `whsec_...` from the webhook endpoint you register for `https://<your-domain>/api/webhook`
- `DOMAIN` (Optional): `https://your-domain.vercel.app` (automatically detected if omitted)

### 3. How the Integration Works (Flow Overview)
1. **User Action:** The user browses agents in OnlyAgents, selects a plan ($1–$3/mo or one-time), and clicks **Unlock Agent** / **Hire Agent**.
2. **Session Creation:** The modal posts `{ agent, plan, email }` to `POST /create-checkout-session` (JSON via `fetch`, or a plain form post without JS). The server looks the agent up in `agents.js` — client-sent prices are never trusted.
3. **Stripe Redirect:** The backend creates the Checkout Session and returns `{ url }` (JSON) or a `303` redirect to Stripe's hosted payment page. Errors are shown inline in the modal.
4. **Completion:** Upon successful payment, Stripe redirects the buyer to `${DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`; `success.html` calls `GET /api/checkout-session` to show the verified order summary.
5. **Webhook Fulfillment:** Stripe sends a `checkout.session.completed` event to `POST /api/webhook`. The server verifies the signature with `STRIPE_WEBHOOK_SECRET` (unverified events are rejected) and logs `session.metadata.agent` / `plan`. **TODO:** provision the buyer's scoped API key and activate access here.

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
