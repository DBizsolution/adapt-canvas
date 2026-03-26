# Database Schema Review
**Date:** 2026-03-26
**Schema Version:** acfs-datamodel-corrected.dbml (v0.8.0)
**Intent Model Version:** v0.8.0
**Reviewer:** Claude Code

---

## Executive Summary

✅ **OVERALL: Schema is CORRECT and well-aligned with intent model**

The database schema properly supports all Phase 1 requirements with the following strengths:
- All critical business rules encoded (BR-001, BR-002, BR-004, BR-005, BR-027, BR-031, BR-032)
- Two-dimensional HBL tracking (milestone + hbl_status) properly separated
- Delegation chain fully tracked via `hbl_custody_chain`
- Proper DO per-tier support via `delivery_orders` table
- AGS feed integration prepared (alt_hbl_reference, consignee fields)
- All Phase 1 entities present with correct relationships

---

## ✅ Entity Coverage

| Intent Model Entity | Database Table(s) | Status |
|---------------------|-------------------|--------|
| HBL | `hbls` | ✅ Complete |
| Booking | `bookings` + `booking_hbls` | ✅ Complete |
| Slot | `slots` | ✅ Complete |
| Site | `sites` | ✅ Complete |
| Driver Record | `driver_records` | ✅ Complete (deferred but included) |
| Delivery Order | `delivery_orders` | ✅ Complete |
| Delegation | `delegations` + `delegation_hbls` + `hbl_custody_chain` | ✅ Complete |
| Container | `containers` | ✅ Complete |
| Company/LSP | `companies` | ✅ Complete |
| User | `users` + `user_invitations` | ✅ Complete |
| Payment | `payments` | ✅ Complete |
| Pricing | `pricing_zones` | ✅ Complete |
| Notification | `email_notifications` | ✅ Complete |

---

## ✅ Business Rules Validation

### BR-001: Delegation at any milestone, booking requires unpacked + customs cleared
**Status:** ✅ PROPERLY ENCODED
- `hbls.milestone` tracks physical progress: on_vessel → at_wharf → in_yard → unpacked → collected
- `hbls.hbl_status` tracks business state: unassigned → assigned → delegated → booked
- `hbls.customs_status` separate field for customs clearance validation
- Application logic can gate booking on milestone='unpacked' AND customs_status='fully_cleared'

### BR-002: DO per tier, waived by under_bond or free_release
**Status:** ✅ PROPERLY ENCODED
- `delivery_orders` table with `custody_chain_id` → supports DO per delegation tier
- `hbls.under_bond` + `under_bond_verified` for manual under-bond flagging
- `hbls.release_type` enum: do_required | free_release
- `hbls.do_waived` computed field for unified booking validation
- `delivery_orders.tier_level` tracks which level in HBL hierarchy

### BR-004: Either delegate OR book per HBL (mutual exclusivity)
**Status:** ✅ PROPERLY ENCODED
- `hbls.hbl_status` enum enforces mutually exclusive states:
  - `assigned` → can delegate or book
  - `delegated` → cannot book (would need to un-delegate first)
  - `booked` → cannot delegate
- Application logic enforces the state machine

### BR-005: Relative slot cutoffs (no hard capacity limits)
**Status:** ✅ PROPERLY ENCODED
```sql
booking_cutoff_relative_day varchar(50) -- e.g., 'previous_working_day', 'same_day'
booking_cutoff_time time            -- e.g., '16:00'
change_cutoff_relative_day varchar(50)
change_cutoff_time time
heat_map_threshold int              -- Optional Phase 1, no blocking
```
- Supports "previous working day at 4PM" type rules
- No hard capacity constraints (as required)

### BR-027: Two orthogonal HBL dimensions
**Status:** ✅ PROPERLY ENCODED
- `hbls.milestone` (physical): on_vessel | at_wharf | in_yard | unpacked | collected
- `hbls.hbl_status` (business): unassigned | assigned | delegated | booked
- Schema maintains both independently (critical fix from original schema)

### BR-031: Pickup site visibility
**Status:** ✅ PROPERLY ENCODED
- `hbls.pickup_site_id` references `sites.id`
- Indexed: `pickup_site_id` for filtering/search performance
- Critical for LSP dispatch planning

### BR-032: Both HBL ref and booking ref as primary identifiers
**Status:** ✅ PROPERLY ENCODED
- `bookings.booking_reference` unique, system-generated
- `booking_hbls` junction table links bookings ↔ HBLs
- Frontend can display both side-by-side in HBL table views
- Search indexes support both: `hbls.hbl_number` + `bookings.booking_reference`

---

## ✅ Critical Field Coverage

