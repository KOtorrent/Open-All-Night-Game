# Open All Night — Project State

## Current phase
Graphics-first milestone: lock the final visual language and environment readability before expanding the campaign beyond the current Night 1 vertical slice.

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
- Full convenience-store shell, checkout, coffee station, four aisles, cooler bank, staff area, manager office, sealed standalone restroom, exterior forecourt and eight pumps
- Physical automatic glass entrance door reacts to player and Night 1 customer roots
- Sign system keeps planes upright; facade branding, roadside pylon, storefront decals and numbered pump placards provide clear Case’s identity
- Register transaction foundation with visible merchandise, auto-calculated change and POS-style sale-complete overlay
- Physical receipts accumulate after Earl, Jenna, traveler, Dale and Marcus transactions
- Ordinary customers: opening customer/Earl, Jenna, late-night traveler, Dale, Marcus
- Customer shopping routes are forced through walkable aisle corridors instead of shelf footprints
- Dale remains intentionally suspicious and completely harmless forever
- Authored character replacement swaps primitive NPC visuals for real GLBs while preserving movement/interactions/CCTV behavior
- Authored character heights normalized to adult scale after milestone playtest exposed undersized imports
- `?characters=0` disables authored character replacement; `?assets=0` disables authored asset layers
- Only visually safer authored retail replacements are enabled by default: register, cooler bank and entry rug
- Shelf-pack and decorative retail GLBs are isolated behind `?experimentalAssets=1` until individually visually approved
- Night clerk notebook with initial three Night 1 rules
- Freezer Flicker rule event, Silent Customer rule event, 2:00 AM Bathroom Knock rule event
- Timed chores: Aisle 1 restock, Aisle 3 spill cleanup, counter trash
- Additional mid-shift chores: 2:34 AM cooler temperature log and 4:02 AM lottery pack count
- Late-shift chores: 4:35 face Aisle 2, 5:02 wipe counter, 5:28 prep coffee station
- Pump 5 authorization with visible vehicle and departure
- Overnight delivery truck / manifest / six-carton stocking loop
- Pump 7 unattended sedan foreshadow at 3:08 AM, gone at 3:28 AM
- 1:24 AM counter-phone atmosphere event
- Optional CAM 4-only figure between 3:33 and 3:44 AM
- 3:56 AM rear delivery-door handle rattle
- 4:25 AM optional Window Watcher scare
- 5:16 AM impossible 6:01 AM receipt
- Restrained atmosphere beats: passing headlights, fluorescent sputter, shelf shift, false entrance chime
- Manager office contains optional lore surfaces and is authored only by `staffAreaBuilder`; `RestroomSystem` no longer duplicates/overlaps office geometry
- Staff-side environmental dressing: lockers, utility sink, mop bucket, broom, cleaning chemicals, hand truck, cartons, filing cabinet, corkboard, mug and papers
- Rear breaker / timed partial power failure
- Eight-camera CCTV; Camera 4 covers aisles 3–4, Camera 6 rear loading exterior, player body visible on camera
- CCTV presentation includes live CASE SECURITY timecode plus brief channel-switch static
- Generated interior refrigeration/fluorescent hum and exterior wind/road ambience
- Employee time clock, 5:55 reminder, 6:00 Night 1 completion and expanded summary
- Local achievement foundation ready for later Steamworks mirroring
- Reusable GLB/container AssetRegistry with shared loading and placement support
- Asset provenance documented in `docs/ASSET_SOURCES.md`; external raw-GitHub GLBs remain an integration bridge and must be vendored before shipping
- GitHub Actions build/typecheck validation on PR updates

## Graphics baseline now being locked
- Interior ambient floor raised to playable-dark rather than crushed-black levels
- Additional shadowless readability fills under primary fluorescent lighting
- Worn commercial floor treatment with broad vinyl seam grid and walk-lane cues
- Dark commercial baseboards, restrained Case’s green wall band and sparse suspended-ceiling grid
- Checkout face broken into deliberate branded panels with kickplate / trim instead of one flat block
- Coffee station gains backsplash and stronger material separation
- Aisles gain green header caps, metallic edge highlights and stronger long-range silhouettes
- Cooler bank gains top trim and visible cool-light accents
- Storefront gains dark fascia cap, green band, cream pinstripe and soffit fixtures
- Fuel canopy carries matching cream accent language
- Large illuminated facade branding, roadside pylon branding, storefront window decals and numbered pumps make the exterior navigable
- Visual target and acceptance rules are documented in `docs/VISUAL_TARGET.md`

## Testing strategy
Codespaces browser play is resource-constrained. Do not human-test every commit. CI handles compile/type safety; human visual reviews happen at milestone boundaries.

For visual validation use `?dev=1` to jump among events. Codespaces automatically uses lower-cost rendering. Use `?low=0` only for deliberate full-quality lighting review. `?assets=0` and `?characters=0` remain troubleshooting fallbacks; `?experimentalAssets=1` deliberately re-enables unvalidated retail models.

## Current graphics acceptance checklist
1. Store readable from register, each aisle and back staff threshold without flashlight-like behavior.
2. Restroom fully sealed and clearly separate from manager office.
3. Office enterable through its single side doorway with no duplicate or overlapping wall geometry.
4. All ordinary customers read at believable adult scale and remain in walkable corridors.
5. No customer visibly clips through shelves during normal routes.
6. Facade sign clearly visible from pump area and roadside sign visible from forecourt.
7. Pump 7 easily identifiable from its physical placard.
8. Previously mysterious imported decorative props absent in default build.
9. Checkout, coffee, shelving, coolers, floor and exterior facade read as distinct manufactured materials / surfaces.
10. Full-quality mode preserves the same composition with improved shadow fidelity rather than becoming materially darker.

## Next milestone
1. Human-review this graphics baseline and correct brightness, sign orientation, character scale and any overlap based on screenshots.
2. Replace hero props one at a time with visually validated authored GLB/PBR assets: pumps, ATM, coffee equipment, restroom fixtures, office furniture, stock-room equipment.
3. Build a controlled material/texture library and reduce remaining flat-color blockout surfaces.
4. Improve customer motion / idle presentation after character size and routes are confirmed visually.
5. Vendor approved external GLBs into controlled game asset paths before packaging.
6. Only after the graphics language is locked, expand the full five-night campaign on top of this baseline.

## Standing rules
- Commit every meaningful milestone.
- Prefer real authored 3D assets over code-built primitive hero props.
- Primitives are acceptable for structural geometry, fallback visuals and invisible collision.
- Do not enable an imported decorative asset in the default build until its scale/orientation/silhouette is visually approved.
- Dark must remain playable; horror comes from contrast and uncertainty, not inability to see.
- Preserve gameplay canon from the original Open All Night design.
- Dale remains suspicious but harmless forever.
- Larry remains Larry, never Frank.
- Never leave meaningful work only in an AI sandbox or temporary container.
