// Owns: the per-appliance UI -- the scan-stand-in card, the appliance tag with its on/off button, and the
// live load chip. A passive view: it renders what it is told and reports intent through events.
// Inputs: numberFont (optional monospaced face for figures).
// Must not: decide anything about load, wattage or overload; hold domain state.

import { FlexLayout } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout";
import { FlexItem } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem";
import { FlexAlign, FlexDirection, FlexJustify } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes";
import { BackPlate } from "SpectaclesUIKit.lspkg/Scripts/BackPlate";
import { Button } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button";
import { Billboard } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Billboard/Billboard";
import Event, { PublicApi } from "SpectaclesInteractionKit.lspkg/Utils/Event";
import animate from "SpectaclesInteractionKit.lspkg/Utils/animate";
import { COLORS, Level, levelColor, makeText, setNumberFont, setPanelOpacity, setPlateAlpha, stylePlate, textWidthCm } from "./LoadWalkTheme";

export type CardOption = { id: string; label: string };
export type TagView = { title: string; note?: string; on: boolean };

type Panel = { so: SceneObject; flex: FlexLayout };

@component
export class LoadWalkStationUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">LoadWalkStationUI – card, tag and chip for one appliance</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Sideways offset of the scan card from the tag position, in cm. Positive is to the right as the user sees it.")
  @widget(new SliderWidget(-30, 30, 1))
  cardSideOffsetCm: number = 0;
  @input
  @hint("How far the scan card sits below the tag position, in cm (negative raises it), so it opens beside the appliance.")
  @widget(new SliderWidget(-30, 60, 1))
  cardDropCm: number = 0;
  @input
  @hint("Opacity of the light plates behind text. 0 drops the plates and leaves bright text.")
  @widget(new SliderWidget(0, 0.5, 0.02))
  plateAlpha: number = 0.14;
  @input
  @allowUndefined
  @hint("Optional monospaced font for the figures (W, hours).")
  numberFont: Font;
  @ui.group_end
  private _onPick = new Event<string>();
  private _onToggle = new Event<void>();
  get onPick(): PublicApi<string> {
    return this._onPick.publicApi();
  }
  get onToggle(): PublicApi<void> {
    return this._onToggle.publicApi();
  }

  private card: SceneObject | null = null;
  private tag: Panel | null = null;
  private tagTitle: Text | null = null;
  private toggleLabel: Text | null = null;
  private tagW = 0;
  private chip: SceneObject | null = null;
  private chipW = 0;
  private fadeEvent: DelayedCallbackEvent;

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas");
    this.sceneObject.createComponent(Billboard.getTypeName());
    if (this.numberFont) setNumberFont(this.numberFont);
    setPlateAlpha(this.plateAlpha);
    this.fadeEvent = this.createEvent("DelayedCallbackEvent");
    this.fadeEvent.bind(() => this.fadeChip());
  }

  // ---- scan stand-in card -------------------------------------------------------------------------------
  showCard(options: CardOption[]): void {
    this.hideCard();
    const titleText = "Scan stand-in: what is this?";
    const widest = Math.max(textWidthCm(titleText, "Caption"), ...options.map((o) => textWidthCm(o.label, "Body") + 4));
    const panel = this.makePanel("ScanCard", () => {});
    panel.so.getTransform().setLocalPosition(new vec3(this.cardSideOffsetCm, -this.cardDropCm, 0));
    this.card = panel.so;
    makeText(panel.so, titleText, "Caption", widest, COLORS.dim);
    for (const opt of options) {
      this.makeButton(panel.so, opt.label, widest, 4.4, () => this._onPick.invoke(opt.id));
    }
  }

  hideCard(): void {
    if (this.card) {
      this.retire(this.card);
      this.card = null;
    }
  }

  // ---- appliance tag --------------------------------------------------------------------------------------
  showTag(view: TagView): void {
    this.hideCard();
    if (this.tag) this.retire(this.tag.so);
    const widest = Math.max(textWidthCm(view.title, "Body"), view.note ? textWidthCm(view.note, "Caption") : 0, 12);
    this.tag = this.makePanel("Tag", (w) => {
      this.tagW = w;
      this.placeChip();
    });
    this.tagTitle = makeText(this.tag.so, view.title, "Body", widest, COLORS.text, { numbers: true, name: "TagTitle" });
    if (view.note) makeText(this.tag.so, view.note, "Caption", widest, COLORS.near, { name: "TagNote" });
    const btn = this.makeButton(this.tag.so, "Turn on", widest, 4.4, () => this._onToggle.invoke(), "ToggleButton");
    this.toggleLabel = btn;
    this.setOn(view.on);
  }

  setOn(on: boolean): void {
    if (this.toggleLabel) this.toggleLabel.text = on ? "Turn off" : "Turn on";
    if (this.tagTitle) this.tagTitle.textFill.color = on ? COLORS.accent : COLORS.text;
  }

  // ---- live load chip -------------------------------------------------------------------------------------
  // fadeAfterSec 0 keeps the chip until hideChip() (used for the overload warning).
  showChip(text: string, level: Level, fadeAfterSec: number): void {
    this.dropChip();
    const w = textWidthCm(text, "Subheadline");
    const panel = this.makePanel("Chip", (cw) => {
      this.chipW = cw;
      this.placeChip();
    });
    this.chip = panel.so;
    makeText(panel.so, text, "Subheadline", w, levelColor(level), { numbers: true, name: "ChipText" });
    this.placeChip();
    if (fadeAfterSec > 0) {
      this.fadeEvent.enabled = true;
      this.fadeEvent.reset(fadeAfterSec);
    } else {
      this.fadeEvent.enabled = false;
    }
  }

  hideChip(): void {
    this.dropChip();
  }

  get chipText(): string {
    if (!this.chip) return "";
    const t = this.chip.getChild(0)?.getComponent("Component.Text") as Text | null;
    return t ? t.text : "";
  }

  private dropChip(): void {
    this.fadeEvent.enabled = false;
    if (this.chip) {
      this.retire(this.chip);
      this.chip = null;
    }
  }

  // Hide now, destroy a moment later: a button must not be destroyed from inside its own trigger event.
  private retire(so: SceneObject): void {
    so.enabled = false;
    const ev = this.createEvent("DelayedCallbackEvent");
    ev.bind(() => {
      if (!isNull(so)) so.destroy();
    });
    ev.reset(0.3);
  }

  private fadeChip(): void {
    const chip = this.chip;
    if (!chip) return;
    animate({
      duration: 0.5,
      easing: "ease-in-quad",
      update: (t: number) => {
        if (!isNull(chip)) setPanelOpacity(chip, Math.max(0, 1 - t));
      },
      ended: () => {
        if (this.chip === chip) {
          this.retire(chip);
          this.chip = null;
        }
      },
    });
  }

  private placeChip(): void {
    if (!this.chip) return;
    const x = this.tag ? this.tagW / 2 + this.chipW / 2 + 1.2 : 0;
    this.chip.getTransform().setLocalPosition(new vec3(x, 0, 0));
  }

  // ---- building blocks ------------------------------------------------------------------------------------
  private makePanel(name: string, onSize: (w: number, h: number) => void): Panel {
    const so = global.scene.createSceneObject(name);
    so.setParent(this.sceneObject);
    const plate = so.createComponent(BackPlate.getTypeName()) as BackPlate;
    stylePlate(so);
    const flex = so.createComponent(FlexLayout.getTypeName()) as FlexLayout;
    flex.onLayoutComplete.add((r) => {
      plate.size = new vec2(r.containerWidth, r.containerHeight);
      onSize(r.containerWidth, r.containerHeight);
    });
    flex.direction = FlexDirection.Column;
    flex.alignItems = FlexAlign.Center;
    flex.justifyContent = FlexJustify.Center;
    flex.rowGap = 0.6;
    flex.paddingTop = 0.9;
    flex.paddingBottom = 0.9;
    flex.paddingLeft = 1.2;
    flex.paddingRight = 1.2;
    flex.width = -1;
    flex.height = -1;
    return { so, flex };
  }

  // Returns the label so callers can retitle it.
  private makeButton(parent: SceneObject, label: string, widthCm: number, heightCm: number, onTap: () => void, name?: string): Text {
    const so = global.scene.createSceneObject(name ?? "Btn-" + label);
    so.setParent(parent);
    so.getTransform().setLocalPosition(new vec3(0, 0, 0.6));
    const btn = so.createComponent(Button.getTypeName()) as Button;
    btn.setVariant({ theme: "SnapOS2", shape: "Rectangle", style: "Ghost" }); // outline and light hover wash, no dark fill
    btn.size = new vec3(widthCm, heightCm, 1);
    const text = makeText(so, label, "Body", widthCm - 0.5, COLORS.text, { z: 0.08, name: "ButtonLabel" });
    so.createComponent(FlexItem.getTypeName());
    btn.onTriggerUp.add(() => onTap());
    return text;
  }
}
