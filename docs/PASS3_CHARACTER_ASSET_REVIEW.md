# Pass 3 — Character Asset Review

Graphics Overhaul Pass 3 asked for a genuine search for a low-poly, adult-proportioned,
non-chibi, non-toylike human character asset to replace the procedural
`characterBuilder.ts` humans. This document records every candidate actually
investigated this session, with full reasoning, before any decision was made.

**Outcome: no suitable candidate was found. Characters remain on the existing
procedural builder this pass.** This is a documented, deliberate result, not an
oversight — see "Why nothing was vendored" at the end.

## Network constraints that shaped this search

This session's outbound network access is restricted by organization egress
policy to GitHub (`github.com`, `raw.githubusercontent.com`,
`media.githubusercontent.com` — confirmed reachable) plus a short allowlist of
package registries (npm, PyPI, crates.io, Go proxy). Every primary asset-host
domain tested returned a hard `403 connect_rejected` at the egress proxy:
`kenney.nl`, `quaternius.com`, `itch.io`, `sketchfab.com`, `opengameart.org`,
`poly.pizza`, `mixamo.com`, `creativecommons.org`. This is a genuine
organization-level block, not a tool quirk (verified via direct `curl` through
the same proxy the browser/fetch tools use), so it could not be retried around.
In practice this meant: **only character assets already mirrored onto GitHub
(with real binary content, not just LFS pointers) were reachable at all.**

## Candidates reviewed

| Asset | Source | Creator | License | Commercial use | Redistribution in shipped game | Attribution | Format | Poly count | Rigged | Why it fits / doesn't | Decision |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Kenney Mini Characters | Already vendored in a prior pass, evaluated against `intellicia-public/parastore` mirror | Kenney | CC0-1.0 | Yes | Yes | Not required | GLB | Low | Static/simple | **Already rejected in an earlier pass** ("too toy-like/chibi") — re-confirmed still true this session; no reason to reverse that call | REJECT (standing) |
| KayKit Adventurers Character Pack | `series-ai/jam-ready-assets` (GitHub, git-lfs), mirrored from kaylousberg.com | Kay Lousberg | CC0-1.0 | Yes | Yes | Not required (optional credit) | GLTF/GLB, FBX, OBJ | Low (~1-3k tris/character per marketing material) | Static base + separate animation pack available | Visually inspected the pack's own official preview render (downloaded and viewed directly, not assumed): oversized head, tiny torso, short stubby limbs — textbook chibi proportions. Explicitly what the brief rejects ("not chibi... not toy-like") | REJECT |
| Kenney Modular Characters (3D, 425-asset pack) | Not present in the one GitHub mirror checked; kenney.nl itself unreachable | Kay Lousberg (credited on kaylousberg.com as the modeler for this specific Kenney pack) | CC0-1.0 (per Kenney's stated house license) | Yes | Yes | Not required | GLB/FBX | Unknown | Rigged, 17 animations | Same artist/house style as KayKit Adventurers (confirmed via kaylousberg.com's own portfolio page crediting themselves for this exact pack). Strong circumstantial evidence of the same chibi-adjacent proportions; could not independently verify the geometry itself since the pack is not mirrored anywhere reachable and kenney.nl is blocked | REJECT (on style-lineage evidence; HOLD only if a reachable mirror with real preview renders surfaces in a future pass) |
| Kenney Blocky Characters | `series-ai/jam-ready-assets` mirror (directory present) | Kenney | CC0-1.0 | Yes | Yes | Not required | FBX | Low | Static | Name and file layout (`character-a.fbx` … `character-r.fbx`, uniform cube-limbed rig) match Kenney's known Minecraft-style blocky-humanoid line. Brief explicitly rejects "not Minecraft" | REJECT (by description; not worth spending remaining session budget downloading to confirm the obvious) |
| Quaternius Universal Base Characters / Ultimate Modular Men-Women | quaternius.com / quaternius.itch.io (primary source) | Quaternius | CC0-1.0 (confirmed via web search of the creator's own license statements) | Yes | Yes | Not required | FBX/OBJ/GLTF/Blend | Unknown | Rigged, Humanoid rig, animation-friendly | License and stated proportions (labeled "Regular" build, not stylized-chibi) looked like the best on-paper fit of anything found this session. **Could not be evaluated at all**: both `quaternius.com` and `quaternius.itch.io` are hard-blocked by this session's egress policy, and no GitHub mirror carrying the actual character binaries (as opposed to the separate, unrelated `Quaternius/TestGltfAssets` glTF-conformance-test repo or the `J-Ponzo/gltf-universal-animation-library` animation-only mirror) could be located | HOLD — genuinely promising, blocked purely by this session's network access, not by suitability. Worth revisiting from an environment that can reach quaternius.com or itch.io directly, or if a GitHub mirror of the actual character models surfaces |
| Mixamo character library | mixamo.com (Adobe) | Adobe / Mixamo contributors | Adobe's standard Mixamo license (free, permits use in commercial games, no stated redistribution-of-raw-files restriction for shipped-game use) | Yes | Yes (for use, not raw resale) | Not required | FBX | Mid | Fully rigged, huge animation library | Realistic adult proportions, exactly the right style family. **Unreachable**: `mixamo.com` is hard-blocked by this session's egress policy, and the workflow additionally requires an interactive Adobe account login this session cannot complete regardless of network access | HOLD — same story as Quaternius: a strong candidate this session simply cannot reach |
| Low-poly human base meshes (OpenGameArt "Low-poly human male," "Very Low Poly Human," "3D Humanoids under CC0") | opengameart.org | Various OpenGameArt contributors | CC0 (per each listing) | Yes | Yes | Not required | OBJ/Blend | Very low (246-700 tri) | Mixed | Promising on license and proportion description alone, but `opengameart.org` is hard-blocked and no GitHub mirror of these specific uploads was found | REJECT for this pass (unreachable); could HOLD if a mirror surfaces |

## Why nothing was vendored

Every reachable source (GitHub-mirrored packs) that actually has adult 3D
human characters shares one of two problems: it is a known chibi/toylike
house style (KayKit, and by strong inference Kenney Modular Characters — both
Kay Lousberg's work), or it is explicitly a blocky/Minecraft-style pack
(Kenney Blocky Characters) — both directly named as rejected styles in the
brief. The sources that plausibly *do* have the right proportions
(Quaternius, Mixamo, assorted OpenGameArt base meshes) are all hosted on
domains this session's network policy blocks outright, with no GitHub mirror
of the actual binary content found for any of them.

Per this pass's own explicit instruction — *"If suitable assets cannot be
found: do NOT force a bad result... document what was searched, document why
candidates were rejected, leave current implementation intact, mark it
unresolved, continue to next category"* — characters stay on the existing
`characterBuilder.ts` procedural builder this pass. That builder is not
nothing: it already produces ~7.5-8-head-tall adult proportions with real
clothing silhouettes, hair, and per-character variation (established across
Pass 1 and Pass 2), so this is a "stayed at the previous pass's quality,"
not a regression.

## Recommendation for Pass 4

If a future session has broader network access (reaching `quaternius.com`,
`quaternius.itch.io`, or `mixamo.com` directly), re-run this search first —
Quaternius's "Regular"-proportion base characters and Mixamo's character
library are the two strongest on-paper candidates found, blocked only by
this session's environment, not by unsuitability.
