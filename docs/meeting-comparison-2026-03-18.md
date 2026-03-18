# Intent Model v0.3.0 vs Meeting Discussion — Comparison
**Date:** 2026-03-18
**Meeting:** Roni & Matt Drake (~100 min)
**Source transcript:** `/Users/rahul/DBiz/roni-transcript-diarized.md`
**Source Miro board:** `/Users/rahul/Downloads/ACFS vbs 18 March.pdf`

---

## What the model correctly captures from the meeting

**Actors:**
- LSP consolidation (replacing WFF/FF/Carrier split from v0.2.0) — aligns with how Matt and Roni discussed a single "booking party" flow
- P4TC with magic link + OTP — explicitly confirmed at [00:25:06]-[00:25:18]
- Driver has no portal access, no email from system — confirmed at [00:41:12]-[00:41:38]
- ACFS internal admin responsibilities — well-captured

**Entities & Fields:**
- HBL fields: weight, volume, container number, ocean bill of lading, customs clearance status — all discussed
- Multiple HBL references (lowest-level + alternative) — confirmed throughout [00:00:00]-[00:10:00]
- Booking entity with driver name, license, truck rego — confirmed at [00:40:26]-[00:40:55]

**Business Rules:**
- BR-004 (delegate or book, never both) — implicit in the flow
- BR-011 (missing DO aborts booking) — confirmed at [00:29:02]-[00:29:40]

**Journeys:**
- LSP booking flow steps match the discussed sequence well
- P4TC flow captured reasonably

---

## Discrepancies — model says something the meeting contradicts

| # | Model (v0.3.0) | Meeting says | Impact |
|---|---|---|---|
| **1** | **BR-012**: "Driver receives booking confirmation via email" | Matt explicitly said NO driver email. Booking confirmation goes to account email only. The booking party forwards to the driver themselves. [00:41:12]-[00:48:06] | **Fix BR-012 and driver:r1** — remove "email sent to driver". Confirmation goes to account email only. |
| **2** | **Booking entity** has `truck_type: 'normal' \| 'semi_trailer'` as a field. **BR-008** says truck type filters slots. | Matt confirmed truck type is NOT needed for MVP. "Irrespective of what the load is, we're not going to stop them... it's their responsibility to bring the right kind of truck." [01:04:05]-[01:04:19] | **Remove truck_type from booking, remove BR-008**. Slots are not filtered by truck type in Phase 1. |
| **3** | **Slot entity** has `truck_type` field filtering slots | Same as above — no truck type distinction for slots in MVP [01:04:05] | **Remove truck_type from slot entity** |
| **4** | **ACFS auth**: model says "Username + password (portal-native). Not SSO." | v0.2.0 had ACFS as SSO via OAuth/Okta. Meeting didn't revisit this. The change from SSO to username/password is unsourced. | **Verify** — this may have been an intentional update from the PDF, but wasn't discussed in the meeting |
| **5** | **LSP journey step 5**: "Possibility of selecting an existing driver via dropdown/search" | Confirmed BUT drivers are scoped per carrier/account — not global. "This list of drivers and trucks is specific to the carrier" [00:42:23] | Model captures the feature but **missing the scoping rule** — add that drivers belong to the account, not globally visible |
| **6** | **P4TC journey step 9**: "Existing HBL info shared with relevant parties" | This is listed as OQ-028 (open) which is correct, but the step text implies it happens. Should be marked as TBD. | Minor — already flagged via OQ-028 |

---

## Missing from model — discussed in meeting but not captured

| # | Topic | Meeting reference | Suggested addition |
|---|---|---|---|
| **1** | **Terms & Conditions + Site Induction** — two separate acceptances required before payment. If driver already has site induction (yes flag), skip that checkbox. | [00:45:05]-[00:46:44] | Add to LSP/P4TC booking journey as a step before payment. Add `site_induction` boolean to driver details. |
| **2** | **Chargeable weight** as a field — max(weight, volume) calculated per HBL, stored as a field. Fee = chargeable_weight x rate + minimum charge. | [00:32:29]-[00:35:42] | Add `chargeable_weight` to HBL entity. Update fee calculation description. |
| **3** | **Rate is a single flat value** (not per-slot, not percentage). Configurable, potentially per-region in future. | [00:34:32]-[00:35:08] | Add `rate` as a system config field, note it's flat for Phase 1 |
| **4** | **Booking modification rules** — external users can change truck/driver at any time (no cutoff). Slot/date/HBL changes only before cutoff. Cost-impacting changes require ACFS. | [01:05:13]-[01:06:22], [01:13:27]-[01:13:48] | Add as a new business rule |
| **5** | **DO Validation as separate flow** from Pickup Verification — can be done by offshore team, HBL-centric not booking-centric. | [01:18:30]-[01:19:16] | Add a new journey `acfs-validates-dos` separate from `acfs-verifies-pickup` |
| **6** | **Sites** — seed via DB, no admin UI needed for Phase 1. Fields: site_name + branch_code. | [00:54:48]-[00:56:37] | Add `site` as a lightweight entity. Note: no CRUD UI, DB-seeded. |
| **7** | **Driver entity** — drivers built up organically (no pre-population). Scoped per account. Fields: name, license, rego, site_induction (yes/no). | [00:40:26]-[00:44:50] | Add `driver` as a lightweight entity with account scoping |
| **8** | **HBL hierarchy detail** — AGS issues master HBL (500-prefix), freight forwarders issue lower-level HBLs (e.g. 4033-prefix for Mondial). Mostly 1:1 relationship. Data source: AGS feed (not ICS/Maximus for party info). | [00:04:19]-[00:10:00] | Enrich HBL entity description with hierarchy context. Add `alt_hbl_reference` field. |
| **9** | **Compay as potential payment alternative** to Stripe — Matt raised that most customers already use Compay. | [00:37:11]-[00:37:48] | Add to OQ or create new OQ noting Compay vs Stripe decision |
| **10** | **Slot cutoffs** — booking cutoff and change cutoff are *relative* (previous working day + time, same day + time), not absolute dates. | [00:58:53]-[01:01:52] | **Contradicts BR-005** which says "absolute date/time". Update to relative date/time per slot template. |
| **11** | **Heat map / density indicator** — single threshold value configured per slot. System auto-calculates green/orange/red zones. Marked as nice-to-have. | [01:01:52]-[01:03:18] | Already in model as capacity_indicator, but missing the "nice-to-have" priority and threshold config detail |
| **12** | **Manual WFF assignment is a remedial/optional step** — not a core flow. Matt said it's low priority given the 8-week timeline. | [00:50:01]-[00:53:25] | Downgrade `acfs-assigns-hbls` journey priority. Mark as optional/remedial. |
| **13** | **Follow-up items for next session**: DO validation details, pickup verification flow, user management flow | [01:26:38]-[01:27:54] | Note as incomplete — these journeys need detail from the next session |
