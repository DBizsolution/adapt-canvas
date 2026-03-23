# 3D Views Redesign — Design Spec

> Replace the current three 3D views (force graph, lifecycle, actor layers) with four new views built on a shared visual language. The views serve dual purpose: daily working tool for the team and portfolio/presentation piece.

## Visual Language

### Canvas
- Off-white (#F8F8F7) background with subtle depth fog fading to cooler white at distance
- No dark mode, no space aesthetic

### Cards (core unit)
Every model item renders as a floating card in 3D space — no spheres, no meshes.

- Frosted glass panels — semi-transparent white (#FFFFFF at 70-85% opacity), soft backdrop blur, thin 1px border (white at 30%)
- Subtle drop shadow for elevation
- Rounded corners (8px)
- Content: Lucide icon + name + one key stat (field count, step count, etc.) in DM Sans
- Cards billboard toward camera (always face you)
- Type-coded left edge strip (4px):
  - Entity: #0081F2
  - Actor: #8B5CF6
  - Journey: #10B981
  - Rule: #F59E0B
  - Constraint: #EF4444
  - Open Question: #EC4899

### Connections
- Thin lines (1px), light gray (#D4D4D4) by default
- Animate to type color on hover/selection
- Slight curve (quadratic bezier), not straight

### Interactions
- **Hover card:** slight scale up (1.05x), shadow deepens, connections highlight
- **Click card:** glow ring in type color, connected cards pull slightly closer, unrelated cards fade to 40% opacity
- **Double-click card:** opens detail in existing side panel
- **Camera:** orbit controls (drag rotate, scroll zoom, right-drag pan), smooth 300ms transitions

### Lighting
- Soft ambient + one directional light from upper-left
- No dramatic shadows — glass panels feel naturally lit, like objects on a desk near a window

### Post-processing
- Soft ambient occlusion for depth
- No bloom
- Optional subtle depth-of-field on far cards when something is selected

### Tech Stack
- React Three Fiber + Drei (replacing raw 3d-force-graph)
- Key Drei utilities: `<Billboard>`, `<Html>`, `<Float>`, `<MeshTransmissionMaterial>`, `<OrbitControls>`
- On-demand rendering (only re-render when scene changes)
- Instanced geometry where possible for performance

---

## View 1 — Galaxy

The "see everything" overview. All model items floating in 3D space.

### Layout
Items cluster by type in soft zones — archipelago, not spreadsheet:
- Entities cluster center (gravitational core)
- Actors float upper-left
- Journeys arc across the right
- Rules scatter lower-center
- Constraints and open questions at the periphery

Positioning uses a seeded force simulation that runs once on load, then locks. Same layout every time for the same model — no randomness between visits.

### Cards
Standard glass cards. Size varies by importance:
- **Entities:** larger cards — name + field count + lifecycle state count
- **Actors:** medium — name + responsibility count
- **Journeys:** medium — name + step count + primary actor badge
- **Rules:** smaller — name + applies_to count
- **Constraints/questions:** smallest

### Connections
Cross-reference lines hidden by default. Appear on hover/selection. Subtle particle drift along connections on selection (2-3 small dots traveling the line).

### Cluster Labels
Floating translucent text ("Entities", "Actors", etc.) behind each cluster, large and faded (15% opacity).

### Filter Bar
Bottom of canvas. Pill buttons to toggle type visibility (filled = active, outline = inactive). Cards animate in/out with soft fade + scale.

### Presentation Mode
Button or keyboard shortcut. Auto-orbits camera slowly. Cards face camera as it moves.

---

## View 2 — Flows

Journey visualizer. Select a journey, see it unfold as a spatial path.

### Layout
Horizontal left-to-right. Each step is a glass card on a gentle S-curved rail. Steps alternate slightly forward/back on Z axis — ribbon feel, not flat.

### Rail
Thin translucent line (#10B981 at 30% opacity) connecting step cards.

### Step Cards
Larger than Galaxy cards:
- Step number (top-left, bold)
- Title
- Detail text (2 lines max, truncated)
- Precondition badge if present (small amber tag)
- Warn/edge flags as small indicator dots

### Branching Cards
Each step surfaces what it touches as smaller cards branching vertically:
- Actor cards branch up (purple edge strip)
- Entity cards branch down-left (blue)
- Rule cards branch down-right (amber)
- Connected by curved lines to the step card

### Journey Selector
Left sidebar overlay (glass style). Lists all 14 journeys. Click to load. Entry animation: rail draws left-to-right, step cards pop in sequentially (80ms stagger), branch cards fade in after.

### Step-Through Mode
Play button. Camera focuses on step 1, advances on timer (2s) or arrow keys. Connected cards highlight as each step activates.

### Idle State
Before selection: all 14 journey cards in a loose grid with name + primary actor + step count. Click to enter flow view.

---

## View 3 — Anatomy

Entity deep-dive. Select an entity, see its full structure spatially.

### Main Panel
Large frosted glass panel at center — the "specimen on the table":
- Entity name and description
- Full field list as rows (name, type, description)
- Fields with `warn` flags get amber dot
- Integration entities get gray "Integration" badge top-right

### Lifecycle Rail
Horizontal rail below main panel:
- Each state is a small glass card on a timeline
- Directional arrows between states
- Transitions labeled (trigger text, small type)
- Guards shown as tiny lock icons
- Left-to-right flow

### Orbiting Cards
Related items float around the main panel:
- Actors who interact → upper-left
- Journeys that reference → right
- Rules that apply → below-right
- Other entities with field references → left

Connected by curved lines using the orbiting card's type color.

### Entity Selector
Glass sidebar. 12 entities listed (7 domain, 5 integrations separated by divider). Selection animation: main panel scales from center, lifecycle rail draws in, orbiting cards fade in.

### Field Hover
Hover a field row → if it references another entity, the connection line to that entity's orbiting card pulses.

### Idle State
All entities as medium glass cards in a loose cluster. Domain entities front/center, integrations slightly behind and smaller.

---

## View 4 — Domains

Actor-centric. Who owns what, how worlds overlap.

### Platforms
Each actor gets a rectangular frosted glass platform (landscape, wider than tall), angled ~15° toward camera:
- Actor name (large, top-left)
- Auth method badge (top-right — "Password", "Magic Link + OTP", "Email Only", etc.)
- Responsibilities as compact rows on the platform surface

### Depth Ordering
Actors with more connections sit closer to camera:
- ACFS closest (most responsibilities)
- Driver furthest (fewest connections)

### Floating Entities
Entities float between platforms as small glass cards. Entities referenced by multiple actors sit in the overlap zone — showing shared ownership visually. HBL in the middle (everyone touches it). Driver Record close to LSP/ACFS only.

### Journey Threads
Thin colored lines threading from actor platforms through entities:
- Each journey a different shade of green
- Hidden by default, toggle from journey filter list
- Shows how a workflow weaves across actor domains

### Click Actor
Camera zooms to that platform. Responsibilities expand to show descriptions. Connected entities pull closer, unrelated platforms fade. Connected journeys auto-highlight.

### Idle State
All platforms visible, overview perspective. Entities floating in spaces between. Spatial arrangement tells the story — ACFS at center, P4TC and Driver at edges.

---

## Migration Notes

### What gets removed
- `src/components/explorer/graph-3d.tsx` (force graph)
- `src/components/explorer/graph-3d-lifecycle.tsx` (lifecycle)
- `src/components/explorer/graph-3d-actors.tsx` (actor layers)
- `3d-force-graph` dependency

### What gets added
- `@react-three/fiber` — React renderer for Three.js
- `@react-three/drei` — helper components (Billboard, Html, Float, OrbitControls, etc.)
- `@react-three/postprocessing` — ambient occlusion, optional depth-of-field

### File structure (proposed)
```
src/components/explorer/
  views-3d/
    shared/
      glass-card.tsx        — reusable card component
      connection-line.tsx   — curved bezier connection
      scene-wrapper.tsx     — canvas, lighting, camera, post-processing
      use-graph-layout.ts   — seeded force layout hook
    galaxy/
      galaxy-view.tsx
      galaxy-data.ts        — model → galaxy nodes/edges
    flows/
      flows-view.tsx
      flows-data.ts         — model → journey path data
      journey-selector.tsx
    anatomy/
      anatomy-view.tsx
      anatomy-data.ts       — model → entity structure data
      entity-selector.tsx
    domains/
      domains-view.tsx
      domains-data.ts       — model → actor platform data
  explorer-tabs.tsx          — updated tab switcher (4 new tabs)
```

### Performance budget
- Target 60fps on mid-range laptop
- < 300 draw calls
- Instanced geometry for repeated shapes
- On-demand rendering (no continuous animation loop except presentation mode)
- DPR capped at 1.5 on high-density displays
