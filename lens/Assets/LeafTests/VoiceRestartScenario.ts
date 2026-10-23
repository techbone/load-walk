import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { sleep } from "Leaf.lspkg/Utils/common/Utils";
import { LoadWalkLeafInteractor, fakeMic, voice, voiceOff, voiceOn, voiceUI } from "./LoadWalkLeafInteractor";

// Hand-test bug: the speech stream dropped and Voice stayed "on" while hearing nothing. While Voice is on the
// session restarts after an error and after a long silence; the toggle says "Voice: listening" while it is live;
// errors in a row give up and switch Voice off with the reason. Runs on a fake speech service, no microphone.
@component
export class VoiceRestartScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    const v = voice();
    const idle = v.idleRestartSeconds;
    await voiceOn(i);
    try {
      const first = v.sessionCount;
      expect(voiceUI().listeningText).toBe("Voice: listening");
      expect(v.microphoneOpen).toBe(true);

      // The service drops the session: it says so, then starts a new one by itself.
      fakeMic.drop("internal error");
      expect(voiceUI().listeningText).toBe("Voice: restarting");
      expect(v.microphoneOpen).toBe(false);
      await sleep(1500);
      expect(v.sessionCount).toBe(first + 1);
      expect(voiceUI().listeningText).toBe("Voice: listening");
      expect(v.listening).toBe(true);

      // Words on the new session still reach Main.
      fakeMic.hear("On the fan.");
      await sleep(300);
      expect(voiceUI().heardText).toBe("On the fan.");
      expect(voiceUI().answerText).toBe("Fan is not scanned. Pinch it first.");

      // A long silence refreshes the session, since a dropped stream sends no error.
      v.idleRestartSeconds = 2;
      await sleep(3000);
      expect(v.sessionCount).toBe(first + 2);
      expect(voiceUI().listeningText).toBe("Voice: listening");
      v.idleRestartSeconds = 60;

      // Errors in a row mean the service is down: stop retrying, switch off, say why.
      fakeMic.drop("no internet");
      await sleep(1500);
      fakeMic.drop("no internet");
      await sleep(300);
      expect(v.listening).toBe(false);
      expect(voiceUI().listeningText).toBe("Voice: off");
      expect(voiceUI().answerText).toBe("Voice unavailable: no internet");
    } finally {
      v.idleRestartSeconds = idle;
      await voiceOff(i);
    }
  }
}
