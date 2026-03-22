# Intent Model Changelog

## v0.7.1 — 2026-03-22

**Source:** Internal simplification review (Rahul). No new requirements — same logic, fewer items.

### Rule Consolidation (30 → 21)

Nine rules absorbed into consolidated versions:

| Consolidated Rule | Absorbed | What changed |
|---|---|---|
| **BR-002** (DO Policy) | BR-003, BR-021, BR-031 | Single rule covers: per-tier DO uploads, no inheritance, free_release waiver, under_bond waiver, ACFS validates each individually |
| **BR-005** (Slot Config) | C-001 | Added: no hard capacity limits, density indicator only |
| **BR-012** (Notifications) | BR-020 | Covers confirmation, modification, and cancellation notifications in one rule |
| **BR-014** (User Management) | BR-024, BR-025 | Added: soft-delete on removal, 72h welcome link expiry |
| **BR-015** (Modifications) | BR-006, BR-023, BR-027 | Covers: cutoff rules, no-show rebooking (fee-free), P4TC can't self-modify, admin modifications fee-free |
| **BR-022** (Cancellation) | C-003 | Added: refund processed outside system (portal is refund-agnostic) |
| **BR-026** (Slot Protection) | C-002 | Added: slots can't be modified Phase 1, blackout via holiday overlay |

### Constraint Consolidation (8 → 5)

| Removed | Absorbed into |
|---------|--------------|
| C-001 (no hard capacity) | BR-005 |
| C-002 (slots with bookings immutable) | BR-026 |
| C-003 (refunds offline) | BR-022 |

C-004 simplified — removed email mention (now covered by BR-012).

### HBL Entity Field Updates

- **Removed** `storage_fee_flag` — derived from `last_free_storage_date` on read, not stored
- **Updated** `chargeable_weight` — marked as derived (computed as `max(weight_kg, volume_m3)`)
- **Added** `do_waived` — computed boolean: `release_type === 'free_release' || under_bond === true`
- **Updated** `release_type` — description clarified, two values only: `do_required | free_release`

### Integration Entities Tagged

Five integration "entities" (Maximus, AGS, Payment, Email, LSP Registry) tagged with `is_integration: true` to distinguish from domain entities. Total: 6 domain entities + 5 integrations.

### Portal Alignment (vbs-portal)

- `intent-contract.ts` — rules synced to match consolidated model
- `release_type` — removed `'under_bond'` as enum value (was redundant with `under_bond` boolean)
- Added `underBond: boolean` to LSP Hbl type (previously encoded in releaseType)
- Booking readiness now auto-passes under-bond HBLs for DO checks
- All label/filter functions updated to check `underBond` boolean

---

## v0.3.0 — 2026-03-18

**Source:** ACFS VBS 18 March.pdf (process flow diagram)

### Breaking: Actor Restructure

- **WFF + FF + Carrier → LSP** (Logistics Service Provider). Single registered user type with username/password auth. Covers NVOCC, wholesale FF, FF, Transporter, Farmers, Customer/Clearing agents.
- **One-off Customer → P4TC** (Party to Collect). Magic link + OTP. Now supports chain delegation (can delegate to another P4TC).
- **Driver** added as explicit secondary user. No portal access — receives booking confirmations via email only.
- **ACFS Internal** updated: two sub-roles (Admin + User) with predefined privileges. Auth changed from SSO to username/password.

### New ACFS Responsibilities

- HBL Assignment — manual WFF assignment + auto-WFF assignment (decision point, logic TBD)
- ECST Assignment (detail TBD — see OQ-031)
- User Management — create/update/remove LSP and ACFS users, configure feature permissions
- Manage Booking — search by ref#/truck/driver, update details, change shipment/schedule/driver/truck, email notifications on update
- Pickup Verification — search → view details + DO + audit tracking → validate or reject → status to "processed"

### Updated LSP Flow (from PDF)

- View assigned HBLs (scoped per LSP, auto-synced on login)
- Select one or multiple shipments
- **Delegate:** to existing LSP (search & select) or add new one-off (creates P4TC with email + secure link)
- **Book Pickup:** validate docs → upload missing → load calculation + pricing → select truck type (normal/semi-trailer) → select slot → enter truck/driver details → pay (Stripe) → confirmation + driver email
- **Request Missing Docs:** offline process, booking aborted until DO received

### New P4TC Flow (from PDF)

- Access via emailed link → OTP (no login)
- View assigned HBLs
- Can delegate further (enter name + email + optional DO upload)
- Book pickup: pricing → validate DO → select truck type → slot → truck/driver details → pay → confirmation

### New Entity: Pickup Slot

- Explicit entity with site, truck type (normal/semi-trailer), time windows, cutoff datetime, capacity indicator, blocked state
- 2 default slot types per site: 1 semi-trailer + 1 standard

