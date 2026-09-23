# Pass 5 — Authored Merchandise Asset Review

Graphics overhaul Pass 5's goal is to stop the shelf merchandise reading as primitive boxes/
cylinders by sourcing a small set of genuinely authored low-poly product meshes. This document
records every candidate considered, why it was accepted or rejected, and exact provenance for
whatever was vendored.

## Network access constraint

Direct egress to the usual CC0/free-asset hosts is blocked by this session's organizational
network policy (confirmed via the agent-proxy status endpoint, not something to retry or route
around):

- `kenney.nl` — blocked (403)
- `itch.io`, `kenney-assets.itch.io` — blocked (403)
- `opengameart.org` — blocked (403)
- `sketchfab.com` — blocked (403)
- `poly.pizza` — blocked (403)
- `quaternius.com` — blocked (403)
- `github.com` / `raw.githubusercontent.com` — **reachable**

Because the direct Kenney site and general asset-hosting sites are unreachable, sourcing had to
go through a GitHub-hosted path instead of kenney.nl directly.

## Candidate found: `intellicia-public/parastore` (GitHub, MIT-licensed mirror repo)

This repository is **already used and documented in this exact codebase** — see the existing
`docs/ASSET_SOURCES.md` entry for `cash-register.glb` and `rugRectangle.glb`, both vendored from
this same mirror in an earlier pass. Its own `README.md` states verbatim (verified by reading the
file directly in a shallow clone, `HEAD` at `4c97958`):

> "3D assets in `frontend/public/assets/` are from [Kenney](https://kenney.nl) and are licensed
> CC0 1.0 (public domain). No attribution is required... `assets/market/` — Mini Market."

The repo's own top-level `LICENSE` file is MIT (covering the repository's code; the CC0 statement
above is the repo's own explicit claim about the 3D assets specifically, matching Kenney's actual,
well-known licensing practice — every Kenney asset pack ships CC0 1.0 by default).

`frontend/public/assets/market/` contains the **Mini Market** Kenney pack's files actually used by
that project — not the full original Kenney pack (kenney.nl itself is unreachable to verify what
else the full pack contains). The subset present:

| File | Kenney object(s) inside (named glTF nodes) | Notes |
|---|---|---|
| `cash-register.glb` | register | already vendored (Pass 3) |
| `rugRectangle.glb` | rug | already vendored (Pass 3) |
| `shelf-boxes.glb` | 1 shelf frame + 6× `carton` + 4× `box` | individual product meshes, ~28 tris each |
| `shelf-bags.glb` | 1 shelf frame + 8× `bag` | individual product meshes, ~92 tris each |
| `shelf-end.glb` | 1 endcap frame + 3× `bottle` + 3× `carton` + 1 `Group` | individual product meshes, ~28-60 tris each |
| `display-bread.glb` | 1 display frame + 2× `bread` | ~132 tris each |
| `display-fruit.glb` | 1 combined mesh (not separable) | not usable as individual product |
| `bottle-return.glb` | 1 combined mesh (a return bin, not individual bottles) | not usable as individual product |
| `freezer.glb` / `freezers-standing.glb` | 1 mesh each | architectural, not merchandise |
| `wall*.glb`, `floor.glb` | architectural | not merchandise |

All meshes share one small texture atlas (`Textures/colormap.png`, 8.7KB) sampled via
`KHR_texture_transform` UV offsets — the standard Kenney "one shared colormap per kit" pattern.

## Per-category review

