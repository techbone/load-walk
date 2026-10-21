import { test } from "node:test";
import assert from "node:assert/strict";
import { bankWh, capacityW, evaluate, formatHours, usableWh } from "./LoadEngine.ts";
import { DEFAULT_BATTERY, DEFAULT_INVERTER, household } from "./catalog.ts";

const run = (ids: string[]) => evaluate(household(ids), DEFAULT_INVERTER, DEFAULT_BATTERY);

test("2.5 kVA inverter carries 2000 W", () => {
  assert.equal(capacityW(DEFAULT_INVERTER), 2000);
  assert.equal(capacityW({ kva: 1.5 }), 1200);
});

test("2 x 200 Ah 12 V lead-acid is 4800 Wh, 2400 usable", () => {
  assert.equal(bankWh(DEFAULT_BATTERY), 4800);
  assert.equal(usableWh(DEFAULT_BATTERY), 2400);
  assert.equal(usableWh({ ...DEFAULT_BATTERY, chemistry: "lithium" }), 4080);
});

test("nothing on is idle with no battery estimate", () => {
  const r = run([]);
  assert.equal(r.status, "idle");
  assert.equal(r.batteryHours, null);
  assert.equal(formatHours(r.batteryHours), "--");
});

test("evening basics run fine and last hours", () => {
  const r = run(["bulbs", "ceiling-fan", "tv", "decoder", "router"]);
  assert.equal(r.runningW, 237);
  assert.equal(r.status, "ok");
  assert.equal(formatHours(r.batteryHours), "8h 36m");
});

test("fridge surge counted once on top of running load", () => {
  const r = run(["fridge", "freezer", "tv"]);
  assert.equal(r.runningW, 420);
  assert.equal(r.peakW, 420 + 400); // freezer's extra 400 W beats fridge's 300 W
  assert.equal(r.status, "ok");
});

test("running fits but a motor start would trip it", () => {
  const r = run(["iron", "freezer", "fridge", "tv"]);
  assert.equal(r.runningW, 1520);
  assert.equal(r.peakW, 1920);
  assert.equal(r.status, "ok"); // 76% of capacity, peak still fits

  const s = run(["iron", "freezer", "fridge", "tv", "laptop", "ceiling-fan"]);
  assert.equal(s.runningW, 1660);
  assert.equal(s.peakW, 2060);
  assert.equal(s.status, "surge-risk");
  assert.deepEqual(s.culpritIds, ["freezer"]);
});

test("overload names the fewest appliances to switch off", () => {
  const r = run(["kettle", "iron", "tv"]);
  assert.equal(r.status, "overload");
  assert.equal(r.headroomW, 2000 - 2970);
  assert.deepEqual(r.culpritIds, ["kettle"]);
});

test("near threshold at 80% of capacity", () => {
  const r = run(["microwave", "pump"]);
  assert.equal(r.runningW, 1750);
  assert.equal(r.status, "surge-risk"); // pump start pushes peak to 3250 W
  const n = evaluate(
    [{ id: "load", name: "Load", runningW: 1600, surgeFactor: 1, on: true }],
    DEFAULT_INVERTER,
    DEFAULT_BATTERY,
  );
  assert.equal(n.status, "near");
});

test("formatHours", () => {
  assert.equal(formatHours(3 + 40 / 60), "3h 40m");
  assert.equal(formatHours(0.5), "30m");
});
