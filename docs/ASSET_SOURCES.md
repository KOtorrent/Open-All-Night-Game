# Asset Sources

Open All Night prefers real authored 3D assets for hero props. This file records provenance before any external asset enters the repository.

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
