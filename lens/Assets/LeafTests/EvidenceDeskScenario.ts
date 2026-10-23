// Not a done criterion: holds the desk in a state worth a before/after screenshot (all four desk appliances tagged,
// fan, phone charger and power bank on). Only runs when selected by id.

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { sleep } from "Leaf.lspkg/Utils/common/Utils";
import { LoadWalkLeafInteractor, resetSmallLoads } from "./LoadWalkLeafInteractor";

@component
export class EvidenceDeskScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    await resetSmallLoads(i);
    await i.toggle("Fan");
    await i.toggle("PhoneCharger");
    await i.toggle("PowerBank");
    await sleep(30000);
  }
}
