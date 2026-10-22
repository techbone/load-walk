# LEAF run 1 (2026-10-22)

Reported by the CLAD build agent (`ls-clad:specs-experience-builder`, 39m 51s). Not yet re-run independently.
Runner: `lens/Assets/LeafTests/LoadWalkScenarioRunner.ts` (logs PASS/FAIL in the preview; off by default), because the LEAF panel tools weren't available to the agent.

| Scenario | Done criterion | Result |
|---|---|---|
| ScanAndPickScenario | 1. Scan and pick | pass |
| LiveTotalScenario | 2. Live total | pass |
| MeterScenario | 3. Meter at the power station | pass (checks placement, doesn't walk there) |
| OverloadScenario | 4. Overload | pass (chime checked with isPlaying, not by ear) |
| RecoveryScenario | 5. Recovery | pass |
| OutOfViewArrowScenario | none (risk in brief) | pass (checks it enables and targets the iron) |
| IKReachScenario | none | **fail**: ray failed to converge on "Fan" (undiagnosed) |

Caveats: not a full final run (after cosmetic edits only criterion 3 and a compile check were re-run); preview refresh can start two Lens instances, so some log lines repeat. Nobody has clicked through the preview yet.

Engine tests at the same commit: `npm test` 18/18.
