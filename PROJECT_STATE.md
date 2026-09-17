# Open All Night — Project State

## Current phase
Playable Night 1 vertical slice with customer loop, anomalies, chores, CCTV, power event, exterior forecourt, and a more deliberate rear staff layout.

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
- NEW SHIFT reset control for fast clean Night 1 playtests
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
- Manager office now uses ONE side doorway from the stock/utility room; the old front-facing second opening is gone
- Stale stock-area collision blockers were removed so the office route is actually navigable
- Manager office now includes desk, monitor, chair, filing cabinet, bulletin board/papers, warm desk light and a brighter ceiling fixture
- Stock/utility corridor now has two visible cool-white fixtures so it is readable without killing the night mood
- Rear delivery door remains in the stock/utility zone with visible push bar
- Functional CCTV mode on the office monitor with eight switchable cameras
  - Camera 4 covers aisles 3–4
  - Camera 6 covers rear stock/delivery
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
- Generated ambient audio: interior refrigeration/fluorescent hum and exterior wind/road hiss
- Reusable GLB/container AssetRegistry ready for authored model replacement
- GitHub Actions build/typecheck validation on every PR update

## Immediate playtest targets
1. Start a clean Night 1 with the NEW SHIFT control.
2. Walk through the employee doorway into the stock/utility room and verify the path is visibly brighter.
3. Enter the manager office through its SINGLE side doorway and verify there is no second front opening.
4. Verify there are no invisible blockers preventing office entry.
5. Look directly at the office monitor and verify CCTV activates from normal standing distance.
6. Cycle CCTV cameras and verify the player's own body is visible when inside a camera's field of view.
7. Verify register/notebook/coffee/chore prompts still target their actual props.
8. Continue checking customer checkout, freezer flicker, Silent Customer, timed chores, power event and restroom knock.

## Next milestone
1. Fix any remaining playtest targeting/layout issues.
2. Start importing real GLB/PBR hero props through AssetRegistry: POS/register, shelf fixture, coffee machine, ATM, gas pump, cooler, restroom fixtures, trash/dumpster and customer models.
3. Improve authored materials/textures while preserving the current lighting mood.
4. Add more Night 1 customer beats, fuel authorization, delivery/manifest behavior and additional anomalies only after the current loop is stable.
5. Keep making large coherent passes rather than single-feature micro-iterations.

## Standing rules
- Commit every meaningful milestone.
- Prefer real authored 3D assets over code-built primitive hero props.
- Primitives are acceptable for structural geometry, blockout, temporary character placeholders and invisible collision.
- Preserve gameplay canon from the original Open All Night design.
- Do not expand all five nights until Night 1 proves the gameplay and art pipeline.
- Never leave meaningful work only in an AI sandbox or temporary container.
