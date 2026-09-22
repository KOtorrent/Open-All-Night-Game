# Asset Sources

Open All Night prefers real authored 3D assets for hero props. This file records provenance before any external asset enters the repository.

## Graphics Overhaul Pass 3 — new source family

### Tiny Treats & KayKit (via series-ai/jam-ready-assets mirror)
- Mirror repository: https://github.com/series-ai/jam-ready-assets (MIT-compatible curation license per its own README; every individual pack inside carries its own CC0-1.0 `License.txt`, verified pack-by-pack by that repository's own maintainers before it lists the pack)
- Creators: Isa Lousberg (*Tiny Treats* — "Bubbly Bathroom" and "Bakery Interior" sets) and Kay Lousberg (*KayKit* — "Furniture Bits")
- License: Creative Commons Zero (CC0) 1.0 Universal for every individual model used. Verified by reading each pack's own `License.txt` inside the mirror (e.g. `tiny-treats/3D/interior-furniture/Bakery Interior/Assets/gltf/../License.txt`), which itself reproduces the creator's original CC0 license text and states "This content is free to use in personal, educational and commercial projects." No attribution is required; this document credits the creators anyway as a courtesy, per the pack's own "not mandatory but appreciated" note.
- Access note: `kenney.nl`, `quaternius.com`, `itch.io`, `kaylousberg.com`, and `isalousberg.com` (the creators' own primary hosting) are all blocked by this session's network egress policy. Only `github.com` / `raw.githubusercontent.com` / `media.githubusercontent.com` were reachable, so these specific files were fetched from the `series-ai/jam-ready-assets` GitHub mirror via its Git LFS media endpoint (a plain HTTPS GET against `media.githubusercontent.com/media/...`, not the GitHub API), not from the creators' own sites directly. The mirror's own per-pack `License.txt` names its source and verification date, so provenance still traces back to the original creator.
- Format as vendored: raw `.gltf` + `.bin` + a shared `.png` texture atlas per pack (not repackaged into `.glb`) — PlayCanvas's container asset loader accepts `.gltf` with sibling files natively, so no format conversion was needed.
- Modifications made: none to the mesh geometry. Materials are overridden at runtime in-engine (the original bright, saturated "cozy" palette does not match Case's worn-commercial visual language) rather than by editing the source texture, so the vendored `.png` atlas is exactly as downloaded.

| Local path | Registry id | Source file (pack / file) | Used for |
| --- | --- | --- | --- |
| `public/assets/pass3/checkout/cash_register.gltf` (+ `.bin`, `tiny_treats_texture_1.png`) | `authored-pos-register` | Tiny Treats "Bakery Interior" / `cash_register.gltf` | Checkout POS terminal hero prop |
| `public/assets/pass3/coffee/coffee_machine.gltf` (+ `.bin`, texture) | `authored-coffee-machine` | Tiny Treats "Bakery Interior" / `coffee_machine.gltf` | Coffee station brewer hero prop |
| `public/assets/pass3/coffee/coffee_cup_takeaway.gltf` (+ `.bin`, texture) | `authored-coffee-cup` | Tiny Treats "Bakery Interior" / `coffee_cup_takeaway.gltf` | Coffee station cup detail |
| `public/assets/pass3/restroom/toilet.gltf` (+ `.bin`, texture) | `authored-toilet` | Tiny Treats "Bubbly Bathroom" / `toilet.gltf` | Restroom toilet hero fixture |
| `public/assets/pass3/restroom/mirror.gltf` (+ `.bin`, texture) | `authored-bathroom-mirror` | Tiny Treats "Bubbly Bathroom" / `mirror.gltf` | Restroom mirror hero fixture |
| `public/assets/pass3/office/desk.gltf` (+ `.bin`, texture) | `authored-office-desk` | KayKit "Furniture Bits" / `desk.gltf` | Office desk hero prop |
| `public/assets/pass3/office/chair_desk_A.gltf` (+ `.bin`, texture) | `authored-office-chair` | KayKit "Furniture Bits" / `chair_desk_A.gltf` | Office chair hero prop |
| `public/assets/pass3/office/monitor.gltf` (+ `.bin`, texture) | `authored-office-monitor` | KayKit "Furniture Bits" / `monitor.gltf` | Office computer monitor |
| `public/assets/pass3/office/keyboard.gltf` (+ `.bin`, texture) | `authored-office-keyboard` | KayKit "Furniture Bits" / `keyboard.gltf` | Office keyboard detail |
| `public/assets/pass3/office/mouse.gltf` (+ `.bin`, texture) | `authored-office-mouse` | KayKit "Furniture Bits" / `mouse.gltf` | Office mouse detail |
| `public/assets/pass3/office/lamp_desk.gltf` (+ `.bin`, texture) | `authored-office-lamp` | KayKit "Furniture Bits" / `lamp_desk.gltf` | Office desk lamp detail |

**Scale note:** every model above was authored at roughly 2x this game's real-world-meter convention (a "chunky stylized" house style common to both Tiny Treats and KayKit). Each registry entry below carries its own per-model `scale` correction (typically 0.3-0.55) computed from that model's glTF-reported bounding box against a real-world reference dimension for the object it represents, rather than one shared pack-wide scale.

**Rejected after in-engine check:** KayKit "Furniture Bits" `cabinet_small.gltf` was originally planned as the office filing cabinet replacement. Once actually instantiated and screenshotted in-engine, it turned out to be a soft-furnishing ottoman/pouf shape (not obvious from the pack's own preview renders, which don't label individual meshes) - visibly wrong for a metal filing cabinet. It was removed from the vendored files and the registration; the office keeps its procedural gray steel file cabinet instead. This is exactly the "if it doesn't fit, don't force it" case the Pass 3 brief asked for.

## Approved source families

### Kenney Mini Market
- Source: https://kenney.nl/assets/mini-market
- Creator: Kenney
- License: Creative Commons CC0 1.0 Universal
- Intended use: register, shelves, freezer/cooler, retail fixtures and related store props
- Notes: CC0 permits commercial use and modification; attribution is not required but source should remain documented here.

### Kenney Mini Characters
- Creator: Kenney
- License: Creative Commons CC0 1.0 Universal
- Intended use: temporary-to-midterm authored customer models while the final character art direction is established
- Notes: current customer replacement layer uses several male/female variants while preserving gameplay actor roots and primitive fallbacks.

### Kenney Food Kit
- Source: https://kenney.nl/assets/food-kit
- Creator: Kenney
- License: Creative Commons CC0 1.0 Universal
- Intended use: bottles, cans, packaged food and checkout merchandise where useful

### Kenney Furniture Kit
- Source: https://kenney.nl/assets/furniture-kit
- Creator: Kenney
- License: Creative Commons CC0 1.0 Universal
- Intended use: office/restroom/background furniture where useful

## Vendored production assets

The two models the shipped game actually loads by default are vendored locally in this repository, loaded from same-origin paths, and carry no runtime dependency on any third-party host:

| Local path | Registry id | Source file | Used for |
| --- | --- | --- | --- |
| `public/assets/market/cash-register.glb` | `authored-register` | `cash-register.glb` | Checkout counter register model |
| `public/assets/market/rugRectangle.glb` | `authored-entry-rug` | `rugRectangle.glb` | Store entrance floor rug |
| `public/assets/market/Textures/colormap.png` | (embedded texture reference) | `Textures/colormap.png` | Shared color atlas `cash-register.glb`'s glTF JSON references by relative URI - not embedded in the `.glb` binary chunk despite the extension, so it has to ship alongside the model at the same relative path or the model fails to load (confirmed in-engine: without it, `AuthoredRegister` never attaches and the primitive fallback silently takes over) |

**Provenance:** both files, and the shared texture, come from Kenney's *Mini Market* pack (see below), mirrored unmodified through `intellicia-public/parastore` (`frontend/public/assets/market/`, MIT-licensed repository). That repository's own README states verbatim: *"3D assets in `frontend/public/assets/` are from Kenney and are licensed CC0 1.0 (public domain). No attribution is required... `assets/market/` — Mini Market."* CC0 1.0 Universal is a public-domain dedication that unambiguously permits redistribution, modification and commercial use with no attribution requirement, so vendoring these exact files into this repository is clearly permitted. Verified directly against the mirror repository's own `LICENSE` and `README.md` before copying.

`AuthoredRetailAssetSystem` now registers these two ids against the local `/assets/market/...` paths; `vite build` copies everything under `public/` into `dist/` unchanged, so the same local paths resolve correctly in both dev and production builds with zero requests to any external asset host.

## Remaining remote-mirror assets (experimental / unapproved, not shipped)

Every other model the codebase references is still loaded from the `intellicia-public/parastore` mirror and is **not** part of the shipped game:

- Retail (`authoredRetailAssetSystem.ts`, behind `?dev=1&experimentalAssets=1`): `freezers-standing.glb` (explicitly rejected after the graphics playtest - "the unexplained gray object in front of the freezer wall" - never to be vendored as-is), `shelf-boxes.glb`, `shelf-bags.glb`, `display-bread.glb`, `display-fruit.glb`, `bottle-return.glb`, `shelf-end.glb`, `freezer.glb` (pending individual in-game visual approval).
- Characters (`authoredCharacterSystem.ts`, behind `?dev=1&characters=1` or `?dev=1&experimentalCharacters=1`): `character-male-a.glb`, `character-male-c.glb`, `character-male-d.glb`, `character-male-f.glb`, `character-female-b.glb`, `character-female-f.glb` - the whole Kenney Mini Character layer, rejected as "too toy-like/chibi" for this game and disabled by default; normal-proportioned primitive actors ship instead.

Both systems now also require `?dev=1` (previously `?characters=1`/`?experimentalAssets=1` alone were enough), so a normal player can never trigger a request to the third-party mirror just by guessing a query parameter - only an explicit dev/test session can. Before any of these are approved for shipping, follow the same process as the register/rug above: verify the file against the mirror's license, copy only that file into `public/assets/...`, and repoint its registry entry to the local path.

## Import rule
Before committing a binary model, verify its original source and license, keep only the models actually used by the game, and register them through `AssetRegistry`. Do not pull giant asset packs wholesale into the game repository.

## Generated textures (graphics overhaul Pass 1)

`public/textures/generated/*.png` (19 files, 128px or 256px, ~5-40KB each) are 100% procedurally
authored for this repository by a local Python/Pillow script
(`gen_textures.py`, kept outside the repo in the session scratchpad, not committed - it's a
one-off generator, not a build dependency) — no external source images, no license concerns, no
network dependency at build or runtime. They are tileable surface textures for the material
language defined in `docs/VISUAL_STYLE_BIBLE.md`, loaded and applied via `src/materialLibrary.ts`:

| File | Surface |
|---|---|
| `asphalt.png` | Forecourt / parking lot / road |
| `concrete.png` | Pump islands, curbs |
| `painted_metal_pump_red.png` | Gas pump bodies |
| `painted_metal_shelving.png` | Retail shelving frames |
| `brushed_steel.png` | Register, fixtures, canopy structure |
| `cooler_metal.png` | Cooler bank frame |
| `vinyl_floor.png` | Interior flooring |
| `off_white_wall.png` | Interior sales-floor walls |
| `drywall_office.png` | Staff area / office walls |
| `ceiling_tile.png` | Interior drop ceiling |
| `cases_brand_panel.png` | Case's-branded green/cream surfaces (signage, canopy fascia) |
| `laminate_counter.png` | Checkout counter, coffee station |
| `restroom_tile.png` | Restroom walls/floor |
| `cardboard.png` | Stockroom boxes, delivery props |
| `paper.png` | Receipts, notices, roster sheets |
| `generic_label_red/green/blue/gold.png` | Generic fictional product-packaging label swatches (no real brands) |
| `sky_gradient.png` | Exterior sky dome (vertical night gradient + sparse stars), rendered emissive so it stays visible regardless of local lighting |
| `pump_number_1.png` … `pump_number_8.png` | Numbered placard decals for the 8 forecourt pumps (simple block-digit graphics, no font file needed) |

All are kept intentionally small (128-256px) since they're tiled at a modest repeat rate rather than
viewed at full-screen close-up — see the "avoid massive 4K textures" performance guidance in the
graphics overhaul brief.
