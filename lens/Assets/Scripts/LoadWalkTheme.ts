// Owns: Load Walk colours, number formatting and the small text helper shared by the UI modules.
// Colours: one accent for "on / within capacity", one near-limit amber, one warning red. Neutrals are white at
// reduced alpha because black is transparent on the additive display.

import { FlexItem } from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem";
import { RoundedRectangle } from "SpectaclesUIKit.lspkg/Scripts/Visuals/RoundedRectangle/RoundedRectangle";

export type Level = "idle" | "ok" | "near" | "overload";

export const COLORS = {
  accent: new vec4(0.38, 0.92, 0.66, 1), // on / within capacity (mint green)
  near: new vec4(1.0, 0.78, 0.2, 1), // near the limit (amber)
  warn: new vec4(1.0, 0.33, 0.28, 1), // overload (red)
  text: new vec4(1, 1, 1, 1),
  dim: new vec4(1, 1, 1, 0.72),
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

export type TextRole = "Title2" | "Headline1" | "Subheadline" | "Body" | "Caption";
const TYPE_SCALE: Record<TextRole, { size: number; weight: number }> = {
  Title2: { size: 93, weight: 700 },
  Headline1: { size: 54, weight: 700 },
  Subheadline: { size: 41, weight: 700 },
  Body: { size: 39, weight: 500 },
  Caption: { size: 38, weight: 500 },
};

// Optional monospaced face for figures; set by a UI module when one is wired in the Inspector.
let numberFont: Font | null = null;
export function setNumberFont(f: Font | null): void {
  if (f) numberFont = f;
}

export function applyTextRole(t: Text, role: TextRole): void {
  t.size = TYPE_SCALE[role].size;
  (t as Text & { weight?: number }).weight = TYPE_SCALE[role].weight;
}

// Width of a label in cm at the type scale (about 0.52 cm per glyph) plus padding.
export function textWidthCm(s: string, role: TextRole): number {
  const per = role === "Headline1" ? 0.72 : role === "Title2" ? 1.2 : 0.55;
  return Math.max(4, s.length * per + 1);
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
  t.layoutRect = Rect.create(-widthCm / 2, widthCm / 2, -1.2, 1.2);
  t.textFill.color = color;
  if (opts?.numbers && numberFont) t.font = numberFont;
  so.createComponent(FlexItem.getTypeName());
  return t;
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
