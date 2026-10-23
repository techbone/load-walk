// Not a done criterion: leaves the room in the overload state (iron on, glow, red chip, meter) and holds it for a screenshot.

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils";
import { LoadWalkLeafInteractor, switchOnSmallLoads } from "./LoadWalkLeafInteractor";

@component
export class EvidenceOverloadScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    await switchOnSmallLoads(i);
    await i.toggle("Iron");
    await sleep(500);
    expect(findSceneObjectByName("LoadMeter") !== null).toBe(true);
    await sleep(30000);
  }
}
