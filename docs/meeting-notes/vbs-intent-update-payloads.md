# Intent Model Update Payloads

Structured updates to apply to `vbs-intent/src/domain/intent-model/model.ts` based on PM clarification session.

Organized by section. Each payload shows the exact field path, current value, and new value.

---

## Batch 1: Corrections

### 1.1 — HBL lifecycle states (Q8, Q9)

Remove `created`, `delegated`, `booked`, `under_bond` from milestone states. Replace with confirmed milestones. Add `in_yard`. Keep `delegated` and `booked` as HBL statuses (separate concern — see new field below).

```typescript
// entities[0].lifecycle.states
// BEFORE:
['created', 'at_wharf', 'unpacked', 'delegated', 'booked', 'under_bond', 'collected']

// AFTER (milestones only):
['on_vessel', 'at_wharf', 'in_yard', 'unpacked', 'collected']
```

Add a new key field for HBL status (separate from milestones):

```typescript
// entities[0].key_fields — ADD:
{
  name: 'hbl_status',
  type: "'unassigned' | 'delegated' | 'booked'",
  description: 'Pickup workflow status. Separate from milestone. Tracks delegation and booking state.'
}
```

Add under-bond as a flag (not a state):

```typescript
// entities[0].key_fields — ADD:
{
  name: 'under_bond',
  type: 'boolean',
  description: 'Flag set manually by WFF or FF staff. Indicates shipment needs to move between warehouses/FFs. Under-bond HBLs skip DO requirement. ACFS can also set this flag.',
  warn: 'Underbond concept needs deeper clarification from PM — current understanding is from a brief conversation.'
}
```

### 1.2 — HBL lifecycle transitions (Q8, Q10)

Replace transitions to match corrected milestone states:

```typescript
// entities[0].lifecycle.transitions
// REPLACE ALL WITH:
[
  { from: 'on_vessel', to: 'at_wharf', trigger: 'Vessel arrives at port', guard: 'Maximas status update' },
  { from: 'at_wharf', to: 'in_yard', trigger: 'Shipment moved from wharf to yard', guard: 'Maximas status update' },
  { from: 'in_yard', to: 'unpacked', trigger: 'Container unpacked at warehouse', guard: 'Maximas status update' },
  { from: 'unpacked', to: 'collected', trigger: 'Goods physically picked up from warehouse', guard: 'Booking processed + all validations complete' },
]
```

Note: `delegated → booked` and `unpacked → booked` transitions are HBL status changes, not milestone transitions. These are tracked via `hbl_status` field.

### 1.3 — DO hierarchy correction (Q13)

```typescript
// business_rules[2] (BR-003)
// BEFORE:
{
  id: 'BR-003',
  description: 'DO rules follow a 3-level hierarchy: WFF → FF → Carrier/Customer. Each level can upload a DO that applies to the levels below.',
  applies_to: ['hbl', 'wff', 'ff', 'carrier', 'acfs'],
  source: 'BRD s4.4',
}

// AFTER:
{
  id: 'BR-003',
  description: 'DO rules follow a 3-level hierarchy: WFF → FF → Carrier/Customer. Each level must upload their own DO independently — there is no inheritance or cascading. The bottom-most party must have all DOs present. Exception: free release removes the DO requirement for that specific tier.',
  applies_to: ['hbl', 'wff', 'ff', 'carrier', 'acfs'],
  source: 'BRD s4.4, confirmed PM clarification, 2026-03-17',
}
```

### 1.4 — Remove "request missing HBL" from WFF (Q25)

```typescript
// actors[0].responsibilities — wff:r2
// BEFORE:
{ id: 'wff:r2', description: 'Search by HBL# and request missing HBLs be added for pickup.', edge: 'No defined flow for what happens after request — manual ACFS process?' }

// AFTER:
{ id: 'wff:r2', description: 'Search by HBL# to find specific shipments.' }
```

---

## Batch 2: Gap Fills (resolve warnings)

### 2.1 — WFF delegate vs book (Q1)

