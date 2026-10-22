// LEAF helpers for Load Walk: drive the scan card and toggle buttons, and read the UI text back.
// Scenarios are independent: each helper reads current state first and only acts when needed.

import { DefaultLeafInteractor } from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor";
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils";
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils";

export function child(root: SceneObject | null | undefined, name: string): SceneObject | null {
  if (!root) return null;
  for (let i = 0; i < root.getChildrenCount(); i++) {
    const c = root.getChild(i);
    if (!c.enabled) continue; // retired objects are hidden before they are destroyed
    if (c.name === name) return c;
    const deep = child(c, name);
    if (deep) return deep;
  }
  return null;
}

export function uiRoot(slot: string): SceneObject {
  const r = findSceneObjectByName(slot + "TagUI");
  if (!r) throw new Error("Missing " + slot + "TagUI");
  return r;
}

export function textOf(root: SceneObject | null, name: string): string | null {
  const so = child(root, name);
  if (!so) return null;
  return (so.getComponent("Component.Text") as Text).text;
}

export function colorOf(root: SceneObject | null, name: string): vec4 {
  const so = child(root, name);
  if (!so) throw new Error("Missing text " + name);
  return (so.getComponent("Component.Text") as Text).textFill.color;
}

export function chipText(slot: string): string | null {
  return textOf(uiRoot(slot), "ChipText");
}

export function chipColor(slot: string): vec4 {
  return colorOf(uiRoot(slot), "ChipText");
}

export function isTagged(slot: string): boolean {
  return child(uiRoot(slot), "Tag") !== null;
}

export function isOn(slot: string): boolean {
  return textOf(child(uiRoot(slot), "Tag"), "ButtonLabel") === "Turn off";
}

export function close(a: vec4, b: vec4): boolean {
  return Math.abs(a.x - b.x) < 0.02 && Math.abs(a.y - b.y) < 0.02 && Math.abs(a.z - b.z) < 0.02;
}

export class LoadWalkLeafInteractor extends DefaultLeafInteractor {
  async scan(slot: string): Promise<void> {
    const station = findInteractableByName(slot);
    if (!station) throw new Error("No interactable for " + slot);
    await this.trigger(station);
    await sleep(400);
  }

  async pick(slot: string, label: string): Promise<void> {
    const btn = findInteractableByName("Btn-" + label, uiRoot(slot), true);
    if (!btn) throw new Error("No picker button " + label + " on " + slot);
    await this.trigger(btn);
    await sleep(400);
  }

  async ensureTagged(slot: string, label: string): Promise<void> {
    if (isTagged(slot)) return;
    await this.scan(slot);
    await this.pick(slot, label);
  }

  async toggle(slot: string): Promise<void> {
    const btn = findInteractableByName("ToggleButton", uiRoot(slot), true);
    if (!btn) throw new Error("No toggle button on " + slot);
    await this.trigger(btn);
    await sleep(400);
  }

  async ensureOff(slot: string): Promise<void> {
    if (isOn(slot)) await this.toggle(slot);
  }

  async ensureOn(slot: string): Promise<void> {
    if (!isOn(slot)) await this.toggle(slot);
  }
}

export const NAMES: Record<string, string> = {
  Fan: "Fan",
  PhoneCharger: "Phone charger",
  PowerBank: "Power bank",
  Laptop: "Laptop",
  Iron: "Iron",
  Freezer: "Freezer",
};

// Bring the room to a known state: the four small loads tagged and switched off.
export async function resetSmallLoads(i: LoadWalkLeafInteractor): Promise<void> {
  for (const slot of ["Iron", "Laptop", "PowerBank", "PhoneCharger", "Fan"]) {
    if (isTagged(slot)) await i.ensureOff(slot);
  }
  for (const slot of ["Fan", "PhoneCharger", "PowerBank", "Laptop"]) {
    await i.ensureTagged(slot, NAMES[slot]);
  }
  await i.ensureTagged("Iron", "Iron");
  await i.ensureOff("Iron");
}

export function meter(name: string): string {
  return textOf(findSceneObjectByName("LoadMeter"), name) ?? "";
}

export async function switchOnSmallLoads(i: LoadWalkLeafInteractor): Promise<void> {
  await resetSmallLoads(i);
  await i.toggle("Fan");
  await i.toggle("PhoneCharger");
  await i.toggle("PowerBank");
  await i.toggle("Laptop");
}

