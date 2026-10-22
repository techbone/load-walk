# Spike: voice in the preview

**Question:** can a spoken command reach the Lens in Lens Studio's preview on Musa's Mac? If not, voice is pitched as the glasses version and stays out of the done criteria.

**Timebox:** 30 minutes. Run it only after the base build's LEAF results are in.

## Why voice

In an outage it's dark and your hands are busy, often holding a torch. "On the fan" or "can I run the iron?" without reaching for anything is the "leaves your body free" strength. Every voice command has a pinch that does the same job, so the demo never depends on voice.

## Commands (parser: `engine/VoiceCommands.ts`, tested)

| Said | Action | Same as pinch |
|---|---|---|
| "turn on the fan", "on the fan", "plug in the phone charger" | toggle on | toggle button on the tag |
| "switch off the iron", "off the iron" | toggle off | toggle button on the tag |
| "can I run the iron?", "is it ok to use the freezer?" | answer on the appliance's tag (`exceedsAlone` / `evaluate`), no toggle | none (read the tag) |

Anything without a known appliance and a clear verb does nothing. Better to ignore a command than to toggle the wrong thing.

## Steps

1. **ASR Module.** Add a tiny script: `require('LensStudio:AsrModule')`, `startTranscribing`, log each final transcript. Enable the microphone in the Preview panel (bottom left). Say "on the fan". Pass if the transcript appears in the Logger.
2. **If ASR is silent in the preview, try Gemini Live** via the Remote Service Gateway (Snap's AI Playground sample starts it from the preview). Needs an RSG token; never commit it. Pass if a spoken phrase comes back as text.
3. **If both fail,** stop. Record the result here and in `docs/build-log.md`; voice goes under Risks as "glasses only".

## If it passes

- Musa updates the brief: voice under "Hands and input" with the pinch alternative for each command, a 6th done criterion ("saying 'on the fan' does exactly what pinching its toggle does"), and the preview-mic dependency under Risks.
- `npm run sync:lens` copies `VoiceCommands.ts` into `lens/Assets/Scripts/`, and the Lens wires transcript → `parseCommand` → the same toggle handler the pinch uses.
- LEAF: a scenario that injects a transcript string into the handler, so the test doesn't need a microphone.

## Result

_Not run yet._
