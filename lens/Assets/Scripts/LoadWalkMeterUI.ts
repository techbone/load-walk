// Owns: the full load meter that floats above the power station.
// A passive view: Main pushes a MeterView; nothing here decides status or does load maths.
// Inputs: numberFont (optional).

import { FlexLayout } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout";
import { FlexAlign, FlexDirection, FlexJustify } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes";
import { BackPlate } from "SpectaclesUIKit.lspkg/Scripts/BackPlate";
import { COLORS, Level, levelColor, makeText, setNumberFont } from "./LoadWalkTheme";

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
  @ui.group_end

  private load: Text;
  private status: Text;
  private hours: Text;

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas");
    if (this.numberFont) setNumberFont(this.numberFont);
    const plate = this.sceneObject.createComponent(BackPlate.getTypeName()) as BackPlate;
    const flex = this.sceneObject.createComponent(FlexLayout.getTypeName()) as FlexLayout;
    flex.onLayoutComplete.add((r) => {
      plate.size = new vec2(r.containerWidth, r.containerHeight);
    });
    flex.direction = FlexDirection.Column;
    flex.alignItems = FlexAlign.Center;
    flex.justifyContent = FlexJustify.Center;
    flex.rowGap = 0.8;
    flex.paddingTop = 1.4;
    flex.paddingBottom = 1.4;
    flex.paddingLeft = 1.8;
    flex.paddingRight = 1.8;
    flex.width = -1;
    flex.height = -1;

    makeText(this.sceneObject, "POWER STATION LOAD", "Caption", 18, COLORS.dim, { name: "MeterCaption" });
    this.load = makeText(this.sceneObject, "0 W / 200 W", "Headline1", 18, COLORS.text, { numbers: true, name: "MeterLoad" });
    this.status = makeText(this.sceneObject, "Nothing switched on", "Body", 18, COLORS.dim, { name: "MeterStatus" });
    this.hours = makeText(this.sceneObject, "--", "Subheadline", 18, COLORS.text, { numbers: true, name: "MeterHours" });
  }

  setView(v: MeterView): void {
    const c = levelColor(v.level);
    this.load.text = v.loadText;
    this.load.textFill.color = c;
    this.status.text = v.statusText;
    this.status.textFill.color = v.level === "overload" || v.level === "near" ? c : COLORS.dim;
    this.hours.text = v.hoursText;
  }

  get shownLoadText(): string {
    return this.load ? this.load.text : "";
  }
}
