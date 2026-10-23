import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils";
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils";
import {
  LoadWalkLeafInteractor, child, chipColor, chipText, close, glowing, isOn, meter, switchOnSmallLoads, textOf, uiRoot,
} from "./LoadWalkLeafInteractor";
import { COLORS } from "../Scripts/LoadWalkTheme";

// Criterion 4: overload.
@component
export class OverloadScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    await switchOnSmallLoads(i);
    await i.toggle("Iron");
    await sleep(300);
    expect(chipText("Iron")).toBe("1,282 W / 200 W");
    expect(close(chipColor("Iron"), COLORS.warn)).toBe(true);
    expect(glowing("Iron")).toBe(true);
    const chime = findSceneObjectByName("OverloadChime")!.getComponent("Component.AudioComponent") as AudioComponent;
    expect(chime.isPlaying()).toBe(true);
    expect(meter("MeterLoad")).toBe("1,282 W / 200 W");
    expect(meter("MeterStatus").includes("Overload")).toBe(true);
    const load = findSceneObjectByName("MeterLoad")!.getComponent("Component.Text") as Text;
    expect(close(load.textFill.color, COLORS.warn)).toBe(true);
  }
}

