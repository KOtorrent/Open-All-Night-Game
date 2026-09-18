# Smoke Test Routes

These routes are the minimum manual/dev validation path before the dedicated Claude QA pass.

## General
- Launch with `?dev=1` so time skips are available.
- Start from a fresh run save for the selected mode/night.
- Confirm no runtime error overlay appears.
- Confirm interaction prompts appear only when the target is relevant.

## Night 1
URL: `?mode=campaign&night=1&dev=1`
- Complete clock-in, coffee and notebook.
- Serve the opening customer.
- Trigger Freezer Flicker, Silent Customer and Bathroom Knock.
- Check CCTV and one chore.
- Reach 6:00 AM and verify Night 1 completion.

## Night 2 — REGULARS
URL: `?mode=chapter&night=2&dev=1`
- Serve at least two ordinary retail customers.
- Trigger Repeater and refuse the second sale.
- Trigger Head Count and verify it.
- Trigger Impossible Receipt and discard it.
- Verify one optional task/lore interaction.
- Reach 6:00 AM and verify Night 3 unlock.

## Night 3 — THE STORM
URL: `?mode=chapter&night=3&dev=1`
- Observe storm ambience/lightning.
- Trigger Storm Blackout and stay behind the counter until it resolves.
- Trigger Pump 7 and deny authorization.
- Trigger Rear Door Knock, verify Camera 6 first, then check the lock.
- Serve one ordinary customer.
- Reach 6:00 AM and verify Night 4 unlock.

## Night 4 — SOMEONE CHANGED THE RULES
URL: `?mode=chapter&night=4&dev=1`
- Compare notebook pages.
- Verify Cameras 4 and 6.
- Trigger Corrupted Rule.
- Verify/cross out the false rule before acting on it.
- Trigger Wrong Face / Customer Stayed / Wrong Door and use the response interaction.
- Serve one ordinary customer.
- Reach 6:00 AM and verify Night 5 unlock.

## Night 5 — OPEN ALL NIGHT
URL: `?mode=chapter&night=5&dev=1`
- Serve at least one ordinary customer.
- Read Larry’s file.
- Trigger Wrong Door and Frozen Clock and resolve both.
- Complete the head-count task.
- Meet Larry and exhaust all six dialogue lines.
- At 5:55+, complete coffee / rear door / register ritual.
- Verify 5:60 state.
- Confirm ending choices remain locked until Larry + ritual are complete.
- Confirm CLOCK OUT and OPEN ALL NIGHT are selectable.
- Confirm BREAK THE RULES appears only when the hidden sabotage requirements have been satisfied.

## Endless
URL: `?mode=endless&night=5&dev=1&seed=12345`
- Verify same seed reproduces the same anomaly selection order.
- Confirm no immediate repeat of the same anomaly.
- Confirm intensity tier and score increase over time.
- Miss three interactive anomaly responses.
- Confirm ENDLESS RUN OVER summary appears.
- Confirm Retry Same Seed, New Run and Framework Menu buttons work.

## Achievement audit
After campaign/endless smoke tests:
- Confirm campaign-completion achievements unlock only after corresponding progression is saved.
- Confirm NO SERVICE recognizes Night 3 Pump 7 denial.
- Confirm NOBODY HOME recognizes the verified Night 3 rear-door response.
- Confirm LARRY recognizes the Night 5 conversation.
- Confirm PERFECT WEEK is based on a zero-break completed run for each night, not lifetime cumulative mistakes.

## Deferred visual/geometry QA
Do not block framework/content acceptance on:
- office/restroom overlap
- NPC overlap/pathing
- cooler/freezer stock visuals
- hero prop quality
- prompt alignment edge cases
- final character art
- lighting/material/post-processing polish

Those belong to the dedicated Claude repair/graphics pass after content-complete.
