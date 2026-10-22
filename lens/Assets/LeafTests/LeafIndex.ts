import { scenariosIndex } from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator";
import { ScenarioMetadata } from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata";
import { ScanAndPickScenario } from "./ScanAndPickScenario";
import { LiveTotalScenario } from "./LiveTotalScenario";
import { MeterScenario } from "./MeterScenario";
import { OverloadScenario } from "./OverloadScenario";
import { RecoveryScenario } from "./RecoveryScenario";
import { OutOfViewArrowScenario } from "./OutOfViewArrowScenario";
import { IKReachScenario } from "./IKReachScenario";

@component
export class LeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    { id: "extra-ik-reach-fan", typename: IKReachScenario.getTypeName() },
    { id: "criterion-1-scan-and-pick", typename: ScanAndPickScenario.getTypeName() },
    { id: "criterion-2-live-total", typename: LiveTotalScenario.getTypeName() },
    { id: "criterion-3-meter", typename: MeterScenario.getTypeName() },
    { id: "criterion-4-overload", typename: OverloadScenario.getTypeName() },
    { id: "criterion-5-recovery", typename: RecoveryScenario.getTypeName() },
    { id: "extra-out-of-view-arrow", typename: OutOfViewArrowScenario.getTypeName() },
  ];
}
