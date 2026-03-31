# BRD to UX Flows — Process Map Validation

> **Note:** This document uses VBS (Vehicle Booking System) as a concrete example to demonstrate the Intent Model Canvas workflow.

> Source: [Design → Engineering Process Map (FigJam)](https://www.figma.com/board/y9yjnvvSqH8d8NX6mmeqNf/Design--%3E-Engineering-Process-map)
> Validated: 2026-02-25

## What the board contains

The board maps three interconnected systems:

1. **Design System Foundation** (left) — token-driven pipeline from requirements → tokens → primitives → registry → assembly → runtime
2. **BRD → Intent Model pipeline** (center-right) — converting raw BRD into structured domain models
3. **AI-Augmented vs Traditional comparison** (two-row swim lane) — 9 stages each, showing how the same work differs

The **VBS (Vehicle Booking System)** is used as a concrete worked example — complex enough to stress-test the process.


## What's sound

### AI-Augmented track is well-structured

The 9-stage flow is logical:

```
BRD → Parse & Extract → Structure & Normalize → Analyze & Decompose →
Generate Artifacts → Apply Standards → Generate Code → Package Deliverables →
Implement & Extend → Feedback Loop
```

### Canonical Intent Layer is the strongest concept

Formalizing domain models, user roles, journeys, state machines, business rules, and acceptance criteria as a structured intermediate artifact (the JSON intent model) is the key differentiator. It eliminates the "knowledge in heads" problem that plagues the traditional track.

### Intent Model structure is thorough

The v2 model correctly captures:
- Actors with explicit responsibilities
- Entities with key fields and lifecycle states
- End-to-end journeys with preconditions and steps
- Business rules with source references
- Open questions (things the BRD deliberately left ambiguous)

### State machines are well-identified

Three orthogonal state machines (Shipment lifecycle, Slot Booking lifecycle, Pickup Execution) are the right decomposition — independent concerns that compose together.

### Traditional track is an honest comparison

"Tacit knowledge accumulation", "assumptions embedded visually", "engineers infer rules from UI" are real failure modes.


## Issues and gaps

### 1. Missing: Validation loop between Intent Model and stakeholders

The flow goes BRD → Intent Model → Sensemaking → UX Artifacts in one direction. There's no explicit step where the structured intent model gets **validated back with the business/product owner** before UX work begins. The intent model is an _interpretation_ — it needs sign-off. Without this, you risk automating the wrong understanding faster.

### 2. Missing: How "open questions" get resolved

The intent model correctly identifies open questions (e.g., "What defines digital pick?", "Minimum notice window for pre-booking?"). But the process map doesn't show **where these get resolved** before moving to UX artifacts. There should be a decision gate or feedback arc from the intent model back to the BRD owner.

### 3. Sensemaking → UX Artifacts jump is underspecified

Stage 4 (AI-Assisted Sensemaking) outputs journey decomposition and IA proposals. Stage 5 (UX Artifacts) outputs wireframes and user flows. What happens in between? The connector just says "Generate Artifacts." This is actually the hardest design step — translating structured intent into spatial/interaction design. Consider making this transition more explicit: what inputs does the UX designer actually use, and what decisions are they making vs. what's AI-generated?

### 4. Design System track and main pipeline aren't connected

The left side (ShadCN → tokens → registry → assembly) and the main BRD → code pipeline appear as separate tracks. Where exactly does "Apply Standards" (stage 6) pull from the design system registry? The connection between these two tracks should be made explicit — likely the registry feeds into both "Design System Application" and "Intent + Design → Code Translation."

### 5. "Feedback, Learning, Iteration" connector is vague

In the traditional track, specific failure modes are identified: "Rework cycle", "Major changes", "Clarification loops." But the AI-augmented track's feedback loop is a single generic arrow. What does iteration look like in this model? Does it update the intent model? Regenerate artifacts? This matters because it determines whether the system is self-correcting or just front-loaded.

### 6. No mention of testing/validation against intent

The final stages go straight to "Development & Extension" and "future STLC automation." But one of the biggest advantages of having a canonical intent layer is that **acceptance criteria and business rules become testable assertions.** The process should show how the intent model feeds into automated test generation or validation, not just code generation.

### 7. Intent Model v1 → v2 evolution is unexplained

Two intent model versions sit side by side. v2 adds `visibility_states`, `lifecycle_states`, `Tally-Out Report`, and `Notification` entities, plus BR-05 (pre-booking rules). The evolution is good, but the process map doesn't show **what triggered the refinement** — was it the sensemaking step? Stakeholder feedback? This is important because it validates whether the process actually produces better models iteratively.


## Summary

| Aspect | Verdict |
|---|---|
| Overall flow logic | Sound — stages are in the right order |
| Intent model as intermediate artifact | Strong — this is the key innovation |
| BRD example (VBS) | Thorough and realistic |
| State machine extraction | Correct decomposition |
| Traditional vs AI comparison | Honest and well-contrasted |
| Stakeholder validation loop | **Missing** |
| Open question resolution | **Missing** |
| Design system ↔ pipeline integration | **Disconnected** |
| Test generation from intent | **Missing** |
| Feedback/iteration specifics | **Underspecified** |

The core process is solid. The main risk is that it's **front-loaded but not closed-loop** — it does a great job getting from BRD to structured intent to code, but doesn't explicitly show how errors, ambiguities, and changes flow back through the system. Adding those feedback arcs would make this production-ready.
