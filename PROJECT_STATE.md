# Open All Night — Project State

## Current phase
Playable Night 1 vertical slice with customer loop, anomalies, chores, CCTV, power event, fuel authorization, delivery work, exterior forecourt, and a real shift-ending loop.

## Source of truth
This GitHub repository is authoritative. No AI sandbox is allowed to be the only copy of project work.

## Engine
PlayCanvas Engine, standalone code-first workflow using TypeScript + Vite.

## Current implementation
- PlayCanvas/Vite/TypeScript scaffold
- First-person WASD movement and mouse look
- Tuned movement: 4.8 m/s walk, 7.3 m/s sprint
- Custom AABB collision for store and exterior
- Context-sensitive E interactions using center-screen aim-ray proximity rather than broad nearby cones
- Per-prop interaction aim radii for monitor, chores, register, notebook, coffee, cooler, rear door, etc.
- Crosshair, interaction prompt, task panel, clock, warning flash and vignette feedback
- NEW SHIFT reset control for clean Night 1 playtests
- Optional `?dev=1` time-skip controls (+15/+30/+60 game minutes) so Codespaces testing does not require waiting through the full shift
- Canon time pacing: 1 in-game hour = 4 real minutes
- Local autosave of clock/task progress and dynamic tasks
- Full convenience-store shell at gameplay scale
- Front entrance/windows and door-threshold chime behavior
- Front-left checkout counter and POS silhouette
- Register transaction foundation with auto-calculated change
- Register prompt changes contextually: clock in / ring up items / use register
- First customer visibly places a drink and candy bar on the counter before checkout
- Night clerk notebook interaction with the three initial Night 1 rules
- Front-right coffee station and brew task
- Four stocked aisle fixtures
- Rear refrigerated cooler bank with dedicated cool interior lighting
- Freezer Flicker anomaly with Rule 1 zone checking and violation feedback
- Basic customer actor construction and waypoint movement
- First normal customer arrival, shopping route, register wait, transaction and departure
- Silent Customer anomaly: enters without chime, waits at register, exposes E — TALK temptation, records rule break or survival
- Timed Night 1 chores: Aisle 1 restock, Aisle 3 spill cleanup, counter trash
- Chore prompts target the actual visible carton/spill/trash prop rather than adjacent shelf areas
- Rear breaker box and timed partial-power outage with reset task
- Rear staff area rebuilt into three readable zones:
  - enclosed manager office on the far-left rear
  - middle stock/utility area
  - restroom/cooler side kept separate
- Manager office uses ONE side doorway from the stock/utility room
- Stale stock-area collision blockers removed so the office route is navigable
- Manager office includes desk, monitor, chair, filing cabinet, bulletin board/papers, warm desk light and brighter ceiling fixture
- Stock/utility corridor has two visible cool-white fixtures
- Rear delivery door sits in the stock/utility zone with visible push bar
- Functional CCTV mode on the office monitor with eight switchable cameras
  - Camera 4 covers aisles 3–4
  - Camera 6 is now an exterior rear-delivery/loading camera
  - Exterior pump/road cameras included
- Player has a world-space body proxy that follows the FPS camera and is visible on CCTV
- Customer restroom geometry with toilet/sink/mirror silhouettes
- 2:00 AM restroom-knocking rule event with obey/break outcomes
- ATM
- Fixture-driven fluorescent grid plus restrained back-hall accent light
- Playable exterior gas-station forecourt
- Storefront sidewalk / parking markings
- Fuel canopy with columns and fixture-driven lighting
- Four pump islands / eight pumps, including Pump 7 placement
- ICE chest, dumpster, roadside sign silhouette, road and tree-line darkness
- Fuel authorization gameplay:
  - dedicated counter fuel console with request lamp
  - timed $40 Pump 5 authorization task after midnight
  - visible customer car parked at the actual Pump 5 location
  - car departs after authorization
- Overnight delivery gameplay:
  - delivery truck arrives behind the store
  - rear-door clipboard/manifest interaction
  - manifest check creates a second task to put away six cartons
  - delivery cartons physically appear in the stock room and disappear when stocked
  - delivery truck departs after acceptance
- Night 1 shift ending:
  - dedicated employee time clock near the register
  - 5:55 AM clock-out reminder/task
  - 6:00 AM interaction completes Night 1 and shows SHIFT COMPLETE
- Generated ambient audio: interior refrigeration/fluorescent hum and exterior wind/road hiss
- Reusable GLB/container AssetRegistry ready for authored model replacement
- GitHub Actions build/typecheck validation on every PR update

## Next playtest targets
Because Codespaces browser testing is resource-constrained, do not re-test after every commit. Use CI for compile safety and batch human testing at milestone boundaries.

When the next human test is worthwhile:
1. Verify the manager office single-door access and brighter staff corridor.
2. Add `?dev=1` to the game URL and use the time-skip buttons to reach 12:10 AM quickly.
3. Confirm Pump 5 fuel request appears, console interaction works, and the car is visible outside.
4. Skip to 12:35 AM and verify delivery truck / manifest / six-carton stock loop.
5. Check Camera 6 during the delivery to confirm it now watches the exterior loading area.
6. Use time skip near 5:55 AM and verify the time-clock task and 6:00 AM Night 1 completion.
7. Continue spot-checking first customer, freezer flicker, Silent Customer, chores, power event and restroom knock.

## Next milestone
1. Continue building Night 1 in large batches rather than micro-iterations.
2. Start real GLB/PBR hero-prop replacement through AssetRegistry: POS/register, shelf fixture, coffee machine, ATM, gas pump, cooler, restroom fixtures, trash/dumpster and customer models.
3. Add another ordinary customer beat and richer checkout variety.
4. Add delivery/fuel audio and modest animation polish.
5. Add Night 1 completion persistence / transition shell once the current retail loop is stable.
6. Improve authored materials/textures while preserving the current lighting mood.

## Standing rules
- Commit every meaningful milestone.
- Prefer real authored 3D assets over code-built primitive hero props.
- Primitives are acceptable for structural geometry, blockout, temporary character placeholders and invisible collision.
- Preserve gameplay canon from the original Open All Night design.
- Do not expand all five nights until Night 1 proves the gameplay and art pipeline.
- Never leave meaningful work only in an AI sandbox or temporary container.
