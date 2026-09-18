# Full Game Content Coverage

This document tracks whether each major campaign layer exists as data only, authored interaction logic, pass/fail rule logic, or final-polish content.

**Gameplay/framework content status: CONTENT-COMPLETE FOR QA.** New feature expansion is frozen after this milestone except where testing proves an existing gameplay contract cannot function.

## Night 1 — FIRST SHIFT
- Authored customer/chore loop: implemented
- Three notebook rules: implemented with pass/fail outcomes
- CCTV/power/delivery/fuel/receipt/office systems: implemented
- Shift completion: implemented
- Visual/layout QA: deferred to dedicated repair pass

## Night 2 — REGULARS
- Timeline: implemented
- Routine tasks/lore: implemented
- Repeater rule: interactive refusal + timeout consequence
- Head-count rule: interactive CCTV verification + timeout consequence
- Early receipt rule: discard-without-reading response + timeout consequence
- Smiling Woman / Window Reflection: authored runtime presentation
- Wrong Face / Customer Stayed / Coffee Rule: explicit timed player responses with pass/fail behavior
- Later-night ordinary retail cadence: implemented with scheduled customers, register tasks, totals, tender/change and progression counts

## Night 3 — THE STORM
- Timeline: implemented
- Storm ambience/lightning: implemented
- Blackout rule: player must remain behind counter until emergency-light timer completes
- Pump 7 rule: explicit DENY interaction + timeout consequence
- Rear-door rule: Camera 6 verification required before touching rear lock
- Storm chores/lore: implemented
- False Cop / Frozen Clock / Wrong Door / Camera Desync: interactive verification responses implemented
- Full rain particles / wet-surface art: graphics pass

## Night 4 — SOMEONE CHANGED THE RULES
- Timeline: implemented
- Notebook/camera/Daniel evidence loop: implemented
- Corrupted-rule decision: implemented
- False action can be obeyed and produces a recorded rule break
- Correct verification crosses out altered instruction
- Cross-night Wrong Face / False Cop / Wrong Door / Frozen Clock / Customer Stayed responses integrate with Night 4 verification pressure

## Night 5 — OPEN ALL NIGHT
- Timeline: implemented
- Larry file: implemented
- Larry physical staging + canonical dialogue: implemented
- 5:60 state: implemented
- Final mundane containment ritual: coffee + rear door + return to register
- Ending choice is locked until Larry conversation and ritual are complete
- Three endings persist to progression and achievement system
- Ending-specific text consequences and campaign shift report: implemented
- Final cinematic/art treatment: graphics/final polish pass

## Endless Mode
- Weighted standard + mythic catalog: implemented
- Deterministic seed: implemented
- Per-anomaly cooldowns: implemented
- Immediate-repeat suppression: implemented
- Five intensity tiers: implemented
- Escalating anomaly interval: implemented
- Survival time / anomaly count / score HUD: implemented
- Persistent best survival/anomaly records: implemented
- 30/60 minute and 100-anomaly achievements: implemented
- Interactive anomaly misses: three-miss failure economy implemented for response-based anomalies
- Run-over summary with retry-same-seed / new-run / menu controls: implemented

## Mythics
- Empty Bus: registered runtime presentation
- Second Store: registered runtime presentation
- Wrong Moon: registered runtime presentation
- Customer With Your Name: registered runtime presentation
- Larry in the Parking Lot: registered runtime presentation

## Deferred repair pass
The following are known and intentionally NOT treated as campaign-content blockers:
- office/restroom geometry overlap
- duplicate/overlapping customer presentation
- freezer/cooler stock visuals
- final human art
- customer path/collision regression issues
- hero prop replacement
- prompt alignment edge cases
- final graphics/material/post-processing pass

When campaign systems reach content-complete status, Claude should receive this file plus `docs/FULL_GAME_FRAMEWORK.md` and `PROJECT_STATE.md` as the starting QA contract.

## Cross-night interactive anomaly responses
- False Cop: verify badge/identity within response window
- Wrong Face: verify the regular instead of blindly serving
- Customer Stayed: refuse duplicate service
- Wrong Door: mark impossible doorway unsafe
- Frozen Clock: verify time against a backup source
- Coffee Rule: restart/maintain the containment routine
- Camera Desync: compare feed against physical store
- Duplicate Player: verify your real location instead of following the feed
- Receipt Name: discard the impossible named receipt
- Pump Counter Rollover: kill unauthorized pump flow
- No Chime Exit: log the silent exit without following outside
- Campaign timeout/failure records a rule break; Endless timeout records a miss

## QA readiness
- `docs/SMOKE_TEST_ROUTES.md` now defines the required developer/manual route for all five nights, Endless, endings and the achievement audit before Claude takes over systematic regression repair.

## Content freeze
- Nights 1-5 have campaign timing, mundane retail rhythm, chores/lore, anomaly sequencing, rule responses, completion and progression.
- Night 5 has Larry, 5:60, final ritual, hidden sabotage requirements and all three ending choices.
- Endless has weighted seeded scheduling, cooldowns, tiers, score, interactive failure strikes, run-over summary and restart paths.
- All 30 local achievement trigger contracts are documented in `docs/ACHIEVEMENT_MATRIX.md`.
- Remaining work is QA, bug repair, geometry/collision correction, asset replacement and graphics polish. See `docs/CLAUDE_QA_HANDOFF.md`.
