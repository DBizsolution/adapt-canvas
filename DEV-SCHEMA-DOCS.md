# Developer Documentation: Schema Implementation

**For:** Backend developers implementing the database
**Status:** All docs deployed and accessible at https://vbscanvas.dbizapps.ai

---

## 📚 Required Reading (In Order)

### 1. 🚀 Quick Start Guide (START HERE)
**What:** Step-by-step instructions to implement schema v1.1
**Best for:** Developers ready to implement the fixes
**Link:** https://vbscanvas.dbizapps.ai/review/docs?doc=quickstart-schema-fix

**Contents:**
- What files are available
- How to apply the schema (fresh database approach)
- Migration script locations
- Testing checklist
- Troubleshooting common issues

---

### 2. 📋 Schema Review (Understand What's Wrong)
**What:** Comprehensive review identifying 6 critical issues + recommendations
**Best for:** Understanding WHY changes are needed
**Link:** https://vbscanvas.dbizapps.ai/review/docs?doc=schema-review

**Key Sections:**
- **Critical Issues (Must Fix):**
  1. BR-004: Delegate XOR Book enforcement
  2. BR-001: Booking readiness validation
  3. Derived fields consistency
  4. GST calculation constraints
  5. Cutoff override tracking
  6. BR-028: Collected status automation
- **Important Issues (Should Fix):**
  - Entity audit trail
  - Optimistic locking
  - Data validation constraints
- **Completeness Check:** All intent model entities mapped to schema

---

### 3. 🛠️ Implementation Strategy (How to Fix It)
**What:** Detailed implementation guide with code examples
**Best for:** Writing the actual fix code
**Link:** https://vbscanvas.dbizapps.ai/review/docs?doc=schema-fix-strategy

**Key Sections:**
- **Critical Fix #1:** BR-004 Delegate XOR Book
  - Zod schemas for validation
  - Service layer enforcement with transactions
  - Database trigger safety net (PostgreSQL)
- **Critical Fix #2:** BR-001 Booking Readiness
  - `checkBookingReadiness()` function with detailed errors
  - UI integration examples
- **Critical Fix #3:** Derived Fields
  - Remove `chargeable_weight` from HBLs table
  - Make `do_waived` a generated column
  - Remove `storage_fee_applicable`
- **Critical Fix #4:** GST Constraints
  - Check constraints with ±1¢ tolerance
  - Helper functions for GST calculation
- **Critical Fix #5:** Cutoff Override Tracking
  - New audit columns
  - Admin override workflow
- **Critical Fix #6:** BR-028 Collected Status
  - Background job implementation (recommended)
  - Database trigger alternative

**Includes:**
- Full TypeScript/SQL code examples
- Migration script templates
- Testing checklist
- Monitoring & alerts setup

---

### 4. 🔌 API Endpoints Alignment
**What:** Verification that all 48 API endpoints match schema v1.1
**Best for:** Frontend/API developers validating their work
**Link:** https://vbscanvas.dbizapps.ai/review/docs?doc=api-endpoints-alignment

**Key Sections:**
- Changes made (100+ mismatches fixed)
- ID type corrections (UUID → number)
- Table name corrections
- Enum value corrections
- Breaking changes for API implementation
- Impact analysis by domain

---

## 🎯 Quick Reference by Role

