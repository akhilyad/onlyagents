---
name: "OnlyAgents — Sleek Editorial Telemetry System"
source_reference: "https://getsleek.io?utm_source=designmd-inspector"
surface: "marketing"
audience: "AI builders, autonomous agent creators, and B2B/B2C technical buyers"
brand_character: "Conversion-focused marketplace presence with warm editorial surfaces, real-time SSE telemetry, a 26-token color palette, and a 3-typeface hierarchy."
tokens:
  colors:
    text_primary:
      gray_950: "#141413"
      gray_650: "#4D4C48"
      gray_600: "#5E5D59"
    text_secondary:
      gray_550: "#73726C"
      gray_500: "#87867F"
      gray_480: "#898781"
      plum: "#827DBD"
      mineral: "#629987"
      sky: "#6A9BCC"
    text_light:
      gray_350: "#C2C0B6"
      gray_250: "#DEDCD1"
      gray_050: "#FAF9F5"
    accents:
      clay: "#D97757"
      clay_hover: "#C6613F"
      clay_dark: "#C46849"
      switch_on: "#2C84DB"
      error: "#BF4D43"
    surfaces:
      background_white: "#FFFFFF"
      background_ivory: "#FAF9F5"
      heather: "#CBCADB"
      cactus: "#BCD1CA"
      peach: "#EBC9B7"
      background_dark_450: "#9C9A92"
      background_dark_400: "#B0AEA5"
    borders:
      gray_300: "#D1CFC5"
      gray_200: "#E8E6DC"
      gray_150: "#F0EEE6"
  typography:
    font_primary: "'Newsreader', 'Instrument Serif', Georgia, serif" # anthropicSerif
    font_sans: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif" # anthropicSans
    font_mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace" # system-ui / telemetry
    size_scale:
      text_xs: "10px"
      text_sm: "11px"
      text_base: "12px"
      text_lg: "13px"
      text_xl: "15px"
      text_2xl: "16px"
      text_3xl: "19px"
      text_4xl: "32px"
      text_9: "52px"
      text_10: "72px"
    weights: [400, 500, 600]
  spacing:
    base: "4px"
    scale:
      space_1: "2px"
      space_2: "4px"
      space_3: "6px"
      space_4: "7px"
      space_5: "8px"
      space_6: "9px"
      space_7: "10px"
      space_8: "11px"
      space_9: "12px"
      space_10: "15px"
      space_11: "16px"
      space_12: "17px"
      space_13: "18px"
      space_14: "20px"
      space_15: "24px"
      space_16: "32px"
      space_17: "44px"
      space_18: "64px"
      space_19: "88px"
      space_20: "128px"
      space_21: "189px"
      space_22: "200px"
  motion:
    duration_fast: "color 0.1s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out"
    duration_transform_fast: "transform 0.16s ease-out"
    duration_base: "opacity 0.3s, transform 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)"
    duration_spring: "opacity 0.42s, transform 0.52s cubic-bezier(0.34, 1.42, 0.64, 1), visibility"
    duration_slow: "transform 0.75s cubic-bezier(0.19, 1, 0.22, 1), color 0.5s cubic-bezier(0.19, 1, 0.22, 1)"
---

# OnlyAgents Design System (`DESIGN.md`)

## 1. Visual Theme & Atmosphere
Inspired by **Sleek Analytics (`getsleek.io`)** and the extracted **DesignMD Inspector** profile, OnlyAgents blends **tactile editorial warmth** with **live developer telemetry**. Rather than cold neon cyberpunk clichés, the canvas sits on Warm Alabaster Ivory (`#FAF9F5`) and Crisp White (`#FFFFFF`) framed by exposed hairline architectural grids (`#E8E6DC` and `#F0EEE6`). Live autonomous agent activity is surfaced immediately in the hero and feed—mirroring how Sleek Analytics showcases live visitor sessions ("Online · All systems operational") directly on the landing surface without marketing fluff.

## 2. Color Palette & Roles (26 Inspector Tokens)
* **Primary Ink & Editorial Hierarchy:**
  * **Obsidian Charcoal (`#141413` / `--color-gray-950`):** Primary headlines, agent titles, prices, and high-contrast terminal surfaces.
  * **Deep Warm Slate (`#4D4C48` / `--color-gray-650`) & Umber Gray (`#5E5D59` / `--color-gray-600`):** Primary body copy and capability descriptions.
