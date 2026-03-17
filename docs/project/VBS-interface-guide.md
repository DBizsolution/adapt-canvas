# VBS Pickup Portal — What the Interface Actually Does

> **Read this first.** Forget the BRD jargon. This is what the app does, who uses it, and what screens you need to build.
>
> **Updated:** March 17, 2026 — incorporates answers from PM clarification session.

---

## The one-sentence version

**A freight company's goods arrive at a warehouse. Different people need to coordinate who picks them up, when, and with what paperwork. This portal handles that coordination.**

---

## The real-world analogy

Think of it like a **parking garage booking system**, but for shipping containers:

1. A shipment arrives at a warehouse (ACFS)
2. The shipping company says "hey, these goods belong to Client X"
3. Client X says "ok, I'm sending Courier Y to pick them up"
4. Courier Y books a pickup time slot, pays the fee, and sends a truck
5. Warehouse staff check the paperwork, then release the goods

That's it. Everything else is rules around who can do what, when, and what paperwork is needed.

---

## The 6 users (and what they see)

### 1. Wholesale Freight Forwarder (WFF)
**Who:** Big shipping companies like DHL, AGS, Mondiale
**Auth:** Username + password. Can self-register.
**What they care about:** "Where are my shipments? Have they been picked up yet?"

**Their screen is basically:**
- A table of all their House Bills (shipment tracking numbers)
- Columns: HBL reference, customs clearance status, weight & volume, milestone, HBL status
- They can **delegate** to an FF or Carrier, OR **book directly** — but never both on the same HBL
- They can upload Delivery Orders (mapped to specific HBLs)
- Search by HBL# to find specific shipments

---

### 2. Freight Forwarder (FF)
**Who:** Downstream logistics companies that handle the actual pickup coordination
**Auth:** Magic link + OTP. No account creation. WFF delegates → secure link sent to FF email → OTP to verify → scoped portal access.
**What they care about:** "I need to hand off these shipments to a carrier or customer for pickup"

**Their screen needs to:**
- Show their assigned House Bills with milestones and status
- Let them **delegate** to a carrier: search + autocomplete from ACFS party registry
- Let them **delegate** to a one-off customer: type an email → system sends a magic link
- Let them **upload a Delivery Order** (must be mapped to specific HBLs — compliance requirement)
- Let them **flag a shipment as under-bond** (customs thing — means no DO needed)
- Show which HBLs are booked, which are waiting
- Release-authority indicator per HBL: DO required / free release / under-bond / exception applied

---

### 3. Transport Carrier (TC)
**Who:** The trucking/courier company that physically picks up the goods
**Auth:** Magic link + OTP. Same mechanism as FF.
**What they care about:** "What do I need to pick up, when, and how much does it cost?"

**Their screen needs to:**
- Show House Bills delegated to them
- Let them **book a pickup slot**: pick a time window, add one or more HBLs to the booking
- **HBLs from different WFFs can be combined** in a single booking
- Show the **fee** (flat minimum + per-HBL volumetric charge, calculated individually per HBL then summed) and let them **pay via Stripe**
- Let them enter **driver details** (name, licence) and **truck details** (rego, type) — use search + autocomplete for existing drivers
- Let them **edit** driver/truck info until pickup happens
- Show their upcoming bookings with booking reference number

---

### 4. One-off Customer
**Who:** A random person/company doing a one-time pickup (no account needed)
**Auth:** Magic link + OTP. Link expires when shipment is collected.
**What they care about:** "I got an email link, I just need to book a pickup"

**Their experience:**
- Click magic link → verify with OTP → land on a single-purpose booking page
- See the House Bill(s) assigned to them
- Book a slot, enter driver/truck info, pay via Stripe, done
- Can revisit the link to check booking status (minimal status page)
- **No login. No dashboard. No account. No history.** Link scoped to assigned HBLs only.

---

### 5. ACFS Staff (Admin/Ops)
**Who:** Warehouse operations team
**Auth:** SSO via OAuth/Okta (already exists).
**What they care about:** "Are the bookings legit? Is the paperwork in order? Can we release these goods?"

