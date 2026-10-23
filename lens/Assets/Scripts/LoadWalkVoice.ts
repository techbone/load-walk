// Owns: the Voice switch and the speech session. The microphone is open only while Voice is on; every update is
// shown as live words and each final transcript goes to Main, which decides what it means. While Voice is on the
// session is kept alive: it restarts after an error, and after a long stretch with no words (a dropped stream
// sends no signal, so silence is the only sign). Each step is logged: started, final, error, ended.
// Inputs: ui (the Voice button and heard-words view), idleRestartSeconds.
// Must not: parse commands, or touch switches and load. Partial transcripts are shown, never acted on.

import Event, { PublicApi } from "SpectaclesInteractionKit.lspkg/Utils/Event";
import { Level } from "./LoadWalkTheme";
import { LoadWalkVoiceUI, VoiceStatus } from "./LoadWalkVoiceUI";

// The speech service as this script uses it. The real one wraps AsrModule; LEAF swaps in a fake.
export interface Transcriber {
  start(onUpdate: (text: string, isFinal: boolean) => void, onError: (reason: string) => void): void;
  stop(): void;
}

class AsrTranscriber implements Transcriber {
  private asrModule = require("LensStudio:AsrModule");

  start(onUpdate: (text: string, isFinal: boolean) => void, onError: (reason: string) => void): void {
    const options = AsrModule.AsrTranscriptionOptions.create();
    options.mode = AsrModule.AsrMode.HighAccuracy;
    options.silenceUntilTerminationMs = 1000;
    options.onTranscriptionUpdateEvent.add((e: AsrModule.TranscriptionUpdateEvent) => onUpdate(e.text, e.isFinal));
    options.onTranscriptionErrorEvent.add((code: AsrModule.AsrStatusCode) => onError(describe(code)));
    this.asrModule.startTranscribing(options);
  }

  stop(): void {
    this.asrModule.stopTranscribing();
  }
}

function describe(code: AsrModule.AsrStatusCode): string {
  switch (code) {
    case AsrModule.AsrStatusCode.InternalError:
      return "internal error";
    case AsrModule.AsrStatusCode.Unauthenticated:
      return "not signed in";
    case AsrModule.AsrStatusCode.NoInternet:
      return "no internet";
    default:
      return "status code " + code;
  }
}

// Errors this close together mean the service is down, not a dropped stream: stop retrying and say so.
const GIVE_UP_FAILURES = 3;
const GIVE_UP_WINDOW_SECONDS = 60;
const RETRY_SECONDS = 1;
const REFRESH_SECONDS = 0.3;

@component
export class LoadWalkVoice extends BaseScriptComponent {
  // LEAF sets this to a fake so its tests never open the microphone; null means the real speech service.
  static transcriber: Transcriber | null = null;

  @ui.label('<span style="color: #60A5FA;">LoadWalkVoice – speech session behind the Voice switch</span>')
  @ui.separator
  @input
  @hint("Voice button and heard-words view.")
  ui: LoadWalkVoiceUI;
  @input
  @hint("While Voice is on, restart the speech session after this many seconds with no words. A dropped stream gives no error, so this is how it recovers.")
  @widget(new SliderWidget(10, 120, 5))
  idleRestartSeconds: number = 45;

  private real: Transcriber | null = null;
  private _onFinal = new Event<string>();
  private active = false;
  private session = 0; // id of the open session; updates from an older one are ignored
  private open = false;
  private lastHeard = 0;
  private failures: number[] = [];
  private restartEvent: DelayedCallbackEvent;

  get onFinal(): PublicApi<string> {
    return this._onFinal.publicApi();
  }

  // Voice is off until the user turns it on.
  get listening(): boolean {
    return this.active;
  }

  get microphoneOpen(): boolean {
    return this.open;
  }

  // How many sessions have been started since the Lens began; LEAF reads it to see a restart happen.
  get sessionCount(): number {
    return this.session;
  }

