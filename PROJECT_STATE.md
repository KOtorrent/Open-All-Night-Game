# Open All Night — Project State

## Current phase
Full-game regression and final pre-merge cleanup pass complete. Campaign (Nights 1-5), Endless Mode, all three endings, all 30 achievements, save/reload/progression, and menu navigation have all been driven through their real production code paths end to end and verified working. The final pre-merge pass additionally fixed the exterior forecourt/canopy/pump lighting (was crushed to near-black in a real screenshot) and removed the production runtime's dependency on a third-party GitHub mirror (the two default-loading GLBs are now vendored locally; remaining experimental/rejected assets are dev-gated). No known P0 or P1 blockers remain - see `docs/RELEASE_READINESS.md` for the full report. New feature expansion remains frozen; further work should be regression fixes, Steam-packaging prep (Steamworks SDK integration, a packaging pipeline, vendoring any experimental assets before they ship), or explicitly-requested polish.

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
- Night 2 now has explicit pass/fail rule mechanics: Repeater refusal, head-count verification and early-receipt disposal all have response windows and recorded rule-break consequences.
- Night 3 now enforces the storm rules: blackout counter containment, explicit Pump 7 denial and Camera 6 verification before touching the rear lock; storm ambience/lightning and routine tasks remain active.
- Night 4 corrupted-rule gameplay now has a real evidence loop, an intentionally dangerous false action, timeout consequences and persistent rule-break tracking.
- Night 5 now implements the final containment ritual (coffee, rear door, return to register), 5:60 state, Larry’s six-line shift-change conversation and ending gating; endings cannot fire until the ritual and Larry sequence are complete.
- Endless Mode now has five escalating intensity tiers, scoring, cooldown/recurrence suppression and an expanded survival/anomaly HUD.
- `docs/CONTENT_COVERAGE.md` tracks campaign/content completion separately from the known visual/geometry QA debt.
- Later Nights 2-5 now have scheduled mundane retail/customer transaction cadence instead of anomaly-only pacing.
- False Cop, Wrong Face, Customer Stayed, Wrong Door and Frozen Clock now have explicit timed verification/response interactions; campaign failures record rule breaks and Endless failures record strikes.
- Endless Mode now has a fair three-missed-response run-over condition with summary, same-seed retry, new-run and menu controls.
- Night 5 hidden BREAK THE RULES availability now also requires resolving Wrong Door and Frozen Clock, completing the head-count beat, reading Larry’s file, completing the final ritual and finishing Larry’s conversation.
- Achievement triggers were audited for Night 3 Pump 7/rear-door state, Larry conversation, generalized employee mastery, and PERFECT WEEK now evaluates clean completed runs rather than permanent lifetime mistakes.
- `docs/SMOKE_TEST_ROUTES.md` defines a deterministic pre-QA route for every night, Endless, endings and achievement validation.
- Cross-night timed response gameplay now also covers Coffee Rule, Camera Desync, Duplicate Player, Receipt Name, Pump Counter Rollover and No Chime Exit.
- Nights 2-5 have ordinary scheduled register traffic with item totals/tender/change so later nights preserve mundane retail rhythm.
- Campaign completion now produces a shift report with rule breaks, completed work, anomaly discovery, achievement count and continuation/replay/menu choices.
- `docs/ACHIEVEMENT_MATRIX.md` documents the trigger contract for all 30 achievements.
- `docs/CLAUDE_QA_HANDOFF.md` is the next-agent repair contract, including confirmed human-playtest P0 defects and exit criteria.
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

## Known remaining debt (see docs/RELEASE_READINESS.md for the full report)
- P2: single 2.17 MB JS bundle (no code-splitting yet).
- P2: `NOBODY_HOME` only recognizes Night 3's rear-door-check flag, not Night 1's equivalent
  (the achievement is still reachable via Night 3).
- Character art is not final; rejected chibi GLBs remain disabled by default (intentional).
- No Steamworks integration exists; local achievements are not yet mirrored to Steam IDs.

The office/restroom/staff geometry rebuild, NPC spawn-reservation/duplication fixes, cooler/freezer
presentation, and the full visual/lighting/material polish pass that were previously tracked here as
deferred debt have all since been completed in earlier sessions on this branch.

## Runtime/query framework
- `?mode=campaign&night=1`
- `?mode=chapter&night=3`
- `?mode=endless&night=5`
- `?menu=1` opens the framework front end on boot.
- `?dev=1` keeps developer time controls and missing-handler diagnostics.
- `?low=1` / `?low=0` control the Codespaces performance profile.
- `?experimentalAssets=1` and `?experimentalCharacters=1` remain isolated experiments only, and now also require `?dev=1`.

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

## Next milestone — Steam packaging prep
1. Decide on and implement a packaging strategy for a Steam depot (this repo currently only
   produces a static web `dist/` via `npm run build`).
2. Integrate the Steamworks SDK and mirror the existing 30 local achievement IDs to it.
3. Run the final manual playtest checklist in `docs/RELEASE_READINESS.md` on a real player
   machine (real-time full campaign run, audio, pointer lock across browsers, FPS spot-check).
4. Before shipping any remaining experimental/rejected asset (cooler visual, shelf samples,
   chibi characters), vendor it the same way the register/rug were - see `docs/ASSET_SOURCES.md`.
5. Optional polish: code-split the JS bundle; fold Night 1's `checked-rear-rattle` flag into
   `NOBODY_HOME`'s check for consistency with Night 3.

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

## Content-freeze declaration
As of this milestone, gameplay/framework expansion is frozen. The next development phase is testing, repair and visual production. Known ugly/broken geometry or presentation is now a QA defect, not a reason to add another parallel gameplay system.
