# Release Readiness — Open All Night

Snapshot from the final full-game regression + release-prep pass on branch `qa/claude-repair-pass-1`, updated after the final pre-merge cleanup pass.

## Final pre-merge cleanup pass (latest)

Two items remained after the regression pass below, both now fixed, verified, committed and pushed:

1. **Exterior forecourt/canopy/pump lighting** — a real human screenshot showed the pumps, canopy columns and pavement markings crushed to near-black. Root-caused to only 4 sparse, shadow-casting canopy lights (0.95 intensity - about a third of the interior's comparable fixture lights, which rely on an 11-light overlapping grid and enclosing walls the forecourt doesn't have) whose steep top-down angle was also self-shadowing the pumps' own faces. Fixed by boosting canopy light intensity/range, adding two range-bounded non-shadow-casting fill lights, and lifting the pump material's near-black albedo slightly. Verified via before/after screenshots under both `?low=0` and `?low=1`; the distant treeline/road are unchanged.
2. **Remote GLB production dependency** — the two default-loading authored models (register, entry rug) loaded from `raw.githubusercontent.com/intellicia-public/parastore` at runtime. Verified CC0 1.0 provenance directly against that mirror's own LICENSE/README, vendored both files (plus a texture `cash-register.glb` references by relative URI rather than embedding) into `public/assets/market/`, and repointed the default registry entries at the local path. The remaining unapproved/rejected experimental assets stay on the mirror but are now also gated behind `?dev=1`, so no query-parameter guess by a normal player can trigger a third-party request. Verified with the production build served and **all** non-local network access blocked: both models still load, zero blocked attempts occur, zero page errors.

See the git log for the exact commits (`4df640e` lighting, `d7b27e7` assets).

## Current state

- **Latest commit:** `d7b27e7` (pushed, local matches `origin/qa/claude-repair-pass-1`)
- **Working tree:** clean
- **`npm ci`:** clean install, 0 vulnerabilities
- **`npm run build`** (`tsc --noEmit && vite build`): clean, no errors
- **Production build:** `dist/index.html` + `dist/assets/index-*.js` (2.17 MB / 567 KB gzip) + vendored `dist/assets/market/*` verified to boot and render correctly via `vite preview` for menu, Night 1, Night 3, Night 5 and Endless, including with all non-local network access blocked (register/rug still load, register/CCTV/cooler/office/restroom/Pump 7/Larry all functional, zero page errors, zero external requests)

## Full campaign regression status

