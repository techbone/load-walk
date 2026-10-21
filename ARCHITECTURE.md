# Load Walk: architecture

> Draft. The design sections get filled in from `devpost/design-brief.md` once it's approved.

## Pitch

**Look around your house, see what your inverter can carry.** In a power cut you walk your home in SPECS, pinch each appliance to tag its wattage, and switch them on or off in a plan. A meter by the inverter shows live load against capacity, warns before startup surge trips it, and tells you how many hours the battery will last. Today the alternative is typing appliances into a web calculator. See `docs/research.md` for the evidence and crowding check.

## Problem and capability map

See `docs/research.md` (problem, removal test, draft capability map). The final map is set after the brief.

## System overview

```mermaid
flowchart LR
  subgraph Lens["SPECS Lens (Lens Studio preview)"]
    Room["Appliance props<br/>(real scale)"] -->|SIK pinch: scan| Tag["Wattage tag<br/>on appliance"]
    Tag -->|toggle on/off| Plan["Load plan<br/>(script state)"]
    Plan --> Meter["Load meter<br/>by inverter"]
    Plan --> Warn["Overload warning<br/>chime + glow + arrow"]
    Plan --> Hours["Battery hours"]
  end
  Tag -. "nameplate image" .-> RSG["Remote Service Gateway<br/>→ Gemini"]
  RSG -. "watts (fallback: hard-coded)" .-> Tag
```

## Components

| Component | Role |
|---|---|
| Appliance props | Stand-ins for the real room, at real scale. |
| Scan interaction | SIK pinch on an appliance; stands in for camera recognition. |
| Nameplate reader | Optional RSG → Gemini call on a bundled nameplate image; hard-coded fallback. |
| Load plan | Script state: which appliances are on, running and surge watts. |
| Meter, warning, hours | UI anchored by the inverter; overload chime and arrow to the culprit. |
| LEAF tests | One scenario per done criterion. |

## Data model

```ts
type Appliance = { id: string; name: string; runningW: number; surgeFactor: number; on: boolean };
type Inverter = { ratedW: number };                        // power station: 200 W used directly
type Battery  = { wh: number; chemistry: "lithium" | "lead-acid" };  // 1000 Wh LiFePO4, 0.85 usable
// hours = battery.wh * dod * 0.85 / sum(on.runningW), dropped when over capacity
// overload when sum(on.runningW) > inverter.ratedW; exceedsAlone(a) when a.runningW > ratedW
```

## Key flows

_From the brief._

## Stack

Lens Studio (version per the hackathon quick start), TypeScript, Spectacles Interaction Kit, UI Kit, Remote Service Gateway, LEAF. Built by CLAD through the Lens Studio MCP.

## Out of scope

- Live camera recognition (preview can't show it).
- Saving plans between sessions.
- Multi-user / connected sessions.

## Milestones

| | Milestone | Owner | Shows | Target |
|---|---|---|---|---|
| M0 | Setup: Lens Studio, SPECS Base Template saved into repo root, Lens Studio MCP, CLAD | Musa | `/mcp` shows `lens-studio`, `/plugin` lists CLAD | 22 Oct (live build session) |
| M1 | Load engine: running, surge, overload culprits, battery hours | Claude | `npm test` 9/9 · `npm run scenario` | 21 Oct ✓ |
| M2 | Design brief via `plan-lens` interview | Musa answers | `devpost/design-brief.md` approved | 23 Oct |
| M3 | Thin slice in the Lens: one appliance, scan → tag → toggle → meter moves, using `engine/` | CLAD | Preview + first LEAF pass | 25 Oct |
| M4 | Full room: all appliances, surge and overload warning with culprit glow and arrow, battery hours | CLAD | LEAF covers every done criterion | 30 Oct |
| M5 | Real AI moment: nameplate image → RSG Gemini → watts, hard-coded fallback | CLAD | Works with and without a token | 2 Nov |
| M6 | Polish for the 5 Nov project review, then README, evidence, video, submission | Both | Public repo + YouTube video | 8 Nov (a day of slack before the deadline) |

M1 ran ahead of the brief because the maths is domain fact, not a design decision. The brief decides how it's shown.
