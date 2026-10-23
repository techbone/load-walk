// Owns: the Load Walk demo data (appliance list, picker groups, the 200 W / 1,000 Wh power station).
// Imports the load maths from LoadEngine.ts; never reimplements it.
// Values come from devpost/design-brief.md. Rows marked notInBrief are values the brief does not give.

import type { Appliance, Battery, Inverter } from "./LoadEngine";
import type { VoiceAppliance } from "./VoiceCommands";

export type ApplianceSpec = Omit<Appliance, "on"> & {
  estimate?: boolean; // shown as "(estimate)" on the tag
  note?: string; // extra plain-language caveat shown on the tag
  notInBrief?: boolean; // wattage not stated in the brief (taken from engine/catalog.ts / docs/research.md)
  aliases: string[]; // what people say for it; the voice parser matches the longest, whole words only
};

export const CATALOG: ApplianceSpec[] = [
  { id: "fan", name: "Fan", runningW: 12, surgeFactor: 1, aliases: ["fan", "standing fan", "table fan"] },
  { id: "phone-charger", name: "Phone charger", runningW: 12, surgeFactor: 1, aliases: ["phone charger", "phone"] },
  { id: "power-bank", name: "Power bank", runningW: 18, surgeFactor: 1, estimate: true, aliases: ["power bank", "powerbank"] },
  { id: "laptop", name: "Laptop", runningW: 140, surgeFactor: 1, note: "Adapter max", aliases: ["laptop", "laptop charger", "macbook", "computer", "pc"] },
  { id: "freezer", name: "Freezer", runningW: 350, surgeFactor: 3, aliases: ["freezer", "deep freezer"] },
  { id: "fridge", name: "Fridge", runningW: 150, surgeFactor: 3, estimate: true, notInBrief: true, aliases: ["fridge", "refrigerator"] },
  { id: "pump", name: "Water pump", runningW: 750, surgeFactor: 3, estimate: true, notInBrief: true, aliases: ["water pump", "pump", "pumping machine"] },
  { id: "iron", name: "Iron", runningW: 1100, surgeFactor: 1, estimate: true, aliases: ["iron", "pressing iron"] }, // trips on running watts alone
  { id: "kettle", name: "Kettle", runningW: 1800, surgeFactor: 1, estimate: true, notInBrief: true, aliases: ["kettle", "electric kettle"] },
  { id: "microwave", name: "Microwave", runningW: 1000, surgeFactor: 1, estimate: true, notInBrief: true, aliases: ["microwave", "microwave oven"] },
];

// Scan stand-in: the buttons offered when you pinch each appliance. Exactly the brief's groups;
// the real appliance is always first in its own list.
export const PICKER_GROUPS: Record<string, string[]> = {
  freezer: ["freezer", "fridge", "pump"],
  fridge: ["fridge", "freezer", "pump"],
  pump: ["pump", "freezer", "fridge"],
  fan: ["fan", "phone-charger", "power-bank"],
  "phone-charger": ["phone-charger", "fan", "power-bank"],
  "power-bank": ["power-bank", "phone-charger", "fan"],
  laptop: ["laptop", "phone-charger", "power-bank", "fan"],
  iron: ["iron", "kettle", "microwave"],
};

// Home Power Dock HeroEE 1: 200 W rated output, 1,000 Wh lithium.
export const POWER_STATION: Inverter = { ratedW: 200 };
export const BATTERY: Battery = { wh: 1000, chemistry: "lithium" };

// What the voice parser searches: every catalog entry, including the ones with no stand-in in the room.
export const VOICE_APPLIANCES: VoiceAppliance[] = CATALOG.map((s) => ({ id: s.id, aliases: s.aliases }));

export function specById(id: string): ApplianceSpec {
  const spec = CATALOG.find((s) => s.id === id);
  if (!spec) throw new Error("Unknown appliance id: " + id);
  return spec;
}
