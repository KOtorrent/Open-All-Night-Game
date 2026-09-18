# Achievement Trigger Matrix

All 30 planned achievements are represented in `achievementCatalog.ts`.

| ID | Trigger contract | Status |
| --- | --- | --- |
| FIRST_DAY | Finish Night 1 | wired |
| REGULAR | Serve all five ordinary Night 1 customers | wired |
| STORM_WARNING | Finish Night 3 | wired |
| TRUST_ISSUES | Survive Silent Customer without speaking | wired |
| OVERTIME | Reach 5:60 / finish Night 5 | wired |
| FUCK_THIS_JOB | Choose CLOCK OUT | wired |
| OPEN_ALL_NIGHT | Choose OPEN ALL NIGHT | wired |
| BREAK_THE_RULES | Choose hidden sabotage ending | wired |
| CLOCKED_OUT_FOR_GOOD | Record all three endings | wired |
| DALE_WAS_FINE | Serve Dale without any supernatural payoff | wired |
| EMPLOYEE_OF_THE_MONTH | Clean high-completion shift | wired; QA threshold |
| TENURE | Finish Nights 1-5 | wired |
| RULE_FOLLOWER | Finish any run with zero rule breaks | wired |
| RULE_BREAKER | Finish any run after at least one rule break | wired |
| CAMERA_SHY | Witness CAM 4 Figure or Camera Desync | wired |
| PUMP_SEVEN | Witness Pump 7 activity | wired |
| THREE_THIRTY_THREE | Witness Frozen Clock | wired |
| NO_SERVICE | Deny dangerous Pump 7 authorization | wired for Night 1/Night 3 state |
| NOBODY_HOME | Safely verify/check rear door event | wired for Night 1/Night 3 state |
| WRONG_NUMBER | Answer counter phone | wired |
| PAPER_TRAIL | Read Night 1 impossible receipt | wired |
| NIGHT_AUDITOR | Read roster, incidents and office terminal | wired |
| LARRY | Trigger Larry Arrival or finish Larry conversation | wired |
| MYTHIC | Witness any mythic | wired |
| ALL_MYTHICS | Witness all five mythics | wired |
| ENDLESS_30 | Survive 30 real minutes in Endless | wired |
| ENDLESS_60 | Survive 60 real minutes in Endless | wired |
| ENDLESS_100 | Survive 100 Endless anomalies | wired |
| PERFECT_WEEK | Have at least one zero-rule-break completed run for each night | wired |
| ALL_ACHIEVEMENTS | Unlock the other 29 | wired |

## QA notes
- Progression-backed achievements are intentionally independent of the current run save.
- PERFECT WEEK evaluates clean completed runs, not permanent lifetime rule-break totals.
- ALL_MYTHICS may require campaign + Endless replay because mythics are deliberately rare.
- Steam achievement API mirroring is a future platform integration; local trigger contracts are already established.