**Their screen needs to:**
- Show a **queue of upcoming bookings** by site and pickup window
- A **DO checklist**: for each booking, check that the Delivery Order PDF matches the House Bill number → mark as "DO Checked"
- An **under-bond checklist**: verify under-bond status (done outside the system) → mark as "Under-bond Verified"
- An **override button**: if paperwork is missing but pickup needs to happen anyway → apply exception (restricted to certain ACFS roles, audit trail + reason required, one-time per HBL until collected)
- A **"Mark Processed" button**: once everything checks out → green light for physical pickup
- **Partial processing**: can process 9 out of 10 HBLs if 1 hasn't cleared customs — blocked HBL rebooked separately
- **Slot configuration**: set up time windows per site, density indicator (not hard capacity), cutoffs as date/time, blackout dates/holidays
- **FOC rebooking**: rebook for free in special situations (ACFS admin only, reason required)
- **Cannot change slots that already have bookings** (Phase 1)

---

### 6. Gatehouse
**Who:** Security/gate staff at the warehouse entrance
**What they care about:** "Who's coming today?"

**Their screen:**
- A **read-only daily roster** of expected pickups
- Search by booking reference or truck rego
- That's it. No buttons. No actions. Just a list.

---

## The 5 things that actually happen in the app

### Thing 1: Shipments appear
- Data flows in from Maximas via **periodic batch** (once or twice daily, not real-time)
- Portal fetches HBL data from custom cargo table starting **7 days before vessel arrival**
- Maximas talks to ICS (customs integration) to get HBL details
- House Bills show up in people's dashboards with milestone status
- **You don't build the sync** — it's backend. Your UI just displays what's there.

### Thing 2: Delegation (handing off responsibility)
- FF (or WFF) looks at their list of House Bills
- Picks one (or several) and says "Carrier X will handle pickup" → **search + autocomplete** from party registry
- OR says "this random customer will pick it up" → types an email → system sends a magic link + OTP
- Per HBL: either delegate or book directly — never both
- **UI needed:** A selection UI + either a carrier search or an email input. Full-screen, not side panel.

### Thing 3: Booking a pickup
- Carrier/Customer picks a time slot from available windows
- Adds one or more House Bills to the booking (can combine across WFFs)
- Enters driver name, licence, truck rego, truck type (autocomplete for existing)
- Sees the fee breakdown → pays via Stripe embedded checkout
- Gets a booking confirmation with booking reference number
- **UI needed:** Full-screen booking flow. Slot picker, HBL selector, driver/truck form, Stripe payment, confirmation. Progressive booking summary pane that builds as user steps through. Condense to 2-3 steps max.

### Thing 4: Paperwork validation (ACFS staff)
- Staff sees a worklist of bookings with pending checks
- Opens a booking → sees each House Bill → checks DO → marks "checked"
- For under-bond items → marks "verified"
- Can apply override if DO missing (certain roles only, audit trail required)
- Once everything passes → clicks "Processed" (can partially process)
- **UI needed:** A worklist/queue view, per-HBL checklist within a booking detail view, action buttons

### Thing 5: Pickup happens
- Physical pickup happens outside the portal
- Maximas updates the status to "Collected"
- Portal reflects it on next batch refresh
- **You don't build this** — status just updates from the backend.

---

## HBL Milestones & Status

### Milestones (from Maximas — physical journey)
`on_vessel → at_wharf → in_yard → unpacked → collected`

These are separate from the HBL pickup status. "Delegated" and "booked" are NOT milestones.

### HBL Status (portal-managed — pickup workflow)
`unassigned → delegated → booked`

### Storage fees
Timer starts after `unpacked`. Show a **storage fee flag** (not the amount) on the HBL table. Derived from `last_free_storage_date`.

---

## The paperwork rules (simplified)

There are 3 ways goods can be released. For each House Bill, one of these applies:

| Path | What it means | DO needed? |
|------|--------------|------------|
| **Standard** | Normal release | Yes — each tier uploads their own DO (3 tiers = 3 DOs). Each DO must be mapped to specific HBLs. |
| **Free Release** | Standing arrangement between two parties (e.g., AGS ↔ Geodis) | No DO needed for that tier. |
| **Under-bond** | Shipment moving between warehouses/FFs | No DO needed — but ACFS must verify the bond status offline. Flagged manually by WFF/FF staff. |

If none of these apply and the DO is missing, an **ACFS override** can force-allow the booking (restricted to certain staff roles, audit trail + reason required, one-time per HBL until collected).

**DO hierarchy:** Each level uploads independently. No inheritance. Bottom-most party must have all DOs present.

---

## The fee structure (simplified)