### Updated Booking Entity

- Added `truck_type` field ('normal' | 'semi_trailer')
- Added `driver_license` and `driver_phone` fields
- Lifecycle trigger updated: LSP or P4TC confirms (not just "Carrier")

### Updated HBL Entity

- Added `assigned_lsp` field
- `hbl_status` now includes 'assigned' state (between 'unassigned' and 'delegated')

### New Business Rules (BR-008 to BR-014)

| Rule | Summary |
|------|---------|
| BR-008 | Truck type filters available slots. 2 default slot types per site. |
| BR-009 | LSP visibility scoped — can only see their allocated shipments. |
| BR-010 | Data auto-synced on LSP login and integration layer calls. |
| BR-011 | Missing doc request is a hard stop — booking aborted until DO received. |
| BR-012 | Driver receives booking confirmation via email (no portal access). |
| BR-013 | P4TC can chain-delegate to another P4TC. |
| BR-014 | ACFS manages user lifecycle + feature permissions. |

### New Constraints (C-004, C-005)

- C-004: Driver has no portal access, email-only communication
- C-005: P4TC has no persistent credentials, magic link + OTP only

### Resolved Open Questions

- **OQ-024** (FF/Carrier auth model): Resolved — LSPs have persistent login (username/password). Only P4TC uses magic link.

### New Open Questions (OQ-026 to OQ-032)

| ID | Question | Status |
|----|----------|--------|
| OQ-026 | First-time LSP signup flow (pending Roni) | open |
| OQ-027 | P4TC email security validation process | open |
| OQ-028 | What existing HBL info is shared with P4TC on confirmation? | open |
| OQ-029 | Truck type selection order relative to delegation for P4TC | open |
| OQ-030 | Driver selection UX (dropdown vs search, "must have PH") | open |
| OQ-031 | ECST assignment flow — what is ECST? | open |
| OQ-032 | Auto-WFF assignment logic and triggers | open |

---

## v0.2.0 — 2026-03-18

**Source:** PM session 2026-03-17 (Roni answers to OQ-001–OQ-020)

### Actor Changes

- **Added "One-off Customer"** actor — external party collecting a single shipment, magic link + OTP auth, no persistent account
- **Added "Gatehouse"** actor — ACFS gatehouse staff for pickup verification, SSO auth
- **WFF:** added `wff:r6` (flag HBL as under-bond), clarified auth as "No SSO. Can self-register"
- **FF:** auth changed from "Username + password assumed" → "Magic link + OTP" (no account creation, secure link on delegation, scoped access, expires on collection). Added `ff:r4` (under-bond flag)
- **Carrier:** auth changed from "Username + password assumed" → "Magic link + OTP" (same as FF). Updated description to note cross-WFF booking support. Added booking flow UX detail (full-screen/modal, progressive summary, Stripe checkout)
- **ACFS:** auth clarified to "SSO via OAuth/Okta". Added 4 new responsibilities:
  - `acfs:r7` — Override missing DO (role-restricted, audit trail, one-time per HBL)
  - `acfs:r8` — FOC rebooking for no-shows (admin only, overrides fees, audit trail)
  - `acfs:r9` — Flag HBL as under-bond
  - `acfs:r10` — Partial processing (clear HBLs proceed, blocked ones rebook)
- Updated slot config (`acfs:r6`): added density thresholds, holiday calendar overlay, Phase 1 restriction on modifying booked slots

### HBL Entity — Major Rework

- **Two orthogonal dimensions** introduced: `milestone` (physical progress) and `hbl_status` (delegation/booking state) — previously conflated in a single `status` field
- Added fields: `weight_kg`, `customs_clearance_status`, `under_bond` (boolean flag, not a lifecycle state), `storage_fee_flag`
- Milestone states changed: `created` → `on_vessel`, added `in_yard` between `at_wharf` and `unpacked`
- Removed `delegated`, `booked`, `under_bond` from lifecycle states (moved to `hbl_status` and `under_bond` flag)
- `release_type` clarified with `warn` for pending release type list
- Typo fix: "Maximas" → "Maximus" throughout

### Booking Entity Updates

- Fee calculation clarified: "max of weight vs volume" per HBL, summed
- Lifecycle guard updated: "All HBLs at milestone 'unpacked' or later + release conditions met"
- Partial processing added to `pending_processing` → `processed` transition
- Payment method specified: Stripe embedded checkout

### Journey: Carrier Books a Pickup

- Simplified from 6 steps to 3 (combined select+slot, details+pay, confirmation)
- Added density indicator detail (low/moderate/high, non-blocking)
- Added precondition: magic link + OTP access
- Added precondition: under-bond flag as alternative to DO validation

### New Business Rules (BR-001 to BR-007)

