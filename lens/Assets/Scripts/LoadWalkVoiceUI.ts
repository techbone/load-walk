// Owns: the voice controls under the power station meter -- the Voice on/off button, and a small panel with the
// words just heard and the answer to them, which fades after a few seconds.
// A passive view: it shows what it is told and reports the button through an event.
// Inputs: numberFont (optional), heardSeconds.
// Must not: start speech recognition, parse words or decide what a command does.

import { FlexLayout } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout";
import { FlexAlign, FlexDirection, FlexJustify } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes";
import { BackPlate } from "SpectaclesUIKit.lspkg/Scripts/BackPlate";
import { Billboard } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Billboard/Billboard";
import Event, { PublicApi } from "SpectaclesInteractionKit.lspkg/Utils/Event";
import { COLORS, Level, levelColor, makeButton, makeText, setNumberFont, setPanelOpacity, setPlateAlpha, stylePlateWhenReady, textWidthCm } from "./LoadWalkTheme";

export type VoiceStatus = "off" | "listening" | "restarting";
const LABELS: Record<VoiceStatus, string> = { off: "Voice: off", listening: "Voice: listening", restarting: "Voice: restarting" };

// The longest line either row shows; longer transcripts keep their last words.
const MAX_CHARS = 30;
const BUTTON_H = 10;
const FADE_SECONDS = 0.5;

@component
export class LoadWalkVoiceUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">LoadWalkVoiceUI – Voice button and heard words</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input
  @allowUndefined
  @hint("Optional monospaced font for figures in the answer line.")
  numberFont: Font;
  @input
  @hint("How long the heard words and the answer stay before they fade, in seconds.")
  @widget(new SliderWidget(1, 10, 0.5))
  heardSeconds: number = 4;
  @input
  @hint("Opacity of the light plates behind the text. 0 drops the plates and leaves bright text.")
  @widget(new SliderWidget(0, 0.5, 0.02))
  plateAlpha: number = 0.14;
  @ui.group_end

  private _onToggle = new Event<void>();
  get onToggle(): PublicApi<void> {
    return this._onToggle.publicApi();
  }

  private toggleLabel: Text;
  private heardPanel: SceneObject;
  private heard: Text;
  private answer: Text;
  private answer2: Text;
  private heardH = 0;
  private age = 0;
  private visible = false;

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas");
    // Same yaw-only turn as the meter above, so the two always face the user together.
    this.sceneObject.createComponent(Billboard.getTypeName());
    if (this.numberFont) setNumberFont(this.numberFont);
    setPlateAlpha(this.plateAlpha);

    const width = textWidthCm("x".repeat(MAX_CHARS), "Label");
    const buttonWidth = Math.max(...Object.keys(LABELS).map((k) => textWidthCm(LABELS[k as VoiceStatus], "Label"))) + 4;

    // The button panel sits at this object's origin; the heard panel hangs just below it.
    let buttonH = 0;
    const buttonPanel = this.makePanel("VoiceButtonPanel", (_w, h) => {
      buttonH = h;
      this.placeHeard(buttonH);
    });
    this.toggleLabel = makeButton(buttonPanel, LABELS.off, buttonWidth, BUTTON_H, () => this._onToggle.invoke(), "VoiceToggle");

    this.heardPanel = this.makePanel("VoiceHeardPanel", (_w, h) => {
      this.heardH = h;
      this.placeHeard(buttonH);
      if (!this.visible) this.heardPanel.enabled = false; // laid out once, then out of the way until there is something to show
    });
    this.heard = makeText(this.heardPanel, " ", "Label", width, COLORS.text, { name: "VoiceHeard" });
    this.answer = makeText(this.heardPanel, " ", "Label", width, COLORS.text, { numbers: true, name: "VoiceAnswer" });
    // A second answer row, so a long answer wraps instead of losing words.
    this.answer2 = makeText(this.heardPanel, " ", "Label", width, COLORS.text, { numbers: true, name: "VoiceAnswer2" });

    this.createEvent("UpdateEvent").bind(() => this.fade());
  }

  // ---- what the Lens tells it -------------------------------------------------------------------------------
  // "listening" while a speech session is open, "restarting" in the second between a dropped session and the next.
  setStatus(status: VoiceStatus): void {
    this.toggleLabel.text = LABELS[status];
    this.toggleLabel.textFill.color = status === "listening" ? COLORS.accent : COLORS.text;
  }

  // Live words, partial or final. Clears the last answer: it belongs to the previous command.
  showHeard(text: string): void {
    this.heard.text = this.fit(text);
    this.answer.text = " ";
    this.answer2.text = " ";
    this.reveal();
  }

  // The answer to a command, in the level's colour, on one row or wrapped onto two at a space.
  showAnswer(text: string, level: Level = "idle"): void {
    const t = text.trim();
    const cut = t.length > MAX_CHARS ? t.lastIndexOf(" ", MAX_CHARS) : -1;
    this.answer.text = cut > 0 ? t.slice(0, cut) : this.fit(t);
    this.answer2.text = cut > 0 ? this.fit(t.slice(cut + 1)) : " ";
    this.answer.textFill.color = levelColor(level);
    this.answer2.textFill.color = levelColor(level);
    this.reveal();
  }

  get heardText(): string {
    return this.heard ? this.heard.text : "";
  }

  get answerText(): string {
    return this.answer ? (this.answer.text + " " + this.answer2.text).trim() : "";
  }

  get listeningText(): string {
    return this.toggleLabel ? this.toggleLabel.text : "";
  }

  // ---- internals --------------------------------------------------------------------------------------------
  private fit(text: string): string {
    const t = text.trim();
    return t.length > MAX_CHARS ? "…" + t.slice(t.length - (MAX_CHARS - 1)) : t;
  }

  // Show at full strength and restart the countdown; fade() takes it from there.
  private reveal(): void {
    this.age = 0;
    this.visible = true;
    this.heardPanel.enabled = true;
    setPanelOpacity(this.heardPanel, 1);
  }

  private fade(): void {
    if (!this.visible) return;
    this.age += getDeltaTime();
    if (this.age <= this.heardSeconds) return;
    const a = Math.max(0, 1 - (this.age - this.heardSeconds) / FADE_SECONDS);
    setPanelOpacity(this.heardPanel, a);
    if (a === 0) {
      this.visible = false;
      this.heardPanel.enabled = false;
    }
  }

  private placeHeard(buttonH: number): void {
    if (isNull(this.heardPanel)) return;
    this.heardPanel.getTransform().setLocalPosition(new vec3(0, -(buttonH / 2 + 0.6 + this.heardH / 2), 0));
  }

  private makePanel(name: string, onSize: (w: number, h: number) => void): SceneObject {
    const so = global.scene.createSceneObject(name);
    so.setParent(this.sceneObject);
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
    return so;
  }
}
