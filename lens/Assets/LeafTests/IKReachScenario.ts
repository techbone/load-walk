// Not a done criterion: reachability. A full-arm IK avatar tries to scan the fan the way a person would.
// The trigger only succeeds if the reach converges on the target.

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { sleep } from "Leaf.lspkg/Utils/common/Utils";
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils";
import { createIKInteractor } from "Leaf.lspkg/Interactors/interactor/ik/visualizer/BitmojiAvatar";
import { child, expectCardNear, uiRoot } from "./LoadWalkLeafInteractor";

@component
export class IKReachScenario extends Scenario {
  private readonly _ik = createIKInteractor();

  async run(): Promise<void> {
    await sleep(1500);
    const fan = findInteractableByName("Fan");
    expect(fan !== undefined).toBe(true);
    await this._ik.trigger(fan!);
    await sleep(500);
    expectCardNear("Fan");
    // The scan card opened, so the fan was reachable and pinchable.
    expect(child(uiRoot("Fan"), "ScanCard") !== null || child(uiRoot("Fan"), "Tag") !== null).toBe(true);
  }
}
