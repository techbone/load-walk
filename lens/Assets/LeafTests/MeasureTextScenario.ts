// Not a done criterion: prints the real world-space size (cm) of every kind of UI text, from the rendered text mesh's
// world bounds. Height printed is the glyph-line box (tallest glyph to lowest, em box not included); digits and capitals
// are measured from a one-line probe so cap height can be told apart from line height.

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils";
import { BackPlate } from "SpectaclesUIKit.lspkg/Scripts/BackPlate";
import { LoadWalkLeafInteractor, child, uiRoot } from "./LoadWalkLeafInteractor";

function textBox(root: SceneObject | null, name: string, label: string): void {
  const so = child(root, name);
  if (!so) {
    print("[LEAF-TEXT] " + label + ": not found");
    return;
  }
  const t = so.getComponent("Component.Text") as Text;
  const a = t.worldAabbMin();
  const b = t.worldAabbMax();
  print("[LEAF-TEXT] " + label + " \"" + t.text + "\": box " + (b.x - a.x).toFixed(1) + " wide x " + (b.y - a.y).toFixed(1) + " tall cm, size " + t.size);
}

function plateSize(root: SceneObject | null, name: string, label: string): void {
  const so = child(root, name);
  if (!so) return;
  const p = so.getComponent(BackPlate.getTypeName()) as BackPlate;
  print("[LEAF-TEXT] " + label + " plate " + p.size.x.toFixed(1) + " x " + p.size.y.toFixed(1) + " cm");
}

@component
export class MeasureTextScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    await i.ensureTagged("Fan", "Fan");
    await i.ensureTagged("Laptop", "Laptop");
    await i.ensureOff("Fan");
    await i.toggle("Fan");
    const fan = uiRoot("Fan");
    textBox(fan, "TagName", "tag name");
    textBox(fan, "TagWatts", "tag watts");
    textBox(fan, "ButtonLabel", "button label");
    textBox(fan, "ChipText", "chip figure");
    textBox(fan, "ChipHours", "chip hours");
    plateSize(fan, "Tag", "fan tag");
    plateSize(fan, "Chip", "fan chip");
    textBox(uiRoot("Laptop"), "TagNote", "tag note");
    await i.scan("Freezer");
    textBox(uiRoot("Freezer"), "CardTitle", "card title");
    textBox(uiRoot("Freezer"), "ButtonLabel", "card button");
    plateSize(uiRoot("Freezer"), "ScanCard", "freezer card");
    const meter = findSceneObjectByName("LoadMeter");
    textBox(meter, "MeterLoad", "meter figure");
    textBox(meter, "MeterLimit", "meter limit");
    textBox(meter, "MeterStatus", "meter status");
    textBox(meter, "MeterHours", "meter hours");
    plateSize(meter, "MeterFace", "meter");
  }
}
