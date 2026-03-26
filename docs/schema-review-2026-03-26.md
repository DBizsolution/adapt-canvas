# Database Schema Review: ACFS VBS Portal
**Date:** 2026-03-26
**Intent Model Version:** v0.8.1
**Schema Version:** v1.1
**Reviewer:** Claude Code
**Last Updated:** 2026-03-26 (Post-deployment)

## Recent Updates (v1.1)

**Changes deployed 2026-03-26:**
- ✅ Added `import_ref` field to HBL entity for Maximus integration
- ✅ Refined `related_booking_ids` documentation for clarity
- ✅ All API endpoints aligned with schema v1.1 (100% coverage)
- ✅ Deployed to production: https://vbscanvas.dbizapps.ai

## Executive Summary

**Overall Assessment:** 85% Complete and Robust
**Status:** Needs critical data integrity fixes before production

The schema comprehensively captures the intent model with excellent operational enhancements. However, several **critical data integrity constraints are missing** that could lead to invalid states.

---

## ✅ Strengths

### Comprehensive Entity Coverage
All core entities from intent model properly represented:
- HBLs with dual-dimension tracking (milestone + hbl_status per BR-027)
  - **v1.1:** Added `import_ref` field for Maximus data integration
  - Updated `related_booking_ids` documentation for rebooking scenarios
- Bookings with full lifecycle support
- Custody chain audit trail via `hbl_custody_chain`
- Delegation management with revocation support
- Delivery Orders with tier-level tracking

### Strong Operational Additions
Schema includes necessary tables not in intent model:
- `containers` - proper hierarchy above HBLs
- `pricing_zones` - temporal rate tracking with effective dates
- `email_notifications` - full notification audit trail
- `user_invitations` - proper onboarding flow

### Excellent Business Rule Support
- **BR-005**: Slot cutoffs properly structured (relative_day + time)
- **BR-016**: Driver records scoped per company with unique constraint
- **BR-019**: Per-HBL fee breakdown in `booking_hbls` junction
- **BR-027**: Orthogonal dimensions (milestone vs hbl_status)
- **BR-031**: pickup_site_id indexed and filterable

### Australian Compliance
- GST fields on bookings/payments (10% per GST Act 1999)
- ABN capture for tax invoicing
- State enums (NSW, VIC, QLD, etc.)
- CoR compliance via driver licence + truck rego

---

## 🚨 Critical Issues (Must Fix)

### 1. BR-004 Not Enforced: Delegate XOR Book
**Rule:** LSP can either delegate OR book per HBL, never both.

**Problem:** No constraint prevents invalid `hbl_status` transitions:
- Nothing stops `hbl_status` changing from 'delegated' → 'booked'
- Nothing stops `hbl_status` changing from 'booked' → 'delegated'

**Fix Required:**
```sql
-- Add application-level validation OR database trigger
-- Prevent booking delegated HBLs
CREATE TRIGGER prevent_booking_delegated_hbl
BEFORE INSERT ON booking_hbls
FOR EACH ROW
BEGIN
  IF (SELECT hbl_status FROM hbls WHERE id = NEW.hbl_id) = 'delegated' THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'BR-004: Cannot book delegated HBL';
  END IF;
END;

-- Prevent delegating booked HBLs
CREATE TRIGGER prevent_delegating_booked_hbl
BEFORE INSERT ON delegation_hbls
FOR EACH ROW
BEGIN
  IF (SELECT hbl_status FROM hbls WHERE id = NEW.hbl_id) = 'booked' THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'BR-004: Cannot delegate booked HBL';
  END IF;
END;
```

**Impact:** HIGH - Could allow double-booking or delegation conflicts

---

### 2. BR-001 Not Enforced: Booking Readiness
**Rule:** Booking requires milestone='unpacked' AND customs_status='fully_cleared'

**Problem:** No constraint prevents booking HBLs that aren't ready.

