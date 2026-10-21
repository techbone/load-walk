# Load Walk: research and problem gate

> Source of truth for the problem and angle. The design itself comes from `devpost/design-brief.md`.
> Hackathon: Learn AR with SPECS (Devpost). Deadline **9 Nov 2026, 23:00 GMT+1**.

## Thesis

**Look around your house, see what your inverter can carry.**

## Who, and what they do today

A household in Nigeria that relies on an inverter (with or without solar) to get through power cuts. Today, to work out what they can run, they:

- type appliances into a web calculator (mobility.com.ng, kowatek, Solarcu), or
- ask the installer, who follows rules of thumb (for example "buy double your load"), or
- find out the hard way: the inverter trips with an overload beep when the freezer and pressing iron start together.

## What the workaround costs

- **Hypothesis (to verify with your own numbers):** an undersized setup trips daily, and deep-discharging lead-acid batteries shortens their life. Replacing a battery bank is a large cost. Oversizing "to be safe" wastes money up front.
- **Your story is the evidence.** Write down one real night: what tripped, what it cost, and how long the battery lasted versus what you expected. This becomes the first 15 seconds of the video.

## Outside evidence

- Nigerian installer guides tell homeowners to add up nameplate wattages and buy an inverter with double that capacity to avoid overload. Overload is a known, common failure. ([thecondia.com](https://thecondia.com/solar-inverter-guide-nigeria/))
- Several Nigeria-specific load calculators exist, which shows demand. All of them are forms you type into, and none of them uses a camera. ([mobility.com.ng](https://mobility.com.ng/naija-inverter-solar-load-calculator/), [kowatek](https://kowatek.com/appliance-load-calculator.html))
- Gap: no camera-based or spatial tool turned up, on phones or on Spectacles.

## Crowding

- Spectacles Community Challenge winners for May 2026 include **Wi-Fi Speed**, which maps signal around a room. That's the same "measure your home" category, and it won 1st place, which is a good sign. There's no energy or load tool among recent winners.
- The usual AR hackathon ideas (cooking, translation, fitness, plants, language labels) are crowded. Load Walk is not one of them.

## Why glasses (the sponsor removal test)

Remove SPECS and you're back to a web form: a list of appliance names with no memory of where things are or what's switched on. The glasses version is a **walkthrough of the actual room**:

| Glasses strength | How Load Walk uses it |
|---|---|
| Shares your view | You look at an appliance and it gets identified. In the real version the camera reads the nameplate; in the preview we use a stand-in. |
| Draws in the world | A wattage tag sits on each appliance. A load meter sits by the inverter, and the appliances that would tip you over glow. |
| Leaves your body free | During an outage, at night, maybe holding a torch, you pinch appliances on and off without a phone in your hand. |

Honest caveat: a phone AR version could exist. Our case is hands-free plus tags that stay on the real objects, and the pitch has to make that point.

## Preview constraints (from the skill pack's `preview-limits.md`)

- Live camera vision **can't** be shown in the preview, so recognition needs a stand-in: pinch an appliance to "scan" it and get its rating.
- AI may work in the editor but needs a hard-coded fallback. **Possible real-AI moment:** send a bundled nameplate photo to Gemini through Snap's AI gateway (Remote Service Gateway) and read the wattage from it, with a hard-coded answer as fallback.
- Memory between sessions and persistent anchors **can't** be shown, so the whole demo happens in one session.
- Things that work well: walking the room, real-scale objects, pinching buttons and toggles with the mouse, spatial sound, and LEAF tests on SIK interactables.

## Capability map (draft; final version comes from the design brief)

| User flow | SPECS / Lens Studio rail | Real or stand-in in the preview |
|---|---|---|
| See appliances in the room | Virtual appliance props at real scale (CLAD can generate the models) | Stand-in for the real room |
| Identify an appliance | SIK pinch on the appliance → "scanned" | Stand-in (the real version reads nameplates with the camera) |
| Read the wattage off the nameplate | Remote Service Gateway → Gemini, using a bundled nameplate image | Real AI if it works in the editor, otherwise a hard-coded answer |
| Switch it on/off in the plan | SIK toggle or pinch button on the tag | Real |
| Live load against inverter capacity, including startup surge | Lens script logic and a meter by the inverter | Real |
| Battery hours remaining | Lens script logic (usable Wh × efficiency ÷ load) | Real |
| Overload warning that points to the appliance causing it | Spatial audio chime, glow, arrow if out of view | Real |
| Automated checks | LEAF scenarios for each done criterion | Real |

## Judging criteria: what we'll show

| Criterion | What we show |
|---|---|
| Design | One complete loop: scan → plan → warning → "you've got 3h 40m tonight". Tags on the things, a few big targets, information appears only when it's needed. |
| Technical | CLAD-built and tested with LEAF, with the pass count in the README. Real AI on the nameplate image, with a fallback. Clean use of SIK and UI Kit. |
| Innovation | No camera-based or spatial load tool exists. It's grounded in a problem from lived experience that other teams don't have. |
| Presentation | Open with the real outage story, then the preview walkthrough with narration, ending on the battery-hours number. |

## Reference numbers (typical; check against your own nameplates)

Running watts, with startup surge where it matters:

| Appliance | Running W | Startup surge |
|---|---|---|
| LED bulb | 10 | n/a |
| Ceiling fan | 75 | n/a |
| Standing fan | 60 | n/a |
| 32–43" LED TV | 50–90 | n/a |
| Decoder | 20 | n/a |
| Wi-Fi router | 12 | n/a |
| Laptop | 65 | n/a |
| Phone charger | 10 | n/a |
| Fridge | 150 | about 3× |
| Deep freezer | 200 | about 3× |
| 1 HP water pump | 750 | about 3× |
| 1 HP split AC | 900 | about 2–3× |
| Pressing iron | 1000–1200 | n/a |
| Microwave | 1000 | n/a |
| Electric kettle | 1500–2000 | n/a |

Common inverter sizes are 1.5 kVA (12 V), 2.5 kVA (24 V), 3.5 kVA and 5 kVA (48 V). Usable watts are roughly kVA × 0.8.

Battery estimate:

- Usable Wh ≈ bank Wh × depth of discharge (lead-acid about 50%, lithium about 80–90%).
- Hours ≈ usable Wh × about 0.85 inverter efficiency ÷ load W.
- Example: 2 × 200 Ah 12 V lead-acid on a 24 V bank is 4,800 Wh. At 50% that's 2,400 usable. Running 400 W gives about 5.1 h.

## Open risks

1. **Lens Studio version.** The Spectacles (2024) simulator is on 5.15.4. CLAD targets 5.22+ and Devpost built on 5.24. Follow the hackathon's quick start.
2. **Whether the AI gateway works in the editor.** Test on day 1 and keep the hard-coded fallback either way.
3. **Narrow view (about 37° × 32°).** Tags have to stay readable while walking past appliances at 1–2 m.
