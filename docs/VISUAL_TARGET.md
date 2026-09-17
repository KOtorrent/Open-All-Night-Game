# Open All Night — Visual Target

## Goal
A polished stylized rural convenience-store horror game with late-1990s / early-2000s PC, Dreamcast and early-PS2 flavor, rendered with modern readability and lighting. The game should feel authored, manufactured and believable without chasing photorealism.

## Readability rule
Dark does not mean invisible. The player must always be able to read:
- walkable floor and aisle openings
- customers and their silhouettes
- counter merchandise and interaction targets
- office / restroom / staff-room entrances
- cooler doors and Pump 7
- the exterior store facade and return path from the pumps

Horror comes from contrast, silence, absence and impossible events — not crushed blacks.

## Lighting target
- Cool fluorescent retail lighting across the sales floor
- Slightly warmer checkout and coffee areas
- Cooler-blue refrigerated wall
- Manager office warmer than the store but still dim
- Restroom bright, clinical and unpleasant
- Fuel canopy brighter than the surrounding parking lot
- Store facade / branding visible from the forecourt and road
- Dark tree line and road remain genuinely dark
- Avoid one giant ambient wash; use overlapping pools and believable fixtures

## Material language
- muted off-white / gray commercial walls
- dark charcoal ceiling and trim
- worn gray vinyl floor with visible seams
- dark green Case's branding with cream/gold accents
- slightly oxidized / dull metal shelving
- laminate and painted counter surfaces rather than featureless blocks
- cooler glass / metal should read distinctly from surrounding walls

## Geometry rule
- Structural primitives are allowed for walls, ceiling, floor, collision and blockout trim
- Hero manufactured props should migrate to authored GLB/PBR assets
- Never keep a decorative GLB in the default scene until its scale, orientation and silhouette have been visually approved
- Mystery blobs / unrecognizable placeholder props are not acceptable in the shipping visual baseline

## Character rule
- All ordinary customers should read as normal adult scale before any intentional supernatural proportion changes
- Customer routes must respect shelf and counter footprints
- Silhouettes should be readable from across the store and on CCTV
- Deliberate abnormal proportions are reserved for specific anomalies, never accidental asset scaling

## Exterior identity
CASE'S COUNTRY GAS STOP should be unmistakable from outside:
- large illuminated facade branding
- green / cream fascia language carried onto the canopy
- roadside pylon sign
- numbered pumps, especially clearly identifiable Pump 7
- visible storefront window decals / service signage

## Current graphics baseline
- raised ambient floor for playable darkness
- shadowless readability fills layered beneath authored primary fixtures
- vinyl-floor seam treatment and walk-lane cues
- wall baseboards / green band / sparse ceiling grid
- paneled checkout face and improved coffee backsplash
- aisle caps / shelf edge highlights / cooler header lighting
- facade cap, green band, cream stripe and soffit lights
- large facade sign, roadside sign, window decals and pump-number placards
- only register, cooler bank and entry rug authored imports enabled by default; all other decorative imports remain experimental until visually approved

## Acceptance test before expanding the whole game
1. Store readable from register, every aisle and back staff threshold without flashlight behavior.
2. Office and restroom are clearly separate rooms with no visible overlap or missing surfaces.
3. No customer is visibly tiny, floating, sunk into the floor or clipping through shelving.
4. Exterior facade sign is obvious from the pump area.
5. Pump 7 can be identified quickly without UI guidance.
6. No unexplained decorative object appears in the default scene.
7. Counter / coffee / cooler / shelf materials read as different manufactured surfaces.
8. Codespaces low mode remains usable enough for milestone review; full-quality mode preserves the same composition with better shadow fidelity.