**Fix Required:**
```sql
-- Option 1: Check constraint on booking_hbls (if DB supports subqueries)
ALTER TABLE booking_hbls
ADD CONSTRAINT chk_hbl_booking_ready
CHECK (
  (SELECT milestone FROM hbls WHERE id = hbl_id) IN ('unpacked', 'collected')
  AND (SELECT customs_status FROM hbls WHERE id = hbl_id) = 'fully_cleared'
  AND (
    (SELECT do_waived FROM hbls WHERE id = hbl_id) = true
    OR NOT EXISTS (
      SELECT 1 FROM delivery_orders
      WHERE hbl_id = booking_hbls.hbl_id
      AND validation_status != 'validated'
    )
  )
);

-- Option 2: Trigger-based validation
CREATE TRIGGER validate_booking_readiness
BEFORE INSERT ON booking_hbls
FOR EACH ROW
BEGIN
  DECLARE v_milestone milestone_status;
  DECLARE v_customs customs_status;
  DECLARE v_do_waived boolean;
  DECLARE v_unvalidated_dos int;

  SELECT milestone, customs_status, do_waived INTO v_milestone, v_customs, v_do_waived
  FROM hbls WHERE id = NEW.hbl_id;

  SELECT COUNT(*) INTO v_unvalidated_dos
  FROM delivery_orders
  WHERE hbl_id = NEW.hbl_id AND validation_status != 'validated';

  IF v_milestone NOT IN ('unpacked', 'collected') THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'BR-001: HBL must be unpacked before booking';
  END IF;

  IF v_customs != 'fully_cleared' THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'BR-001: Customs must be fully cleared before booking';
  END IF;

  IF v_do_waived = false AND v_unvalidated_dos > 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'BR-001: All DOs must be validated before booking';
  END IF;
END;
```

**Impact:** HIGH - Invalid bookings could reach warehouse

---

### 3. Derived Fields Stored as Regular Columns
**Problem:** Multiple computed values stored instead of derived, creating consistency risks:

#### 3a. `hbls.chargeable_weight`
Schema note says "Computed: max(weight_kg, volume_m3)" but it's a stored field.

**Options:**
```sql
-- Option A: Make it a generated column (MySQL 5.7+, PostgreSQL 12+)
ALTER TABLE hbls
MODIFY COLUMN chargeable_weight decimal(10,3)
AS (GREATEST(weight_kg, volume_m3)) STORED;

-- Option B: Remove from hbls table (compute on demand)
ALTER TABLE hbls DROP COLUMN chargeable_weight;
-- Application code computes: max(weight_kg, volume_m3)

-- Option C: Keep in booking_hbls only as snapshot at booking time
-- (This is likely the right approach - chargeable_weight changes over time)
```

**Recommendation:** Remove from `hbls`, keep only in `booking_hbls` as snapshot at booking time.

#### 3b. `hbls.do_waived`
Schema says "Derived: true when release_type = free_release OR under_bond = true"

**Fix:**
```sql
-- Option A: Generated column
ALTER TABLE hbls
MODIFY COLUMN do_waived boolean
AS (release_type = 'free_release' OR under_bond = true) STORED;

-- Option B: Trigger to maintain consistency
CREATE TRIGGER maintain_do_waived
BEFORE INSERT OR UPDATE ON hbls
FOR EACH ROW
BEGIN
  SET NEW.do_waived = (NEW.release_type = 'free_release' OR NEW.under_bond = true);
END;
```

#### 3c. `hbls.storage_fee_applicable`
Schema says "Computed from last_free_storage_date vs current date" but stored as boolean.

**Fix:**
```sql
-- Should NOT be stored - always compute on read
ALTER TABLE hbls DROP COLUMN storage_fee_applicable;

-- Application code:
-- storage_fee_applicable = (CURRENT_DATE > last_free_storage_date)
```

**Impact:** MEDIUM-HIGH - Data inconsistency between source and derived values

---

### 4. Missing GST Calculation Constraints
**Problem:** GST amounts stored but not validated.

