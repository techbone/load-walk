import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils";
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils";
import {
  LoadWalkLeafInteractor, child, chipColor, chipText, close, isOn, meter, switchOnSmallLoads, textOf, uiRoot,
} from "./LoadWalkLeafInteractor";
import { COLORS } from "../Scripts/LoadWalkTheme";

// Not a done criterion: the out-of-view arrow points at the culprit while it is outside the view.
@component
export class OutOfViewArrowScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    await switchOnSmallLoads(i);
    const arrow = findSceneObjectByName("OutOfViewArrow")!;
    expect(arrow.enabled).toBe(false);
    await i.toggle("Iron");
    await sleep(500);
    // The iron sits about 50 degrees to the right of the start view, so it is out of view.
    expect(arrow.enabled).toBe(true);
    expect(textOf(arrow, "ArrowText")).toBe("Iron");
    await i.toggle("Iron");
    await sleep(300);
    expect(arrow.enabled).toBe(false);
  }
}
