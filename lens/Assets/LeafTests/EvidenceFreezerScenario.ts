// Not a done criterion: opens the freezer's scan card (beside the meter) and holds it for a screenshot of the card's
// readability over the freezer and of the meter's clearance from the freezer lid. Only runs when selected by id.

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils";
import { sleep } from "Leaf.lspkg/Utils/common/Utils";
import { LoadWalkLeafInteractor, child, isTagged, uiRoot } from "./LoadWalkLeafInteractor";

@component
export class EvidenceFreezerScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    if (isTagged("Freezer")) await i.trigger(findInteractableByName("TagNameButton", uiRoot("Freezer"), true)!);
    else await i.scan("Freezer");
    expect(child(uiRoot("Freezer"), "ScanCard") !== null).toBe(true);
    await sleep(30000);
  }
}
