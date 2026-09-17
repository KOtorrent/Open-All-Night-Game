# OPEN ALL NIGHT — Full Game Framework

This document is the implementation contract for the complete game. GitHub is the source of truth.

## Modes

### Campaign
Five sequential nights. Completing a night unlocks the next. Night 5 resolves into one of three endings.

1. **FIRST SHIFT** — onboarding, mundane work, first three reliable rules.
2. **REGULARS** — recurring customers, identity inconsistencies, busier retail rhythm.
3. **THE STORM** — weather, power loss, Pump 7 pressure, rear-door/CCTV verification.
4. **SOMEONE CHANGED THE RULES** — notebook corruption; player must verify rather than blindly obey.
5. **OPEN ALL NIGHT** — impossible time, Larry, 5:60, ending choice.

### Chapter Select
Unlocked campaign nights may be replayed directly after they are unlocked. This uses the same progression profile but a separate per-run save slot.

### Endless Mode
Unlocks after all five campaign nights are completed. Weighted anomaly scheduling grows more aggressive over time. Mythic events remain rare. Endless tracks best survival seconds and anomaly count. There is no campaign ending.

## Endings

- **CLOCK OUT** — leave; containment fails. Achievement: `FUCK_THIS_JOB`.
- **OPEN ALL NIGHT** — stay and take the shift. Achievement: `OPEN_ALL_NIGHT`.
- **BREAK THE RULES** — hidden sabotage ending; Case’s disappears and a sign remains miles away. Achievement: `BREAK_THE_RULES`.
- Seeing all three unlocks `CLOCKED_OUT_FOR_GOOD`.

## Canon rule philosophy

The mundane job is part of containment. Rules keep things moving. Early rules are reliable. Later rules can be corrupted. A rule is not automatically true because it is written down.

## Anomaly framework

`src/anomalyCatalog.ts` is the canonical catalog. It contains standard and mythic anomaly definitions, allowed nights, endless weights, cooldown hints and design notes. Runtime implementations register handlers through `AnomalyRuntime`. Missing handlers are safe: in dev mode they announce themselves instead of crashing the run.

The framework includes the core named anomalies plus expansion slots required for the complete campaign. Mythics are:

- Empty Bus
- Second Store
- Wrong Moon
- Customer With Your Name
- Larry in the Parking Lot

## Achievement framework

`src/achievementCatalog.ts` contains 30 achievements. `ProgressionStore` persists campaign completion, endings, anomalies/mythics, endless records, achievements and recent run summaries. Steamworks should mirror these IDs later rather than inventing a second achievement namespace.

## Save/progression architecture

- `GameState` = current run state, clock, tasks, completion flags.
- `ProgressionStore` = cross-run/campaign account-local progression.
- `GameSession` = selected mode/night/seed and Endless scheduler.
- Per-run storage keys are namespaced by mode and night.
- Progression is stored separately under `open-all-night-progression-v1`.

## Front-end framework

`GameFrameworkUI` supplies campaign/chapter/endless selection. F2 opens the framework menu during development. `?menu=1` opens it on boot. Query examples:

- `?mode=campaign&night=1`
- `?mode=chapter&night=3`
- `?mode=endless&night=5`
- `?dev=1&mode=chapter&night=4`

Locked campaign nights cannot be selected through normal progression.

## Content isolation

Night 1 is the only fully authored runtime content layer right now. The session framework prevents Night 1 event updates from firing in Nights 2-5 or Endless. Future nights should be implemented as their own directors and registered against the shared session/anomaly/progression framework.

Do **not** copy/paste one giant director for every night. Shared retail systems, customers, CCTV, chores, weather, anomalies and rules should be reusable systems driven by night data.

## Environment and bug-fix boundary

The current environment still has known visual/layout bugs (office/restroom architecture, NPC overlap, cooler stock presentation, prop polish). Do not block campaign framework work on those defects. They are intentionally separable from the full-game systems architecture and can be repaired in a dedicated bug/polish pass.

## Claude bug-testing handoff target

After the framework/content implementation pass is complete, a bug-testing agent should:

1. Pull `main` and create a dedicated bugfix branch.
2. Run build/typecheck before touching code.
3. Test each mode and every night with `?dev=1`.
4. Verify no Night 1 systems fire in later nights.
5. Test every transition/unlock/ending and persistent achievement.
6. Exercise customer routes and collisions from entrance to aisle to counter to exit.
7. Inspect office/restroom/cooler geometry from both sides and on CCTV.
8. Verify no duplicate NPC roots occupy the same spawn/queue location.
9. Verify every interactable prompt aligns with its visible object.
10. Fix bugs in small commits and rerun CI after each coherent batch.

## Standing canon

- Larry is Larry, never Frank.
- Dale is suspicious but harmless forever.
- Sheriff Hall badge: HALL — 271.
- No runtime generative AI dialogue.
- No combat, crafting or open world.
- One game hour = four real minutes in campaign pacing.
- Tone target: ~70% mundane retail, 20% something wrong, 10% terror.
