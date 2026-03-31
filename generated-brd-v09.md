# ACFS VBS Pickup Portal — Business Requirements Document

**Version:** 0.8.0
**Status:** draft
**Last Updated:** 2026-03-24
**Generated from Intent Model:** v0.8.0

---

## 1. Purpose & Scope

The ACFS VBS Pickup Portal is a web-based system for managing container pickup bookings at ACFS facilities.

It enables logistics service providers to view shipments, delegate pickup authority, book pickup slots, manage documentation, and make payments — with ACFS staff overseeing operations, slot configuration, and verification.

## 2. Actors — Who Is Involved

### Logistics Service Provider (LSP)

Core registered user. Umbrella term covering NVOCC, wholesale Freight Forwarder, Freight Forwarder, Transporter, Farmers, and Customer/Clearing agents. Each LSP sees only shipments allocated to them. Can delegate to another LSP or a one-off P4TC. Replaces the previous WFF/FF/Carrier actor split. Note: roles are contextual per HBL — the same organisation can appear at different levels (e.g. top-level party on one HBL, delegatee on another). Visibility and role enforcement must be HBL-scoped, not user-scoped.

**Authentication:** Username + password. Created by ACFS admin in the portal.

**Responsibilities:**

- **lsp:r1:** View list of assigned HBLs with shipment status, milestone, payment, delegation, and booking info. Data auto-synced on login and on subsequent integration layer calls.

- **lsp:r2:** Select one or multiple shipments to take action on (delegate or book).

- **lsp:r3:** Delegate shipments to an existing LSP (search and select) or add a new one-off LSP, which creates a P4TC with email + secure link. Per HBL — if delegated, LSP cannot also book directly on that same HBL (BR-004).

- **lsp:r4:** Book pickup directly: system validates booking readiness (unpacked + customs cleared + DOs present) → upload missing docs → load calculation + pricing → select slot → enter truck and driver details (select existing or add new, scoped to account) → accept T&Cs + site induction → make payment (Stripe/Compay) → receive booking confirmation with reference number. Requires HBL milestone "unpacked" or later (BR-001).

- **lsp:r5:** Request missing docs when DOs are unavailable. Booking process is aborted (offline) until DO is received.

- **lsp:r6:** Upload Delivery Order for downstream enforcement.

- **lsp:r7:** Flag an HBL as under-bond. Manually set in portal — not synced from Maximus.

- **lsp:r8:** Modify booking before cutoff: change slot date/time and HBLs (add/remove) before booking cutoff. Change truck/driver at any time until shipment is collected. Cost-impacting changes after cutoff require ACFS (BR-015).

- **lsp:r9:** Search and view bookings using multiple search keys: booking reference number, HBL reference number, truck registration, or driver name. Booking reference becomes the primary identifier once HBLs are booked (alongside HBL reference). Both booking reference and HBL reference must be prominent (displayed side-by-side) in booked HBL table views.

### Party to Collect (P4TC)

Deferred to fast follow (BRD v1.5 excludes from Phase 1). Tertiary/one-off user with no portal credentials. Receives email with shipment roster and document portal URL. No persistent account or history. Replaces previous "One-off Customer" and "Freight Forwarder" (magic-link) actors.

**Authentication:** Magic link + OTP. No login required — clicks link from email, verifies via OTP. Portal access scoped to assigned shipments only. Link expires on collection.

**Responsibilities:**

- **p4tc:r1:** Access portal via emailed link (no login). Verify identity with OTP.

- **p4tc:r2:** View list of assigned HBLs from the delegation.

- **p4tc:r3:** Delegate shipments further: enter P4TC name + email ID, optionally upload new DO. System sends email with shipment roster and secure link to the new P4TC.

