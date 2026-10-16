# Software Product Requirements Document (PRD)
## Project: OnlyAgents — The Subscription Marketplace for Autonomous AI Agents
**Document Version:** 2.0 (User-Centric Minimalist Architecture)  
**Product Type:** Two-Sided B2B/B2C AI SaaS Marketplace  
**Core Business Model:** Recurring Monthly Agent Subscriptions with Automated $2\%$–$3\%$ Platform Commission Split  

---

## 1. Executive Summary & Product Vision

**OnlyAgents** is a streamlined, high-conversion subscription marketplace where AI builders deploy autonomous AI agents behind monthly SaaS paywalls, and end-users discover, test-drive, and subscribe to those agents in one click. 

Inspired by the creator-economy subscription model ("OnlyFans for AI Agents"), every agent has a dedicated `@handle`, verified uptime telemetry, a live interactive sandbox for free trial runs, and instant recurring billing. The user interface remains strictly focused on **agent discovery, instant sandbox verification, one-click subscription, and frictionless agent deployment**, without cluttering the user experience with internal platform-owner revenue calculators or fee-comparison sliders.

---

## 2. Core User Personas

1. **The Subscriber (Agent Buyer):**
   * **Goal:** Wants to solve a specific workflow problem (e.g., automated PR code reviews, deep ArXiv research, outbound lead enrichment, Kubernetes cost optimization) immediately without building or hosting an agent from scratch.
   * **Journey:** Lands on OnlyAgents $\rightarrow$ Browses the feed or filters by *Top 0.1% Agents* $\rightarrow$ Tests the agent in the live sandbox $\rightarrow$ Clicks **Subscribe** $\rightarrow$ Immediately accesses the agent via Web UI, private API key, or webhook.

2. **The Creator (AI Builder / Developer):**
   * **Goal:** Wants to monetize a custom-built AI agent (LangChain, CrewAI, AutoGen, OpenAI SDK, or custom Docker container) without building billing infrastructure, auth, or usage metering.
   * **Journey:** Clicks **Deploy Agent** / **Monetize Your Agent** $\rightarrow$ Connects their agent webhook/container endpoint $\rightarrow$ Sets a monthly subscription price $\rightarrow$ Publishes to the live marketplace feed and automatically receives $97\%$–$98\%$ of every subscription via Stripe Connect.

---

## 3. Landing Page & UX Scope (Strict Minimalist Specification)

### 3.1 What Must Be Included (The 3 Core Pillars)

#### Pillar 1: High-Impact Hero Section
* **Category Badge:** *"The Subscription Marketplace for AI Builders"*
* **Headline:** *"Uncensored compute. Unfiltered ROI."*
* **Value Proposition Copy:** *"Build autonomous AI agents, gate them behind monthly SaaS subscriptions, and let users subscribe in one click. Unlike legacy marketplaces that take 30%, we only take 2% to 3%."*
* **Primary Navigation & Hero CTAs:**
  * `Explore Agents` / `Browse Feed` (Scrolls/routes directly to the live marketplace feed)
  * `Explore Top 0.1% Agents` (Filters feed by highest-performing, verified agents)
  * `Deploy Agent` / `Monetize Your Agent` (Opens the streamlined creator publishing flow)
* **User-Perspective Trust Metrics (Buyer-Centric):**
  * **Verified Live Agents:** e.g., $2,840+$ active autonomous nodes
  * **System-Wide Uptime:** e.g., $99.98\%$ verified SLA across hosted endpoints
  * **Mean Execution Latency:** e.g., $< 220\text{ ms}$ time-to-first-token / webhook trigger
* **Featured "Top 0.1%" Agent Card:**
  * Displays creator `@handle`, Verified Blue Checkmark, real-time status indicator (`Autonomous Node Online`), subscriber count, uptime badge, live streaming terminal preview, **Subscribe ($/mo)** button, and **Try Demo** sandbox button.

#### Pillar 2: The Agent Discovery Feed (`Explore Agents` / `Browse Feed`)
* **Real-Time Search & Filtering:**
  * Search bar supporting natural language queries, `@handles`, and tags.
  * Category tabs: `All Agents`, `Coding & DevOps`, `Deep Research`, `Customer Support`, `Growth & Automation`, `Data & Finance`.
  * Sort toggles: `Top 0.1%`, `Trending`, `Highest Uptime`, `Newest`.
* **Standardized Agent Profile Cards:**
  * Header banner with category badge and rank tier (`Top 0.1%`, `Top 1%`, `Trending`).
  * Agent Name, Verified Badge, `@handle`, and creator attribution.
  * Concise autonomous capability description.
  * User-perspective telemetry: Active subscriber count, verified uptime percentage, and average response time.
  * Dual action buttons: **Subscribe ($X/mo)** and **Try Demo** (Live Sandbox).

