# Final Sync Check: Intent Model v0.5.0 vs Transcript vs Miro Board
**Date:** 2026-03-18
**Artifacts checked:**
- Intent model v0.5.0 (`src/domain/intent-model/model.ts`)
- Meeting transcript (`/Users/rahul/DBiz/roni-transcript-diarized.md`)
- Miro board (`/Users/rahul/Downloads/ACFS vbs (5).pdf`)

---

## All three are in sync on:

| Topic | Model | Transcript | Board |
|---|---|---|---|
| LSP consolidated actor | ✅ | ✅ | ✅ |
| P4TC magic link + OTP | ✅ | ✅ | ✅ |
| No driver email | ✅ BR-012 | ✅ [00:41:12] | ✅ |
| No truck type for MVP | ✅ Booking entity | ✅ [01:04:05] | ✅ |
| Fee formula (chargeable wt × rate + min charge) | ✅ BR-019 | ✅ [00:32:29] | ✅ |
| Stripe/Compay TBD | ✅ OQ-035 | ✅ [00:37:11] | ✅ |
| Driver scoping per account | ✅ BR-016 | ✅ [00:42:23] | ✅ |
| T&Cs + site induction (2 separate acceptances) | ✅ BR-017 | ✅ [00:45:05] | ✅ |
| Relative cutoffs (day + time) | ✅ BR-005 | ✅ [00:58:53] | ✅ |
| DO validation separate from pickup verification | ✅ BR-018 + journey | ✅ [01:18:30] | ✅ |
| HBL assignment = remedial/optional | ✅ journey warn | ✅ [00:50:01] | ✅ |
| Heat map = nice-to-have | ✅ OQ-036 | ✅ [01:01:52] | ✅ |
| Booking modification rules (truck/driver anytime, rest before cutoff) | ✅ BR-015 | ✅ [01:05:13] | ✅ |
| ACFS SSO auth | ✅ actor | N/A (not discussed) | ✅ |
| Cancel booking flow (LSP + ACFS) | ✅ journeys | N/A (board-only) | ✅ |
| User management flow (create/update/remove) | ✅ journeys | N/A (board-only) | ✅ |
| Slot removal blocked by active bookings | ✅ BR-026 | N/A (board-only) | ✅ |
| Free release flag per HBL (DO or free release) | ✅ BR-021 | ✅ [00:20:38] | ✅ |
| One-off delegation = email only | ✅ journey step | ✅ [00:24:22] | ✅ |
| LSP registry fields (name, email, ID, branch code) | ✅ journey step | ✅ [00:22:26] | ✅ |
| Sites DB-seeded, no admin UI | ✅ entity + C-006 | ✅ [00:54:48] | ✅ |
| Customs must be FULLY cleared (incl. quarantine) | ✅ BR-001 | ✅ [00:28:16] | ✅ |
| P4TC cannot self-service modify bookings | ✅ BR-023 | N/A (board-only) | ✅ |
| User removal = soft delete (archive) | ✅ BR-024 | N/A (board-only) | ✅ |
| Welcome email link expires 72 hours | ✅ BR-025 | N/A (board-only) | ✅ |
| Integrations documented (Maximus, AGS, payment, email, LSP registry) | ✅ entities | ✅ (throughout) | N/A |

---

## One inconsistency to fix

### Driver scoping — model vs board text mismatch

**Model (BR-016):**
> "Drivers added by one LSP user are visible to all users within that same **account**, but NOT visible to other accounts."

**Board text:**
> "Drivers list visibility is specific to the **logged in user** only and not visible across parties/users"

**These say different things.** The model says account-level sharing (Matt and Roni from Direct Couriers both see the same driver list). The board says user-level isolation (Matt's drivers are invisible to Roni even within Direct Couriers).

**The transcript supports account-level.** At [00:44:01]-[00:44:35], Matt said "Does that mean that every account could create their list of drivers?" and Roni confirmed "Yes, they could, because everyone can do a booking."

**Action:** Update the Miro board text from "specific to the logged in user only" to "specific to the LSP account — shared across all users within the same account". The model is correct.

---

## Questions to raise on the Miro board

These are open questions already tracked in the intent model but worth flagging as sticky notes on the board for Matt's next session:

### 1. AGS data feed — BLOCKER (OQ-034)

**What:** What is the exact data format, delivery mechanism, and frequency for the AGS data feed?

**Why it matters:** This blocks auto-assignment and HBL hierarchy. Without it, the system can't automatically assign HBLs to LSPs or show alternative HBL references. Matt and William are working on it.

**Ask Matt:** What's the timeline for getting the AGS feed spec? This is the single biggest technical risk for the 8-week timeline.

**Where on board:** Add a sticky note near the HBL data table / assignment area.

### 2. DO validation + pickup verification details (OQ-037)

**What:** Field-level requirements for the DO validation view and pickup verification view.

**Why it matters:** Already marked "PENDING VERIFICATION WITH MATT" on the board. Scheduled for next session. No action needed — just confirm it's on tomorrow's agenda.

### 3. Minimum charge amount (OQ-023)

**What:** What is the actual minimum charge value per booking?

**Why it matters:** Fee formula is confirmed (chargeable_weight × rate + minimum charge) but the minimum charge amount is TBD. Needed before the pricing UI can be built.

**Where on board:** Add a TBC sticky note near the fee calculation box in both LSP and one-off sections. Already says "Minimum charge (per booking TBC)" — just make sure Matt sees it.

### 4. Stripe vs Compay (OQ-035)

**What:** Which payment provider for Phase 1?

**Why it matters:** Roni's team has Stripe experience but not Compay. Matt said most ACFS customers already use Compay. This affects the tech stack and potentially the timeline.

**Where on board:** Already marked "Stripe / Compay ? TBC" — escalate for a decision before sprint planning.

---

## Verdict

All three artifacts are in sync. One board text fix needed (driver scoping). No model changes required. Four open questions to push for answers in the next Matt session — the AGS data feed (OQ-034) is the critical one.
