import * as pc from 'playcanvas';
import { GameUI } from './ui';
import { GameState } from './gameState';
import { GameSession } from './gameSession';
import { GameFrameworkUI } from './gameFrameworkUI';
import { AnomalyRuntime } from './anomalyRuntime';
import { ANOMALY_BY_ID } from './anomalyCatalog';
import { FrameworkNightDirector } from './frameworkNightDirector';
import { CampaignCompletionSystem } from './campaignCompletionSystem';
import { SharedAnomalyHandlers } from './sharedAnomalyHandlers';
import { NightTwoRuntime } from './nightTwoRuntime';
import { NightThreeRuntime } from './nightThreeRuntime';
import { NightFourRuntime } from './nightFourRuntime';
import { NightFiveRuntime } from './nightFiveRuntime';
import { EndlessHudSystem } from './endlessHudSystem';
import { LaterNightRetailSystem } from './laterNightRetailSystem';
import { InteractiveAnomalySystem } from './interactiveAnomalySystem';
import { EndlessRunSystem } from './endlessRunSystem';
import { buildStore } from './storeBuilder';
import { buildExterior } from './exteriorBuilder';
import { buildStaffArea } from './staffAreaBuilder';
import { PlayerController } from './playerController';
import { PlayerAvatar } from './playerAvatar';
import { InteractionPolishSystem } from './interactionPolishSystem';
import { NightOneDirector } from './nightOneDirector';
import { LateCustomerSystem } from './lateCustomerSystem';
import { JennaSystem } from './jennaSystem';
import { DaleSystem } from './daleSystem';
import { MarcusSystem } from './marcusSystem';
import { CustomerRouteSafetySystem } from './customerRouteSafetySystem';
import { PumpSevenSystem } from './pumpSevenSystem';
import { WindowWatcherSystem } from './windowWatcherSystem';
import { StorePhoneSystem } from './storePhoneSystem';
import { OfficeLoreSystem } from './officeLoreSystem';
import { CctvAnomalySystem } from './cctvAnomalySystem';
import { CctvPolishSystem } from './cctvPolishSystem';
import { MidShiftTaskSystem } from './midShiftTaskSystem';
import { ImpossibleReceiptSystem } from './impossibleReceiptSystem';
import { RearDoorRattleSystem } from './rearDoorRattleSystem';
import { ReceiptSystem } from './receiptSystem';
import { TransactionFeedbackSystem } from './transactionFeedbackSystem';
import { AchievementSystem } from './achievementSystem';
import { NightOneAtmosphereSystem } from './nightOneAtmosphereSystem';
import { ClosingChoreSystem } from './closingChoreSystem';
import { AuthoredRetailAssetSystem } from './authoredRetailAssetSystem';
import { AuthoredCharacterSystem } from './authoredCharacterSystem';
import { StoreSignageSystem } from './storeSignageSystem';
import { StaffDetailSystem } from './staffDetailSystem';
import { VisualPolishSystem } from './visualPolishSystem';
import { FrontDoorSystem } from './frontDoorSystem';
import { ChoreSystem } from './choreSystem';
import { AmbientAudio } from './ambientAudio';
import { PowerSystem } from './powerSystem';
import { CctvSystem } from './cctvSystem';
import { RestroomSystem } from './restroomSystem';
import { FuelSystem } from './fuelSystem';
import { DeliverySystem } from './deliverySystem';
import { ShiftEndSystem } from './shiftEndSystem';
import { DevTools } from './devTools';
import { applyPerformanceProfile } from './performanceProfile';

const canvas = document.getElementById('application') as HTMLCanvasElement | null;
if (!canvas) throw new Error('Missing application canvas');

const app = new pc.Application(canvas);
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.scene.ambientLight = new pc.Color(0.095, 0.102, 0.105);
app.start();

const resize = () => app.resizeCanvas(canvas.width, canvas.height);
window.addEventListener('resize', resize);
resize();

const session = new GameSession();
const ui = new GameUI();
new GameFrameworkUI(session);
const state = new GameState(ui, {
  startMinutes: session.night.startMinutes,
  endMinutes: session.isEndless() ? 99999 : session.night.endMinutes,
  saveKey: `open-all-night-run-${session.config.mode}-night-${session.config.night}`,
  baseTasks: session.isEndless()
    ? []
    : session.config.night === 1
      ? undefined
      : [{ id: 'clock-in', text: `Clock in for Night ${session.config.night}` }]
});
ui.onNewShift(() => {
  state.resetSave();
  window.location.reload();
});
new DevTools(state, ui);
const anomalyRuntime = new AnomalyRuntime(session, ui);
const frameworkNight = new FrameworkNightDirector(session, state, ui, anomalyRuntime);

