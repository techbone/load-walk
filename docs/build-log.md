# Build log

Surprises, dead ends and the path we took. Feeds the README's "hard problem" section and the launch thread.

Format: date · what surprised us · what we tried · what we chose · the test that guards it.

## 2026-10-21

- Skill pack must run inside the Lens Studio project folder (with the `.esproj`). Repo root is that folder.
- Preview can't show live camera vision or memory between sessions, so appliance recognition is a pinch stand-in and the demo is one session.
- Engine counts only the single largest startup surge on top of running load: motors rarely start at the same instant, and stacking every surge would flag almost any fridge + freezer home as unsafe. Guarded by `fridge surge counted once on top of running load`.
- Homebrew on this Mac is the Intel build and won't run, so Lens Studio is installed by hand.

## 2026-10-22

- Lens Studio 5.24.1 sign-in failed at accounts.specs.com ("Something went wrong") in every browser. SPECS team's workaround: downgrade to 5.23.2. A 5.24 project warns as unstable in 5.23, so we recreated the Base Template in 5.23.2 as `lens/` and moved the brief and engine in. Drift test now points at `lens/Assets/Scripts/LoadEngine.ts`.
- CLAD built the Lens in about 40 min from the brief. 5/5 done-criterion scenarios pass by its report; an extra IK reach test fails (undiagnosed). Details in `docs/evidence/leaf-run-1.md`. Agent deviations from the brief: scan card opens above the appliance (brief says beside), chip shrinks instead of fading, no mono font yet, dark grey UI Kit plates (near-invisible on additive glasses).
- Fix round: card beside the appliance, chip fades by opacity, Cutive Mono for numbers (VT323 imported as an alternative; both OFL Google Fonts), light translucent plates with a plateAlpha control. 8/8 LEAF by the agent's report (`docs/evidence/leaf-run-2.md`). IK reach failure didn't reproduce; it only happened when the preview started two Lens instances, so check for a double instance before touching the Lens if it returns.

## 2026-10-23

- Visual pass: grey boxes replaced with 11 generated GLB models (about 2–3 MB each, 27 MB of assets in total, fine for plain git), a warm-lit room, JetBrains Mono Bold for numbers (OFL), one scan card at a time, tags and cards moved next to their appliances. Captures in `docs/evidence/visual-pass/`. Musa walked it in the preview and approved the look.
- Readability pass: wattage is now the biggest line on each tag (~4 cm digits), plates fit content, tags turn to face the viewer, desk items re-spaced so no tags overlap. The agent shipped the start spot at 2.5 m, not 2 m, because at 2 m the preview's ~37° view only shows ~113 cm and the four desk tags span ~125 cm. Preview camera start position changes every run, so before/after captures are not from the same spot. Leftover: laptop tag covers the lid.
- Voice spike passed: Snap's AsrModule transcribes English in the preview (needs login, internet, quiet room; no language option, so auto-detected). Details in `docs/spikes/voice.md`. The spike's scene object was lost in a force-quit and re-created disabled; never save it into the scene.
