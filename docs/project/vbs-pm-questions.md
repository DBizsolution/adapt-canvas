# VBS Pickup Portal — Questions for PM

> Generated from intent model gaps, BRD ambiguities, and interface guide open items.
> These need answers before building the remaining actor views (FF, Carrier, ACFS, Gatehouse).
>
> **Answers sourced from:** PM clarification session (2026-03-17)

---

## 1. Actors & Permissions

### Q1. Can a WFF both delegate AND book directly on the same HBL?
**ANSWERED** — Either/or per HBL. WFF either delegates or books directly — never both on the same HBL.

### Q2. How does the Freight Forwarder (FF) authenticate?
**ANSWERED** — Magic link + OTP. No account creation.
- WFF delegates → secure link sent to FF's nominated email → OTP to same email → portal access scoped to assigned shipments
- An alternate "generic booking party login" model is being explored with the client. If adopted, all external parties get a single login type. Original proposal is magic link + OTP.

### Q3. How does the Transport Carrier authenticate?
**ANSWERED** — Same as FF. Magic link + OTP. All external parties after WFF use the same auth mechanism.

### Q4. Does the one-off customer get any dashboard or booking history?
**ANSWERED** — No dashboard. Minimal status page via magic link. Link expires when shipment is collected. No account, no history.

---

## 2. Data Sourcing

### Q5. Where does the list of FFs and Carriers come from?
**ANSWERED** — Global registry maintained by ACFS. One-time bulk upload from AGS portal/party manager into the portal's local DB. No Maximas sync.

### Q6. How is the Tier-2 FF linked to each HBL?
**ANSWERED** — WFF manually assigns FF per HBL in the portal (delegation = assignment). Maximas has no role here.

### Q7. How fresh is the data from Maximas?
**ANSWERED** — Periodic batch. Once or twice daily. No real-time integration.

---

## 3. HBL Lifecycle & State Machine

### Q8. What are the exact milestone labels?
**PARTIALLY ANSWERED — awaiting confirmed list from client**
Current understanding: `on_vessel → at_wharf → in_yard → unpacked → collected`
- No "created" status — data starts at on_vessel from Maximas
- "delegated" and "booked" are HBL statuses, NOT milestones
- After unpacked, storage fee timer starts. Next milestone is collected.

### Q9. Is "under-bond" a lifecycle state or a property of the HBL?
**ANSWERED** — It's a flag/attribute on the HBL, not a lifecycle state. Under-bond means the shipment needs to move between warehouses/FFs. Skips DO requirement.

> **Pending:** Under-bond concept needs deeper clarification — exact triggers, verification steps, and edge cases are not fully defined.

### Q10. Can an HBL skip delegation and go straight from unpacked → booked?
**ANSWERED** — Always valid. WFF can book directly without delegating (e.g., a WFF delivering to customers themselves — no delegation needed).

### Q11. What are the exact release types and their rules?
**PENDING — needs full list from client**
- **Free release** confirmed — standing arrangement between two parties (e.g., AGS ↔ Geodis). No DO required for that tier.
- **Underbond** — unclear if it's a release type. To be confirmed.
- DO rules per release type: unknown, need confirmation.

---

## 4. Delivery Orders (DOs)

### Q12. How does the portal know an HBL is under-bond?
**ANSWERED** — WFF or FF staff manually flags it in the portal. ACFS internal staff can also flag it.

### Q13. What exactly is the 3-level DO hierarchy?
**ANSWERED** — Each level uploads independently. No inheritance or cascading. 3 tiers = 3 separate DOs. The bottom-most party must have all DOs present. Free release removes the DO requirement for that tier.

Each DO must be mapped to its specific HBL — not bulk uploaded. This is a compliance/legal/audit requirement.

### Q14. What happens when ACFS overrides a missing DO?
**ANSWERED:**
- **Who can override?** Certain roles within ACFS (not all staff)
- **Audit trail?** Yes, required
- **Does override expire?** One-time per HBL. Lives until HBL is collected.

---

## 5. Bookings & Fees

### Q15. What is the fee method — flat rate per HBL or percentage of declared value?
**PARTIALLY ANSWERED — pending client decision**
- Flat minimum + per-HBL volumetric charge (calculated individually per HBL using max of weight vs volume, then summed)
- Client has NOT decided between flat rate and percentage yet. Build for flat with configurable override.

### Q16. Can HBLs from different WFFs be combined in one booking?
**ANSWERED** — Yes. A carrier can combine HBLs from different WFFs into a single booking.

> **Note:** This may force a pivot from magic links to a persistent login model for carriers. Pending client discussion.

### Q17. What payment integration is expected for Phase 1?
**ANSWERED** — Stripe embedded checkout. No custom payment UI. Storage fees may be added as a line item if data is available.

### Q18. How are refunds handled?
**ANSWERED** — Completely outside the portal. Refund-agnostic. Handled offline by ACFS.

