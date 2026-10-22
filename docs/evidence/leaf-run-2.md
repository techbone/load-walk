# LEAF run 2 (2026-10-22, after design fixes)

Reported by the CLAD build agent after a full final run. Not re-run independently; nobody has walked the preview yet.

| Scenario | Done criterion | Result |
|---|---|---|
| ScanAndPickScenario | 1. Scan and pick | pass |
| LiveTotalScenario | 2. Live total | pass |
| MeterScenario | 3. Meter at the power station | pass (reads the meter in place, doesn't walk there) |
| OverloadScenario | 4. Overload | pass |
| RecoveryScenario | 5. Recovery | pass |
| OutOfViewArrowScenario | none (risk in brief) | pass |
| PicksScenario (new) | none | pass (fridge, pump and iron picker groups, tag text, iron "too big" note) |
| IKReachScenario | none | pass (earlier failure only reproduced when the preview started two Lens instances; cause inferred, not proven) |

**8/8 pass.** Engine tests at the same commit: `npm test` 18/18.

Not seen on screen yet: Ghost button outline, Cutive Mono legibility, plates at alpha 0, card inside the 37° × 32° view, half-faded chip.
