# Load Walk

<!-- Cover: screenshot of the Lens in the preview with tags and the load meter -->

![LEAF](https://img.shields.io/badge/LEAF-TBD-lightgrey) ![Built with CLAD](https://img.shields.io/badge/built%20with-CLAD-black) ![Platform](https://img.shields.io/badge/platform-SPECS-black)

### Look around your house, see what your inverter can carry.

For households living with power cuts on inverter or solar backup. Pinch each appliance to tag its wattage, switch things on or off, and see live load, startup-surge warnings and battery hours, right on the appliances.

**Watch the demo** (TBD) · **Design brief** ([devpost/design-brief.md](devpost/design-brief.md)) · **Architecture** ([ARCHITECTURE.md](ARCHITECTURE.md)) · **Run it locally** ([below](#run-it-locally))

## Demo

_Embed the YouTube video (under 3 minutes)._

## Judge it in 90 seconds

_LEAF results and key numbers, each reproducible from the repo._

## The problem

_From `docs/research.md`: the household, the web-calculator workaround, what an overload costs._

## What it does

| Capability | What the user does | Built with |
|---|---|---|
| _TBD_ | | |

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md).

## The hard problem

_From `docs/build-log.md`._

## What's real vs simplified

| Capability | How it's backed | Status |
|---|---|---|
| Appliance recognition | Pinch stand-in (preview can't show live camera vision) | Simplified |
| Load, surge, battery maths | Lens script | _TBD_ |

## Design process

Planned with the Devpost Learn `plan-lens` skill, built by CLAD in Lens Studio through the Lens Studio MCP, checked with LEAF.

## Run it locally

1. Install Lens Studio (version per the [hackathon quick start](https://learn-specs.devpost.com/resources)).
2. Open the `.esproj` in this folder.
3. Optional: add a Remote Service Gateway token (see `.env.example`). Without it, the Lens uses hard-coded nameplate readings.
4. Open Interactive Preview. WASD to move, right-drag to look, click to pinch.

## Disclosure

Built for **Learn AR with SPECS** (Devpost), started 2026-10-21. Typical wattages are estimates; check your own nameplates and installer before buying equipment.
