// Not a done criterion: the other picker groups. Fridge, water pump and iron each get scanned and tagged.

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils";
import { sleep } from "Leaf.lspkg/Utils/common/Utils";
import { LoadWalkLeafInteractor, expectCardNear, expectTagNear, isTagged, textOf, uiRoot } from "./LoadWalkLeafInteractor";

@component
export class PicksScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    // slot, buttons offered, pick, name, watts, notes in tag order
    const cases: [string, string[], string, string, string, string[]][] = [
      ["Fridge", ["Fridge", "Freezer", "Water pump"], "Fridge", "Fridge", "150 W", ["Surges about 3×", "Estimate"]],
      ["WaterPump", ["Water pump", "Freezer", "Fridge"], "Water pump", "Water pump", "750 W", ["Surges about 3×", "Estimate", "Too big for 200 W"]],
      ["Iron", ["Iron", "Kettle", "Microwave"], "Iron", "Iron", "1,100 W", ["Estimate", "Too big for 200 W"]],
    ];
    for (const [slot, offered, pick, name, watts, notes] of cases) {
      if (isTagged(slot)) continue;
      await i.scan(slot);
      expectCardNear(slot);
      for (const label of offered) {
        expect(findInteractableByName("Btn-" + label, uiRoot(slot), true) !== undefined).toBe(true);
      }
      await i.pick(slot, pick);
      expect(textOf(uiRoot(slot), "TagName")).toBe(name);
      expect(textOf(uiRoot(slot), "TagWatts")).toBe(watts);
      notes.forEach((n, k) => expect(textOf(uiRoot(slot), k === 0 ? "TagNote" : "TagNote" + (k + 1))).toBe(n));
      expectTagNear(slot);
    }
    // Iron trips the unit on its own, and says so before any toggle.
    expect(textOf(uiRoot("Iron"), "TagNote2")).toBe("Too big for 200 W");
  }
}
