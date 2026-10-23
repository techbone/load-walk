// Owns: the full load meter that floats above the power station.
// A passive view: Main pushes a MeterView; nothing here decides status or does load maths.
// Inputs: numberFont (optional).

import { FlexLayout } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout";
import { FlexAlign, FlexDirection, FlexJustify } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes";
import { BackPlate } from "SpectaclesUIKit.lspkg/Scripts/BackPlate";
import { Billboard } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Billboard/Billboard";
import { COLORS, setPlateAlpha, stylePlateWhenReady, Level, levelColor, makeText, setNumberFont, textWidthCm } from "./LoadWalkTheme";

export type MeterView = { loadText: string; limitText: string; statusText: string; hoursText: string; level: Level };

@component
export class LoadWalkMeterUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">LoadWalkMeterUI – load meter above the power station</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input
  @allowUndefined
  @hint("Optional monospaced font for the figures.")
  numberFont: Font;
  @input
  @hint("Opacity of the light plate behind the text. 0 drops the plate and leaves bright text.")
  @widget(new SliderWidget(0, 0.5, 0.02))
  plateAlpha: number = 0.14;
  @input
  @hint("How far the meter face is tipped back toward the user, in degrees.")
  @widget(new SliderWidget(0, 45, 1))
  tiltDegrees: number = 25;
  @ui.group_end

  private load: Text;
  private limit: Text;
  private status: Text;
  private hours: Text;

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas");
    // The root turns to face the user (yaw only); the panel below it is tipped back so it reads from below.
    this.sceneObject.createComponent(Billboard.getTypeName());
    if (this.numberFont) setNumberFont(this.numberFont);
    const face = global.scene.createSceneObject("MeterFace");
    face.setParent(this.sceneObject);
    face.getTransform().setLocalRotation(quat.angleAxis((this.tiltDegrees * Math.PI) / 180, vec3.right()));
    const plate = face.createComponent(BackPlate.getTypeName()) as BackPlate;
    setPlateAlpha(this.plateAlpha);
    stylePlateWhenReady(this, face, plate);
    const flex = face.createComponent(FlexLayout.getTypeName()) as FlexLayout;
    flex.onLayoutComplete.add((r) => {
      plate.size = new vec2(r.containerWidth, r.containerHeight);
    });
    flex.direction = FlexDirection.Column;
    flex.alignItems = FlexAlign.Center;
    flex.justifyContent = FlexJustify.Center;
    flex.rowGap = 0.2;
    flex.paddingTop = 0.5;
    flex.paddingBottom = 0.5;
    flex.paddingLeft = 0.8;
    flex.paddingRight = 0.8;
    flex.width = -1;
    flex.height = -1;

    // Widths are those of the longest string each row can show, so the plate does not jump as values change.
    const wide = Math.max(textWidthCm("Overload: switch off Iron", "Label"), textWidthCm("Battery left: 17h 12m", "Label", true));
    makeText(face, "POWER STATION LOAD", "Label", wide, COLORS.text, { name: "MeterCaption" });
    this.load = makeText(face, "1,282 W", "Meter", wide, COLORS.text, { numbers: true, name: "MeterLoad" });
    this.limit = makeText(face, "of 200 W", "Number", wide, COLORS.text, { numbers: true, name: "MeterLimit" });
    this.status = makeText(face, "Overload: switch off Iron", "Label", wide, COLORS.text, { name: "MeterStatus" });
    this.hours = makeText(face, "Battery left: 17h 12m", "Label", wide, COLORS.text, { numbers: true, name: "MeterHours" });
  }

  setView(v: MeterView): void {
    const c = levelColor(v.level);
    this.load.text = v.loadText;
    this.load.textFill.color = c;
    this.limit.text = v.limitText;
    this.limit.textFill.color = v.level === "idle" ? COLORS.text : c;
    this.status.text = v.statusText;
    this.status.textFill.color = v.level === "idle" ? COLORS.text : c;
    this.hours.text = v.hoursText;
  }

  get shownLoadText(): string {
    return this.load ? this.load.text : "";
  }
}
