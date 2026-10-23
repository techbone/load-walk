// Not a done criterion: holds the near-limit state (fan, phone charger, power bank and laptop on, 182 W of 200 W) for a
// screenshot, so the amber text can be sampled. Only runs when selected by id.

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { sleep } from "Leaf.lspkg/Utils/common/Utils";
import { LoadWalkLeafInteractor, switchOnSmallLoads } from "./LoadWalkLeafInteractor";

@component
export class EvidenceNearScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    await switchOnSmallLoads(new LoadWalkLeafInteractor());
    await sleep(30000);
  }
}
