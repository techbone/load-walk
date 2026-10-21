# Load Walk: agent rules

A SPECS Lens for the Devpost "Learn AR with SPECS" hackathon. Deadline **9 Nov 2026, 23:00 GMT+1**.

## Workflow

1. `plan-lens` interview → `devpost/design-brief.md` (Musa makes the design decisions; agents don't invent them).
2. CLAD builds from the approved brief in a fresh chat, through the Lens Studio MCP.
3. LEAF scenarios cover every done criterion; report pass counts honestly.
4. `ARCHITECTURE.md` and `README.md` follow the brief, not the other way round.

## Preview is the only target

No SPECS device. Everything must run and be demonstrable in Lens Studio's Interactive Preview.

- Appliance recognition is a stand-in (pinch to scan). Never claim live camera vision.
- AI calls (Remote Service Gateway → Gemini) always have a hard-coded fallback.
- No memory between sessions in the demo path.
- Standard SIK / UI Kit interactions only, so the mouse and LEAF can drive them.

## Design rules for glasses

- Information sits on the thing it's about: wattage tag on the appliance, load meter by the inverter.
- Show it when needed, then get out of the way.
- A few big targets; pinch is the tap. Targets highlight on hover.
- Keep content where the user is already looking: 0.6–1.6 m away, a little below eye level, inside a roughly 37° × 32° view.
- Additive display: black is transparent. Light text, no dark panels carrying meaning.
- Real-world scale, in centimetres.

## Visual language

- One accent for "on / within capacity", one warning colour for overload. Neutrals everywhere else.
- Numbers in a mono face with tabular figures (W, kVA, hours).
- Plain copy for the user: "Freezer + iron = 1,800 W. Your inverter carries 2,000 W." No filler.
- No emoji icons, no sparkle badges, no gradients.

## Load maths (keep consistent with `docs/research.md`)

- Inverter usable W ≈ kVA × 0.8.
- Startup surge: fridge, freezer, pump ≈ 3× running; AC ≈ 2–3×.
- Battery hours ≈ bank Wh × depth of discharge (lead-acid 0.5, lithium 0.8–0.9) × 0.85 ÷ load W.

## Secrets

The Remote Service Gateway token lives in the `RemoteServiceGatewayCredentials` object. Never commit it; check `git diff` on scene and prefab files before committing.

## Git

- Personal identity only (`musaawwaletudaye@gmail.com`). Never touch global git config.
- Remote: `git@github-personal:techbone/<repo>.git`.
- Short lowercase conventional commits: `feat: add load meter`. No body, no co-author or "generated with" lines.
