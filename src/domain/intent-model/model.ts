import type { IntentModel } from './types'

export const intentModel: IntentModel = {
  meta: {
    version: '0.1.0',
    project: 'ACFS VBS Pickup Portal',
    lastUpdated: '2026-03-16',
    status: 'draft',
  },
  actors: [
    {
      id: 'wff',
      name: 'Wholesale Freight Forwarder',
      description: 'Top-level party (AGS, DHL, Mondiale) with visibility over all HBLs auto-assigned from Maximas.',
      auth: 'Username + password. Can self-register.',
      responsibilities: [
        { id: 'wff:r1', description: 'View all HBLs auto-assigned from Maximas with status, payment, delegation, and booking info.' },
        { id: 'wff:r2', description: 'Search by HBL# and request missing HBLs be added for pickup.', edge: 'No defined flow for what happens after request — manual ACFS process?' },
        { id: 'wff:r3', description: 'Delegate booking responsibility to an existing FF or Transport Carrier.', warn: 'BRD frames delegation as FF action, flow shows WFF delegating directly. Needs confirmation.' },
        { id: 'wff:r4', description: 'Book pickup directly without delegating — select slot, pay, add driver/truck details.', warn: 'Can WFF book AND delegate? Or is it one or the other?' },
        { id: 'wff:r5', description: 'Upload Delivery Order for downstream FF/TC enforcement.' },
      ],
    },
    {
      id: 'ff',
      name: 'Freight Forwarder',
      description: 'Downstream/tiered forwarder who receives delegated HBLs and manages DOs.',
      auth: 'Username + password assumed — not specified in BRD.',
      responsibilities: [
        { id: 'ff:r1', description: 'View assigned HBLs with milestones, status, and release-authority indicators.' },
        { id: 'ff:r2', description: 'Upload or ensure required DOs are available. Required unless free-release or under-bond.' },
        { id: 'ff:r3', description: 'Nominate/select a carrier from existing relationships.', warn: 'How are "existing relationships" maintained? Is there a carrier directory?' },
      ],
    },
    {
      id: 'carrier',
      name: 'Transport Carrier',
      description: 'Books pickup slots, provides driver/truck details, pays fees.',
      auth: 'Username + password assumed.',
      responsibilities: [
        { id: 'carrier:r1', description: 'View delegated HBLs ready for pickup.' },
        { id: 'carrier:r2', description: 'Select available pickup window and book slot.' },
        { id: 'carrier:r3', description: 'Provide driver name, license, truck rego, and contact details.' },
        { id: 'carrier:r4', description: 'Pay booking fee (minimum charge + volumetric).' },
      ],
    },
  ],
  entities: [
    {
      id: 'hbl',
      name: 'House Bill of Lading (HBL)',
      description: 'Primary tracking unit for a shipment. Sourced from Maximas.',
      key_fields: [
        { name: 'hbl_number', type: 'string', description: 'Unique identifier from Maximas.' },
        { name: 'consignee', type: 'string', description: 'Party receiving the goods.' },
        { name: 'volume_m3', type: 'number', description: 'Volumetric measurement for fee calculation.' },
        { name: 'release_type', type: "'free_release' | 'under_bond'", description: 'Determines DO requirements.', warn: 'Exact release types and their rules need confirmation.' },
        { name: 'status', type: 'HblStatus', description: 'Current lifecycle state.' },
      ],
      lifecycle: {
        states: ['created', 'at_wharf', 'unpacked', 'delegated', 'booked', 'under_bond', 'collected'],
        transitions: [
          { from: 'created', to: 'at_wharf', trigger: 'Vessel arrives at port', guard: 'Maximas status update' },
          { from: 'at_wharf', to: 'unpacked', trigger: 'Container unpacked at warehouse' },
          { from: 'unpacked', to: 'delegated', trigger: 'WFF or FF delegates to downstream party' },
          { from: 'unpacked', to: 'booked', trigger: 'Direct booking by WFF without delegation', warn: 'Can skip delegation — is this always valid?' },
          { from: 'delegated', to: 'booked', trigger: 'Carrier books pickup slot', guard: 'Release conditions met + DO validated (unless under-bond)' },
          { from: 'booked', to: 'collected', trigger: 'Goods physically picked up from warehouse' },
        ],
      },
    },
    {
      id: 'booking',
      name: 'Booking',
      description: 'Groups one or more HBLs into a pickup window with driver/truck details.',
      key_fields: [
        { name: 'booking_id', type: 'string', description: 'System-generated unique ID.' },
        { name: 'pickup_window', type: 'PickupWindow', description: 'Selected date/time slot.' },
        { name: 'hbl_ids', type: 'string[]', description: 'HBLs included in this booking.' },
        { name: 'driver_name', type: 'string', description: 'Driver performing pickup.' },
        { name: 'truck_rego', type: 'string', description: 'Vehicle registration.' },
        { name: 'fee_amount', type: 'number', description: 'Calculated fee (minimum + volumetric).', warn: 'Fee method (flat vs percentage) needs business decision.' },
      ],
      lifecycle: {
        states: ['draft', 'booked', 'pending_processing', 'processed', 'collected'],
        transitions: [
          { from: 'draft', to: 'booked', trigger: 'Carrier confirms and pays', guard: 'All HBLs unpacked + release conditions met' },
          { from: 'booked', to: 'pending_processing', trigger: 'ACFS staff begins pre-check' },
          { from: 'pending_processing', to: 'processed', trigger: 'ACFS validates all DOs and marks ready' },
          { from: 'processed', to: 'collected', trigger: 'Gatehouse confirms vehicle exit' },
        ],
      },
    },
  ],
  journeys: [
    {
      id: 'carrier-books-pickup',
      name: 'Carrier Books a Pickup',
      primary_actor: 'carrier',
      preconditions: [
        'Carrier has been delegated one or more HBLs',
        'HBLs are in "unpacked" or "delegated" status',
        'Release conditions are met (DO validated or under-bond)',
      ],
      steps: [
        { order: 1, title: 'View delegated HBLs', detail: 'Carrier logs in and sees list of HBLs delegated to them, filtered by status.' },
        { order: 2, title: 'Select HBLs for pickup', detail: 'Carrier selects one or more HBLs to group into a single booking.', warn: 'Can HBLs from different WFFs be combined in one booking?' },
        { order: 3, title: 'Choose pickup window', detail: 'System shows available slots based on site capacity and cut-off times.' },
        { order: 4, title: 'Enter driver and truck details', detail: 'Carrier provides driver name, license number, truck rego, and contact phone.' },
        { order: 5, title: 'Pay booking fee', detail: 'System calculates fee (minimum charge + volumetric per HBL). Carrier pays.', warn: 'Payment integration not specified — stub for PoC.' },
        { order: 6, title: 'Receive confirmation', detail: 'Booking moves to "booked" status. Carrier receives confirmation with booking reference.' },
      ],
      success_outcome: 'Booking is confirmed with a scheduled pickup window, and all HBLs are in "booked" status.',
    },
  ],
  business_rules: [
    {
      id: 'BR-001',
      description: 'Delegation can happen before unpack; booking cannot. A booking requires all included HBLs to be in "unpacked" status or later.',
      applies_to: ['hbl', 'booking'],
      source: 'BRD s4.2',
    },
    {
      id: 'BR-002',
      description: 'Under-bond HBLs skip the DO requirement. Verification happens outside the portal by ACFS.',
      applies_to: ['hbl'],
      source: 'BRD s4.3',
      warn: 'How does the portal know an HBL is under-bond? Maximas field?',
    },
    {
      id: 'BR-003',
      description: 'DO rules follow a 3-level hierarchy: WFF → FF → Carrier/Customer. Each level can upload a DO that applies to the levels below.',
      applies_to: ['hbl', 'wff', 'ff', 'carrier'],
      source: 'BRD s4.4',
    },
  ],
  constraints: [
    {
      id: 'C-001',
      constraint: 'Pickup windows have finite capacity per site per time slot. Overbooking is not allowed.',
      type: 'capacity',
    },
    {
      id: 'C-002',
      constraint: 'Booking changes after cut-off time incur a change fee. No-shows incur a rebooking fee.',
      type: 'pricing',
    },
  ],
  open_questions: [
    {
      id: 'OQ-001',
      question: 'How is Tier-2 FF data sourced? Are they registered in Maximas or only in the portal?',
      reason: 'Delegation flow depends on knowing which FFs exist in the system.',
      status: 'open',
    },
    {
      id: 'OQ-002',
      question: 'What is the exact fee method — flat rate per HBL or percentage of declared value?',
      reason: 'Fee calculation logic in the booking flow depends on this decision.',
      status: 'open',
    },
  ],
}