### HBL Table - All Key Fields Present
✅ `hbl_number` - primary identifier
✅ `alt_hbl_reference` - parent/master HBL (AGS feed)
✅ `consignee_name` + `consignee_account_code` - from AGS (OQ-034)
✅ `weight_kg`, `volume_m3`, `chargeable_weight` - fee calculation
✅ `milestone` + `hbl_status` - two dimensions (BR-027)
✅ `customs_status` + `customs_clearance_date`
✅ `under_bond` + `under_bond_verified` (BR-002)
✅ `release_type` + `do_waived` (BR-002)
✅ `pickup_site_id` (BR-031)
✅ `assigned_company_id` - LSP assignment
✅ `last_free_storage_date` - storage fee computation
✅ `container_id` → `containers.container_number` + `ocean_bl`

### Booking Table - Complete
✅ `booking_reference` - system-generated unique ID
✅ `slot_id` + `slot_date` - pickup window
✅ `booked_by_company_id` + `booked_by_user_id` + `booked_by_email` (P4TC)
✅ `status` enum: draft | booked | pending_processing | processed | collected | cancelled
✅ Driver fields: `driver_name`, `driver_licence_number`, `driver_phone`, `truck_rego`
✅ `site_induction_completed` + `site_induction_skipped` (BR-017)
✅ `terms_accepted_at` (BR-017)
✅ Fee breakdown: `total_fee_excl_gst`, `gst_amount`, `total_fee_incl_gst`
✅ Modification tracking: `is_late_change`, `late_change_fee`, `last_modified_at`
✅ Cancellation: `cancelled_at`, `cancelled_by_user_id`, `cancellation_reason`

### Delegation Chain - Fully Tracked
✅ `hbl_custody_chain` table with hop-by-hop tracking:
  - `hop_sequence` - order in chain
  - `from_company_id` - delegator (null for initial ACFS assignment)
  - `to_company_id` - delegatee
  - `delegation_method` - existing_lsp | one_off_p4tc
✅ `delegations` table - explicit delegation records
✅ `delegation_hbls` junction - many-to-many (bulk delegation support)

---

## ✅ Data Integration Readiness

### AGS Feed Integration (OQ-034 - CRITICAL BLOCKER)
**Status:** ✅ SCHEMA READY, awaiting feed definition

The schema already includes fields for AGS data:
- `hbls.alt_hbl_reference` - parent/master HBL reference
- `hbls.consignee_name` - consignee identification
- `hbls.consignee_account_code` - account code from AGS
- Index on `consignee_account_code` for auto-assignment lookups

**Note:** While the schema is ready, the integration itself is blocked per OQ-034. Matt and William are resolving the AGS feed approach. Once feed is defined, these fields can be populated without schema changes.

### Maximus Integration
✅ `hbls.maximus_hbl_id` - external reference
✅ `containers.maximus_reference`
✅ Milestone sync support
✅ Weight/volume/customs status fields

### Payment Gateway Abstraction
✅ `payments.payment_gateway` - stripe | compay (swappable)
✅ `payments.payment_gateway_ref` - external transaction ID
✅ Gateway-agnostic design allows Phase 2 swap to Compay

---

## ⚠️ Observations & Recommendations

### 1. Index Coverage
**Status:** ✅ GOOD - comprehensive indexes present

Key performance indexes in place:
- `hbls(hbl_number)` - primary lookup
- `hbls(assigned_company_id)` - LSP-scoped queries
- `hbls(pickup_site_id)` - dispatch planning filters
- `hbls(milestone, hbl_status)` - composite for state-based filtering
- `hbls(consignee_account_code)` - auto-assignment
- `bookings(booking_reference)` - booking search
- `bookings(truck_rego, driver_licence_number)` - multi-key search (BR-032)
- `hbl_custody_chain(hbl_id, hop_sequence)` - chain traversal

### 2. Enum Completeness
**Status:** ✅ COMPLETE - all enums match intent model

- `milestone_status` - corrected to match intent model (was wrong in original)
- `hbl_status` - NEW, separates business state from milestone (BR-027)
- `booking_status` - corrected lifecycle (was wrong in original)
- All other enums present and correct

### 3. Soft Deletes
**Status:** ✅ PROPER - uses `archived_at` pattern

- `users.archived_at` - soft delete retains data (BR-014)
- `users.is_active` flag for access control
- Proper audit trail approach

### 4. Nullable Fields - Appropriate Design
**Status:** ✅ CORRECT - nullability matches business logic

Examples of correct nullable design:
- `hbls.alt_hbl_reference` - nullable (not all HBLs have parents)
- `bookings.booked_by_user_id` - nullable (P4TC bookings have email only)
- `delegations.delegatee_company_id` - nullable (P4TC delegations)
- `delivery_orders.custody_chain_id` - nullable (initial ACFS assignment has no chain)

