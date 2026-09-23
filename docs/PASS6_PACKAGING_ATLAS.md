# Pass 6 — Fictional Packaging Label Atlas

Two procedurally-authored (not sourced/vendored - drawn by this pass's own `gen_atlas.py` script,
Python + Pillow, DejaVu Sans Bold / Liberation Sans Bold system fonts) label atlases give the Pass
5 authored product meshes (and a couple of new ones, see Phase 5) believable fictional packaging
instead of flat generic colors.

## Files

| Path | Dimensions | Purpose |
| --- | --- | --- |
| `public/assets/merchandise/labels/merchandise_atlas_01.png` | 1024x1024, 4x4 grid of 256px cells | Snack bags, boxed/pantry goods, candy/gum, Case's trail mix + sandwiches |
| `public/assets/merchandise/labels/merchandise_atlas_02.png` | 1024x1024, 4x4 grid of 256px cells | Bottle/can wraps, Case's water/coffee, generic dairy/juice cartons, household labels |

Regenerate with `python3 <scratch>/gen_atlas.py` (script not vendored into the repo - it is
original authoring tooling, not a game asset; the two output PNGs are the actual shipped assets).

## UV convention

Each atlas is a 4x4 grid. Cell `(col, row)` occupies UV region:
```
u0 = col / 4,  u1 = (col + 1) / 4
v0 = row / 4,  v1 = (row + 1) / 4
```
`src/packagingLabelSystem.ts` selects a cell via `diffuseMapTiling = (0.25, 0.25)` and
`diffuseMapOffset = (col * 0.25, row * 0.25)` on a small unlit decal plane (see "Application
method" below) - the atlas PNGs themselves are never re-sliced into separate files.

## Region map — Atlas 1 (`merchandise_atlas_01.png`)

| Col,Row | Brand | Category | Style |
| --- | --- | --- | --- |
| 0,0 | Ridge Crunch — Classic Cut | snack (bag) | diagonal stripe |
| 1,0 | Night Owl — Trail Style | snack (bag) | diagonal stripe |
| 2,0 | County Crisps — Kettle Style | snack (bag) | diagonal stripe |
| 3,0 | Ridge Crunch — BBQ Cut | snack (bag) variant | diagonal stripe |
| 0,1 | Homestead Pantry — Crackers | boxed (box) | color block |
| 1,1 | Quick Meal — Family Size | boxed (box) | color block |
| 2,1 | Homestead Pantry — Cereal | boxed (box) variant | color block |
| 3,1 | Harvest Table — Snack Box | boxed (box) variant | color block |
| 0,2 | Sweet Stop — Fruit Chews | candy (checkout) | diagonal stripe |
| 1,2 | Pop Chew — Mint Gum | gum (checkout) | diagonal stripe |
| 2,2 | Road Candy — Assorted | candy (checkout) | diagonal stripe |
| 3,2 | Case's — Trail Mix | Case's private label | framed panel |
| 0,3 | Ridge Crunch — Sour Cream | snack (bag) variant | diagonal stripe |
| 1,3 | Night Owl — Spicy Mix | snack (bag) variant | diagonal stripe |
| 2,3 | Quick Meal — Value Pack (2 FOR $5) | boxed (box) variant | color block |
| 3,3 | Case's — Sandwiches | Case's private label | framed panel |

## Region map — Atlas 2 (`merchandise_atlas_02.png`)

| Col,Row | Brand | Category | Style |
| --- | --- | --- | --- |
| 0,0 | Redline Cola — Original | drink (bottle/can/cooler) | horizontal wrap band |
| 1,0 | Route 9 Soda — Citrus | drink (bottle/can/cooler) | horizontal wrap band |
| 2,0 | Highbeam Energy — Original Charge | drink (bottle/can/cooler) | horizontal wrap band |
| 3,0 | Clear Creek Water — Spring Water | drink (bottle/can/cooler) | horizontal wrap band |
| 0,1 | Case's — Bottled Water | Case's private label | framed panel |
| 1,1 | Case's — House Coffee | Case's private label | framed panel |
| 2,1 | Farmstead Dairy — Whole Milk | carton | color block (top) |
| 3,1 | Farmstead Orchard — Orange Juice | carton variant | color block (top) |
| 0,2 | CleanWay — Glass Cleaner | household (bottle) | color block |
| 1,2 | SureWash — Laundry | household (bottle) | color block |
| 2,2 | HomeBright — All-Purpose | household (bottle) variant | color block |
| 3,2 | CleanWay — Disinfectant | household (bottle) variant | color block |
| 0,3 | Redline Cola Zero — Sugar Free | drink variant | horizontal wrap band |
| 1,3 | Highbeam Energy — Berry Charge | drink variant | horizontal wrap band |
| 2,3 | SureWash — Dish Soap (Grease Cut) | household variant | color block |
| 3,3 | HomeBright — Paper Towels (2 Roll Pack) | household variant | color block |

## Brand/category mapping (for `packagingLabelSystem.ts`'s `BRANDS` table)

- **snack** (Aisle 1, bag meshes + candy-bar-wrapper carried items): Ridge Crunch, Night Owl,
  County Crisps — cycled by the existing `variantIndex` the merchandise slot already carries.
- **boxed** (Aisle 2/3, box + carton meshes): Homestead Pantry, Quick Meal, Harvest Table.
- **drink** (Aisle 4, bottle meshes, cooler carton/bottle stock): Redline Cola, Route 9 Soda,
  Highbeam Energy, Clear Creek Water.
- **household** (Aisle 2, box/bottle meshes tagged household by `storeBuilder.ts`'s aisle
  profile): CleanWay, SureWash, HomeBright.
- **candy** (checkout primitives): Sweet Stop, Pop Chew, Road Candy.
- **cases** (Case's private label — used sparingly per the brief's own "don't make everything
  Case's" instruction): trail mix, sandwiches, bottled water, house coffee.

## Application method (why no mesh-UV surgery)

The Pass 5 authored meshes (Kenney Mini Market) share one small "colormap" atlas via
`KHR_texture_transform` UV offsets baked into each mesh's own vertex data - editing those UVs at
runtime would mean walking and rewriting raw accessor buffers, effectively a small mesh-processing
pipeline, which the brief explicitly said to avoid for one asset family.

Instead, `packagingLabelSystem.ts` attaches a small flat **decal plane** as a child entity on the
front face of each authored product clone, sized to roughly match that product kind's own
silhouette (measured from each mesh's bounding box, same numbers already used in Pass 5's
scale-matching). The plane has a trivial 0..1 UV (a `pc.Entity` primitive plane's default UVs),
and its material samples one atlas cell via `diffuseMapTiling`/`diffuseMapOffset` - no mesh
geometry or vertex data is touched, and the underlying mesh's own body-color tint (Pass 5's
`retint()`) is left in place as the "packaging plastic/cardboard color" showing around the decal's
edges.

## Local paths

- `public/assets/merchandise/labels/merchandise_atlas_01.png`
- `public/assets/merchandise/labels/merchandise_atlas_02.png`

No runtime dependency on any third-party host - both are original art authored for this
repository during this pass (not sourced/vendored), same category as the procedurally-generated
wall/floor textures in `public/textures/generated/` from earlier passes.
