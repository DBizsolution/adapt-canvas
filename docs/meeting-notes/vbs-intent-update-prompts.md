# Intent Model Update Prompts

Natural prompts to paste into the AI chat panel. One at a time — review each diff before approving.

---

## Prompt 1

The HBL milestone states are wrong. There's no "created" — it starts at on_vessel. The correct milestones are: on_vessel, at_wharf, in_yard, unpacked, collected. "delegated" and "booked" are not milestones — those are HBL workflow statuses (separate thing). And under_bond is a flag on the HBL, not a lifecycle state.

Also add these fields to HBL: hbl_status (unassigned/delegated/booked), under_bond (boolean flag, set by WFF or FF staff, skips DO requirement), weight_kg, customs_clearance_status (from Maximus, display only), storage_fee_due (boolean derived from last_free_storage_date), and last_free_storage_date.

---

## Prompt 2

WFF can either delegate or book on the same HBL — never both. Update r3 and r4 to make that clear. Also remove the "request missing HBLs" part from r2 — it's not in the BRD. WFF can only search by HBL.

And BR-003 is wrong — DOs don't cascade. Each level uploads their own DO independently. 3 tiers = 3 separate DOs. The bottom person needs all of them present. Free release is the only exception where a DO isn't needed.

---

## Prompt 3

FF and Carrier both authenticate via magic link + OTP. No account creation. WFF delegates, a secure link goes to the nominated email, they click it, get an OTP to the same email, enter it, and they're in — scoped to their shipments only. Same mechanism for carriers and one-off customers. Roni is also exploring a "generic booking party login" as an alternate but that's pending.

ACFS uses SSO via OAuth/Okta — already exists. And for ff:r3, carriers come from an ACFS-maintained party registry (one-time bulk upload), not some vague "existing relationships."

---

## Prompt 4

Under-bond flagging is manual — WFF or FF staff flags it in the portal. ACFS can also flag it. Remove the warn on BR-002 and update it.

Release type: keep the field but update it. Free release is confirmed (standing arrangement between two parties like AGS and Geodis, no DO needed). Full list of release types still needed from client.

Fee calculation is per HBL individually then summed — flat minimum plus volumetric per HBL, using max of weight vs volume. But flat vs percentage is still undecided.

---

## Prompt 5

In the carrier booking journey: yes, HBLs from different WFFs can be combined in one booking. But flag that this might force a change from magic links to a proper login model. And payment is Stripe embedded checkout — no custom payment UI needed, just use Stripe's interface directly.

---

## Prompt 6

Add a Delivery Order entity. Each tier uploads their own DO and it must be explicitly mapped to specific HBLs — not bulk uploaded. That's a compliance and legal requirement. Track the validation status: not checked, pre-checked by ACFS before arrival, validated at pickup, not required (free release/under-bond), or overridden by an authorised ACFS role (needs audit trail, one-time per HBL until collected).

---

## Prompt 7

Add a Pickup Window entity for slot configuration. Per site, not global. Days of week + start/end time. Cutoffs are NOT hour-based — they're a specific date and time that ACFS sets per slot (like Friday 5pm cutoff for a Monday morning slot). No hard capacity — use a density indicator instead (ACFS sets a threshold, system shows low/moderate/high, doesn't block booking). Overlapping windows allowed. Can be blacked out for holidays.

---

## Prompt 8

Add booking_reference, site, and payment_status fields to Booking.

Update C-001: no hard capacity, just density indicator. Update C-002: cutoffs are date/time not hours, no-show rebooking is ACFS admin only and free for phase 1.

Add new constraints: ACFS can't change booked slots (phase 1), slot config is per-site, refunds are outside the portal entirely, FOC rebooking is ACFS admin only with reason required, Maximus data is periodic batch (once/twice daily, starts 7 days before vessel arrival), and the whole thing is a single app with role-based routing.

---

## Prompt 9

Add business rules: WFF either delegates or books per HBL never both. DO override needs certain ACFS roles + audit trail + reason, one-time per HBL until collected. Each DO must be mapped to specific HBLs (compliance requirement). Storage fee timer starts after unpack, just show a flag not the amount. ACFS can partially process bookings — process the cleared HBLs, hold back the ones stuck in customs.

Resolve OQ-001: party data comes from a one-time ACFS bulk upload, local DB, no Maximus sync. Update OQ-002: per-HBL volumetric confirmed but flat vs percentage still open. Add new open questions: full list of release types needed, auth model might change due to cross-WFF booking, and confirmed milestone list still pending from client.
