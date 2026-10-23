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
  @hint("Root of the appliance's 3D model. Every mesh under it is tinted for hover and overload glow.")
  bodyRoot: SceneObject;
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
  @hint("Show the collider wireframe for debugging.")
  debugColliders: boolean = false;
  @ui.group_end

  private _onScan = new Event<LoadWalkStation>();
  get onScan(): PublicApi<LoadWalkStation> {
    return this._onScan.publicApi();
  }

  private mats: Material[] = [];
  private baseColors: vec4[] = [];
  private baseEmissive: vec4[] = [];
  private baseScale: vec3 = vec3.one();
  private glowing = false;
  private hovered = false;
  private t = 0;

  get slotId(): string {
    return this.sceneObject.name;
  }

  onAwake() {
    LoadWalkStation.all.push(this);
    this.baseScale = this.bodyRoot.getTransform().getLocalScale();
    this.collectMaterials(this.bodyRoot);
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
    this.t = 0;
    this.paintBody();
  }

  get isGlowing(): boolean {
    return this.glowing;
  }

  // Each mesh gets its own material copy so tinting one appliance never touches another.
  private collectMaterials(root: SceneObject): void {
    const rmv = root.getComponent("Component.RenderMeshVisual") as RenderMeshVisual | null;
    if (rmv) {
      const clones: Material[] = [];
      for (let i = 0; i < rmv.getMaterialsCount(); i++) {
        const m = rmv.getMaterial(i).clone();
        clones.push(m);
        this.mats.push(m);
        const pass = m.mainPass as any;
        this.baseColors.push(pass.baseColorFactor ? new vec4(pass.baseColorFactor.x, pass.baseColorFactor.y, pass.baseColorFactor.z, pass.baseColorFactor.w) : new vec4(1, 1, 1, 1));
        this.baseEmissive.push(pass.emissiveFactor ? new vec4(pass.emissiveFactor.x, pass.emissiveFactor.y, pass.emissiveFactor.z, 1) : new vec4(0, 0, 0, 1));
      }
      rmv.materials = clones;
    }
    for (let c = 0; c < root.getChildrenCount(); c++) this.collectMaterials(root.getChild(c));
  }

  // Overload glow: the model turns red and emits red. Hover: a small scale lift.
  private paintBody(intensity: number = 1): void {
    for (let i = 0; i < this.mats.length; i++) {
      const pass = this.mats[i].mainPass as any;
      const b = this.baseColors[i];
      if (pass.baseColorFactor) {
        pass.baseColorFactor = this.glowing
          ? new vec4(b.x * 0.35 + COLORS.warn.x * 0.65, b.y * 0.2, b.z * 0.2, b.w)
          : b;
      }
      if (pass.emissiveFactor) {
        const e = this.baseEmissive[i];
        const lit = pass.emissiveFactor.w !== undefined;
        const r = this.glowing ? COLORS.warn.x * intensity : e.x;
        const g = this.glowing ? COLORS.warn.y * intensity : e.y;
        const bl = this.glowing ? COLORS.warn.z * intensity : e.z;
        pass.emissiveFactor = lit ? new vec4(r, g, bl, 1) : new vec3(r, g, bl);
      }
    }
    this.bodyRoot.getTransform().setLocalScale(this.baseScale.uniformScale(this.hovered ? 1.04 : 1));
  }

  private pulse(): void {
    if (!this.glowing) return;
    this.t += getDeltaTime();
    this.paintBody(0.6 + 0.4 * Math.sin(this.t * 6));
  }
}