* **Secondary Metadata & Semantic Telemetry:**
  * **Muted Stone (`#73726C` / `--color-gray-550`), Warm Pewter (`#87867F` / `--color-gray-500`), & Driftwood (`#898781`):** `@handle` attributions, latency labels, and secondary captions.
  * **Verified Switch Blue (`#2C84DB` / `--color-switch-on`):** Creator verification checkmarks, active filter toggles, and API key badges.
  * **Mineral Sage (`#629987` / `--color-mineral`):** Verified SLA uptime indicators (`99.98%`) and `Autonomous Node Online` status pulses.
  * **Editorial Plum (`#827DBD` / `--color-plum`) & Cerulean Sky (`#6A9BCC` / `--color-sky`):** Rank tier accents (`Top 0.1%`, `Top 1%`) and streaming SSE token highlights.
* **Conversion Accents:**
  * **Terracotta Clay (`#D97757` / `--color-clay`), Fired Clay Hover (`#C6613F` / `--color-clay-hover`), & Deep Rust (`#C46849` / `--color-clay-dark`):** Primary conversion CTAs (`Subscribe`, `Deploy Agent`).
  * **Crimson Alert (`#BF4D43` / `--color-error`):** Sandbox rate-limit warnings and degraded node alerts.
* **Tactile Pastels & Architectural Borders:**
  * **Soft Heather (`#CBCADB`), Desert Cactus (`#BCD1CA`), & Warm Peach (`#EBC9B7`):** Category badge surfaces and agent card header banners.
  * **Warm Hairline Borders (`#F0EEE6` / `--color-gray-150`, `#E8E6DC` / `--color-gray-200`, `#D1CFC5` / `--color-gray-300`):** 1px structural grid dividers and card outlines.

## 3. Typography Rules
* **Display Serif (`anthropicSerif` -> `Newsreader` / `Instrument Serif`):** Used exclusively for high-impact hero headlines (`72px` / `text-10` on desktop, `52px` / `text-9` on tablet) and section headers (`32px` / `text-4xl`), weighted at `400`–`500` with tight `-0.03em` tracking.
* **UI Sans (`anthropicSans` -> `Plus Jakarta Sans` / `Inter`):** Used for navigation, agent cards, buttons, and descriptions across `12px` (`text-base`), `13px` (`text-lg`), `15px` (`text-xl`), `16px` (`text-2xl`), and `19px` (`text-3xl`) at weights `400`, `500`, and `600`.
* **Telemetry Mono (`system-ui` mono -> `JetBrains Mono`):** Used for `@handles`, live SSE terminal streams, latency readouts (`< 220 ms`), and `oa_live_*` API keys at `11px`–`13px`.

## 4. Component Stylings
* **Sleek Bento Grid Cards:** Exposed `1px solid #E8E6DC` borders on `#FFFFFF` surfaces with subtle `12px` (`space-9`) border radius, elevated on hover via `transform 0.16s ease-out` and border darkening to `#D1CFC5`.
* **Featured Hero Terminal Card:** Combines an `#141413` obsidian live SSE streaming console with a `#FFFFFF` header and footer bar, allowing prospective buyers to watch live autonomous execution or click `Try Demo` immediately.
* **Dual-Action Agent Cards:** Top tinted surface bar (`--color-heather`, `--color-cactus`, or `--color-peach`) displaying category + rank tier (`Top 0.1%`, `Top 1%`, `Trending`), verified blue checkmark (`#2C84DB`), 3-column buyer telemetry strip (Subscribers, Uptime %, Latency ms), and paired **Subscribe ($X/mo)** + **Try Demo** buttons.

## 5. Layout Principles & Anti-Scope Guardrails
* **3-Pillar Conversion Flow:** Top announcement bar + sticky nav $\rightarrow$ Split Hero (Editorial value proposition + Featured Top 0.1% Live Agent Terminal) $\rightarrow$ Real-Time Search & Category Discovery Grid $\rightarrow$ Lightweight Modal Workflows.
* **Zero Pricing Tables or Fee Calculators:** Matching both the Inspector Component Profile (`Tables: 0`, `Pricing Sections: 0`) and the OnlyAgents PRD Anti-Scope, never render creator earnings sliders, fee-comparison bar charts, or internal MRR metrics.