const world = buildStore(app, state, ui);
buildExterior(app, world.colliders);
buildStaffArea(app, world);
new StoreSignageSystem(app);
new StaffDetailSystem(app);
new VisualPolishSystem(app);
const performanceProfile = applyPerformanceProfile(app);
if (performanceProfile.low) console.info(`OPEN ALL NIGHT low-performance profile enabled (${performanceProfile.reason})`);

const authoredAssets = new AuthoredRetailAssetSystem(app);
void authoredAssets.start();
const authoredCharacters = new AuthoredCharacterSystem(app);

const camera = new pc.Entity('PlayerCamera');
camera.addComponent('camera', { clearColor: new pc.Color(0.006, 0.009, 0.012), nearClip: 0.05, farClip: 180, fov: 70 });
// The engine defaults to TONEMAP_LINEAR, which hard-clips: fixture lights placed close enough to
// read as "lit room" were blowing straight to solid white a couple meters out while everywhere
// else fell off a cliff to pure black a few meters further, confirmed via runtime screenshots of
// the staff area. ACES gives the same fixtures a soft highlight rolloff instead of a hard clip.
if (camera.camera) camera.camera.toneMapping = pc.TONEMAP_ACES;
camera.setPosition(world.spawn);
app.root.addChild(camera);

// A restrained CSS vignette over the game canvas rather than an engine post-processing pass:
// PlayCanvas's bloom/vignette pipeline (CameraFrame) needs an HDR render target and only ships
// from a non-standard deep import path in this engine version, which risks silently breaking on
// a future PlayCanvas bump and could double up with the ACES tonemap set above. A flat DOM overlay
// gets the same subtle darkened-corners horror-game framing with zero rendering risk, at z-index 2
// (above the canvas, below GameUI's z-index 10 so prompts/HUD text stay crisp) and does not sit in
// front of the CCTV overlay, which renders its own separate digital treatment above the HUD.
const vignette = document.createElement('div');
vignette.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2;' +
  'background:radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)';
document.body.appendChild(vignette);

// Night 3's own ambient light is already darker than the other nights (see nightThreeRuntime.ts),
// but the storm otherwise only reads through occasional message text - the exterior looked
// identical to a clear night. A very faint cool-blue static tint over the whole view is a cheap,
// zero-engine-risk way to make the storm night read as visually distinct without diverging into a
// different game: same layering approach and z-index as the vignette above, just one more night-3-
// only wash underneath it.
if (session.config.night === 3 && !session.isEndless()) {
  const stormTint = document.createElement('div');
  stormTint.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;background:rgba(30,42,58,0.10)';
  document.body.appendChild(stormTint);
}

if (new URLSearchParams(window.location.search).get('dev') === '1') {
  // QA-only hook: lets an automated screenshot/inspection pass reposition the camera
  // without wiring up pointer-lock mouse look. Never active outside ?dev=1.
  (window as unknown as { __oanDebug?: unknown }).__oanDebug = { app, world, state, session, camera, ui };
}

const player = new PlayerController(camera, canvas, world.colliders, world.interactables, ui, world.spawnYaw);

if (new URLSearchParams(window.location.search).get('dev') === '1') {
  (window as unknown as { __oanDebug: Record<string, unknown> }).__oanDebug.player = player;
}
const playerAvatar = new PlayerAvatar(app, player);
const frontDoor = new FrontDoorSystem(app, player);
const interactionPolish = new InteractionPolishSystem(app, world, state);
const nightOne = new NightOneDirector(app, world, state, ui, camera);
const jenna = new JennaSystem(app, world, state, ui);
const lateCustomer = new LateCustomerSystem(app, world, state, ui);
const dale = new DaleSystem(app, world, state, ui);
const marcus = new MarcusSystem(app, world, state, ui);
const customerRouteSafety = new CustomerRouteSafetySystem([nightOne, jenna, lateCustomer, dale, marcus]);
const receipts = new ReceiptSystem(app, world, state);
const transactions = new TransactionFeedbackSystem(state);
const achievements = new AchievementSystem(state, session.progression);
const atmosphere = new NightOneAtmosphereSystem(app, state, ui);
const chores = new ChoreSystem(app, world, state, ui);
const midShiftTasks = new MidShiftTaskSystem(app, world, state, ui);
const closingChores = new ClosingChoreSystem(app, world, state, ui);
const ambience = new AmbientAudio(canvas);
const power = new PowerSystem(app, world, state, ui);
new CctvSystem(app, world, ui, player, camera);
const cctvPolish = new CctvPolishSystem(ui, state);
const cctvAnomaly = new CctvAnomalySystem(app, state, ui);
const officeLore = new OfficeLoreSystem(app, world, state, ui);
const restroom = new RestroomSystem(app, world, state, ui);
const fuel = new FuelSystem(app, world, state, ui);
const delivery = new DeliverySystem(app, world, state, ui);
const pumpSeven = new PumpSevenSystem(app, world, state, ui);
const windowWatcher = new WindowWatcherSystem(app, state, ui, camera);
const storePhone = new StorePhoneSystem(app, world, state, ui);
const rearDoorRattle = new RearDoorRattleSystem(world, state, ui);
const impossibleReceipt = new ImpossibleReceiptSystem(app, world, state, ui);
// Night-1-only: its interactable ("shift-time-clock") previously registered unconditionally on
// every night at the exact same position as CampaignCompletionSystem's own night-aware clock
// interactable ("framework-shift-clock"). Because ShiftEndSystem was constructed first, its
// interactable won the aim-target tie-break on Nights 2-5, and its clockOut() unconditionally
// calls progression.completeNight(1, {night: 1, ...}) — silently recording Night 1's completion
// instead of the actual current night every time a later night was clocked out. Confirmed via
// runtime testing: clocking out of Night 2 left completedNights=[1] instead of [2].
const shiftEnd = session.config.night === 1 && !session.isEndless()
  ? new ShiftEndSystem(app, world, state, ui, session.progression)
  : undefined;
