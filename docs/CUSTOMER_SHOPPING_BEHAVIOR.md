# Customer Shopping Behavior

Scripted (never dynamic/AI) shopping detours added to the five ordinary Night 1 customers
(Earl, Jenna, Marcus, Dale, Traveler), so they read as people who came in to shop rather than
walk-straight-to-register mannequins. Anomaly actors (Silent Customer, Smiling Woman, Tall Man,
Duplicate Player, Larry) are explicitly excluded - see "Anomaly exclusions" below.

## Timing rule and real risk assessment (done before any route was touched)

The game clock advances at `dt / 4` (`gameState.ts`): **1 real second = 15 game-seconds**, so a
10-second real-time detour costs 2.5 game-minutes. Checked every downstream dependency on these
five customers' spawn/completion (`grep` across all systems for `isComplete('*-sale')` and each
spawn gate):

| Customer | Spawn gate | Depends on |  Anything gated on ITS completion? |
|---|---|---|---|
| Earl | `elapsed > 7` (real-time fallback) or minute 23:05 | nothing | `first-sale` task only (no downstream gate) |
| Jenna | minute 24:55 | nothing | none |
| Traveler | minute 25:10 | `silentResolved` (Silent Customer's own resolution, unrelated to Jenna/Dale) | none |
| Dale | minute 26:05 | nothing | **Marcus's spawn** (`isComplete('dale-sale')`) |
| Marcus | minute 27:42 AND `dale-sale` complete | Dale's completion | none |

**Only one real interdependency exists**: Marcus's spawn is gated on Dale's sale being complete.
This is an **AND-gate that degrades gracefully**, not a hard deadline - if Dale takes longer,
Marcus simply spawns however many seconds later Dale actually finished (plus still needing
minute 27:42), never breaks, skips, or fails. There is no anomaly trigger, shift-completion
check, or story beat anywhere in Night 1 that has a hard "must happen by exactly minute X or the
run is broken" dependency on any of these five ordinary customers' arrival time. This matches
what direct code review found, not an assumption.

Given that, the real constraint isn't "don't add any delay" - it's "don't add so much delay that
a customer's whole shopping trip starts to feel slow, and keep Dale's detour modest since it's
the one customer with a real (soft) downstream dependency."

## Timing table

Distances/times computed from each route's actual waypoint coordinates and each customer's own
`speed` field (unchanged). "Safe" = no hard deadline is ever at risk given the analysis above;
flagged only where a detour is large enough to be worth calling out.

| Customer | Speed | Old route distance | Old checkout ETA (from spawn) | New route distance | New checkout ETA | Added dwell | Total delta | Safe? |
|---|---|---|---|---|---|---|---|---|
| Earl | 1.65 m/s | ~15.9m | ~9.6s | ~15.9m (same path, reused waypoint) | ~9.6s + dwell | +2.2s | **+2.2s (+0.55 game-min)** | Yes - no dependency at all |
| Marcus | 1.72 m/s | ~15.0m | ~8.7s | ~15.5m (one waypoint repositioned ~0.5m into the aisle, one new nearby stop) | ~9.0s + dwell | +2× 2.0s | **+~4.3s (+1.1 game-min)** | Yes - no dependency |
| Dale | 1.45 m/s | ~24.7m | ~17.0s | ~29.5m (cooler detour ~2.4m each way from his existing near-cooler waypoint) | ~20.3s + dwell | +3.2s | **+~6.5s (+1.6 game-min)** | Yes - only degrades Marcus's spawn gracefully (see above); Dale's own spawn gate (26:05) is untouched |
| Traveler | 1.72 m/s | ~24.0m | ~14.0s | ~26.5m (coffee stop moved to the front of the route, near the entrance) | ~15.5s + dwell | +2.0s | **+~3.5s (+0.9 game-min)** | Yes - no dependency |
| Jenna | 1.55 m/s | ~18.2m | ~11.7s | ~18.2m (unchanged - see "Jenna" below) | unchanged | 0 | **0** | Yes |

**Accepted, none rejected.** All five stay well inside a couple of game-minutes of their original
pacing, and the one real dependency (Marcus-on-Dale) tolerates arbitrary extra delay by design.

## Why Jenna gets no detour this pass

Every existing waypoint on Jenna's route stays in the central aisle corridor (z between -3.8 and
6); the cooler is 6-7 meters further back (z ≈ -9.5 to -9.9) and no point on her route comes
anywhere near it - unlike Dale, whose route already reaches z = -8.3, only ~1.5m short of a
cooler-front standing spot. Giving Jenna a cooler trip would mean a genuinely large detour (bad
distance-to-benefit ratio) purely to hit the brief's example personality, when Dale already
covers "customer visits the cooler" more cheaply and just as visibly. Documented honestly rather
than forced: Jenna keeps her original route this pass. Recommended for a later pass if a second
cooler-visiting customer is wanted (candidate: reroute her second existing waypoint (5.0, -3.8)
toward (2.92, -9.5) instead of leaving it at -3.8, a ~6m detour - not attempted here to keep this
pass's total footprint small enough to fully verify).

## Shopping waypoints (Phase 2)

Reused **existing** route waypoints wherever one already sits in a usable spot (Earl's aisle
stop, Marcus's first aisle stop); added **new** waypoints only where the existing route genuinely
never goes near the target fixture (Dale's cooler approach, Traveler's coffee approach, Marcus's
second aisle position). All new positions were checked against the actual shelf/cooler/counter
geometry in `storeBuilder.ts` (shelf, cooler-glass, and cooler-shelf box centers and half-extents)
to confirm the stop sits in the open aisle/cooler-front space, not inside a fixture:

| Waypoint | Position | Facing target | Used by |
|---|---|---|---|
| Aisle 3 interior (Earl) | (2.3, 2.4) *(existing)* | (1.15, 1.4, 2.4) - the aisle-3 shelf face | Earl |
| Aisle 3 interior A (Marcus) | (1.7, 3.5) *(existing waypoint, repositioned from (1.4,4.8) to sit inside the aisle's own z-range)* | (2.25, 1.4, 3.5) - aisle-3 opposite shelf face | Marcus |
| Aisle 4 interior (Marcus) | (5.65, 1.0) *(new)* | (5.1, 1.4, 1.0) - aisle-4 shelf face | Marcus |
| Cooler door 2 approach | (4.9, -8.9) *(new)* | — (transit point) | Dale |
| Cooler door 2 stand | (4.74, -9.55) *(new)* | (4.74, 1.6, -10.20) - the cooler glass | Dale |
| Coffee approach | (6.6, 9.6) *(new)* | — (transit point) | Traveler |
| Coffee stand | (6.3, 9.0) *(new)* | (6.1, 1.4, 8.15) - the brewer | Traveler |

All stand-points sit at least 0.4m clear of the nearest shelf/cooler-glass/counter box face
(checked against each fixture's own half-extents), so no waypoint places a character clipping
into store geometry.

## Route personalities (Phase 3)

- **Earl** - regular, predictable: entrance → familiar aisle-3 stop (grab one item, ~2.2s) →
  checkout → exit. Unchanged path, one dwell added.
- **Jenna** - unchanged this pass (see above).
- **Marcus** - browses two aisle positions (aisle 3, then aisle 4), one item each, ~2.0s dwell
  each, then checkout.
- **Dale** - suspicious-but-harmless: longer aisle transit, then a real cooler visit (~3.2s -
  visibly longer than the others, matching "pause / look around"), picks a completely ordinary
  cold drink, then checkout. Nothing about the sequence reveals or implies an anomaly.
- **Traveler** - coffee first (matches "just walked in off the road"), ~2.0s dwell, then the rest
  of his existing route to checkout, carrying a cup.

## Anomaly exclusions (Phase 12) - verified, not assumed

- **Silent Customer** (`nightOneDirector.ts`): separate route/actor entirely (`silentVisitor`, not
  `customer`); the new shopping-stop system only polls the five named ordinary-customer roots
  above, so Silent Customer is structurally untouched.
- **Smiling Woman / Tall Man**: `sharedAnomalyHandlers.ts`'s `spawnPresence()` never gives them a
  `route` at all - no movement code exists for them - so there is nothing for a stop system to
  attach to even accidentally.
- **Duplicate Player**: `AuthoredCharacterSystem.spawnDuplicatePlayer()` is a static, non-routed
  spawn with a fixed lifetime; not part of the customer-route list.
- **Larry**: `nightFiveRuntime.ts`'s `spawnLarry()` sets a position once and never moves him again;
  not part of the customer-route list.

None of the new code in this pass references any of these five actors' root names.
