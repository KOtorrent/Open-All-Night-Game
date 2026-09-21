# Graphics Overhaul — Baseline Visual Audit

Captured against commit `f8c3ecd` (v0.9.0-rc1), production build, before any Pass 1 changes.
Baseline screenshots referenced below were captured during the RC1 visual review pass and are
reused here since nothing had changed since that build. See that review's package for full images;
this document exists to make the KEEP/RESKIN/REPLACE/REBUILD call quickly, not to re-litigate it.

Classification key:
- **KEEP** — functionally and visually fine, leave alone.
- **RESKIN** — geometry/structure is acceptable, needs materials/lighting/detail pass.
- **REPLACE** — swap the object for a new implementation using the same slot/footprint.
- **REBUILD** — needs new geometry, layout, and materials; current version isn't a usable base.

## Characters — **REBUILD** (in progress this pass)

Every NPC (Earl, Jenna, Traveler, Marcus, Dale, Silent Customer, plus the player's own third-person
avatar) was built from the same primitive pattern: a capsule torso, sphere head, two capsule legs,
two capsule arms, no neck, no hands, no feet detail. Measured proportions land around **4.4-4.6
heads tall** against a real human's 7-7.5 — the figures read as blocky mannequins, not people. A
prior attempt at Kenney "Mini Market" character models was tried and explicitly rejected for being
too chibi/toy-proportioned (see `docs/ASSET_SOURCES.md`); that experimental layer is dead code,
disabled by default, and out of scope for this pass. **Action taken:** new shared procedural
builder (`src/characterBuilder.ts`) targeting ~7.5-8 heads tall with segmented limbs and a boxed
torso; wired into Earl, Silent Customer, Traveler, and the player avatar this pass. Jenna, Marcus,
Dale, Larry, and the anomaly-presence figures (Smiling Woman, Tall Man, generic spawnPresence) are
**not yet converted** — still on the old capsule pattern, pending a follow-up pass using the same
builder now proven in-engine.

## Main Menu — **REBUILD**

Plain black background, monospace text, thin bordered rectangles for the title card and chapter
tiles. Functionally clear (title, tagline, chapter select, continue/endless buttons, achievement/
night-completion counters all present and legible) but with zero atmosphere — no store art, no
typographic hierarchy beyond size, no sense of place. Reads as a developer test harness rather than
a horror game's front door.

## Exterior — pumps/canopy: **REBUILD**; forecourt layout: **KEEP**

Forecourt layout (pump island positions, building footprint, drive lanes) is sound and should be
preserved for gameplay-coordinate compatibility. The pumps themselves are a handful of flat-shaded
boxes with a payment-pad rectangle — no nozzle, no hose, no cradle, no branding decal, no sense of
being a real pump. Canopy is a flat slab roof with bare bulb fixtures; support columns are plain
square posts. All of this needs new geometry, not a materials pass.

## World depth / sky — **REBUILD**

Confirmed in the prior visual review and re-confirmed here: the sky above the canopy is completely
flat black with zero gradient, stars, or horizon glow in every exterior shot, and the world beyond
roughly the pump islands (road, parking lot, treeline — all requested capture subjects) is not
visible at all, just void. This is the single most consistent "unfinished prototype" signal across
the whole exterior. Needs a cheap horizon/sky treatment and layered tree silhouettes at minimum.

## Storefront facade — **RESKIN**

Overall massing (building footprint, door placement, window layout, canopy attachment) is fine.
Materials are flat single-color boxes; the CASE'S COUNTRY GAS STOP signage is legible and should be
kept, but wall/trim materials and window glazing need real material treatment.

## Parking lot / forecourt surface — **RESKIN**

Flat gray plane with painted line boxes. Scale and layout are correct; needs asphalt texture, wear/
crack variation, and curb/island definition.

## Interior (store-wide) — **RESKIN** (out of scope this pass)

Same flat-primitive language as the exterior — plain boxed aisles, shelving, counter, coolers.
Layout/collision is sound (already went through a P0 layout-repair pass per prior session history).
Explicitly deferred: this pass's brief scopes interior hero-prop replacement for a later pass.

## Register / entry rug — **KEEP**

Two real authored assets (Kenney Mini Market `cash-register.glb`, `rugRectangle.glb`) are already
vendored locally under `public/assets/market/` with documented CC0 provenance and load with zero
external dependency. These are the one part of the game already at a "real asset" bar — no action
needed this pass.

## UI chrome (HUD, task list, prompts, shift report) — **KEEP** structurally, **RESKIN** visually

Function is solid (legible, no bleed-through issues found in the prior audit) but uses the same flat
black-panel/monospace treatment as the menu. Lower priority than menu/characters/exterior for this
pass; the visual style bible's UI section should guide a later pass here.

## Summary of this pass's targets

| Area | Classification | This pass? |
|---|---|---|
| Characters | REBUILD | Yes — builder done, 4/10+ characters converted |
| Main menu | REBUILD | Yes |
| Gas pumps / canopy | REBUILD | Yes |
| World depth / sky | REBUILD | Yes |
| Storefront facade | RESKIN | Yes (materials pass) |
| Parking lot surface | RESKIN | Yes (materials pass) |
| Forecourt layout | KEEP | N/A |
| Register / rug | KEEP | N/A |
| Interior hero props | RESKIN | **Deferred to Pass 2** |
| Anomaly visual redesign | — | **Deferred to Pass 2** |
| Remaining characters (Jenna/Marcus/Dale/Larry/anomaly presences) | REBUILD | **Deferred to Pass 2** (builder ready) |
