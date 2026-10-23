// Turns a speech transcript into a Load Walk action. No platform APIs, so the
// Lens and `node --test` share it. Every command has a pinch equivalent.

export type VoiceAppliance = { id: string; aliases: string[] };

export type Command =
  | { action: "on"; applianceId: string }
  | { action: "off"; applianceId: string }
  | { action: "ask"; applianceId: string }; // "can I run the iron?"

const ASK = /\b(can i|could i|will it|is it ok to|is it safe to|should i)\b/;
// "on the fan" / "off the light" is everyday Nigerian English, alongside "turn on" / "switch off".
const OFF = /\b(off|stop|kill)\b/;
const ON = /\b(on|start|run|use|plug in)\b/;

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Longest alias wins, so "phone charger" beats "phone" and "power bank" beats "bank".
export function findAppliance(text: string, appliances: VoiceAppliance[]): string | null {
  const said = ` ${normalize(text)} `;
  let best: { id: string; length: number } | null = null;
  for (const a of appliances) {
    for (const alias of a.aliases) {
      const needle = ` ${normalize(alias)} `;
      if (said.includes(needle) && (!best || needle.length > best.length)) {
        best = { id: a.id, length: needle.length };
      }
    }
  }
  return best ? best.id : null;
}

export function parseCommand(transcript: string, appliances: VoiceAppliance[]): Command | null {
  const said = normalize(transcript);
  const applianceId = findAppliance(said, appliances);
  if (!applianceId) return null;
  if (ASK.test(said)) return { action: "ask", applianceId };
  if (OFF.test(said)) return { action: "off", applianceId };
  if (ON.test(said)) return { action: "on", applianceId };
  return null;
}
