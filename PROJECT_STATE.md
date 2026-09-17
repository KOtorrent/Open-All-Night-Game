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
- The Kenney mini-character GLBs are now DISABLED BY DEFAULT after graphics testing showed the chibi/toy proportions are completely wrong for this game
- Normal-proportioned primitive actors are the current baseline until a better human asset set is selected and visually approved
- `?characters=1` or `?experimentalCharacters=1` explicitly re-enables the rejected mini-character experiment; `?assets=0` disables authored asset layers
- Default authored retail layer now keeps only the register and entry rug
- Cooler, shelf-pack and decorative retail GLBs are isolated behind `?experimentalAssets=1`; the cooler import was identified as the unexplained gray object in front of the freezer wall
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
- Manager office remains the far-left enclosed room with its own side doorway
- Restroom is now a fully enclosed room behind the employee divider with its ONLY entrance on the west wall facing the stock corridor; there is no restroom doorway visible from the sales floor
- The EMPLOYEES ONLY sign is aligned with the one sales-floor staff entrance; RESTROOM signage is inside the stock corridor beside the side-facing restroom door
- Staff-side environmental dressing remains in the utility/office areas without sharing restroom volume
- Rear breaker / timed partial power failure
- Eight-camera CCTV; Camera 4 covers aisles 3–4, Camera 6 rear loading exterior, player body visible on camera
- CCTV presentation includes live CASE SECURITY timecode plus brief channel-switch static
- Generated interior refrigeration/fluorescent hum and exterior wind/road ambience
- Employee time clock, 5:55 reminder, 6:00 Night 1 completion and expanded summary
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
- Cooler bank uses the stable procedural baseline until a replacement GLB is individually approved
- Storefront gains dark fascia cap, green band, cream pinstripe and soffit fixtures
- Fuel canopy carries matching cream accent language
- Large illuminated facade branding, roadside pylon branding, storefront window decals and numbered pumps make the exterior navigable
- Visual target and acceptance rules are documented in `docs/VISUAL_TARGET.md`

## Testing strategy
Codespaces browser play is resource-constrained. CI handles compile/type safety; human visual reviews happen at milestone boundaries.

For visual validation use `?dev=1`. `?low=0` is reserved for deliberate full-quality lighting review. `?experimentalAssets=1` and `?experimentalCharacters=1` should NOT be used during baseline testing.

## Current graphics acceptance checklist
1. Store readable from register, each aisle and back staff threshold.
2. Only ONE employee opening visible from sales floor.
3. Restroom hidden behind staff divider and entered from the stock corridor only.
4. Manager office visually and physically separate from restroom with a clear gap/utility corridor between them.
5. Default customers have believable adult proportions; no chibi/toy GLBs.
6. No customer visibly clips through shelves during normal routes.
7. No mystery GLB object appears in front of the cooler/freezer wall.
8. Facade sign clearly visible from pump area and roadside sign visible from forecourt.
9. Checkout, coffee, shelving, coolers, floor and exterior facade read as distinct manufactured surfaces.
10. Full-quality mode preserves the same composition with improved shadow fidelity rather than becoming materially darker.

## Next milestone
1. Human-review the corrected staff/restroom layout and baseline actors.
2. Find or build a believable stylized adult human asset family before authored character replacement returns to the default build.
3. Replace hero props one at a time with visually validated authored GLB/PBR assets.
4. Build a controlled material/texture library and reduce remaining flat-color blockout surfaces.
5. Improve customer motion / idle presentation after the final character style is selected.
6. Only after graphics language is locked, expand the full five-night campaign.

## Standing rules
- Commit every meaningful milestone.
- Prefer real authored 3D assets over code-built primitive hero props.
- Primitives are acceptable for structural geometry, fallback visuals and invisible collision.
- Do not enable an imported asset in the default build until its scale/orientation/silhouette is visually approved.
- Dark must remain playable; horror comes from contrast and uncertainty, not inability to see.
- Preserve gameplay canon from the original Open All Night design.
- Dale remains suspicious but harmless forever.
- Larry remains Larry, never Frank.
- Never leave meaningful work only in an AI sandbox or temporary container.