### Backend Developer (Database)
**Priority order:**
1. [Quick Start Guide](https://vbscanvas.dbizapps.ai/review/docs?doc=quickstart-schema-fix) - Apply schema
2. [Schema Review](https://vbscanvas.dbizapps.ai/review/docs?doc=schema-review) - Understand issues
3. [Implementation Strategy](https://vbscanvas.dbizapps.ai/review/docs?doc=schema-fix-strategy) - Fix code

### Backend Developer (API)
**Priority order:**
1. [API Endpoints Alignment](https://vbscanvas.dbizapps.ai/review/docs?doc=api-endpoints-alignment) - Validate endpoints
2. [Schema Review](https://vbscanvas.dbizapps.ai/review/docs?doc=schema-review) - Business rules
3. [Implementation Strategy](https://vbscanvas.dbizapps.ai/review/docs?doc=schema-fix-strategy) - Service layer code

### Frontend Developer
**Priority order:**
1. [API Endpoints Alignment](https://vbscanvas.dbizapps.ai/review/docs?doc=api-endpoints-alignment) - API contract
2. [Schema Review](https://vbscanvas.dbizapps.ai/review/docs?doc=schema-review) - Data model understanding

### Tech Lead / Architect
**Priority order:**
1. [Schema Review](https://vbscanvas.dbizapps.ai/review/docs?doc=schema-review) - Assessment
2. [Implementation Strategy](https://vbscanvas.dbizapps.ai/review/docs?doc=schema-fix-strategy) - Approach
3. [API Endpoints Alignment](https://vbscanvas.dbizapps.ai/review/docs?doc=api-endpoints-alignment) - Impact

---

## 📂 File Locations (For Direct Access)

### Web Interface (Recommended)
Navigate to: https://vbscanvas.dbizapps.ai/review/docs

All documents appear in the left sidebar under **Project** category.

### Repository Files
- **Root directory:**
  - `schema-review.md`
  - `QUICKSTART-SCHEMA-FIX.md`
  - `schema-fix-strategy.md`
  - `API-ENDPOINTS-SCHEMA-ALIGNMENT.md`
  - `SCHEMA-DOCS-UPDATE-SUMMARY.md`

- **Docs directory (served on web):**
  - `docs/schema-review-2026-03-26.md`
  - `docs/project/QUICKSTART-SCHEMA-FIX.md`
  - `docs/project/schema-fix-strategy.md`
  - `docs/project/API-ENDPOINTS-SCHEMA-ALIGNMENT.md`

---

## 🚀 Implementation Checklist

### Phase 1: Database Schema (Week 1)
- [ ] Read Quick Start Guide
- [ ] Review schema-review.md critical issues section
- [ ] Create migration script following schema-fix-strategy.md
- [ ] Test migration on dev database
- [ ] Apply to staging environment

### Phase 2: Application Logic (Week 1-2)
- [ ] Implement BR-001 booking readiness validation
- [ ] Implement BR-004 delegate XOR book validation
- [ ] Add GST calculation helpers
- [ ] Add cutoff override logic
- [ ] Write unit tests

### Phase 3: Background Jobs (Week 2)
- [ ] Implement BR-028 collected status job
- [ ] Set up monitoring
- [ ] Test in staging

### Phase 4: Validation (Week 2-3)
- [ ] Verify API endpoints alignment
- [ ] Run integration tests
- [ ] Performance testing
- [ ] Security review

---

## ⚡ Critical Notes

### For Database Implementation

**IMPORTANT: No Production Data Exists**
- You have a **clean slate** - no migration complexity
- Recommended approach: **Fresh database creation**
- Use the SQL in schema-fix-strategy.md as starting point
- All generated columns, constraints, and triggers can be applied from scratch

**Must-Fix Before Production:**
1. ✅ BR-004 trigger (prevents booking delegated HBLs)
2. ✅ GST calculation constraints (tax compliance)
3. ✅ Generated column for `do_waived` (data consistency)
4. ✅ Cutoff override audit fields (compliance)

**Database Choice:**
- Schema is PostgreSQL-optimized
- Uses GENERATED columns (requires PostgreSQL 12+)
- Triggers use plpgsql syntax

### For API Implementation

**Breaking Changes:**
- All IDs are `int`, not UUID
- Enum values changed (see alignment doc)
- Table names: `driver_records` not `drivers`
- Pricing is weight-based, not flat fee
- Slots use relative cutoffs, no hard capacity

---

## 🆘 Getting Help

### Questions About...

**Schema design:**
- See: [Schema Review](https://vbscanvas.dbizapps.ai/review/docs?doc=schema-review)
- Section: "Critical Issues" or "Business Rules Validation"

**Implementation:**
- See: [Implementation Strategy](https://vbscanvas.dbizapps.ai/review/docs?doc=schema-fix-strategy)
- Look for code examples in relevant "Critical Fix #N" section

**API contract:**
- See: [API Endpoints Alignment](https://vbscanvas.dbizapps.ai/review/docs?doc=api-endpoints-alignment)
- Section: "Changes Made" or "Impact Analysis"

**Quick answers:**
- See: [Quick Start Guide](https://vbscanvas.dbizapps.ai/review/docs?doc=quickstart-schema-fix)
- Section: "Troubleshooting"

---

## 📊 Document Status

| Document | Status | Last Updated | Version |
|----------|--------|--------------|---------|
| Quick Start Guide | ✅ Live | 2026-03-26 | v1.1 |
| Schema Review | ✅ Live | 2026-03-26 | v1.1 |
| Implementation Strategy | ✅ Live | 2026-03-26 | v1.1 |
| API Endpoints Alignment | ✅ Live | 2026-03-26 | v1.1 |

All documents reflect schema v1.1 with `import_ref` field addition.

---

## 🔗 All Links at a Glance

**Main Portal:** https://vbscanvas.dbizapps.ai

**Documentation:**
- 🚀 [Quick Start](https://vbscanvas.dbizapps.ai/review/docs?doc=quickstart-schema-fix)
- 📋 [Schema Review](https://vbscanvas.dbizapps.ai/review/docs?doc=schema-review)
- 🛠️ [Implementation Strategy](https://vbscanvas.dbizapps.ai/review/docs?doc=schema-fix-strategy)
- 🔌 [API Alignment](https://vbscanvas.dbizapps.ai/review/docs?doc=api-endpoints-alignment)

**Other Resources:**
- 📖 [BRD v1.5](https://vbscanvas.dbizapps.ai/review/docs?doc=brd)
- 👥 [Team Guide](https://vbscanvas.dbizapps.ai/review/docs?doc=team-guide)
- 🔄 [Changelog](https://vbscanvas.dbizapps.ai/review/docs?doc=changelog)

---

**Last Updated:** 2026-03-26
**Schema Version:** v1.1
**Deployment:** Production (Vercel)
