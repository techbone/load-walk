// Owns: the Voice switch and the speech session. The microphone is open only while Voice is on; every update is
// shown as live words and each final transcript goes to Main, which decides what it means.
// Inputs: ui (the Voice button and heard-words view).
// Must not: parse commands, or touch switches and load. Partial transcripts are shown, never acted on.

import Event, { PublicApi } from "SpectaclesInteractionKit.lspkg/Utils/Event";
import { Level } from "./LoadWalkTheme";
import { LoadWalkVoiceUI } from "./LoadWalkVoiceUI";

@component
export class LoadWalkVoice extends BaseScriptComponent {
  // LEAF sets this so its tests drive Voice with injected transcripts and never open the microphone.
  static skipMicrophone = false;

  @ui.label('<span style="color: #60A5FA;">LoadWalkVoice – speech session behind the Voice switch</span>')
  @ui.separator
  @input
  @hint("Voice button and heard-words view.")
  ui: LoadWalkVoiceUI;

  private asrModule = require("LensStudio:AsrModule");
  private _onFinal = new Event<string>();
  private active = false;
  private micOpen = false;

  get onFinal(): PublicApi<string> {
    return this._onFinal.publicApi();
  }

  // Voice is off until the user turns it on.
  get listening(): boolean {
    return this.active;
  }

  get microphoneOpen(): boolean {
    return this.micOpen;
  }

  onAwake() {
    // Session setup must not happen in onAwake; the button only works after start anyway.
    this.createEvent("OnStartEvent").bind(() => this.ui.onToggle.add(() => this.setActive(!this.active)));
    this.createEvent("OnDestroyEvent").bind(() => this.stopMicrophone());
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
    this.ui.setListening(on);
    if (on) this.startMicrophone();
    else this.stopMicrophone();
  }

  private onTranscript(text: string, isFinal: boolean): void {
    if (!this.active) return; // Voice is off, or a late update arrived after it was switched off
    if (text.trim() === "") return;
    this.ui.showHeard(text);
    if (isFinal) this._onFinal.invoke(text);
  }

  private startMicrophone(): void {
    if (LoadWalkVoice.skipMicrophone) return;
    try {
      const options = AsrModule.AsrTranscriptionOptions.create();
      options.mode = AsrModule.AsrMode.HighAccuracy;
      options.silenceUntilTerminationMs = 1000;
      options.onTranscriptionUpdateEvent.add((e: AsrModule.TranscriptionUpdateEvent) => this.onTranscript(e.text, e.isFinal));
      options.onTranscriptionErrorEvent.add((code: AsrModule.AsrStatusCode) => this.fail(this.describe(code)));
      this.asrModule.startTranscribing(options);
      this.micOpen = true;
      print("[LoadWalk] voice listening");
    } catch (e) {
      this.fail("" + e);
    }
  }

  private stopMicrophone(): void {
    if (!this.micOpen) return;
    this.micOpen = false;
    try {
      this.asrModule.stopTranscribing();
    } catch (e) {
      print("[LoadWalk] voice stop error: " + e);
    }
  }

  // Speech is not available (no internet, signed out): say so and drop back to off, so the pinch path is all that is left.
  private fail(reason: string): void {
    print("[LoadWalk] voice error: " + reason);
    this.say("Voice unavailable: " + reason, "overload");
    this.setActive(false);
  }

  private describe(code: AsrModule.AsrStatusCode): string {
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
}
