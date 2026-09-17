# Asset Sources

Open All Night prefers real authored 3D assets for hero props. This file records provenance before any external asset enters the repository.

## Approved source families

### Kenney Mini Market
- Source: https://kenney.nl/assets/mini-market
- Creator: Kenney
- License: Creative Commons CC0 1.0 Universal
- Intended use: register, shelves, freezer/cooler, retail fixtures and related store props
- Notes: CC0 permits commercial use and modification; attribution is not required but source should remain documented here.

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

To prove the authored-model pipeline before binary assets are vendored into this repository, the current build can load selected Kenney Mini Market GLBs from:

- Repository: `intellicia-public/parastore`
- Repository license: MIT
- Paths: `frontend/public/assets/market/*.glb`
- Models currently referenced: `cash-register.glb`, `freezers-standing.glb`, `shelf-boxes.glb`, `shelf-bags.glb`
- Original asset family is identified by that repository as Kenney Mini Market.

This is an integration bridge, not the intended shipping arrangement. Before Steam packaging, copy only the actually-used models into this repository (or another controlled game asset store), preserve this provenance record, and remove the runtime dependency on raw GitHub URLs.

## Import rule
Before committing a binary model, verify its original source and license, keep only the models actually used by the game, and register them through `AssetRegistry`. Do not pull giant asset packs wholesale into the game repository.
