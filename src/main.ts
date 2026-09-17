import * as pc from 'playcanvas';
import { GameUI } from './ui';
import { GameState } from './gameState';
import { GameSession } from './gameSession';
import { GameFrameworkUI } from './gameFrameworkUI';
import { AnomalyRuntime } from './anomalyRuntime';
import { FrameworkNightDirector } from './frameworkNightDirector';
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
  saveKey: `open-all-night-run-${session.config.mode}-night-${session.config.night}`
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
camera.setPosition(world.spawn);
app.root.addChild(camera);

const player = new PlayerController(camera, canvas, world.colliders, world.interactables, ui, world.spawnYaw);
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
const shiftEnd = new ShiftEndSystem(app, world, state, ui, session.progression);
void officeLore;

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
    shiftEnd.update();
  } else if (session.isEndless()) {
    const anomaly = session.updateEndless(dt);
    if (anomaly) void anomalyRuntime.trigger(anomaly);
  } else {
    frameworkNight.update();
  }
});

window.addEventListener('error', (event) => ui.showMessage(`Runtime error: ${event.message}`, 8000));
console.info(`OPEN ALL NIGHT booted: ${session.config.mode} / night ${session.config.night} / seed ${session.config.seed}`);
