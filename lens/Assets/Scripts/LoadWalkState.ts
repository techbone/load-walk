// Owns: which appliances are tagged and switched on, and the live LoadReport.
// Pure logic, no scene access. All load maths is delegated to LoadEngine.ts.

import { evaluate, exceedsAlone, formatHours } from "./LoadEngine";
import type { Appliance, LoadReport } from "./LoadEngine";
import { BATTERY, POWER_STATION, specById } from "./ApplianceCatalog";

export class LoadWalkState {
  // slot = a physical appliance in the room; its tagged spec decides the watts.
  private slots = new Map<string, Appliance>();

  tag(slotId: string, specId: string): Appliance {
    const spec = specById(specId);
    const appliance: Appliance = {
      id: slotId,
      name: spec.name,
      runningW: spec.runningW,
      surgeFactor: spec.surgeFactor,
      on: false,
    };
    this.slots.set(slotId, appliance);
    return appliance;
  }

  isTagged(slotId: string): boolean {
    return this.slots.has(slotId);
  }

  get(slotId: string): Appliance | undefined {
    return this.slots.get(slotId);
  }

  toggle(slotId: string): boolean {
    const a = this.slots.get(slotId);
    if (!a) return false;
    a.on = !a.on;
    return a.on;
  }

  report(): LoadReport {
    return evaluate([...this.slots.values()], POWER_STATION, BATTERY);
  }

  tooBigAlone(slotId: string): boolean {
    const a = this.slots.get(slotId);
    return !!a && exceedsAlone(a, POWER_STATION);
  }

  hoursText(report: LoadReport): string {
    return formatHours(report.batteryHours);
  }
}
