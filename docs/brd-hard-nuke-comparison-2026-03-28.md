# Hard Nuke Comparison: What You'd Lose

**Scenario:** Replace intent model v0.8.0 entirely with ONLY content from PDF BRD v1.5

---

## 🔥 CATASTROPHIC LOSSES

### 1. Business Rules: 33 Rules → 0 Rules

**Intent Model Has:**
```typescript
business_rules: [
  { id: 'BR-001', description: 'Booking requires HBL milestone "unpacked" or later', ... },
  { id: 'BR-002', description: 'HBL must be fully customs cleared for booking', ... },
  { id: 'BR-003', description: 'DOs must be uploaded and validated or under-bond flag set', ... },
  // ... BR-004 through BR-033
]
```

**PDF BRD Has:**
- ❌ No explicit business rules section
- Business logic is scattered across journey descriptions
- No BR codes, no traceability, no "applies_to" mapping

**Impact:** Lose all traceable, testable business rules that dev/QA teams rely on.

---

### 2. Entity Lifecycles: Complete State Machines → High-Level List

**Intent Model Has:**
```typescript
// HBL lifecycle
lifecycle: {
  states: ['on_vessel', 'at_wharf', 'in_yard', 'unpacked', 'collected'],
  transitions: [
    { from: 'on_vessel', to: 'at_wharf', trigger: 'Vessel arrival at port', guard: 'Maximus milestone update' },
    { from: 'at_wharf', to: 'in_yard', trigger: 'Container movement to warehouse', guard: 'Maximus sync' },
    // ... detailed transitions with triggers and guards
  ],
  warn: 'Milestone and hbl_status are orthogonal dimensions (BR-027)'
}

// Booking lifecycle
lifecycle: {
  states: ['draft', 'booked', 'pending_processing', 'processed', 'collected', 'cancelled'],
  transitions: [
    { from: 'draft', to: 'booked', trigger: 'Payment successful', guard: 'All HBLs meet booking criteria' },
    { from: 'booked', to: 'pending_processing', trigger: 'Slot time reached', guard: 'None' },
    // ... detailed transitions
  ]
}

// DO lifecycle
// Delegation lifecycle
```

**PDF BRD Has:**
- HBL Lifecycle: Just 5 states listed (Unassigned → Assigned → Delegated → Booked → Collected)
- No transitions, no triggers, no guards
- No other entity lifecycles documented

**Impact:** Lose implementation-ready state machines. Dev team would have to infer transitions.

---

### 3. Integration Entities: 5 Detailed Specs → Brief Description

**Intent Model Has:**
```typescript
{
  id: 'integration_maximus',
  name: 'Maximus Integration',
  is_integration: true,
  description: 'External ACFS system of record...',
  key_fields: [
    { name: 'direction', type: "'inbound'", description: 'Data flows FROM Maximus TO VBS' },
    { name: 'frequency', type: 'string', description: 'Batch sync: once or twice daily' },
    { name: 'data_provided', type: 'string[]', description: 'HBL master data, milestone updates, customs status' },
    { name: 'data_not_provided', type: 'string[]', description: 'Primary LSP assignment (from AGS), DO documents' },
  ],
  lifecycle: { warn: 'If Maximus sync fails, HBL data may be stale. No real-time updates.' }
}

// Similar detail for:
// - integration_ags
// - integration_payment
// - integration_email
// - integration_lsp_registry
```

**PDF BRD Has:**
- Section 6.2: Brief paragraph listing what Maximus provides
- No other integrations documented as entities
- No direction, frequency, or "data not provided" documented

**Impact:** Lose detailed integration specifications. Dev team would have to document this separately.

---

### 4. Implementation Details: Deep → Shallow

#### Driver Management

**Intent Model Has:**
```typescript
{
  id: 'lsp:r4',
  description: 'Book pickup directly: ... enter truck and driver details (select existing or add new, scoped to account) ... Requires HBL milestone "unpacked" or later (BR-001).'
}

// Plus driver_record entity with reuse logic
```

**PDF BRD Has:**
- "Provide driver and truck details as part of the booking process"
- No mention of driver reuse, account scoping, or saved drivers

#### Milestone vs Status Orthogonality

**Intent Model Has:**
```typescript
{
  id: 'BR-027',
  description: 'HBL milestone (physical progress) and hbl_status (delegation/booking state) are orthogonal dimensions...',
  source: '2026-03-24 delivery meeting with Matt'
}
```

**PDF BRD Has:**
- ❌ Not documented
- BRD flattens lifecycle into single dimension

#### Booking Reference Requirements

**Intent Model Has:**
```typescript
{
  id: 'BR-032',
  description: 'Both booking reference and HBL reference must be displayed side-by-side in booked HBL table views as dual identifiers...',
  source: '2026-03-24 delivery meeting'
}
```

**PDF BRD Has:**
- ❌ Not documented

---

### 5. Recent Decisions: 2026-03-24 Updates → Lost

