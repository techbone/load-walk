import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { sleep } from "Leaf.lspkg/Utils/common/Utils";
import { LoadWalkLeafInteractor, isOn, resetSmallLoads, say, voice, voiceUI } from "./LoadWalkLeafInteractor";

// Voice is off until the user switches it on: the button says so, no microphone is open, and a transcript is ignored.
@component
export class VoiceOffByDefaultScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    await resetSmallLoads(i);
    expect(voice().listening).toBe(false);
    expect(voice().microphoneOpen).toBe(false);
    expect(voiceUI().listeningText).toBe("Voice: off");
    await say("on the fan");
    expect(isOn("Fan")).toBe(false);
  }
}