const campaignCompletion = new CampaignCompletionSystem(world, state, session, ui);
const sharedAnomalies = new SharedAnomalyHandlers({ app, world, state, ui }, anomalyRuntime);
const nightTwoRuntime = session.isCampaignNight(2) ? new NightTwoRuntime(world, state, ui, session.progression) : undefined;
const nightThreeRuntime = session.isCampaignNight(3) ? new NightThreeRuntime(app, world, state, ui, session.progression, camera) : undefined;
const nightFourRuntime = session.isCampaignNight(4) ? new NightFourRuntime(world, state, ui, session.progression) : undefined;
const nightFiveRuntime = session.isCampaignNight(5) ? new NightFiveRuntime(app, world, state, ui) : undefined;

const endlessHud = new EndlessHudSystem(session);
const laterRetail = new LaterNightRetailSystem(world, session, state, ui);
const interactiveAnomalies = new InteractiveAnomalySystem(world, session, state, ui, anomalyRuntime);
const endlessRun = new EndlessRunSystem(session, state, player);
void officeLore;

if (new URLSearchParams(window.location.search).get('dev') === '1') {
  // QA-only: exposes night-runtime/anomaly instances so automated tests can inspect internal timer
  // state directly (e.g. instance['someTimer']) or drive update(dt) with an arbitrary dt to test a
  // timeout path deterministically, instead of waiting on real-time vs simulated-time ratios.
  Object.assign((window as unknown as { __oanDebug: Record<string, unknown> }).__oanDebug, {
    nightTwoRuntime, nightThreeRuntime, nightFourRuntime, nightFiveRuntime,
    anomalyRuntime, interactiveAnomalies, ANOMALY_BY_ID
  });
}

const runNightOneContent = session.config.mode !== 'endless' && session.config.night === 1;
if (!runNightOneContent && !session.isEndless()) ui.showMessage(`NIGHT ${session.config.night}: ${session.night.title}`, 5000);

app.on('update', (dt: number) => {
  const safeDt = Math.min(dt, 0.05);
  interactionPolish.update();
  player.update(safeDt);
  playerAvatar.update();
  frontDoor.update(safeDt);
  state.update(dt);
  authoredCharacters.update();
  achievements.update();
  cctvPolish.update(safeDt);
  sharedAnomalies.update(safeDt);
  nightTwoRuntime?.update(safeDt);
  nightThreeRuntime?.update(safeDt);
  nightFourRuntime?.update(safeDt);
  nightFiveRuntime?.update();
  endlessHud.update();
  laterRetail.update();
  interactiveAnomalies.update(safeDt);
  endlessRun.update();
  ambience.update(camera);

  if (runNightOneContent) {
    nightOne.update(safeDt);
    jenna.update(safeDt);
    lateCustomer.update(safeDt);
    dale.update(safeDt);
    marcus.update(safeDt);
    customerRouteSafety.update();
    receipts.update();
    transactions.update();
    atmosphere.update(safeDt);
    chores.update();
    midShiftTasks.update();
    closingChores.update();
    power.update(safeDt);
    restroom.update(safeDt);
    fuel.update(safeDt);
    delivery.update(safeDt);
    pumpSeven.update();
    cctvAnomaly.update(safeDt);
    windowWatcher.update(safeDt);
    storePhone.update(safeDt);
    rearDoorRattle.update(safeDt);
    impossibleReceipt.update();
    shiftEnd?.update();
  } else if (session.isEndless()) {
    const anomaly = session.updateEndless(dt);
    if (anomaly) void anomalyRuntime.trigger(anomaly);
  } else {
    frameworkNight.update();
    campaignCompletion.update();
  }
});

window.addEventListener('error', (event) => ui.showMessage(`Runtime error: ${event.message}`, 8000));
console.info(`OPEN ALL NIGHT booted: ${session.config.mode} / night ${session.config.night} / seed ${session.config.seed}`);
