// Runs every registered LEAF scenario in order, inside the preview, and prints one result line each.
// Off by default so the Lens behaves normally; tick "Auto Run" on this object to run the tests on Lens start.

import { DefaultScenarioManager } from "Leaf.lspkg/Scenarios/scenario/manager/DefaultLeafScenarioManager";
import { sleep } from "Leaf.lspkg/Utils/common/Utils";

@component
export class LoadWalkScenarioRunner extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">LoadWalkScenarioRunner – runs the LEAF scenarios</span>')
  @ui.separator
  @input
  @hint("Run all scenarios when the Lens starts. Leave off for normal use.")
  autoRun: boolean = false;
  @input
  @hint("Run only the scenario with this id. Empty runs all of them.")
  onlyId: string = "";

  onAwake() {
    if (!this.autoRun) return;
    this.createEvent("OnStartEvent").bind(() => {
      this.runAll().catch((e) => print("[LEAF-RESULT] runner error: " + e));
    });
  }

  private async runAll(): Promise<void> {
    const manager = DefaultScenarioManager.getInstance();
    await sleep(1500);
    // extra-evidence-* scenarios only hold a state for screenshots; they run when selected by id.
    const ids = manager.listScenarioIds().filter((id) => (this.onlyId === "" ? id.indexOf("extra-evidence") !== 0 && id !== "extra-measure-text" : id === this.onlyId));
    print("[LEAF-RESULT] scenarios: " + ids.join(", "));
    for (const id of ids) {
      try {
        await manager.startScenario(id);
        print("[LEAF-RESULT] PASS " + id);
      } catch (e) {
        print("[LEAF-RESULT] FAIL " + id + " :: " + e);
      }
      await sleep(500);
    }
    print("[LEAF-RESULT] done");
  }
}