- **p4tc:r4:** Book pickup: validate booking readiness → load calculation + pricing → select slot → enter truck and driver details (name, license#, phone — no saved drivers for P4TC) → accept T&Cs + site induction → make payment → receive booking confirmation with reference.

- **p4tc:r5:** Upload missing DO or contact ACFS for support if DO is unavailable.

### Driver

Secondary user. No portal access. No direct system communication — the booking party manages driver rostering externally and forwards booking details to the driver.

**Authentication:** No portal auth. No system emails. Booking party forwards confirmation externally.

**Responsibilities:**

- **driver:r1:** Receive booking reference from booking party (forwarded externally — system does NOT email the driver directly).

- **driver:r2:** Present booking reference and identity at gatehouse for pickup verification.

### ACFS Internal

Internal ACFS staff. Two sub-roles: Admin (full privileges) and User (predefined/restricted privileges). Manages HBL assignment, slot configuration, booking operations, DO validation, pickup verification, and user management.

**Authentication:** SSO-based access. Admin and User sub-roles with predefined privileges.

**Responsibilities:**

- **acfs:r1:** HBL Assignment (remedial/optional): manually assign or reassign HBLs to LSPs via searchable dropdown (search LSP by name → assign). Same UX for reassignment — search and select a different LSP. System lists unassigned FAK shipments. Low priority for Phase 1 — data fix preferred over UI.

- **acfs:r2:** ECST Assignment: assign ECST to shipments. Parked for Phase 1 — flow details to be defined later.

- **acfs:r3:** Slot Configuration: select site → select days of week → set start/end time per slot (flexible, overlapping allowed) → configure booking cutoff and change cutoff (relative day + time, e.g. "previous working day, 4 PM") → optionally set heat map threshold value (nice-to-have) → block holidays via calendar overlay → save/update slots.

- **acfs:r4:** Manage Booking: search bookings by booking ref# or by truck/driver details → view details (slot date/time, booking party, HBLs, fees paid, driver/truck) → inline edit: change pickup slot, change driver/truck, add/remove HBLs. All edits available on non-cancelled/non-collected bookings. Admin can override cutoffs. When HBLs are added/removed, fee total recalculates but no additional payment is collected (fee-free modifications for Phase 1). No truck capacity validation — that is the carrier's responsibility. Booking update notification sent via email to booking party.

- **acfs:r5:** DO Validation (separate from pickup verification): view list of bookings with unvalidated DOs → validate DO against lowest-level HBL details → mark as validated. HBL-centric, not booking-centric. Can be done by offshore team. Prioritise by slot date/time.

- **acfs:r6:** Pickup Verification: search bookings by ref# or truck/driver → view details + DO validation status + audit tracking → validate or reject. If validated, change booking status to "processed". If not validated, booking is flagged. Includes DO validation if not already done.

- **acfs:r7:** User Management: create, update, and remove users (LSP and ACFS internal). Configure feature permissions per user.

- **acfs:r8:** Override missing DO requirement. Restricted to Admin role. Audit trail with reason required. One-time per HBL, lives until collected.

- **acfs:r9:** FOC rebooking for no-shows: admin edits the pickup slot (and optionally driver/truck) on the existing booking — no new booking created. Fee-free. No separate FOC rebook action — uses the same inline edit capability as acfs:r4.

- **acfs:r10:** Flag an HBL as under-bond.

- **acfs:r11:** Partially process bookings — clear HBLs proceed while blocked ones are rebooked separately.

- **acfs:r12:** Edit HBL details and update milestones/statuses manually when corrections are needed.

- **acfs:r13:** Edit delegation — reassign or revoke delegation between parties.

### Gatehouse

Deferred to fast follow (BRD v1.5 does not reference gatehouse as a separate actor). ACFS gatehouse staff who verify and confirm physical vehicle entry/exit for pickups. Part of the Pickup Verification flow.

**Authentication:** SSO via OAuth/Okta.

**Responsibilities:**

- **gatehouse:r1:** Verify booking reference, driver identity, and truck rego on arrival.

- **gatehouse:r2:** Confirm vehicle exit to mark booking as collected.

## 3. Entities — Key Data with Lifecycle

### House Bill of Lading (HBL)

Primary tracking unit for a shipment. Sourced from Maximus via periodic batch (once or twice daily). Two orthogonal dimensions: milestone (physical progress) and HBL status (delegation/booking state). BRD v1.5 flattens these into a single lifecycle (Unassigned → Assigned → Delegated → Booked → Collected) — the mapping is: BRD lifecycle = hbl_status + the "collected" milestone. Both dimensions are needed for implementation since an HBL can be e.g. in_yard + delegated simultaneously. HBLs exist in a hierarchy: AGS issues master HBLs (often 500-prefix), freight forwarders issue lower-level HBLs (e.g. 4033-prefix for Mondial). Mostly 1:1 parent-child relationship. The portal primarily deals with the lowest-level HBL as the primary identifier. Full audit trail lives on HBL — shows all hops, delegation chain, assignment changes, and status transitions.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| hbl_number | string | Primary identifier — lowest-level house bill number from Maximus. |
| alt_hbl_reference | string | Alternative/parent HBL reference (e.g. AGS master HBL). Optional — present when hierarchy exists. Relationship established via AGS data feed, not Maximus. |

> ⚠️ **Warning:** Exact data source for HBL hierarchy relationship TBD — Matt and William resolving (OQ-034).

| container_number | string | Container reference — ties HBL to the top-level container. |
| ocean_bl | string | Ocean bill of lading. Multiple containers may share one ocean BL. |
| consignee | string | Next party in the chain. Data source is AGS feed (not ICS/Maximus — too inconsistent). Identified by account name or account code. |
| weight_kg | number | Weight measurement for fee calculation. |
| volume_m3 | number | Volumetric measurement for fee calculation. |
| chargeable_weight | number | Derived: max(weight_kg, volume_m3) per HBL. Used for fee calculation: chargeable_weight × rate. Computed by backend, not stored independently. |
| quantity | number | Number of packages (e.g. 3 boxes). Optional — may not be required for decision-making. |
| pack_type | string | Package type description. Optional — may not be required for decision-making. |
| description | string | Goods description. Two source fields exist in Maximus: "description" and "marks and numbers" — may consolidate. |
| milestone | 'on_vessel' | 'at_wharf' | 'in_yard' | 'unpacked' | 'collected' | Physical progress milestone. Linear progression. Sourced from Maximus batch sync. |
| hbl_status | 'unassigned' | 'assigned' | 'delegated' | 'booked' | Delegation/booking status. Separate dimension from milestone. "assigned" means allocated to an LSP. "delegated" means LSP has passed to another party. "booked" means pickup is scheduled. |
| customs_clearance_status | string | Customs clearance state including quarantine. Must be fully cleared (not partial) for booking. Shown in HBL table. Sourced from Maximus — update frequency from ICS unclear. |
| under_bond | boolean | Flag — NOT a lifecycle state. Goods moving between bonded facilities before customs clearance (Australian Border Force customs bond). Manually set by LSP/ACFS in portal. Movement permission replaces DO requirement. Not synced from Maximus. |
| under_bond_verified | boolean | Whether ACFS has verified the under-bond marking. Verification happens outside the portal; portal records the result. Set by ACFS staff only. |
| last_free_storage_date | date | Last date of free storage. After this date, storage fees apply (computed on read, not stored as a separate flag). Sourced from Maximus or set by ACFS. |
| release_type | 'do_required' | 'free_release' | Determines DO requirements per tier. "do_required" (default — DO must be uploaded and validated) or "free_release" (no DO needed for that tier). |
| do_waived | boolean | Derived: true when release_type is "free_release" OR under_bond is true. Booking readiness checks this single field instead of inspecting release_type and under_bond separately. |
| assigned_lsp | string | LSP this HBL is allocated to. Set by ACFS during HBL/WFF assignment or auto-assigned from data. |
| pickup_site | string | Physical site/warehouse where this HBL will be picked up (references site entity). Critical for LSP dispatch planning - determines which warehouse to send truck to. Sourced from Maximus or derived from container unpacking location. Must be visible in HBL list (FR-LSP-02) and filterable/searchable. |
| import_ref | string | Import reference from Maximus. Optional field for data matching and integration. |
| related_bookings | Booking[] | Bookings this HBL has been included in. Many-to-many relationship via booking_hbls junction table supports rebooking scenarios with full fee history and per-HBL charge tracking (BR-019). Once HBL is booked, both HBL reference and booking reference become equally important for search/display (lsp:r9). BRD v1.5 Section 6.1 lists this as "Related Booking ID(s)" but implementation uses proper junction table pattern. |

**Lifecycle States:**

- on_vessel
- at_wharf
- in_yard
- unpacked
- collected


> ⚠️ **Warning:** Milestones only — delegation and booking are tracked via hbl_status, a separate dimension. Delegation can happen at any milestone (BR-001). Booking requires milestone "unpacked" or later (BR-001).

**Transitions:**

| From | To | Trigger | Guard |
|------|-----|---------|-------|
| on_vessel | at_wharf | Vessel arrives at port | Maximus batch sync |
| at_wharf | in_yard | Container moved to yard | — |
| in_yard | unpacked | Container unpacked at warehouse | — |
| unpacked | collected | Goods physically picked up from warehouse | Booking in "processed" state + gatehouse confirms exit |

### Booking

Groups one or more HBLs into a pickup window with driver/truck details. Created by LSP or P4TC. No truck type distinction for Phase 1 — booking party is responsible for bringing the correct truck. Slim audit trail at booking level (created, payment confirmed). Full hop history lives on the HBL entity instead. "Collected" status is derived — booking becomes collected when all its HBLs reach the "collected" milestone (no manual status change).

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| booking_id | string | System-generated unique reference number. |
| pickup_window | PickupWindow | Selected date/time slot. |
| hbl_ids | string[] | HBLs included in this booking. Can span multiple LSPs. |
| driver_name | string | Driver performing pickup. |
| driver_license | string | Driver license number. |
| truck_rego | string | Vehicle registration. |
| fee_amount | number | Sum of (chargeable_weight × rate) per HBL + minimum charge. Backend-calculated and returned per HBL from the API. Rate and minimum charge are backend-configurable. Frontend displays calculated values only — no fee logic in frontend. |
| booking_party | string | LSP or P4TC who created the booking. |
| tc_accepted | boolean | Whether booking party accepted terms and conditions. |
| site_induction_accepted | boolean | Whether driver site induction was acknowledged. Skipped if driver already has site_induction = true. |

**Lifecycle States:**

- draft
- booked
- pending_processing
- processed
- collected
- cancelled


> ⚠️ **Warning:** "collected" is a derived status — automatically set when all HBLs in the booking reach the "collected" milestone. No manual status change.

**Transitions:**

| From | To | Trigger | Guard |
|------|-----|---------|-------|
| draft | booked | LSP or P4TC confirms, accepts T&Cs + site induction, and pays | All HBLs at milestone "unpacked" or later + fully customs cleared + release conditions met + missing docs uploaded + T&Cs accepted |
| booked | pending_processing | ACFS staff begins pickup verification | — |
| pending_processing | processed | ACFS validates DOs + audit tracking and marks ready. Partial processing allowed — clear HBLs proceed, blocked ones rebook separately. | — |
| processed | collected | Gatehouse confirms vehicle exit | — |
| booked | cancelled | LSP or ACFS cancels booking. Cancellation reason required (ACFS). Refund processed outside system. | — |

### Pickup Slot

A configurable time window at a specific site. Configured by ACFS admin. No truck type distinction for Phase 1. Default granularity is hourly (1-hour slots) — ACFS configures available hours per day. Visual presentation uses primary color with varying opacity levels to show booking density per slot without exact numbers.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| slot_id | string | System-generated unique ID. |
| site | string | Physical site/location for pickup (references site entity). |
| days_of_week | string[] | Days this slot template applies to (e.g. Monday-Friday). |
| start_time | time | Slot start time. |
| end_time | time | Slot end time. |
| booking_cutoff | { relative_day: string, time: string } | Booking cutoff — relative day (e.g. "previous_working_day", "same_day") + time (e.g. "16:00"). Bookings not accepted after this point. |
| change_cutoff | { relative_day: string, time: string } | Change cutoff — same format as booking cutoff. Changes to slot/date/HBLs not allowed after this point (truck/driver changes exempt). |
| heat_map_threshold | number | Threshold value for density indicator. Primary color with varying opacity levels applied to slot cards (low opacity = empty, high opacity = busy). No exact booking counts shown. Nice-to-have for Phase 1. |
| is_blocked | boolean | Whether slot is blocked due to holiday/blackout date. |

**Lifecycle States:**

- active
- blocked
- past

**Transitions:**

| From | To | Trigger | Guard |
|------|-----|---------|-------|
| active | blocked | ACFS adds blackout/holiday date | — |
| blocked | active | ACFS removes blackout/holiday date | — |
| active | past | Slot end time passes | — |

### Site

Physical warehouse/pickup location. Seeded directly in the database — no admin CRUD UI for Phase 1.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| site_name | string | Human-readable site name (e.g. "Port Botany Warehouse"). |
| branch_code | string | Branch code (e.g. "SY", "MB", "BR"). Multiple sites can share a branch code. |

**Lifecycle States:**

- active


> ⚠️ **Warning:** Static entity — DB-seeded, no state transitions in Phase 1.

### Driver Record

Deferred to fast follow (BRD v1.5 treats driver as booking attributes only for Phase 1). Saved driver details for reuse across bookings. Built up organically by booking parties — no pre-population. Scoped per LSP account — drivers are NOT globally visible across accounts.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| driver_name | string | Driver full name. |
| driver_license | string | Driver license number. Paired with name. |
| truck_rego | string | Default vehicle registration. |
| site_induction | boolean | Whether driver has completed site induction. If true, site induction acceptance is skipped during booking. |

**Lifecycle States:**

- active


> ⚠️ **Warning:** Static entity — created during booking flow, no state transitions.

### Delivery Order (DO)

Document required per HBL for pickup authorization. One-to-many relationship: each HBL can have multiple DOs (one per delegation tier in the hierarchy). Each DO is validated individually by ACFS. Uploaded by LSP or P4TC, validated by ACFS. Each tier in the HBL hierarchy uploads independently — no inheritance. Free release removes the DO requirement for that tier. Under-bond HBLs skip DO requirement entirely.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| do_id | string | System-generated unique ID. |
| hbl_id | string | HBL this DO belongs to. |
| uploaded_by | string | LSP or P4TC who uploaded the document. |
| upload_date | date | When the DO was uploaded. |
| document_url | string | Stored document reference/URL. |
| tier_level | string | Which level in the HBL hierarchy this DO covers. Each tier uploads independently. |

**Lifecycle States:**

- not_provided
- uploaded
- pending_validation
- validated
- flagged
- not_required

**Transitions:**

| From | To | Trigger | Guard |
|------|-----|---------|-------|
| not_provided | uploaded | LSP or P4TC uploads DO document | — |
| not_provided | not_required | HBL has free_release flag or under_bond flag | — |
| uploaded | pending_validation | ACFS begins DO review | — |
| pending_validation | validated | ACFS confirms DO matches HBL details | — |
| pending_validation | flagged | ACFS flags DO as incorrect — requires correction | — |
| flagged | uploaded | LSP or P4TC re-uploads corrected DO | — |

### Delegation

Records the delegation of one or more HBLs from one party to another. Tracks the chain of custody. Can be revoked by ACFS. Visibility follows hop-by-hop model (C-009): delegator sees immediate downstream only, not full multi-hop chain. ACFS sees full history for audit.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| delegation_id | string | System-generated unique ID. |
| delegator | string | LSP or P4TC who initiated the delegation. |
| delegatee | string | Target party — existing LSP (by ID) or new P4TC (by email). |
| delegation_method | 'existing_lsp' | 'one_off_p4tc' | Whether delegating to a registered LSP or creating a one-off P4TC. |
| hbl_ids | string[] | HBLs included in this delegation. |
| created_at | date | When the delegation was created. |

**Lifecycle States:**

- active
- revoked

**Transitions:**

| From | To | Trigger | Guard |
|------|-----|---------|-------|
| active | revoked | ACFS revokes the delegation (acfs:r13) | HBLs revert to delegator |

### Payment

Records payment transactions for bookings. One payment per booking. Tracks gateway used, amount, and transaction status. Payment gateway integration is abstracted (Stripe initially, potential migration to Compay) - implementation must use adapter pattern to isolate provider-specific logic from business logic. Added from BRD v1.5 data model.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| payment_id | string | System-generated unique payment reference. |
| booking_id | string | Booking this payment is for. |
| amount | number | Total amount charged. |
| payment_gateway | string | Gateway used (Stripe for Phase 1, abstracted for future swap to Compay). |
| payment_status | 'pending' | 'completed' | 'failed' | 'refunded' | Transaction status. Refunds are processed outside VBS but status may be updated by ACFS. |
| payment_timestamp | date | When the payment was processed. |

**Lifecycle States:**

- pending
- completed
- failed
- refunded

**Transitions:**

| From | To | Trigger | Guard |
|------|-----|---------|-------|
| pending | completed | Payment gateway confirms successful charge | — |
| pending | failed | Payment gateway rejects or times out | — |
| completed | refunded | ACFS processes refund outside system and updates status | — |

### User

Portal user account. Covers LSP company accounts, ACFS Admin, and ACFS User roles. Created by ACFS Admin. Added from BRD v1.5 data model.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| user_id | string | System-generated unique ID. |
| username | string | Login identifier. For LSPs: company-level username. For ACFS: SSO identifier. |
| role | 'lsp' | 'acfs_admin' | 'acfs_user' | User role determining permissions and portal access level. |
| linked_lsp_id | string | For LSP users: the LSP company this account belongs to. Null for ACFS users. |
| status | 'active' | 'inactive' | Account status. Inactive = soft-deleted (archived). Access and notifications disabled. |

**Lifecycle States:**

- active
- inactive

**Transitions:**

| From | To | Trigger | Guard |
|------|-----|---------|-------|
| active | inactive | ACFS Admin deactivates/archives user | — |
| inactive | active | ACFS Admin reactivates user | — |

### Booking–HBL Link

Junction entity linking bookings to HBLs with per-HBL fee breakdown. Makes the fee calculation per HBL explicit rather than implicit. Added from BRD v1.5 data model to support BR-019.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| booking_id | string | Parent booking reference. |
| hbl_id | string | Linked HBL reference. |
| chargeable_weight | number | Chargeable weight for this HBL at time of booking (max of weight vs volume). |
| rate | number | Rate applied to this HBL at time of booking. |
| per_hbl_fee | number | Calculated fee for this HBL (chargeable_weight × rate). |

**Lifecycle States:**

- active


> ⚠️ **Warning:** Junction entity — no state transitions. Created when booking is confirmed.

### Maximus Integration (Inbound)

Primary data source for HBL shipment data. Periodic batch sync from custom cargo table. Portal fetches data starting 7 days before vessel arrival. Provides lowest-level HBL references, weight, volume, customs clearance status, and consignee data. Does NOT provide HBL hierarchy relationships or freight forwarder party assignments.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| direction | string | Inbound — Maximus → Portal |
| frequency | string | Batch: once or twice daily. Auto-synced on LSP login. |
| data_provided | string | Lowest-level HBL number, weight, volume, customs clearance status (from ICS — update frequency unclear), consignee, quantity, pack type, description, marks and numbers. |
| data_not_provided | string | HBL hierarchy relationships (parent-child), freight forwarder party assignments, alternative HBL references. |
| status | string | Known — data structure understood. Frontend displays customs status as provided by the API. Staleness is a backend/integration concern. UI shows last sync timestamp if available. |

**Lifecycle States:**

- active


> ⚠️ **Warning:** Integration spec — no state transitions.

### AGS Data Feed (Inbound)

Provides master HBL references, HBL hierarchy (parent-child relationships), and freight forwarder party data (name, account code). Data is consistent (unlike ICS which has variations across organisations). Matt and William are defining the exact data format and delivery mechanism. CRITICAL GAP: BRD v1.5 Section 6.2 completely omits AGS — only lists Maximus integration. Delivery meeting 2026-03-24 confirmed AGS is required for accurate consignee data (Maximus "too inconsistent"). Data discovery blocked until this is resolved (OQ-034).

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| direction | string | Inbound — AGS → Portal |
| frequency | string | TBD — Matt and William resolving (OQ-034). |
| data_provided | string | Master HBL references (500-prefix), HBL hierarchy (parent-child), freight forwarder party assignments (account name, account code), consignee at each level. |
| data_not_provided | string | Lowest-level HBL details (comes from Maximus instead). |
| status | string | BLOCKER — exact data format, delivery mechanism, and frequency TBD. This is the single biggest technical risk. BRD v1.5 does NOT include AGS in integration section - must be corrected. |

> ⚠️ **Warning:** Cannot build auto-assignment, HBL hierarchy, or consignee accuracy without this feed. Blocks data discovery (Anoop urgency 2026-03-24). Matt and William working on it (OQ-034).


**Lifecycle States:**

- active


> ⚠️ **Warning:** Integration spec — no state transitions.

### Payment Integration (Outbound)

Payment processing for booking fees. Stripe embedded checkout for Phase 1. Payment integration is abstracted behind a single checkout redirect — provider can be swapped later if needed.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| direction | string | Outbound — Portal → Stripe |
| frequency | string | Real-time — triggered on each booking. |
| provider | string | Stripe for Phase 1. Abstracted behind checkout redirect so provider can be swapped to Compay or another provider in a later phase. |

**Lifecycle States:**

- active


> ⚠️ **Warning:** Integration spec — no state transitions.

### Email Notifications (Outbound)

Event-driven email notifications sent by the portal.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| direction | string | Outbound — Portal → Email |
| triggers | string | Delegation (secure link + OTP), booking confirmation (to account email), booking update (to booking party), booking cancellation (to booking party), DO flagged for correction (to booking party — Phase 1 sends to booking party, future may send to the party who uploaded the DO), user creation (welcome email with signin link). |
| not_sent_to | string | Driver — no system emails. Booking party forwards details externally. |

**Lifecycle States:**

- active


> ⚠️ **Warning:** Integration spec — no state transitions.

### LSP Registry Seed (One-time)

One-time bulk upload of LSP party data from AGS portal/party manager into the portal local DB.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| direction | string | Inbound — AGS → Portal (one-time) |
| frequency | string | One-time bulk upload at system launch. No ongoing sync. |
| data_provided | string | Company name, email, company ID, branch code. |

**Lifecycle States:**

- active


> ⚠️ **Warning:** Integration spec — one-time seed, no state transitions.

## 4. User Journeys

### ACFS Internal Journeys

#### ACFS Assigns HBLs to LSP (Remedial)


> ⚠️ **Warning:** Low priority for Phase 1. Matt indicated this may not be needed if auto-assignment is reliable within the 8-week timeline. Mark as optional.

**Preconditions:**

- ACFS admin is logged in
- HBLs have been synced from Maximus
- Target LSP user exists in the portal
- Auto-assignment has failed or data issue exists

**Steps:**

1. **View unassigned shipments** — System lists FAK shipments that are unassigned or incorrectly assigned. Can filter by assignment status.

2. **Select and assign** — ACFS selects shipments and assigns them to an LSP. HBL status moves to "assigned". This is a remedial step — primary assignment comes from data integration.

**Success Outcome:** HBLs are assigned to the target LSP and visible in their shipment list on next login.

#### ACFS Configures Pickup Slots

**Preconditions:**

- ACFS admin is logged in
- Site exists in the database

**Steps:**

1. **Select site** — ACFS selects a site (one at a time — no multi-site simultaneous config).

2. **Configure slot template** — Select days of week (typically Mon-Fri). Set available hours per day (default: hourly granularity). Multiple slots per day allowed, flexible, overlapping OK.

3. **Configure cutoff rules** — Set booking cutoff (relative day + time, e.g. "previous working day, 4 PM") and change cutoff (same format). Relative to the slot day.

4. **Optional: set heat map threshold** — Set threshold value for density indicator. System shows primary color at varying opacity levels based on booking density. Nice-to-have.

5. **Block holidays** — Overlay holiday calendar to block specific dates.

6. **Save** — Save/update slot configuration.

**Success Outcome:** Pickup slots are configured and available for LSP/P4TC booking.

#### ACFS Validates Delivery Orders


> ⚠️ **Warning:** DO validation can be done by offshore team independently from pickup verification. Same people doing pickup verification can also validate DOs, but DO validation is a separate capability.

**Preconditions:**

- Bookings exist with unvalidated DOs

**Steps:**

1. **View unvalidated DOs** — ACFS views list of HBLs with unvalidated DOs. HBL-centric view — not booking-centric. Can filter/prioritise by slot date/time for upcoming bookings.

2. **Review DO against HBL** — View lowest-level HBL details alongside the uploaded DO. Slot date/time and booking reference shown for context.

3. **Validate or flag** — If DO matches HBL details, mark as validated. If DO is incorrect, flag for follow-up with booking party (using booking reference).

**Success Outcome:** DO is marked as validated for that HBL, or flagged for correction.

#### ACFS Verifies Pickup


> ⚠️ **Warning:** Detailed field-level requirements for this view TBD — to be covered in next session with Matt.

**Preconditions:**

- Booking exists in "booked" or "pending_processing" state

**Steps:**

1. **Search booking** — ACFS searches bookings by booking ref# or by truck/driver details.

2. **Review details** — View booking details + DO validation status + audit tracking history. Includes DO validation if not already done.

3. **Validate or reject** — If all documents and details validate, change booking status to "processed". If validation fails, booking is flagged — does not proceed to collection.

**Success Outcome:** Booking status changed to "processed" and ready for gatehouse collection, or flagged for issues.

#### ACFS Cancels a Booking

**Preconditions:**

- ACFS admin is logged in
- Booking exists

**Steps:**

1. **Search booking** — ACFS searches by booking ref, truck rego, or driver name/license.

2. **Cancel booking** — ACFS initiates cancellation. Must provide cancellation reason.

3. **Notification** — Cancellation update sent to the booking party via email.

**Success Outcome:** Booking is cancelled. HBLs revert. Refund processed outside the system. Booking party notified.

#### ACFS Creates a User

**Preconditions:**

- ACFS admin is logged in

**Steps:**

1. **Select user type** — Choose role: Logistics Service Provider, ACFS Admin, or ACFS User.

2. **Enter user details** — LSP: company name, company ID, branch code, contact name, contact email. Username + password based access. ACFS: company name = ACFS, company code, contact name, contact email. SSO-based access.

3. **System sends welcome email** — Welcome email with signin link sent to user. Link expires in 72 hours.

4. **User activates account** — LSP: clicks link and sets password. ACFS: clicks link and SSO login is requested. Successful login completes activation.

**Success Outcome:** User account is created and active. User can log in.

#### ACFS Updates a User

**Preconditions:**

- ACFS admin is logged in
- Target user exists

**Steps:**

1. **Select user** — Search and select the user to update. Available for LSP, ACFS Admin, and ACFS User roles.

2. **Update details** — LSP: can update everything except username. ACFS: can update everything except SSO details.

**Success Outcome:** User details are updated.

#### ACFS Removes a User

**Preconditions:**

- ACFS admin is logged in
- Target user exists

**Steps:**

1. **Select user** — Search and select the user to remove.

2. **Archive user** — User is archived on removal. Access is disabled and email notification is disabled.

**Success Outcome:** User is archived. Cannot log in. No further notifications sent.

### Logistics Service Provider (LSP) Journeys

#### LSP Delegates Shipments

**Preconditions:**

- LSP is logged in
- LSP has assigned HBLs visible in their list

**Steps:**

1. **Select shipments** — LSP views list of assigned HBLs with shipment status. Can filter by site, milestone, customs status, etc. Selects one or multiple shipments to delegate.

2. **Choose delegation target** — Either select an existing LSP (search and select from pre-populated registry — company name, email, branch code) or add a new one-off party (email only — creates a P4TC).

3. **System sends notification** — Email sent to the delegate with a message and secure link. No shipment data in the email body — all details visible after login/OTP.

**Success Outcome:** Shipments are delegated. Target LSP or P4TC receives email with secure access link. HBL status moves to "delegated".

#### LSP Books a Pickup

**Preconditions:**

- LSP is logged in
- Selected HBLs are at milestone "unpacked" or later (BR-001)
- HBLs are not already delegated (BR-004)

**Steps:**

1. **Select shipments** — LSP selects one or multiple HBLs from their assigned list to book for pickup. Can filter by site to group shipments by warehouse location for dispatch planning.

2. **Validate booking readiness** — System checks: (1) HBL milestone is "unpacked" or later, (2) fully customs cleared (including quarantine), (3) all applicable DOs are present. If docs missing, LSP can upload them or request missing docs (aborts booking — offline process).

3. **Load calculation + pricing** — System calculates fee per HBL: chargeable_weight (max of weight vs volume) × rate. Individual HBL charges summed + minimum charge = total fee.

4. **Select slot** — LSP selects an available hourly slot. Density indicator shows booking volume per slot using opacity levels (no exact numbers). Does not block booking.

5. **Enter truck and driver details** — Select existing driver from account-scoped list (search/dropdown) or enter new driver details (name, license, truck rego). New drivers are saved to the account for future reuse. P4TC users always enter fresh details.

6. **Accept T&Cs and site induction** — Booking party must accept: (1) booking terms and conditions (legal document), (2) driver site induction acknowledgement (document). If driver already has site_induction = true, the second acceptance is skipped.

7. **Make payment** — Payment via Stripe embedded checkout. Redirects to payment interface.

8. **Confirmation** — Booking confirmation with booking reference sent to the account email. No email sent to driver — booking party forwards details externally.

**Success Outcome:** Booking is confirmed with reference number. HBLs move to hbl_status "booked". Confirmation sent to account email.

#### LSP Modifies a Booking

**Preconditions:**

- LSP is logged in
- Booking exists in "booked" state

**Steps:**

1. **View booking details** — LSP searches for an existing booking using booking reference, HBL reference, truck registration, or driver name (lsp:r9). Opens the booking from search results or bookings list.

2. **Choose modification type** — LSP can: (a) change truck/driver details — allowed anytime until collection, (b) change slot date/time — allowed before change cutoff only, (c) add/remove HBLs — allowed before change cutoff only.

3. **System checks cutoff** — If change cutoff has passed: truck/driver changes proceed, but slot/HBL changes are blocked. Cost-impacting changes after cutoff require ACFS admin override (BR-015).

4. **Apply changes** — For truck/driver: update in-place. For slot: re-validate availability, recalculate fees if HBLs changed. For HBL removal: treated as partial cancellation with offline refund. For HBL addition: additional fee charged.

5. **Confirmation** — Updated booking confirmation sent to account email. Booking reference remains the same.

**Success Outcome:** Booking is updated with new details. Confirmation sent. If fee changed, payment difference handled.

#### LSP Cancels a Booking

**Preconditions:**

- LSP is logged in
- Booking exists in "booked" state

**Steps:**

1. **View bookings** — LSP views current and past bookings list.

2. **Open booking details** — LSP opens the booking they want to cancel.

3. **Cancel booking** — LSP initiates cancellation. Refund is processed outside the system (C-003).

**Success Outcome:** Booking is cancelled. HBLs revert to previous hbl_status. Refund handled offline by ACFS.

### Party to Collect (P4TC) Journeys

#### P4TC Books a Pickup

**Preconditions:**

- P4TC has received email with shipment roster and portal URL
- HBLs are at milestone "unpacked" or later

**Steps:**

1. **Access portal** — P4TC clicks link in email to access portal. No login required. Verifies via OTP sent to the same email. OTP verification serves as email security validation.

2. **View assigned HBLs** — P4TC sees list of assigned HBLs from the delegation.

3. **Choose action** — P4TC can either delegate shipments further (enter P4TC name + email, optionally upload new DO) or proceed to book pickup.

4. **Validate booking readiness** — System checks unpacked status, customs clearance, and DO presence. P4TC can upload missing DO or contact ACFS for support.

5. **Load calculation + pricing** — System calculates fees per HBL (chargeable_weight × rate + minimum charge). P4TC reviews pricing.

6. **Select slot** — Select available hourly slot. Density indicator shows booking volume using opacity levels (no exact numbers). Does not block.

7. **Enter truck and driver details** — Enter driver name, license#, truck rego. No saved driver list for P4TC (one-off users).

8. **Accept T&Cs and site induction** — Accept booking terms and conditions + driver site induction acknowledgement.

9. **Make payment** — Payment via Stripe/Compay.

10. **Confirmation** — Booking confirmation sent to P4TC email containing: booking reference, pickup slot (date/time), HBL numbers with weight/volume, fee total, and site address. No upstream delegation chain or LSP details exposed. No email to driver.

**Success Outcome:** Booking confirmed. Confirmation sent to P4TC email. HBLs move to "booked".

#### P4TC Manages Booking (One-off)

**Preconditions:**

- P4TC has an active booking

**Steps:**

1. **Contact ACFS** — P4TC contacts ACFS for any booking modifications. No self-service modification for one-off booking parties.

**Success Outcome:** ACFS handles the modification on behalf of the P4TC.

## 5. Business Rules

**BR-001:** Delegation can happen at any milestone — no unpack gate. Booking requires all included HBLs to have milestone "unpacked" or later AND fully customs cleared (including quarantine). This means delegate button is always enabled; book button is gated by milestone + customs clearance.

- *Applies to:* hbl, booking
- *Source:* BRD s4.2 + discussion between Rahul, Roni, and Matt on 2026-03-17 and 2026-03-18

**BR-002:** DO requirement per HBL: each delegation tier uploads its own DO independently — one-to-many, no inheritance. ACFS validates each DO individually (HBL-centric). DO requirement is waived by under_bond flag (manual, ACFS-verified outside portal, not synced from Maximus) or free_release flag (per tier). Bottom-most party must have all tiers' DOs present.

- *Applies to:* hbl, delivery_order, lsp, p4tc, acfs
- *Source:* BRD s4.3–4.4 + discussions 2026-03-17 through 2026-03-20. Consolidates former BR-002, BR-003, BR-021, BR-031.

> ⚠️ **Warning:** Under-bond is an LSP/ACFS manual flag — not a lifecycle or automated process.


**BR-004:** LSP can either delegate or book directly per HBL — never both on the same HBL. Mutual exclusivity enforced at the HBL level.

- *Applies to:* hbl, lsp
- *Source:* OQ-003 resolution + March 18 flow

**BR-005:** Slot cutoffs are relative day + time (e.g. "previous working day, 4 PM" or "same day, 10 AM"). Booking cutoff and change cutoff configured separately per slot template. Per-site configuration. No hard capacity limits — density indicator only (threshold-based, nice-to-have Phase 1). Does not block booking.

- *Applies to:* booking, slot
- *Source:* discussion between Roni and Matt on 2026-03-18. Absorbs former C-001 (capacity constraint).

**BR-007:** ACFS can partially process bookings — HBLs that have cleared customs proceed while blocked ones are rebooked separately.

- *Applies to:* booking, acfs
- *Source:* discussion between Rahul, Roni, and Matt on 2026-03-17

**BR-009:** LSP can only view shipments allocated to them. Shipment visibility is scoped per LSP — no cross-LSP visibility.

- *Applies to:* hbl, lsp
- *Source:* March 18 flow diagram

**BR-010:** Data is auto-synced on LSP login and on the next call to the integration layer. No manual refresh needed.

- *Applies to:* hbl, lsp
- *Source:* March 18 flow diagram

**BR-011:** Missing doc request aborts the booking process. Booking is blocked (offline) until the DO is received. This is a hard stop, not a warning.

- *Applies to:* booking, hbl
- *Source:* March 18 flow diagram

**BR-012:** Booking confirmation, modification, and cancellation notifications sent to booking party email (LSP account email or P4TC email). Driver receives nothing from the system — booking party forwards details externally via their own rostering process.

- *Applies to:* booking, acfs
- *Source:* discussion between Roni and Matt on 2026-03-18. Consolidates former BR-012 and BR-020.

**BR-013:** P4TC can delegate shipments further to another P4TC by entering name + email. The new P4TC receives an email with shipment roster and secure link. Chain delegation is supported.

- *Applies to:* p4tc, hbl
- *Source:* March 18 flow diagram

**BR-014:** ACFS manages user lifecycle: create, update, remove LSP and ACFS internal users. Feature permissions configurable per user. Removal is soft-delete — access and notifications disabled, data retained. Welcome email signin link expires in 72 hours.

- *Applies to:* acfs, lsp
- *Source:* March 18 flow diagram + Miro board. Consolidates former BR-014, BR-024, BR-025.

**BR-015:** Booking modifications: truck/driver changeable anytime until collection. Slot/HBL changes (add/remove) allowed before change cutoff only. Cost-impacting changes after cutoff require ACFS admin override. ACFS admin can override all cutoffs. Admin and no-show rebookings are fee-free inline edits on the existing booking (no new booking created). P4TC cannot self-service modify — must contact ACFS.

- *Applies to:* booking, lsp, p4tc, acfs
- *Source:* discussion between Roni and Matt on 2026-03-18 + 2026-03-20. Consolidates former BR-006, BR-015, BR-023, BR-027.

**BR-016:** Driver records are scoped per LSP account. Drivers added by one LSP user are visible to all users within that same account, but NOT visible to other accounts. P4TC users do not have saved driver records.

- *Applies to:* lsp, driver_record
- *Source:* discussion between Roni and Matt on 2026-03-18

**BR-017:** Booking requires acceptance of two separate documents: (1) booking terms and conditions (legal), (2) driver site induction acknowledgement. If the selected driver already has site_induction = true, the induction acceptance is skipped.

- *Applies to:* booking, driver_record
- *Source:* discussion between Roni and Matt on 2026-03-18

**BR-018:** DO validation is HBL-centric, not booking-centric. It is a separate capability from pickup verification. Can be performed by an offshore team. Warehouse staff doing pickup verification may also validate DOs inline.

- *Applies to:* hbl, acfs
- *Source:* discussion between Roni and Matt on 2026-03-18

**BR-019:** Fee calculation: chargeable_weight (max of weight vs volume) per HBL × rate (single flat value). Sum individual HBL charges + minimum charge = total booking fee. Rate is a single configurable value for Phase 1 — may become per-slot or per-region in future.

- *Applies to:* booking, hbl
- *Source:* discussion between Roni and Matt on 2026-03-18

**BR-022:** Booking cancellation: LSP can cancel their own bookings. ACFS can cancel any booking (requires cancellation reason). Cancellation notification sent to booking party. Refund processed outside the system (portal is refund-agnostic). HBLs revert to previous status.

- *Applies to:* booking, lsp, acfs
- *Source:* March 18 Miro board — cancel booking flows. Absorbs former C-003 (refund constraint).

**BR-026:** Slots with active bookings cannot be removed or modified in Phase 1. ACFS must cancel or reschedule bookings before removing a slot. Blackout dates enforced via holiday calendar overlay.

- *Applies to:* slot, acfs
- *Source:* March 18 Miro board. Absorbs former C-002 (temporal constraint).

**BR-027:** HBLs track two orthogonal dimensions: (1) milestone — physical progress through the supply chain (on_vessel → at_wharf → in_yard → unpacked → collected), and (2) hbl_status — business/booking state (unassigned → assigned → delegated → booked). Both dimensions exist simultaneously and independently. An HBL can be "in_yard" (physical location) while "delegated" (business state). BRD v1.5 presents these as a flattened single lifecycle for UI simplicity, but the implementation must maintain both dimensions independently in the data model.

- *Applies to:* hbl
- *Source:* VBS Portal feedback meeting 2026-03-24 + BRD v1.5 clarification + logistics domain knowledge base

**BR-031:** HBL list views (FR-LSP-02) must display pickup site as a visible column and support filtering/searching by site. Critical for LSP dispatch planning — determines which warehouse to send truck to. BRD v1.5 omits this from FR-LSP-02 spec but field is present in data model and operationally required.

- *Applies to:* hbl, lsp
- *Source:* VBS Portal feedback meeting 2026-03-24 + logistics domain knowledge base Section 6.2

**BR-032:** Once an HBL is booked, both HBL reference and booking reference become equally important identifiers and must be displayed side-by-side in HBL table views. LSPs must be able to search by either identifier (lsp:r9). BRD FR-LSP-20 allows booking search but does not explicitly specify search keys — must support booking reference, HBL reference, truck registration, and driver name.

- *Applies to:* hbl, booking, lsp
- *Source:* VBS Portal feedback meeting 2026-03-24 (~26:40) + BRD v1.5 FR-LSP-20 + FR-ADM-07 (ACFS has multi-key search)

**BR-033:** HBL list views (FR-LSP-02) must support column show/hide customization with localStorage persistence. Default visible columns: HBL reference, booking reference (if booked), consignee, pickup site, milestone, customs status, chargeable weight. Hidden by default: container, ocean BL, quantity, pack type, description, volume, weight (individual). Rationale: 20+ column table is overwhelming (VBS Portal feedback meeting ~26:40). Different LSP workflows (delegation vs booking vs dispatch planning) require different column subsets. Column customization is high-value for usability and relatively low-effort (shadcn DataTable supports via ColumnDef visibility toggles).

- *Applies to:* hbl, lsp
- *Source:* VBS Portal feedback meeting 2026-03-24 (~26:40–28:00) + usability analysis

**BR-028:** Booking "collected" status is derived, not manually set. A booking becomes "collected" when all its HBLs reach the "collected" milestone. No manual status change needed.

- *Applies to:* booking, hbl
- *Source:* discussion between Rahul and Roni on 2026-03-20

**BR-029:** Audit trail: slim version on booking (booking created, payment confirmed). Full hop history lives on the HBL — shows all delegation chain hops, assignment changes, and status transitions per shipment.

- *Applies to:* booking, hbl
- *Source:* discussion between Rahul and Roni on 2026-03-20

**BR-030:** LSP "My Bookings" reuses the same booking list and detail view as the ACFS admin bookings interface. LSP can edit truck/driver at any time and slot/HBL before change cutoff (per BR-015). Same component as ACFS admin, different permissions.

- *Applies to:* booking, lsp
- *Source:* discussion between Rahul and Roni on 2026-03-20

## 6. Constraints

### Access

- **C-004:** Driver has no portal access. Booking party manages driver communication externally.

- **C-005:** P4TC (one-off) has no persistent credentials. Services shipments via magic link + OTP only. No account history. No saved driver records.

- **C-009:** Delegation chain visibility follows industry standard: hop-by-hop opacity. An LSP who delegates an HBL sees (1) who assigned it to them (upstream), (2) who they delegated it to (immediate downstream), and (3) whether the HBL reached "collected" milestone. They do NOT see multi-hop chains or booking details made by downstream parties. Exception: ACFS has full chain visibility for audit/operations. Rationale: commercial sensitivity, pricing confidentiality, liability boundaries (see knowledge base Section 5.2).

### Admin

- **C-006:** Site management is DB-seeded for Phase 1 — no admin CRUD UI. Sites have name + branch code only.

### Platform

- **C-007:** Desktop/laptop only. No tablet or mobile responsive design required. Portal is not meant for warehouse staff walking around — it is for counter/desk use.

### Notification

- **C-008:** Email is the primary notification channel. In-app notifications are available for logged-in users (LSPs, ACFS) but are not a Phase 1 blocker. P4TC (no login) receives email only.

## 7. Open Questions & Decision Log

### 7a. Open Questions

**OQ-034:** `OPEN` What is the exact data source for HBL hierarchy relationships and consignee data? (BLOCKER - CRITICAL)
- *Reason:* Maximus provides individual HBL references but NOT parent-child relationships. AGS feed required for: (1) HBL hierarchy (Master HBL → House HBL chain), (2) Accurate consignee identification (account name/code) - Maximus consignee data is "too inconsistent" per Delivery meeting 2026-03-24. Current status: Matt and William resolving integration approach. Impact: Data discovery blocked - Anoop requested data model urgently but cannot proceed without AGS feed definition. Blocks: data_discovery, hbl_hierarchy, consignee_accuracy, auto_assignment. Action needed: BRD v1.5 Section 6.2 must be updated to include AGS as integration source (currently only lists Maximus).

## 8. Functional Requirements

*Functional requirements are auto-generated from actor responsibilities for traceability.*

### 8.1 LSP Functional Requirements

**FR-LSP-01:** System shall display list of assigned HBLs with shipment status, milestone, payment, delegation, and booking info. Data auto-synced on login and on subsequent integration layer calls. to Logistics Service Provider (LSP).
  - *Derived from:* lsp:r1

**FR-LSP-02:** System shall allow Logistics Service Provider (LSP) to select one or multiple shipments to take action on (delegate or book)..
  - *Derived from:* lsp:r2

**FR-LSP-03:** System shall allow Logistics Service Provider (LSP) to delegate shipments to an existing lsp (search and select) or add a new one-off lsp, which creates a p4tc with email + secure link. per hbl — if delegated, lsp cannot also book directly on that same hbl (br-004)..
  - *Derived from:* lsp:r3

**FR-LSP-04:** System shall allow Logistics Service Provider (LSP) to book pickup directly: system validates booking readiness (unpacked + customs cleared + dos present) → upload missing docs → load calculation + pricing → select slot → enter truck and driver details (select existing or add new, scoped to account) → accept t&cs + site induction → make payment (stripe/compay) → receive booking confirmation with reference number. requires hbl milestone "unpacked" or later (br-001)..
  - *Derived from:* lsp:r4

**FR-LSP-05:** System shall allow Logistics Service Provider (LSP) to request missing docs when dos are unavailable. booking process is aborted (offline) until do is received..
  - *Derived from:* lsp:r5

**FR-LSP-06:** System shall allow Logistics Service Provider (LSP) to upload delivery order for downstream enforcement..
  - *Derived from:* lsp:r6

**FR-LSP-07:** System shall allow Logistics Service Provider (LSP) to flag an hbl as under-bond. manually set in portal — not synced from maximus..
  - *Derived from:* lsp:r7

**FR-LSP-08:** System shall allow Logistics Service Provider (LSP) to modify booking before cutoff: change slot date/time and hbls (add/remove) before booking cutoff. change truck/driver at any time until shipment is collected. cost-impacting changes after cutoff require acfs (br-015)..
  - *Derived from:* lsp:r8

**FR-LSP-09:** System shall allow Logistics Service Provider (LSP) to search and view bookings using multiple search keys: booking reference number, hbl reference number, truck registration, or driver name. booking reference becomes the primary identifier once hbls are booked (alongside hbl reference). both booking reference and hbl reference must be prominent (displayed side-by-side) in booked hbl table views..
  - *Derived from:* lsp:r9

### 8.2 ACFS Admin Functional Requirements

**FR-ADM-01:** System shall allow ACFS Internal to: HBL Assignment (remedial/optional): manually assign or reassign HBLs to LSPs via searchable dropdown (search LSP by name → assign). Same UX for reassignment — search and select a different LSP. System lists unassigned FAK shipments. Low priority for Phase 1 — data fix preferred over UI.
  - *Derived from:* acfs:r1

**FR-ADM-02:** System shall allow ACFS Internal to: ECST Assignment: assign ECST to shipments. Parked for Phase 1 — flow details to be defined later.
  - *Derived from:* acfs:r2

**FR-ADM-03:** System shall allow ACFS Internal to: Slot Configuration: select site → select days of week → set start/end time per slot (flexible, overlapping allowed) → configure booking cutoff and change cutoff (relative day + time, e.g. "previous working day, 4 PM") → optionally set heat map threshold value (nice-to-have) → block holidays via calendar overlay → save/update slots.
  - *Derived from:* acfs:r3

**FR-ADM-04:** System shall allow ACFS Internal to manage booking: search bookings by booking ref# or by truck/driver details → view details (slot date/time, booking party, hbls, fees paid, driver/truck) → inline edit: change pickup slot, change driver/truck, add/remove hbls. all edits available on non-cancelled/non-collected bookings. admin can override cutoffs. when hbls are added/removed, fee total recalculates but no additional payment is collected (fee-free modifications for phase 1). no truck capacity validation — that is the carrier's responsibility. booking update notification sent via email to booking party..
  - *Derived from:* acfs:r4

**FR-ADM-05:** System shall allow ACFS Internal to: DO Validation (separate from pickup verification): view list of bookings with unvalidated DOs → validate DO against lowest-level HBL details → mark as validated. HBL-centric, not booking-centric. Can be done by offshore team. Prioritise by slot date/time.
  - *Derived from:* acfs:r5

**FR-ADM-06:** System shall allow ACFS Internal to: Pickup Verification: search bookings by ref# or truck/driver → view details + DO validation status + audit tracking → validate or reject. If validated, change booking status to "processed". If not validated, booking is flagged. Includes DO validation if not already done.
  - *Derived from:* acfs:r6

**FR-ADM-07:** System shall allow ACFS Internal to: User Management: create, update, and remove users (LSP and ACFS internal). Configure feature permissions per user.
  - *Derived from:* acfs:r7

**FR-ADM-08:** System shall allow ACFS Internal to override missing do requirement. restricted to admin role. audit trail with reason required. one-time per hbl, lives until collected..
  - *Derived from:* acfs:r8

**FR-ADM-09:** System shall allow ACFS Internal to: FOC rebooking for no-shows: admin edits the pickup slot (and optionally driver/truck) on the existing booking — no new booking created. Fee-free. No separate FOC rebook action — uses the same inline edit capability as acfs:r4.
  - *Derived from:* acfs:r9

**FR-ADM-10:** System shall allow ACFS Internal to flag an hbl as under-bond..
  - *Derived from:* acfs:r10

**FR-ADM-11:** System shall allow ACFS Internal to: Partially process bookings — clear HBLs proceed while blocked ones are rebooked separately.
  - *Derived from:* acfs:r11

**FR-ADM-12:** System shall allow ACFS Internal to edit hbl details and update milestones/statuses manually when corrections are needed..
  - *Derived from:* acfs:r12

**FR-ADM-13:** System shall allow ACFS Internal to edit delegation — reassign or revoke delegation between parties..
  - *Derived from:* acfs:r13

## 9. Dependencies and Ownership

### Identity and SSO

**Dependency:** Integration with ACFS SSO platform for internal user authentication.

**Owner:** ACFS IT / Security

**Status:** pending

**Risk:** medium

### Maximas Data Feed

**Dependency:** Reliable provision of HBL data, milestones (e.g. Unpacked, Collected), customs status, and any required storage-related indicators to VBS.

**Owner:** ACFS IT / Maximas Product Owner

**Status:** pending

**Risk:** high

### Payment Gateway

**Dependency:** Selection, configuration, and commercial enablement of Stripe or an alternative gateway (e.g. Compay). Final selection to be confirmed by ACFS.

**Owner:** ACFS Finance / IT

**Status:** pending

**Risk:** medium

### Charging Configuration

**Dependency:** Definition and maintenance of pricing parameters (minimum booking charge, rates, and chargeable weight rules).

**Owner:** ACFS Finance / Product

**Status:** pending

**Risk:** low

### Communication Content

**Dependency:** Provision of email templates and message copy for: Delegation notifications, Booking confirmations, DO invalid notifications, User activation/onboarding.

**Owner:** ACFS Operations / Legal / Marketing (as applicable)

**Status:** pending

**Risk:** low

### Slot and Site Configuration

**Dependency:** Initial and ongoing slot and site configuration in backend.

**Owner:** ACFS IT / Operations

**Status:** pending

**Risk:** low

### DO Validation Rules

**Dependency:** Business rules and criteria for what constitutes a valid DO and how non-compliance is treated.

**Owner:** ACFS Operations / Compliance

**Status:** pending

**Risk:** medium

## 10. High-Level Non-Functional Expectations

### Performance

**NFR-001:** The system should provide responsive HBL list and search operations suitable for day-to-day operational use.
  - *Target:* Acceptable for operational use (< 3 seconds for typical queries)

**NFR-002:** Slot availability views and booking submission should complete within acceptable operational timeframes.
  - *Target:* Acceptable for operational use (< 5 seconds for booking confirmation)

### Availability

**NFR-003:** The system should be available during ACFS-defined business operating hours for LSP and ACFS users, with specific targets defined in technical and support SLAs.
  - *Target:* SLA-defined (typically 99%+ during business hours)

### Audit

**NFR-004:** Key actions must be auditable, including: Delegation of HBLs, Creation and modification of bookings, DO validation decisions, User creation and role changes.
  - *Target:* All listed actions logged with actor, timestamp, and key data changes

**NFR-005:** Audit logs should capture actor, timestamp, and key data changes to support compliance and operational investigations.
  - *Target:* Sufficient detail for compliance audit and issue investigation

### Security

**NFR-006:** Access control must enforce role-based permissions for LSP, ACFS Admin, and ACFS User roles.
  - *Target:* 100% of operations gated by role permissions

**NFR-007:** Data exchange with Maximas and the payment gateway must follow ACFS security guidelines and integration standards.
  - *Target:* Passes ACFS security review for data exchange

---

*Generated from Intent Model v0.8.0 on 2026-03-27*