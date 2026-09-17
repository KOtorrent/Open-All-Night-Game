# Open All Night — Project State

## Current phase
Playable Night 1 vertical-slice foundation.

## Source of truth
This GitHub repository is authoritative. No AI sandbox is allowed to be the only copy of project work.

## Engine
PlayCanvas Engine, standalone code-first workflow using TypeScript + Vite.

## Current implementation
- PlayCanvas/Vite/TypeScript scaffold
- First-person WASD movement and mouse look
- Shift sprint
- Custom interior AABB collision
- Context-sensitive E interactions
- Crosshair, interaction prompt, task panel, clock and feedback messages
- Canon time pacing: 1 in-game hour = 4 real minutes
- Local autosave of clock/task progress
- Full convenience-store shell at gameplay scale
- Front entrance/windows
- Front-left checkout counter and POS silhouette
- Night clerk notebook interaction with the three initial Night 1 rules
- Front-right coffee station and brew task
- Four central stocked aisle fixtures
- Rear refrigerated cooler bank with doors/handles/shelves/drinks
- Back-room divider, stock shelving and manager-office silhouettes
- ATM
- Fixture-driven fluorescent grid plus back-hall accent light
- GitHub Actions build/typecheck validation

## Validation
The first large playable slice passed `npm run build` in GitHub Actions before merge.

## Next milestone
1. User playtests movement, scale, collision, interactions and scene readability in Codespaces.
2. Fix any runtime/feel issues found in-browser.
3. Begin replacing hero placeholder props with authored GLB/PBR assets.
4. Add a proper asset loader/registry so imported props are data-driven rather than hardcoded.
5. Add door/chime behavior, register transaction foundation, basic customer spawn/pathing and the first Night 1 anomaly.
6. Keep the visual target at the established polished indie-horror reference quality before expanding beyond Night 1.

## Standing rules
- Commit every meaningful milestone.
- Prefer real authored 3D assets over code-built primitive hero props.
- Primitives are acceptable for structural geometry, blockout and invisible collision.
- Preserve gameplay canon from the original Open All Night design.
- Do not expand all five nights until Night 1 proves the gameplay and art pipeline.
- Never leave meaningful work only in an AI sandbox or temporary container.
