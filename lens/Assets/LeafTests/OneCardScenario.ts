// Scan cards: only one is open at a time. Opening another closes the first; picking an option closes the card.
// Runs right after the IK scenario, which leaves the fan's card open.

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { sleep } from "Leaf.lspkg/Utils/common/Utils";
import { LoadWalkLeafInteractor, child, expectCardNear, expectTagNear, isTagged, uiRoot } from "./LoadWalkLeafInteractor";

const SLOTS = ["Freezer", "Fridge", "WaterPump", "Fan", "PhoneCharger", "PowerBank", "Laptop", "Iron"];

function openCards(): string[] {
  return SLOTS.filter((slot) => child(uiRoot(slot), "ScanCard") !== null);
}

@component
export class OneCardScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    if (!isTagged("Laptop")) {
      await i.scan("Laptop");
      expect(openCards().join(",")).toBe("Laptop");
      expectCardNear("Laptop");
    }
    if (!isTagged("Iron")) {
      await i.scan("Iron");
      // Laptop's card closed when Iron's opened.
      expect(openCards().join(",")).toBe("Iron");
      expectCardNear("Iron");
      await i.pick("Iron", "Iron");
      expect(openCards().length).toBe(0);
      expect(isTagged("Iron")).toBe(true);
      expectTagNear("Iron");
    }
  }
}
