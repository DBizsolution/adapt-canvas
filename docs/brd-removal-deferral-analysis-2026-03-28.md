# BRD Removal & Deferral Analysis

**Date:** 2026-03-28
**Purpose:** Identify content in intent model v0.8.0 that should be removed (contradicts PDF BRD) or deferred (out of Phase 1 scope)

---

## Summary

**Status:** 🔴 **CRITICAL CONTRADICTIONS FOUND**

The intent model has **driver reuse functionality described in detail** but PDF BRD v1.5 **explicitly defers this to fast follow**.

---

## 1. Items Already Correctly Marked as Deferred ✅

| Item | Type | Status | PDF BRD Reference |
|------|------|--------|-------------------|
| `p4tc` | Actor | deferred: true | Section 1: "One-off booking party self-service flows" - fast follow |
| `gatehouse` | Actor | deferred: true | BRD v1.5 does not reference gatehouse as separate actor |
| `driver_record` | Entity | deferred: true | Section 4.2: "previously entered driver and truck data will not be maintained for Phase 1" |
| `p4tc-books-pickup` | Journey | deferred: true | Fast follow |
| `p4tc-manages-booking` | Journey | deferred: true | Fast follow |

**Assessment:** ✅ These are correctly marked and aligned with PDF BRD

---

## 2. CRITICAL: Driver Reuse Functionality Contradiction 🚨

### PDF BRD v1.5 Position
**Section 4.2 LSP Pickup Booking Journey, Step 5:**
> "Where previously entered driver and truck data will not be maintained for Phase 1. This will be introduced in the fast follow/next phase."

**Assumption A-025:**
> "Previously entered driver and truck data will not be maintained for Phase 1. This will be introduced in the fast follow/next phase."
> Rationale: "Deferred feature; Phase 1 treats driver/truck as booking attributes only"

**Clear Statement:** Driver reuse = DEFERRED to Phase 2

---

### Intent Model v0.8.0 Position

**Entity: driver_record (line 195)**
```typescript
{
  id: 'driver_record',
  name: 'Driver Record',
  deferred: true, // ✅ Correctly marked
  description: 'Deferred to fast follow (BRD v1.5 treats driver as booking attributes only for Phase 1). Saved driver details for reuse across bookings...'
}
```

**BUT Journey: lsp-books-pickup, Step 5 (line 459)**
```typescript
{
  order: 5,
  title: 'Enter truck and driver details',
  detail: 'Select existing driver from account-scoped list (search/dropdown) or enter new driver details (name, license, truck rego). New drivers are saved to the account for future reuse. P4TC users always enter fresh details.'
  //       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //       DESCRIBES DRIVER REUSE IN PHASE 1! CONTRADICTION!
}
```

**AND Business Rule BR-016 (line 699)**
```typescript
{
  id: 'BR-016',
  description: 'Driver records are scoped per LSP account. Drivers added by one LSP user are visible to all users within that same account, but NOT visible to other accounts. P4TC users do not have saved driver records.',
  // Describes Phase 1 driver scoping logic, but driver reuse is deferred!
}
```

**AND LSP Responsibility lsp:r4 (line 20)**
```typescript
{
  id: 'lsp:r4',
  description: 'Book pickup directly: ... enter truck and driver details (select existing or add new, scoped to account) ...'
  //                                      ^^^^^^^^^^^^^^^^^^^^^^
  //                                      Implies driver reuse available
}
```

---

### The Contradiction

| Aspect | Intent Model | PDF BRD v1.5 |
|--------|-------------|-------------|
| **driver_record entity** | Marked deferred ✅ | Deferred to fast follow ✅ |
| **Journey step description** | "Select existing driver" "saved to account" | ❌ Should be "Enter fresh each time" |
| **Business rule BR-016** | Describes driver scoping logic | ❌ Shouldn't exist if deferred |
| **LSP responsibility** | "(select existing or add new)" | ❌ Should be "enter details" only |

