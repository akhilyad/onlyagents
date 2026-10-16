---
name: onlyagents-sleek-frontend
description: Build and maintain the OnlyAgents subscription marketplace UI using the Sleek Analytics (getsleek.io) real-time conversion architecture and the 26-token DesignMD Inspector specification.
---

# OnlyAgents Frontend Skill (`SKILL.md`)

## When to Use This Skill
Use this skill whenever generating, extending, or styling user-facing pages, agent profile cards, sandbox terminals, or checkout/deployment modals for **OnlyAgents**.

## Mandatory Rules & Constraints

1. **Enforce Exact DesignMD Inspector Tokens:**
   - Never use generic Tailwind blues or cool grays. Bind all styles to the 26 CSS custom properties from the inspector (`--color-gray-950: #141413`, `--color-gray-050: #FAF9F5`, `--color-clay: #D97757`, `--color-switch-on: #2C84DB`, `--color-mineral: #629987`, `--color-heather: #CBCADB`, `--color-cactus: #BCD1CA`, `--color-peach: #EBC9B7`, and borders `#F0EEE6` / `#E8E6DC` / `#D1CFC5`).
   - Use the 3-font hierarchy: Editorial Serif (`--font-serif`) for headlines, Geometric Sans (`--font-sans`) for UI controls, and Monospace (`--font-mono`) for `@handles`, SSE logs, and telemetry metrics.

2. **Adopt Sleek Analytics (`getsleek.io`) Real-Time UX Patterns:**
   - Include a top live-status announcement bar (`Autonomous Node Mesh · All systems operational`).
   - Show live, breathing telemetry indicators (`Autonomous Node Online` with `--color-mineral` `#629987` pulse) and real-time streaming output in the hero preview card.
   - Keep the layout inside a crisp bordered bento grid (`1px solid var(--color-gray-200)`) with zero visual clutter.

3. **Deliver All 3 Core PRD Pillars:**
   - **Pillar 1 (Hero):** Category badge (`"The Subscription Marketplace for AI Builders"`), headline (`"Uncensored compute. Unfiltered ROI."`), exact value proposition copy stating the 2%–3% fee concisely, 3 CTAs (`Explore Agents`, `Explore Top 0.1% Agents`, `Deploy Agent`), 3 buyer-centric trust metrics (`2,840+` Verified Live Agents, `99.98%` System-Wide Uptime, `< 220 ms` Mean Execution Latency), and the Featured Top 0.1% Agent Card with live streaming terminal.
   - **Pillar 2 (Agent Discovery Feed):** Real-time `< 50 ms` search input (by natural language, `@handle`, or tags), 6 category tabs (`All Agents`, `Coding & DevOps`, `Deep Research`, `Customer Support`, `Growth & Automation`, `Data & Finance`), and 4 sort toggles (`Top 0.1%`, `Trending`, `Highest Uptime`, `Newest`).
   - **Pillar 3 (Action Modals):**
     - `Try Demo` Ephemeral Sandbox Modal with 3-run rate limit tracker (`3/3 runs left`) and simulated SSE token streaming.
     - `Subscribe` 1-Click Stripe Checkout Modal with instant `oa_live_*` private API key and outbound webhook provisioning.
     - `Deploy Agent` Creator Publishing Modal supporting Mode A (`BYO Endpoint / Webhook` with HMAC-SHA256 secret) and Mode B (`Managed Container`) plus live `/health` endpoint verification.

4. **Strict Anti-Scope Enforcement (Zero Tolerance):**
   - **NEVER** render Creator Earnings Calculators or interactive subscriber/price sliders.
   - **NEVER** render Fee Comparison Charts (e.g., comparing 2%–3% against 30% app stores).
   - **NEVER** display internal platform financial metrics ("Monthly Agent MRR", "Creator keeps $X of$Y") on agent cards.
   - **NEVER** add a standalone commission pricing table section (`Pricing Sections: 0`, `Tables: 0`).