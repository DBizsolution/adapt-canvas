# BRD Reconciliation: Journeys Comparison

**Date:** 2026-03-28
**Sources:** PDF BRD v1.5 (Section 4) vs Intent Model v0.8.0

---

## Journey Coverage Summary

| PDF BRD v1.5 Journey | Intent Model Journey | Status |
|---------------------|---------------------|--------|
| 4.1 LSP - HBL Management and Delegation | lsp-delegates-shipments | ⚠️ Partial match - PDF broader scope |
| 4.2 LSP - Pickup Booking | lsp-books-pickup | ✅ Match |
| 4.3 LSP - Modify Existing Booking | lsp-modifies-booking | ✅ Match |
| 4.4 ACFS - Slot Configuration | acfs-configures-slots | ✅ Match |
| 4.5 ACFS - DO Validation | acfs-validates-dos | ✅ Match |
| 4.6 ACFS - Pickup Verification | acfs-verifies-pickup | ✅ Match |
| 4.7 ACFS - HBL Visibility and Manual Assignment | acfs-assigns-hbls | ✅ Match |
| 4.8 ACFS - User Management | acfs-creates-user | ✅ Match |
| - | lsp-cancels-booking | ➕ Extra in intent model |
| - | acfs-cancels-booking | ➕ Extra in intent model |
| - | p4tc-books-pickup (deferred) | ➕ Extra (forward-looking) |
| - | p4tc-manages-booking (deferred) | ➕ Extra (forward-looking) |

---

## Detailed Journey Comparison

### 4.1 LSP - HBL Management and Delegation Journey

**PDF BRD v1.5 Steps:**
1. LSP Login
2. View Assigned HBL List (with 13 fields: Lowest HBL Reference, Other HBL Reference, Container Number, OBL, Description, Weight, Volume, Next Hop, Milestone Status, Customs Status, Quantity, Pack Type, Storage Fee flag)
3. Select Shipments for Action (delegate or book)
4. Search and Select Target LSP (registered or unregistered)
5. Attach DOs or Mark Free Release
6. Confirm Delegation
7. Access for Recipient (registered LSP → login, unregistered → secure link + OTP)

**Intent Model Journey:**
- **lsp-delegates-shipments** - Covers steps 3-6 (delegation flow only)
- **Missing:** Login step (implicit in preconditions)
- **Missing:** View HBL list as separate step (covered in lsp:r1 responsibility but not as journey step)
- **Missing:** DO upload as part of delegation workflow

**Assessment:** ⚠️ PDF BRD groups "HBL Management and Delegation" as one journey, intent model focuses only on delegation. The "View HBL List" aspect is a responsibility (lsp:r1) not a journey.

**Gap:** DO upload/free release marking during delegation is in PDF BRD step 5 but not explicit in intent model delegation journey.

---

### 4.2 LSP - Pickup Booking Journey

**PDF BRD v1.5 Steps:**
1. Select HBLs for Booking
2. System Readiness Validation (unpacked + customs cleared + DOs present)
3. Calculate Load and Fees (per-HBL fee + minimum booking charge)
4. Slot Selection (with heat map indicator)
5. Enter Driver and Truck Details (reuse or add new)
6. Accept Terms and Conditions (booking T&Cs + driver site induction)
7. Payment (Stripe/Compay gateway)
8. Booking Confirmation (booking reference email to LSP, driver notified offline)

**Intent Model Journey:**
- **lsp-books-pickup** - All 8 steps covered with MORE detail
- Extra detail: Driver reuse mechanism, site induction skip logic, payment flow specifics

**Assessment:** ✅ **Perfect match** - Intent model has all PDF BRD content plus implementation detail

---

### 4.3 LSP - Modify Existing Booking Journey

**PDF BRD v1.5 Steps:**
1. Locate Booking (by booking reference or via bookings list)
2. Modifications Before Change Cut-off (driver, truck, slot selection - subject to availability)
3. Modifications After Change Cut-off and Before Collection (driver and truck only, slot locked)
4. After Collection (immutable - corrections handled manually by ACFS)
5. Escalated Changes (fee-impacting changes require ACFS Admin)

**Intent Model Journey:**
- **lsp-modifies-booking** - All 5 steps covered
- Step 1: View booking details (search by booking ref, HBL ref, truck rego, or driver name)
- Step 2: Choose modification type
- Step 3: System checks cutoff
- Step 4: Apply changes (with fee recalculation logic)
- Step 5: Confirmation

**Assessment:** ✅ **Match** - Content aligned with good detail

---

### 4.4 ACFS Admin - Slot Configuration Journey (Backend-Only for Phase 1)

**PDF BRD v1.5 Steps:**
1. Site Data Load (loaded once directly into backend)
2. Slot Definition:
   - Days of week
   - Multiple slots per day
   - Start/end time per slot
   - Booking cut-off (relative day + time)
   - Change cut-off (relative day + time)
   - Heatmap indicator thresholds
