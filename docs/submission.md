# Submission (Devpost)

Paste each block into the matching Devpost field.

## Project name

Load Walk

## Elevator pitch

Look around your house, see what your inverter can carry

## About the project (Markdown)

## Inspiration

One night the power went out and I had to iron a shirt for work early the next morning. I plugged the iron into my inverter, it tripped, and I had no idea why.

The reason is simple once you can see it. My power station is a Home Power Dock HeroEE 1: **200 W output, 1 kWh battery**. My iron wants about 1,100 W. It was never going to run. But nothing told me that, and the only tools I knew of were web calculators where you type in appliances by hand. Nobody is standing at a calculator when the power goes out. They're standing at the freezer with a torch.

Glasses can put the answer on the appliance itself.

## What it does

Load Walk is a Lens for SPECS. You walk around your home and:

- **Pinch an appliance** and pick what it is from a short card. A tag appears on it with its wattage, and a red "Too big for 200 W" before you've switched anything on.
- **Switch things on and off** with a pinch, or by voice ("on the fan", "off the iron", "can I run the freezer?"). A chip beside the tag shows the running total and the battery hours left, like `182 W / 200 W · 3h 58m`.
- **Walk to the power station** and read the meter floating above it: load, limit, status and time left.
- **Get warned before it trips.** Switch on the iron and its own tag turns red, the chip says "Switch off the iron", a chime plays, and an arrow points to it from anywhere in the room.

My desk (fan, phone charger, power bank, laptop) takes **182 of the 200 W**. That's what the Lens shows me before I add anything else.

## How I built it

I followed the Devpost Learn process:

1. **Research and a problem check first:** who has this problem, what exists, and why it needs glasses.
2. **The `plan-lens` interview** turned my idea into a design brief with the one spatial moment, where things live, how hands work, and five checkable done criteria, using real numbers from my power station's label. Voice was added later as a sixth.
3. **CLAD built the Lens** in Lens Studio through the Lens Studio MCP, then four design rounds from preview captures and my own walk-throughs.
4. **LEAF tests** pinch the Lens by themselves and check every done criterion (28 scenarios).

The load maths lives in one plain TypeScript file with **21 unit tests**. The Lens uses the *same file*, and a test fails if the two copies ever differ:

$$\text{battery hours} = \frac{1000\,\text{Wh} \times 0.85_{\text{usable}} \times 0.85_{\text{conversion}}}{\text{load (W)}}$$

At 182 W that's 3 h 58 m. Pinch and voice both call the same `setSwitch()`, so they can't disagree.

## Challenges

- **The fan that kept becoming a power bank.** Picking "Fan" tagged the fan as the wrong appliance. The phone charger's card opened over the fan, its buttons sat inside the fan's invisible click box, and the Interaction Kit sent my pinch to the nearest one. Buttons now outrank appliance bodies, and any tag can be re-picked. A LEAF scenario opens every card three times to guard it.
- **The login that blocked everything.** Lens Studio 5.24.1's sign-in failed in every browser. The SPECS team suggested downgrading to 5.23.2, so I rebuilt the project there.
- **Readable on an additive display.** The first build worked and was unreadable: grey boxes, tiny text. Three rounds later the wattage is the biggest thing on every tag, measured from rendered pixels.
- **Voice with no language setting.** Snap's speech module guesses the language, and a noisy room once came back in Russian. Voice is off by default, acts only on final transcripts, and restarts itself.

## What I learned

- **On glasses, information belongs on the thing it's about.** My first version was a panel. It became a tag on each appliance, and a meter on the power station.
- **The more exact the brief, the better the build.** The interview made me write real numbers (200 W, 1,000 Wh, 182 W) and checkable outcomes. CLAD built almost exactly that.
- **Keep the maths out of the engine you can't test.** The pure engine file made the maths trustworthy, even while Lens Studio itself was flaky.
- **Be honest about the stand-in.** The preview can't recognise a real appliance, so the scan is a pinch-and-pick, and the Lens says so on screen. Wattages are the labels where I have them and marked estimates where I don't.

## What's next

Real camera recognition of appliance labels on glasses, saving a household's appliances between sessions, and a surge check for motors (fridges, pumps) that start at three times their running power.

## Built with

SPECS · Lens Studio 5.23.2 · CLAD · Lens Studio MCP · LEAF · Spectacles Interaction Kit · Spectacles UI Kit · TypeScript · Snap ASR Module (voice) · Devpost Learn plan-lens skill pack · Claude Code · Node.js

## Try it out links

- Code: https://github.com/techbone/load-walk
- Demo video: _YouTube link goes here_

## Image gallery (JPG/PNG, 5 MB max, 3:2 ratio best)

