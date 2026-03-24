# Intent Model → Screens: Process & Drift Policy
**Date:** 2026-03-19
**Context:** Intent model v0.5.0 is stable. 3 screens already built. Team needs more screens. No Figma dependency — designing directly in code.

> **For setup and role-specific workflows:** See **[Getting Started Guide](project/getting-started.md)** for complete setup instructions, cross-role workflows, and how the intent model connects to the portal code.

---

## Current state

- Intent model v0.5.0 is the alignment artifact — actors, entities, journeys, rules, integrations, open questions all documented and synced with Miro board and meeting transcript.
- 3 screens already built and delivered to the team.
- Team is waiting for more screens.
- Designs are built directly in code (Pencil / Next.js) — no Figma handoff step.

---

## Process: Intent model → Screens

### Step 1: Screen inventory (do this now)

Map every journey in the model to the distinct screens/views needed. One line per screen. This is the backlog for design work.

Example mapping:

| Journey | Screens needed |
|---|---|
| LSP views assigned HBLs | HBL list view (table with all fields from model) |
| LSP delegates shipments | Delegation modal (LSP search/select or email-only for one-off) |
| LSP books pickup | Booking readiness check → DO upload → Load calc + pricing → Slot selection → Driver details → T&Cs → Payment → Confirmation |
| LSP manages booking | Booking list → Booking detail → Edit modal (driver/truck, date/time, HBLs) |
| LSP cancels booking | Cancel confirmation within booking detail |
| P4TC accesses portal | OTP verification screen → HBL list (scoped) |
| P4TC books pickup | Same as LSP booking flow minus saved drivers |
| P4TC manages booking | Contact ACFS message (no self-service) |
| ACFS assigns HBLs | Unassigned FAK list → Assignment modal (remedial) |
| ACFS configures slots | Site selector → Slot template form (days, times, cutoffs, heat map) → Holiday calendar overlay → Slot overview |
| ACFS manages booking | Booking search → Booking detail (view + edit) → Update notification |
| ACFS cancels booking | Cancel with reason within booking detail |
| ACFS validates DOs | Unvalidated DO list (HBL-centric) → DO detail + HBL comparison → Mark valid/invalid |
| ACFS verifies pickup | Booking search → Verification detail (DO status + audit trail) → Mark processed/flag |
| ACFS creates user | User type selection → User detail form (LSP vs ACFS fields) → Welcome email sent |
| ACFS updates user | User search → Edit form |
| ACFS removes user | Archive confirmation |

### Step 2: Prioritise and batch

Not all screens are equal. Batch them by what the team can build against:

**Batch 1 (core LSP flow — likely already in progress):**
- HBL list view
- Booking flow (readiness → pricing → slot → driver → T&Cs → payment → confirmation)
- Delegation modal

**Batch 2 (core ACFS ops):**
- Slot configuration
- Manage booking (search + detail + edit)
- DO validation list + detail

**Batch 3 (supporting flows):**
- P4TC portal (OTP + scoped HBL list + booking)
- Pickup verification
- Cancel booking
- Manage bookings (LSP side)

**Batch 4 (admin):**
- User management (create/update/remove)
- HBL assignment (remedial — may not be needed)

### Step 3: Design each screen referencing the model

For each screen, pull from the model:
- **Fields to show:** from the entity `key_fields`
- **Actions available:** from actor `responsibilities`
- **Validation rules:** from `business_rules`
- **States/transitions:** from entity `lifecycle`
- **Constraints:** from `constraints`
- **Open questions:** check if any OQs affect this screen — if so, design around them or flag as TBD

### Step 4: Ship to team

Since there's no Figma dependency, the designed screen IS the deliverable. The team builds from the working screen directly.

---

## Drift policy

### The model is now a reference document, not a living spec

Once screens are being designed and code is being written, the intent model stops being the source of truth. The code is.

### When drift is fine (don't update the model):

- **Implementation details** — field ordering, component choices, loading states, error message copy, animation, responsive breakpoints
- **UX refinements** — "we split this into two steps instead of one" or "we added a confirmation dialog"
- **Minor data changes** — "we renamed `chargeable_weight` to `billable_weight` in the schema"
- **Tech decisions** — "we used a drawer instead of a modal" or "we paginate at 50 instead of 100"

### When drift needs a conversation (update model only if someone has time):

- **Business logic changes discovered during build** — "relative cutoffs don't work with our calendar library, switching to absolute date pickers"
- **Scope negotiations** — "heat map is cut from Phase 1" (already marked nice-to-have, but log it)
- **Data source changes** — "AGS feed gives us X instead of Y"

### When drift is NOT acceptable (must discuss with team):

- **Business rule changes** — fee formula changes, DO validation logic changes, booking modification rules change
- **Actor/auth changes** — "P4TC now needs a login" or "drivers now get emails"
- **Flow changes** — "we're removing the T&Cs step" or "cancellation now has a fee"
- **Silent changes** — anyone changing a rule without telling the team

**Rule of thumb:** if the change would surprise Matt or Roni, it needs a conversation first.

### When to update the model:

- **Major business rule change** from client (Matt calls and says "we need truck types after all")
- **New journey discovered** that wasn't in scope
- **Open question gets resolved** (update the OQ status)
- **Before a phase review or stakeholder checkpoint** — bring the model back in sync as a summary of what was actually built vs planned

### When to stop updating the model entirely:

- After Phase 1 ships. The model served its purpose: pre-build alignment. Post-ship, the code and the deployed product are the spec.

---

## Open questions that affect screen design

These OQs should be checked before designing the relevant screens:

| Screen | Blocking OQ | Impact |
|---|---|---|
| Booking flow (pricing step) | OQ-023: minimum charge amount | Can't show final price without this value |
| Booking flow (payment step) | OQ-035: Stripe vs Compay | Affects which payment component to integrate |
| HBL list / booking readiness | OQ-021: confirmed milestone list | Milestone filter/display depends on this |
| HBL list | OQ-022: full release type list | Affects DO requirement logic display |
| DO upload / validation | OQ-025: under-bond lifecycle | Affects when/how under-bond flag is shown |
| P4TC portal access | OQ-027: email security validation | Affects OTP flow design |
| P4TC booking confirmation | OQ-028: what HBL info to share | Affects confirmation screen content |
| Driver details step | OQ-030: dropdown vs search UX | Affects component choice |
| DO validation screen | OQ-037: field-level requirements | Pending next Matt session |
| ACFS HBL assignment | OQ-032: auto-assignment logic | Affects whether this screen is needed at all |
| Slot configuration | OQ-036: heat map priority | May be cut — design without it, add later |
| All data screens | OQ-034: AGS feed spec (BLOCKER) | Can't build data integration without this |

---

## Summary

1. Build the screen inventory from the journey list — this is the design backlog
2. Prioritise in batches — core LSP flow first, then ACFS ops, then supporting flows
3. For each screen, reference the model for fields, rules, and states
4. Accept drift on implementation details, flag drift on business rules
5. Stop actively maintaining the model once sprints are running — update only for major changes

---

## Related Documentation

- **[Getting Started Guide](project/getting-started.md)** — Complete setup instructions for both `vbs-intent` and `vbs-portal`, role-specific workflows, and how to export the intent contract
- **[Team Guide](project/team-guide.md)** — How to use the intent model platform for consensus review, AI editing, and cross-role collaboration
- **[BRD to Engineering Process](project/brd-to-engineering-process.md)** — The full pipeline validation from BRD → Intent Model → Code
