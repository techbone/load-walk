import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils";
import { Interactable, TargetingPriority } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import { cardOptions, specById } from "../Scripts/ApplianceCatalog";
import { LoadWalkStation } from "../Scripts/LoadWalkStation";
import {
  LoadWalkLeafInteractor, NAMES, cardButton, cardLabels, cardOverlaps, child, clickFrom, eye, tagName, uiRoot,
} from "./LoadWalkLeafInteractor";

const DESK = ["Fan", "PhoneCharger", "PowerBank", "Laptop", "Iron"];
const ROUNDS = 3;

// Hand-test bug: picking "Fan" tagged the fan as something else, and the card's order seemed to change. Every desk
// card is opened several times from where the user stands, and each pick is a pinch along the real ray at the
// button showing that label. The tag must read what was clicked, every time, and no other appliance may change.
@component
export class DeskCardsByLabelScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const rounds = ROUNDS;
    const i = new LoadWalkLeafInteractor();
    const from = eye();
    for (const slot of DESK) {
      const kind = (findSceneObjectByName(slot)!.getComponent(LoadWalkStation.getTypeName()) as LoadWalkStation).applianceKind;
      const expected = cardOptions(kind).map((id) => specById(id).name);
      for (let r = 0; r < rounds; r++) {
        // First open by pinching the appliance; after that by pinching the tag's name, which reopens the card.
        const opener = r === 0 ? findSceneObjectByName(slot)! : child(child(uiRoot(slot), "Tag"), "TagNameButton")!;
        const opened = await clickFrom(i, opener, from);
        expect(opened).toBe(opener.name);
        expect(child(uiRoot(slot), "ScanCard") !== null).toBe(true);

        // One fixed order, every opening.
        expect(cardLabels(slot).join(" / ")).toBe(expected.join(" / "));
        // Card buttons outrank appliance bodies, so a pinch on a button cannot fall through to an appliance.
        for (const label of expected) {
          const hit = cardButton(slot, label).getComponent(Interactable.getTypeName()) as Interactable;
          expect(hit.targetingPriority).toBe(TargetingPriority.High);
        }
        // Clear of every pinch target, its own appliance's included.
        const touching = cardOverlaps(slot);
        if (touching.length) print("[LEAF-MEASURE] " + slot + " card overlaps " + touching.join(", "));
        expect(touching.length).toBe(0);

        // Each round picks a different label; the last round picks the right one.
        const label = r === rounds - 1 ? NAMES[slot] : expected[(r + 1) % expected.length];
        const others = DESK.filter((s) => s !== slot).map((s) => s + "=" + tagName(s)).join(", ");
        const clicked = await clickFrom(i, cardButton(slot, label), from);
        print("[LEAF-MEASURE] " + slot + " round " + (r + 1) + ": clicked " + label + ", ray hit " + clicked + ", tag reads " + tagName(slot));
        expect(clicked).toBe("Btn-" + label);
        expect(tagName(slot)).toBe(label);
        expect(child(uiRoot(slot), "ScanCard")).toBe(null);
        expect(DESK.filter((s) => s !== slot).map((s) => s + "=" + tagName(s)).join(", ")).toBe(others);
      }
    }
  }
}
