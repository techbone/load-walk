import { scenariosIndex } from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator";
import { ScenarioMetadata } from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata";
import { ScanAndPickScenario } from "./ScanAndPickScenario";
import { LiveTotalScenario } from "./LiveTotalScenario";
import { MeterScenario } from "./MeterScenario";
import { OverloadScenario } from "./OverloadScenario";
import { RecoveryScenario } from "./RecoveryScenario";
import { OutOfViewArrowScenario } from "./OutOfViewArrowScenario";
import { IKReachScenario } from "./IKReachScenario";
import { OneCardScenario } from "./OneCardScenario";
import { PlacementScenario } from "./PlacementScenario";
import { MeterPlacementScenario } from "./MeterPlacementScenario";
import { PicksScenario } from "./PicksScenario";
import { EvidenceCardScenario } from "./EvidenceCardScenario";
import { EvidenceOverloadScenario } from "./EvidenceOverloadScenario";

@component
export class LeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    { id: "extra-ik-reach-fan", typename: IKReachScenario.getTypeName() },
    { id: "extra-one-card-at-a-time", typename: OneCardScenario.getTypeName() },
    { id: "criterion-1-scan-and-pick", typename: ScanAndPickScenario.getTypeName() },
    { id: "criterion-2-live-total", typename: LiveTotalScenario.getTypeName() },
    { id: "criterion-3-meter", typename: MeterScenario.getTypeName() },
    { id: "criterion-4-overload", typename: OverloadScenario.getTypeName() },
    { id: "criterion-5-recovery", typename: RecoveryScenario.getTypeName() },
    { id: "extra-out-of-view-arrow", typename: OutOfViewArrowScenario.getTypeName() },
    { id: "extra-picks-fridge-pump-iron", typename: PicksScenario.getTypeName() },
    { id: "extra-placement-within-20cm", typename: PlacementScenario.getTypeName() },
    { id: "extra-meter-70cm-above", typename: MeterPlacementScenario.getTypeName() },
    { id: "extra-evidence-card", typename: EvidenceCardScenario.getTypeName() },
    { id: "extra-evidence-overload", typename: EvidenceOverloadScenario.getTypeName() },
  ];
}
