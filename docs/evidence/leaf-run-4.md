# LEAF run 4 (2026-10-23, voice + layout fixes)

Reported by the CLAD build agent after a full run; not re-run independently. 15/15 scenarios pass: the earlier 11 plus `extra-voice-off-by-default`, `criterion-6-voice`, `extra-voice-off-the-iron` and `extra-voice-can-i-run-freezer`. Engine tests at the same commit: `npm test` 21/21 (18 earlier + 3 alias tests in `engine/VoiceAliases.test.ts`).

Done criterion 6 ("voice does what the pinch does") passes by **injected transcript text**, so it proves the wiring, not the microphone. The real mic path was proven separately in the spike (`docs/spikes/voice.md`) and has not yet been tried through the finished Lens.

What changed: Voice toggle near the meter (off by default; the speech session only runs while it's on); only final transcripts act, partials are shown and fade after 4 s; pinch and voice both call one `setSwitch()`; "can I run X?" tints that tag red or green and toggles nothing; every catalog appliance has aliases; VoiceSpike removed. Fridge moved out of the start view so nothing bright sits behind the meter; laptop tag raised 10 cm (laptop tag gets a 30 cm placement allowance, since the raised tag was 25.9 cm away and failed the 20 cm rule once).

Behaviour to know: voice only acts on appliances that have been scanned ("Fridge is not scanned. Pinch it first."); "fits" is a standalone check against the 200 W unit alone, not against what's already on.

Not verified: spoken commands through the finished Lens; the heard-words panel and laptop tag by eye (agent captured them with an evidence scenario).
