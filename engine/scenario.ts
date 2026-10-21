// Walks the demo story through the engine and prints what the Lens would show.
// `npm run scenario` writes this to docs/evidence/engine-scenario.txt.

import { evaluate, formatHours } from "./LoadEngine.ts";
import { DEFAULT_BATTERY, DEFAULT_INVERTER, household } from "./catalog.ts";

const steps: [string, string[]][] = [
  ["Power cut. Evening basics on", ["bulbs", "ceiling-fan", "tv", "decoder", "router"]],
  ["Add the deep freezer", ["bulbs", "ceiling-fan", "tv", "decoder", "router", "freezer"]],
  ["Add the pressing iron", ["bulbs", "ceiling-fan", "tv", "decoder", "router", "freezer", "iron"]],
  ["Someone puts the kettle on", ["bulbs", "ceiling-fan", "tv", "decoder", "router", "freezer", "iron", "kettle"]],
  ["Kettle off, iron later", ["bulbs", "ceiling-fan", "tv", "decoder", "router", "freezer"]],
];

console.log(`Inverter ${DEFAULT_INVERTER.kva} kVA · battery 2 x 200 Ah 12 V lead-acid\n`);
for (const [label, ids] of steps) {
  const r = evaluate(household(ids), DEFAULT_INVERTER, DEFAULT_BATTERY);
  const culprits = r.culpritIds.length ? ` · switch off: ${r.culpritIds.join(", ")}` : "";
  console.log(
    `${label.padEnd(32)} ${String(r.runningW).padStart(5)} W run · ${String(r.peakW).padStart(5)} W peak / ${r.capacityW} W · ${r.status.padEnd(10)} · ${formatHours(r.batteryHours)}${culprits}`,
  );
}
