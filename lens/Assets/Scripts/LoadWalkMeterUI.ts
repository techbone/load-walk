// Owns: the full load meter that floats above the power station.
// A passive view: Main pushes a MeterView; nothing here decides status or does load maths.
// Inputs: numberFont (optional).

import { FlexLayout } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout";
import { FlexAlign, FlexDirection, FlexJustify } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes";
import { BackPlate } from "SpectaclesUIKit.lspkg/Scripts/BackPlate";
import { COLORS, setPlateAlpha, stylePlateWhenReady, Level, levelColor, makeText, setNumberFont } from "./LoadWalkTheme";

export type MeterView = { loadText: string; statusText: string; hoursText: string; level: Level };

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
  @ui.group_end

  private load: Text;
  private status: Text;
  private hours: Text;

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas");
    if (this.numberFont) setNumberFont(this.numberFont);
    const plate = this.sceneObject.createComponent(BackPlate.getTypeName()) as BackPlate;
    setPlateAlpha(this.plateAlpha);
    stylePlateWhenReady(this, this.sceneObject, plate);
    const flex = this.sceneObject.createComponent(FlexLayout.getTypeName()) as FlexLayout;
    flex.onLayoutComplete.add((r) => {
      plate.size = new vec2(r.containerWidth, r.containerHeight);
    });
    flex.direction = FlexDirection.Column;
    flex.alignItems = FlexAlign.Center;
    flex.justifyContent = FlexJustify.Center;
    flex.rowGap = 0.3;
    flex.paddingTop = 0.6;
    flex.paddingBottom = 0.6;
    flex.paddingLeft = 1.0;
    flex.paddingRight = 1.0;
    flex.width = -1;
    flex.height = -1;

    makeText(this.sceneObject, "POWER STATION LOAD", "Caption", 26, COLORS.text, { name: "MeterCaption" });
    this.load = makeText(this.sceneObject, "1,282 W / 200 W", "Headline1", 26, COLORS.text, { numbers: true, name: "MeterLoad" });
    this.status = makeText(this.sceneObject, "Overload. Switch off Iron", "Body", 26, COLORS.text, { name: "MeterStatus" });
    this.hours = makeText(this.sceneObject, "Battery left: 17h 12m", "Subheadline", 26, COLORS.text, { numbers: true, name: "MeterHours" });
  }

  setView(v: MeterView): void {
    const c = levelColor(v.level);
    this.load.text = v.loadText;
    this.load.textFill.color = c;
    this.status.text = v.statusText;
    this.status.textFill.color = v.level === "idle" ? COLORS.text : c;
    this.hours.text = v.hoursText;
  }

  get shownLoadText(): string {
    return this.load ? this.load.text : "";
  }
}
