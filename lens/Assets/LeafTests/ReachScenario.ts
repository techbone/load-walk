import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils";
import { LoadWalkVoice } from "../Scripts/LoadWalkVoice";
import {
  LoadWalkLeafInteractor, NAMES, cardButton, child, clickFrom, eyeAlongFloorFrom, eyeInFrontOf, fakeMic, isOn, rayReachCm, rayTarget,
  tagName, uiRoot, voice, voiceToggle,
} from "./LoadWalkLeafInteractor";

// Hand-test bug: clicks stopped working after stepping back. From 1, 2, 2.5 and 3 m in front, every control is
// pinched along the real ray: scan an appliance, pick its name, switch it on and off, and the Voice toggle.
// The desk items sit more than a metre below the eye, so a straight-line metre does not exist there: the 1 m step is
// measured along the floor (alongFloor); the others are straight-line distances, as before.
const STEPS: { metres: number; slot: string; alongFloor?: boolean }[] = [
  { metres: 1, slot: "Fan", alongFloor: true },
  { metres: 2, slot: "PhoneCharger" },
  { metres: 2.5, slot: "PowerBank" },
  { metres: 3, slot: "Laptop" },
];

@component
export class ReachScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    print("[LEAF-MEASURE] SIK hand/mouse ray reach is " + rayReachCm() + " cm");
    LoadWalkVoice.transcriber = fakeMic;
    try {
      for (const { metres, slot, alongFloor } of STEPS) {
        const station = findSceneObjectByName(slot)!;
        const spot = alongFloor ? eyeAlongFloorFrom : eyeInFrontOf;
        const from = spot(station, metres);
        const at = metres + " m" + (alongFloor ? " along the floor" : "");

        expect(await clickFrom(i, station, from)).toBe(slot);
        expect(child(uiRoot(slot), "ScanCard") !== null).toBe(true);
        expect(await clickFrom(i, cardButton(slot, NAMES[slot]), from)).toBe("Btn-" + NAMES[slot]);
        expect(tagName(slot)).toBe(NAMES[slot]);

        const toggle = () => child(child(uiRoot(slot), "Tag"), "ToggleButton")!;
        expect(await clickFrom(i, toggle(), from)).toBe("ToggleButton");
        expect(isOn(slot)).toBe(true);
        expect(await clickFrom(i, toggle(), from)).toBe("ToggleButton");
        expect(isOn(slot)).toBe(false);

        const vFrom = spot(voiceToggle(), metres);
        expect(await clickFrom(i, voiceToggle(), vFrom)).toBe("VoiceToggle");
        expect(voice().listening).toBe(true);
        expect(await clickFrom(i, voiceToggle(), vFrom)).toBe("VoiceToggle");
        expect(voice().listening).toBe(false);
        print("[LEAF-MEASURE] " + at + ": scan, pick, toggle on/off (" + slot + ") and Voice on/off all reached");
      }

      // Past the tested range, for the report: where the ray stops reaching the Voice toggle.
      for (const metres of [4, 4.5, 5.5]) {
        const hit = await rayTarget(eyeInFrontOf(voiceToggle(), metres), voiceToggle().getTransform().getWorldPosition());
        print("[LEAF-MEASURE] Voice toggle from " + metres + " m: " + (hit ? "reached " + hit.sceneObject.name : "out of reach"));
      }
    } finally {
      if (voice().listening) await clickFrom(i, voiceToggle(), eyeAlongFloorFrom(voiceToggle(), 1));
      LoadWalkVoice.transcriber = null;
    }
  }
}
