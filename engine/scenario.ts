// Walks the demo story through the engine and prints what the Lens would show.
// `npm run scenario` writes this to docs/evidence/engine-scenario.txt.

import { evaluate, exceedsAlone, formatHours } from "./LoadEngine.ts";
import { BATTERY, CATALOG, POWER_STATION, household } from "./catalog.ts";

const desk = ["fan", "phone-charger", "power-bank", "laptop"];
const steps: [string, string[]][] = [
  ["Fan", ["fan"]],
  ["+ phone charger", ["fan", "phone-charger"]],
  ["+ power bank", ["fan", "phone-charger", "power-bank"]],
  ["+ laptop", desk],
  ["+ iron", [...desk, "iron"]],
  ["Iron off", desk],
];

console.log("Home Power Dock HeroEE 1 · 200 W · 1 kWh LiFePO4\n");
console.log("Scan tags (fits alone?)");
for (const id of ["freezer", "iron", "laptop", "fan"]) {
  const a = CATALOG.find((c) => c.id === id)!;
  console.log(`  ${a.name.padEnd(14)} ${String(a.runningW).padStart(5)} W · ${exceedsAlone(a, POWER_STATION) ? "too big for this unit alone" : "fits"}`);
}

console.log("\nToggle sequence");
for (const [label, ids] of steps) {
  const r = evaluate(household(ids), POWER_STATION, BATTERY);
  const culprits = r.culpritIds.length ? ` · switch off: ${r.culpritIds.join(", ")}` : "";
  console.log(
    `  ${label.padEnd(16)} ${String(r.runningW).padStart(5)} W / ${r.capacityW} W · ${r.status.padEnd(8)} · ${formatHours(r.batteryHours).padStart(7)}${culprits}`,
  );
}
