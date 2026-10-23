// Placement: every tag and card sits within 20 cm of its appliance (the raised laptop tag within 30 cm) (measured from the panel centre to the appliance's
// bounding box). Tags are measured for all eight appliances; cards for the ones still untagged here.

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { sleep } from "Leaf.lspkg/Utils/common/Utils";
import {
  LoadWalkLeafInteractor, NAMES, expectCardNear, expectTagNear, isTagged,
} from "./LoadWalkLeafInteractor";

const PICKS: [string, string][] = [
  ["Freezer", "Freezer"], ["Fridge", "Fridge"], ["WaterPump", "Water pump"], ["Fan", NAMES.Fan],
  ["PhoneCharger", NAMES.PhoneCharger], ["PowerBank", NAMES.PowerBank], ["Laptop", NAMES.Laptop], ["Iron", NAMES.Iron],
];

@component
export class PlacementScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    for (const [slot, label] of PICKS) {
      if (!isTagged(slot)) {
        await i.scan(slot);
        expectCardNear(slot);
        await i.pick(slot, label);
      }
      expectTagNear(slot);
    }
  }
}