3. Ongoing Maintenance (via database/backend until UI delivered in future phase)

**Intent Model Journey:**
- **acfs-configures-slots** - All steps covered with MORE UI detail
- Step 1: Select site
- Step 2: Configure slot template (days, hours, granularity, overlapping allowed)
- Step 3: Configure cutoff rules (booking cutoff + change cutoff, relative format)
- Step 4: Optional: set heat map threshold (nice-to-have)
- Step 5: Block holidays (calendar overlay)
- Step 6: Save

**Assessment:** ✅ **Match with more detail** - Intent model describes UI flow even though Phase 1 is backend-only. Forward-looking detail.

---

### 4.5 ACFS Admin - DO Validation Journey

**PDF BRD v1.5 Steps:**
1. Locate HBL (search by HBL using available criteria)
2. View DOs (system displays DO attachments for the HBL)
3. Validate DOs (mark as "Valid" or "Invalid", system records status + validator + timestamp)
4. HBL DO Validation Status:
   - All DOs valid → "DOs Fully Validated" flag set
   - Any DO invalid → notification sent to booking party requesting corrected DO upload
   - Once corrected DOs uploaded and validated → HBL-level flag set to fully validated

**Intent Model Journey:**
- **acfs-validates-dos** - All steps covered
- Step 1: View unvalidated DOs (HBL-centric list, filter/prioritize by slot date/time)
- Step 2: Review DO against HBL (lowest-level HBL details + DO, slot date/time + booking ref for context)
- Step 3: Validate or flag (validated or flagged for correction using booking reference)

**Assessment:** ✅ **Match** - Intent model has slightly different step grouping but all PDF content covered. Extra detail: can be done by offshore team, separate from pickup verification.

---

### 4.6 ACFS Admin - Pickup Verification Journey

**PDF BRD v1.5 Steps:**
1. Search for Booking (by booking reference, driver name, licence number, truck registration)
2. Review Booking Details (slot, site, LSP, HBLs, fees paid, driver/truck, DO validation status per HBL)
3. Validate Outstanding DOs (if not already done, perform DO validation as per 4.5)
4. Mark Booking as Processed (once conditions satisfied, change booking status to "Processed")
5. Update via Maximas Sync:
   - When milestone in Maximas → "Collected" → VBS updates HBL status to "Collected"
   - When all HBLs in booking → "Collected" → Booking status → "Complete"

**Intent Model Journey:**
- **acfs-verifies-pickup** - All steps covered
- Step 1: Search booking (by booking ref or truck/driver details)
- Step 2: Review details (booking details + DO validation status + audit tracking history, includes DO validation if not done)
- Step 3: Validate or reject (if valid → "processed", if not → flagged)

**Assessment:** ✅ **Match** - Intent model covers all PDF content. Step 5 (Maximas sync) is covered separately in business rules and entity lifecycle transitions.

---

### 4.7 ACFS Admin - HBL Visibility and Manual Assignment Journey

**PDF BRD v1.5:**
**Objective:** Provide ACFS with visibility over HBL lifecycle and the ability to perform fail-safe manual assignment.

**HBL Lifecycle States:**
- Unassigned - Shipment details available but not yet assigned to any LSP
- Assigned - Shipment has been assigned to a primary LSP (first party in chain of custody)
- Delegated - Shipment has been delegated from one LSP to another at any point in the chain
- Booked - HBL has been included in an active booking and has a booking reference
- Collected - HBL's shipment has been collected from warehouse (based on "Collected" milestone from Maximas)

**Steps:**
1. View HBL Lifecycle (Admin views HBLs and their lifecycle states, filter/search by state)
2. Fail-safe Manual Assignment:
   - For Unassigned HBLs where automatic assignment has failed or is not possible
   - Admin views list of Unassigned HBLs
   - Selects an HBL and assigns it to a specific LSP as primary custody
   - System: updates HBL state to "Assigned", updates next-hop LSP information, sends notification to newly assigned LSP
   - Manual primary assignment does not require DOs

**Intent Model Journey:**
- **acfs-assigns-hbls** - Covers step 2 (manual assignment)
- Step 1: View unassigned shipments (system lists FAK shipments unassigned or incorrectly assigned, filter by status)
- Step 2: Select and assign (ACFS selects shipments, assigns to LSP, HBL status → "assigned", remedial step)

**Assessment:** ✅ **Match** - Intent model focuses on the manual assignment workflow. HBL lifecycle visibility is covered in entity definitions and business rules, not as a separate journey. PDF BRD combines visibility + manual assignment, intent model separates concerns.

**Note:** Intent model marks this as low priority/optional if auto-assignment is reliable (warn field).

---

### 4.8 ACFS Admin - User Management Journey

