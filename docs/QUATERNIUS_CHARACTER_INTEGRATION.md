# Quaternius Character Integration

This pass replaces the procedural primitive-composed actors with real authored, rigged, animated
human models as the game's visual foundation for humans, per the "solve the human character
problem" brief. The procedural system (`src/characterBuilder.ts`) is kept as an automatic
fallback, not deleted.

## Source packs

- **Ultimate Modular Men** and **Ultimate Modular Women** by Quaternius
- Creator: Quaternius (https://quaternius.com)
- License: Creative Commons Zero (CC0) 1.0 Universal — Public Domain Dedication
  (https://creativecommons.org/publicdomain/zero/1.0/)
- Official pack pages: https://quaternius.com/packs/ultimatemodularcharacters.html and
  https://quaternius.com/packs/ultimatemodularwomen.html
- Delivered to this session as two pre-packaged zip files (`Claude_Ready_Quaternius_Men.zip`,
  `Claude_Ready_Quaternius_Women.zip`) rather than fetched over the network — this session's
  network egress policy blocks `quaternius.com` directly (confirmed in Pass 3), so these were
  provided by the user as a direct upload instead of sourced by this session.

## What the delivered packs actually contain

Each zip's `How To Use.txt` documents four export variants: an all-in-one Blender/FBX master
file, "Humanoid Rig" retarget-only meshes, "Individual Characters", and "Separate Skeletal Meshes
and Animations". **Only the last two folders were present in what was delivered** — the modular
Blender source and the combined-mesh FBX are not included. Despite the pack's "Modular" name, this
integration therefore uses each **Individual Character as a complete, self-contained outfit**
(its own rig and animations baked in), not true head/torso/legs recombination. This is a
deliberate, honest scope reduction, not a missing feature: each individual outfit already gives a
distinct silhouette, and per-character material retinting (below) provides the palette variation
the brief asks for without needing cross-outfit mesh recombination.

- **Format**: raw `.gltf` JSON per character, fully self-contained — base64-embedded binary buffer
  (`data:application/octet-stream;base64,...`), **no external `.bin` or texture files at all**.
  Materials are flat PBR `baseColorFactor` values (no texture atlas), which keeps every vendored
  file lightweight and trivially easy to retint (see below).
- **Rig/animation**: every individual character carries its own `pc.Skin` and **24 shared
  animation clip names** (`Idle`, `Walk`, `Run`, `Death`, `Punch_Left`, `Wave`, etc.) — confirmed
  identical across all 21 inspected files (11 male + 10 female).
- **Scale convention**: each character's own bounding box already sits close to real-world meters
  with feet at local Y=0 (matching this game's own floor convention), roughly 1.83m–2.05m tall
  before any correction — see the Scale section below.

## Inventory performed

All 11 male and 10 female "Individual Characters" glTF files were parsed (accessors, materials,
animation names, node hierarchy) before selecting any. Full detail lives in this session's own
working notes; the summary that mattered for selection:

| Pack | File | Height (pre-scale) | Notable materials |
|---|---|---|---|
| Men | Casual_2 | 1.858m | Skin, LightBrown, Red_Dark, White, Skin_Darker, Eyebrows, Hair, Eye, LightBlue |
| Men | Casual_Hoodie | 1.870m | Skin, Purple, White, Eyebrows, Eye, Hair, LightBlue |
| Men | Worker | 1.866m | Skin, Worker_Yellow, Worker_Vest, LightBrown, Grey, Black, Moustache |
| Men | Adventurer | 1.857m | Skin, Green, LightGreen, Grey, Black, Hair, Gold, Brown, Brown2 |
| Men | Farmer | 1.856m | Skin, LightBlue, Brown, Beige, Brown2, Red |
| Men | Suit | 1.857m | DarkBrown, Grey, Black, Skin, Tie, Suit, White, Hair |
| Men | Swat | 1.854m | DarkBrown, Grey, Black, Skin, Swat, Swat_Black, Visor |
| Men | Beach | 1.883m | Skin, LightBrown, Red_Dark, Eyebrows, Eye, Hair, Earrings, White |
| Women | Casual | 1.852m | Skin, White, Grey, Hair_Brown, Brown, Hair_Blond, Orange |
| Women | Suit | 1.845m | Skin, Black, White, Hair_Brown, Brown, Hair_Blond |

Men's King/Punk/Spacesuit and Women's Adventurer/Formal/Medieval/Punk/SciFi/Soldier/Witch/Worker
were inspected and **not vendored** — no character needed them, and the brief explicitly says
"do not commit giant unused portions of the packs".

## Vendored local paths

```
public/assets/characters/quaternius/male/Casual_2.gltf
public/assets/characters/quaternius/male/Casual_Hoodie.gltf
public/assets/characters/quaternius/male/Worker.gltf
public/assets/characters/quaternius/male/Adventurer.gltf
public/assets/characters/quaternius/male/Farmer.gltf
public/assets/characters/quaternius/male/Suit.gltf
public/assets/characters/quaternius/male/Swat.gltf
public/assets/characters/quaternius/male/Beach.gltf
public/assets/characters/quaternius/male/License.txt
public/assets/characters/quaternius/female/Casual.gltf
public/assets/characters/quaternius/female/Suit.gltf
public/assets/characters/quaternius/female/License.txt
```

10 character files, ~31MB total (each file carries all 24 animation clips — see "Unresolved /
Pass 4" below for a size-reduction option). No `.bin`/texture files exist to vendor separately.
Everything resolves from same-origin `/assets/...` paths; `vite build` copies `public/` into
`dist/` unchanged, so production has zero runtime dependency on quaternius.com, Google Drive, or
any CDN.

## Character-to-model mapping

| Character | Base model | Why | Scale | Notes |
|---|---|---|---|---|
| Earl | male/Casual_2 | Plain ordinary local, no costume read | 0.955 | Muted browns/grays retint |
| Jenna | female/Casual | Named "Casual", already restrained | 0.93 | Navy/gray retint |
| Marcus | male/Casual_Hoodie | Distinct hoodie/jacket silhouette from Earl | 0.965 | Charcoal retint (was purple) |
| Dale | male/Worker | Workwear/vest reads as rugged | 0.965 | Darkened from safety-bright to heavy/dark |
| Traveler | male/Adventurer | Jacket-heavy explorer silhouette fits "road-weary" | 0.955 | Olive/charcoal, gold accents removed |
| Silent Customer | male/Suit | Plain, nondescript, formal-but-ordinary | 0.955 | Flat gray, red tie removed |
| Larry | male/Farmer | Already muted brown/beige palette | 0.935 | Brown/gray/green retint |
| Smiling Woman | female/Suit | Structured blazer to recolor as the mandatory coat | 0.935 | Blazer retinted bright yellow |
| Tall Man | male/Swat | Narrow tactical silhouette reads as deliberately uncanny | 0.955 × 1.12 | All-dark retint, ~12% taller |
| Player avatar / Duplicate Player | male/Beach | Simple, minimal-material blank canvas | 0.945 | Retinted to a neutral dark-green/khaki look; identical model+materials used for both so the anomaly genuinely resembles the player |

No two named characters share a base model, so silhouette variety comes from actual mesh choice,
not just palette — plus the per-character material overrides below for the "not ten clones" goal.

## Scale

Computed from each file's own glTF accessor bounding box (feet already at local Y=0), targeting
the brief's suggested ranges:

- Adult men ~1.68–1.90m: base models already land at 1.854–1.883m pre-scale, so the applied
  0.955–0.965 factors land every regular male customer at roughly **1.77–1.82m**.
- Adult women ~1.60–1.78m: base models are taller (1.845–1.852m), so 0.93–0.935 lands Jenna and
  Smiling Woman at roughly **1.72–1.73m**.
- Larry: 0.935 on the 1.856m Farmer base lands him at **~1.74m** — a believable older-adult height,
  slightly under the average customer rather than exaggerated either direction.
- Tall Man: base scale 0.955 (matching the other men) **× 1.12** landing him at roughly **2.08m** —
  about 12% taller than an ordinary customer, inside the brief's "10–15% taller" guidance, applied
  as one deliberate multiplier rather than open-ended stretching.

All scale is applied as a single uniform multiplier on the whole authored mesh at the point it's
instantiated (`src/authoredCharacterSystem.ts`); nothing is non-uniformly stretched.

## Materials / recolors

Quaternius's own palette is a "chunky stylized" but already fairly muted PBR set (not neon), so
most base models are visually close to acceptable out of the box. Where the brief calls for a
specific palette (workwear/muted/dark, or Smiling Woman's mandatory yellow), a new selective
retint helper (`retintByMaterialName()` in `authoredCharacterSystem.ts`) walks each mesh
instance's *existing* glTF material name (e.g. `Worker_Vest`, `Purple`, `Black`) and swaps only
matching-named materials to a new flat color — skin, hair and eye materials are never touched,
preserving per-character facial variation instead of flattening the whole mesh to one color the
way the Pass 3 hero-prop `retint()` helper does. Every named character above has its own override
table; see the `overrides` field on each `CharacterBinding` in `authoredCharacterSystem.ts` for
the exact colors used.

## Animation

**Wired and verified working**, not left static. Every vendored file's container resource exposes
`resource.animations` as an array of `pc.Asset` sub-assets, each pre-loaded synchronously with
`.resource` already a `pc.AnimTrack` whose own `.name` matches the original glTF clip name
(`"Idle"`, `"Walk"`, etc. — confirmed by reading the glTF importer source directly). The system:

1. Adds a `pc.AnimComponent` (`entity.addComponent('anim', ...)`) to the instantiated model.
2. Assigns the `Idle` track to a single `"Base"` layer/state on attach.
3. Each frame, compares the NPC root's position to its last-frame position; above a small
   speed threshold (`0.08` m/s) it reassigns the `Walk` track to the same state, below it
   reassigns `Idle` — purely by observing the root's existing transform, with **zero changes** to
   any of the seven customer-system files that actually move that transform.

Live-verified in-engine this session: the anim component attaches, `Idle` visibly loops
(`activeStateProgress` advancing frame over frame), and forcing the bound root to move for ~2
seconds flips the tracked state to `walk` and back to `idle` once movement stops — confirmed via
direct engine inspection, not just code review. This satisfies the brief's "at minimum idle/walk,
if safe and straightforward" instruction without needing a new animation architecture: PlayCanvas's
anim system was already compiled into the existing `pc.Application` build with zero new imports.

## Attach mechanism (reused from the existing, previously-disabled system)

`src/authoredCharacterSystem.ts` (full rewrite of the file the Kenney-character experiment left
behind, disabled by default since that pack was rejected as chibi/toy-like) keeps its predecessor's
core pattern because it was already sound: every frame, look up each named NPC/player root by
`app.root.findByName(rootName)` — whichever system spawned it, whenever it spawned — attach the
authored mesh as a **child of that same root**, and disable (never destroy) the render components
of every other child so the primitive fallback stays present but invisible. A failed/slow load
just leaves the normal-proportioned primitive actor visible instead of a gap. This is why **zero
changes were needed** to any of `nightOneDirector.ts`, `jennaSystem.ts`, `daleSystem.ts`,
`marcusSystem.ts`, `lateCustomerSystem.ts`, `nightFiveRuntime.ts`, `sharedAnomalyHandlers.ts`,
`playerAvatar.ts`, `customerRouteSafetySystem.ts`, or `cctvSystem.ts` — every one of those keeps
building/moving/routing the same procedural root entity exactly as before; only the *visual
child* attached to it, and which of its own children render, changed.

One structural addition over the old system: attach-tracking is now keyed by each root entity's
own `getGuid()` rather than by root **name**, because two of the nine bound characters (Smiling
Woman, Tall Man) are **transient** — `sharedAnomalyHandlers.ts` destroys and recreates a fresh
`AnomalyPresence-*` entity on every spawn, reusing the same name. A name-keyed "already attached"
set (the old system's approach) would silently stop re-attaching after the first appearance;
per-instance GUID tracking re-attaches correctly every time the presence respawns.

## Duplicate Player: new, scoped, additive visual

Previously text-only (`sharedAnomalyHandlers.ts`'s `'duplicate-player'` handler just showed a CCTV
message). The brief calls this out as important — "the anomaly only makes sense if the duplicate
actually resembles the player" — so a new `AuthoredCharacterSystem.spawnDuplicatePlayer()` method
spawns a transient (6s) clone using the **exact same model and material overrides** as the player
avatar binding, placed in an aisle. It's wired in with a single additive line inside the existing
`'duplicate-player'` handler (`sharedAnomalyHandlers.ts`), which still fires its original message
unchanged — no existing anomaly-trigger logic, state, or timing was altered.

## Collision / gameplay safety

Confirmed by direct architecture review before writing any code: no NPC or player entity in this
codebase has a collision or rigidbody component — movement is 100% manual `setPosition()`/
`setEulerAngles()` on the logical root each frame, and interaction targeting uses a fully separate
hand-placed `Interactable` object, not the mesh's bounding box. Attaching a new visual child (and
hiding old ones) therefore cannot affect routing, queueing, interaction, or CCTV visibility — CCTV
cameras are just additional `pc.CameraComponent`s rendering the same `app.root` scene graph, so
every authored character automatically appears on camera with no extra work.

## Unresolved / Pass 4 candidates

- **File size**: each vendored file carries all 24 animation clips though only `Idle`/`Walk` are
  used. A glTF-surgery pass (strip unused animation accessors, repack the base64 buffer) could
  meaningfully shrink the ~31MB total; not attempted this pass given the risk of corrupting the
  skinning data for a size optimization, and 31MB of local, offline, license-clean, real 3D
  character data is a reasonable trade against the previous fully-procedural system's visual
  ceiling.
- **True modular recombination** (separate head/torso/legs swapping) was not possible — the
  delivered zips only contained pre-combined "Individual Characters", not the modular Blender
  source. If broader outfit variety is wanted later, either re-request the full pack export or
  accept the current one-mesh-per-character scope.
- Run/other combat-oriented clips (Punch, Kick, Death, Gun_Shoot, etc.) are vendored but
  deliberately unused — customers never need them, so they're inert data rather than wired to
  anything.