```typescript
// actors[0].responsibilities — wff:r3 and wff:r4
// BEFORE:
{ id: 'wff:r3', description: 'Delegate booking responsibility to an existing FF or Transport Carrier.', warn: 'BRD frames delegation as FF action, flow shows WFF delegating directly. Needs confirmation.' }
{ id: 'wff:r4', description: 'Book pickup directly without delegating — select slot, pay, add driver/truck details.', warn: 'Can WFF book AND delegate? Or is it one or the other?' }

// AFTER (warnings removed, clarified):
{ id: 'wff:r3', description: 'Delegate booking responsibility to an existing FF or Transport Carrier. Per HBL — if delegated, WFF cannot also book directly on that same HBL.' }
{ id: 'wff:r4', description: 'Book pickup directly without delegating — select slot, pay, add driver/truck details. Per HBL — if booking directly, WFF cannot also delegate that same HBL. Either/or per HBL.' }
```

### 2.2 — FF auth (Q2)

```typescript
// actors[1].auth
// BEFORE:
'Username + password assumed — not specified in BRD.'

// AFTER:
'Magic link + OTP. WFF delegates and a secure link is sent to the FF nominated email. FF clicks link, receives OTP to same email, enters OTP, and accesses the portal scoped to their assigned shipments. No account creation. Note: PM exploring an alternate generic "booking party" login model — pending client decision.'
```

### 2.3 — FF carrier directory warning (Q5)

```typescript
// actors[1].responsibilities — ff:r3
// BEFORE:
{ id: 'ff:r3', description: 'Nominate/select a carrier from existing relationships.', warn: 'How are "existing relationships" maintained? Is there a carrier directory?' }

// AFTER:
{ id: 'ff:r3', description: 'Nominate/select a carrier from the ACFS-maintained party registry (one-time bulk upload). Use search + autocomplete to find parties.' }
```

### 2.4 — Carrier auth (Q3)

```typescript
// actors[2].auth
// BEFORE:
'Username + password assumed.'

// AFTER:
'Magic link + OTP. Same mechanism as FF — secure link sent on delegation, OTP to verify. No account creation. All external parties after WFF use the same auth mechanism.'
```

### 2.5 — ACFS auth (Q24)

```typescript
// actors[3].auth
// BEFORE:
'Internal SSO / admin credentials.'

// AFTER:
'SSO via OAuth/Okta (already exists in ACFS infrastructure).'
```

### 2.6 — Release type field warning (Q11 — partial, keep warning)

```typescript
// entities[0].key_fields — release_type
// BEFORE:
{ name: 'release_type', type: "'free_release' | 'under_bond'", description: 'Determines DO requirements.', warn: 'Exact release types and their rules need confirmation.' }

// AFTER:
{ name: 'release_type', type: "'free_release' | string", description: 'Determines DO requirements. Free release = standing arrangement between two parties (e.g., AGS ↔ Geodis) where no DO is needed for that tier.', warn: 'Full list of release types needed from client. Free release confirmed. Underbond is a separate flag, not a release type.' }
```

### 2.7 — Fee amount warning (Q15 — partial, keep warning)

```typescript
// entities[1].key_fields — fee_amount
// BEFORE:
{ name: 'fee_amount', type: 'number', description: 'Calculated fee (minimum + volumetric).', warn: 'Fee method (flat vs percentage) needs business decision.' }

// AFTER:
{ name: 'fee_amount', type: 'number', description: 'Calculated per HBL individually (not total weight), then summed. Flat minimum + per-HBL volumetric charge. Uses max of weight vs volume per HBL.', warn: 'Flat rate vs percentage still undecided by client. Per-HBL calculation confirmed.' }
```

### 2.8 — BR-002 under-bond warning (Q12)

```typescript
// business_rules[1] (BR-002)
// BEFORE:
{
  id: 'BR-002',
  description: 'Under-bond HBLs skip the DO requirement. Verification happens outside the portal by ACFS.',
  applies_to: ['hbl'],
  source: 'BRD s4.3',
  warn: 'How does the portal know an HBL is under-bond? Maximas field?',
}

// AFTER:
{
  id: 'BR-002',
  description: 'Under-bond HBLs skip the DO requirement. Under-bond status is flagged manually by WFF or FF staff in the portal. ACFS internal staff can also flag it. Verification happens outside the portal by ACFS; the portal records the verification.',
  applies_to: ['hbl'],
  source: 'BRD s4.3, confirmed PM clarification, 2026-03-17',
}
```

### 2.9 — Journey step 2 warning (Q16)

