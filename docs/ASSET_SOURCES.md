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

## Temporary runtime mirror used during integration

To prove the authored-model pipeline before binary assets are vendored into this repository, the current build can load selected Kenney GLBs from:

- Repository: `intellicia-public/parastore`
- Repository license: MIT
- Retail paths: `frontend/public/assets/market/*.glb`
- Character paths: `frontend/public/assets/characters/*.glb`
- Retail models currently referenced: `cash-register.glb`, `freezers-standing.glb`, `shelf-boxes.glb`, `shelf-bags.glb`, `display-bread.glb`, `display-fruit.glb`, `bottle-return.glb`, `shelf-end.glb`, `freezer.glb`, `rugRectangle.glb`
- Character models currently referenced: `character-male-a.glb`, `character-male-c.glb`, `character-male-d.glb`, `character-male-f.glb`, `character-female-f.glb`
- Original asset families are identified by that repository as Kenney Mini Market and Kenney Mini Characters.

The retail filenames above were verified against the mirror repository before being added to the runtime registry.

This is an integration bridge, not the intended shipping arrangement. Before Steam packaging, copy only the actually-used models into this repository (or another controlled game asset store), preserve this provenance record, and remove the runtime dependency on raw GitHub URLs.

## Import rule
Before committing a binary model, verify its original source and license, keep only the models actually used by the game, and register them through `AssetRegistry`. Do not pull giant asset packs wholesale into the game repository.
