import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCommand, type VoiceAppliance } from "./VoiceCommands.ts";

const appliances: VoiceAppliance[] = [
  { id: "fan", aliases: ["fan"] },
  { id: "phone-charger", aliases: ["phone charger", "phone", "charger"] },
  { id: "power-bank", aliases: ["power bank", "powerbank"] },
  { id: "laptop", aliases: ["laptop", "macbook", "computer", "pc"] },
  { id: "iron", aliases: ["iron", "pressing iron"] },
  { id: "freezer", aliases: ["freezer", "deep freezer"] },
];

const parse = (s: string) => parseCommand(s, appliances);

test("turn on / switch off", () => {
  assert.deepEqual(parse("Turn on the fan"), { action: "on", applianceId: "fan" });
  assert.deepEqual(parse("switch off the laptop"), { action: "off", applianceId: "laptop" });
});

test("Nigerian English: on the fan, off the iron", () => {
  assert.deepEqual(parse("on the fan"), { action: "on", applianceId: "fan" });
  assert.deepEqual(parse("Off the pressing iron abeg"), { action: "off", applianceId: "iron" });
});

test("questions answer, they don't toggle", () => {
  assert.deepEqual(parse("Can I run the iron?"), { action: "ask", applianceId: "iron" });
  assert.deepEqual(parse("is it ok to use the deep freezer"), { action: "ask", applianceId: "freezer" });
});

test("longest alias wins", () => {
  assert.deepEqual(parse("plug in the phone charger"), { action: "on", applianceId: "phone-charger" });
  assert.deepEqual(parse("start the power bank"), { action: "on", applianceId: "power-bank" });
  assert.deepEqual(parse("charge my MacBook"), null); // no on/off/ask verb: do nothing rather than guess
});

test("aliases match whole words only", () => {
  assert.equal(parse("turn on the fantastic lamp"), null);
  assert.deepEqual(parse("turn on the computer"), { action: "on", applianceId: "laptop" });
});

test("unknown appliance or empty transcript does nothing", () => {
  assert.equal(parse("turn on the kettle"), null);
  assert.equal(parse(""), null);
});
