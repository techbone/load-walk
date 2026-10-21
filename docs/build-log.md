# Build log

Surprises, dead ends and the path we took. Feeds the README's "hard problem" section and the launch thread.

Format: date · what surprised us · what we tried · what we chose · the test that guards it.

## 2026-10-21

- Skill pack must run inside the Lens Studio project folder (with the `.esproj`). Repo root is that folder.
- Preview can't show live camera vision or memory between sessions, so appliance recognition is a pinch stand-in and the demo is one session.
- Engine counts only the single largest startup surge on top of running load: motors rarely start at the same instant, and stacking every surge would flag almost any fridge + freezer home as unsafe. Guarded by `fridge surge counted once on top of running load`.
- Homebrew on this Mac is the Intel build and won't run, so Lens Studio is installed by hand.