### 5. Missing from Schema (Intentional Deferrals)
These are **correctly excluded** per BRD v1.5 Phase 1 scope:
- ❌ ECST tracking (deferred - acfs:r2)
- ❌ Gatehouse actor tables (deferred - BRD v1.5)
- ❌ P4TC account/history (by design - magic link only, no persistence)
- ❌ In-app notifications (email-only Phase 1)

---

## Schema Strengths

1. **Separation of Concerns** - Milestone vs HBL status properly separated (BR-027 fix)
2. **Delegation Chain** - Hop-by-hop tracking with full audit trail
3. **DO Per Tier** - Proper one-to-many delivery_orders table
4. **Fee Transparency** - Per-HBL fee breakdown in `booking_hbls` junction (BR-019)
5. **Payment Gateway Abstraction** - Swappable without schema changes
6. **Cutoff Flexibility** - Relative day + time structure (BR-005)
7. **Comprehensive Indexing** - Query performance optimized for key access patterns
8. **Audit Trail** - Full hop history on HBL, slim booking trail (BR-029)
9. **P4TC Support** - Email-based fields for one-off bookings and delegations
10. **Booking Modifications** - Full lifecycle tracking with fee/cutoff rules

---

## Critical Questions Checklist

### ✅ Can an LSP see only their assigned HBLs? (BR-009)
Yes - `hbls.assigned_company_id` + application-layer scoping

### ✅ Can delegation happen at any milestone? (BR-001)
Yes - `hbl_status` independent of `milestone`

### ✅ Does booking require unpacked + customs cleared? (BR-001)
Yes - schema supports validation on `milestone='unpacked'` + `customs_status='fully_cleared'`

### ✅ Can we track DO per delegation tier? (BR-002)
Yes - `delivery_orders.custody_chain_id` links to specific hop

### ✅ Can we prevent delegate + book on same HBL? (BR-004)
Yes - `hbl_status` state machine enforces mutual exclusivity

### ✅ Can we support relative slot cutoffs? (BR-005)
Yes - `booking_cutoff_relative_day` + `booking_cutoff_time` structure

### ✅ Is pickup site visible for dispatch planning? (BR-031)
Yes - `hbls.pickup_site_id` with index

### ✅ Can we search by both HBL ref and booking ref? (BR-032)
Yes - indexed on both `hbls.hbl_number` and `bookings.booking_reference`

### ✅ Can we track under-bond manually? (BR-002)
Yes - `hbls.under_bond` + `under_bond_verified` flags

### ✅ Is AGS feed integration ready? (OQ-034)
Yes - schema has `alt_hbl_reference` + `consignee_*` fields; awaiting feed definition

---

## Final Verdict

### ✅ SCHEMA IS PRODUCTION-READY FOR PHASE 1

**Confidence Level:** HIGH

**Why this schema is correct:**
1. All 12 core entities properly modeled
2. All critical business rules encoded (BR-001, BR-002, BR-004, BR-005, BR-027, BR-031, BR-032)
3. Two-dimensional HBL tracking correctly separated (critical fix)
4. Delegation chain fully traceable
5. DO per-tier properly supported
6. AGS integration fields present (awaiting feed definition)
7. Comprehensive indexing for performance
8. Payment gateway abstraction for Phase 2 swap
9. Proper soft deletes and audit trails
10. All Phase 1 scope covered; deferred features correctly excluded

**Blockers:** None in schema. OQ-034 (AGS feed) is an integration blocker, not a schema blocker.

---

## Comparison: Original vs Corrected Schema

The "corrected" schema fixes these critical gaps from the original:

| Issue | Original Schema | Corrected Schema |
|-------|----------------|------------------|
| HBL dimensions | Single `status` field conflated milestone + business state | Separate `milestone` + `hbl_status` (BR-027) |
| Milestones | Wrong: pending, customs_cleared, ready_for_pickup | Correct: on_vessel, at_wharf, in_yard, unpacked, collected |
| Booking status | Wrong lifecycle | Correct: draft → booked → pending_processing → processed → collected |
| Under-bond | Missing | Added `under_bond` + `under_bond_verified` + `do_waived` |
| Pickup site | Missing | Added `pickup_site_id` (BR-031) |
| Slot cutoffs | Simple `booking_cutoff_hours` int | Structured relative_day + time (BR-005) |
| Consignee | Missing | Added `consignee_name` + `consignee_account_code` (AGS feed) |
| Ocean BL | Missing | Added to containers table |
| Delegation entity | Missing | Added `delegations` table for explicit tracking |
| Release type | Missing | Added `release_type` enum + field |

**Result:** The corrected schema is a substantial improvement and production-ready.