**Impact:** 🚨 **High** - Dev team implementing from journeys would build driver reuse (Phase 2 feature) in Phase 1

---

### Resolution Required

**Option 1: Remove Driver Reuse References (Align with PDF BRD)**
- ✅ Update journey step to: "Enter driver details (name, license, truck rego). Driver and truck details are entered fresh for each booking in Phase 1."
- ✅ Remove BR-016 (driver scoping)
- ✅ Update lsp:r4 to: "enter truck and driver details"
- ✅ Keep driver_record entity marked deferred
- ✅ Add note: "Driver reuse functionality deferred to Phase 2 per A-025"

**Option 2: Keep Driver Reuse (Challenge PDF BRD)**
- If driver reuse is actually being built in Phase 1, then:
  - Remove deferred flag from driver_record entity
  - Update assumption A-025 to remove "will not be maintained"
  - Get stakeholder confirmation

**Recommendation:** Option 1 - Align with PDF BRD v1.5

---

## 3. ACFS Responsibility: ECST Assignment ⚠️

**Location:** acfs:r2 (line 59)
```typescript
{
  id: 'acfs:r2',
  description: 'ECST Assignment: assign ECST to shipments. Parked for Phase 1 — flow details to be defined later.'
}
```

**Status:** Marked as "Parked for Phase 1" in description but NOT marked with deferred flag

**PDF BRD Reference:** Not mentioned in PDF BRD v1.5

**Issue:** If it's "parked" should it be in the model at all? Or should it be marked deferred?

