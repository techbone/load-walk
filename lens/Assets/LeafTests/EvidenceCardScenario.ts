// Not a done criterion: puts the room in a state worth looking at (four loads on, a scan card open) and holds it
// for a screenshot. Asserts only that exactly one card is open.

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { sleep } from "Leaf.lspkg/Utils/common/Utils";
import { LoadWalkLeafInteractor, child, uiRoot } from "./LoadWalkLeafInteractor";

@component
export class EvidenceCardScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    await i.ensureTagged("PowerBank", "Power bank");
    await i.ensureTagged("Laptop", "Laptop");
    await i.ensureOn("PowerBank");
    await i.scan("Fan");
    expect(child(uiRoot("Fan"), "ScanCard") !== null).toBe(true);
    // Opening a second card closes the first.
    await i.scan("PhoneCharger");
    expect(child(uiRoot("Fan"), "ScanCard") === null).toBe(true);
    expect(child(uiRoot("PhoneCharger"), "ScanCard") !== null).toBe(true);
    await sleep(30000);
  }
}
