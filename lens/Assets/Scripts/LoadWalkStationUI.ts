// Owns: the per-appliance UI -- the scan-stand-in card, the appliance tag with its on/off button, and the
// live load chip. A passive view: it renders what it is told and reports intent through events.
// Inputs: numberFont (optional monospaced face for figures).
// Must not: decide anything about load, wattage or overload; hold domain state.

import { FlexLayout } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout";
import { FlexAlign, FlexDirection, FlexJustify } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes";
import { BackPlate } from "SpectaclesUIKit.lspkg/Scripts/BackPlate";
import { Billboard } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Billboard/Billboard";
import Event, { PublicApi } from "SpectaclesInteractionKit.lspkg/Utils/Event";
import animate from "SpectaclesInteractionKit.lspkg/Utils/animate";
import { COLORS, Level, highlightPlate, levelColor, makeButton, makeText, setNumberFont, setPanelOpacity, setPlateAlpha, stylePlate, stylePlateWhenReady, textWidthCm, rowHeightCm } from "./LoadWalkTheme";

export type CardOption = { id: string; label: string };
export type TagView = { name: string; watts: string; notes: string[]; on: boolean };

type Panel = { so: SceneObject; flex: FlexLayout };

// The on/off and picker buttons are about twice the old size (the old ones were 7.5 cm tall).
const BUTTON_H = 13;
const CARD_BUTTON_H = 10;

