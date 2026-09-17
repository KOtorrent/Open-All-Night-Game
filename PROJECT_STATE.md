# Open All Night — Project State

## Current phase
Rebuild / engine validation.

## Source of truth
This GitHub repository is authoritative. No AI sandbox is allowed to be the only copy of project work.

## Engine
PlayCanvas Engine, standalone code-first workflow using TypeScript + Vite.

## Immediate goal
Validate that PlayCanvas plus real GLB/PBR assets can achieve the intended polished indie-horror visual quality before rebuilding the full game.

## Current implementation
- PlayCanvas/Vite/TypeScript scaffold
- Single convenience-store visual proof scene
- Floor, walls, ceiling, counter, shelf placeholder, register placeholder, fluorescent lighting, camera
- Current geometry is intentionally temporary and exists only to verify the engine/runtime pipeline

## Next milestone
1. Run the project in GitHub Codespaces/browser.
2. Verify the PlayCanvas scene loads.
3. Replace placeholder shelf/register/product geometry with real GLB assets.
4. Add PBR materials, glass, better fixture lighting, and a convenience-store corner composition.
5. Compare screenshots against the established visual reference before committing to full rebuild.

## Standing rules
- Commit every meaningful milestone.
- Prefer real authored 3D assets over code-built primitive props.
- Primitives are acceptable for structural/blockout geometry and invisible collision only.
- Preserve gameplay design canon from the Open All Night project.
- Do not rebuild all five nights until the polished Night 1 vertical slice proves the pipeline.
