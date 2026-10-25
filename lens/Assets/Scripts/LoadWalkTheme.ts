// Owns: Load Walk colours, number formatting and the small text, button and plate helpers shared by the UI modules.
// Colours: one accent for "on / within capacity", one near-limit amber, one warning red. Everything else is bright
// white: black is transparent on the additive display and grey text would carry no meaning there.

import { FlexItem } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem";
import { BackPlate } from "SpectaclesUIKit.lspkg/Scripts/BackPlate";
import { Button } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button";
import { TargetingPriority } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import { RoundedRectangle } from "SpectaclesUIKit.lspkg/Scripts/Visuals/RoundedRectangle/RoundedRectangle";

export type Level = "idle" | "ok" | "near" | "overload";

export const COLORS = {
  accent: new vec4(0.38, 0.92, 0.66, 1), // on / within capacity (mint green)
  near: new vec4(1.0, 0.78, 0.2, 1), // near the limit (amber)
  warn: new vec4(1.0, 0.33, 0.28, 1), // overload (red)
  text: new vec4(1, 1, 1, 1),
};

export function levelColor(level: Level): vec4 {
  switch (level) {
    case "ok":
      return COLORS.accent;
    case "near":
      return COLORS.near;
    case "overload":
      return COLORS.warn;
    default:
      return COLORS.text;
  }
}