### Q19. What are the exact cut-off rules?
**ANSWERED:**
- Cutoffs are absolute date/time per slot — not hour-based. ACFS sets a specific cutoff for each slot.
- Per site, not global.
- No-show rebooking: ACFS admin rebooks free of charge for Phase 1. No self-service rebooking.

---

## 6. ACFS Operations

### Q20. What does the ACFS processing workflow look like step by step?
**ANSWERED:**
1. 7 days before vessel arrival → Maximas receives data via slot request
2. Maximas talks to ICS (customs integration) → HBL details stored in custom cargo table
3. Portal fetches all HBL data via periodic batch
4. Status updates flow from Maximas → portal syncs periodically
5. "Upcoming bookings" = tracking milestones from on_vessel to unpacked
6. **Partial processing:** ACFS can process cleared HBLs and hold back those stuck in customs for rebooking.

### Q21. What slot configuration options does ACFS need?
**ANSWERED:**
- **Time slots:** Flexible (2-4/day). Overlapping allowed. No hard rules on granularity.
- **Capacity:** No hard limits. Density indicator instead (threshold-based, low/moderate/high, non-blocking).
- **Blackout dates/holidays:** Required. Overlay holiday calendar on slot config.
- **Per-site** configuration.
- **Cannot change slots with existing bookings** (Phase 1).

### Q22. What does "FOC rebooking" look like?
**ANSWERED:**
- ACFS admin only (not carrier).
- Overrides all fees.
- Reason/justification required for audit trail.

---

## 7. Architecture & Technical

### Q23. Single app with role-based routing, or separate apps per actor?
**ANSWERED** — Single app with role-based routing.

### Q24. What is the auth strategy?
**ANSWERED:**
- **WFF:** Username/password. No SSO.
- **FF, Carrier, One-off Customer:** Magic link + OTP. No account creation.
- **ACFS, Gatehouse:** SSO via OAuth/Okta.
- An alternate "generic booking party" login for external parties is being explored with the client.

### Q25. What happens when a WFF requests a missing HBL be added?
**ANSWERED** — No request flow exists. WFF can search by HBL only. "Request missing HBL" is not part of the BRD or Phase 1 scope.

---

## Pending Items

| Question | Status | Action needed |
|----------|--------|---------------|
| **Q8** | Partial | Awaiting confirmed milestone list from client |
| **Q9** | Answered | Under-bond concept needs deeper clarification for implementation |
| **Q11** | Open | Full list of release types + DO rules per type needed from client |
| **Q15** | Partial | Flat vs percentage decision pending from client |
| **Q16** | Answered | Cross-WFF booking may force auth model change — pending client discussion |

## Design Decisions

These decisions were surfaced during the design review session:

1. **DO-to-HBL mapping is mandatory** — Each DO must be mapped to its specific HBL, not bulk uploaded. Compliance/legal/audit requirement.
2. **Booking flow should be full-screen** (not side panel) with a progressive booking summary pane that builds as user steps through.
3. **Booking steps should be condensed** to 2-3 steps max. 5 steps feels overwhelming.
4. **Search + autocomplete** for driver, carrier, FF selection — not dropdowns. Consistent pattern across all search fields.
5. **HBL table should show:** HBL reference, customs clearance status, weight & volume, milestone status.
6. **Booking reference number** needed at top of booked HBL detail view — separate from HBL reference.
7. **Storage fee flag** on HBL table — visual indicator for outstanding storage cost. Uses "last free storage date" to auto-calculate. Not the fee amount, just the flag.
8. **Milestone label rename:** "Pickup Status" → "HBL Status". "Milestone" stays as-is (standard ACFS term). Show milestone first, then HBL status.
9. **Panel design consistency** — booking panel and delegation panel should follow same design language.
10. **Remove red highlight hue** on unassigned rows — status badge is enough. Reserve the hue for other future uses (e.g., storage fee flag).

---

## Priority Ranking

| Priority | Questions | Status |
|----------|-----------|--------|
| **P0 — Blocks all remaining work** | Q23 (architecture), Q24 (auth), Q5 (data sourcing) | All answered |
| **P1 — Blocks specific actor views** | Q1 (WFF scope), Q2-Q3 (FF/Carrier auth), Q8-Q11 (lifecycle), Q12-Q13 (DO rules) | Mostly answered. Q8, Q9, Q11 have flags |
| **P2 — Blocks booking flow** | Q15 (fees), Q16 (cross-WFF bookings), Q17 (payment), Q19 (cut-offs) | Mostly answered. Q15 partially open, Q16 may pivot auth |
| **P3 — Blocks ACFS view** | Q20-Q22 (processing workflow, slot config, FOC) | All answered |
| **P4 — Can defer** | Q4 (one-off dashboard), Q7 (data freshness), Q14 (override rules), Q18 (refunds), Q25 (missing HBL) | All answered |
