# Open All Night development notes

The game is now developed code-first with PlayCanvas Engine, TypeScript, Vite and GitHub as the permanent source of truth.

## Current vertical slice

- First-person WASD movement and mouse look
- Shift+sprint
- Custom interior collision
- Context-sensitive E interactions
- Canon shift clock pacing (1 in-game hour = 4 real minutes)
- Local autosave for time and starter tasks
- Store shell at gameplay scale
- Register / notebook / coffee interactions
- Four stocked aisles
- Rear cooler bank
- Back-room / office silhouettes
- ATM and fixture-driven lighting

## Art rule

Structural primitives are temporary where appropriate. Hero props and characters should ultimately be imported GLB assets with authored geometry and PBR materials rather than hand-built box substitutes.
