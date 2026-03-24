# BRD v1.5 Proposed Updates
**Based on**: VBS Portal Feedback Meeting (2026-03-24), Delivery Team Meeting (2026-03-24), Logistics Domain Research
**Prepared by**: Rahul
**Date**: 2026-03-24
**Intent Model Version**: 0.8.0

---

## Executive Summary

This document outlines 8 proposed updates to BRD v1.5 based on recent stakeholder feedback, team discussions, and logistics domain research. Updates fall into three categories:

- **Critical**: 1 item (AGS integration missing - blocking data discovery)
- **New Requirements**: 4 items (should be incorporated into BRD v1.6)
- **Implementation Clarifications**: 3 items (can remain in intent model, but worth documenting)

---

## 🔴 CRITICAL - Requires Immediate Action

### Update #1: AGS Data Feed Integration

**Issue**: BRD Section 6.2 "Integration Data from Maximus" completely omits AGS as an integration source.

**Reality**:
- Delivery meeting (2026-03-24) confirmed AGS feed is **required** for:
  - HBL hierarchy relationships (Master HBL → House HBL parent-child mapping)
  - Accurate consignee identification (Maximus consignee data is "too inconsistent")
- Matt and William are actively defining the integration approach
- **Blocking**: Data discovery work (Anoop urgency 2026-03-24)

**Proposed Change**:
Add new section **6.3 Integration Data from AGS** after Section 6.2:

```markdown
## 6.3 Integration Data from AGS

Data elements provided by AGS to VBS include:
- Master HBL references (typically 500-prefix identifiers)
- HBL hierarchy relationships (parent-child mapping between Master HBL and House HBL)
- Freight forwarder party assignments (account name, account code)
- Consignee identification at each hierarchy level (more consistent than ICS/Maximus data)

**Status**: Integration format and delivery mechanism being defined by Matt and William.
**Frequency**: TBD
**Direction**: Inbound (AGS → Portal)
```

**Related Intent Model Changes**:
- Added entity: `integration_ags`
- Expanded OQ-034 to CRITICAL priority with blocking status

---

## ⚠️ NEW REQUIREMENTS - Should Be in BRD v1.6

### Update #2: Pickup Site Visibility

**Issue**: FR-LSP-02 specifies HBL table columns but omits "Pickup Site" despite the field existing in the data model (Section 6.1).

**Why it matters**:
- Critical for LSP dispatch planning - determines which warehouse to send truck to
- Feedback meeting: implicit requirement discovered during UX review

**Proposed Changes**:

**Section 5.1 FR-LSP-02** - Add to column list:
```diff
System shall display a list of all HBLs assigned to the logged-in LSP, showing at least:
  • Lowest HBL Reference
  • Other HBL Reference
  • Container Number
  • OBL
  • Description
  • Weight
  • Volume
+ • Pickup Site
  • Next Hop (Next step party name)
  • Milestone Status
  • Customs Status
  • Quantity
  • Pack Type
  • Storage Fee flag
```

**Add new requirement FR-LSP-02A**:
```markdown
FR-LSP-02A
System shall allow LSPs to filter and search HBL list by pickup site. Site is a critical
dispatch planning parameter determining which warehouse location to send trucks to.
```

**Related Intent Model Changes**:
- Added BR-031: HBL list views must display pickup site as visible column with filter/search
- Updated `pickup_site` field description to emphasize operational importance

---

### Update #3: Column Customization

**Issue**: FR-LSP-02 specifies 20+ fixed columns. Feedback meeting (Kavya ~26:40): "This is so much... Are they customizable? Can she choose what she wants to see?"

**Why it matters**:
- Different workflows need different column subsets:
  - **Delegation workflow**: Focus on consignee, next hop, milestone
  - **Booking workflow**: Focus on customs status, pickup site, chargeable weight
  - **Dispatch planning**: Focus on site, slot date, booking reference
- Usability blocker - overwhelming information density

**Proposed Changes**:

**Add new requirement FR-LSP-25**:
```markdown
FR-LSP-25
System shall allow LSPs to customize HBL table column visibility via show/hide toggles, with
user preferences persisted in browser local storage.

Default visible columns:
• HBL Reference (lowest level)
• Booking Reference (if booked)
• Consignee
• Pickup Site
• Milestone Status
• Customs Status
• Chargeable Weight

Hidden by default (user can show):
• Other HBL Reference
• Container Number
• Ocean Bill of Lading
• Quantity
• Pack Type
• Description
• Volume (individual)
• Weight (individual)

Rationale: Different LSP workflows (delegation vs booking vs dispatch planning) require
different column subsets. Column customization is high-value for usability and relatively
low-effort to implement.
```

**Related Intent Model Changes**:
- Added BR-033: Column customization requirement with rationale

---

### Update #4: Multi-Key Booking Search for LSPs

**Issue**:
- FR-LSP-20 says LSPs can "search for and view existing bookings" but doesn't specify search keys
- FR-ADM-07 gives ACFS multi-key search (booking ref, driver name, license, truck registration)
- LSPs get generic "search" with no specified keys

**Why it matters**:
- Once HBLs are booked, **both** HBL reference and booking reference become equally important identifiers
- LSPs need same search capability as ACFS for operational efficiency

**Proposed Changes**:

**Update FR-LSP-20**:
```diff
FR-LSP-20
- System shall allow LSPs to search for and view existing bookings, including their status
- and associated HBLs.
+ System shall allow LSPs to search for and view existing bookings by multiple search keys:
+ • Booking reference number
+ • HBL reference number
+ • Truck registration
+ • Driver name
+ Both booking reference and HBL reference must be displayed side-by-side (equally prominent)
+ for booked HBLs in table views, as both become primary identifiers post-booking.
```

