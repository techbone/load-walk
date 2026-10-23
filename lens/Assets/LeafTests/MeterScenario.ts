import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils";
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils";
import {
  LoadWalkLeafInteractor, child, chipColor, chipText, close, isOn, meter, switchOnSmallLoads, textOf, topOf, uiRoot,
} from "./LoadWalkLeafInteractor";
import { COLORS } from "../Scripts/LoadWalkTheme";

// Criterion 3: meter at the power station. Walking is not simulated: the meter is always on, so this
// reads it where it floats and checks it sits about 70 cm above the unit.
@component
export class MeterScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    await switchOnSmallLoads(i);
    expect(meter("MeterLoad")).toBe("182 W");
    expect(meter("MeterLimit")).toBe("of 200 W");
    expect(meter("MeterHours").includes("3h 58m")).toBe(true);
    const load = findSceneObjectByName("MeterLoad")!.getComponent("Component.Text") as Text;
    expect(close(load.textFill.color, COLORS.near)).toBe(true);
    const above = findSceneObjectByName("LoadMeter")!.getTransform().getWorldPosition().y
      - topOf(findSceneObjectByName("PowerStationModel")!);
    expect(above).toBeCloseTo(70, 0);
  }
}

