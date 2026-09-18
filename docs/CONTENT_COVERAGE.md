# Full Game Content Coverage

This document tracks whether each major campaign layer exists as data only, authored interaction logic, pass/fail rule logic, or final-polish content.

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
- Smiling Woman / Wrong Face / Coffee Rule / Window Reflection / Customer Stayed: runtime events registered
- Final customer presentation/transaction polish: pending

## Night 3 — THE STORM
- Timeline: implemented
- Storm ambience/lightning: implemented
- Blackout rule: player must remain behind counter until emergency-light timer completes
- Pump 7 rule: explicit DENY interaction + timeout consequence
- Rear-door rule: Camera 6 verification required before touching rear lock
- Storm chores/lore: implemented
- Full rain particles / wet-surface art: graphics pass

## Night 4 — SOMEONE CHANGED THE RULES
- Timeline: implemented
- Notebook/camera/Daniel evidence loop: implemented
- Corrupted-rule decision: implemented
- False action can be obeyed and produces a recorded rule break
- Correct verification crosses out altered instruction
- Additional false-rule permutations: future content expansion

## Night 5 — OPEN ALL NIGHT
- Timeline: implemented
- Larry file: implemented
- Larry physical staging + canonical dialogue: implemented
- 5:60 state: implemented
- Final mundane containment ritual: coffee + rear door + return to register
- Ending choice is locked until Larry conversation and ritual are complete
- Three endings persist to progression and achievement system
- Ending-specific final cinematic/art treatment: graphics/final polish pass

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
- Full interactive failure economy / run-over screen: pending

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
