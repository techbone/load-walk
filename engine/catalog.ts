// Typical ratings for a Nigerian home. Estimates; real nameplates win.
// Sources and caveats: docs/research.md.

import type { Appliance, Battery, Inverter } from "./LoadEngine.ts";

export type ApplianceSpec = Omit<Appliance, "on">;

export const CATALOG: ApplianceSpec[] = [
  { id: "bulbs", name: "LED bulbs (x6)", runningW: 60, surgeFactor: 1 },
  { id: "ceiling-fan", name: "Ceiling fan", runningW: 75, surgeFactor: 1 },
  { id: "tv", name: "TV", runningW: 70, surgeFactor: 1 },
  { id: "decoder", name: "Decoder", runningW: 20, surgeFactor: 1 },
  { id: "router", name: "Wi-Fi router", runningW: 12, surgeFactor: 1 },
  { id: "laptop", name: "Laptop", runningW: 65, surgeFactor: 1 },
  { id: "fridge", name: "Fridge", runningW: 150, surgeFactor: 3 },
  { id: "freezer", name: "Deep freezer", runningW: 200, surgeFactor: 3 },
  { id: "pump", name: "Water pump (1 HP)", runningW: 750, surgeFactor: 3 },
  { id: "ac", name: "Split AC (1 HP)", runningW: 900, surgeFactor: 2.5 },
  { id: "iron", name: "Pressing iron", runningW: 1100, surgeFactor: 1 },
  { id: "microwave", name: "Microwave", runningW: 1000, surgeFactor: 1 },
  { id: "kettle", name: "Electric kettle", runningW: 1800, surgeFactor: 1 },
];

// A common setup: 2.5 kVA inverter on a 24 V bank of two 200 Ah lead-acid batteries.
export const DEFAULT_INVERTER: Inverter = { kva: 2.5 };
export const DEFAULT_BATTERY: Battery = { voltage: 12, ampHours: 200, count: 2, chemistry: "lead-acid" };

export function household(onIds: string[] = []): Appliance[] {
  return CATALOG.map((spec) => ({ ...spec, on: onIds.includes(spec.id) }));
}