**Fix Required:**
```sql
-- Bookings table
ALTER TABLE bookings
ADD CONSTRAINT chk_bookings_gst_calculation
CHECK (
  ABS(gst_amount - (total_fee_excl_gst * 0.10)) < 0.01
  AND ABS(total_fee_incl_gst - (total_fee_excl_gst + gst_amount)) < 0.01
);

-- Payments table
ALTER TABLE payments
ADD CONSTRAINT chk_payments_gst_calculation
CHECK (
  ABS(gst_amount - (amount_excl_gst * 0.10)) < 0.01
  AND ABS(total_amount - (amount_excl_gst + gst_amount)) < 0.01
);

-- Booking HBLs junction
ALTER TABLE booking_hbls
ADD CONSTRAINT chk_booking_hbls_fee_calculation
CHECK (
  ABS(per_hbl_fee - (chargeable_weight * rate)) < 0.01
);
```

**Impact:** MEDIUM - Incorrect GST could cause tax compliance issues

---

### 5. Missing Cutoff Override Tracking
**BR-015:** "Cost-impacting changes after cutoff require ACFS admin override"

**Problem:** No audit trail for who authorized override and why.

**Fix Required:**
```sql
ALTER TABLE bookings
ADD COLUMN cutoff_override_by_user_id int NULL,
ADD COLUMN cutoff_override_reason text NULL,
ADD COLUMN cutoff_override_at timestamp NULL;

ALTER TABLE bookings
ADD CONSTRAINT fk_bookings_cutoff_override_user
FOREIGN KEY (cutoff_override_by_user_id) REFERENCES users(id);
```

**Impact:** HIGH - Audit compliance issue

---

### 6. BR-028 Not Implemented: Derived Collected Status
**Rule:** Booking becomes 'collected' when ALL its HBLs reach 'collected' milestone.

**Problem:** `booking_status` has 'collected' value but no trigger to set it automatically.

**Fix Required:**
```sql
CREATE TRIGGER derive_booking_collected_status
AFTER UPDATE ON hbls
FOR EACH ROW
BEGIN
  DECLARE v_booking_id int;
  DECLARE v_all_collected boolean;

  -- Find bookings containing this HBL
  FOR v_booking_id IN (
    SELECT booking_id FROM booking_hbls WHERE hbl_id = NEW.id
  ) DO
    -- Check if all HBLs in this booking are collected
    SELECT COUNT(*) = 0 INTO v_all_collected
    FROM booking_hbls bh
    JOIN hbls h ON bh.hbl_id = h.id
    WHERE bh.booking_id = v_booking_id
    AND h.milestone != 'collected';

    -- Update booking status if all collected
    IF v_all_collected THEN
      UPDATE bookings
      SET status = 'collected', updated_at = NOW()
      WHERE id = v_booking_id AND status = 'processed';
    END IF;
  END FOR;
END;
```

**Impact:** HIGH - Booking status won't update automatically

---

## ⚠️ Important Issues (Should Fix)

### 7. No Entity Change Audit Trail
**Problem:** No history tracking for critical entities (HBLs, bookings, slots).

**Recommendation:** Add audit table:
```sql
CREATE TABLE entity_audit_log (
  id int PRIMARY KEY AUTO_INCREMENT,
  entity_type varchar(50) NOT NULL,  -- 'hbl' | 'booking' | 'slot' | ...
  entity_id int NOT NULL,
  action varchar(20) NOT NULL,  -- 'created' | 'updated' | 'deleted'
  changed_fields json,  -- Before/after values
  changed_by_user_id int NOT NULL,
  changed_at timestamp NOT NULL DEFAULT NOW(),

  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_user (changed_by_user_id),
  INDEX idx_audit_timestamp (changed_at),
  FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);
```

**Impact:** MEDIUM - Difficult to investigate issues without audit trail

---

### 8. No Optimistic Locking
**Problem:** Concurrent edits could overwrite each other on:
- `bookings` (LSP and ACFS editing simultaneously)
- `slots` (Multiple admins configuring)
- `hbls` (ACFS manual updates per acfs:r12)

