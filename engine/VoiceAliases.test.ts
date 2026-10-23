import { test } from "node:test";
import assert from "node:assert/strict";
import { CATALOG, VOICE_APPLIANCES } from "../lens/Assets/Scripts/ApplianceCatalog.ts";
import { normalize, parseCommand } from "./VoiceCommands.ts";

test("every catalog appliance has voice aliases, including the ones not on the desk", () => {
  assert.deepEqual(VOICE_APPLIANCES.map((a) => a.id), CATALOG.map((s) => s.id));
  for (const a of VOICE_APPLIANCES) assert.ok(a.aliases.length > 0, a.id + " has no aliases");
});

test("each alias turns on its own appliance", () => {
  for (const a of VOICE_APPLIANCES) {
    for (const alias of a.aliases) {
      assert.deepEqual(parseCommand("turn on the " + alias, VOICE_APPLIANCES), { action: "on", applianceId: a.id }, alias);
    }
  }
});

test("no alias belongs to two appliances", () => {
  const owner = new Map<string, string>();
  for (const a of VOICE_APPLIANCES) {
    for (const alias of a.aliases) {
      const key = normalize(alias);
      assert.ok(!owner.has(key) || owner.get(key) === a.id, key + " is claimed by " + owner.get(key) + " and " + a.id);
      owner.set(key, a.id);
    }
  }
});
