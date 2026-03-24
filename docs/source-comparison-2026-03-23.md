# VBS Intent Model — Source Comparison

Cross-reference of the intent model (v0.7.1) against three external sources to track alignment gaps, scope decisions, and items needing reconciliation.

> **Decisions recorded**: See [sync-decisions-2026-03-23.md](sync-decisions-2026-03-23.md) for all 8 reconciliation decisions made on 2026-03-23.

---

## 1. BRD v1.5 (Roni — Final)

**Source**: `VBS_Pickup_BRD(Final)_V1.5.pdf`
**Status**: Final scope for customer approval

### Aligned

- Core actor structure (LSP, ACFS Admin, ACFS User) matches intent model
- HBL as the central entity with milestone + lifecycle tracking
- Delegation flow: LSP selects HBLs → searches target LSP → system sends notification
- Booking flow: select HBLs → validate readiness → calculate fees → select slot → driver/truck → T&Cs → pay → confirm
- Booking modification rules: driver/truck anytime, slot/HBL before cutoff, fee changes via ACFS only
- Slot configuration: backend-only for Phase 1, relative cutoffs, heatmap density indicator
- DO validation: HBL-centric, manual by ACFS, valid/invalid marking, correction notifications
- Pickup verification: search by booking ref/driver/truck → review → mark processed
- User management: ACFS creates LSP accounts + internal users, 72-hour welcome link expiry
- Cancellation: LSP cancels own, ACFS cancels any, refund handled offline
- Fee formula: chargeable weight × rate + minimum booking charge

### New in BRD (not in intent model)