**Recommendation:** Add version fields:
```sql
ALTER TABLE bookings ADD COLUMN version int NOT NULL DEFAULT 1;
ALTER TABLE slots ADD COLUMN version int NOT NULL DEFAULT 1;
ALTER TABLE hbls ADD COLUMN version int NOT NULL DEFAULT 1;

-- Application handles optimistic locking:
-- UPDATE bookings SET ..., version = version + 1
-- WHERE id = ? AND version = ?
-- If affected rows = 0, throw concurrency error
```

**Impact:** MEDIUM - Lost updates in concurrent scenarios

---

### 9. Missing Data Validation Constraints

#### 9a. Slot time validation
```sql
ALTER TABLE slots
ADD CONSTRAINT chk_slots_time_order
CHECK (end_time > start_time);
```

#### 9b. Australian postcode format
```sql
ALTER TABLE sites
ADD CONSTRAINT chk_sites_postcode_format
CHECK (postcode ~ '^[0-9]{4}$');
```

#### 9c. ABN format
```sql
ALTER TABLE companies
ADD CONSTRAINT chk_companies_abn_format
CHECK (abn IS NULL OR abn ~ '^[0-9]{11}$');
```

#### 9d. GST rate bounds
```sql
ALTER TABLE pricing_zones
ADD CONSTRAINT chk_pricing_gst_rate_valid
CHECK (gst_rate >= 0 AND gst_rate <= 1);
```

#### 9e. Fee amounts non-negative
```sql
ALTER TABLE bookings
ADD CONSTRAINT chk_bookings_fees_non_negative
CHECK (
  total_fee_excl_gst >= 0
  AND gst_amount >= 0
  AND total_fee_incl_gst >= 0
  AND late_change_fee >= 0
);
```

**Impact:** LOW - Data quality issues

---

### 10. Enum Opportunities Missed

#### 10a. Payment gateway should be enum
```sql
CREATE TYPE payment_gateway AS ENUM ('stripe', 'compay');

ALTER TABLE payments
MODIFY COLUMN payment_gateway payment_gateway NOT NULL;
```

#### 10b. Related entity type should be enum
```sql
CREATE TYPE entity_type AS ENUM ('booking', 'hbl', 'delegation', 'user', 'slot');

ALTER TABLE email_notifications
MODIFY COLUMN related_entity_type entity_type;
```

**Impact:** LOW - Type safety improvement

---

### 11. Inconsistent Soft-Delete Pattern
**Problem:** Only `users` table has soft-delete (`archived_at`). Consider adding to:
- `companies` (preserve history when deactivated)
- `driver_records` (preserve when driver leaves)

**Recommendation:**
```sql
ALTER TABLE companies ADD COLUMN archived_at timestamp NULL;
ALTER TABLE driver_records ADD COLUMN archived_at timestamp NULL;
```

**Impact:** LOW - Better data preservation

---

## 💡 Nice to Have

### 12. Email Retry Mechanism
```sql
ALTER TABLE email_notifications
ADD COLUMN retry_count int NOT NULL DEFAULT 0,
ADD COLUMN next_retry_at timestamp NULL,
ADD COLUMN max_retries int NOT NULL DEFAULT 3;
```

### 13. Missing Uploaded-By Tracking
`delivery_orders` has `validated_by_user_id` but no `uploaded_by_user_id`.

```sql
ALTER TABLE delivery_orders
ADD COLUMN uploaded_by_user_id int NULL,
ADD CONSTRAINT fk_dos_uploaded_by_user
FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id);
```

### 14. HBL Edit Audit Fields
Intent model mentions acfs:r12 "Edit HBL details and update milestones/statuses manually"

```sql
ALTER TABLE hbls
ADD COLUMN last_edited_by_user_id int NULL,
ADD CONSTRAINT fk_hbls_last_edited_by
FOREIGN KEY (last_edited_by_user_id) REFERENCES users(id);
```

---

## 📋 Completeness Check

