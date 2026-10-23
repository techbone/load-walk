# LEAF run 3 (2026-10-23, readability pass)

Reported by the CLAD build agent after a full final run; not re-run independently. 11/11 scenarios pass (the 8 from run 2, plus measurement and evidence-capture scenarios that only run when selected by id). Engine tests at the same commit: `npm test` 18/18.

Checked by hand (Musa, in the preview): chime plays on overload, nothing overlaps badly, text readable up close.

Measured text (agent, from rendered pixels): tag wattage about 4.0 cm; labels and notes 2.3–2.6 cm; meter figure about 5.5 cm (tilt foreshortens the designed 6 cm); Turn on/off button 13 cm tall. Start spot is 2.5 m from the desk, not 2 m. Everything stays within about 20 cm of its appliance.

Known issues seen in `fix-round-3/after-desk-start-view.png`: the laptop tag covers the top of the laptop lid; the power bank tag overlaps its table edge; a card can overlap a neighbouring model while open; the Ghost button outline isn't visible; the pump tag was not re-photographed after its last nudge. Before/after pairs are not from the same spot because the preview camera starts somewhere different each run.

Colours render lighter in the preview's simulated additive display than intended (mint 97,235,168 → 134,249,189); amber over the cream fridge is the hardest case. Real glasses: unproven.
