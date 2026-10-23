import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { sleep } from "Leaf.lspkg/Utils/common/Utils";
import {
  LoadWalkLeafInteractor, chipText, glowing, isOn, meter, say, switchOnSmallLoads, voiceOff, voiceOn,
} from "./LoadWalkLeafInteractor";

// "Off the iron" clears an overload exactly like pinching the iron's button (criterion 5), and saying it twice is harmless.
@component
export class VoiceOffTheIronScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    await switchOnSmallLoads(i);
    await voiceOn(i);
    try {
      await i.toggle("Iron");
      expect(glowing("Iron")).toBe(true);
      expect(meter("MeterLoad")).toBe("1,282 W");

      await say("Off the iron.");
      expect(isOn("Iron")).toBe(false);
      expect(glowing("Iron")).toBe(false);
      expect(chipText("Iron")).toBe("182 W / 200 W · 3h 58m");
      expect(meter("MeterLoad")).toBe("182 W");

      await say("off the iron");
      expect(isOn("Iron")).toBe(false);
      expect(meter("MeterLoad")).toBe("182 W");
    } finally {
      await voiceOff(i);
    }
  }
}