// 1282 -> "1,282"
export function fmtNum(n: number): string {
  const s = Math.round(n).toString();
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function fmtW(w: number): string {
  return fmtNum(w) + " W";
}

// Text sizes are chosen by real-world height so they read from 2 m (1.5 m for the meter):
//   Meter  - meter's big figure, digits about 6 cm tall
//   Number - tag and chip figures, digits about 4 cm tall
//   Label  - names, notes, buttons, about 2.5 cm cap height
export type TextRole = "Meter" | "Number" | "Label" | "Arrow";
const TYPE_SCALE: Record<TextRole, { size: number; weight: number }> = {
  Meter: { size: 360, weight: 700 },
  Number: { size: 241, weight: 700 },
  Label: { size: 150, weight: 700 },
  Arrow: { size: 250, weight: 700 },
};

// Text.size is an em height in 1/43.886 cm (the Lens Studio type scale); EM_SCALE corrects it from measurements.
export const EM_SCALE = 1.0;
export function emCm(role: TextRole): number {
  return (TYPE_SCALE[role].size / 43.886) * EM_SCALE;
}
// Digits and capitals stand about 0.73 em tall in both faces.
export function capHeightCm(role: TextRole): number {
  return emCm(role) * 0.73;
}

// Optional monospaced face for figures; set by a UI module when one is wired in the Inspector.
let numberFont: Font | null = null;
export function setNumberFont(f: Font | null): void {
  if (f) numberFont = f;
}

export function applyTextRole(t: Text, role: TextRole): void {
  t.size = TYPE_SCALE[role].size;
  (t as Text & { weight?: number }).weight = TYPE_SCALE[role].weight;
}

// Width of a string in cm: monospaced figures are 0.6 em per glyph, the bold sans about 0.58 em.
export function textWidthCm(s: string, role: TextRole, mono: boolean = false): number {
  return Math.max(4, s.length * emCm(role) * (mono ? 0.6 : 0.58) + 0.6);
}

// Row height that holds a line of this role.
export function rowHeightCm(role: TextRole): number {
  return emCm(role) * 1.25;
}

export function makeText(
  parent: SceneObject,
  content: string,
  role: TextRole,
  widthCm: number,
  color: vec4,
  opts?: { z?: number; numbers?: boolean; name?: string }
): Text {
  const so = global.scene.createSceneObject(opts?.name ?? "Text");
  so.setParent(parent);
  so.getTransform().setLocalPosition(new vec3(0, 0, opts?.z ?? 0.7));
  const t = so.createComponent("Component.Text") as Text;
  t.text = content;
  t.depthTest = true;
  applyTextRole(t, role);
  t.horizontalAlignment = HorizontalAlignment.Center;
  t.verticalAlignment = VerticalAlignment.Center;
  t.horizontalOverflow = HorizontalOverflow.Overflow;
  t.verticalOverflow = VerticalOverflow.Overflow;
  const h = rowHeightCm(role);
  t.layoutRect = Rect.create(-widthCm / 2, widthCm / 2, -h / 2, h / 2);
  t.textFill.color = color;
  if (opts?.numbers && numberFont) t.font = numberFont;
  so.createComponent(FlexItem.getTypeName());
  return t;
}

// Returns the label so callers can retitle it. The label's handler is bound here, to the same call that draws it.
export function makeButton(
  parent: SceneObject,
  label: string,
  widthCm: number,
  heightCm: number,
  onTap: () => void,
  name?: string,
  labelName: string = "ButtonLabel"
): Text {
  const so = global.scene.createSceneObject(name ?? "Btn-" + label);
  so.setParent(parent);
  so.getTransform().setLocalPosition(new vec3(0, 0, 0.6));
  const btn = so.createComponent(Button.getTypeName()) as Button;
  btn.setVariant({ theme: "SnapOS2", shape: "Rectangle", style: "Ghost" }); // outline and light hover wash, no dark fill
  btn.size = new vec3(widthCm, heightCm, 1);
  // Buttons outrank appliance bodies: SIK otherwise takes the nearest collider, and an appliance's padded pinch
  // box in front of a button would swallow the click. The Interactable exists once the Button has initialized.
  const raise = () => {
    if (btn.interactable) btn.interactable.targetingPriority = TargetingPriority.High;
  };
  raise();
  btn.onInitialized.add(raise);
  const text = makeText(so, label, "Label", widthCm - 0.5, COLORS.text, { z: 0.08, name: labelName });
  so.createComponent(FlexItem.getTypeName());
  // Act only on a pinch that began on this button. SIK sends the release to whatever the ray is on at that moment,
  // so a scan card that opens under the hand mid-pinch would otherwise take the release as a pick.
  let pressed = false;
  btn.onTriggerDown.add(() => (pressed = true));
  btn.onTriggerUp.add(() => {
    if (!pressed) return;
    pressed = false;
    onTap();
  });
  return text;
}

// ---- plates ---------------------------------------------------------------------------------------------
// Additive display: black is transparent, so plates are a faint white wash with a brighter rim, never dark.
// Alpha 0 drops the plates entirely and leaves bright text.
let plateAlpha = 0.14;
export function setPlateAlpha(a: number): void {
  plateAlpha = a;
}

export function stylePlate(plateSO: SceneObject): void {
  const rr = plateSO.getComponent(RoundedRectangle.getTypeName()) as RoundedRectangle | null;
  if (!rr) return;
  rr.gradient = false;
  rr.backgroundColor = new vec4(1, 1, 1, plateAlpha);
  rr.border = plateAlpha > 0;
  rr.borderSize = 0.12;
  rr.borderColor = new vec4(1, 1, 1, Math.min(1, plateAlpha * 4));
}

// Light a plate in an answer colour; stylePlate puts it back.
export function highlightPlate(plateSO: SceneObject, color: vec4): void {
  const rr = plateSO.getComponent(RoundedRectangle.getTypeName()) as RoundedRectangle | null;
  if (!rr) return;
  rr.backgroundColor = new vec4(color.x, color.y, color.z, 0.3);
  rr.border = true;
  rr.borderSize = 0.4;
  rr.borderColor = color;
}

// Fade a panel by opacity: the plate and every text under it.
export function setPanelOpacity(panel: SceneObject, a: number): void {
  const rr = panel.getComponent(RoundedRectangle.getTypeName()) as RoundedRectangle | null;
  if (rr) rr.opacity = a;
  const walk = (so: SceneObject) => {
    const t = so.getComponent("Component.Text") as Text | null;
    if (t) {
      const c = t.textFill.color;
      t.textFill.color = new vec4(c.x, c.y, c.z, a);
    }
    for (let i = 0; i < so.getChildrenCount(); i++) walk(so.getChild(i));
  };
  walk(panel);
}

// BackPlate applies its own dark style on its first frame, so restyle once it reports initialized.
export function stylePlateWhenReady(owner: BaseScriptComponent, plateSO: SceneObject, plate: BackPlate): void {
  const ev = owner.createEvent("UpdateEvent");
  ev.bind(() => {
    if (isNull(plateSO) || isNull(plate)) {
      ev.enabled = false;
      return;
    }
    if (plate.initialized) {
      stylePlate(plateSO);
      ev.enabled = false;
    }
  });
}