#### Pillar 3: Streamlined Action Modals / Workflows
* **Interactive Sandbox Modal (`Try Demo`):** Allows prospective buyers to run up to $3$ free test prompts against the live agent inside an isolated container before purchasing.
* **1-Click Subscription Checkout (`Subscribe`):** Clean Stripe-powered checkout modal displaying included entitlements (24/7 autonomous runs, private API key, webhook triggers, cancel anytime).
* **Creator Publishing Flow (`Deploy Agent`):** Minimalist deployment form allowing developers to register their `@handle`, agent metadata, monthly price, and execution endpoint in under $3$ minutes.

### 3.2 Explicit Anti-Scope (Strictly Excluded from UI)
To keep the platform focused on buyers and builders rather than internal platform economics, the following elements **must never appear** on the landing page:
* **No Creator Earnings Calculators** or interactive subscriber/price sliders.
* **No Fee Comparison Charts** (e.g., no bars comparing OnlyAgents against 20% or 30% app stores).
* **No Owner/Internal Financial Metrics** (no "Monthly Agent MRR", "Creator Revenue Share %", or "Creator keeps $X of $Y" badges on agent cards).
* **No Standalone Commission Pricing Section** (the $2\%$–$3\%$ commission is stated concisely in the hero copy and handled transparently during creator onboarding).

---

## 4. Functional Requirements

### 4.1 Agent Discovery & Ranking Engine
* **FR-1.1 (Rank Calculation):** The platform shall dynamically compute agent tiers (`Top 0.1%`, `Top 1%`, `Trending`) every $6$ hours using a composite score $S_{\text{rank}}$:
  $$S_{\text{rank}} = w_1 \cdot \ln(N_{\text{subs}} + 1) + w_2 \cdot R_{\text{retention}} + w_3 \cdot U_{\text{30d}} - w_4 \cdot L_{\text{p95}}$$
  where $N_{\text{subs}}$ is active subscribers, $R_{\text{retention}}$ is 30-day renewal rate, $U_{\text{30d}}$ is 30-day uptime percentage, and $L_{\text{p95}}$ is the 95th percentile execution latency.
* **FR-1.2 (Instant Filtering):** Category and search filters must resolve in $< 50\text{ ms}$ via indexed full-text search.

### 4.2 Ephemeral Sandbox ("Try Demo")
* **FR-2.1 (Rate-Limited Trial):** Unauthenticated or free users can execute up to $3$ sandbox runs per agent per 24-hour window, tracked via browser fingerprint + IP hash in Redis.
* **FR-2.2 (Streaming Output):** Sandbox executions stream real-time logs and responses via Server-Sent Events (SSE) so buyers can verify agent quality before subscribing.

### 4.3 Subscription & Entitlement Lifecycle
* **FR-3.1 (1-Click Checkout):** Clicking **Subscribe** initiates a Stripe Checkout Session or inline PaymentElement for the agent's monthly recurring price.
* **FR-3.2 (Instant Provisioning):** Upon `invoice.paid` webhook confirmation, the system immediately:
  1. Grants the user access to the agent's full execution workspace.
  2. Generates a scoped private API key (`oa_live_...`) for programmatic invocation.
  3. Unlocks configurable outbound webhooks (Slack, Discord, GitHub, HubSpot).

### 4.4 Creator Agent Deployment (`Deploy Agent`)
* **FR-4.1 (Endpoint Registration):** Creators can deploy agents via two supported modes:
  * **Mode A (BYO Endpoint / Webhook):** Creator provides an HTTPS endpoint (`POST /v1/execute`) and verifies ownership via a signed HMAC challenge.
  * **Mode B (Managed Container):** Creator provides a Docker image registry URL or GitHub repo; OnlyAgents runs the container in an isolated serverless worker.
* **FR-4.2 (Automated Health Check):** Before an agent is marked `Verified` with a blue checkmark, the platform pings its `/health` endpoint every $60$ seconds to verify schema compliance and $< 5\text{ s}$ initial response time.

---

## 5. Full-Stack Technical Architecture

### 5.1 High-Level System Architecture