```typescript
// journeys[0].steps[1]
// BEFORE:
{ order: 2, title: 'Select HBLs for pickup', detail: 'Carrier selects one or more HBLs to group into a single booking.', warn: 'Can HBLs from different WFFs be combined in one booking?' }

// AFTER:
{ order: 2, title: 'Select HBLs for pickup', detail: 'Carrier selects one or more HBLs to group into a single booking. HBLs from different WFFs can be combined.', warn: 'Cross-WFF booking confirmed but may force auth model change from magic links to proper login. Pending client decision.' }
```

### 2.10 — Journey step 5 warning (Q17)

```typescript
// journeys[0].steps[4]
// BEFORE:
{ order: 5, title: 'Pay booking fee', detail: 'System calculates fee (minimum charge + volumetric per HBL). Carrier pays.', warn: 'Payment integration not specified — stub for PoC.' }

// AFTER:
{ order: 5, title: 'Pay booking fee', detail: 'System calculates fee (minimum charge + volumetric per HBL). Carrier pays via Stripe embedded checkout. No custom payment UI — use Stripe interface directly.' }
```

### 2.11 — Unpacked → booked transition warning (Q10)

Already handled in Batch 1.2 (transitions rewrite). The `warn` on `unpacked → booked` is removed. Direct booking by WFF is always valid.

---

## Batch 3: New fields and entities

### 3.1 — New HBL key fields

```typescript
// entities[0].key_fields — ADD these:
{ name: 'weight_kg', type: 'number', description: 'Weight in kilograms. Used alongside volume for fee calculation and load display.' },
{ name: 'customs_clearance_status', type: 'string', description: 'Latest clearance status from Maximas. Display only — no portal-side ABF record.' },
{ name: 'storage_fee_due', type: 'boolean', description: 'Flag indicating outstanding storage cost. Derived from last_free_storage_date. Not the amount — just a visual indicator.' },
{ name: 'last_free_storage_date', type: 'date | null', description: 'Last date before storage fees apply. Used to calculate storage_fee_due flag.' },
```

### 3.2 — New Booking key fields

```typescript
// entities[1].key_fields — ADD these:
{ name: 'booking_reference', type: 'string', description: 'Human-readable booking reference number. Separate from booking_id. Shown at top of booked HBL detail view.' },
{ name: 'site', type: 'string', description: 'ACFS site where pickup occurs. Slot config is per-site.' },
{ name: 'payment_status', type: "'paid' | 'unpaid'", description: 'Payment status. If paid (via Stripe), slot is confirmed. Confirmation transitively implies payment.' },
```

### 3.3 — New Delivery Order entity

```typescript
// entities — ADD new entity:
{
  id: 'delivery_order',
  name: 'Delivery Order (DO)',
  description: 'Release authority document. Each tier in the hierarchy must upload their own DO independently. Must be explicitly mapped to specific HBLs — not bulk uploaded.',
  key_fields: [
    { name: 'do_id', type: 'string', description: 'System-generated unique ID.' },
    { name: 'document_file', type: 'File', description: 'Uploaded PDF/document.' },
    { name: 'associated_hbls', type: 'string[]', description: 'HBLs this DO is mapped to. Must be explicitly mapped per HBL — compliance/legal/audit requirement.' },
    { name: 'issuer', type: 'string', description: 'Party who uploaded this DO (WFF, FF, or Carrier).' },
    { name: 'tier_level', type: '1 | 2 | 3', description: 'Level in the DO hierarchy. 1=WFF, 2=FF, 3=Carrier.' },
    { name: 'validation_status', type: "'not_checked' | 'pre_checked' | 'validated' | 'not_required' | 'overridden'", description: 'Validation state. Pre-checked by ACFS before arrival, validated at pickup, not required for free release/under-bond, overridden by authorised ACFS role.' },
  ],
  lifecycle: {
    states: ['not_provided', 'uploaded', 'pending_validation', 'pre_checked', 'validated', 'not_required', 'overridden'],
    transitions: [
      { from: 'not_provided', to: 'uploaded', trigger: 'Party uploads DO document' },
      { from: 'uploaded', to: 'pending_validation', trigger: 'DO awaiting ACFS manual review' },
      { from: 'pending_validation', to: 'pre_checked', trigger: 'ACFS validates DO before driver arrival (HBL reference match check)' },
      { from: 'pending_validation', to: 'validated', trigger: 'ACFS validates DO at time of driver arrival' },
      { from: 'not_provided', to: 'not_required', trigger: 'Free release or under-bond applies — no DO needed' },
      { from: 'not_provided', to: 'overridden', trigger: 'Authorised ACFS role applies override. Audit trail + reason required. One-time per HBL, lives until collected.' },
    ],
  },
}
```

