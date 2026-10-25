import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils";
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils";
import {
  LoadWalkLeafInteractor, child, chipColor, chipText, close, colorOf, glowing, isOn, meter, switchOnSmallLoads, textOf, uiRoot,
} from "./LoadWalkLeafInteractor";
import { COLORS } from "../Scripts/LoadWalkTheme";

// Criterion 5: recovery.
@component
export class RecoveryScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    await switchOnSmallLoads(i);
    await i.toggle("Iron");
    await sleep(300);
    expect(glowing("Iron")).toBe(true);
    await i.toggle("Iron");
    await sleep(300);
    expect(isOn("Iron")).toBe(false);
    expect(glowing("Iron")).toBe(false);
    expect(chipText("Iron")).toBe("182 W / 200 W · 3h 58m");
    // The warning colour leaves the iron's wattage; "Too big for 200 W" stays a warning, as it was before the toggle.
    expect(close(colorOf(uiRoot("Iron"), "TagWatts"), COLORS.text)).toBe(true);
    expect(close(colorOf(uiRoot("Iron"), "TagNote2"), COLORS.warn)).toBe(true);
    expect(meter("MeterLoad")).toBe("182 W");
    expect(meter("MeterLimit")).toBe("of 200 W");
    expect(meter("MeterHours").includes("3h 58m")).toBe(true);
  }
}

