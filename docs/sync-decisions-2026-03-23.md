# Intent Model Sync Decisions — 2026-03-23

Cross-referencing intent model v0.7.1 against BRD v1.5, Miro process flow, and team meeting notes. Decisions made by Rahul.

---

## Decisions

### 1. P4TC (Party to Collect) — KEEP, MARK DEFERRED
- **Source conflict**: Intent model = Phase 1 actor. BRD = fast follow.
- **Decision**: Keep P4TC in the model but mark as deferred/fast follow.
- **Rationale**: Design work is done, will be needed soon. No reason to delete.

### 2. Driver Record Entity — KEEP, MARK DEFERRED
- **Source conflict**: Intent model = Phase 1 entity. BRD + meeting = booking attributes only for Phase 1.
- **Decision**: Keep entity but mark as deferred/fast follow. Driver fields remain on Booking entity for Phase 1.
- **Rationale**: Entity is well-defined and needed for fast follow. No conflict since driver fields already exist on Booking.

### 3. Booking States — KEEP AS-IS (6 states)
- **Source conflict**: Intent model = 6 states. BRD = 4 states.
- **Decision**: Keep all 6 (draft, booked, pending_processing, processed, collected, cancelled).
- **Rationale**: BRD simplified for stakeholder readability. The extra states (draft, pending_processing) are real system states needed for dev. Mapping: BRD "Open" = booked, BRD "Complete" = collected.

### 4. HBL Dimensions — KEEP TWO DIMENSIONS, ADD MAPPING NOTE
- **Source conflict**: Intent model = two orthogonal dimensions (milestone + hbl_status). BRD = one flattened lifecycle.
- **Decision**: Keep two dimensions. Add a note mapping to the BRD's single lifecycle view.
- **Rationale**: Milestone and status are genuinely independent (e.g. in_yard + delegated). Flattening loses expressiveness. Mapping note prevents confusion.

### 5. New Entities — ADD ALL THREE
- **Source**: BRD has Payment, User, and Booking–HBL Link entities not in intent model.
- **Decision**: Add all three.
  - **Payment**: Payment ID, Booking ID, Amount, Gateway, Status, Timestamp
  - **User**: User ID, Username, Role (LSP/Admin/User), Linked LSP ID, Status
  - **Booking–HBL Link**: Booking ID, HBL ID, Chargeable Weight, Rate, Per-HBL Fee
- **Rationale**: Payment and User back existing journeys that had no entity. Booking–HBL Link makes per-HBL fee breakdown explicit (BR-019 is a business rule, not just implementation).

### 6. Storage Fee Flag on HBL — SKIP
- **Source**: BRD adds a Storage Fee Flag. Intent model has last_free_storage_date.
- **Decision**: Don't add. Derivable from existing field.
- **Rationale**: `storage_fee_flag` is just `today > last_free_storage_date`. Adding a derived field alongside its source creates two things to sync for no reason. Display concern, not model concern.

### 7. Gatehouse Actor — KEEP, MARK DEFERRED
- **Source conflict**: Intent model = Phase 1 actor. BRD + meeting = not mentioned.
- **Decision**: Keep but mark as deferred/fast follow.
- **Rationale**: Gatehouse is part of the pickup verification flow. BRD didn't call it out separately but didn't explicitly remove it either.

### 8. AGS Integration + OQ-034 — KEEP, FLAG BRD GAP
- **Source conflict**: Intent model = separate integration entity + blocker. BRD = not mentioned (only Maximas).
- **Decision**: Keep AGS integration. Add note that BRD doesn't reference it. Needs confirmation from Roni/Matt.
- **Rationale**: Maximas doesn't provide HBL hierarchy or FF party assignments. BRD has fields that need AGS data (Other HBL Ref, Assigned LSP) but doesn't acknowledge the source. OQ-034 remains open — someone needs to answer it before dev builds HBL assignment.

---

## Summary of Changes to Apply

### Mark as deferred/fast follow
- P4TC actor + journey (journey 6: "P4TC Books a Pickup")
- Driver Record entity
- Gatehouse actor

### Add to intent model
- Payment entity (6 fields)
- User entity (5 fields)
- Booking–HBL Link entity (5 fields)

### Add notes
- HBL entity: mapping note explaining how two dimensions map to BRD's single lifecycle
- AGS integration: note that BRD v1.5 does not reference AGS — confirm with Roni/Matt

### No change
- Booking states (keep 6)
- HBL dimensions (keep two)
- Storage Fee Flag (skip — derivable)

---

## Pending Roni Confirmation
- **AM/PM slot simplification** — meeting says simplified to AM/PM, BRD still describes flexible time windows. Which is correct?
- **AGS integration** — is Maximas-only the plan for Phase 1, with manual assignment covering the gap?
