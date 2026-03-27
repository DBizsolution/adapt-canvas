# BRD Reconciliation: Actors Comparison

**Date:** 2026-03-28
**Sources:** PDF BRD v1.5 (Section 2) vs Intent Model v0.8.0

---

## Actor Structure Comparison

| PDF BRD v1.5 | Intent Model v0.8.0 | Status |
|--------------|---------------------|--------|
| LSP | LSP | ✅ Present |
| ACFS Admin | ACFS Internal (includes Admin + User sub-roles) | ⚠️ Structural difference |
| ACFS User | ACFS Internal (includes Admin + User sub-roles) | ⚠️ Structural difference |
| Maximas (External System) | Maximas (integration entity, not actor) | ⚠️ Categorization difference |
| - | P4TC (marked deferred) | ➕ Intent model has extra (aligned with BRD fast-follow) |
| - | Driver | ➕ Intent model explicit, PDF implicit |
| - | Gatehouse (marked deferred) | ➕ Intent model extra (forward-looking) |

---

## LSP Actor Comparison

### PDF BRD v1.5 Description
- Represents wholesale freight forwarders, freight forwarders, and transport carriers collectively as a single user group
- Access is at company account level, not individual named users
- One login per company; internal access is managed within each company
- Has equal feature access across all LSP entities

### Intent Model v0.8.0 Description
- Core registered user. Umbrella term covering NVOCC, wholesale Freight Forwarder, Freight Forwarder, Transporter, Farmers, and Customer/Clearing agents
- Each LSP sees only shipments allocated to them
- Can delegate to another LSP or a one-off P4TC
- Replaces the previous WFF/FF/Carrier actor split
- Note: roles are contextual per HBL — the same organisation can appear at different levels (e.g. top-level party on one HBL, delegatee on another)
- Visibility and role enforcement must be HBL-scoped, not user-scoped

**Assessment:** ✅ Intent model has MORE implementation detail. Aligns with PDF but adds critical context about contextual roles and HBL-scoped visibility.

### LSP Responsibilities Comparison

| PDF BRD v1.5 | Intent Model v0.8.0 | Match |
|--------------|---------------------|-------|
| Log into VBS using company credentials | Implicit in auth field | ✅ |
| View all HBLs assigned to LSP, with relevant shipment and operational details | lsp:r1 - View list of assigned HBLs with shipment status, milestone, payment, delegation, and booking info | ✅ |
| Select one or multiple HBLs and either: Delegate shipments to another LSP, or Initiate and complete a pickup booking | lsp:r2 - Select one or multiple shipments to take action on (delegate or book) | ✅ |
| Upload DOs against HBLs where required and mark HBLs as free release where applicable | lsp:r6 - Upload Delivery Order for downstream enforcement | ✅ |
| Provide driver and truck details as part of the booking process | Covered in lsp:r4 - Book pickup (includes driver/truck details) | ✅ |
| Accept required terms and conditions for bookings and site inductions | Covered in lsp:r4 - accept T&Cs + site induction | ✅ |
| Modify driver and truck details on existing bookings within permitted constraints | lsp:r8 - Modify booking (driver/truck anytime, slot before cutoff) | ✅ |
| Cancel bookings within defined rules (with refunds and fee impacts handled offline by ACFS) | ❌ NOT EXPLICIT | 🚨 **GAP** |
| - | lsp:r3 - Delegate to existing LSP or P4TC with secure link | ➕ More detail |
| - | lsp:r5 - Request missing docs when DOs unavailable | ➕ Extra detail |
| - | lsp:r7 - Flag an HBL as under-bond | ➕ Extra detail |
| - | lsp:r9 - Search and view bookings using multiple search keys | ➕ Extra detail |

**Assessment:** Intent model has MORE detail overall but is **missing explicit cancellation responsibility** mentioned in PDF BRD.

---

## ACFS Actor Comparison

### PDF BRD v1.5 Structure
Two separate actors:
1. **ACFS Admin** - Full administrative privileges, backend access, "Super User" at launch
2. **ACFS User** - Restricted permissions, performs operational tasks under Admin oversight, no configuration/global admin

### Intent Model v0.8.0 Structure
Single actor: **ACFS Internal**
- Description mentions "Two sub-roles: Admin (full privileges) and User (predefined/restricted privileges)"
- All responsibilities listed under one actor

**Assessment:** ⚠️ **Structural difference** - PDF BRD splits into two actors, intent model combines with sub-role description. Content is aligned but structure differs.

### ACFS Admin Responsibilities Comparison

