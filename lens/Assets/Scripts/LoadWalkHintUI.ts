// Owns: the clearly labelled note that the appliance scan is a stand-in in this preview build.
// A passive view; Main hides it after the first scan so it gets out of the way.

import { FlexLayout } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout";
import { FlexAlign, FlexDirection, FlexJustify } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes";
import { BackPlate } from "SpectaclesUIKit.lspkg/Scripts/BackPlate";
import { Billboard } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Billboard/Billboard";
import { COLORS, setPlateAlpha, stylePlate, makeText } from "./LoadWalkTheme";

@component
export class LoadWalkHintUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">LoadWalkHintUI – scan stand-in note</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Title line of the note.")
  heading: string = "SCAN IS A STAND-IN";
  @input
  @hint("First body line.")
  lineOne: string = "Pinch an appliance to scan it.";
  @input
  @hint("Second body line.")
  lineTwo: string = "The finished Lens would recognise it with the camera.";
  @input
  @hint("Opacity of the light plate behind the text. 0 drops the plate and leaves bright text.")
  @widget(new SliderWidget(0, 0.5, 0.02))
  plateAlpha: number = 0.14;
  @ui.group_end

  private panel: SceneObject;

  onAwake() {
    this.panel = this.sceneObject;
    this.sceneObject.createComponent("Component.Canvas");
    this.sceneObject.createComponent(Billboard.getTypeName());
    const plate = this.sceneObject.createComponent(BackPlate.getTypeName()) as BackPlate;
    setPlateAlpha(this.plateAlpha);
    // BackPlate applies its own dark style when it starts; restyle after that.
    this.createEvent("OnStartEvent").bind(() => stylePlate(this.sceneObject));
    const flex = this.sceneObject.createComponent(FlexLayout.getTypeName()) as FlexLayout;
    flex.onLayoutComplete.add((r) => {
      plate.size = new vec2(r.containerWidth, r.containerHeight);
    });
    flex.direction = FlexDirection.Column;
    flex.alignItems = FlexAlign.Center;
    flex.justifyContent = FlexJustify.Center;
    flex.rowGap = 0.5;
    flex.paddingTop = 1.0;
    flex.paddingBottom = 1.0;
    flex.paddingLeft = 1.4;
    flex.paddingRight = 1.4;
    flex.width = -1;
    flex.height = -1;
    makeText(this.sceneObject, this.heading, "Body", 30, COLORS.near, { name: "HintHeading" });
    makeText(this.sceneObject, this.lineOne, "Caption", 30, COLORS.text, { name: "HintLineOne" });
    makeText(this.sceneObject, this.lineTwo, "Caption", 30, COLORS.dim, { name: "HintLineTwo" });
  }

  hide(): void {
    this.panel.enabled = false;
  }
}
