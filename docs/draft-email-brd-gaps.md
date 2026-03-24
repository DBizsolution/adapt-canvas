# Draft Email: BRD v1.5 Proposed Updates

**To**: Roni
**Subject**: VBS BRD v1.5 Proposed Updates - 8 Items from Recent Meetings

---

Hi Roni,

I've compiled all the gaps and clarifications from our recent meetings (Kavya feedback session, delivery team discussion) and the logistics research into a comprehensive update document for BRD v1.5.

**Document**: `docs/BRD-v1.5-proposed-updates.md`

## TL;DR

- **🔴 1 Critical** (blocking data discovery): AGS integration missing from Section 6.2
- **⚠️ 4 New Requirements** (should be in BRD v1.6): Pickup site visibility, column customization, multi-key search, delegation visibility model
- **📋 3 Clarifications** (can stay in intent model): Orthogonal state dimensions, payment abstraction, driver phasing

## Most Urgent

**AGS Data Feed Integration** - BRD Section 6.2 only documents Maximus, but delivery meeting confirmed we need AGS for:
- HBL hierarchy relationships (Master → House mapping)
- Accurate consignee data (Maximus is "too inconsistent")

This is blocking Anoop's data discovery work. Matt and William are defining the integration spec, but BRD needs Section 6.3 added to reflect this.

## Next Steps

The full document has:
- Detailed description of each update
- Specific BRD section references (where to insert changes)
- Exact requirement text (ready to copy/paste)
- Rationale and meeting sources for each item
- Summary table mapping updates to BRD sections

Can we review together? I can walk through the document or we can async review and schedule a call if needed. The intent model (v0.8.0) is already updated with all these changes reflected as business rules, constraints, and open questions.

Rahul

---

**Attachment**: See `docs/BRD-v1.5-proposed-updates.md` for full details