@component
export class LoadWalkStationUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">LoadWalkStationUI – card, tag and chip for one appliance</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Half the appliance's width in cm; the scan card opens just outside it.")
  @widget(new SliderWidget(0, 80, 0.5))
  applianceHalfWidthCm: number = 10;
  @input
  @hint("Half the appliance's depth in cm; tags, chips and cards float just in front of its front face so the model never hides them.")
  @widget(new SliderWidget(0, 60, 0.5))
  applianceHalfDepthCm: number = 10;
  @input
  @hint("Which side the scan card opens on: 1 is right as the user sees it, -1 is left.")
  @widget(new SliderWidget(-1, 1, 2))
  cardSide: number = 1;
  @input
  @hint("Height of the scan card's centre above the appliance's centre, in cm.")
  @widget(new SliderWidget(-30, 60, 1))
  cardCenterYCm: number = 0;
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
  private tagH = 0;
  private chipH = 0;
  private chip: SceneObject | null = null;
  private chipW = 0;
  private fadeEvent: DelayedCallbackEvent;
  private highlightEvent: DelayedCallbackEvent;
  private highlight: Level | null = null;

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas");
    if (this.numberFont) setNumberFont(this.numberFont);
    setPlateAlpha(this.plateAlpha);
    this.fadeEvent = this.createEvent("DelayedCallbackEvent");
    this.fadeEvent.bind(() => this.fadeChip());
    this.highlightEvent = this.createEvent("DelayedCallbackEvent");
    this.highlightEvent.bind(() => this.clearHighlight());
  }

  // ---- scan stand-in card -------------------------------------------------------------------------------
  showCard(options: CardOption[]): void {
    this.hideCard();
    const titleText = "What is this?";
    const widest = Math.max(textWidthCm(titleText, "Label"), ...options.map((o) => textWidthCm(o.label, "Label") + 3));
    // Beside the appliance: just outside its width on the chosen side, centred at cardCenterYCm above its centre.
    const panel = this.makePanel("ScanCard", (cw) => {
      if (isNull(panel.so)) return;
      const root = this.sceneObject.getTransform().getLocalPosition();
      const x = this.cardSide * (this.applianceHalfWidthCm + cw / 2 + 0.5);
      panel.so.getTransform().setLocalPosition(new vec3(x, this.cardCenterYCm - root.y, this.frontZ()));
    });
    this.card = panel.so;
    makeText(panel.so, titleText, "Label", widest, COLORS.text, { name: "CardTitle" });
    for (const opt of options) {
      makeButton(panel.so, opt.label, widest, CARD_BUTTON_H, () => this._onPick.invoke(opt.id));
    }
  }

  hideCard(): void {
    if (this.card) {
      this.retire(this.card);
      this.card = null;
    }
  }

  // ---- appliance tag --------------------------------------------------------------------------------------
  // Layout, top to bottom: appliance name (small), wattage (biggest), notes (small), on/off button.
  // The tag grows upward from just above the appliance: this root sits at the appliance top, the panel's bottom on it.
  showTag(view: TagView): void {
    this.hideCard();
    this.clearHighlight();
    if (this.tag) this.retire(this.tag.so);
    const button = "Turn off";
    const widest = Math.max(
      textWidthCm(view.name, "Label"),
      textWidthCm(view.watts, "Number", true),
      ...view.notes.map((n) => textWidthCm(n, "Label")),
      textWidthCm(button, "Label") + 4
    );
    this.tag = this.makePanel("Tag", (w, h) => {
      this.tagW = w;
      this.tagH = h;
      if (this.tag) this.tag.so.getTransform().setLocalPosition(new vec3(0, h / 2, this.frontZ()));
      this.placeChip();
    });
    makeText(this.tag.so, view.name, "Label", widest, COLORS.text, { name: "TagName" });
    this.tagTitle = makeText(this.tag.so, view.watts, "Number", widest, COLORS.text, { numbers: true, name: "TagWatts" });
    view.notes.forEach((n, k) => makeText(this.tag!.so, n, "Label", widest, COLORS.text, { name: k === 0 ? "TagNote" : "TagNote" + (k + 1) }));
    const btnWidth = textWidthCm(button, "Label") + 4;
    this.toggleLabel = makeButton(this.tag.so, "Turn on", btnWidth, BUTTON_H, () => this._onToggle.invoke(), "ToggleButton");
    this.setOn(view.on);
  }

  setOn(on: boolean): void {
    if (this.toggleLabel) this.toggleLabel.text = on ? "Turn off" : "Turn on";
    if (this.tagTitle) this.tagTitle.textFill.color = on ? COLORS.accent : COLORS.text;
  }

  // ---- voice answer ---------------------------------------------------------------------------------------
  // "Can I run the iron?": light the tag's plate, name and notes in the answer colour for a few seconds, then put
  // them back. Shows an answer only; nothing here touches the load.
  highlightTag(level: Level, seconds: number): void {
    if (!this.tag) return;
    this.highlight = level;
    this.paintTag(levelColor(level));
    this.highlightEvent.enabled = true;
    this.highlightEvent.reset(seconds);
  }

  get highlightedLevel(): Level | null {
    return this.highlight;
  }

  private clearHighlight(): void {
    this.highlightEvent.enabled = false;
    if (!this.highlight) return;
    this.highlight = null;
    if (this.tag && !isNull(this.tag.so)) {
      stylePlate(this.tag.so);
      this.paintTag(null);
    }
  }

  // Colour the tag's name and notes; null puts them back to white and the plate back to normal.
  private paintTag(color: vec4 | null): void {
    if (!this.tag) return;
    if (color) highlightPlate(this.tag.so, color);
    for (let i = 0; i < this.tag.so.getChildrenCount(); i++) {
      const c = this.tag.so.getChild(i);
      const t = c.getComponent("Component.Text") as Text | null;
      if (t && /^Tag(Name|Note)/.test(c.name)) t.textFill.color = color ?? COLORS.text;
    }
  }

  // ---- live load chip -------------------------------------------------------------------------------------
  // fadeAfterSec 0 keeps the chip until hideChip() (used for the overload warning).
  showChip(text: string, hours: string | null, level: Level, fadeAfterSec: number): void {
    this.dropChip();
    const w = Math.max(textWidthCm(text, "Number", true), hours ? textWidthCm(hours, "Label", true) : 0);
    const panel = this.makePanel("Chip", (cw, ch) => {
      this.chipW = cw;
      this.chipH = ch;
      this.placeChip();
    });
    this.chip = panel.so;
    makeText(panel.so, text, "Number", w, levelColor(level), { numbers: true, name: "ChipText" });
    if (hours) makeText(panel.so, hours, "Label", w, levelColor(level), { numbers: true, name: "ChipHours" });
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

  // Panels float 1 cm in front of the appliance's front face.
  private frontZ(): number {
    return this.applianceHalfDepthCm + 1;
  }

  // The chip sits directly above the tag (a row of tags is too tight for chips beside them at this text size).
  private placeChip(): void {
    if (!this.chip) return;
    const y = (this.tag ? this.tagH + 0.6 : 0) + this.chipH / 2;
    this.chip.getTransform().setLocalPosition(new vec3(0, y, this.frontZ()));
  }

  // ---- building blocks ------------------------------------------------------------------------------------
  private makePanel(name: string, onSize: (w: number, h: number) => void): Panel {
    const so = global.scene.createSceneObject(name);
    so.setParent(this.sceneObject);
    // Each panel turns to face the user on its own, so the card and chip offsets stay fixed in room space.
    so.createComponent(Billboard.getTypeName());
    const plate = so.createComponent(BackPlate.getTypeName()) as BackPlate;
    stylePlateWhenReady(this, so, plate);
    const flex = so.createComponent(FlexLayout.getTypeName()) as FlexLayout;
    flex.onLayoutComplete.add((r) => {
      plate.size = new vec2(r.containerWidth, r.containerHeight);
      onSize(r.containerWidth, r.containerHeight);
    });
    flex.direction = FlexDirection.Column;
    flex.alignItems = FlexAlign.Center;
    flex.justifyContent = FlexJustify.Center;
    flex.rowGap = 0.2;
    flex.paddingTop = 0.4;
    flex.paddingBottom = 0.4;
    flex.paddingLeft = 0.8;
    flex.paddingRight = 0.8;
    flex.width = -1;
    flex.height = -1;
    return { so, flex };
  }
}
