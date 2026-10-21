import { test } from "node:test";
import assert from "node:assert/strict";
import { capacityW, evaluate, exceedsAlone, formatHours, usableWh } from "./LoadEngine.ts";
import { BATTERY, CATALOG, POWER_STATION, household } from "./catalog.ts";

const run = (ids: string[]) => evaluate(household(ids), POWER_STATION, BATTERY);

test("power station capacity is its rated watts; a kVA inverter derives from power factor", () => {
  assert.equal(capacityW(POWER_STATION), 200);
  assert.equal(capacityW({ kva: 2.5 }), 2000);
});

test("1 kWh LiFePO4 gives 850 usable Wh; lead-acid halves it", () => {
  assert.equal(usableWh(BATTERY), 850);
  assert.equal(usableWh({ wh: 1000, chemistry: "lead-acid" }), 500);
});

test("nothing on is idle with no battery estimate", () => {
  const r = run([]);
  assert.equal(r.status, "idle");
  assert.equal(formatHours(r.batteryHours), "--");
});

// Done criterion 1: scan tag flags what can't run alone, before any toggle.
test("freezer and iron exceed the unit alone; the desk basics don't", () => {
  const spec = (id: string) => CATALOG.find((a) => a.id === id)!;
  assert.equal(exceedsAlone(spec("freezer"), POWER_STATION), true);
  assert.equal(exceedsAlone(spec("iron"), POWER_STATION), true);
  assert.equal(exceedsAlone(spec("laptop"), POWER_STATION), false);
  assert.equal(exceedsAlone(spec("fan"), POWER_STATION), false);
});

// Done criterion 2: chip text at each step.
test("charging build-up: fan, phone, power bank, laptop", () => {
  const steps: [string[], number, string][] = [
    [["fan"], 12, "60h 13m"],
    [["fan", "phone-charger"], 24, "30h 6m"],
    [["fan", "phone-charger", "power-bank"], 42, "17h 12m"],
    [["fan", "phone-charger", "power-bank", "laptop"], 182, "3h 58m"],
  ];
  for (const [ids, watts, hours] of steps) {
    const r = run(ids);
    assert.equal(r.runningW, watts);
    assert.equal(formatHours(r.batteryHours), hours);
  }
});

// Done criterion 3: meter at the power station.
test("full desk is near the limit at 182 of 200 W", () => {
  const r = run(["fan", "phone-charger", "power-bank", "laptop"]);
  assert.equal(r.status, "near");
  assert.equal(r.headroomW, 18);
  assert.deepEqual(r.culpritIds, []);
});

// Done criterion 4: the iron alone is over the limit by running watts, not surge.
test("iron on top of the desk overloads at 1,282 W and drops the hours figure", () => {
  const r = run(["fan", "phone-charger", "power-bank", "laptop", "iron"]);
  assert.equal(r.runningW, 1282);
  assert.equal(r.status, "overload");
  assert.equal(r.batteryHours, null);
  assert.deepEqual(r.culpritIds, ["iron"]);
});

test("iron alone overloads", () => {
  const r = run(["iron"]);
  assert.equal(r.status, "overload");
  assert.deepEqual(r.culpritIds, ["iron"]);
});

// Done criterion 5: recovery returns to the earlier numbers exactly.
test("switching the iron off restores 182 W and 3h 58m", () => {
  const before = run(["fan", "phone-charger", "power-bank", "laptop"]);
  const after = run(["fan", "phone-charger", "power-bank", "laptop", "iron"]);
  const recovered = run(["fan", "phone-charger", "power-bank", "laptop"]);
  assert.equal(after.status, "overload");
  assert.deepEqual(recovered, before);
  assert.equal(formatHours(recovered.batteryHours), "3h 58m");
});

test("surge risk: running load fits but the biggest motor start would trip it", () => {
  const r = evaluate(
    [
      { id: "a", name: "A", runningW: 100, surgeFactor: 1, on: true },
      { id: "m", name: "Motor", runningW: 60, surgeFactor: 3, on: true },
    ],
    POWER_STATION,
    BATTERY,
  );
  assert.equal(r.runningW, 160);
  assert.equal(r.peakW, 280);
  assert.equal(r.status, "surge-risk");
  assert.deepEqual(r.culpritIds, ["m"]);
});

test("formatHours", () => {
  assert.equal(formatHours(3 + 40 / 60), "3h 40m");
  assert.equal(formatHours(0.5), "30m");
});
