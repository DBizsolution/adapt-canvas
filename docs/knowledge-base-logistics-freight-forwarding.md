# Logistics & Freight Forwarding: Domain Knowledge Base

**Purpose**: Domain reference for VBS Pickup Portal project team
**Last Updated**: 2026-03-26
**Sources**: Industry practice, ACFS context, international freight standards

---

## Quick Terminology Lookup

**Common Search Terms** (alternative names and variations):

- **Underbond / Under Bond / Under-bond / U-bond / Bonded cargo**: Goods where customs duties not yet paid, stored in bonded warehouse. See section 7.2 for details. Can move between bonded facilities without clearing customs. Requires customs bond movement permit instead of DO.

- **DO / Delivery Order / Release Order**: Authorization to release cargo from warehouse. See section 3.3. Required for pickup unless under-bond movement.

- **HBL / House Bill / House B/L / Sea Waybill**: Shipment tracking document issued by freight forwarder. See section 3.2. The core tracking unit in VBS.

- **WFF / Wholesale Freight Forwarder / NVOCC**: Top-level logistics company in delegation chain. See section 2.1.

- **FF / Freight Forwarder / Forwarder**: Arranges transportation, handles documentation. See section 2.2.

- **LSP / Logistics Service Provider**: Umbrella term for all commercial users (FF, WFF, carrier, transporter). See section 2.

- **Unpacked / Unpacking / De-van / Devanning / Unstuffing**: When container is opened and goods separated by HBL. See section 4.2. Critical milestone for booking eligibility.

- **Slot / Booking / Time slot / Pickup window**: Reserved time for truck arrival at warehouse. See section 6.2.

- **Delegation / Subcontracting / Downstream assignment**: When one LSP assigns HBL handling to another LSP. See section 5.

- **Customs cleared / Cleared / Customs clearance**: Import duties paid, permits obtained, goods can enter domestic commerce. See section 7.1.

- **Container / TEU / FEU / 20ft / 40ft**: Physical metal box for shipping. See section 3.4.

- **OBL / Ocean Bill / Master BL / MBL**: Issued by shipping line, covers entire container voyage. See section 3.1.

- **Chargeable weight / Volumetric weight / Billable weight**: Max of actual weight vs volume-based weight. See section 8.1.

- **Site / Pickup site / Warehouse / Branch / Location**: Physical ACFS facility where goods are stored. See section 10.1.

---

## 1. Overview: What Do Logistics Companies Do?

Logistics companies orchestrate the movement of goods from origin to destination. In the context of **international ocean freight** (VBS scope), they handle:

- **Documentation**: Bills of lading, customs paperwork, delivery orders
- **Coordination**: Between shippers, carriers, customs, warehouses, and end customers
- **Physical logistics**: Container booking, trucking, warehouse pickup/delivery
- **Compliance**: Customs clearance, regulatory requirements, import/export documentation
- **Financial**: Freight charges, duties, storage fees, payment collection

**Key Distinction**: Most logistics companies don't physically move cargo themselves - they **coordinate** the movement and handle paperwork on behalf of clients.

---

## 2. Types of Logistics Service Providers

### 2.1 NVOCC (Non-Vessel Operating Common Carrier)
**What they do**:
- Act as a carrier to shippers (issue their own bills of lading)
- Act as a shipper to actual ocean carriers (consolidate cargo)
- Buy space on vessels in bulk, resell to smaller shippers
- Don't own vessels but operate like a shipping line

**Example**: Company consolidates 10 small LCL (Less than Container Load) shipments into one FCL (Full Container Load), reducing cost

**Relationship to VBS**: Often the **wholesale freight forwarder** at the top of the delegation chain

### 2.2 Freight Forwarder (FF)
**What they do**:
- Arrange transportation on behalf of shippers
- Handle documentation, customs brokerage, insurance
- May specialize by mode (ocean, air, road) or trade lane
- Often subcontract to other FFs or transport carriers

**Two types**:
- **Wholesale FF**: Works with other FFs, handles larger volumes
- **Retail FF**: Direct client-facing, often handles door-to-door service

**Relationship to VBS**: Primary users - receive HBL assignments, can delegate downstream

### 2.3 Transport Carrier / Trucking Company
**What they do**:
- Provide physical trucking services
- Own/operate vehicles
- Pickup from ports/warehouses, deliver to final destination
- May also handle customs paperwork if licensed

