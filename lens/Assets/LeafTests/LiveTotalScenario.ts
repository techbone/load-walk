import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils";
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils";
import {
  LoadWalkLeafInteractor, child, chipColor, chipText, close, isOn, meter, resetSmallLoads, switchOnSmallLoads, textOf, uiRoot,
} from "./LoadWalkLeafInteractor";
import { COLORS } from "../Scripts/LoadWalkTheme";

// Criterion 2: live total at the appliance.
@component
export class LiveTotalScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    await resetSmallLoads(i);
    await i.toggle("Fan");
    expect((chipText("Fan") ?? "").startsWith("12 W / 200 W")).toBe(true);
    await i.toggle("PhoneCharger");
    expect(chipText("PhoneCharger")).toBe("24 W / 200 W · 30h 6m");
    await i.toggle("PowerBank");
    expect(chipText("PowerBank")).toBe("42 W / 200 W · 17h 12m");
    // The power bank figure is marked as an estimate on its tag.
    expect(textOf(uiRoot("PowerBank"), "TagNote")).toBe("Estimate");
    await i.toggle("Laptop");
    expect(chipText("Laptop")).toBe("182 W / 200 W · 3h 58m");
    expect(close(chipColor("Laptop"), COLORS.near)).toBe(true);
    // ...then it fades.
    await sleep(5500);
    expect(child(uiRoot("Laptop"), "Chip") === null).toBe(true);
  }
}

