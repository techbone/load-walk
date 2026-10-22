---
status: approved
---

# Design brief: Load Walk

<!-- Filled in by plan-lens from the learner's interview. Use the learner's words. Mark any value they didn't choose as (default). -->

## The one spatial moment
Mid-outage, you toggle an appliance and the overload warning fires: the load chip turns the warning colour, the culprit appliance glows, a chime plays, and it tells you what to switch off before the inverter trips.

## Why it belongs on glasses
- Uses: shares your view (tags sit on the appliance you're looking at) / leaves your body free (you're flipping switches, not holding a phone and typing into a web calculator)
- Why it's better than the phone or laptop version: the only tools Musa knows of today are web calculators where you type in appliances by hand. That breaks the moment you're actually standing in front of the freezer deciding whether to switch it on — you'd have to stop, find your phone, and type. Load Walk puts the number on the appliance itself and updates it live as you act.

## Product or overlay
- Type: overlay — it responds to something real (Musa's actual appliances and power station)
- What the real version would sense: the camera would recognise each appliance and read its wattage off the label, then the user confirms
- Stand-in for the preview: pinch an appliance to open a small card beside it with a few big buttons. Picking one tags the appliance with a hard-coded typical wattage (and startup surge for fridge/freezer/pump). Everything after the scan — toggle, live meter, overload warning — runs on real logic, not stand-in behaviour.
- Picker groups (3–4 big buttons each, the correct appliance always among them):
  - Freezer: Freezer, Fridge, Water pump
  - Fridge: Fridge, Freezer, Water pump
  - Water pump: Water pump, Freezer, Fridge
  - Fan: Fan, Phone charger, Power bank
  - Phone charger: Phone charger, Fan, Power bank
  - Power bank: Power bank, Phone charger, Fan
  - Laptop: Laptop, Phone charger, Power bank, Fan
  - Iron: Iron, Kettle, Microwave

## Where things live
- Where the user is looking during the main task: at the appliance they're currently scanning or toggling; they check the full meter only when they walk to the power station
- Appliance tag: sits directly on the appliance, showing name, running watts, and (for fridge/freezer/pump) the startup surge. Appears right after the scan-and-pick.
- Live load chip: a small chip beside the appliance's tag showing the new running total and hours of battery left at that load, e.g. "24 W / 200 W · 30h 6m". Fades a few seconds after a toggle. Turns the warning colour if the toggle pushes the total over the limit; once over capacity the hours figure is dropped (time-to-trip isn't a meaningful number past the limit) and only watts show, e.g. "1,282 W / 200 W".
- Full load meter: floats about 70 cm above the power station, tilted toward the user, readable standing next to the unit without looking down. Shows live load against the 200 W output limit, plus battery hours remaining.
- Out-of-view alert: if an overload is caused by something outside the current view, an arrow points toward it.

## Hands and input
- Scan: pinch an appliance → small card opens beside it with a few big buttons → pinch the appliance name to tag it
- Toggle: pinch the big button on an appliance's tag to turn it on/off
- Targets are big and highlight when aimed at.
- No voice or custom gestures — pinch covers both scanning and toggling.

## When things show
- Appliance tag: appears once the appliance is scanned and tagged; stays as long as the appliance is tagged (persists for the session).
- Live load chip: shows right after a toggle, fades out a few seconds later if the load is within capacity.
- Warning state (chip colour, appliance glow, chime): shows the instant a toggle pushes the total load over 200 W; clears the instant the offending appliance is toggled back off.
- Full load meter: always visible near the power station; the user checks it by walking over, not by it chasing them.
- If something needs attention out of view: a chime plays and a small arrow points toward the appliance causing the overload.

## Done criteria
Each one can be checked in Lens Studio's preview.
1. **Scan and pick.** Pinch the freezer → card opens with Freezer / Fridge / Water pump → pick "Freezer" → tag appears: "Freezer · 350 W · surges about 3×" and also flags that 350 W alone is too big for the 200 W unit, before any toggle.
2. **Live total at the appliance.** Toggle fan (12 W) → phone charger: chip reads "24 W / 200 W · 30h 6m" → power bank: chip reads "42 W / 200 W · 17h 12m" (power bank's 18 W is marked as an estimate, since it has no label) → laptop: chip reads "182 W / 200 W · 3h 58m" in the near-limit colour, then fades.
3. **Meter at the power station.** Walk to the power station; the meter floating ~70 cm above it reads "182 W / 200 W" in the near-limit colour, with ~3h 58m of battery left.
4. **Overload.** Toggle the iron (~1,100 W) → chip turns the warning colour and reads "1,282 W / 200 W", the iron glows, a chime plays, meter switches to overload state.
5. **Recovery.** Toggle the iron off → glow and warning clear, chip and meter return to "182 W / 200 W" and ~3h 58m.

## Out of scope
- Real camera recognition of appliances — this version uses the pinch-and-pick stand-in.
- Reading wattage off a physical label.
- Any memory between sessions — tags reset each time the Lens is reopened.
- Voice input or custom/two-hand gestures.

## Risks and open questions
- Power bank's 18 W is an estimate, since it has no label to read.
- Iron's 1,100 W is also an estimate.
- Laptop's 140 W is the charger's adapter maximum, not typical draw — real charging tapers below that.
- Comfort over time and real hand tracking are feel-unproven; only real glasses can confirm them.
- The out-of-view arrow has no done criterion covering it.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build the scan-and-pick stand-in exactly as described above, and keep it obvious in the scene.
- Load math: use `engine/LoadEngine.ts` as the source of truth, copied into `Assets/Scripts/` — don't fork the logic. Inverter usable W = 200 W (the power station's rated output, used directly as the capacity ceiling — not derived from a kVA figure). Startup surge ≈ 3× running watts for fridge, freezer, pump. Battery hours ≈ 1,000 Wh × 0.85 (depth of discharge, lithium) × 0.85 (conversion loss) ÷ current load W.
- Demo appliance set: Freezer (350 W, 3× surge), Fridge, Water pump, Fan (12 W), Phone charger (12 W), Power bank (18 W, marked as an estimate), Laptop (140 W), Iron (1,100 W, no surge — it trips on running watts alone).
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
