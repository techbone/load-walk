// Not a done criterion: the other picker groups. Fridge, water pump and iron each get scanned and tagged.

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils";
import { sleep } from "Leaf.lspkg/Utils/common/Utils";
import { LoadWalkLeafInteractor, isTagged, textOf, uiRoot } from "./LoadWalkLeafInteractor";

@component
export class PicksScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    const cases: [string, string[], string, string][] = [
      ["Fridge", ["Fridge", "Freezer", "Water pump"], "Fridge", "Fridge · 150 W (estimate) · surges about 3×"],
      ["WaterPump", ["Water pump", "Freezer", "Fridge"], "Water pump", "Water pump · 750 W (estimate) · surges about 3×"],
      ["Iron", ["Iron", "Kettle", "Microwave"], "Iron", "Iron · 1,100 W (estimate)"],
    ];
    for (const [slot, offered, pick, title] of cases) {
      if (isTagged(slot)) continue;
      await i.scan(slot);
      for (const label of offered) {
        expect(findInteractableByName("Btn-" + label, uiRoot(slot), true) !== undefined).toBe(true);
      }
      await i.pick(slot, pick);
      expect(textOf(uiRoot(slot), "TagTitle")).toBe(title);
    }
    // Iron trips the unit on its own, and says so before any toggle.
    expect((textOf(uiRoot("Iron"), "TagNote") ?? "").includes("1,100 W alone is too big")).toBe(true);
  }
}