**Intent Model Has:**
- BR-027: Milestone vs status orthogonality
- BR-031: Pickup site visibility requirement
- BR-032: Dual-identifier requirement (HBL + booking reference)
- BR-033: Column customization for HBL table views
- OQ-034: AGS integration gap flagged as critical blocker

**PDF BRD Has:**
- ❌ Fixed at BRD v1.5 creation date
- No updates from 2026-03-24 meeting

**Impact:** Lose all decisions made AFTER PDF BRD was finalized.

---

### 6. Forward Planning: P4TC/Gatehouse → Lost

**Intent Model Has:**
```typescript
{
  id: 'p4tc',
  name: 'Party to Collect (P4TC)',
  deferred: true,
  description: 'Deferred to fast follow (BRD v1.5 excludes from Phase 1)...',
  // ... detailed responsibilities for future implementation
}

// Plus journeys: p4tc-books-pickup, p4tc-manages-booking
```

**PDF BRD Has:**
- Brief mention: "One-off booking party self-service flows" as fast follow
- No detailed actor definition or journeys

**Impact:** Lose detailed planning for Phase 2 features.

---

### 7. Data Model Depth: Implementation-Ready → Conceptual

#### HBL Entity Fields

**Intent Model Has (110 lines):**
```typescript
key_fields: [
  { name: 'hbl_number', type: 'string', description: 'Primary identifier...' },
  { name: 'alt_hbl_reference', type: 'string', description: '...', warn: 'Data source TBD (OQ-034)' },
  { name: 'chargeable_weight', type: 'number', description: 'Derived: max(weight_kg, volume_m3). Computed, not stored.' },
  { name: 'do_waived', type: 'boolean', description: 'Derived: true when release_type="free_release" OR under_bond=true' },
  // ... 30+ more fields with types, descriptions, derivation logic
]
```

**PDF BRD Has:**
```
Attributes:
- HBL ID
- Lowest HBL Ref
- Other HBL Ref
- Container Number
...
```

**Impact:** Lose field-level types, derivation logic, computed vs stored distinctions.

---

## 📊 Quantitative Comparison

| Metric | Intent Model v0.8.0 | PDF BRD v1.5 | Loss % |
|--------|-------------------|-------------|--------|
| **Business Rules** | 33 explicit | 0 explicit | 100% ❌ |
| **Entity Lifecycles** | 4 detailed | 1 high-level | 75% ❌ |
| **Integration Entities** | 5 detailed | 1 brief paragraph | 80% ❌ |
| **Actors** | 5 (includes P4TC, Driver, Gatehouse) | 4 | 20% ❌ |
| **Journeys** | 12 | 8 | 33% ❌ |
| **Entities** | 15 | 9 | 40% ❌ |
| **Implementation Detail** | Code-ready | Conceptual | 60% ❌ |
| **Recent Updates** | 2026-03-24 | Fixed at v1.5 | 100% ❌ |
| **Field-level Detail** | Types, derivations, warnings | Names only | 80% ❌ |

**Average Loss: 65% of implementation detail**

---

## 🎯 What You'd Keep (Only These)

### Core Structure from PDF BRD

1. **8 Journeys** (high-level)
   - 4.1 LSP HBL Management and Delegation
   - 4.2 LSP Pickup Booking
   - 4.3 LSP Modify Existing Booking
   - 4.4 ACFS Slot Configuration
   - 4.5 ACFS DO Validation
   - 4.6 ACFS Pickup Verification
   - 4.7 ACFS HBL Visibility and Manual Assignment
   - 4.8 ACFS User Management

2. **4 Actors** (basic definitions)
   - LSP
   - ACFS Admin
   - ACFS User
   - Maximas (External System)

3. **9 Entities** (attribute lists, no lifecycles)
   - HBL
   - DO
   - Booking
   - Booking-HBL Link
   - LSP (as entity, not actor)
   - User
   - Slot
   - Site
   - Payment

4. **39 Functional Requirements** (FR codes)
   - FR-LSP-01 through FR-LSP-24
   - FR-ADM-01 through FR-ADM-15

5. **Assumptions, Dependencies, NFRs** (already added via hybrid approach)

---

## 💥 Side-by-Side Example: HBL Entity