| PDF BRD v1.5 | Intent Model v0.8.0 | Match |
|--------------|---------------------|-------|
| Configure and maintain booking slots at site level via backend configuration (no UI in Phase 1) | acfs:r3 - Slot Configuration (select site, days, times, cutoffs, heat map, holidays) | ✅ More detail in intent model |
| Manage bookings on behalf of LSPs, including full attribute updates and fee-free adjustments for Phase 1 | acfs:r4 - Manage Booking (search, view, inline edit slot/driver/truck/HBLs, override cutoffs, fee-free mods) | ✅ More detail in intent model |
| Perform DO validation and maintain DO validation status for each HBL | acfs:r5 - DO Validation (view bookings, validate DO against HBL, mark validated, prioritize by slot date) | ✅ More detail in intent model |
| Perform pickup verification at collection time and update booking processing status | acfs:r6 - Pickup Verification (search, view DO status, validate/reject, change to "processed") | ✅ More detail in intent model |
| Oversee HBL visibility, lifecycle states, and fail-safe manual HBL assignment | acfs:r1 - HBL Assignment (manually assign/reassign via dropdown, lists unassigned FAK) | ✅ More detail in intent model |
| Manage creation, update, and deactivation of LSP accounts and ACFS internal users | acfs:r7 - User Management (create, update, remove users, configure permissions) | ✅ |
| - | acfs:r2 - ECST Assignment (parked for Phase 1) | ➕ Extra detail |
| - | acfs:r8 - Override missing DO requirement (audit trail, one-time per HBL) | ➕ Extra detail |
| - | acfs:r9 - FOC rebooking for no-shows (fee-free) | ➕ Extra detail |
| - | acfs:r10 - Flag HBL as under-bond | ➕ Extra detail |
| - | acfs:r11 - Partially process bookings | ➕ Extra detail |
| - | acfs:r12 - Edit HBL details and milestones manually | ➕ Extra detail |
| - | acfs:r13 - Edit delegation (reassign or revoke) | ➕ Extra detail |

**Assessment:** ✅ Intent model has MUCH MORE detail. All PDF BRD responsibilities are covered plus significant additional operational detail.

### ACFS User Responsibilities Comparison

| PDF BRD v1.5 | Intent Model v0.8.0 | Match |
|--------------|---------------------|-------|
| Perform a subset of ACFS operational tasks (e.g. DO validation, pickup verification) subject to assigned permissions | Implicit in "Two sub-roles" description + responsibilities have role context | ⚠️ Less explicit |
| Does not manage configuration or global user administration | Implicit in description | ⚠️ Less explicit |

**Assessment:** ⚠️ Intent model structure doesn't explicitly separate ACFS User responsibilities. They're implied as a subset of ACFS Internal responsibilities with restricted permissions.

---

## Maximas Comparison

### PDF BRD v1.5
Listed as an actor (External System):
- ACFS operational system of record providing shipment, HBL, milestone, customs status, and custody mapping data
- Not a human actor but a key system participant in the end-to-end process

### Intent Model v0.8.0
Listed as an **integration entity** (not actor):
- External data source providing HBL master data, milestones, and customs status
- Located in `entities` array with `is_integration: true`

**Assessment:** ⚠️ **Categorization difference** - Both recognize Maximas, but PDF treats as actor, intent model treats as integration entity. Content is aligned.

---

## Additional Actors in Intent Model

### P4TC (Party to Collect)
- **Status:** Marked as `deferred: true`
- **Alignment:** PDF BRD v1.5 Section 1 mentions "One-off booking party self-service flows" as fast follow/future phase
- **Assessment:** ✅ Intent model includes forward-looking detail that aligns with PDF BRD fast-follow scope

### Driver
- **Status:** Active actor in intent model
- **PDF BRD Reference:** Driver details mentioned in LSP responsibilities but not listed as separate actor in Section 2
- **Assessment:** ⚠️ Intent model explicitly models Driver as actor. PDF BRD treats as data captured during booking. Both valid, intent model more explicit.

### Gatehouse
- **Status:** Marked as `deferred: true`
- **PDF BRD Reference:** Not mentioned in Section 2
- **Assessment:** ➕ Intent model has forward-looking detail not in PDF BRD

---

## Critical Gaps Identified

### 1. LSP Booking Cancellation Responsibility Missing
**PDF BRD v1.5:** "Cancel bookings within defined rules (with refunds and fee impacts handled offline by ACFS)"

**Intent Model v0.8.0:** No explicit cancellation responsibility in LSP actor

**Recommendation:** Add `lsp:r10` or update `lsp:r8` to explicitly include cancellation capability

### 2. ACFS Actor Structure Mismatch
**PDF BRD v1.5:** Two separate actors (Admin and User) with distinct responsibilities

**Intent Model v0.8.0:** Single actor (ACFS Internal) with sub-role description

**Recommendation:** Consider splitting into two actors (`acfs-admin` and `acfs-user`) for clarity, or enhance description to explicitly list which responsibilities apply to which sub-role

---

## Recommendations

### High Priority
1. **Add LSP booking cancellation responsibility** - Explicitly document cancellation flow and constraints
2. **Clarify ACFS sub-role responsibilities** - Either split into two actors or add explicit mapping of responsibilities to sub-roles

### Medium Priority
3. **Document Driver actor rationale** - Explain why Driver is modeled as separate actor vs data attribute
4. **Document Maximas categorization** - Explain why it's an integration entity not actor

### Low Priority
5. **Keep P4TC and Gatehouse deferred** - Current approach is correct, no changes needed

---

## Next Steps
1. Read PDF BRD Section 4 (High-Level Business Processes) to compare journeys
2. Read PDF BRD Section 6 (Data Model) to compare entities
3. Identify any missing journeys or entities
4. Apply updates to intent model v0.8.0 → v0.9.0