**Related Intent Model Changes**:
- Added lsp:r9: Multi-key booking search capability
- Added BR-032: Side-by-side display of booking ref + HBL ref requirement
- Added `related_booking_ids` field to HBL entity

---

### Update #5: Delegation Chain Visibility Model

**Issue**: BRD doesn't specify visibility rules for multi-hop delegation chains. When LSP A delegates to LSP B, and LSP B delegates to LSP C, what does each party see?

**Why it matters**:
- Critical for UI design and data access permissions
- Industry standard practice exists (hop-by-hop opacity)

**Proposed Changes**:

**Add new section 7.2A Delegation Visibility**:
```markdown
## 7.2A Delegation Visibility

The system implements hop-by-hop delegation visibility following logistics industry standards:

**LSP/P4TC Visibility (per HBL)**:
- Can see **one hop upstream**: who assigned/delegated this HBL to them
- Can see **one hop downstream**: who they delegated this HBL to (if applicable)
- Can see **collection milestone**: whether HBL reached "collected" status
- **Cannot see**: multi-hop delegation chains, booking details made by downstream parties

**ACFS Visibility**:
- Full delegation chain visibility for all HBLs (audit and operations requirement)
- Complete hop history with timestamps and party details

**Rationale**:
- **Commercial sensitivity**: Freight forwarders don't want clients to discover their subcontractors
- **Pricing confidentiality**: Margin structures remain hidden across chain
- **Liability boundaries**: Each party responsible for their segment only

This follows standard industry practice documented in logistics domain knowledge base (Section 5.2).
```

**Related Intent Model Changes**:
- Added C-009: Delegation visibility constraint with industry rationale

---

## 📋 IMPLEMENTATION CLARIFICATIONS

These items clarify how to implement existing BRD requirements. They can remain documented in the intent model, but worth noting in technical design docs.

### Update #6: Orthogonal State Dimensions

**Issue**: BRD Section 4.7 presents HBL lifecycle as flat sequence (Unassigned → Assigned → Delegated → Booked → Collected). Implementation requires two independent dimensions.

**Clarification**:
- **milestone** (physical location): `on_vessel` → `at_wharf` → `in_yard` → `unpacked` → `collected`
- **hbl_status** (business state): `unassigned` → `assigned` → `delegated` → `booked`

An HBL can be "in_yard" (physical) + "delegated" (business) simultaneously.

**UI Implication**: Frontend can present flattened view, but data model must maintain both dimensions independently.

**Related Intent Model Changes**:
- Added BR-027: Orthogonal dimensions explanation with implementation guidance

---

### Update #7: Payment Gateway Abstraction

**Issue**: BRD Section 7.3 mentions "Stripe or alternative (Compay)" but doesn't emphasize abstraction pattern.

**Clarification**:
- Delivery meeting (~44:20): "Stripe for now but may go back and forth"
- Implementation should use **adapter pattern** to isolate provider-specific logic from business logic
- Enables future swap to Compay or other providers without touching core booking flow

**Related Intent Model Changes**:
- Updated Payment entity description to emphasize abstraction requirement

---

### Update #8: Driver Management Phasing (Confirmation)

**Status**: ✅ BRD correctly reflects Phase 1 scope

**Confirmation**: Delivery meeting (~27:00) confirmed:
- Phase 1: Driver is booking attributes only (name, license, truck rego on booking entity)
- Fast Follow: Driver records for reuse (separate driver_record entity)

No BRD changes needed - correctly documented.

---

## Summary of Changes by Section

| BRD Section | Change Type | Update # | Description |
|-------------|-------------|----------|-------------|
| **6.2** (Integration) | Add section 6.3 | #1 | AGS data feed integration (CRITICAL) |
| **5.1 FR-LSP-02** | Modify + Add FR-LSP-02A | #2 | Pickup site visibility and filtering |
| **5.1** | Add FR-LSP-25 | #3 | Column customization |
| **5.1 FR-LSP-20** | Modify | #4 | Multi-key booking search |
| **7.2** | Add section 7.2A | #5 | Delegation visibility model |
| *(Technical docs)* | Note | #6 | Orthogonal state dimensions (implementation) |
| *(Technical docs)* | Note | #7 | Payment gateway abstraction (implementation) |
| *(No change)* | Confirmed | #8 | Driver management phasing already correct |

---

## Recommended Action Plan

1. **Immediate** (Blocking):
   - Resolve AGS integration specification (Matt/William) → Update BRD Section 6.2/6.3
   - Unblock data discovery work (Anoop)

2. **Before BRD v1.6 Final**:
   - Incorporate Updates #2-5 (pickup site, column customization, search keys, delegation visibility)
   - Review with stakeholders for approval

3. **Technical Design Phase**:
   - Document Updates #6-7 in technical specification
   - Ensure data model reflects orthogonal dimensions
   - Ensure payment integration uses adapter pattern

---

## Questions for Review

1. **AGS Integration**: What is the target timeline for Matt/William to finalize the AGS integration specification?
2. **Column Customization**: Is FR-LSP-25 acceptable for Phase 1, or should it be deferred to Fast Follow?
3. **Delegation Visibility**: Does hop-by-hop opacity align with ACFS business goals, or is full chain transparency required for compliance reasons?

---

*Document prepared from intent model v0.8.0. All changes tracked as business rules (BR-027, BR-031, BR-032, BR-033), constraints (C-009), and open questions (OQ-034) in the intent model.*
