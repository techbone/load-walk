import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { sleep } from "Leaf.lspkg/Utils/common/Utils";
import {
  LoadWalkLeafInteractor, highlighted, isOn, meter, resetSmallLoads, say, tagNotes, voiceOff, voiceOn, voiceUI,
} from "./LoadWalkLeafInteractor";

// "Can I run the freezer?" answers on the freezer's tag and changes nothing. Aliases also cover what is not scanned.
@component
export class VoiceCanIRunScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    await resetSmallLoads(i);
    await i.ensureTagged("Freezer", "Freezer");
    await i.ensureOff("Freezer");
    await voiceOn(i);
    try {
      const before = meter("MeterLoad");

      await say("Can I run the freezer?");
      expect(highlighted("Freezer")).toBe("overload");
      expect(tagNotes("Freezer").includes("Too big for 200 W")).toBe(true);
      expect(voiceUI().answerText).toBe("Freezer 350 W is over 200 W");
      expect(isOn("Freezer")).toBe(false);
      expect(meter("MeterLoad")).toBe(before);

      await say("can I run the fan");
      expect(highlighted("Fan")).toBe("ok");
      expect(voiceUI().answerText).toBe("Fan 12 W fits within 200 W");
      expect(isOn("Fan")).toBe(false);

      // In the catalog but no stand-in in the room: said plainly, nothing happens.
      await say("turn on the kettle");
      expect(voiceUI().answerText).toBe("Kettle is not in this room.");
      expect(meter("MeterLoad")).toBe(before);
    } finally {
      await voiceOff(i);
    }
  }
}