**Resolution Required:**
- **Option A:** Remove entirely (it's parked, undefined)
- **Option B:** Mark as deferred with note: "ECST assignment flow to be defined in Phase 2"
- **Option C:** Keep as-is with "parked" note

**Recommendation:** Option B - Mark as deferred for consistency

---

## 4. Slot Configuration UI Description ⚠️

**Location:** acfs:r3 (line 60), journey: acfs-configures-slots (line 414-429)

**Intent Model:** Describes detailed UI flow with steps like "Select site", "Configure slot template", "Block holidays", etc.

**PDF BRD v1.5:**
- **Section 4.4:** Backend-only for Phase 1
- **FR-ADM-02:** "In Phase 1, slot and site definitions shall be managed via backend/database configuration rather than a front-end configuration module."
- **Assumption A-020:** "Site data will be uploaded once directly into the backend; no site configuration module is required for Phase 1."

**Constraint C-006:**
```typescript
{
  id: 'C-006',
  constraint: 'Site management is DB-seeded for Phase 1 — no admin CRUD UI. Sites have name + branch code only.',
  type: 'admin',
}
```

**Issue:** Journey describes UI steps but PDF BRD says backend-only

**Resolution Required:**
- Update journey to clarify it's backend/database operations (SQL/migrations) not UI
- OR add note: "UI described here is for Phase 2 reference. Phase 1 uses database configuration per C-006"

**Recommendation:** Add clarifying note to journey that UI is Phase 2, Phase 1 is backend-only

---

## 5. Driver Actor - Should It Exist? 🤔

**Location:** Actor 'driver' (line 42-51)

**Intent Model:**
```typescript
{
  id: 'driver',
  name: 'Driver',
  description: 'Secondary user. No portal access. No direct system communication...',
  auth: 'No portal auth. No system emails.',
  responsibilities: [
    { id: 'driver:r1', description: 'Receive booking reference from booking party (forwarded externally...)' },
    { id: 'driver:r2', description: 'Present booking reference and identity at gatehouse...' },
  ],
}
```

**PDF BRD v1.5:**
- Driver NOT listed as actor in Section 2
- Driver details mentioned as data captured during booking
- Driver referenced in journeys as role, not actor

**Issue:** Is Driver an actor (role with responsibilities) or just data captured during booking?

**Arguments FOR keeping Driver as actor:**
- Clarifies that driver is part of the system (even if not a user)
- Documents driver responsibilities for external communication
- Helps with understanding the full flow

**Arguments AGAINST:**
- PDF BRD doesn't list as actor
- Driver has no system interaction
- Could be documented as note in booking journey instead

**Recommendation:** Keep Driver actor but add note: "Driver is not a portal user. Listed as actor for role clarity and external communication documentation. Not an actor in traditional user sense."

---

## 6. Open Question OQ-034: AGS Integration 📋

**Location:** open_questions (line 809-814)

**Content:** Critical blocker about AGS feed for HBL hierarchy and consignee data

**PDF BRD v1.5:**
- Section 6.2 only mentions Maximas integration
- Does not mention AGS as integration source

**Status:** This is NEW information from 2026-03-24 meeting (after PDF BRD v1.5 was finalized)

**Resolution Required:** None - this is correct. PDF BRD v1.5 needs updating, not intent model.

**Recommendation:** Keep as-is. Flag to Roni that BRD Section 6.2 needs AGS integration added.

---

## 7. Additional Journeys Not in PDF BRD ✅

### lsp-cancels-booking
**Status:** Active (not deferred)
**PDF BRD Reference:** Mentioned in LSP responsibilities, not as journey
**Assessment:** ✅ Good addition - makes cancellation flow explicit

### acfs-cancels-booking
**Status:** Active (not deferred)
**PDF BRD Reference:** Not mentioned
**Assessment:** ✅ Good addition - logical admin capability

**Recommendation:** Keep both - they support requirements

---

## 8. Constraints Review

All constraints reviewed against PDF BRD:

| Constraint | Aligned with PDF BRD? |
|------------|----------------------|
| C-004: Driver no portal access | ✅ Yes - A-024 |
| C-005: P4TC no persistent credentials | ✅ Yes - deferred |
| C-006: Site DB-seeded Phase 1 | ✅ Yes - A-020, FR-ADM-02 |
| C-007: Desktop/laptop only | ✅ Yes (implicit in BRD) |
| C-008: Email primary notification | ✅ Yes (throughout BRD) |
| C-009: Hop-by-hop delegation visibility | ✅ Yes - A-010 |

**Assessment:** ✅ All constraints aligned with PDF BRD

---

## Removal/Deferral Action Plan

### 🚨 CRITICAL - Must Fix

1. **Remove driver reuse from journey steps**
   - File: `src/domain/intent-model/model.ts`
   - Journey: `lsp-books-pickup` step 5 (line ~459)
   - **Change from:** "Select existing driver from account-scoped list (search/dropdown) or enter new driver details..."
   - **Change to:** "Enter driver details (name, license number, truck registration) fresh for each booking. Driver reuse functionality deferred to Phase 2 per assumption A-025."

2. **Remove or mark deferred BR-016 (driver scoping)**
   - File: `src/domain/intent-model/model.ts`
   - Business rule: BR-016 (line ~699)
   - **Option A:** Remove entirely
   - **Option B:** Mark as deferred: "Driver record scoping - DEFERRED to Phase 2. Phase 1 treats driver/truck as booking attributes only (A-025)."
   - **Recommendation:** Option B

3. **Update LSP responsibility lsp:r4**
   - File: `src/domain/intent-model/model.ts`
   - Responsibility: lsp:r4 (line ~20)
   - **Change from:** "enter truck and driver details (select existing or add new, scoped to account)"
   - **Change to:** "enter truck and driver details (name, license, truck registration)"

### ⚠️ MEDIUM - Should Fix

4. **Mark ECST assignment as deferred**
   - File: `src/domain/intent-model/model.ts`
   - Responsibility: acfs:r2 (line ~59)
   - **Option A:** Remove entirely
   - **Option B:** Add deferred note: "ECST Assignment - DEFERRED. Flow details to be defined in Phase 2."
   - **Recommendation:** Option B

5. **Clarify slot configuration journey**
   - File: `src/domain/intent-model/model.ts`
   - Journey: acfs-configures-slots (line ~414)
   - **Add note to journey:** "Note: Phase 1 implementation is backend/database configuration per C-006. UI steps described here are for Phase 2 reference."

### 📝 LOW - Consider

6. **Add note to Driver actor**
   - File: `src/domain/intent-model/model.ts`
   - Actor: driver (line ~42)
   - **Add to description:** "Note: Driver is not a portal user in traditional sense. Listed as actor for role clarity and external communication flow documentation."

7. **Keep OQ-034 as-is**
   - No action needed
   - Flag to Roni that PDF BRD Section 6.2 needs AGS integration added

---

## Before/After Examples

### Example 1: Journey Step - Driver Entry

**BEFORE (Contradicts PDF BRD):**
```typescript
{
  order: 5,
  title: 'Enter truck and driver details',
  detail: 'Select existing driver from account-scoped list (search/dropdown) or enter new driver details (name, license, truck rego). New drivers are saved to the account for future reuse. P4TC users always enter fresh details.'
}
```

**AFTER (Aligned with PDF BRD):**
```typescript
{
  order: 5,
  title: 'Enter truck and driver details',
  detail: 'Enter driver details fresh for each booking: driver name, license number, and truck registration. Driver reuse functionality is deferred to Phase 2 per assumption A-025. P4TC users follow same process.'
}
```

### Example 2: Business Rule BR-016

**BEFORE:**
```typescript
{
  id: 'BR-016',
  description: 'Driver records are scoped per LSP account. Drivers added by one LSP user are visible to all users within that same account, but NOT visible to other accounts. P4TC users do not have saved driver records.',
  applies_to: ['driver_record', 'lsp', 'user'],
  source: 'BRD v1.5 Assumption A-023',
}
```

**AFTER (Option: Mark as deferred):**
```typescript
{
  id: 'BR-016',
  description: 'Driver record scoping (DEFERRED to Phase 2): Driver records will be scoped per LSP account when driver reuse is implemented. Phase 1 treats driver details as booking attributes entered fresh each time per assumption A-025.',
  applies_to: ['driver_record'],
  source: 'Assumption A-023 (deferred per A-025)',
  warn: 'Driver reuse functionality deferred to Phase 2/fast follow',
}
```

---

## Summary of Changes

| Change Type | Count | Impact |
|-------------|-------|--------|
| **Critical** | 3 | Remove driver reuse contradiction |
| **Medium** | 2 | Mark ECST deferred, clarify slot config |
| **Low** | 2 | Add notes for clarity |
| **Total** | 7 | ~50 lines modified |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Dev team built driver reuse already | Medium | High | Check codebase, clarify with team |
| Stakeholders expect driver reuse Phase 1 | Low | High | Confirm with Roni/Matt that A-025 is correct |
| Breaking existing implementation | Low | Medium | Review code before applying changes |
| ECST needed but being removed | Very Low | Low | ECST is explicitly parked, flow undefined |

---

## Verification Checklist

After applying removal/deferral changes:

- [ ] No journey steps describe driver reuse (search for "select existing driver")
- [ ] BR-016 is marked deferred or removed
- [ ] lsp:r4 doesn't mention "select existing"
- [ ] driver_record entity still marked deferred
- [ ] acfs:r2 (ECST) marked as deferred
- [ ] Slot configuration journey has Phase 1 clarification note
- [ ] All tests still pass
- [ ] Generated BRD reflects changes

---

## Recommendation

**Proceed with both:**
1. ✅ **Additive updates** (5 missing pieces from PDF BRD)
2. 🔴 **Removal/deferral updates** (7 contradictions/clarifications)

**Combined changes:** ~80 lines total (30 additive + 50 removal/deferral)

**Timeline:** ~3 hours including testing and verification