**Relationship to VBS**: Can be an LSP that books pickup slots for their trucks

### 2.4 Customs Broker / Clearing Agent
**What they do**:
- Licensed to process customs clearance paperwork
- Communicate with customs authorities on importer's behalf
- Calculate and pay duties/taxes
- Ensure compliance with import regulations

**Relationship to VBS**: Often the same entity as an FF, but specialized role. May be the final party in delegation chain if they also arrange pickup.

---

## 3. Key Documents in Ocean Freight

### 3.1 Ocean Bill of Lading (OBL)
- **Issued by**: Ocean carrier (shipping line)
- **Purpose**: Contract of carriage, receipt of goods, document of title
- **Covers**: Entire container or vessel voyage
- **Relationship**: One OBL can cover multiple containers

### 3.2 House Bill of Lading (HBL)
- **Issued by**: Freight forwarder or NVOCC
- **Purpose**: Breaks down consolidated shipments
- **Hierarchy**: Multiple HBLs can exist under one Master HBL (MBL)
- **Example**:
  - AGS (NVOCC) issues Master HBL `AGS-500123`
  - Mondial FF (their customer) issues House HBL `4033-789` for one consignee's goods within that container

**VBS Context**: HBL is the **core tracking unit**. The portal deals with the **lowest-level HBL** in the hierarchy.

### 3.3 Delivery Order (DO)
- **Issued by**: Shipping line or freight forwarder
- **Purpose**: Authorization to release cargo from warehouse/terminal
- **Required for**: Pickup - proves the party has authority to collect the goods
- **Process**:
  1. Importer/FF pays freight charges
  2. Shipping line issues DO
  3. DO presented at warehouse to release cargo

**Hierarchy in VBS**:
- Each tier in delegation needs their own DO
- Top-level party gets DO from shipping line
- If they delegate, they issue a DO to the next party
- One HBL can have **multiple DOs** (one per delegation hop)

**Exceptions**:
- **Free Release**: Shipping line waives DO requirement (usually for trusted customers)
- **Under Bond**: Goods moving between bonded facilities before customs clearance (Australian Border Force customs bond)

### 3.4 Container vs Shipment vs HBL
**Container**:
- Physical metal box (20ft, 40ft, 45ft)
- One container can have goods for multiple importers

**Shipment**:
- Goods for one consignee within a container
- After container is unpacked, becomes an HBL-identified shipment

**HBL**:
- Documentation reference for one shipment
- Lowest-level HBL = the picking unit for warehouse operations

---

## 4. Typical Shipment Lifecycle

### 4.1 International Ocean Freight Journey
```
1. Origin
   - Shipper packs goods
   - FF arranges container booking
   - Goods loaded into container
   - Container shipped to port

2. On Vessel
   - Ocean transit (weeks)
   - Status: "On Vessel"

3. Arrival at Port
   - Vessel arrives
   - Container unloaded to wharf
   - Status: "At Wharf"

4. Container Moved to Yard
   - Container moved to unpacking facility
   - Status: "In Yard"

5. Container Unpacked
   - Container opened, goods separated by HBL
   - Individual shipments now identifiable
   - Status: "Unpacked"

6. Customs & Release
   - Customs clearance completed
   - DO validated
   - Warehouse ready to release

7. Pickup
   - Truck arrives with booking
   - Goods loaded
   - Status: "Collected"

8. Final Delivery
   - Goods delivered to consignee
   - (Outside VBS scope)
```

**VBS Scope**: Steps 5-7 (Unpacked → Booking → Pickup → Collected)

### 4.2 Why "Unpacked" Milestone Matters
Before unpacking:
- Can only track by container
- Don't know exact location of specific HBL goods
- Can't physically separate and release individual shipments

After unpacking:
- Each HBL becomes a discrete picking unit
- Warehouse knows exact location
- Can release individual HBLs without releasing entire container

**VBS Rule**: Booking requires "Unpacked" status because you can't pick what you can't locate.

---

## 5. Delegation & Subcontracting in Logistics

### 5.1 Why Delegation Happens
**Scenario 1: Specialization**
- Wholesale FF handles ocean freight
- Delegates to local FF who knows local market
- Local FF delegates to trucking company who owns vehicles

**Scenario 2: Capacity**
- FF receives more shipments than they can handle
- Delegates overflow to partner FFs

**Scenario 3: Geography**
- FF operates in Port A
- Shipment needs delivery in Port B
- Delegates to FF operating in Port B