| Rule | Summary |
|------|---------|
| BR-001 | Delegation at any milestone; booking requires "unpacked" or later |
| BR-002 | Under-bond = manual flag, skips DO requirement |
| BR-003 | 3-level DO hierarchy, independent uploads, no cascading |
| BR-004 | WFF either delegates or books per HBL — mutual exclusivity |
| BR-005 | Slot cutoffs are absolute date/time, per-site |
| BR-006 | FOC rebooking — ACFS admin only, audit trail required |
| BR-007 | Partial processing — clear HBLs proceed, blocked rebook |

### Constraints Reworked

- **C-001** changed: hard capacity limits → NO hard limits, density indicator only (non-blocking)
- **C-002** changed: change fee/no-show fee → slots with bookings cannot be modified (Phase 1), blackout dates via holiday calendar
- **C-003** added: refunds completely outside the portal, handled offline

### Resolved Open Questions (OQ-001 to OQ-020)

All 20 initial open questions resolved via PM session 2026-03-17:

| ID | Topic | Resolution |
|----|-------|------------|
| OQ-001 | FF data sourcing | ACFS-maintained global registry, bulk upload, no Maximus sync |
| OQ-002 | Fee method | Flat minimum + per-HBL volumetric (max of weight vs volume) |
| OQ-003 | WFF delegate + book same HBL | Either/or per HBL, mutual exclusivity |
| OQ-004 | FF/Carrier auth | Magic link + OTP, no account creation |
| OQ-005 | One-off dashboard | No dashboard, minimal magic-link status page |
| OQ-006 | Data freshness | Periodic batch (1-2x daily), 7 days before vessel |
| OQ-007 | Skip delegation | Yes — WFF can book directly without delegating |
| OQ-008 | Under-bond sourcing | Manual flag in portal, not synced from Maximus |
| OQ-009 | DO hierarchy | Independent uploads per tier, no cascading |
| OQ-010 | ACFS DO override | Role-restricted, audit trail, one-time per HBL |
| OQ-011 | Cross-WFF booking | Yes — carrier can combine HBLs from different WFFs |
| OQ-012 | Payment integration | Stripe embedded checkout |
| OQ-013 | Refunds | Outside portal, handled offline by ACFS |
| OQ-014 | Cutoff rules | Absolute date/time per slot, per-site config |
| OQ-015 | ACFS processing | Milestone tracking, partial processing supported |
| OQ-016 | Slot config options | Flexible slots, density indicators, holiday overlay |
| OQ-017 | FOC rebooking | ACFS admin only, overrides all fees, audit trail |
| OQ-018 | Single vs multi app | Single app with role-based routing |
| OQ-019 | Auth strategy | WFF: password. FF/Carrier/One-off: magic link. ACFS/Gatehouse: SSO |
| OQ-020 | Missing HBL requests | No request flow, search only |

### New Open Questions (OQ-021 to OQ-025)

| ID | Question |
|----|----------|
| OQ-021 | Confirmed milestone statuses from client |
| OQ-022 | Full list of release types and DO rules |
| OQ-023 | Fee rate structure — flat vs percentage |
| OQ-024 | FF/Carrier auth: magic links vs persistent login |
| OQ-025 | Under-bond definition and lifecycle |

---

## v0.1.0 — 2026-03-16

**Source:** BRD v1.0 (`VBS_Pickup_BRD(Final)_V1.0.pdf`) + initial PM discussions

### Initial Model

- **4 actors:** WFF, FF, Carrier, ACFS Internal
- **2 entities:** HBL (with single `status` lifecycle), Booking
- **1 journey:** Carrier Books a Pickup (6 steps)
- **3 business rules:** BR-001 (delegation/booking gate), BR-002 (under-bond skips DO), BR-003 (DO hierarchy)
- **2 constraints:** C-001 (slot capacity), C-002 (change/no-show fees)
- **20 open questions:** OQ-001 to OQ-020 (all raised from BRD analysis)

### Actors

| ID | Name | Auth |
|----|------|------|
| wff | Wholesale Freight Forwarder | Username + password (assumed) |
| ff | Freight Forwarder | Username + password (assumed) |
| carrier | Transport Carrier | Username + password (assumed) |
| acfs | ACFS Internal | Internal SSO / admin credentials |

### HBL Lifecycle (v0.1.0)

Single-dimension lifecycle (milestone + delegation conflated):
`created → at_wharf → unpacked → delegated → booked → collected`
- Also included `under_bond` as a lifecycle state (later changed to flag in v0.2.0)
- No `in_yard` state
- `release_type` included `under_bond` as a value (later separated)

### Booking Lifecycle (v0.1.0)

`draft → booked → pending_processing → processed → collected` (unchanged through v0.3.0)

### Notes

- Data source referenced as "Maximas" (typo, corrected to "Maximus" in v0.2.0)
- Auth was unspecified/assumed for most actors
- No gatehouse or one-off customer actors yet