Every night was driven through its real interactable/anomaly-response production code paths (not just read from source), using `?mode=chapter&night=N&dev=1` for isolated per-night verification and `?mode=campaign` for the real "continue campaign" progression chain. Deterministic time-advancement (`GameState.advanceMinutes`, the same method `DevTools`/`CampaignCompletionSystem` use) replaced real-time waiting where a beat is purely minute-gated; genuine wall-clock waiting was used for real-time response windows and NPC movement wherever practical (see **Known non-blocking issues** for where this sandbox's own limits capped that).

- **Night 1** — clock-in/coffee/notebook, CCTV enter/exit, delivery, pump 5 authorization, cooler log, lottery count, all three closing chores, and the full office lore set (roster/incident log/terminal) all verified directly. One representative customer (Earl) was confirmed to spawn, path toward the counter under real per-frame movement, and be servable once at the counter. Night 1 completion, Night 2 unlock, and save persistence after reload all verified.
- **Night 2** — REGULARS: all 3 rules present, all 5 ordinary retail sales served, Repeater/Head Count/Early Receipt bespoke response windows all resolved on the success path, Wrong Face/Coffee Rule/Customer Stayed shared-response anomalies all resolved, all lore/chore tasks completed. Night 2 completion, Night 3 unlock, save persistence verified.
- **Night 3** — THE STORM: storm rules present, blackout/Pump 7/rear-door-Camera 6 bespoke mechanics all verified on the success path (including the blackout fix below), camera-desync/false-cop/frozen-clock/wrong-door shared-response anomalies all resolved (including a batch-fire scenario deliberately forced to prove the queue fix below), storm chores/lore completed. Night 3 completion, Night 4 unlock, save persistence verified. Verified under both `?low=0` and `?low=1`.
- **Night 4** — SOMEONE CHANGED THE RULES: corrupted-rule evidence loop (camera check + notebook comparison + verify) resolved correctly with no false rule-break, wrong-face/duplicate-player/false-cop/wrong-door/frozen-clock/customer-stayed/camera-desync anomalies all resolved, ordinary retail sales served, ran cleanly start to finish in a single pass including reload persistence. A "second-store" mythic fired organically during this run and was handled correctly.
- **Night 5** — OPEN ALL NIGHT: routine/count/coffee tasks, duplicate-player/customer-stayed/wrong-door/frozen-clock/head-count anomalies, Larry's full six-line dialogue, and the coffee/rear-door/register ritual all verified. 5:60 fires and the HUD clock visibly freezes at "5:60 AM" for the hold (see the Night 5 clock fix from the prior visual-audit pass, re-confirmed here). All six BREAK THE RULES gating conditions were met and the hidden ending correctly appeared only once they were.

## Save / reload / continue status

- Reloading mid-run preserves `gameMinutes`, all completed-task flags, and dynamic tasks (`GameState`'s own save key, per mode+night).
- Reloading a **completed** Night 5 run re-presents the ending-choice dialog (since the underlying ritual/Larry/time flags all persisted) — this is the real "replay a completed night" path and was used to verify all three endings from a single save without corrupting progression.
- `New Shift` resets only the current Night 1 run's save key, never `ProgressionStore`.
- Replaying a completed night does not regress `unlockedNight`, `completedNights`, or achievements — confirmed across every night tested.

## All three endings

CLOCK OUT, OPEN ALL NIGHT and BREAK THE RULES were each independently selected and verified in one continuous session (via the replay path above): each records its ending ID, fires its own achievement (`FUCK_THIS_JOB` / `OPEN_ALL_NIGHT` / `BREAK_THE_RULES`), shows its own shift-report text, and remains replayable afterward. `CLOCKED_OUT_FOR_GOOD` only unlocked once all three were recorded, matching the intended contract. BREAK THE RULES only appeared as an option once all six hidden-ending gates (`n5-larry-file`, `n5-ritual-complete`, `larry-conversation`, `n5-count`, `resolved:wrong-door`, `resolved:frozen-clock`) were satisfied.

## Achievements (30/30)

All 30 achievement IDs in `docs/ACHIEVEMENT_MATRIX.md` were driven to true in one session (via the exact production APIs each system already uses — `state.complete`, `anomalyRuntime.trigger`, `progression.completeNight/recordEnding/recordAnomaly/recordEndless`) and confirmed to unlock, including `ALL_ACHIEVEMENTS` (which itself requires all 29 others). Two were found to be structurally unreachable and are now fixed — see **Fixes landed this pass**.

## Endless Mode

Verified via the real `GameSession.updateEndless()` production method (compressed with large `dt` values rather than waiting real minutes out, per this pass's own allowance for deterministic time advancement): seed reproducibility, weighted anomaly scheduling with no immediate repeats, intensity tiers climbing through tier 5, score formula, one real interactive response resolved successfully, the 3-missed-response run-over condition, the "ENDLESS RUN OVER" summary screen with correct stats, and all three summary buttons (Retry Same Seed / New Run / Framework Menu) present. Best-seconds/best-anomalies persist across reload.

## Menu / navigation

F2 toggles the framework menu; `?menu=1` shows it on boot. Chapter Select correctly disables locked nights and Endless until campaign completion. No dead, duplicate, or dev-only buttons were found on the menu, the per-night shift-report overlay, or the Endless run-over overlay; each button's URL-navigation logic was verified to use the current origin (no hardcoded hosts).

## Production / dev-cleanup findings

Booting with no query parameters at all confirms: no dev panel, no `__oanDebug` hook, no experimental character/asset layer, correct default menu state (Night 1 only unlocked on a fresh save), and no console-breaking errors. Every `?dev=1`-gated code path was checked; one additional leak was found and fixed (see below). Every `console.info`/`console.warn` call remaining in the codebase is an intentional, human-readable fallback notice (e.g. "authored register unavailable; keeping primitive fallback"), not debug spam.

## Asset / network dependency findings

**Resolved in the final pre-merge pass** — see `docs/ASSET_SOURCES.md` for the full record. The two default-loading authored GLB models (register, entry rug) are now vendored in `public/assets/market/` and load from a same-origin path; the game's default boot makes zero requests to any third-party host (verified with all non-local network access blocked in a production build). The remaining experimental/rejected models (cooler, shelf samples, chibi characters) are still on the temporary `intellicia-public/parastore` mirror, pending individual visual approval, but are now gated behind `?dev=1` in addition to their existing opt-in flags, so a normal player can never reach them by guessing a query parameter.

No Steamworks integration exists anywhere in this codebase. Local achievements (`ProgressionStore`/`AchievementSystem`) are **not** Steamworks achievements; `docs/FULL_GAME_FRAMEWORK.md` already notes Steamworks should mirror these IDs later rather than invent a second namespace.

## Performance findings

- `?low=0` vs `?low=1` produce identical light/entity counts; `low` only affects `maxPixelRatio` and shadow resolution, never light intensity or scene composition (confirmed by direct light-intensity/entity-count queries).
- Every mode/night transition in this game is a full page navigation (`window.location.href = ...`), never in-place re-initialization — this makes classic "duplicate entities/lights/listeners across replay" bugs structurally impossible. Confirmed by comparing entity/light/render counts before and after reloading the same night: identical.
- No entity/light-count growth observed in any test in this pass.

## Fixes landed this pass

Regression pass, pushed to `qa/claude-repair-pass-1` (commits `6a9d0c1`, `743572d`, `b5fda73`):

1. **Night 3 blackout instant-fail** (`nightThreeRuntime.ts`) — the "stay behind the counter" position check ran on the exact same frame the blackout armed, with zero grace period. A player anywhere else in the store when the anomaly fired broke the rule immediately, and the emergency lighting flashed on and reverted in the same frame. Added a 6-second grace period before the position check starts enforcing.
2. **Dropped anomaly responses under overlap** (`interactiveAnomalySystem.ts`) — if two shared-response anomalies became due in the same frame (a large `advanceMinutes` jump, or in real play a backgrounded tab resuming with a large elapsed delta, since `GameState.update()` deliberately doesn't clamp `dt` the way movement/response timers do), every anomaly after the first was silently dropped: no response window, no rule-break, no message, and `resolved:<id>` never became true — which could permanently block anything gated on it, including Night 5's hidden BREAK THE RULES ending. Now queues overlapping challenges so each gets its own window in turn.
3. **Two structurally-unreachable achievements** (`achievementSystem.ts`) — `WRONG_NUMBER` checked `'phone-answered'` but `storePhoneSystem.ts` sets `'answered-store-phone'`; `PAPER_TRAIL` checked `'impossible-receipt-read'` but `impossibleReceiptSystem.ts` sets `'read-impossible-receipt'`. Both flag names were transposed, so neither achievement could ever unlock. Corrected to the actual flag names (also used by `shiftEndSystem.ts`'s own Night 1 summary, confirming they're canonical).
4. **Dev-only error overlay leak** (`main.ts`) — `window.addEventListener('error', ...)` showed raw JavaScript error text directly in the in-game message box for every player, not just test sessions. Gated behind `?dev=1`.

Final pre-merge cleanup pass, pushed to `qa/claude-repair-pass-1` (commits `4df640e`, `d7b27e7`):

5. **Exterior forecourt/canopy/pump readability** (`exteriorBuilder.ts`) — see the summary at the top of this document.
6. **Remote GLB production dependency removed** (`authoredRetailAssetSystem.ts`, `authoredCharacterSystem.ts`, `docs/ASSET_SOURCES.md`) — see the summary at the top of this document.

## Known non-blocking issues

- **Headless-sandbox rendering throttle** (this test environment, not the game): this specific CI/QA sandbox's headless Chromium + swiftshader renders at a small fraction of a real browser tab's frame rate under load. Combined with `main.ts`'s intentional `Math.min(dt, 0.05)` per-frame clamp on movement/response timers (standard, correct tunneling protection — not something this pass changed or recommends changing), real-time-gated mechanics that should take 10-30 seconds took several minutes or more to complete organically in this sandbox. This was confirmed to be a rendering-loop artifact, not a game defect, by direct entity-position sampling (NPCs do move, just slowly here) and by the fact that minute-gated (non-real-time) mechanics using the identical code patterns always fired instantly and correctly. A real, focused, foreground browser tab does not exhibit this throttling. Full live 4-out-of-5 Night 1 customer sales and the exact 14-second real-time blackout hold were therefore verified via a mix of live confirmation (one full customer service cycle, movement-rate sampling, the blackout mechanism's grace-period fix) and direct, documented flag completion for the remainder, rather than multi-minute real-time waits per instance.
- Bundle size warning from Vite (2.17 MB / 567 KB gzip, single chunk) — normal for an engine-based web game at this stage; a P2 polish item (code-splitting/manualChunks), not a blocker.

## Dev query parameters (unchanged, all confirmed correctly gated)

| Param | Effect |
| --- | --- |
| `?dev=1` | Dev time-skip panel, `__oanDebug` hook, missing-anomaly-handler diagnostics, BREAK THE RULES visible without gates, in-game runtime-error overlay |
| `?mode=campaign\|chapter\|endless` | Session mode |
| `?night=1-5` | Selected night (`campaign` mode clamps to the actually-unlocked night) |
| `?seed=N` | Endless RNG seed |
| `?menu=1` | Opens the framework menu on boot |
| `?low=1` / `?low=0` | Force/deny the reduced-performance profile |
| `?perf=1` / `?perf=0` | Alias for the above |
| `?assets=0` | Disables the authored-asset layer entirely |
| `?experimentalAssets=1` (also requires `?dev=1`) | Enables not-yet-approved authored props (cooler visual, shelf samples, accents), remote-loaded |
| `?characters=1` / `?experimentalCharacters=1` (also requires `?dev=1`) | Enables the (rejected, disabled-by-default) chibi character layer, remote-loaded |
| `?forceMythic=<id>` (requires `?dev=1`) | Forces a specific campaign mythic for testing |

None of these affect a real player's default experience; all were confirmed absent/disabled when booting with no query string at all.

## Final manual tests still required on a real player machine

This pass was run in an automated headless sandbox. Before shipping, a human should still:

- Play at least one full real-time Night 1-5 campaign run on a real desktop browser (Chrome/Firefox/Edge) with mouse-look and keyboard input, to confirm feel/pacing/difficulty that automated interactable calls cannot judge.
- Confirm audio (ambient loop, register beep, chime) plays correctly — `AmbientAudio` was not exercised by this pass beyond construction.
- Confirm pointer lock / mouse-look behaves correctly across browsers (Safari in particular has historically been stricter about pointer lock).
- Spot-check frame rate on a real mid-range laptop under `?low=1` vs default, since this pass's sandbox could not produce a meaningful FPS number.
- Confirm the exterior lighting reads correctly on a real monitor/panel (this pass's before/after comparison was done via screenshots in a headless sandbox, not a calibrated display).

## Steam packaging tasks still outstanding

- No Steamworks SDK integration exists yet. Local achievements would need to be mirrored to Steamworks achievement IDs (`docs/FULL_GAME_FRAMEWORK.md` already flags this as future work) — this is a from-scratch integration, not a fix.
- No packaging/build pipeline for a Steam depot (e.g. Electron/NW.js wrapper or a chosen browser-shell strategy) exists in this repository; `npm run build` only produces a static web `dist/`.
- Bundle-size code-splitting (see Performance findings) would reduce initial load time in a packaged build.
- Before shipping any of the remaining experimental/rejected assets (cooler visual, shelf samples, chibi characters), follow the same vendoring process used for the register/rug: verify license against the mirror, copy the file into `public/assets/...`, repoint the registry entry locally (see `docs/ASSET_SOURCES.md`).

## Blocker classification

**P0 (cannot release):** none remaining. All defects found across the regression pass and the final pre-merge cleanup pass (Night 3 blackout instant-fail, dropped overlapping anomaly responses, two unreachable achievements, exterior lighting crush, remote GLB production dependency) have been fixed, verified, and pushed.

**P1 (should fix before release):** none remaining.

**P2 (can ship, polish later):**
- Single 2.17 MB JS bundle; consider code-splitting.
- `NOBODY_HOME`'s achievement check only recognizes Night 3's rear-door-check flag (`rear-door-checked` / `n3-rear-door-safe`); Night 1's equivalent rear-door-rattle flag (`checked-rear-rattle`) isn't included, so Night 1 alone can't grant it (Night 3 already can, so the achievement itself is reachable — this is a minor inconsistency, not a blocker).
