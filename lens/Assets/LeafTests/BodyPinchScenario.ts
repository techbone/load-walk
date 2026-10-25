import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils";
import { findSceneObjectByName, sleep } from "Leaf.lspkg/Utils/common/Utils";
import { InteractionManager } from "SpectaclesInteractionKit.lspkg/Core/InteractionManager/InteractionManager";
import { Interactor, InteractorInputType } from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor";
import {
  LoadWalkLeafInteractor, NAMES, STATIONS, child, eyeInFrontOf, isTagged, rayTarget, startPose, tagName, uiRoot,
} from "./LoadWalkLeafInteractor";

const LABELS: Record<string, string> = { ...NAMES, Fridge: "Fridge", WaterPump: "Water pump" };

// Review bug: the iron's card opened across the line of sight to the iron, so the release of the pinch that opened it
// landed on "Kettle" and tagged the iron as a kettle. For every appliance, from the start spot, from the spot where the
// bug was seen (60 cm right of it, 20 cm closer) and from 1 m in front of the appliance, open its card, then release
// that pinch on whatever the ray to the body now hits: nothing gets picked.
@component
export class BodyPinchScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500);
    const i = new LoadWalkLeafInteractor();
    const start = startPose();
    const right = start.rot.multiplyVec3(vec3.right());
    const ahead = start.rot.multiplyVec3(new vec3(0, 0, -1));
    const spots: [string, (body: SceneObject) => vec3][] = [
      ["start spot", () => start.pos],
      ["review spot", () => start.pos.add(right.uniformScale(60)).add(ahead.uniformScale(20))],
      ["1 m in front", (body) => eyeInFrontOf(body, 1)],
    ];
    for (const slot of STATIONS) {
      const body = findSceneObjectByName(slot)!;
      for (const [spotName, spotOf] of spots) {
        const from = spotOf(body);
        // A first pinch on the body opens the card; once tagged, the name on the tag reopens the same card.
        if (isTagged(slot)) await i.trigger(findInteractableByName("TagNameButton", uiRoot(slot), true)!);
        else await i.scan(slot);
        const card = child(uiRoot(slot), "ScanCard");
        expect(card !== null).toBe(true);
        const before = tagName(slot);

        // The release of that pinch travels the same ray and lands on whatever it now hits, with no press on it.
        const hit = await rayTarget(from, body.getTransform().getWorldPosition());
        const hitName = hit ? hit.sceneObject.name : "nothing";
        const onCard = hit !== null && isUnder(hit.sceneObject, card!);
        print("[LEAF-MEASURE] " + slot + " from " + spotName + ": the body's ray lands on " + hitName + (onCard ? " (on the card)" : ""));
        // The iron's card opens to the left, into the gap between the tables, so no button sits on that ray at all.
        if (slot === "Iron") expect(onCard).toBe(false);
        if (hit) {
          InteractionManager.getInstance().dispatchEvent({ target: hit, interactor: anyInteractor(), eventName: "TriggerEnd" });
          await sleep(400);
        }
        // Nothing was picked: the tag still reads what it did and the card is still open.
        expect(tagName(slot)).toBe(before);
        expect(child(uiRoot(slot), "ScanCard") !== null).toBe(true);

        // Close the card the way a user would: pick what the appliance is.
        await i.pick(slot, before ?? LABELS[slot]);
        expect(child(uiRoot(slot), "ScanCard")).toBe(null);
      }
    }
  }
}

function anyInteractor(): Interactor {
  return InteractionManager.getInstance().getInteractorsByType(InteractorInputType.BothHands | InteractorInputType.Mouse)[0];
}

function isUnder(so: SceneObject, root: SceneObject): boolean {
  let p: SceneObject | null = so;
  while (p) {
    if (p.isSame(root)) return true;
    p = p.hasParent() ? p.getParent() : null;
  }
  return false;
}
