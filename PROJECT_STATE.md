# Open All Night — Project State

## Current phase
Playable Night 1 vertical slice with customer loop, anomalies, chores, CCTV, power event, fuel authorization, delivery work, multiple ordinary customers, Pump 7 foreshadowing, authored retail/character integration, exterior forecourt, achievements foundation, and a complete shift-ending loop.

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
- Full convenience-store shell, checkout, coffee station, four aisles, cooler bank, staff area, office, restroom, exterior forecourt and eight pumps
- Readable in-world signage for all four aisles, coffee, employees-only, restroom and Case’s front branding
- Register transaction foundation with visible merchandise, auto-calculated change and POS-style sale-complete overlay
- Physical receipts accumulate after first sale, late traveler, Dale and Marcus transactions
- Ordinary customers:
  - first customer / Earl-style opening sale
  - 1:10 AM late-night traveler
  - 2:05 AM Dale — intentionally suspicious and completely harmless forever
  - 3:42 AM Marcus — normal road worker buying coffee/chips/gum
- Authored character replacement system watches gameplay actor roots and swaps primitive NPC visuals for real GLBs while preserving movement/interactions/CCTV behavior
- Authored character variants currently mapped for Earl, Silent Customer, traveler, Dale and Marcus
- `?characters=0` disables authored character replacement; `?assets=0` disables all current authored layers
- Night clerk notebook with initial three Night 1 rules
- Freezer Flicker rule event, Silent Customer rule event, 2:00 AM Bathroom Knock rule event
- Timed chores: Aisle 1 restock, Aisle 3 spill cleanup, counter trash
- Late-shift chores: 4:35 face Aisle 2, 5:02 wipe counter, 5:28 prep coffee station
- Pump 5 authorization with visible vehicle and departure
- Overnight delivery truck / manifest / six-carton stocking loop
- Pump 7 unattended sedan foreshadow at 3:08 AM, gone at 3:28 AM
- 4:25 AM optional Window Watcher visual scare outside the front-right glass; non-failing and not a rule
- Restrained atmosphere beats: passing headlights, fluorescent sputter, shelf shift, false 4:47 AM entrance chime
- Rear breaker / timed partial power failure
- Eight-camera CCTV; Camera 4 covers aisles 3–4, Camera 6 rear loading exterior, player body visible on camera
- Generated interior refrigeration/fluorescent hum and exterior wind/road ambience
- Employee time clock, 5:55 reminder, 6:00 Night 1 completion and summary
- Local achievement foundation ready for later Steamworks mirroring:
  - FIRST DAY
  - DALE WAS FINE
  - TRUST ISSUES
  - EMPLOYEE OF THE MONTH
- Expanded reusable GLB/container AssetRegistry with shared in-flight loading, batch preload and placement support
- Authored retail visual layer attempts real Kenney Mini Market models for register/POS, standing cooler bank, boxed-product shelf and bagged-product shelf
- Primitive gameplay geometry remains collision/fallback and is hidden only after authored replacements load successfully
- Asset provenance documented in `docs/ASSET_SOURCES.md`; raw-GitHub model loading is an integration bridge and must be vendored before Steam shipping
- GitHub Actions build/typecheck validation on PR updates

## Testing strategy
Codespaces browser play is resource-constrained. Do not human-test every commit. CI handles compile/type safety and human playtests happen at milestone boundaries.

At the next milestone playtest use `?dev=1` to jump among events. Codespaces automatically uses lower-cost rendering. Use `?low=0` only for deliberate full-quality lighting review. `?assets=0` and `?characters=0` are troubleshooting fallbacks.

## Next milestone
1. Human-validate authored retail + character GLB scale/orientation and correct once based on screenshots.
2. Expand real-asset replacement to ATM, coffee machine, pumps, restroom fixtures, office furniture and more retail props.
3. Improve customer motion/idle presentation after authored characters are visually confirmed.
4. Add more diegetic transaction/retail feedback and environmental texture identity.
5. Keep Night 1 gameplay coherent and polished before beginning Night 2.

## Standing rules
- Commit every meaningful milestone.
- Prefer real authored 3D assets over code-built primitive hero props.
- Primitives are acceptable for structural geometry, fallback visuals and invisible collision.
- Preserve gameplay canon from the original Open All Night design.
- Dale remains suspicious but harmless forever.
- Larry remains Larry, never Frank.
- Never leave meaningful work only in an AI sandbox or temporary container.