  onAwake() {
    this.restartEvent = this.createEvent("DelayedCallbackEvent");
    this.restartEvent.bind(() => this.startSession());
    // Session setup must not happen in onAwake; the button only works after start anyway.
    this.createEvent("OnStartEvent").bind(() => this.ui.onToggle.add(() => this.setActive(!this.active)));
    this.createEvent("UpdateEvent").bind(() => this.watch());
    this.createEvent("OnDestroyEvent").bind(() => this.endSession("Lens closed"));
  }

  // Answer or note shown under the Voice button, in the level's colour.
  say(text: string, level: Level = "idle"): void {
    this.ui.showAnswer(text, level);
  }

  // A transcript as the speech service would deliver it. LEAF calls this; so does the microphone path.
  inject(text: string, isFinal: boolean = true): void {
    this.onTranscript(text, isFinal);
  }

  private setActive(on: boolean): void {
    if (on === this.active) return;
    this.active = on;
    this.failures = [];
    this.restartEvent.enabled = false;
    if (on) {
      this.startSession();
    } else {
      this.endSession("switched off");
      this.show("off");
    }
  }

  private onTranscript(text: string, isFinal: boolean): void {
    if (!this.active) return; // Voice is off, or a late update arrived after it was switched off
    this.lastHeard = getTime();
    if (text.trim() === "") return;
    this.ui.showHeard(text);
    if (!isFinal) return;
    print("[LoadWalk] voice final: " + text);
    this._onFinal.invoke(text);
  }

  // ---- session lifecycle --------------------------------------------------------------------------------
  private transcriberInUse(): Transcriber {
    if (LoadWalkVoice.transcriber) return LoadWalkVoice.transcriber;
    if (!this.real) this.real = new AsrTranscriber();
    return this.real;
  }

  private startSession(): void {
    this.restartEvent.enabled = false;
    if (!this.active || this.open) return;
    const id = ++this.session;
    this.open = true;
    this.lastHeard = getTime();
    try {
      this.transcriberInUse().start(
        (text, isFinal) => {
          if (id === this.session && this.open) this.onTranscript(text, isFinal);
        },
        (reason) => {
          if (id === this.session && this.open) this.onSessionError(reason);
        }
      );
    } catch (e) {
      this.onSessionError("" + e);
      return;
    }
    print("[LoadWalk] voice session " + id + " started");
    this.show("listening");
  }

  private endSession(why: string): void {
    if (!this.open) return;
    this.open = false;
    try {
      this.transcriberInUse().stop();
    } catch (e) {
      print("[LoadWalk] voice stop error: " + e);
    }
    print("[LoadWalk] voice session " + this.session + " ended (" + why + ")");
  }

  // The session failed while Voice is on: start a fresh one, unless it keeps failing.
  private onSessionError(reason: string): void {
    print("[LoadWalk] voice error: " + reason);
    this.endSession("error: " + reason);
    if (!this.active) return;
    const now = getTime();
    this.failures = this.failures.filter((t) => now - t < GIVE_UP_WINDOW_SECONDS);
    this.failures.push(now);
    if (this.failures.length >= GIVE_UP_FAILURES) {
      // Speech is not available (no internet, signed out): say so and drop back to off, so the pinch path is all that is left.
      print("[LoadWalk] voice gave up after " + this.failures.length + " failures");
      this.say("Voice unavailable: " + reason, "overload");
      this.setActive(false);
      return;
    }
    print("[LoadWalk] voice restarting in " + RETRY_SECONDS + " s");
    this.show("restarting");
    this.restartEvent.enabled = true;
    this.restartEvent.reset(RETRY_SECONDS);
  }

  // No words for a long time while on: the stream may have dropped without telling us, so refresh it.
  private watch(): void {
    if (!this.active || !this.open) return;
    if (getTime() - this.lastHeard < this.idleRestartSeconds) return;
    this.endSession("no words for " + this.idleRestartSeconds + " s");
    this.restartEvent.enabled = true;
    this.restartEvent.reset(REFRESH_SECONDS);
  }

  private show(status: VoiceStatus): void {
    this.ui.setStatus(status);
  }
}
