// Demo appliances and the power station, from design-brief.md.
// Estimates are marked; real nameplates win. Sources: docs/research.md.

import type { Appliance, Battery, Inverter } from "./LoadEngine.ts";

export type ApplianceSpec = Omit<Appliance, "on"> & { estimate?: boolean };

export const CATALOG: ApplianceSpec[] = [
  { id: "fan", name: "Fan", runningW: 12, surgeFactor: 1 },
  { id: "phone-charger", name: "Phone charger", runningW: 12, surgeFactor: 1, estimate: true },
  { id: "power-bank", name: "Power bank", runningW: 18, surgeFactor: 1, estimate: true },
  { id: "laptop", name: "Laptop", runningW: 140, surgeFactor: 1 }, // adapter maximum, not typical draw
  { id: "freezer", name: "Freezer", runningW: 350, surgeFactor: 3 },
  { id: "fridge", name: "Fridge", runningW: 150, surgeFactor: 3 },
  { id: "pump", name: "Water pump", runningW: 750, surgeFactor: 3 },
  { id: "iron", name: "Iron", runningW: 1100, surgeFactor: 1, estimate: true }, // trips on running watts alone
  { id: "kettle", name: "Kettle", runningW: 1800, surgeFactor: 1 },
  { id: "microwave", name: "Microwave", runningW: 1000, surgeFactor: 1 },
];

// Home Power Dock HeroEE 1: 200 W rated output, 1 kWh LiFePO4 (label).
export const POWER_STATION: Inverter = { ratedW: 200 };
export const BATTERY: Battery = { wh: 1000, chemistry: "lithium" };

export function household(onIds: string[] = []): Appliance[] {
  return CATALOG.map(({ estimate: _estimate, ...spec }) => ({ ...spec, on: onIds.includes(spec.id) }));
}
