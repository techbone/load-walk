// LEAF helpers for Load Walk: drive the scan card and toggle buttons, and read the UI text back.
// Scenarios are independent: each helper reads current state first and only acts when needed.

import { DefaultLeafInteractor } from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor";
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils";
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { LoadWalkStation } from "../Scripts/LoadWalkStation";
import { LoadWalkStationUI } from "../Scripts/LoadWalkStationUI";
import { LoadWalkVoice } from "../Scripts/LoadWalkVoice";
import { LoadWalkVoiceUI } from "../Scripts/LoadWalkVoiceUI";
import type { Level } from "../Scripts/LoadWalkTheme";

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

// The chip shows the load on one line and the battery time on a second; joined here so the brief's wording is testable.
export function chipText(slot: string): string | null {
  const load = textOf(uiRoot(slot), "ChipText");
  const hours = textOf(uiRoot(slot), "ChipHours");
  if (load === null) return null;
  return hours === null ? load : load + " · " + hours.replace(/ left$/, "");
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
    expectCardNear(slot);
    await this.pick(slot, label);
    expectTagNear(slot);
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


// ---- placement measurements ------------------------------------------------------------------------------
// Distance from a point to the appliance's bounding box (0 when inside).
export function distanceToAppliance(slot: string, point: vec3): number {
  const so = findSceneObjectByName(slot)!;
  const c = so.getTransform().getWorldPosition();
  const size = (so.getComponent(LoadWalkStation.getTypeName()) as LoadWalkStation).sizeCm;
  const dx = Math.max(Math.abs(point.x - c.x) - size.x / 2, 0);
  const dy = Math.max(Math.abs(point.y - c.y) - size.y / 2, 0);
  const dz = Math.max(Math.abs(point.z - c.z) - size.z / 2, 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export const MAX_PANEL_DISTANCE_CM = 20;
// The laptop tag was raised 10 cm so it clears the lid; its centre is now about 26 cm from the laptop.
const TAG_DISTANCE_CM: Record<string, number> = { Laptop: 30 };

function panelDistance(slot: string, panelName: string): number {
  const panel = child(uiRoot(slot), panelName);
  if (!panel) throw new Error(slot + " has no " + panelName);
  const d = distanceToAppliance(slot, panel.getTransform().getWorldPosition());
  print("[LEAF-MEASURE] " + panelName + " " + slot + " centre is " + d.toFixed(1) + " cm from the appliance");
  return d;
}

export function expectTagNear(slot: string): void {
  expect(panelDistance(slot, "Tag") <= (TAG_DISTANCE_CM[slot] ?? MAX_PANEL_DISTANCE_CM)).toBe(true);
}

export function expectCardNear(slot: string): void {
  expect(panelDistance(slot, "ScanCard") <= MAX_PANEL_DISTANCE_CM).toBe(true);
}

// Highest point of every mesh under a scene object.
export function topOf(root: SceneObject): number {
  let top = -1e9;
  const walk = (so: SceneObject) => {
    const rmv = so.getComponent("Component.RenderMeshVisual") as RenderMeshVisual | null;
    if (rmv) top = Math.max(top, rmv.worldAabbMax().y);
    for (let i = 0; i < so.getChildrenCount(); i++) walk(so.getChild(i));
  };
  walk(root);
  return top;
}

export function glowing(slot: string): boolean {
  return (findSceneObjectByName(slot)!.getComponent(LoadWalkStation.getTypeName()) as LoadWalkStation).isGlowing;
}


// ---- voice ------------------------------------------------------------------------------------------------
// Scenarios inject transcript text, so they never need a microphone.
export function voice(): LoadWalkVoice {
  return findSceneObjectByName("VoiceControl")!.getComponent(LoadWalkVoice.getTypeName()) as LoadWalkVoice;
}

export function voiceUI(): LoadWalkVoiceUI {
  return findSceneObjectByName("VoiceControl")!.getComponent(LoadWalkVoiceUI.getTypeName()) as LoadWalkVoiceUI;
}

async function pressVoiceToggle(i: LoadWalkLeafInteractor): Promise<void> {
  const btn = findInteractableByName("VoiceToggle", findSceneObjectByName("VoiceControl")!, true);
  if (!btn) throw new Error("No Voice toggle button");
  await i.trigger(btn);
  await sleep(400);
}

// Press the real Voice button; with skipMicrophone set it switches Voice on without opening the microphone.
export async function voiceOn(i: LoadWalkLeafInteractor): Promise<void> {
  LoadWalkVoice.skipMicrophone = true;
  if (!voice().listening) await pressVoiceToggle(i);
}

export async function voiceOff(i: LoadWalkLeafInteractor): Promise<void> {
  if (voice().listening) await pressVoiceToggle(i);
  LoadWalkVoice.skipMicrophone = false;
}

export async function say(text: string, isFinal: boolean = true): Promise<void> {
  voice().inject(text, isFinal);
  await sleep(400);
}

// The level a tag is currently highlighted in after a "can I run" question, or null.
export function highlighted(slot: string): Level | null {
  return (uiRoot(slot).getComponent(LoadWalkStationUI.getTypeName()) as LoadWalkStationUI).highlightedLevel;
}

export function tagNotes(slot: string): string[] {
  const notes: string[] = [];
  for (const name of ["TagNote", "TagNote2", "TagNote3"]) {
    const t = textOf(child(uiRoot(slot), "Tag"), name);
    if (t !== null) notes.push(t);
  }
  return notes;
}