### Intent Model (Implementation-Ready)
```typescript
{
  id: 'hbl',
  name: 'House Bill of Lading (HBL)',
  description: 'Primary tracking unit for a shipment. Sourced from Maximus via periodic batch (once or twice daily). Two orthogonal dimensions: milestone (physical progress) and HBL status (delegation/booking state). BRD v1.5 flattens these into a single lifecycle (Unassigned → Assigned → Delegated → Booked → Collected) — the mapping is: BRD lifecycle = hbl_status + the "collected" milestone. Both dimensions are needed for implementation since an HBL can be e.g. in_yard + delegated simultaneously. HBLs exist in a hierarchy: AGS issues master HBLs (often 500-prefix), freight forwarders issue lower-level HBLs (e.g. 4033-prefix for Mondial). Mostly 1:1 parent-child relationship. The portal primarily deals with the lowest-level HBL as the primary identifier. Full audit trail lives on HBL — shows all hops, delegation chain, assignment changes, and status transitions.',
  key_fields: [
    { name: 'hbl_number', type: 'string', description: 'Primary identifier — lowest-level house bill number from Maximus.' },
    { name: 'milestone', type: "'on_vessel' | 'at_wharf' | 'in_yard' | 'unpacked' | 'collected'", description: 'Physical progress milestone. Linear progression. Sourced from Maximus batch sync.' },
    { name: 'hbl_status', type: "'unassigned' | 'assigned' | 'delegated' | 'booked'", description: 'Delegation/booking status. Separate dimension from milestone. "assigned" means allocated to an LSP. "delegated" means LSP has passed to another party. "booked" means pickup is scheduled.' },
    { name: 'chargeable_weight', type: 'number', description: 'Derived: max(weight_kg, volume_m3) per HBL. Used for fee calculation: chargeable_weight × rate. Computed by backend, not stored independently.' },
    { name: 'do_waived', type: 'boolean', description: 'Derived: true when release_type is "free_release" OR under_bond is true. Booking readiness checks this single field instead of inspecting release_type and under_bond separately.' },
    // ... 25 more fields
  ],
  lifecycle: {
    states: ['on_vessel', 'at_wharf', 'in_yard', 'unpacked', 'collected'],
    transitions: [
      { from: 'on_vessel', to: 'at_wharf', trigger: 'Vessel arrival at port', guard: 'Maximus milestone update' },
      { from: 'at_wharf', to: 'in_yard', trigger: 'Container movement to warehouse', guard: 'Maximus sync' },
      { from: 'in_yard', to: 'unpacked', trigger: 'Container unpacking complete', guard: 'Maximus sync' },
      { from: 'unpacked', to: 'collected', trigger: 'Physical pickup completed', guard: 'Maximus sync after gatehouse confirmation', warn: 'Can take several hours after physical pickup' },
    ],
    warn: 'Milestone (physical progress) and hbl_status (delegation/booking state) are separate dimensions. An HBL can be "in_yard" + "delegated" simultaneously. BRD v1.5 flattens lifecycle but implementation needs both (BR-027).'
  },
}
```

### PDF BRD (Conceptual)
```
HBL (House Bill of Lading)
Attributes:
  - HBL ID
  - Lowest HBL Ref
  - Other HBL Ref
  - Container Number
  - OBL (Ocean Bill of Lading)
  - Description
  - Weight
  - Volume
  - Quantity
  - Pack Type
  - Assigned LSP
  - Next Hop LSP
  - Milestone Status (from Maximas)
  - Customs Status (from Maximas)
  - Storage Fee Flag (from Maximas)
  - HBL Lifecycle Status (Unassigned, Assigned, Delegated, Booked, Collected)
  - DOs Fully Validated Flag
  - Related Booking ID(s)
```

**Difference:** Intent model has types, derivation logic, lifecycle transitions, warnings, and context. PDF BRD has attribute names only.

---

## 🚨 Recommendation: DO NOT NUKE

**Current Approach (Additive Updates):**
- ✅ Keep all 33 business rules
- ✅ Keep all entity lifecycles
- ✅ Keep all integration specs
- ✅ Keep all recent decisions (2026-03-24)
- ✅ Keep all implementation detail
- ➕ Add 5 missing pieces from PDF BRD

**Hard Nuke Approach:**
- ❌ Lose 65% of implementation detail
- ❌ Lose all business rules
- ❌ Lose all recent updates
- ❌ Lose all lifecycle state machines
- ❌ Lose all integration specs
- ❌ Dev team has to re-infer everything

---

## Can We Diff It?

Yes! Here's a simplified diff showing just the business rules section:

```diff
# Intent Model v0.8.0 (BEFORE NUKE)
business_rules: [
+ { id: 'BR-001', description: 'Booking requires HBL milestone "unpacked" or later', applies_to: ['hbl', 'booking'], source: 'BRD v1.5 Section 4.2 Step 2' },
+ { id: 'BR-002', description: 'HBL must be fully customs cleared for booking', applies_to: ['hbl', 'booking'], source: 'BRD v1.5 Section 4.2 Step 2' },
+ { id: 'BR-003', description: 'DOs must be uploaded and validated or under-bond flag set', applies_to: ['hbl', 'delivery_order', 'booking'], source: 'BRD v1.5 Section 4.2 Step 2' },
+ { id: 'BR-004', description: 'If HBL is delegated, original LSP cannot book directly on that HBL', applies_to: ['hbl', 'delegation'], source: 'BRD v1.5 Section 2.2', warn: 'Delegation is mutually exclusive with direct booking by the delegating party' },
+ // ... BR-005 through BR-033
]

# PDF BRD v1.5 (AFTER NUKE)
- (Business rules are implicit in journey descriptions, not explicit)
```

**Result:** 100% of business rules deleted.

---

## Verdict

**Hard nuke = Catastrophic data loss**

Your intent model is a **superset** of the PDF BRD, not a subset. Nuking would throw away months of refinement and turn implementation-ready specs back into conceptual documents.

**Stick with additive updates.**