**PDF BRD v1.5 Steps:**
1. Create LSP Account:
   - Admin creates new LSP company account (LSP Name, Primary email, Other company details)
   - System: creates LSP record with single login credential, sends welcome/activation link to email
   - Welcome links expire after 72 hours; reactivation after expiry requires ACFS support
2. Create ACFS Users:
   - Admin creates ACFS Admin and ACFS User accounts as needed
   - ACFS Users access portal via existing ACFS SSO mechanism
3. Update or Deactivate Users:
   - Admin can: update user details and roles (ACFS Admin, ACFS User), deactivate or reactivate LSP accounts and ACFS user accounts as required

**Intent Model Journey:**
- **acfs-creates-user** - All steps covered
- Step 1: Select user type (LSP, ACFS Admin, ACFS User)
- Step 2: Enter user details (LSP: company name/ID/branch/contact/email, username+password; ACFS: company name=ACFS/code/contact/email, SSO-based)
- Step 3: System sends welcome email (link expires in 72 hours)
- Step 4: User activates account (LSP: sets password, ACFS: SSO login completes activation)

**Assessment:** ⚠️ **Partial** - Intent model covers user creation (step 1-2) but does NOT have separate journey for user update/deactivation (step 3). This is covered in ACFS responsibilities (acfs:r7) but not as a journey.

**Gap:** Update or Deactivate Users is not a separate journey in intent model.

---

## Extra Journeys in Intent Model (Not in PDF BRD Section 4)

### lsp-cancels-booking
**Status:** Active journey in intent model
**PDF BRD Reference:** Mentioned in LSP responsibilities ("Cancel bookings within defined rules") but NOT listed as a journey in Section 4
**Steps:**
1. View bookings
2. Open booking details
3. Cancel booking (refund offline per C-003)
**Assessment:** ➕ Intent model makes cancellation explicit as a journey. Good addition.

### acfs-cancels-booking
**Status:** Active journey in intent model
**PDF BRD Reference:** Not mentioned in Section 4
**Steps:**
1. Search booking
2. Cancel booking (must provide reason)
3. Notification (sent to booking party)
**Assessment:** ➕ Intent model adds ACFS-initiated cancellation. Logical administrative capability not in PDF.

### p4tc-books-pickup
**Status:** Deferred in intent model
**PDF BRD Reference:** "One-off booking party self-service flows" in Section 1 as fast follow/future phase
**Assessment:** ✅ Forward-looking detail aligned with PDF BRD fast follow scope

### p4tc-manages-booking
**Status:** Deferred in intent model
**PDF BRD Reference:** Not in PDF BRD
**Assessment:** ➕ Forward-looking detail for P4TC booking management

---

## Critical Gaps Identified

### 1. DO Upload During Delegation (PDF 4.1 Step 5)
**PDF BRD:** Step 5 of delegation journey includes "Attach DOs or Mark Free Release"
**Intent Model:** lsp-delegates-shipments does NOT include DO upload as a step
**Impact:** Medium - DO upload is an LSP responsibility (lsp:r6) but not integrated into delegation workflow
**Recommendation:** Consider whether DO upload should be part of delegation journey or remain separate

### 2. User Update/Deactivation Journey Missing
**PDF BRD:** Step 3 of User Management (4.8) - "Update or Deactivate Users"
**Intent Model:** acfs-creates-user only covers creation, not update/deactivation
**Impact:** Low - Covered in responsibilities (acfs:r7) but not as explicit journey
**Recommendation:** Add journey: acfs-manages-user-accounts (update, deactivate, reactivate)

### 3. HBL Management vs Delegation Scope
**PDF BRD:** 4.1 titled "HBL Management and Delegation" - broader scope
**Intent Model:** lsp-delegates-shipments focuses only on delegation
**Impact:** Low - HBL viewing is covered in responsibilities, not journeys
**Recommendation:** Consider renaming PDF journey to "LSP Delegation Journey" or adding "lsp-views-hbls" journey

---

## Recommendations

### High Priority
1. **Clarify DO upload integration** - Determine if DO upload should be part of delegation journey or remain separate workflow

### Medium Priority
2. **Add user management journey** - Create acfs-manages-users journey covering update/deactivation
3. **Make cancellation journeys consistent** - Both LSP and ACFS cancellation are in intent model but not PDF BRD Section 4

### Low Priority
4. **Align journey naming** - PDF BRD 4.1 is broader scope than intent model delegation journey
5. **Keep P4TC journeys deferred** - Current approach correct, aligns with fast follow

---

## Overall Assessment

✅ **Strong alignment** - All 8 PDF BRD journeys are covered in intent model
✅ **More detail** - Intent model has significantly more implementation detail
➕ **Extra journeys** - Intent model includes cancellation journeys and forward-looking P4TC journeys
⚠️ **Minor gaps** - DO upload during delegation, user update/deactivation as journey

Intent model is MORE comprehensive than PDF BRD Section 4.