- **Payment entity** — Payment ID, Booking ID, Amount, Gateway, Status, Timestamp
- **User entity** — User ID, Username, Role (LSP/Admin/User), Linked LSP ID, Status
- **Booking–HBL Link** as explicit junction table with Chargeable Weight, Rate, Per-HBL Fee
- **Site entity** gets Location (optional) and Status attributes
- **Other HBL Reference** field on HBL
- **Storage Fee Flag** on HBL (from LFD — informational, doesn't drive fee calculation)
- **Maximas treated as an actor** (external system participant), not just an integration
- **Formal FR numbering**: FR-LSP-01 through FR-LSP-24, FR-ADM-01 through FR-ADM-15

### In intent model but missing from BRD

- **P4TC actor and all related flows** — BRD defers to fast follow
- **Gatehouse actor** — not mentioned at all
- **AGS Data Feed integration** — BRD only references Maximas
- **LSP Registry Seed** one-time integration
- **OQ-034** (HBL hierarchy data source) — not tracked in BRD
- **Under-bond flag and verification** workflow
- **Blackout dates / calendar blocking** for slots
- **Email notification trigger list** — BRD mentions email in assumptions but no detail

### Conflicts

| Topic | Intent Model | BRD v1.5 |
|-------|-------------|----------|
| **Driver record persistence** | Phase 1 entity, account-scoped per LSP | Not Phase 1 — "will be introduced in the fast follow/next phase" |
| **Booking states** | 6 states (draft → booked → pending_processing → processed → collected → cancelled) | 4 states (Open → Processed → Complete → Cancelled) |
| **HBL dimensions** | Two orthogonal: milestone (5) + hbl_status (4) | Flattened into one lifecycle (Unassigned → Assigned → Delegated → Booked → Collected) with milestones as Maximas data |
| **P4TC scope** | Full Phase 1 actor with journey | Explicitly excluded from Phase 1 |

---

## 2. Miro Process Flow Diagram

**Source**: `ACFS vbs (6).pdf`
**Status**: Earlier artifact — likely from discovery/workshop phase

### Structure

Four swim lanes:
1. **ACFS Admin/Internal User** — multiple workflow rows (user mgmt, HBL assignment, DO validation, pickup verification, slot config, booking management)
2. **Logistics Service Provider (LSP)** — login → HBLs → delegate or book → payment → confirmation
3. **One-Off Booking Party** — full flow with email link → OTP → view → book
4. **Side panels** — User Categorisation + dashboard wireframes

### Aligned with BRD & Intent Model

- LSP flow matches: login → view HBLs → select → delegate or book → driver/truck → payment → confirmation
- ACFS admin workflows cover same ground: user mgmt, HBL assignment, DO validation, pickup verification
- Decision diamonds map to BR-001 validation checks (customs cleared? DO uploaded? milestone = unpacked?)
- "Fail-safe manual assignment" callout matches intent model's remedial journey and BRD 4.7

### Unique to Diagram

- **One-Off Booking Party is fully diagrammed** — complete flow present, contradicts BRD's Phase 1 descope
- **Dashboard wireframes**:
  - ACFS Internal: tabs for All / Unassigned / Assigned+Delegated / Booked / Completed
  - LSP: tabs for All / Assigned / Delegated / Booked / Completed
  - Both searchable by HBL # or booking ref #
- **Red circles** at various steps — appear to be open questions/review points (now mostly resolved)
- **"Could have / nice to have"** annotation on auto-assignment fail-safe

### Missing from Diagram

- Booking modification flow (no explicit modify path)
- Booking cancellation flow
- Fee calculation formula detail
- Slot cutoff rules
- Driver record persistence

### Key Insight

The diagram predates the BRD's scope cut. P4TC was originally in Phase 1 (fully diagrammed), then removed in the BRD. This was confirmed in the team meeting as "features parked based on technical constraints."

---

## 3. Team Meeting Notes (Post-Ranjith Interview)

**Source**: Team sync notes — after requirements finalization with customer
**Status**: Internal alignment checkpoint

### Scope Decisions Confirmed

- BRD v1.5 is the **final scope for customer approval**
- "Certain UI components and features parked based on technical constraints" — explains P4TC descope
- Development proceeding despite unsigned contract
- 6–8 week delivery commitment unchanged

### Items That Explain Gaps

| Meeting Note | Explains |
|-------------|----------|
| "Features parked based on technical constraints" | P4TC / One-Off Booking Party cut from BRD |
| "Driver details treated as booking attributes, not separate managed entities" | Driver record persistence deferred from Phase 1 |
| "Booking slots simplified to AM/PM options" | **Not reflected in BRD or intent model** — both still describe flexible time windows |
| "Intent model consolidated from 30+ rules to 21" | Model evolution confirmed (was 30+ in early versions) |
| "Freight forwarder assignment rules unclear" | Maps to OQ-034 (AGS data feed / HBL hierarchy) |
| "Driver database may exist but unclear" | Why driver management is deferred |

### New Information (not in BRD or intent model)

- **AM/PM slot simplification** — if agreed, BRD and intent model both need updating
- **Christie assigned to data model analysis** — output unknown, could affect entity definitions
- **Multi-tenant capability needed** for future customer rollout — not tracked anywhere
- **Orchestrator approach** for backend development — architecture decision not captured

### Action Items from Meeting

- [ ] Christie to complete data model analysis
- [ ] Technical validation session with Ranjith and team
- [ ] Rahul to update UI based on final BRD changes
- [ ] Data discovery workshop with ACFS IT team
- [ ] Customer presentation once technical validation complete

---

## Reconciliation Summary

### Must resolve before development

| # | Issue | Source | Action |
|---|-------|--------|--------|
| 1 | **P4TC scope** — intent model includes it, BRD excludes it | BRD vs Intent Model | Flag P4TC as Phase 2 in intent model, or confirm with Roni |
| 2 | **Driver record persistence** — intent model says Phase 1, BRD and meeting say no | BRD + Meeting vs Intent Model | Update intent model to treat driver as booking attribute only |
| 3 | **AM/PM slot simplification** — meeting says simplified, BRD and model say flexible windows | Meeting vs BRD + Intent Model | Confirm with Roni — does BRD need updating? |
| 4 | **AGS integration** — intent model tracks it (blocker OQ-034), BRD ignores it | Intent Model vs BRD | Confirm whether AGS is still relevant or replaced by Maximas-only approach |

### Should add to intent model

| # | Item | Source |
|---|------|--------|
| 5 | Payment entity (ID, Booking ID, Amount, Gateway, Status, Timestamp) | BRD |
| 6 | User entity (ID, Username, Role, Linked LSP, Status) | BRD |
| 7 | Booking–HBL junction with fee breakdown (Chargeable Weight, Rate, Per-HBL Fee) | BRD |
| 8 | Storage Fee Flag on HBL | BRD |
| 9 | Multi-tenant capability as future constraint | Meeting |

### Nice to capture

| # | Item | Source |
|---|------|--------|
| 10 | Dashboard wireframe structure (tab layout, search fields) | Miro diagram |
| 11 | Gatehouse actor status — still planned or cut? | Intent model (present) vs BRD (absent) |
| 12 | Christie's data model output — compare against entity definitions | Meeting |