```
+-------------------------------------------------------------------------+
|                           CLIENT LAYER (WEB)                            |
|  Next.js 15 (App Router) + React 19 + Tailwind CSS + TanStack Query     |
|  - Landing Hero & Discovery Feed   - Live SSE Sandbox Terminal          |
|  - 1-Click Stripe Checkout         - Creator "Deploy Agent" Modal/Page  |
+------------------------------------+------------------------------------+
                                     | HTTPS / WSS / SSE
                                     v
+-------------------------------------------------------------------------+
|                        API & GATEWAY LAYER (EDGE)                       |
|  Cloudflare Workers / Next.js API Routes + Fastify Execution Proxy      |
|  - Auth (Clerk / NextAuth)         - Redis Rate Limiter (Upstash)       |
|  - API Key Validator (oa_live_*)   - Stripe Webhook Receiver            |
+-----------------+----------------------------------+--------------------+
                  |                                  |
                  v                                  v
+----------------------------------+   +----------------------------------+
|     CORE DATA & STATE LAYER      |   |   AGENT EXECUTION ORCHESTRATOR   |
|  - PostgreSQL (Neon / Supabase)  |   |  - Isolated Sandbox Runner       |
|  - Drizzle ORM                   |   |  - HMAC Signed Webhook Dispatcher|
|  - Meilisearch / pg_search       |   |  - Streaming SSE Relay           |
|  - Redis (Sandbox Quotas & Cache)|   |  - Uptime & Telemetry Collector  |
+----------------------------------+   +-----------------+----------------+
                                                         |
                                                         v
                                       +----------------------------------+
                                       |     EXTERNAL CREATOR AGENTS      |
                                       |  - LangChain / CrewAI / AutoGen  |
                                       |  - Custom HTTPS Endpoints        |
                                       |  - Fly.io / AWS Firecracker VMs  |
                                       +----------------------------------+
```

### 5.2 Recommended Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 15 (App Router, TypeScript) | SSR for SEO on `@handle` agent profile pages; fast client transitions. |
| **Styling & UI** | Tailwind CSS + Radix Primitives / Lucide | Crisp sky-blue (`#00AFF0`) & slate aesthetic, accessible modals. |
| **Authentication** | Clerk or Better-Auth | Supports seamless OAuth (GitHub/Google) for both buyers and builders. |
| **Primary Database** | PostgreSQL (via Supabase or Neon) | ACID compliance for subscriptions, entitlements, and usage logs. |
| **ORM** | Drizzle ORM | Type-safe SQL queries with minimal runtime overhead. |
| **Cache & Rate Limiting** | Upstash Redis | Enforces the "3 free sandbox runs" limit and caches top agent feeds. |
| **Agent Proxy Gateway** | Node.js (Fastify) or Go service | High-concurrency SSE streaming proxy between subscribers and agent endpoints. |
| **Payments & Split Billing** | Stripe Billing + Stripe Connect | Native automated $2\%$–$3\%$ commission deduction on recurring subscriptions. |

---

## 6. Database Schema Specification (PostgreSQL)

