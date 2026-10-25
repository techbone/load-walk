import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils";
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils";
import {
  LoadWalkLeafInteractor, child, chipColor, chipText, close, colorOf, glowing, isOn, meter, switchOnSmallLoads, textOf, uiRoot,
} from "./LoadWalkLeafInteractor";
import { COLORS } from "../Scripts/LoadWalkTheme";

// Criterion 4: overload.
@component
export class OverloadScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    await switchOnSmallLoads(i);
    await i.toggle("Iron");
    await sleep(300);
    // The iron says it itself: the chip's second line tells you what to switch off, and its tag turns the warning colour.
    expect(chipText("Iron")).toBe("1,282 W / 200 W · Switch off the iron");
    expect(close(chipColor("Iron"), COLORS.warn)).toBe(true);
    expect(close(colorOf(uiRoot("Iron"), "ChipAction"), COLORS.warn)).toBe(true);
    expect(close(colorOf(uiRoot("Iron"), "TagWatts"), COLORS.warn)).toBe(true);
    expect(textOf(uiRoot("Iron"), "TagNote2")).toBe("Too big for 200 W");
    expect(close(colorOf(uiRoot("Iron"), "TagNote2"), COLORS.warn)).toBe(true);
    // The rest of the desk is not to blame: its wattages stay in the "on" colour.
    expect(close(colorOf(uiRoot("Laptop"), "TagWatts"), COLORS.accent)).toBe(true);
    expect(glowing("Iron")).toBe(true);
    const chime = findSceneObjectByName("OverloadChime")!.getComponent("Component.AudioComponent") as AudioComponent;
    expect(chime.isPlaying()).toBe(true);
    expect(meter("MeterLoad")).toBe("1,282 W");
    expect(meter("MeterLimit")).toBe("of 200 W");
    expect(meter("MeterStatus")).toBe("Overload: switch off the iron");
    const load = findSceneObjectByName("MeterLoad")!.getComponent("Component.Text") as Text;
    expect(close(load.textFill.color, COLORS.warn)).toBe(true);
  }
}

