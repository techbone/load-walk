// Load maths for Load Walk. No Lens Studio or Node APIs, so the same file
// runs in the Lens and under `node --test`.

export type Chemistry = "lead-acid" | "lithium";

export type Appliance = {
  id: string;
  name: string;
  runningW: number;
  surgeFactor: number; // startup draw as a multiple of runningW; 1 = no surge
  on: boolean;
};

export type Inverter = { kva: number; powerFactor?: number };

export type Battery = { voltage: number; ampHours: number; count: number; chemistry: Chemistry };

export type Status = "idle" | "ok" | "near" | "surge-risk" | "overload";

export type LoadReport = {
  runningW: number;
  peakW: number; // running load plus the single largest startup surge
  capacityW: number;
  headroomW: number;
  utilization: number; // runningW / capacityW
  status: Status;
  culpritIds: string[]; // what to switch off to get back within capacity
  batteryHours: number | null; // null when nothing is on
};

export const INVERTER_EFFICIENCY = 0.85;
export const NEAR_THRESHOLD = 0.8;

const DEPTH_OF_DISCHARGE: Record<Chemistry, number> = { "lead-acid": 0.5, lithium: 0.85 };

export function capacityW(inverter: Inverter): number {
  return Math.round(inverter.kva * 1000 * (inverter.powerFactor ?? 0.8));
}

export function bankWh(battery: Battery): number {
  return battery.voltage * battery.ampHours * battery.count;
}

export function usableWh(battery: Battery): number {
  return bankWh(battery) * DEPTH_OF_DISCHARGE[battery.chemistry];
}

function surgeExtraW(a: Appliance): number {
  return a.runningW * Math.max(0, a.surgeFactor - 1);
}

export function evaluate(appliances: Appliance[], inverter: Inverter, battery: Battery): LoadReport {
  const on = appliances.filter((a) => a.on);
  const runningW = on.reduce((sum, a) => sum + a.runningW, 0);
  // Motors rarely start at the same instant, so only the largest surge counts.
  const biggestSurge = on.reduce((max, a) => (surgeExtraW(a) > surgeExtraW(max) ? a : max), on[0]);
  const peakW = runningW + (biggestSurge ? surgeExtraW(biggestSurge) : 0);
  const cap = capacityW(inverter);

  let status: Status;
  let culpritIds: string[] = [];
  if (on.length === 0) {
    status = "idle";
  } else if (runningW > cap) {
    status = "overload";
    culpritIds = shedUntilFits(on, cap);
  } else if (peakW > cap) {
    status = "surge-risk";
    culpritIds = [biggestSurge.id];
  } else {
    status = runningW / cap >= NEAR_THRESHOLD ? "near" : "ok";
  }

  return {
    runningW,
    peakW,
    capacityW: cap,
    headroomW: cap - runningW,
    utilization: cap > 0 ? runningW / cap : 0,
    status,
    culpritIds,
    batteryHours: runningW > 0 ? (usableWh(battery) * INVERTER_EFFICIENCY) / runningW : null,
  };
}

// Biggest loads first: the fewest switches that bring the running load back under capacity.
function shedUntilFits(on: Appliance[], cap: number): string[] {
  const byLoad = [...on].sort((a, b) => b.runningW - a.runningW);
  let load = on.reduce((sum, a) => sum + a.runningW, 0);
  const shed: string[] = [];
  for (const a of byLoad) {
    if (load <= cap) break;
    shed.push(a.id);
    load -= a.runningW;
  }
  return shed;
}

export function formatHours(hours: number | null): string {
  if (hours === null) return "--";
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
