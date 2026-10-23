// Not a done criterion: leaves Voice on with "can I run the iron?" heard, its answer shown and the iron's tag highlighted,
// then returns so the state can be photographed. Heard words and highlight are held long enough for a screenshot.

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { sleep } from "Leaf.lspkg/Utils/common/Utils";
import { LoadWalkStationUI } from "../Scripts/LoadWalkStationUI";
import { LoadWalkLeafInteractor, say, switchOnSmallLoads, uiRoot, voiceOn, voiceUI } from "./LoadWalkLeafInteractor";

@component
export class EvidenceVoiceScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    await switchOnSmallLoads(i);
    await voiceOn(i);
    voiceUI().heardSeconds = 120;
    await say("can I run the iron?");
    (uiRoot("Iron").getComponent(LoadWalkStationUI.getTypeName()) as LoadWalkStationUI).highlightTag("overload", 120);
  }
}