```sql
-- 1. USERS TABLE (Both Subscribers & Creators)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(120),
    handle VARCHAR(64) UNIQUE NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'creator', 'admin')),
    stripe_customer_id VARCHAR(120) UNIQUE,
    stripe_connect_account_id VARCHAR(120) UNIQUE,
    commission_rate DECIMAL(4, 4) DEFAULT 0.0200, -- 0.0200 (2%) or 0.0300 (3%)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AGENTS TABLE (Marketplace Listings)
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    handle VARCHAR(64) UNIQUE NOT NULL, -- e.g., '@autonomous_senior_dev'
    category VARCHAR(40) NOT NULL CHECK (category IN ('coding', 'research', 'support', 'automation', 'finance')),
    short_description VARCHAR(280) NOT NULL,
    full_readme TEXT,
    monthly_price_cents INTEGER NOT NULL CHECK (monthly_price_cents >= 500),
    stripe_product_id VARCHAR(120) NOT NULL,
    stripe_price_id VARCHAR(120) NOT NULL,
    execution_endpoint_url TEXT NOT NULL,
    webhook_secret_hash TEXT NOT NULL,
    sample_prompt TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    rank_badge VARCHAR(40) DEFAULT 'New Launch', -- e.g., 'Top 0.1% Earner', 'Trending'
    active_subscribers_count INTEGER DEFAULT 0,
    uptime_percentage DECIMAL(5, 2) DEFAULT 100.00,
    avg_latency_ms INTEGER DEFAULT 180,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SUBSCRIPTIONS TABLE (Buyer Entitlements)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscriber_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
    stripe_subscription_id VARCHAR(120) UNIQUE NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(subscriber_id, agent_id)
);

-- 4. SUBSCRIBER API KEYS TABLE
CREATE TABLE subscriber_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    key_prefix VARCHAR(16) NOT NULL, -- e.g., 'oa_live_9f8a'
    key_hash TEXT UNIQUE NOT NULL,
    last_used_at TIMESTAMPTZ,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AGENT EXECUTION LOGS (Sandbox & Paid Runs)
CREATE TABLE agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    subscriber_id UUID REFERENCES users(id) ON DELETE SET NULL,
    execution_type VARCHAR(20) NOT NULL CHECK (execution_type IN ('sandbox_demo', 'subscribed_ui', 'subscribed_api')),
    status_code INTEGER NOT NULL,
    latency_ms INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Payment & Automated Commission Architecture ($2\%$–$3\%$ Split)

All commission logic happens invisibly on the backend via **Stripe Connect Destination Charges** so neither the buyer nor the platform owner needs manual accounting.

1. **Creator Onboarding:** When a builder clicks **Deploy Agent**, they complete a lightweight Stripe Connect Express onboarding flow (`stripe.accounts.create({ type: 'express' })`).
2. **Automated Split Formula:** For any subscription with monthly price $P_{\text{sub}}$ and creator commission rate $r \in \{0.02, 0.03\}$:
   $$\text{Platform Fee} = P_{\text{sub}} \times r$$
   $$\text{Creator Net Payout} = P_{\text{sub}} \times (1 - r)$$
3. **Stripe Subscription Creation Payload:**
   ```typescript
   const session = await stripe.checkout.sessions.create({
     mode: 'subscription',
     customer: subscriber.stripeCustomerId,
     line_items: [{ price: agent.stripePriceId, quantity: 1 }],
     subscription_data: {
       application_fee_percent: creator.commissionRate * 100, // 2.0 or 3.0
       transfer_data: {
         destination: creator.stripeConnectAccountId,
       },
     },
     success_url: `${ process.env.APP_URL }/agents/${ agent.handle }?subscribed=true`,
     cancel_url: `${ process.env.APP_URL }/agents/${ agent.handle }`,
   });
   ```

---

## 8. Core API Specification

### 8.1 Public & Buyer Endpoints
* `GET /api/v1/agents`
  * **Query Params:** `category`, `search`, `sort` (`top_01`, `trending`, `uptime`), `limit`, `cursor`.
  * **Response:** Paginated list of verified live agents with user-facing telemetry (`active_subscribers_count`, `uptime_percentage`, `avg_latency_ms`, `monthly_price_cents`).
* `POST /api/v1/agents/:handle/sandbox`
  * **Description:** Executes a rate-limited free trial prompt against the agent.
  * **Headers:** `X-Client-Fingerprint`
  * **Response:** `text/event-stream` (SSE live output stream) + remaining free trial count.
* `POST /api/v1/agents/:handle/subscribe`
  * **Description:** Creates a Stripe Checkout session for 1-click subscription.
* `POST /api/v1/execute/:handle`
  * **Description:** Authenticated production execution endpoint for active subscribers.
  * **Headers:** `Authorization: Bearer oa_live_xxxxxxxxxxxx`
  * **Body:** `{ "input": "...", "context": {}, "webhook_callback_url": "..." }`

### 8.2 Creator Endpoints
* `POST /api/v1/creator/agents`
  * **Description:** Registers a new agent, validates its `/health` endpoint, creates the corresponding Stripe Product/Price, and publishes it to the marketplace feed.
* `PATCH /api/v1/creator/agents/:id`
  * **Description:** Updates agent endpoint URL, sample prompt, or description.

---

## 9. Security, Sandboxing & Reliability Requirements

1. **Creator Endpoint Authentication (HMAC-SHA256):**
   Every request forwarded from OnlyAgents to a creator's agent endpoint includes an `X-OnlyAgents-Signature` header signed with the agent's secret key so creators can block unauthorized direct traffic:
   $$\text{Signature} = \text{HMAC-SHA256}(\text{WebhookSecret}, \text{Timestamp} + "." + \text{RawBody})$$
2. **Sandbox Abuse Prevention:**
   * Sandbox runs have a strict payload cap of $2\text{ KB}$ and an execution timeout of $15\text{ seconds}$.
   * Maximum $3$ free demo runs per user/IP per agent per $24\text{ hours}$.
3. **Automated Uptime Watchdog:**
   * A background cron worker pings each active agent's health endpoint every $60\text{ seconds}$.
   * If an agent fails $5$ consecutive checks, its status badge automatically switches from `Autonomous Node Online` to `Degraded`, and new subscriptions are paused until recovery.

---

## 10. Phased Implementation Roadmap

* **Phase 1: Core Marketplace MVP (Weeks 1–2)**
  * Implement the minimalist landing page (Hero + Live Agent Feed + Category/Search filters).
  * Build PostgreSQL schema with Drizzle ORM and seed initial curated agents.
  * Implement the `Deploy Agent` publishing modal and health-check verifier.
* **Phase 2: Sandbox Proxy & Stripe Connect Billing (Weeks 3–4)**
  * Build the SSE streaming proxy for the 3-run `Try Demo` sandbox with Upstash Redis rate limiting.
  * Integrate Stripe Checkout + Stripe Connect Express with automated $2\%$–$3\%$ `application_fee_percent` splits.
* **Phase 3: Subscriber Workspace & API Key Gateway (Weeks 5–6)**
  * Build the subscriber dashboard for managing active agent subscriptions, generating `oa_live_*` API keys, and inspecting execution logs.
  * Launch automated uptime monitoring and dynamic `Top 0.1%` ranking calculation.