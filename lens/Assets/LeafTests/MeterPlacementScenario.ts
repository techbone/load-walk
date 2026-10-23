// Placement: the meter floats about 70 cm directly above the power station (same x and z, 70 cm above its top).

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils";
import { topOf } from "./LoadWalkLeafInteractor";

@component
export class MeterPlacementScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const station = findSceneObjectByName("PowerStation")!.getTransform().getWorldPosition();
    const meter = findSceneObjectByName("LoadMeter")!.getTransform().getWorldPosition();
    const top = topOf(findSceneObjectByName("PowerStationModel")!);
    const dx = meter.x - station.x;
    const dz = meter.z - station.z;
    const above = meter.y - top;
    print("[LEAF-MEASURE] meter is " + dx.toFixed(1) + " cm sideways (x), " + dz.toFixed(1) + " cm in z, " + above.toFixed(1) + " cm above the station top");
    expect(Math.abs(dx) <= 1).toBe(true);
    expect(Math.abs(dz) <= 1).toBe(true);
    expect(above >= 68 && above <= 72).toBe(true);
  }
}
