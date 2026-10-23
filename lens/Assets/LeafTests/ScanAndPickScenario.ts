import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils";
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils";
import {
  LoadWalkLeafInteractor, child, expectCardNear, expectTagNear, chipColor, chipText, close, isOn, meter, switchOnSmallLoads, textOf, uiRoot,
} from "./LoadWalkLeafInteractor";
import { COLORS } from "../Scripts/LoadWalkTheme";

// Criterion 1: scan and pick.
@component
export class ScanAndPickScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    expect(findInteractableByName("Freezer") !== undefined).toBe(true);
    if (!child(uiRoot("Freezer"), "Tag")) {
      await i.scan("Freezer");
      expectCardNear("Freezer");
      // The card offers exactly Freezer / Fridge / Water pump.
      expect(findInteractableByName("Btn-Freezer", uiRoot("Freezer"), true) !== undefined).toBe(true);
      expect(findInteractableByName("Btn-Fridge", uiRoot("Freezer"), true) !== undefined).toBe(true);
      expect(findInteractableByName("Btn-Water pump", uiRoot("Freezer"), true) !== undefined).toBe(true);
      expect(findInteractableByName("Btn-Kettle", uiRoot("Freezer"), true) === undefined).toBe(true);
      await i.pick("Freezer", "Freezer");
    }
    const root = uiRoot("Freezer");
    expect(textOf(root, "TagTitle")).toBe("Freezer · 350 W · surges about 3×");
    const note = textOf(root, "TagNote") ?? "";
    expect(note).toBe("Too big for this 200 W unit"); // 350 W (in the title) alone is more than the unit's 200 W
    expectTagNear("Freezer");
    // Before any toggle: freezer is off.
    expect(isOn("Freezer")).toBe(false);
  }
}