| Fee | When |
|-----|------|
| **Booking fee** | Flat minimum + per-HBL volumetric charge (max of weight vs volume per HBL, calculated individually then summed). Paid upfront via Stripe. |
| **Change cut-off fee** | If you change booking details after the cut-off date/time (configurable per slot) |
| **Booking cut-off fee** | If you book after the window's booking cut-off (configurable per slot as absolute date/time, not hours) |
| **No-show / rebooking** | ACFS admin rebooks for free in Phase 1. No self-service rebooking. |

- Fees are **global** in Phase 1 (no per-site or per-slot pricing)
- **ACFS staff can waive all fees** for special situations (FOC rebooking — reason required)
- **Refunds are handled entirely outside the portal** — the portal is refund-agnostic
- Flat rate vs percentage is **still undecided** by client

---

## Slot configuration (ACFS)

- **Flexible time slots** — currently 2-4 per day, overlapping allowed, no hard rules on granularity
- **No hard capacity** — use a **density indicator** instead (ACFS sets a threshold, system shows low/moderate/high, doesn't block booking)
- **Cutoffs are date/time, not hour-based** — ACFS sets an absolute cutoff per slot (e.g., Friday 5pm for Monday morning slot)
- **Blackout dates/holidays** required — overlay holiday calendar on slot config
- **Per-site configuration**, not global
- **Cannot change slots with existing bookings** (Phase 1)

---

## Data sourcing

| Data | Source | Cadence |
|------|--------|---------|
| HBL data, milestones | Maximas → periodic batch | Once or twice daily |
| Party registry (FFs, Carriers) | ACFS bulk upload | One-time for Phase 1 |
| Customs clearance status | Maximas via ICS | Batch (display only) |
| Under-bond flag | Manual (WFF/FF/ACFS staff) | On demand |

---

## Auth strategy

| Actor | Method |
|-------|--------|
| **WFF** | Username + password |
| **FF, Carrier, One-off Customer** | Magic link + OTP (no account) |
| **ACFS, Gatehouse** | SSO via OAuth/Okta |

**Note:** Cross-WFF booking may force a pivot from magic links to a proper login model for carriers. Pending client decision.

---

## What you DON'T need to build

- No customs/ABF integration
- No replacing Maximas — it stays as the source of truth
- No warehouse pick/pack tracking
- No refund processing
- No real-time data — periodic batch from Maximas
- No per-site fee configuration (global only in Phase 1)
- No self-service rebooking for carriers (Phase 1)
- No hard capacity enforcement — density indicator only

---

## Screens summary (your build list)

| # | Screen | Who uses it | Core function |
|---|--------|-------------|---------------|
| 1 | **WFF Dashboard** | Wholesale FF | HBL table + delegate or book directly + upload DO |
| 2 | **FF Dashboard** | Freight Forwarder | HBL list + delegate + upload DO + flag under-bond |
| 3 | **TC Dashboard** | Transport Carrier | Delegated HBLs + book pickup + Stripe payment + driver/truck form |
| 4 | **One-off Booking Page** | Customer | Magic link + OTP → book slot + pay + driver/truck (no login) |
| 5 | **ACFS Ops Dashboard** | ACFS Staff | Booking queue + DO checklist + override + partial processing + mark processed |
| 6 | **Slot Configuration** | ACFS Staff | Per-site time windows, density indicator, cutoffs (date/time), blackout dates |
| 7 | **Gatehouse Roster** | Gatehouse | Read-only daily booking list + search |
| 8 | **Booking Detail** | Multiple roles | Full-screen view with booking reference, all HBLs, validation status, progressive summary |
| 9 | **Payment Flow** | TC / Customer | Fee breakdown + Stripe embedded checkout |
| 10 | **Delegation Flow** | FF / WFF | Full-screen: carrier search or email-link sender |

---

## Resolved questions

All 25 PM questions have been addressed. Key resolutions:

1. **Party data:** One-time ACFS bulk upload, local DB, no Maximas sync
2. **Tier-2 FF linking:** Manual assignment by WFF (delegation = assignment)
3. **Milestones:** on_vessel, at_wharf, in_yard, unpacked, collected (pending client confirmation)
4. **Fee method:** Per-HBL volumetric (flat vs percentage still undecided)
5. **One-off customer:** Magic link + OTP, minimal status page, no dashboard
6. **Data freshness:** Periodic batch, once or twice daily
7. **Refunds:** Handled entirely offline — portal is refund-agnostic

See **PM Questions & Answers** doc for the full list with Roni's answers.

---

*Generated from BRD V1.0 + MVP Flow Diagram + PM Clarifications · March 2026*
