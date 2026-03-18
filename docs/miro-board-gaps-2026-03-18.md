# Miro Board — Gaps from Meeting Transcript
**Date:** 2026-03-18
**Meeting:** Roni & Matt Drake
**Transcript:** `/Users/rahul/DBiz/roni-transcript-diarized.md`

---

## 1. One-off delegation needs email only

**Section:** ONE-OFF BOOKING PARTY
**Find box:** "DELEGATE SHIPMENTS" → the step where new party details are entered
**Exact nearby text:** "ENTER PXTC NAME, EMAIL ID"

**Add annotation:**
> Only required field for one-off delegation is EMAIL. No company name, no branch code, no contact name needed.

**Transcript:** [00:24:22]-[00:24:27]

---

## 2. LSP registry fields

**Section:** LOGISTICS SERVICE PROVIDER (LSP)
**Find box:** "DELEGATE SHIPMENTS" → "SELECT EXISTING LSP (SEARCH AND SELECT)"

**Add annotation:**
> LSP registry fields: Company name, Email, Company ID, Branch code (same as Connect, e.g. "SYBR"). Pre-populated via one-time bulk upload from AGS. Not from Maximus.

**Transcript:** [00:22:26]-[00:23:31]

---

## 3. Fee formula

**Section:** LOGISTICS SERVICE PROVIDER (LSP)
**Find box:** "LOAD CALCULATION + PRICING"
**Also update same box in:** ONE-OFF BOOKING PARTY → "LOAD CALCULATION + PRICING"

**Add annotation:**
> Fee formula: Per HBL = chargeable weight (max of weight vs volume) × rate. Total = sum of HBL charges + minimum charge. Rate is a single flat configurable value for Phase 1. Chargeable weight provided in data feed. Minimum charge TBD.

**Transcript:** [00:32:29]-[00:35:42]

---

## 4. Compay vs Stripe

**Section:** LOGISTICS SERVICE PROVIDER (LSP)
**Find box:** "MAKE PAYMENT"
**Also update same box in:** ONE-OFF BOOKING PARTY → "MAKE PAYMENT"

**Add annotation (with question mark):**
> Payment provider: Stripe (team has experience) vs Compay (most ACFS customers already registered). Open decision.

**Transcript:** [00:37:11]-[00:37:48]

---

## 5. Driver scoping per account

**Section:** LOGISTICS SERVICE PROVIDER (LSP)
**Find box:** "ENTER TRUCK AND DRIVER DETAILS" (the box that mentions selecting existing drivers)

**Add annotation:**
> Drivers are scoped per LSP account. All users within the same account share the driver list. NOT visible across other accounts. P4TC (one-off) always enters fresh — no saved drivers.

**Transcript:** [00:42:23]-[00:44:50]

---

## 6. Site induction flag on driver

**Section:** LOGISTICS SERVICE PROVIDER (LSP)
**Find box:** "ACCEPT T&CS AND DRIVER INDUCTION"
**Also update same box in:** ONE-OFF BOOKING PARTY → same step

**Add annotation:**
> Two separate acceptances: (1) booking T&Cs (legal doc), (2) driver site induction (doc). If selected driver already has site_induction = YES on their record, the induction acceptance is SKIPPED.

**Transcript:** [00:43:31]-[00:46:44]

---

## 7. Booking modification rules for external users

**Section:** LOGISTICS SERVICE PROVIDER (LSP)
**Find box:** "MANAGE BOOKINGS" area (the section with "CHECK/CHANGE DATE AND TIME", "MOVE BOOKING/RESCHEDULE" etc.)

**Add annotation:**
> Modification rules:
> - Truck/driver: change anytime, no cutoff, up until shipment collected
> - Slot date/time: before change cutoff only
> - HBLs add/remove: before change cutoff only
> - Cost-impacting changes after cutoff: must call ACFS

**Transcript:** [01:05:13]-[01:06:22], [01:13:27]-[01:13:48]

---

## 8. ACFS booking edit rules

**Section:** ACFS ADMIN/INTERNAL USER
**Find box:** "MANAGE BOOKING" → "SEARCH BOOKINGS" area, near "UPDATE BOOKING DETAILS" / "BOOKING UPDATES NOTIFICATION SENT TO THE BOOKING PARTY"

**Add annotation:**
> ACFS can edit: slot date/time (overrides all cutoffs), driver/truck, HBLs (add/remove).
> ACFS CANNOT edit: booking reference, booking party, fees paid.

**Transcript:** [01:11:37]-[01:12:29]

---

## 9. Booking update notification

**Section:** ACFS ADMIN/INTERNAL USER
**Find box:** "MANAGE BOOKING" → near "BOOKING UPDATES NOTIFICATION SENT TO THE BOOKING PARTY"

**Check:** This appears to already be on the board. Verify the text says notification goes to **booking party's account email** specifically, not to driver or any other party.

**Transcript:** [01:16:02]-[01:16:07]

---

## 10. Customs clearance must be FULLY cleared

**Section:** LOGISTICS SERVICE PROVIDER (LSP)
**Find box:** "SYSTEM VALIDATES BOOKING READINESS" (the validation/check step before load calculation)
**Also update same in:** ONE-OFF BOOKING PARTY → same validation step

**Add annotation:**
> Customs clearance must be FULLY cleared — not partial. Includes quarantine check. ABF clearance required.

**Transcript:** [00:28:16]

---

## 11. DO validation is HBL-centric

**Section:** ACFS ADMIN/INTERNAL USER
**Find box:** "PENDING VERIFICATION WITH MATT" area → "DO VALIDATION" sub-area

**Add annotation (for when this section is built out):**
> DO validation is 100% HBL-centric, NOT booking-centric. Primary view is by HBL reference. Booking reference shown for context only. Can filter by slot date/time for prioritisation. Can be done by offshore team.

**Transcript:** [01:23:46]-[01:23:48]

---

## 12. Site entity details

**Section:** ACFS ADMIN/INTERNAL USER
**Find box:** "SLOT CONFIGURATION" → first step where site is selected ("SITE NAME CREATED IN THE SYSTEM")

**Add annotation:**
> Sites are DB-seeded — no admin CRUD UI for Phase 1. Fields: site name + branch code. Multiple sites can share a branch code (e.g. Port Botany and St Mary's both = "SY").

**Transcript:** [00:54:48]-[00:56:37]

---

## 13. No truck type for MVP

**Section:** LOGISTICS SERVICE PROVIDER (LSP)
**Find box:** "SELECT SLOT AND DATE/TIME" step in the booking flow
**Also check:** ONE-OFF BOOKING PARTY → same step. ACFS ADMIN → Slot Configuration.

**Add annotation (sticky note, visible):**
> No truck type distinction for Phase 1 MVP. Slots are NOT filtered by truck type. Booking party responsible for bringing correct truck. Per Matt: "irrespective of what the load is, we're not going to stop them."

**Transcript:** [01:04:05]-[01:04:19]