| Asset | Creator | Source | License | Redistribution | Attribution | Tris | Texture | Fit | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| `carton` (from `shelf-boxes.glb`) | Kenney | kenney.nl Mini Market, mirrored via `intellicia-public/parastore` | CC0 1.0 | Yes, unrestricted | None required | 28 | shared `colormap.png` | Low-poly, reads as a real box/carton silhouette, matches game's chunky-flat style | **ACCEPT** — used for boxed goods + cartons |
| `box` (from `shelf-boxes.glb`) | Kenney | same | CC0 1.0 | Yes | None | 28 | shared | Distinct flatter/wider silhouette from carton | **ACCEPT** — used for boxed goods |
| `bag` (from `shelf-bags.glb`) | Kenney | same | CC0 1.0 | Yes | None | 92 | shared | Genuine pillow-bag silhouette (chip bag shape), a real upgrade over a flat primitive box | **ACCEPT** — used for snack bags |
| `bottle` (from `shelf-end.glb`) | Kenney | same | CC0 1.0 | Yes | None | 60 | shared | Real bottle silhouette (neck + body), matches water/soda/cleaner bottle needs | **ACCEPT** — used for bottles + household bottles |
| `bread` (from `display-bread.glb`) | Kenney | same | CC0 1.0 | Yes | None | 132 | shared | Distinct loaf silhouette, useful as a bonus snack/bakery item on Aisle 1 | **ACCEPT** — used as an occasional snack variant |
| `display-fruit` | Kenney | same | CC0 1.0 | Yes | None | (combined) | shared | Single fused mesh, not separable into individual reusable items without model editing this session can't do | **HOLD** — not integrated this pass |
| `bottle-return` | Kenney | same | CC0 1.0 | Yes | None | (combined) | shared | A return-bin fixture, not a stockable product | **REJECT** — wrong category |
| Kenney "can" (soda/energy-drink) | Kenney | kenney.nl Mini Market (full pack) | CC0 1.0 (expected) | Expected yes | Expected none | unknown | unknown | The full Kenney Mini Market pack very likely includes a can-shaped object (Kenney's grocery kits typically do), but **the mirrored subset in `parastore` does not include one** — `kenney.nl` itself is blocked so the full pack can't be verified or fetched | **HOLD** — see "Uncompleted category" below |

## Uncompleted category: cans

No can-shaped mesh was available through any reachable channel this pass. Per the brief's own
"if network access is blocked" instructions, cans are **not** getting a bad placeholder swap —
they keep the existing, already-upgraded (Pass 4) primitive cylinder+cap+label-band presentation,
which is honestly documented as unchanged in the review package's weak-spots notes.

**If you can reach it:** the exact page to check is `https://kenney.nl/assets/mini-market` (the
full original pack, not the subset mirrored here). If it contains a can-shaped model, download the
pack `.zip` from that page (Kenney always ships CC0 1.0, no account required) and upload the
extracted can `.glb`/`.gltf` file here — I can wire it into the same clone-and-retint system this
pass built for box/carton/bag/bottle with no further asset-sourcing work needed.

## Rejected sources (not pursued further)

- **Unity Asset Store "Low Poly Supermarket Supplies"** — commercial marketplace listing, license
  terms require per-seat/royalty verification that can't be confirmed without purchasing; the
  brief's preferred license order puts this below CC0/permissive options that were actually
  available. Not pursued once the Kenney/parastore path was confirmed viable.
- **Sketchfab "Low-poly Grocery Store Assets" collection** — `sketchfab.com` is blocked by this
  session's network policy; could not even inspect individual model licenses. Untried, not
  rejected on merits.
- **Kyle Fuji "Low Poly Food Asset Pack" (itch.io, CC0)** — `itch.io` is blocked by this session's
  network policy. Sounded like a strong candidate (58 CC0 prefabs) from search results alone, but
  could not be inspected or downloaded. Untried, not rejected on merits — worth checking manually
  if the can gap above needs filling, since raw produce is a different category than the sealed
  packaged goods this pass focused on.

## Vendoring status

See `docs/ASSET_SOURCES.md` for the finalized local-path record. Copying the verified files from
the local read-only clone into `public/assets/merchandise/` required an explicit one-time
permission grant from the human operator (the session's own auto-mode safety classifier flags any
new external binary file entering the repository as "Untrusted Code Integration" and pauses for
confirmation, independent of in-chat approval) — see the session transcript for that exchange.
