# Open All Night — Visual Style Bible

This is the art-direction contract for the graphics overhaul. Target: **PS2 / early-2000s
survival-horror atmosphere + modern readability + stylized low-poly realism + modern lighting
discipline.** Not Roblox, not chibi, not untextured graybox, not photoreal AAA, not a giant VHS
filter. The store should look ordinary enough that the player notices when something is wrong.

## Color palette

| Role | Reference | Notes |
|---|---|---|
| Case's dark green | `#1F4A34` / `rgb(31,74,52)` | Signage, canopy fascia, brand panels |
| Aged cream/yellow | `#D9CC8F` / `rgb(217,204,143)` | Sign trim, interior fluorescent tint, laminate accents |
| Subdued red accent | `#8A2A20` / `rgb(138,42,32)` | Pump bodies, warning labels — never neon-saturated |
| Dirty commercial white | `#C7C4B6` / `rgb(199,196,182)` | Ceiling tile, wall base, painted trim — never pure `#FFFFFF` |
| Cooler blue/cyan | `#3E7A88` / `rgb(62,122,136)` | Cooler glass tint, interior cold-light fill |
| Warm coffee/register accent | `#8C5A2E` / `rgb(140,90,46)` | Coffee station, register area warm pool |
| Asphalt/concrete neutral | `#2B2B29` – `#5A5A56` | Forecourt surfaces, sidewalks, islands |
| Night exterior blue-black | `#05070C` – `#141A24` | Sky gradient base, deep shadow fill — never flat `#000000` |

Rule: no pure black, no pure white anywhere except tiny specular hotspots. Everything sits in a
narrow, desaturated value range punctuated by the green/red/cream brand accents and the cooler's
cyan glow.

## Material language

Reusable material families (see `docs/ASSET_SOURCES.md` and the Phase 2 texture set for the actual
generated files):

- Worn commercial vinyl / linoleum (interior floor)
- Painted metal shelving (aisles, coolers, pump bodies)
- Aged laminate (checkout counter, coffee station)
- Plastic (product packaging, signage backing)
- Brushed / dull steel (register, fixtures, canopy structure)
- Commercial refrigerator glass (cooler doors — slight cyan tint, low gloss, not a mirror)
- Concrete (pump islands, curbs, foundations)
- Asphalt (forecourt, parking lot, road)
- Ceiling tile (interior drop ceiling)
- Restroom ceramic / tile
- Cardboard (stockroom boxes, delivery props)
- Paper (receipts, notices, roster sheets)
- Cheap painted drywall (staff area / office walls)

Every material should read as a *specific, named surface*, not "gray plastic #4". Reuse the same
material instance across every object that's the same real-world surface (all asphalt uses one
asphalt material, not a unique one per prop) — this is a performance requirement as much as a
consistency one.

## Wear level

**Used, maintained, slightly grimy.** Not abandoned, not post-apocalyptic. Think: a real overnight
gas station at 2 AM — scuffed floor, a little road grime on the pumps, faded parking paint, but the
lights work, the cooler hums, the shelves are stocked. Wear should read through subtle roughness/
grime variation and edge darkening, never through damage, rust holes, broken glass, or graffiti
unless a specific story beat calls for it.

## Character style

Named characters (Earl, Jenna, Marcus, Dale, Traveler, Larry, Silent Customer, Smiling Woman, Tall
Man, the player avatar) now render as authored, rigged, animated low-poly humans (Quaternius CC0
models — see `docs/QUATERNIUS_CHARACTER_INTEGRATION.md`), attached over the original procedural
rig which stays as an automatic fallback (`src/characterBuilder.ts`, used automatically if an
authored model fails to load, and directly by any not-yet-migrated actor). The authored layer:

- Believable adult proportions, feet flat on the floor, real neck/head/torso/limb relationships —
  the same target the procedural system was already tuned for (~7.5-8 heads tall, ~1.7-1.8m).
- Chunky, intentional low-poly geometry with a genuine rig and idle/walk animation, not static
  smooth/subdivided or hyper-real models.
- Recognizable clothing silhouette: jackets, shirts, jeans/work pants, shoes, read from ordinary
  rural-late-night-customer wardrobes — not costumes. Each named character uses a distinct base
  outfit model (never two characters sharing one mesh), not just a palette swap of one mesh.
- Variation comes from clothing color (selective per-material retinting, skin/hair/eyes always
  left alone), base model choice, and small silhouette accents (a cap, a jacket layer).
- Uncanny effect, where called for (Silent Customer, Smiling Woman, Tall Man), comes from
  **lighting, behavior, and (for Tall Man only) a modest ~12% height increase** — never monster
  anatomy. These are still humans.

The procedural rig described below remains the actual fallback implementation and the reference
for any character not yet migrated to an authored model:

- Believable adult proportions: **~7.5-8 heads tall**, normal shoulder width, normal limb length,
  feet flat on the floor, an actual neck/head/torso relationship (see `src/characterBuilder.ts`).
- Low-poly, primitive-composed geometry — chunky but intentional, not smooth/subdivided.
- Simple low-poly faces are fine: shadowed eye sockets (material/AO only, no eye geometry needed),
  simplified jaw/cheek planes, a hair silhouette. No detailed facial rigging.
- Variation comes from clothing color, hair, body build (slim/average/heavy/lanky), posture
  (upright/stooped), and small silhouette accents (a cap, a jacket layer) — not from new meshes
  per character.

## Exterior style

- The station itself is a bright **island of light** — pumps, canopy, forecourt, storefront, and
  the direct path between pumps and the entrance are all readable.
- Darkness starts at the property line and stays deep, but never becomes a flat, gradient-free void:
  a subtle sky gradient, layered treeline silhouettes, and the road fading (not cutting off) into
  the distance are all required.
- Rural American night atmosphere: two-lane road, tree line, no other buildings/city glow nearby.
- Strong fluorescent lighting composition under the canopy and through the storefront glass —
  warm-white practicals, not cold blue-white.

## UI style

- Minimalist early-digital / convenience-store utility aesthetic: monospace or condensed
  grotesque type, Case's green/cream/red as the only UI accent colors, dark translucent panels
  rather than solid black rectangles.
- Horror through restraint: no jump-scare UI flourishes, no glitch-filter overlays by default. Let
  the store itself carry the dread; the UI stays legible and calm until a specific beat needs it.
- Case's brand identity (the green/cream signage look) should visibly carry into menu chrome so the
  menu feels like *this* game, not a generic template.
- Never a bare bordered-rectangle "debug panel" look — every panel gets a background treatment
  (translucency, subtle texture, or brand color fill), clear typographic hierarchy (title > section
  label > body), and consistent spacing.

## What this is not

Roblox / chibi / cartoon proportions. Untextured graybox. Mobile-game flatness. Photoreal PBR AAA.
A random asset-pack collage with mismatched styles. A blanket VHS/scanline filter standing in for
actual lighting work. An absolute-black void standing in for "atmosphere."
