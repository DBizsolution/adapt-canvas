# Intent Model Update Strategy

How to incorporate feedback from the PM clarification session (2026-03-17) into the canonical intent model.

---

## 1. Corrections (intent model got it wrong)

These need direct edits:

- **Q8** — Remove `created` from milestone states. Correct list: `on_vessel → at_wharf → in_yard → unpacked → collected`. Remove `delegated` and `booked` from milestones — those are HBL statuses, not milestones.
- **Q9** — Move `under_bond` from lifecycle states to a flag/attribute on the HBL entity. It's not a state.
- **Q13** — DO hierarchy is Option B (each level uploads their own), not cascading. Update BR-003 if it implies inheritance.
- **Q25** — Remove `wff:r2` "request missing HBLs" entirely. It's not in the BRD. Keep "search by HBL" only.

## 2. Gap fills (intent model had warnings/unknowns)

These resolve open questions — update the relevant fields and remove the warning tags:

- **Q1** — `wff:r3/r4`: Delegate OR book per HBL, never both
- **Q2/Q3** — `ff.auth`, `carrier.auth`: Magic link + OTP, no account creation. Same mechanism for all external parties after WFF.
- **Q4** — One-off customer: magic link with status visibility, expires on collection, no dashboard
- **Q5** — Party sourcing: one-time bulk upload from ACFS registry, local DB, no Maximas sync
- **Q6** — Tier-2 linking: manual assignment by WFF only. Remove any Maximas option.
- **Q7** — Data freshness: periodic batch (once/twice daily)
- **Q10** — `unpacked → booked` is always valid
- **Q12** — Under-bond flagging: manual by WFF/FF staff, ACFS can also flag
- **Q14** — DO override: certain ACFS roles, audit trail required, one-time per HBL until collected
- **Q17** — Payment: Stripe embedded checkout
- **Q18** — Refunds: portal-agnostic, handled offline
- **Q20** — ACFS workflow: 7-day lookahead from Maximas, partial processing allowed
- **Q22** — FOC rebooking: ACFS admin only, all fees waived, reason required
- **Q23** — Single app, role-based routing
- **Q24** — Auth: WFF=username/password, FF/Carrier/Customer=magic link+OTP, ACFS/Gate=SSO (OAuth/Okta)

## 3. Flagged items (add as open/pending, don't resolve)

Keep these as warnings in the intent model but update the context:

- **Q11** — Release types: mark as `pending_client_confirmation`. Add note: "free release confirmed, underbond unclear, full list needed"
- **Q15** — Fee method: mark as `pending_client_decision`. Add note: "likely flat minimum + per-HBL volumetric, but flat vs percentage undecided"
- **Q16** — Cross-WFF booking: answer is yes, but flag that auth model (Q2/Q3) may need to change from magic link to proper login. Mark as `pending_client_decision`.
- **Q19** — Cutoff: per-slot date/time config (not hour-based), per site. Add to pickup window entity fields. No-show rebooking = ACFS admin only for Phase 1.
- **Q21** — Slot config: flexible slots, density indicator instead of hard capacity, blackout/holidays required, per-site, no changes to booked slots in Phase 1. Add as constraints on the pickup window entity.

## 4. Design decisions (entity-level vs UI-only)

### Add to intent model (entity-level implications):
- **DO-to-HBL mapping requirement** — add `associated_hbls` field on DO entity (must be explicitly mapped, not bulk)
- **Storage fee flag** — add `storage_fee_due` boolean on HBL entity, derived from `last_free_storage_date`
- **Booking reference** — confirm as field on Booking entity (separate from HBL reference)
- **Label renames** — "Pickup Status" → "HBL Status", milestone stays as-is

### Keep in UI docs only (not intent model):
- Full-screen booking flow (not side panel)
- Condense booking steps to 2-3 max
- Search + autocomplete for all lookups (driver, carrier, FF)
- HBL table columns: reference, customs status, weight/volume, milestone
- Booking reference number at top of detail view
- Remove red highlight hue on unassigned rows
- Progressive booking summary pane
- Panel design consistency across delegate and book flows

---

## Suggested workflow

1. Batch Type 1 (corrections) and Type 2 (gap fills) into a single review cycle on the platform
2. Add Roni as reviewer so he can confirm the changes
3. Type 3 (flagged) items go in as pending with context notes
4. Type 4 entity changes go in the same batch; UI stuff stays in docs
