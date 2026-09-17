# Open All Night — Project State

## Current phase
Playable Night 1 vertical slice with customer loop, anomalies, chores, CCTV, power event, fuel authorization, delivery work, multiple ordinary customers, Pump 7 foreshadowing, exterior forecourt, and a complete shift-ending loop.

## Source of truth
This GitHub repository is authoritative. No AI sandbox is allowed to be the only copy of project work.

## Engine
PlayCanvas Engine, standalone code-first workflow using TypeScript + Vite.

## Current implementation
- PlayCanvas/Vite/TypeScript scaffold
- First-person WASD movement and mouse look
- Tuned movement: 4.8 m/s walk, 7.3 m/s sprint
- Custom AABB collision for store and exterior
- Context-sensitive E interactions using center-screen aim-ray proximity
- Per-prop interaction aim radii for monitor, chores, register, notebook, coffee, cooler, rear door, etc.
- Crosshair, interaction prompt, task panel, clock, warning flash and vignette feedback
- NEW SHIFT reset control for clean Night 1 playtests
- Optional `?dev=1` time-skip controls (+15/+30/+60 game minutes)
- Automatic low-performance rendering profile when running on Codespaces, plus `?low=1` / `?low=0` overrides
- Canon time pacing: 1 in-game hour = 4 real minutes
- Local autosave of clock/task progress and dynamic tasks
- Full convenience-store shell at gameplay scale
- Front entrance/windows and door-threshold chime behavior
- Front-left checkout counter and POS silhouette
- Register transaction foundation with auto-calculated change
- Contextual register prompt: clock in / ring up items / use register
- First customer visibly places a drink and candy bar on the counter before checkout
- Second ordinary late-night traveler after 1:10 AM with a different route and three-item checkout
- Dale appears after 2:05 AM as an intentionally suspicious but completely harmless regular
  - wanders deep into the back aisles before approaching the counter
  - optional TALK interaction
  - buys jerky/root beer with exact change
  - completion records `dale-was-fine` for later achievement wiring
- Night clerk notebook interaction with the three initial Night 1 rules
- Front-right coffee station and brew task
- Four stocked aisle fixtures
- Rear refrigerated cooler bank with dedicated cool interior lighting
- Freezer Flicker anomaly with Rule 1 zone checking and violation feedback
- Silent Customer anomaly with no entrance chime and dangerous TALK temptation
- Timed Night 1 chores: Aisle 1 restock, Aisle 3 spill cleanup, counter trash
- Rear breaker box and timed partial-power outage with reset task
- Rear staff area split into enclosed manager office, stock/utility zone, and separate restroom/cooler side
- Manager office uses one side doorway and has dedicated brighter lighting
- Rear delivery door in stock/utility area
- Functional CCTV with eight switchable cameras
  - Camera 4 covers aisles 3–4
  - Camera 6 watches the exterior rear-delivery/loading area
  - exterior pump and road cameras included
- Player world-space body proxy follows FPS camera and is visible on CCTV
- Customer restroom with 2:00 AM Bathroom Knock rule event
- ATM
- Fixture-driven fluorescent lighting
- Playable exterior gas-station forecourt
- Four pump islands / eight pumps including Pump 7
- ICE chest, dumpster, roadside sign silhouette, road and tree-line darkness
- Pump 5 fuel authorization gameplay with counter console, request lamp, visible car and departure
- Overnight delivery gameplay with truck, manifest, six stock cartons and departure
- Pump 7 Night 1 foreshadowing: unattended dark sedan silently appears and later vanishes; no rule/fail state yet
- Night 1 shift ending:
  - employee time clock
  - 5:55 AM clock-out reminder
  - 6:00 AM completion persistence
  - Night 1 summary overlay reporting rule outcomes, jobs completed, and Dale status
- Generated ambient audio: interior refrigeration/fluorescent hum and exterior wind/road hiss
- Reusable GLB/container AssetRegistry ready for authored model replacement
- GitHub Actions build/typecheck validation on PR updates

## Testing strategy
Codespaces browser play is resource-constrained. Do not human-test every commit. CI handles compile/type safety and human playtests happen at milestone boundaries.

For milestone testing use `?dev=1` to jump between events. Codespaces automatically uses the lower-cost render profile. Add `?low=0` only when deliberately checking full-quality lighting.

## Next milestone
1. Continue Night 1 in coherent batches rather than micro-iterations.
2. Begin real CC0 GLB/PBR hero-prop replacement through AssetRegistry: POS/register, shelves, cooler, coffee machine, ATM, gas pump, restroom fixtures and customers.
3. Add another layer of retail polish: receipts, product variety, customer idle behavior and better transaction feedback.
4. Add modest animation/audio polish to fuel and delivery beats.
5. Improve authored materials/textures while preserving the current dark convenience-store mood.
6. Only start Night 2 after Night 1 gameplay and art pipeline are convincingly proven.

## Standing rules
- Commit every meaningful milestone.
- Prefer real authored 3D assets over code-built primitive hero props.
- Primitives are acceptable for structural geometry, blockout, temporary character placeholders and invisible collision.
- Preserve gameplay canon from the original Open All Night design.
- Dale remains suspicious but harmless forever.
- Larry remains Larry, never Frank.
- Never leave meaningful work only in an AI sandbox or temporary container.