**Scenario 4: Service Scope**
- FF handles paperwork only
- Delegates physical pickup to transport carrier

### 5.2 Delegation Chain Visibility (Industry Norm)

**Typical Practice**:
- Each party sees **one hop up** (who assigned to them)
- Each party sees **one hop down** (who they delegated to)
- **NO visibility** beyond immediate relationships
- **Exception**: Top-level party (shipper/importer) may require full visibility via contractual agreement

**Why Limited Visibility**:
- Commercial sensitivity (FFs don't want clients to know their subcontractors)
- Pricing confidentiality (margin structures hidden)
- Liability boundaries (each party responsible for their segment only)

**VBS Open Question**: Does ACFS want full chain visibility for audit/compliance? Or follow industry norm of hop-by-hop opacity?

### 5.3 DO Requirements per Delegation Tier

**Standard Industry Practice**:
- Each delegation requires new DO issuance
- Party A delegates to Party B → Party A issues DO to Party B
- Party B can't pick up without DO from Party A
- DO chain validates custody transfer authority

**VBS Context**:
- One HBL can have **multiple DOs** (one per tier)
- Each DO validated independently by ACFS
- Ensures proper chain of custody

---

## 6. Warehouse & Pickup Operations

### 6.1 Why Booking Systems Exist
**Without Booking**:
- Trucks arrive randomly
- Warehouse congestion
- Long wait times (4-6 hours common)
- Demurrage charges accumulate
- Inefficient labor allocation

**With Booking**:
- Predictable truck arrival times
- Warehouse can prepare shipments in advance
- Faster turnaround (30-60 min)
- Better resource planning
- Slot fees incentivize on-time arrival

### 6.2 Typical Slot Configuration
- **Granularity**: 1-2 hour windows (VBS: 1 hour)
- **Capacity**: Based on dock doors, labor, equipment
- **Heat Maps**: Visual indication of busy vs available slots
- **Cutoffs**:
  - Booking cutoff: When you can no longer book that slot (e.g. 4 PM previous working day)
  - Change cutoff: When you can no longer modify booking (e.g. same day 8 AM)
- **Penalties**: No-show fees, late cancellation fees

### 6.3 Gatehouse Operations
**Role**: Security checkpoint at warehouse entrance/exit

**Check-In Process**:
1. Driver arrives, presents booking reference
2. Gatehouse verifies booking exists
3. Check driver license matches booking
4. Check truck rego matches booking
5. Verify DO documents
6. Direct truck to loading bay

**Check-Out Process**:
1. Verify all goods loaded
2. Confirm HBLs match booking
3. Mark booking as "collected" in system
4. Release truck

**VBS Context**: Gatehouse deferred to Phase 2 - manual verification for Phase 1

---

## 7. Customs & Compliance

### 7.1 Customs Clearance Status
**Cleared**:
- All duties/taxes paid
- Import permits obtained
- Quarantine (if applicable) completed
- Goods can legally enter domestic commerce

**Not Cleared / Pending**:
- Missing documents
- Duties not paid
- Quarantine hold
- Compliance review in progress

**Partial Clearance**:
- Some line items cleared, others held
- **VBS doesn't support** - requires full clearance

### 7.2 Under Bond Movement
**What is Bonded Cargo**:
- Goods imported but customs duties **not yet paid**
- Stored in bonded warehouse (licensed by customs)
- Can move between bonded facilities without clearing customs

**Use Cases**:
- Transshipment (goods going to another country)
- Deferred payment of duties
- Goods pending regulatory approval

**Movement Authority**:
- Requires **customs bond movement permit** (not DO)
- Tracked by customs authorities
- Different paperwork than standard release

**VBS Context**: Under-bond flag **replaces DO requirement** - different authorization mechanism

---

## 8. Fees & Charges

### 8.1 Common Fee Types
**Freight Charges**:
- Ocean freight (per container or CBM)
- Documentation fees
- Handling charges

**Storage Fees**:
- Free days (typically 3-7 days)
- Per-day charges after free period
- Calculated based on volume and time

**Pickup Fees** (VBS scope):
- Based on weight and/or volume
- Chargeable weight = max(weight, volume)
- Minimum charge per booking
- Potential slot reservation fee

**Customs/Compliance**:
- Customs clearance fee
- Import duties (ad valorem % of goods value)
- Quarantine inspection fees

### 8.2 Who Pays What
**Shipper/Exporter** → Ocean freight, export customs
**Importer/Consignee** → Import duties, storage, pickup, delivery
**Freight Forwarder** → Advances fees, collects from client, adds margin

**VBS Context**: Only pickup fees in scope - storage/freight handled offline

---

## 9. Industry Pain Points (VBS Addresses)

### 9.1 Manual Processes
**Current State**:
- Email/phone to book pickup
- Spreadsheets to track shipments
- Physical paperwork at gatehouse
- Manual DO validation

**VBS Solution**:
- Self-service booking portal
- Real-time HBL status visibility
- Digital DO upload & validation
- Automated booking confirmation

### 9.2 Lack of Visibility
**Current State**:
- Customer calls: "Where is my shipment?"
- FF doesn't know if it's unpacked
- No way to know if DO is ready
- Uncertain if truck can pick up today

**VBS Solution**:
- Live milestone tracking
- Booking readiness validation
- DO status visibility

### 9.3 Inefficient Pickup Process
**Current State**:
- First-come-first-served at warehouse
- Long wait times
- Truck detention costs
- Wasted driver time

**VBS Solution**:
- Slot-based booking system
- Predictable arrival times
- Faster turnaround

---

## 10. VBS Context-Specific Notes

### 10.1 ACFS Business Model
- **ACFS** = Australian Container Freight Services
- Operates container terminal and unpacking facilities
- Handles last-mile logistics for ocean imports
- Revenue from storage, handling, pickup fees
- **Not a freight forwarder** - infrastructure/service provider

### 10.2 Maximus Integration
**Maximus** = ACFS's operational system of record
- Tracks container movements
- Records unpacking events
- Updates milestones
- Integrates with customs (ICS - Integrated Cargo System)

**VBS Role**: Customer-facing booking layer on top of Maximus data

### 10.3 Australian Context
**Border Force**:
- Australian customs authority
- Operates ICS (customs clearance system)
- Issues import permits, quarantine clearances

**Bonded Facilities**:
- Licensed by Border Force
- Allow duty-deferred storage
- Strict movement controls

---

## 11. Terminology Cross-Reference

| VBS Term | Also Known As | Explanation |
|----------|---------------|-------------|
| LSP (Logistics Service Provider) | FF, WFF, Carrier, Transporter | Umbrella term for all commercial users |
| HBL (House Bill of Lading) | House B/L, Sea Waybill | Shipment tracking document |
| DO (Delivery Order) | Release Order, Cargo Release | Warehouse release authorization |
| Milestone | Shipment Status, Physical Status | Where cargo is physically located |
| HBL Status | Lifecycle Status, Business Status | Assignment/delegation/booking state |
| Next Hop | Delegatee, Subcontractor, Downstream Party | Who you've delegated to |
| P4TC (Party to Collect) | One-off Party, Temporary User | Non-account holder with magic link access |
| Slot | Pickup Window, Time Slot, Booking Window | Reserved time for truck arrival |
| Chargeable Weight | Volumetric Weight, Billable Weight | max(weight_kg, volume_m3) |

---

## 12. Key Takeaways for VBS Design

1. **HBL Hierarchy Matters**: Same company can be at different tiers for different HBLs (wholesale on one, freight forwarder on another)

2. **Delegation Visibility**: Industry norm is hop-by-hop opacity - full chain visibility would be unusual (decision needed)

3. **Milestone ≠ Status**: Physical location (unpacked) is separate from business state (delegated) - both needed simultaneously

4. **DO Per Tier**: Each delegation hop requires new DO - one HBL can have multiple DOs

5. **Site Context**: Pickup site determines which warehouse, which slots available, which dock doors

6. **Under-bond is Special**: Different compliance regime, different paperwork, replaces DO requirement

7. **Booking Readiness**: Multiple conditions must be true - milestone, customs, DO, under-bond - before booking allowed

8. **"Collected" is Derived**: Not a manual status change - system infers from Maximus milestone update

9. **LSP Account = Company**: Not individual users - one login per company, internal distribution is company's problem

10. **ACFS as Platform**: Not competing with FFs - enabling their operations, taking infrastructure burden

---

## Appendix: Research Sources & Further Reading

- International Chamber of Commerce (ICC) Uniform Customs and Practice (UCP 600)
- FIATA (International Federation of Freight Forwarders) documentation standards
- Australian Border Force cargo reporting requirements
- ISO 6346 (container identification)
- ACFS operational documentation (project-specific)
