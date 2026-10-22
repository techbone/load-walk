// Owns: one physical appliance stand-in in the room: its collider, pinch/hover handling and overload glow.
// Inputs: applianceKind (which real appliance this is), ui (its tag UI), body/glow visuals, sizeCm.
// Must not: render text (that lives in LoadWalkStationUI) or compute load (LoadWalkState does).

import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import Event, { PublicApi } from "SpectaclesInteractionKit.lspkg/Utils/Event";
import { LoadWalkStationUI } from "./LoadWalkStationUI";
import { COLORS } from "./LoadWalkTheme";

@component
export class LoadWalkStation extends BaseScriptComponent {
  static all: LoadWalkStation[] = [];

  @ui.label('<span style="color: #60A5FA;">LoadWalkStation – a scannable appliance</span>')
  @ui.separator
  @ui.group_start("References")
  @input
  @hint("Id of the real appliance this stand-in represents, e.g. freezer, fan, iron.")
  applianceKind: string = "fan";
  @input
  @hint("Tag, card and chip UI for this appliance.")
  ui: LoadWalkStationUI;
  @input
  @hint("Visible body of the appliance.")
  bodyVisual: RenderMeshVisual;
  @input
  @hint("Slightly larger halo shown while this appliance is overloading the unit.")
  glowVisual: RenderMeshVisual;
  @ui.group_end
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Size of the appliance in cm (width, height, depth); also sizes the pinch target.")
  sizeCm: vec3 = new vec3(20, 20, 20);
  @input
  @hint("Extra pinch-target padding around the appliance, in cm. Small appliances need a bigger target.")
  @widget(new SliderWidget(0, 12, 1))
  targetPaddingCm: number = 3;
  @input
  @hint("Body colour at rest. Light neutral so it reads on the additive display.")
  @widget(new ColorWidget())
  bodyColor: vec4 = new vec4(0.62, 0.64, 0.66, 1);
  @input
  @hint("Show the collider wireframe for debugging.")
  debugColliders: boolean = false;
  @ui.group_end

  private _onScan = new Event<LoadWalkStation>();
  get onScan(): PublicApi<LoadWalkStation> {
    return this._onScan.publicApi();
  }

  private bodyMat: Material;
  private glowMat: Material;
  private glowing = false;
  private hovered = false;
  private t = 0;

  get slotId(): string {
    return this.sceneObject.name;
  }

  onAwake() {
    LoadWalkStation.all.push(this);
    this.bodyMat = this.bodyVisual.mainMaterial.clone();
    this.bodyVisual.mainMaterial = this.bodyMat;
    this.glowMat = this.glowVisual.mainMaterial.clone();
    this.glowVisual.mainMaterial = this.glowMat;
    this.glowMat.mainPass.blendMode = BlendMode.Add;
    this.glowVisual.getSceneObject().enabled = false;
    this.paintBody();

    // Collider on this unit-scale wrapper; the visual (scaled) lives on a child.
    const collider = this.sceneObject.createComponent("Physics.ColliderComponent") as ColliderComponent;
    const shape = Shape.createBoxShape();
    shape.size = this.sizeCm.add(vec3.one().uniformScale(this.targetPaddingCm * 2));
    collider.shape = shape;
    collider.debugDrawEnabled = this.debugColliders;
    const interactable = this.sceneObject.createComponent(Interactable.getTypeName()) as Interactable;
    interactable.targetingMode = 3;

    this.createEvent("OnStartEvent").bind(() => {
      // Events from the tag UI children bubble up to this Interactable; only react to hits on the body itself.
      interactable.onTriggerStart.add((e) => {
        if (e.propagationPhase === "Target") this._onScan.invoke(this);
      });
      interactable.onHoverEnter.add((e) => {
        if (e.propagationPhase !== "Target") return;
        this.hovered = true;
        this.paintBody();
      });
      interactable.onHoverExit.add((e) => {
        if (e.propagationPhase !== "Target") return;
        this.hovered = false;
        this.paintBody();
      });
    });
    this.createEvent("UpdateEvent").bind(() => this.pulse());
  }

  setGlow(on: boolean): void {
    this.glowing = on;
    this.glowVisual.getSceneObject().enabled = on;
    this.t = 0;
    this.paintBody();
  }

  get isGlowing(): boolean {
    return this.glowing;
  }

  private paintBody(): void {
    const c = this.glowing ? COLORS.warn : this.bodyColor;
    const lift = this.hovered ? 0.3 : 0;
    this.bodyMat.mainPass.baseColor = new vec4(
      Math.min(1, c.x + lift),
      Math.min(1, c.y + lift),
      Math.min(1, c.z + lift),
      1
    );
  }

  private pulse(): void {
    if (!this.glowing) return;
    this.t += getDeltaTime();
    const k = 0.55 + 0.45 * Math.sin(this.t * 6);
    this.glowMat.mainPass.baseColor = new vec4(COLORS.warn.x * k, COLORS.warn.y * k, COLORS.warn.z * k, 1);
  }
}