### 3.4 — New Pickup Window entity

```typescript
// entities — ADD new entity:
{
  id: 'pickup_window',
  name: 'Pickup Window',
  description: 'Configurable time slot for pickup bookings. Managed by ACFS per site.',
  key_fields: [
    { name: 'window_id', type: 'string', description: 'System-generated unique ID.' },
    { name: 'site', type: 'string', description: 'ACFS site this window belongs to.' },
    { name: 'days_of_week', type: 'string[]', description: 'Days this window is available (e.g., Monday-Friday).' },
    { name: 'start_time', type: 'time', description: 'Slot start time.' },
    { name: 'end_time', type: 'time', description: 'Slot end time.' },
    { name: 'booking_cutoff', type: 'datetime', description: 'Specific date and time after which booking is not allowed. NOT hour-based — configured as an absolute date/time per slot.' },
    { name: 'change_cutoff', type: 'datetime', description: 'Specific date and time after which changes incur a fee. Same config approach as booking cutoff.' },
    { name: 'density_indicator', type: 'number', description: 'Threshold value for density visualisation. System divides by 3 to show low/moderate/high density. Does NOT block booking — purely informational.' },
    { name: 'overlapping_allowed', type: 'boolean', description: 'Multiple windows can overlap in the same time period. Default true.' },
  ],
  lifecycle: {
    states: ['active', 'blacked_out'],
    transitions: [
      { from: 'active', to: 'blacked_out', trigger: 'Holiday calendar or manual blackout by ACFS' },
      { from: 'blacked_out', to: 'active', trigger: 'Blackout period ends or manually lifted' },
    ],
  },
}
```

---

## Batch 4: Constraints updates

### 4.1 — Replace C-001 (capacity)

```typescript
// constraints[0]
// BEFORE:
{ id: 'C-001', constraint: 'Pickup windows have finite capacity per site per time slot. Overbooking is not allowed.', type: 'capacity' }

// AFTER:
{ id: 'C-001', constraint: 'Pickup windows use a density indicator (configurable threshold per slot) instead of hard capacity limits. Density is visualised as low/moderate/high but does not block booking. No overbooking prevention in Phase 1.', type: 'capacity' }
```

### 4.2 — Update C-002 (pricing/cutoffs)

```typescript
// constraints[1]
// BEFORE:
{ id: 'C-002', constraint: 'Booking changes after cut-off time incur a change fee. No-shows incur a rebooking fee.', type: 'pricing' }

// AFTER:
{ id: 'C-002', constraint: 'Booking changes after cut-off time may incur a change fee (if configured). No-shows require rebooking by ACFS admin only (free of charge for Phase 1). No self-service rebooking for carriers in Phase 1. Cutoffs are configured as absolute date/time per slot, not hour-based.', type: 'pricing' }
```

### 4.3 — Add new constraints

```typescript
// constraints — ADD:
{ id: 'C-003', constraint: 'ACFS cannot change slot configuration for slots that already have bookings (Phase 1).', type: 'temporal' },
{ id: 'C-004', constraint: 'Slot configuration is per-site, not global. Includes time windows, density indicator, cutoffs, and blackout/holiday calendar.', type: 'access' },
{ id: 'C-005', constraint: 'Refunds are handled entirely outside the portal. The portal is refund-agnostic.', type: 'pricing' },
{ id: 'C-006', constraint: 'FOC (free of charge) rebooking is ACFS admin only. Overrides all fees. Reason/justification required for audit trail.', type: 'pricing' },
{ id: 'C-007', constraint: 'Data from Maximas is periodic batch (once or twice daily). Not real-time. Portal fetches HBL data from custom cargo table starting 7 days before vessel arrival.', type: 'temporal' },
{ id: 'C-008', constraint: 'Single app with role-based routing. WFF uses username/password. FF, Carrier, and one-off customers use magic link + OTP (no account). ACFS and Gatehouse use SSO via OAuth/Okta.', type: 'access' },
```

