# LEAF results

LEAF scenarios pinch the real Lens along SIK's ray (and inject transcripts for voice), so they test the same paths a user's hand does. They live in `lens/Assets/LeafTests/` and run from Lens Studio's LEAF panel.

## Latest: two full runs back to back (2026-10-26, Evening Room)

| Run | Passed | Failed |
|---|---|---|
| 1 | 28 | 0 |
| 2 | 27 | 1 (`extra-ik-reach-fan`) |

All six done-criterion scenarios passed in both runs. Each run started from a camera reset and preview refresh; counts come from the scenario manager's PASSED / FAILED log lines.

| Done criterion (from the [design brief](../../lens/devpost/design-brief.md)) | Scenario |
|---|---|
| 1. Scan and pick: freezer tag, "Too big for 200 W" before any toggle | `criterion-1-scan-and-pick` |
| 2. Live total at the appliance: 24 W → 42 W → 182 W with hours | `criterion-2-live-total` |
| 3. Meter at the power station: 182 of 200 W, 3h 58m | `criterion-3-meter` |
| 4. Overload: iron → 1,282 W, red tag and chip, chime, meter overload | `criterion-4-overload` |
| 5. Recovery: iron off → back to 182 W and 3h 58m | `criterion-5-recovery` |
| 6. Voice does what the pinch does (transcripts injected, no microphone) | `criterion-6-voice` |

The other 22 scenarios cover placement (every tag within 20 cm of its appliance, meter 70 cm above the station), reach from 1 to 3 m, one card at a time, picking by the label on screen, pinching an appliance body picks nothing, retagging, voice off by default, voice restarts, and the out-of-view arrow. A few `extra-evidence-*` scenarios only stage the room for screenshots and run when selected by id.

## Known flake

`extra-ik-reach-fan` drives a full-arm avatar to pinch the fan. It fails on roughly half of cold starts after a refresh ("ray failed to converge") and always passes on an immediate re-run. Slow editor frames explain some failures (about 98 ms per frame in a failing trace against about 22 ms in passing runs), not all. A wait-for-smooth-frames gate didn't fix it and was removed. It is not a done criterion.

## How the count grew

| Date | Scenarios | Result | What changed |
|---|---|---|---|
| 22 Oct | 7 | 6 pass, IK reach fails | First CLAD build |
| 22 Oct | 8 | 8/8 | Design fixes; picker groups scenario |
| 23 Oct | 11 | 11/11 | Readability pass; measuring and evidence scenarios |
| 23 Oct | 15 | 15/15 | Voice: four transcript-injection scenarios |
| 23 Oct | 20 | 20/20 | Pick-targeting bug fix: cards by label, reach, voice restarts |
| 25 Oct | 28 | 26/28 | Evening Room layout; reach and placement tests broke on the new geometry |
| 26 Oct | 28 | 28/28, then 27/28 | Reach measured along the floor; harness race fixed |

Results through 23 Oct were reported by the CLAD build agent; the 26 Oct runs were read from the scenario manager's log. Engine unit tests (`npm test`) are separate: 21/21.
