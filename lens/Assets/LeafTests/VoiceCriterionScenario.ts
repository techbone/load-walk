import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { sleep } from "Leaf.lspkg/Utils/common/Utils";
import {
  LoadWalkLeafInteractor, chipText, highlighted, isOn, meter, resetSmallLoads, say, tagNotes, voiceOff, voiceOn, voiceUI,
} from "./LoadWalkLeafInteractor";

// Criterion 6: voice does what the pinch does.
@component
export class VoiceCriterionScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    await resetSmallLoads(i);
    await voiceOn(i);
    try {
      expect(voiceUI().listeningText).toBe("Voice: on");

      // Live words are shown but only a final transcript acts.
      await say("on the fan", false);
      expect(voiceUI().heardText).toBe("on the fan");
      expect(isOn("Fan")).toBe(false);

      // "On the fan" is the same switch the tag button flips: same chip, same meter.
      await say("On the fan.");
      expect(isOn("Fan")).toBe(true);
      expect(chipText("Fan")).toBe("12 W / 200 W · 60h 13m");
      expect(meter("MeterLoad")).toBe("12 W");

      // Saying it again sets the state it is already in: nothing changes.
      await say("on the fan");
      expect(isOn("Fan")).toBe(true);
      expect(meter("MeterLoad")).toBe("12 W");
      expect(voiceUI().answerText).toBe("Fan is already on");

      // A question answers on the tag and toggles nothing.
      await say("can I run the iron?");
      expect(highlighted("Iron")).toBe("overload");
      expect(tagNotes("Iron").includes("Too big for 200 W")).toBe(true);
      expect(voiceUI().answerText).toBe("Iron 1,100 W is over 200 W");
      expect(isOn("Iron")).toBe(false);
      expect(meter("MeterLoad")).toBe("12 W");

      await say("off the fan");
      expect(isOn("Fan")).toBe(false);
    } finally {
      await voiceOff(i);
    }
  }
}