---

## Batch 5: Open questions updates

### 5.1 — Resolve OQ-001

```typescript
// open_questions[0]
// BEFORE:
{ id: 'OQ-001', question: 'How is Tier-2 FF data sourced?...', reason: '...', status: 'open' }

// AFTER:
{ id: 'OQ-001', question: 'How is Tier-2 FF data sourced? Are they registered in Maximas or only in the portal?', reason: 'Delegation flow depends on knowing which FFs exist in the system.', status: 'resolved', resolution: 'Global registry maintained by ACFS. One-time bulk upload from AGS portal/party manager into the portal local DB. No Maximas sync. Manual assignment by WFF only.' }
```

### 5.2 — Update OQ-002 (partially resolved)

```typescript
// open_questions[1]
// BEFORE:
{ id: 'OQ-002', question: 'What is the exact fee method...', reason: '...', status: 'open' }

// AFTER:
{ id: 'OQ-002', question: 'What is the exact fee method — flat rate per HBL or percentage of declared value?', reason: 'Fee calculation logic in the booking flow depends on this decision.', status: 'open', resolution: 'Partially answered: flat minimum + per-HBL volumetric charge (calculated per HBL individually, then summed). But flat rate vs percentage is still undecided by client.' }
```

### 5.3 — Add new open questions

```typescript
// open_questions — ADD:
{
  id: 'OQ-003',
  question: 'What is the full list of release types and their DO rules?',
  reason: 'Only free release is confirmed. Underbond is a flag, not a release type. Need complete list from client.',
  status: 'open',
},
{
  id: 'OQ-004',
  question: 'Will the auth model for FF/Carrier change from magic links to a proper login?',
  reason: 'Cross-WFF booking (confirmed) means carriers need to see HBLs from multiple WFFs. Magic links are scoped to a single delegation. PM exploring a generic "booking party" login as alternative.',
  status: 'open',
},
{
  id: 'OQ-005',
  question: 'What are the confirmed milestone statuses from the client?',
  reason: 'Current list (on_vessel, at_wharf, in_yard, unpacked, collected) is based on PM knowledge. Client has been asked to provide the confirmed list.',
  status: 'open',
},
```

---

## New business rules to add

```typescript
// business_rules — ADD:
{
  id: 'BR-004',
  description: 'Per HBL, a WFF either delegates OR books directly — never both on the same HBL.',
  applies_to: ['hbl', 'wff'],
  source: 'PM clarification, 2026-03-17',
},
{
  id: 'BR-005',
  description: 'DO override by ACFS: only certain ACFS roles can override. Audit trail with reason is required. Override is one-time per HBL and lives until the HBL is collected.',
  applies_to: ['hbl', 'acfs'],
  source: 'PM clarification, 2026-03-17',
},
{
  id: 'BR-006',
  description: 'Each DO must be explicitly mapped to specific HBLs. Bulk upload without per-HBL mapping is not allowed. This is a compliance, legal, and audit requirement.',
  applies_to: ['hbl', 'delivery_order'],
  source: 'PM clarification, 2026-03-17 (design discussion)',
},
{
  id: 'BR-007',
  description: 'Storage fee timer starts after unpacked status. Flag storage_fee_due is derived from last_free_storage_date. Portal shows flag only (not the amount) for Phase 1.',
  applies_to: ['hbl'],
  source: 'PM clarification, 2026-03-17',
},
{
  id: 'BR-008',
  description: 'ACFS can partially process a booking. If some HBLs have not cleared customs, the cleared ones can be processed and picked up. Blocked HBLs must be rebooked separately.',
  applies_to: ['booking', 'acfs'],
  source: 'PM clarification, 2026-03-17',
},
```

---

## Summary

| Batch | Items | Type |
|-------|-------|------|
| 1 | 4 corrections | Direct edits — fix wrong data |
| 2 | 11 gap fills | Resolve warnings, update descriptions |
| 3 | 4 new fields + 2 new entities | Add DO entity, Pickup Window entity, HBL/Booking fields |
| 4 | 2 updates + 6 new constraints | Capacity, cutoffs, refunds, FOC, data freshness, auth |
| 5 | 2 resolved + 3 new open questions | Close answered OQs, add new pending items |
| — | 5 new business rules | BR-004 through BR-008 |
