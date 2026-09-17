# Playtesting

Human playtesting is intentionally batched because Codespaces browser rendering can be slow.

## Fast milestone test URL
Add `?dev=1` to the forwarded game URL to expose +15/+30/+60 game-minute controls.

Codespaces hosts automatically enable the low-cost rendering profile. You can also force it with `?low=1`. To deliberately check full-quality rendering in Codespaces, use `?low=0`.

Examples:
- `...?dev=1`
- `...?dev=1&low=1`
- `...?dev=1&low=0`

## Night 1 event checkpoints
Approximate in-game times currently useful for milestone testing:
- 11:00 PM range: first customer / early routine
- 12:10 AM: Pump 5 fuel authorization
- 12:35 AM: delivery arrival and manifest/stock loop
- 1:10 AM: ordinary late-night traveler after Silent Customer resolution
- 2:00 AM: restroom closure / knock rule window
- 2:05 AM: Dale arrives
- 3:08 AM: unattended Pump 7 sedan appears
- 3:28 AM: Pump 7 sedan vanishes
- 5:55 AM: clock-out reminder
- 6:00 AM: Night 1 completion and summary

Do not treat time-skip mode as a substitute for a final full-shift playthrough. It is only for development iteration.
