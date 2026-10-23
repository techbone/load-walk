import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils";
import {
  LoadWalkLeafInteractor, cardButton, chipText, child, clickFrom, eye, isOn, meter, say, tagName, uiRoot, voiceOff, voiceOn, voiceUI,
} from "./LoadWalkLeafInteractor";

// The hand-test chain: a wrong tag on the fan made "put on the fan" answer "Fan is not scanned". Pinching the tag's
// name reopens the card and a new pick replaces the tag; then voice works on the correctly scanned fan.
@component
export class RetagVoiceScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    const from = eye();
    const nameButton = () => child(child(uiRoot("Fan"), "Tag"), "TagNameButton")!;

    // The wrong pick, made on purpose.
    await clickFrom(i, findSceneObjectByName("Fan")!, from);
    await clickFrom(i, cardButton("Fan", "Power bank"), from);
    expect(tagName("Fan")).toBe("Power bank");

    await voiceOn(i);
    try {
      await say("Put on the fan.");
      expect(voiceUI().answerText).toBe("Fan is not scanned. Pinch it first.");

      // Correct it: pinch the name, pick again.
      expect(await clickFrom(i, nameButton(), from)).toBe("TagNameButton");
      expect(child(uiRoot("Fan"), "ScanCard") !== null).toBe(true);
      expect(await clickFrom(i, cardButton("Fan", "Fan"), from)).toBe("Btn-Fan");
      expect(tagName("Fan")).toBe("Fan");

      // Voice now finds it, and does what the pinch does.
      await say("Put on the fan.");
      expect(isOn("Fan")).toBe(true);
      expect(voiceUI().answerText).toBe("Fan on");
      expect(chipText("Fan")).toBe("12 W / 200 W · 60h 13m");
      expect(meter("MeterLoad")).toBe("12 W");

      // Re-tagging something that is on takes its watts out of the total and leaves the new tag off.
      await clickFrom(i, nameButton(), from);
      await clickFrom(i, cardButton("Fan", "Phone charger"), from);
      expect(tagName("Fan")).toBe("Phone charger");
      expect(isOn("Fan")).toBe(false);
      expect(meter("MeterLoad")).toBe("0 W");
      await say("Put on the fan.");
      expect(voiceUI().answerText).toBe("Fan is not scanned. Pinch it first.");
    } finally {
      await voiceOff(i);
    }
  }
}
