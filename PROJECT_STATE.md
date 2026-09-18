# Open All Night — Project State

## Current phase
Full-game framework build. The project is intentionally prioritizing campaign architecture, all five nights, Endless Mode, endings, achievements, progression and reusable anomaly scheduling before another dedicated geometry/bug-polish pass.

## Source of truth
This GitHub repository is authoritative. No AI sandbox is allowed to be the only copy of project work.

## Engine
PlayCanvas Engine, standalone code-first workflow using TypeScript + Vite.

## Full-game framework now present
- `campaignDefinition.ts` defines all five campaign nights, titles, rules, goals, weather, anomaly pools and the three ending IDs.
- `nightTimelineCatalog.ts` contains data-driven Night 2-5 timeline scaffolds so later-night sequencing is no longer hard-coded into one monolithic director.
- `frameworkNightDirector.ts` consumes those timelines and safely schedules tasks, lore beats, anomaly IDs and finales.
- `anomalyCatalog.ts` is the canonical anomaly registry with standard + mythic definitions, night eligibility, endless weights and cooldown guidance.
- `anomalyRuntime.ts` provides handler registration and a safe fallback for scheduled anomalies whose authored runtime behavior has not been implemented yet.
- `GameSession` owns campaign/chapter/endless mode, selected night, deterministic seed and Endless anomaly scheduling.
- `GameState` is now session-aware with configurable start/end time and per-mode/per-night save keys.
- `ProgressionStore` persists unlocked/completed nights, endings, seen anomalies/mythics, achievements, rule-break history, Endless records and recent run summaries.
- `GameFrameworkUI` provides campaign continuation, Chapter Select, Endless unlock state and progression counts. F2 opens it in development; `?menu=1` opens it on boot.
- `CampaignCompletionSystem` supplies Night 2-4 completion/unlock behavior and the Night 5 three-ending choice framework.
- `AchievementSystem` now uses the full 30-achievement catalog and shared progression store rather than a five-achievement Night 1-only list.
- Endless Mode framework uses weighted standard/mythic anomaly scheduling, per-anomaly cooldowns, immediate-repeat suppression and persistent survival/anomaly-count records.
- Shared anomaly handlers now cover the reusable standard catalog plus all five mythics so later-night schedules and Endless no longer degrade to framework-only diagnostics for most events.
- Authored Night 2 runtime interactables cover customer count, candy facing, coffee refresh, Daniel schedule lore and stock count.
- Authored Night 3 runtime adds storm ambience/lightning plus door check, breaker verification, entrance mop, storm manifest and Larry incident-note tasks.
- Authored Night 4 runtime adds notebook/camera cross-checks, rear-trash verification, Daniel corrected-rule lore and a rule-verification interaction.
- Authored Night 5 runtime adds routine/count/coffee/Larry-file tasks plus Larry’s six-line shift-change conversation and hidden BREAK THE RULES availability gate.
- Endless Mode now has an on-screen survival/anomaly counter.
- Night 1 authored gameplay is isolated so it does not fire inside Nights 2-5 or Endless.
- `docs/FULL_GAME_FRAMEWORK.md` is the implementation contract and later Claude bug-testing handoff guide.

## Existing authored Night 1 content
- First-person movement, sprint, interaction prompts, tasks, clock, local autosave and dev time controls.
- Convenience-store shell, checkout, coffee station, four aisles, cooler bank, staff area, manager office, restroom, exterior forecourt and eight pumps.
- Earl/opening customer, Jenna, late traveler, Dale, Marcus and Silent Customer systems.
- Register transactions, visible merchandise, receipt accumulation and POS feedback.
- Freezer Flicker, Silent Customer and Bathroom Knock rule events.
- Chores, delivery, fuel authorization, Pump 7 foreshadow, phone event, CAM 4 figure, rear-door rattle, Window Watcher, impossible receipt and atmosphere beats.
- CCTV, power event, office lore, Night 1 shift ending and local audio ambience.

## Known visual/bug debt intentionally deferred to the dedicated bug pass
- Duplicate/overlapping NPC presentation can still occur.
- Office/restroom/staff geometry still needs a clean dedicated rebuild/verification pass.
- Cooler/freezer stock presentation is incomplete.
- Some hero props remain procedural/placeholder.
- Character art is not final; rejected chibi GLBs remain disabled by default.
- Customer collision/pathing and prompt alignment require systematic regression testing.

These issues are no longer allowed to block framework development. They are separable from campaign architecture and are explicitly documented for the later bug-testing pass.

## Runtime/query framework
- `?mode=campaign&night=1`
- `?mode=chapter&night=3`
- `?mode=endless&night=5`
- `?menu=1` opens the framework front end on boot.
- `?dev=1` keeps developer time controls and missing-handler diagnostics.
- `?low=1` / `?low=0` control the Codespaces performance profile.
- `?experimentalAssets=1` and `?experimentalCharacters=1` remain isolated experiments only.

## Campaign canon
1. Night 1 — FIRST SHIFT
2. Night 2 — REGULARS
3. Night 3 — THE STORM
4. Night 4 — SOMEONE CHANGED THE RULES
5. Night 5 — OPEN ALL NIGHT

Endings:
- CLOCK OUT
- OPEN ALL NIGHT
- BREAK THE RULES

Mythics:
- Empty Bus
- Second Store
- Wrong Moon
- Customer With Your Name
- Larry in the Parking Lot

## Current framework acceptance checklist
1. Project compiles with all new campaign/endless/progression modules.
2. Night 1 authored update loop remains isolated to Night 1.
3. Night 2-5 can boot through the shared session framework without firing Night 1 events.
4. Chapter Select respects unlocked-night progression.
5. Night completion persists and unlocks the following chapter.
6. Night 5 exposes the ending framework and persists ending IDs.
7. Endless Mode can schedule weighted anomaly definitions indefinitely without campaign clock-out logic.
8. Achievement state persists independently from one run save.
9. Missing future anomaly handlers fail safely rather than crashing the game.
10. Framework documentation is complete enough for a second agent to implement/test individual runtime handlers.

## Next milestone
1. Deepen later-night anomaly handlers from presentation/message behavior into full interactive pass/fail mechanics where appropriate.
2. Add Night 2 recurring-customer transaction state and explicit head-count/repeater rule consequences.
3. Add Night 3 storm rain presentation, blackout containment checks and Camera 6 rear-door verification state.
4. Add Night 4 notebook corruption UI and persistent rule-verification consequences.
5. Finish Night 5 impossible-time ritual, Larry staging and ending-specific scene consequences.
6. Expand Endless intensity tiers, score milestones, death/failure reset flow and seeded run summaries.
7. After content coverage is complete, hand the repo to Claude for systematic bug testing and repair of environment layout, NPC overlap, collision, restroom/office, coolers, prompts and visual regressions.

## Standing rules
- GitHub is always the source of truth.
- Commit every meaningful milestone.
- Prefer shared data-driven systems over duplicated per-night code.
- Preserve gameplay canon from the original Open All Night design.
- Dale remains suspicious but harmless forever.
- Larry remains Larry, never Frank.
- Dark must remain playable.
- No runtime generative-AI dialogue.
- Never leave meaningful work only in an AI sandbox or temporary container.
