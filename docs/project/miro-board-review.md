# Miro Board Review — ACFS VBS Flow Diagram

> Comparison of the Miro flow diagram against the intent model and PM clarifications (2026-03-17).
> Used to identify what needs updating on the Miro and what new information the board surfaces.

---

## What's aligned (no changes needed)

- User hierarchy: core (WFF, ACFS Internal), secondary (FF via email link OTP), tertiary (TC, Customer)
- WFF flow: login → view HBLs → delegate or book → payment → confirmation
- FF/TC/Customer flow: magic link → OTP → view HBLs → delegate further or book
- ACFS admin: HBL assignment, slot config, manage bookings, pickup verification, user management
- Slot config details: flexible slots, overlapping, truck types, cutoff rules, density indicators
- Booking management: search, update (fee free), change shipment/schedule/driver
- Pickup verification: search → view details + DO + audit → validate → mark processed

---

## What needs to change on the Miro

### Must fix

| # | Current on Miro | Change to | Reason |
|---|----------------|-----------|--------|
| 1 | "Auto WFF Assignment?" (red question box) | Remove question mark — WFF assignment comes from Maximas batch, auto-assigned | Data arrives 7 days before vessel arrival via periodic batch. No manual WFF assignment. |
| 2 | "Feature Permissions?" (red box, user management) | Clarify: user management is for WFF (username/password) and ACFS internal (SSO) only. FF/Carrier/Customer have no portal accounts. | FF/Carrier/Customer authenticate via magic link + OTP. No accounts to manage. |
| 3 | Delegation flow shows DO upload without mapping requirement | Add: each DO must be mapped to specific HBLs. Also add: delegation and booking are mutually exclusive per HBL. | Compliance/legal requirement. Either delegate or book per HBL, never both (BR-004). |
| 4 | No Gatehouse flow on the board | Add a Gatehouse lane: read-only daily roster, search by booking ref or truck rego, no system actions | BRD Section 2.6. Now in the intent model. |
| 5 | "driver" shown as tertiary user in hierarchy | Remove from user hierarchy or label as "data only, not a portal user" | Driver is a data field on the booking (name, licence, rego). Not an actor in the system. |

### Should fix

| # | Current on Miro | Change to | Reason |
|---|----------------|-----------|--------|
| 6 | FF/TC flow: missing DO → "Reach out to previous parties" | Add: ACFS can override missing DOs (certain roles only, audit trail + reason required, one-time per HBL until collected) | PM confirmed DO override rules. |
| 7 | "Choose truck type: SEMI TRAILER vs normal PICK UP CONDITIONS?" (with question mark) | Remove question mark — truck type is a confirmed selection field, not an open question | Part of the standard booking flow. |
| 8 | "Need to define if this step should sit before the delegate" (yellow note) | Remove — booking flow is confirmed: load calculation → select slot → truck/driver → payment. Progressive summary pane builds as user steps through. | PM confirmed the flow. Condense to 2-3 steps. |
| 9 | No storage fee indicator shown in HBL lists | Add a storage fee flag indicator in WFF and FF HBL list views | Flag derived from last_free_storage_date. Shows due/not due, not the amount. |
| 10 | Pickup verification is all-or-nothing | Add partial processing branch: some HBLs pass, some fail → process passing ones, hold back failing ones for rebooking | ACFS can process 9 out of 10 HBLs if 1 is stuck in customs. |
| 11 | Cutoff rules not shown in slot configuration detail | Add: cutoffs are absolute date/time per slot (not hour-based). Example: Friday 5pm cutoff for Monday morning slot. | Per-site configuration. |
| 12 | "What is the FFO Field within Maximas and how is it used?" (yellow note) | Remove or mark as resolved — party registry comes from one-time ACFS bulk upload, not Maximas | FFO field is not relevant for Phase 1. |

---

## New information from the Miro board

These items are on the Miro but not captured in the intent model. They may need follow-up.

### 1. Email notification flow
The Miro shows specific email triggers:
- "Email sent with shipment roster and secure link" (on delegation)
- "Email sent to driver with confirmation and booking reference" (on booking)
- "Booking update notification sent via email" (on booking changes)

**Gap:** The intent model doesn't capture email/notification triggers as part of the journey steps or as a separate concern. Consider adding notification events to journey steps or as a new entity.

### 2. Wharf-specific info for drivers
The Miro shows "Existing HBL/Wharf info" flowing into the driver confirmation. This suggests the driver/carrier receives location-specific details (wharf location, gate number?) with their booking confirmation.

**Question for PM:** Does the booking confirmation include site-specific pickup instructions (gate number, wharf location, check-in process)?

### 3. WFF can re-delegate?
"Confirm or edit assigned FFO/actions TBD" appears in the WFF flow. This suggests WFF can change the FF assignment after initial delegation. The intent model has this under ACFS only (acfs:r5).

**Question for PM:** Can the WFF re-delegate or revoke a delegation themselves, or does that require ACFS intervention?

### 4. Master House Bill vs House Bill
The Miro has a box labeled "Master House Bill vs House Bill" in the top right. The intent model only tracks HBLs. If there's a Master Bill (MBL) → HBL hierarchy, it's not captured.

**Question for PM:** Does the portal need MBL visibility? Is there a grouping concept above HBL that affects delegation or booking?

---

## Priority

| Level | Items |
|-------|-------|
| **Must fix** (factually wrong or missing) | 1, 2, 3, 4, 5 |
| **Should fix** (clarifications from PM session) | 6, 7, 8, 9, 10, 11, 12 |
| **New questions for PM** | Email notifications, wharf info for drivers, WFF re-delegation, MBL vs HBL |
