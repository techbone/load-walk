import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { sleep } from "Leaf.lspkg/Utils/common/Utils";
import {
  LoadWalkLeafInteractor, child, chipText, onDisplay, plateCorners, startPose, switchOnSmallLoads, uiRoot,
} from "./LoadWalkLeafInteractor";

// How close to the display's edge a panel may come, as a fraction of the display (about 1 cm at 2.5 m).
const MARGIN = 0.01;

// Review: from the start spot the laptop's "182 W / 200 W" chip ran off the right edge of the display. With the whole
// desk switched on, every desk tag and the laptop's chip must sit wholly inside the display, seen from where the user
// stood when the Lens started.
@component
export class StartViewScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    await switchOnSmallLoads(i);
    expect(chipText("Laptop")).toBe("182 W / 200 W · 3h 58m");
    await sleep(100); // the chip's plate takes its size from the layout pass
    const pose = startPose();
    const panels: [string, SceneObject | null][] = [
      ["Fan tag", child(uiRoot("Fan"), "Tag")],
      ["Phone charger tag", child(uiRoot("PhoneCharger"), "Tag")],
      ["Power bank tag", child(uiRoot("PowerBank"), "Tag")],
      ["Laptop tag", child(uiRoot("Laptop"), "Tag")],
      ["Laptop chip", child(uiRoot("Laptop"), "Chip")],
    ];
    for (const [name, panel] of panels) {
      expect(panel !== null).toBe(true);
      const pts = plateCorners(panel!).map((p) => onDisplay(pose, p));
      expect(pts.every((p) => p !== null)).toBe(true);
      const xs = pts.map((p) => p!.x);
      const ys = pts.map((p) => p!.y);
      const box = { l: Math.min(...xs), r: Math.max(...xs), t: Math.min(...ys), b: Math.max(...ys) };
      print("[LEAF-MEASURE] " + name + " spans x " + box.l.toFixed(3) + "–" + box.r.toFixed(3) + ", y " + box.t.toFixed(3) + "–" + box.b.toFixed(3) + " of the display");
      expect(box.l >= MARGIN && box.r <= 1 - MARGIN && box.t >= MARGIN && box.b <= 1 - MARGIN).toBe(true);
    }
  }
}
