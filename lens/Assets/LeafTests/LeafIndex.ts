import { scenariosIndex } from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator";
import { ScenarioMetadata } from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata";
import { ScanAndPickScenario } from "./ScanAndPickScenario";
import { LiveTotalScenario } from "./LiveTotalScenario";
import { MeterScenario } from "./MeterScenario";
import { OverloadScenario } from "./OverloadScenario";
import { RecoveryScenario } from "./RecoveryScenario";
import { VoiceOffByDefaultScenario } from "./VoiceOffByDefaultScenario";
import { VoiceCriterionScenario } from "./VoiceCriterionScenario";
import { VoiceOffTheIronScenario } from "./VoiceOffTheIronScenario";
import { VoiceCanIRunScenario } from "./VoiceCanIRunScenario";
import { OutOfViewArrowScenario } from "./OutOfViewArrowScenario";
import { IKReachScenario } from "./IKReachScenario";
import { OneCardScenario } from "./OneCardScenario";
import { PlacementScenario } from "./PlacementScenario";
import { MeterPlacementScenario } from "./MeterPlacementScenario";
import { PicksScenario } from "./PicksScenario";
import { MeasureTextScenario } from "./MeasureTextScenario";
import { EvidenceNearScenario } from "./EvidenceNearScenario";
import { EvidenceDeskScenario } from "./EvidenceDeskScenario";
import { EvidenceCardScenario } from "./EvidenceCardScenario";
import { EvidenceOverloadScenario } from "./EvidenceOverloadScenario";
import { EvidenceVoiceScenario } from "./EvidenceVoiceScenario";
import { DeskCardsByLabelScenario } from "./DeskCardsByLabelScenario";
import { RetagVoiceScenario } from "./RetagVoiceScenario";
import { ReachScenario } from "./ReachScenario";
import { VoiceRestartScenario } from "./VoiceRestartScenario";
import { BodyPinchScenario } from "./BodyPinchScenario";
import { StartViewScenario } from "./StartViewScenario";
import { EvidenceFreezerScenario } from "./EvidenceFreezerScenario";

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
    { id: "extra-voice-off-by-default", typename: VoiceOffByDefaultScenario.getTypeName() },
    { id: "criterion-6-voice", typename: VoiceCriterionScenario.getTypeName() },
    { id: "extra-voice-off-the-iron", typename: VoiceOffTheIronScenario.getTypeName() },
    { id: "extra-voice-can-i-run-freezer", typename: VoiceCanIRunScenario.getTypeName() },
    { id: "extra-desk-cards-by-label", typename: DeskCardsByLabelScenario.getTypeName() },
    { id: "extra-body-pinch-picks-nothing", typename: BodyPinchScenario.getTypeName() },
    { id: "extra-start-view-fits", typename: StartViewScenario.getTypeName() },
    { id: "extra-retag-then-voice", typename: RetagVoiceScenario.getTypeName() },
    { id: "extra-reach-1m-to-3m", typename: ReachScenario.getTypeName() },
    { id: "extra-voice-restarts", typename: VoiceRestartScenario.getTypeName() },
    { id: "extra-out-of-view-arrow", typename: OutOfViewArrowScenario.getTypeName() },
    { id: "extra-picks-fridge-pump-iron", typename: PicksScenario.getTypeName() },
    { id: "extra-placement-within-20cm", typename: PlacementScenario.getTypeName() },
    { id: "extra-meter-70cm-above", typename: MeterPlacementScenario.getTypeName() },
    { id: "extra-measure-text", typename: MeasureTextScenario.getTypeName() },
    { id: "extra-evidence-near", typename: EvidenceNearScenario.getTypeName() },
    { id: "extra-evidence-desk", typename: EvidenceDeskScenario.getTypeName() },
    { id: "extra-evidence-card", typename: EvidenceCardScenario.getTypeName() },
    { id: "extra-evidence-overload", typename: EvidenceOverloadScenario.getTypeName() },
    { id: "extra-evidence-voice", typename: EvidenceVoiceScenario.getTypeName() },
    { id: "extra-evidence-freezer-card", typename: EvidenceFreezerScenario.getTypeName() },
  ];
}
