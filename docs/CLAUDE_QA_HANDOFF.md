# Claude QA / Repair Handoff

## Status at handoff
Gameplay/framework expansion is frozen after this milestone. The job of the next pass is not to invent more campaign systems. It is to systematically break, repair, visually verify and polish the existing game.

GitHub `main` is the source of truth. Never leave fixes only in an ephemeral sandbox.

## Required test order
1. Build/typecheck.
2. Night 1 smoke route.
3. Night 2 smoke route.
4. Night 3 smoke route.
5. Night 4 smoke route.
6. Night 5 + all ending gates.
7. Endless same-seed / strike / restart flow.
8. Achievement audit.
9. Full geometry/collision pass.
10. Final graphics/assets/lighting pass.

Use `docs/SMOKE_TEST_ROUTES.md` for the exact gameplay route.

## P0 known bugs from human playtests
These are confirmed by screenshots or direct player reports and should be treated as real until visually disproven.

### Staff-area architecture
- Manager office and restroom geometry have overlapped/clipped repeatedly.
- Restroom has presented duplicate openings / visually impossible access.
- The office/restroom/freezer relationship has been confusing and structurally unreadable.
- Required repair: rebuild this section from a clean plan rather than layering more corrective geometry over old geometry.
- Acceptance: one office, one restroom, one staff corridor, no shared volume, no duplicate openings, no see-through walls, clean colliders.

### NPC duplication / overlap
- Two NPCs have occupied the same world position.
- Earlier authored character attempts had incorrect scale.
- Customers have walked through shelves.
- Required repair: central occupancy/spawn reservation, route validation and collision-safe queue points.
- Acceptance: only one actor per reserved queue/door/aisle waypoint; no shelf traversal; consistent adult scale.

### Cooler/freezer presentation
- Cooler doors can appear completely empty.
- A rejected/unvalidated cooler GLB appeared as an unexplained object in front of the freezer bank.
- Required repair: use one approved cooler presentation path, stock it visibly, remove all duplicate/experimental stand-ins from default runtime.
- Acceptance: five readable cooler doors with stock silhouette and no mystery prop in front.

## P1 interaction / gameplay QA
- Verify every prompt is spatially aligned with the prop being targeted.
- Verify register interactions do not accidentally perform two actions on one press.
- Verify CCTV monitor can be activated from normal standing distance.
- Verify player avatar appears correctly on CCTV and never duplicates.
- Verify customer transaction interactable does not fight the base register interactable.
- Verify all Night 2-5 timed response prompts appear only while their anomaly is active.
- Verify Night 5 ending overlay cannot appear before Larry + ritual requirements.
- Verify hidden BREAK THE RULES is absent unless all sabotage gates are satisfied.
- Verify Endless overlapping anomalies never generate unavoidable strikes.

## P1 mode / progression QA
- Chapter Select respects unlock state.
- Clean completion of Night N unlocks Night N+1.
- Night 5 endings persist independently.
- Endless remains locked until campaign completion.
- New Shift resets only the current run, not account progression.
- Replaying a night does not corrupt completion history.
- Same Endless seed reproduces anomaly order.

## P1 achievement QA
Validate all 30 IDs against `docs/ACHIEVEMENT_MATRIX.md`.
Pay special attention to:
- NO SERVICE
- NOBODY HOME
- LARRY
- PERFECT WEEK
- ALL_MYTHICS
- CLOCKED_OUT_FOR_GOOD
- NIGHT MANAGER

## P2 graphics / art pass
Only after structural bugs are repaired:
- Replace placeholder humans with an approved non-chibi character family.
- Replace remaining hero primitives with authored GLB/PBR props.
- Stock coolers and shelves with recognizable products.
- Improve exterior storefront, gas pumps and signage.
- Maintain readable-dark lighting; never return to crushed-black interiors.
- Tune materials, bevel/silhouette, signage, ceiling/floor treatment and exterior canopy.
- Validate low-profile Codespaces mode separately from final visual target.
- Do not re-enable experimental GLBs by default until each asset is individually approved.

## Visual acceptance principles
- Dark does not mean invisible.
- Every hero object should be recognizable without a debug label.
- Store layout should make sense from a single walkthrough.
- Horror comes from inconsistency and anticipation, not broken geometry.
- Dale remains harmless.
- Larry remains Larry.
- No new gameplay features during QA unless required to repair a broken existing contract.

## Exit criteria for QA
The project is ready for final release polish only when:
- every route in `docs/SMOKE_TEST_ROUTES.md` passes,
- no P0 issue remains,
- no known collision blocker remains,
- all 30 achievements have reachable triggers,
- all three endings can be reached under their intended conditions,
- Endless can run, fail and restart cleanly,
- a full Night 1-5 campaign can be completed without dev controls,
- default graphics contain no rejected/experimental placeholder asset.
