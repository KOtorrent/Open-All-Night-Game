# Open All Night — Project State

## Current phase
Playable Night 1 vertical slice with customer loop, anomalies, chores, CCTV, power event, fuel authorization, delivery work, multiple ordinary customers, optional office lore, Pump 7/CAM 4 foreshadowing, authored retail/character integration, exterior forecourt, achievements foundation, and a complete shift-ending loop.

## Source of truth
This GitHub repository is authoritative. No AI sandbox is allowed to be the only copy of project work.

## Engine
PlayCanvas Engine, standalone code-first workflow using TypeScript + Vite.

## Current implementation
- First-person WASD/mouse-look controller; 4.8 m/s walk and 7.3 m/s sprint
- Custom AABB collision for store/exterior and center-screen aim-ray E interactions
- Contextual prompt/task/clock/warning UI, NEW SHIFT reset, local autosave
- `?dev=1` time-skip controls; automatic Codespaces low-performance profile with `?low=1` / `?low=0`
- Canon pacing: 1 in-game hour = 4 real minutes
- Full convenience-store shell, checkout, coffee station, four aisles, cooler bank, staff area, office, sealed standalone restroom, exterior forecourt and eight pumps
- Physical automatic glass entrance door reacts to player and Night 1 customer roots instead of leaving the entry as an empty opening
- Sign system corrected so planes stay upright; facade branding enlarged/brightened and the roadside pylon now has readable Case’s branding
- Register transaction foundation with visible merchandise, auto-calculated change and POS-style sale-complete overlay
- Physical receipts accumulate after Earl, Jenna, traveler, Dale and Marcus transactions
- Ordinary customers: opening customer/Earl, Jenna, late-night traveler, Dale, Marcus
- Customer shopping routes are now forced through real walkable aisle corridors instead of shelf footprints
- Dale remains intentionally suspicious and completely harmless forever
- Authored character replacement system swaps primitive NPC visuals for real GLBs while preserving movement/interactions/CCTV behavior
- Authored character heights normalized to adult scale after milestone playtest exposed undersized imports
- `?characters=0` disables authored character replacement; `?assets=0` disables all current authored layers
- Unvalidated decorative retail GLBs (the mystery props seen in the first milestone test) are disabled by default; `?experimentalAssets=1` enables them for isolated tuning
- Night clerk notebook with initial three Night 1 rules
- Freezer Flicker rule event, Silent Customer rule event, 2:00 AM Bathroom Knock rule event
- Timed chores: Aisle 1 restock, Aisle 3 spill cleanup, counter trash
- Additional mid-shift chores: 2:34 AM cooler temperature log and 4:02 AM lottery pack count
- Late-shift chores: 4:35 face Aisle 2, 5:02 wipe counter, 5:28 prep coffee station
- Pump 5 authorization with visible vehicle and departure
- Overnight delivery truck / manifest / six-carton stocking loop
- Pump 7 unattended sedan foreshadow at 3:08 AM, gone at 3:28 AM
- 1:24 AM counter-phone atmosphere event: optional answer hears matching refrigeration hum and a click
- Optional CAM 4-only figure between 3:33 and 3:44 AM; exists only in the CCTV camera view, disappears after being watched, no rule/fail state
- 3:56 AM rear delivery-door handle rattle; optional check finds nobody outside, no rule/fail state
- 4:25 AM optional Window Watcher visual scare outside the front-right glass; non-failing and not a rule
- 5:16 AM impossible receipt: printer runs by itself and produces a 6:01 AM zero-dollar NIGHT CLERK sale before the shift ends
- Restrained atmosphere beats: passing headlights, fluorescent sputter, shelf shift, false 4:47 AM entrance chime
- Manager office contains three optional lore surfaces and is now authored only by `staffAreaBuilder`; `RestroomSystem` no longer duplicates/overlaps office geometry
- Staff-side environmental dressing expanded with employee lockers, utility sink, mop bucket, broom, cleaning chemicals, hand truck, collapsed cartons, filing cabinet, office corkboard, mug and paper clutter
- Rear breaker / timed partial power failure
- Eight-camera CCTV; Camera 4 covers aisles 3–4, Camera 6 rear loading exterior, player body visible on camera
- CCTV presentation now includes live CASE SECURITY timecode plus brief channel-switch static while preserving scanlines/compression styling
- Generated interior refrigeration/fluorescent hum and exterior wind/road ambience
- Interior ambient floor raised after milestone feedback so shelves, people, office/restroom access and interaction surfaces remain readable without removing the nighttime mood
- Employee time clock, 5:55 reminder, 6:00 Night 1 completion and expanded summary showing rules, customers, work, office records, CAM 4, Dale, phone, rear-door and impossible-receipt outcomes
- Local achievement foundation ready for later Steamworks mirroring: FIRST DAY, REGULAR, DALE WAS FINE, TRUST ISSUES, EMPLOYEE OF THE MONTH
- Expanded reusable GLB/container AssetRegistry with shared in-flight loading, batch preload and placement support
- Default authored retail layer currently focuses on register, cooler bank, boxed/bagged shelf samples and entry rug; unvalidated accents are gated behind `?experimentalAssets=1`
- Primitive gameplay geometry remains collision/fallback and is hidden only after authored replacements load successfully
- Asset provenance documented in `docs/ASSET_SOURCES.md`; raw-GitHub model loading is an integration bridge and must be vendored before Steam shipping
- GitHub Actions build/typecheck validation on PR updates

## Testing strategy
Codespaces browser play is resource-constrained. Do not human-test every commit. CI handles compile/type safety and human playtests happen at milestone boundaries.

For visual validation use `?dev=1` to jump among events. Codespaces automatically uses lower-cost rendering. Use `?low=0` only for deliberate full-quality lighting review. `?assets=0` and `?characters=0` remain troubleshooting fallbacks; `?experimentalAssets=1` deliberately re-enables unvalidated retail accent models.

## Current playtest checklist
1. Confirm restroom is fully opaque/sealed and clearly separate from manager office.
2. Confirm office remains enterable through its single side doorway and no duplicate wall geometry exists.
3. Confirm Earl and later customers are normal adult scale and stay in aisle corridors instead of walking through fixtures.
4. Confirm interior brightness is readable at register, aisles, stock area, office and restroom without losing the dark-night mood.
5. Confirm facade and roadside Case’s signs are visible/readable from the forecourt.
6. Confirm the previously mysterious imported retail objects are gone in the default build.

## Next milestone
1. Correct any remaining GLB scale/orientation issues from screenshots.
2. Replace more hero props with individually validated authored assets rather than enabling decorative imports in bulk.
3. Improve customer movement/idle animation presentation beyond waypoint locomotion.
4. Add more environmental texture/material identity while preserving the current dark convenience-store mood.
5. Vendor the currently-used external GLBs into a controlled game asset path before packaging work.
6. Keep Night 1 coherent and polished before beginning Night 2.

## Standing rules
- Commit every meaningful milestone.
- Prefer real authored 3D assets over code-built primitive hero props.
- Primitives are acceptable for structural geometry, fallback visuals and invisible collision.
- Preserve gameplay canon from the original Open All Night design.
- Dale remains suspicious but harmless forever.
- Larry remains Larry, never Frank.
- Never leave meaningful work only in an AI sandbox or temporary container.
