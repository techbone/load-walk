# LEAF run 5 (2026-10-26, evening room, test fixes)

Reported by the CLAD agent; counts from the scenario manager's PASSED / FAILED lines, each run from camera reset, refresh, panel open and scenario list.

| Run | Passed | Failed |
|---|---|---|
| 1 | 28 | 0 |
| 2 | 27 | 1 (`extra-ik-reach-fan`) |

All six done-criterion scenarios passed in both runs.

Fixes this round: `extra-reach-1m-to-3m` now measures 1 m along the floor from the appliance (the desk items sit 122 cm below eye height, so a straight-line 1 m spot doesn't exist and the helper had silently fallen back to 10 cm); `extra-placement-within-20cm` had a harness race (the Lens destroys the scan card 0.3 s after a pick while LEAF read the button's name later), fixed with a `trigger()` override on our LEAF interactor, reproduced with forced 250 ms frames.

Known flake: `extra-ik-reach-fan` (first scenario; the IK avatar's pinch sometimes never registers). Failed on about half of cold starts before any change this session, always passes on an immediate re-run. Slow editor frames explain some failures (98 ms average in a failing trace vs about 22 ms), not all. A wait-for-smooth-frames gate did not fix it and was removed. Not a done criterion; accepted as a known flake.

Not re-run after removing the gate: the suite.
