// Owns: the out-of-view arrow. It floats in front of the user and points toward a world position.
// A passive view: Main decides when the culprit is out of view and sets the target (null hides it).

import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider";
import { COLORS, makeText } from "./LoadWalkTheme";

@component
export class LoadWalkArrowUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">LoadWalkArrowUI – out-of-view pointer</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("How far in front of the user the arrow floats, in cm.")
  @widget(new SliderWidget(40, 120, 5))
  distanceCm: number = 70;
  @input
  @hint("How far from the view centre the arrow sits, in cm.")
  @widget(new SliderWidget(5, 30, 1))
  radiusCm: number = 16;
  @ui.group_end

  private arrowRoot: SceneObject;
  private label: Text;
  private target: vec3 | null = null;

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas");
    const pivot = global.scene.createSceneObject("ArrowGlyph");
    pivot.setParent(this.sceneObject);
    this.arrowRoot = pivot;
    makeText(pivot, ">", "Arrow", 10, COLORS.warn, { name: "ArrowChevron" });
    const labelObj = global.scene.createSceneObject("ArrowLabel");
    labelObj.setParent(this.sceneObject);
    labelObj.getTransform().setLocalPosition(new vec3(0, -4, 0));
    this.label = makeText(labelObj, "", "Label", 24, COLORS.warn, { name: "ArrowText" });
    this.sceneObject.enabled = false;
    this.createEvent("UpdateEvent").bind(() => this.follow());
  }

  setTarget(worldPos: vec3 | null, label: string): void {
    this.target = worldPos;
    this.label.text = label;
    this.sceneObject.enabled = worldPos !== null;
  }

  private follow(): void {
    if (!this.target) return;
    const cam = WorldCameraFinderProvider.getInstance().getTransform();
    const camPos = cam.getWorldPosition();
    const rot = cam.getWorldRotation();
    const local = rot.invert().multiplyVec3(this.target.sub(camPos));
    let dx = local.x;
    let dy = local.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.001) {
      dx = 1;
      dy = 0;
    } else {
      dx /= len;
      dy /= len;
    }
    const offset = new vec3(dx * this.radiusCm, dy * this.radiusCm, -this.distanceCm);
    const t = this.sceneObject.getTransform();
    t.setWorldPosition(camPos.add(rot.multiplyVec3(offset)));
    t.setWorldRotation(rot);
    this.arrowRoot.getTransform().setLocalRotation(quat.angleAxis(Math.atan2(dy, dx), vec3.forward()));
  }
}
