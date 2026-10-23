// Owns: the Load Walk flow -- scan, tag, toggle, live load, overload alert and recovery.
// Inputs: meter, arrow, hint UI modules; chime audio; chipSeconds.
// Must not: render text or build UI (UI modules do); reimplement load maths (LoadEngine does).

import { capacityW } from "./LoadEngine";
import type { LoadReport } from "./LoadEngine";
import { POWER_STATION, PICKER_GROUPS, specById } from "./ApplianceCatalog";
import { LoadWalkState } from "./LoadWalkState";
import { LoadWalkStation } from "./LoadWalkStation";
import { LoadWalkMeterUI } from "./LoadWalkMeterUI";
import { LoadWalkArrowUI } from "./LoadWalkArrowUI";
import { LoadWalkHintUI } from "./LoadWalkHintUI";
import { Level, fmtNum, fmtW } from "./LoadWalkTheme";
import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider";

@component
export class LoadWalkMain extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">LoadWalkMain – scan, toggle, live load, overload</span>')
  @ui.separator
  @ui.group_start("References")
  @input
  @hint("Load meter floating above the power station.")
  meter: LoadWalkMeterUI;
  @input
  @hint("Out-of-view arrow.")
  arrow: LoadWalkArrowUI;
  @input
  @hint("Note that the scan is a stand-in.")
  hint: LoadWalkHintUI;
  @input
  @hint("Plays on the instant a toggle overloads the unit.")
  chime: AudioComponent;
  @ui.group_end
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("How long the live load chip stays before it fades, in seconds.")
  @widget(new SliderWidget(1, 10, 0.5))
  chipSeconds: number = 4;
  @input
  @hint("Place the whole room in front of wherever the user starts (the preview camera does not start at the world origin). Turn off to keep the room at the origin.")
  placeRoomAtUserStart: boolean = true;
  @input
  @hint("Extra offset of the room from where the user starts, in cm (x right, y up, z back). Push the room away to see more of it at once.")
  roomOffsetCm: vec3 = new vec3(0, 0, 0);
  @input
  @hint("Horizontal half-angle of the view in degrees; a culprit outside it gets the arrow.")
  @widget(new SliderWidget(10, 40, 1))
  viewHalfWidthDeg: number = 18;
  @input
  @hint("Vertical half-angle of the view in degrees.")
  @widget(new SliderWidget(10, 40, 1))
  viewHalfHeightDeg: number = 16;
  @ui.group_end

  private state = new LoadWalkState();
  private stations: LoadWalkStation[] = [];
  private lastLevel: Level = "idle";
  private culprits: string[] = [];

  onAwake() {
    this.chime.playbackMode = Audio.PlaybackMode.LowLatency;
    this.createEvent("OnStartEvent").bind(() => this.start());
    this.createEvent("UpdateEvent").bind(() => this.updateArrow());
  }

  private start(): void {
    if (this.placeRoomAtUserStart) this.placeRoom();
    // The registry is module-level and survives Lens resets, so keep only stations that live under this Main.
    this.stations = LoadWalkStation.all.filter((s) => !isNull(s) && !isNull(s.sceneObject) && this.owns(s.sceneObject));
    for (const s of this.stations) {
      s.onScan.add(() => this.onScan(s));
      s.ui.onPick.add((id) => this.onPick(s, id));
      s.ui.onToggle.add(() => this.onToggle(s));
    }
    this.render(null);
    print("[LoadWalk] ready, stations: " + this.stations.map((s) => s.slotId).join(", "));
  }

  private owns(so: SceneObject): boolean {
    let p: SceneObject | null = so;
    while (p) {
      if (p.isSame(this.sceneObject)) return true;
      p = p.hasParent() ? p.getParent() : null;
    }
    return false;
  }

  // The room is authored 1.1 m in front of the origin. Carry it to where the user actually starts, facing the way they face.
  private placeRoom(): void {
    const cam = WorldCameraFinderProvider.getInstance().getTransform();
    const pos = cam.getWorldPosition();
    const fwd = cam.getWorldRotation().multiplyVec3(new vec3(0, 0, -1));
    const yaw = Math.atan2(-fwd.x, -fwd.z);
    const t = this.sceneObject.getTransform();
    const rot = quat.angleAxis(yaw, vec3.up());
    t.setWorldPosition(new vec3(pos.x, 0, pos.z).add(rot.multiplyVec3(this.roomOffsetCm)));
    t.setWorldRotation(rot);
    print("[LoadWalk] room placed at " + t.getWorldPosition());
  }

  // ---- scan stand-in ------------------------------------------------------------------------------------
  private onScan(s: LoadWalkStation): void {
    if (this.state.isTagged(s.slotId)) return;
    // Only one card is ever open: scanning something else closes the previous card.
    for (const other of this.stations) if (other !== s) other.ui.hideCard();
    const ids = PICKER_GROUPS[s.applianceKind] ?? [s.applianceKind];
    s.ui.showCard(ids.map((id) => ({ id, label: specById(id).name })));
    this.hint.hide();
  }

  private onPick(s: LoadWalkStation, specId: string): void {
    this.state.tag(s.slotId, specId);
    const spec = specById(specId);
    const cap = capacityW(POWER_STATION);
    let title = spec.name + " · " + fmtW(spec.runningW);
    if (spec.surgeFactor > 1) title += " · surges about " + spec.surgeFactor + "×";
    const notes: string[] = [];
    if (spec.estimate) notes.push("Estimate");
    if (this.state.tooBigAlone(s.slotId)) notes.push("Too big for this " + cap + " W unit");
    if (spec.note) notes.push(spec.note);
    s.ui.showTag({ title, notes, on: false });
  }

  // ---- toggle -------------------------------------------------------------------------------------------
  private onToggle(s: LoadWalkStation): void {
    const on = this.state.toggle(s.slotId);
    s.ui.setOn(on);
    this.render(s);
  }

  private levelOf(r: LoadReport): Level {
    if (r.status === "overload") return "overload";
    if (r.status === "near" || r.status === "surge-risk") return "near";
    if (r.status === "idle") return "idle";
    return "ok";
  }

  private render(toggled: LoadWalkStation | null): void {
    const r = this.state.report();
    const level = this.levelOf(r);
    const cap = fmtNum(r.capacityW);
    const loadText = fmtNum(r.runningW) + " W / " + cap + " W";
    const hours = this.state.hoursText(r);
    this.culprits = r.culpritIds;
    const names = r.culpritIds.map((id) => this.state.get(id)?.name ?? id).join(", ");

    let statusText = "Nothing switched on";
    if (r.status === "ok") statusText = "Within capacity";
    else if (r.status === "near") statusText = "Near the limit";
    else if (r.status === "surge-risk") statusText = "Startup surge may trip it";
    else if (r.status === "overload") statusText = "Overload. Switch off " + names;
    this.meter.setView({
      loadText,
      statusText,
      hoursText: r.status === "overload" || r.runningW === 0 ? "Battery left: --" : "Battery left: " + hours,
      level,
    });

    // The chip: hours are dropped once over capacity (time-to-trip is meaningless past the limit).
    const chipText = level === "overload" ? loadText : loadText + " · " + hours;
    for (const s of this.stations) {
      const isCulprit = level === "overload" && r.culpritIds.indexOf(s.slotId) >= 0;
      s.setGlow(isCulprit);
      if (isCulprit) s.ui.showChip(chipText, "overload", 0);
      else if (s === toggled) s.ui.showChip(chipText, level === "idle" ? "ok" : level, level === "overload" ? 0 : this.chipSeconds);
      else s.ui.hideChip();
    }

    if (level === "overload" && this.lastLevel !== "overload") this.chime.play(1);
    this.lastLevel = level;
    if (level !== "overload") this.arrow.setTarget(null, "");
  }

  // ---- out-of-view arrow --------------------------------------------------------------------------------
  private updateArrow(): void {
    if (this.lastLevel !== "overload") return;
    const cam = WorldCameraFinderProvider.getInstance().getTransform();
    const rot = cam.getWorldRotation().invert();
    const camPos = cam.getWorldPosition();
    let out: LoadWalkStation | null = null;
    for (const s of this.stations) {
      if (this.culprits.indexOf(s.slotId) < 0) continue;
      const local = rot.multiplyVec3(s.sceneObject.getTransform().getWorldPosition().sub(camPos));
      const inFront = local.z < 0;
      const ax = Math.abs(Math.atan2(local.x, -local.z)) * (180 / Math.PI);
      const ay = Math.abs(Math.atan2(local.y, -local.z)) * (180 / Math.PI);
      if (inFront && ax <= this.viewHalfWidthDeg && ay <= this.viewHalfHeightDeg) {
        out = null;
        this.arrow.setTarget(null, "");
        return;
      }
      if (!out) out = s;
    }
    if (out) this.arrow.setTarget(out.sceneObject.getTransform().getWorldPosition(), this.state.get(out.slotId)?.name ?? "");
  }
}