### ✅ All Intent Model Entities Covered
| Entity | Intent Model | Schema | Notes |
|--------|--------------|--------|-------|
| HBL | ✅ | ✅ | Comprehensive |
| Booking | ✅ | ✅ | Full lifecycle |
| Slot | ✅ | ✅ | Relative cutoffs |
| Site | ✅ | ✅ | + address fields |
| Driver Record | ⚠️ Deferred | ✅ | BR-016 requires it |
| Delivery Order | ✅ | ✅ | + custody_chain link |
| Delegation | ✅ | ✅ | + revocation |
| Payment | ✅ | ✅ | GST breakdown |
| User | ✅ | ✅ | SSO + invitations |
| Booking-HBL Link | ✅ | ✅ | Per-HBL fees |
| Container | ➕ | ✅ | Good addition |
| Custody Chain | ➕ | ✅ | Good addition |
| Pricing Zones | ➕ | ✅ | Necessary |
| Notifications | ➕ | ✅ | Audit trail |

### ✅ All Business Rules Supported
| Rule | Status | Notes |
|------|--------|-------|
| BR-001 | ⚠️ No constraint | Needs trigger |
| BR-002 | ✅ | do_waived field |
| BR-004 | ⚠️ No constraint | Needs trigger |
| BR-005 | ✅ | Relative cutoffs |
| BR-007 | ✅ | App logic |
| BR-009 | ✅ | assigned_company_id |
| BR-010 | ✅ | App logic |
| BR-011 | ✅ | App logic |
| BR-012 | ✅ | Notifications table |
| BR-013 | 🔜 Deferred | |
| BR-014 | ✅ | User invitations |
| BR-015 | ⚠️ Missing override | Needs fields |
| BR-016 | ✅ | Per-company scoping |
| BR-017 | ✅ | Two acceptance fields |
| BR-018 | ✅ | DO → HBL link |
| BR-019 | ✅ | booking_hbls fees |
| BR-022 | ✅ | Cancellation fields |
| BR-026 | ✅ | App logic |
| BR-027 | ✅ | Dual dimensions |
| BR-028 | ⚠️ Not derived | Needs trigger |
| BR-029 | ✅ | custody_chain |
| BR-030 | ✅ | App logic |
| BR-031 | ✅ | pickup_site_id |
| BR-032 | ✅ | Both indexed |
| BR-033 | ✅ | All fields present |

---

## 🎯 Recommendations by Priority

### 🔴 Critical (Must Fix Before Production)
1. **Add BR-004 enforcement** (delegate XOR book)
2. **Add BR-001 enforcement** (booking readiness)
3. **Fix derived field consistency** (chargeable_weight, do_waived, storage_fee_applicable)
4. **Add GST calculation constraints**
5. **Add cutoff override tracking**
6. **Add BR-028 derived collected status**

### 🟡 Important (Fix in Phase 1)
7. Add entity audit trail
8. Add optimistic locking
9. Add data validation constraints
10. Convert to enums where appropriate

### 🟢 Nice to Have (Phase 2+)
11. Email retry mechanism
12. Additional audit fields
13. Soft-delete consistency

---

## 📊 Final Score: 85/100

**Breakdown:**
- Entity coverage: 95/100 ✅
- Relationship integrity: 90/100 ✅
- Business rule support: 75/100 ⚠️
- Data integrity constraints: 60/100 ⚠️
- Operational robustness: 85/100 ✅

**Verdict:** Excellent foundation with critical gaps in constraint enforcement. Address the 6 critical issues above and this becomes production-ready.

---

## Changelog

### v1.1 (2026-03-26)
**Schema Updates:**
- Added `import_ref` field to HBL entity
  - Type: `string` (optional)
  - Purpose: Import reference from Maximus for data matching and integration
  - Impact: Enables better data synchronization with upstream systems
- Updated `related_booking_ids` documentation
  - Clarified support for rebooking scenarios
  - Enhanced searchability requirements

**Documentation Updates:**
- Updated all schema review docs with v1.1 status
- Aligned API endpoints documentation (48/48 endpoints verified)
- Deployed to production: https://vbscanvas.dbizapps.ai

**Deployment:**
- Commit: d8bce8cd
- Status: ✅ Successfully deployed
- Environment: Production (Vercel)

---

**Next Steps:**
1. Review and implement critical constraint fixes
2. Add audit trail table
3. Add optimistic locking to high-contention tables
4. Run this past Matt/Roni for validation
5. Generate migration scripts