In this order:
1. `IMG_4600.JPG` (the iron next to the power station; 4.1 MB, in Downloads)
2. `docs/evidence/evening-room/desk-182w.png`
3. `docs/evidence/evening-room/iron-overload.png`
4. `docs/evidence/evening-room/meter.png`
5. `docs/evidence/evening-room/start-view.png`
6. `docs/evidence/evening-room/freezer-pump-corner.png`

## Video demo link

_YouTube link goes here_

---

## Public code repository URL

https://github.com/techbone/load-walk

(Lens Studio project in `lens/`, design brief in `lens/devpost/design-brief.md`, research and evidence in `docs/`.)

## How the project meets the main technology requirement

**Devpost Learn skill pack (`plan-lens`).** I ran the interview and it wrote `lens/devpost/design-brief.md`: the one spatial moment, where things live, how hands work, and five done criteria checkable in the preview (a sixth for voice was added later). I answered every question myself; the brief uses the real numbers from my power station's label.

**CLAD (`ls-clad` plugin, `specs-experience-builder` agent).** Built the Lens from that brief: the scene, the scripts (state, tags, chip, meter, arrow, voice), the 3D appliance models it generated, and the overload chime. I then drove four design rounds through it from preview captures and my own walk-throughs.

**Lens Studio MCP.** How CLAD and Claude Code reached Lens Studio: scene queries, creating and editing objects, compiling TypeScript, capturing the preview, driving pinches in the preview, and collecting logs.

**LEAF.** 28 scenarios, one per done criterion plus extras (placement, reach from 1 to 3 m, voice, retagging). They pinch the real Lens along SIK's ray and inject voice transcripts.

**Spectacles Interaction Kit and UI Kit.** Every interaction: scan card, tags, Turn on / Turn off, the Voice toggle.

**Lens Studio 5.23.2 and its ASR Module.** The preview environment (Evening Room) and speech-to-text for voice commands.

**Claude Code** was the agent harness running CLAD.

## Where did you get stuck, or nearly quit?

**1. Sign-in (the biggest blocker).** Lens Studio 5.24.1 could not sign in. On `accounts.specs.com/login` I entered my email, chose "Continue with email", and got only "Something went wrong. Please try again." The login URL redirects to `http://127.0.0.1:<port>/auth/callback`. It failed the same way in a private window and when opening the login page directly, so I could not reach CLAD at all. The SPECS team's workaround was to downgrade to 5.23.2. After that, opening my 5.24 project showed "This project was created with a newer version of Lens Studio. Project may be unstable. Project Version: 5.24 (build: 26100516) Current Version: 5.23 (build: 26081320)", so I recreated the project from a fresh Base Template. Later, after a restart, the log said "Failed to connect with SPECS: Please check if you are logged into SPECS and Lens Studio with the same account", and speech recognition returned 401 until I signed in again. None of these messages said what was actually wrong.

**2. A pinch went to the wrong object.** Picking "Fan" on a scan card tagged the fan as "Power bank" or "Phone charger". The card's buttons overlapped another appliance's invisible pinch box and SIK sends a pinch to the nearest interactable. It took a day of hand-testing to find: the log showed the right handler running with the right label. Later a card opening under the hand mid-pinch took the release as a pick ("Kettle" instead of "Iron").

**3. LEAF flakiness.** `extra-ik-reach-fan` (the full-arm avatar pinching the fan) failed on about half of cold starts after a refresh and passed on an immediate re-run (error: "ray failed to converge"). Another scenario intermittently threw "Exception in HostFunction: Object is null" because the Lens destroyed a button 0.3 s after a pick while LEAF read its name a few frames later; slow editor frames (about 98 ms vs about 22 ms) made it worse. Long scenarios (3.5 minutes) also made tool calls time out.

**4. The preview start pose.** The room places itself relative to the preview camera at start, and that pose changed between runs (z from about 560 to 2,300 cm), so after a refresh the room was sometimes behind me. Every refresh also logged "Lens has been reset" twice.

**5. Voice.** The ASR module has no language option (a noisy room once returned Russian) and no "session ended" event, so a dropped stream is silent. With the speech object left enabled, refreshes logged "CANCELLED" and "Pipe was already closed", and once the app hung until I toggled Lens Studio's own preview microphone icon off and on.

**6. Dark meshes vanish in the preview.** On the simulated additive display, dark materials render see-through, so my "night" room disappeared into the preview grid. Using the built-in Evening Room environment fixed it.

## If Snap could fix one thing in CLAD or Lens Studio, what would it be?

**Make the Interactive Preview start the same way every time.** A fixed, documented start pose, one Lens instance per refresh, and a reset button that guarantees both. That one thing caused the room appearing behind me, the double "Lens has been reset", and most of the LEAF flakiness (the IK scenario failed mostly on cold starts and double instances), and it made every demo recording need a manual "reset camera, refresh, check the logger once" ritual. If I could ask for a second thing: sign-in errors that say what failed instead of "Something went wrong".
