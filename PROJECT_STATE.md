# Open All Night — Project State

## Current phase
Playable Night 1 vertical slice with first customer/anomaly loop and exterior forecourt.

## Source of truth
This GitHub repository is authoritative. No AI sandbox is allowed to be the only copy of project work.

## Engine
PlayCanvas Engine, standalone code-first workflow using TypeScript + Vite.

## Current implementation
- PlayCanvas/Vite/TypeScript scaffold
- First-person WASD movement and mouse look
- Faster tuned movement after browser playtest: 4.8 m/s walk, 7.3 m/s sprint
- Custom AABB collision for store and exterior
- Context-sensitive E interactions
- Crosshair, interaction prompt, task panel, clock, warning flash and vignette feedback
- Canon time pacing: 1 in-game hour = 4 real minutes
- Local autosave of clock/task progress and dynamic tasks
- Full convenience-store shell at gameplay scale
- Front entrance/windows and door-threshold chime behavior
- Front-left checkout counter and POS silhouette
- Register transaction foundation with auto-calculated change
- Night clerk notebook interaction with the three initial Night 1 rules
- Front-right coffee station and brew task
- Four stocked aisle fixtures
- Rear refrigerated cooler bank with dedicated cool interior lighting
- Freezer Flicker anomaly with Rule 1 zone checking and violation feedback
- Basic customer actor construction and waypoint movement
- First normal customer arrival, shopping route, register wait, transaction and departure
- Silent Customer anomaly: enters without chime, waits at register, exposes E — TALK temptation, records rule break or survival
- Timed Night 1 chores: Aisle 1 restock, Aisle 3 spill cleanup, counter trash
- Back-room divider, stock shelving and manager-office silhouettes
- ATM
- Fixture-driven fluorescent grid plus back-hall accent light
- Playable exterior gas-station forecourt
- Storefront sidewalk / parking markings
- Fuel canopy with columns and fixture-driven lighting
- Four pump islands / eight pumps, including Pump 7 placement
- ICE chest, dumpster, roadside sign silhouette, road and tree-line darkness
- Generated ambient audio: interior refrigeration/fluorescent hum and exterior wind/road hiss
- Reusable GLB/container AssetRegistry ready for authored model replacement
- GitHub Actions build/typecheck validation on every PR update

## Validation
- First vertical slice passed `npm run build` in GitHub Actions before merge.
- Second gameplay/exterior branch is being validated continuously by PR CI before merge.

## Immediate playtest targets
1. Verify the new movement speed feels right.
2. Walk outside and inspect canopy, pumps, ICE chest, dumpster and boundary collision.
3. Wait for the first customer, follow their route, then ring them up at the register.
4. Observe the freezer-flicker event and test obeying/breaking Rule 1.
5. Observe the Silent Customer and test the temptation to press E — TALK.
6. Verify timed chores appear and can be completed.
7. Listen for location-aware ambient sound after the first click/pointer-lock gesture.

## Next milestone
1. Fix playtest issues from the second large pass.
2. Start importing real GLB/PBR hero props through AssetRegistry: POS/register, shelf fixture, coffee machine, ATM, gas pump, cooler, restroom fixtures, trash/dumpster and customer models.
3. Improve authored materials/textures and keep the current lighting mood.
4. Add CCTV foundation, restroom/back-room interaction depth and additional Night 1 customer beats.
5. Expand Night 1 only after the art pipeline proves it can maintain the visual target.

## Standing rules
- Commit every meaningful milestone.
- Prefer real authored 3D assets over code-built primitive hero props.
- Primitives are acceptable for structural geometry, blockout, temporary character placeholders and invisible collision.
- Preserve gameplay canon from the original Open All Night design.
- Do not expand all five nights until Night 1 proves the gameplay and art pipeline.
- Never leave meaningful work only in an AI sandbox or temporary container.
