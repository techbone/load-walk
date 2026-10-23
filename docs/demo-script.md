# Demo script (under 3:00)

Recorded from Lens Studio's Interactive Preview. Real runs only; nothing sped up unless it says so on screen. Numbers below are from the approved brief (200 W / 1,000 Wh unit); re-check them against the Lens before recording.

Thesis: **Look around your house, see what your inverter can carry.**

| Time | Screen | Narration | Must be true before recording |
|---|---|---|---|
| 0:00–0:20 | The real story: a photo of the HeroEE 1 label, then the iron | "One night the power went out and I had to iron a shirt for work early the next morning. I plugged the iron into my inverter and it tripped. I had no idea why. My power station gives 200 watts; the iron wants over a thousand. Load Walk shows you that before you plug it in." | Label photo on hand (HeroEE 1 box, 200 W / 1 kWh) |
| 0:20–0:35 | Preview: the desk room at night | "Load Walk puts the answer on the appliances themselves." | Scene opens at the desk start view; plateAlpha and text readable at 2 m |
| 0:35–1:00 | Pinch the freezer → card → pick Freezer | "Pinch it, say what it is. In real glasses the camera would recognise it; in the preview this pick is the stand-in." Tag: 350 W, too big for this unit alone, before any toggle. | Done criterion 1 passes; the "SCAN IS A STAND-IN" note is visible |
| 1:00–1:40 | Toggle fan → phone charger → power bank → laptop | Chip each time: 12 W, 24 W (30h 6m), 42 W (17h 12m), 182 W / 200 W (3h 58m), near limit. "Charging my whole desk takes almost everything this unit has." | Criterion 2 passes; power bank marked as an estimate on screen |
| 1:40–2:00 | Walk to the power station | Meter above it: 182 W / 200 W, 3h 58m left. | Criterion 3 passes; meter has clear space |
| 2:00–2:25 | Toggle the iron | Chip 1,282 W / 200 W, iron glows, chime, meter in overload. Play the chime on camera. "It tells me before the unit trips." Optional: look away so the arrow shows. | Criterion 4 passes; audio is captured in the recording |
| 2:25–2:35 | Toggle the iron off | Everything clears; back to 182 W and 3h 58m. | Criterion 5 passes |
| 2:35–3:00 | Design process | "Planned with the Devpost skill pack, built by CLAD through the Lens Studio MCP, tested with LEAF. The load maths is a plain tested file the Lens shares with the repo." Show the brief, the LEAF results (20/20, or the current count), `npm test` (21/21). End on the thesis. | LEAF count in the README is current; if voice works in the preview it goes before this segment |

## Recording notes

- Record the preview window at full size with system audio on (the chime matters).
- Don't speed anything up. If a take has the preview starting two Lens instances, restart the preview and record again.
- Say plainly what's a stand-in: the scan pick, hard-coded wattages, no real camera. Judges reward honesty and the brief already says it.
- Upload to YouTube as public, under 3 minutes, and embed it at the top of the README.
