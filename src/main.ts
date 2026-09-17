import * as pc from 'playcanvas';
import { GameUI } from './ui';
import { GameState } from './gameState';
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

const ui = new GameUI();
const state = new GameState(ui);
ui.onNewShift(() => {
  state.resetSave();
  window.location.reload();
});
new DevTools(state, ui);

const world = buildStore(app, state, ui);
buildExterior(app, world.colliders);
buildStaffArea(app, world);
new StoreSignageSystem(app);
new StaffDetailSystem(app);
const performanceProfile = applyPerformanceProfile(app);
if (performanceProfile.low) console.info(`OPEN ALL NIGHT low-performance profile enabled (${performanceProfile.reason})`);

const authoredAssets = new AuthoredRetailAssetSystem(app);
void authoredAssets.start();
const authoredCharacters = new AuthoredCharacterSystem(app);

const camera = new pc.Entity('PlayerCamera');
camera.addComponent('camera', {
  clearColor: new pc.Color(0.006, 0.009, 0.012),
  nearClip: 0.05,
  farClip: 180,
  fov: 70
});
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
const achievements = new AchievementSystem(state);
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
const shiftEnd = new ShiftEndSystem(app, world, state, ui);
void officeLore;

app.on('update', (dt: number) => {
  const safeDt = Math.min(dt, 0.05);
  interactionPolish.update();
  player.update(safeDt);
  playerAvatar.update();
  frontDoor.update(safeDt);
  state.update(dt);
  nightOne.update(safeDt);
  jenna.update(safeDt);
  lateCustomer.update(safeDt);
  dale.update(safeDt);
  marcus.update(safeDt);
  customerRouteSafety.update();
  authoredCharacters.update();
  receipts.update();
  transactions.update();
  achievements.update();
  atmosphere.update(safeDt);
  chores.update();
  midShiftTasks.update();
  closingChores.update();
  power.update(safeDt);
  restroom.update(safeDt);
  fuel.update(safeDt);
  delivery.update(safeDt);
  pumpSeven.update();
  cctvPolish.update(safeDt);
  cctvAnomaly.update(safeDt);
  windowWatcher.update(safeDt);
  storePhone.update(safeDt);
  rearDoorRattle.update(safeDt);
  impossibleReceipt.update();
  shiftEnd.update();
  ambience.update(camera);
});

window.addEventListener('error', (event) => {
  ui.showMessage(`Runtime error: ${event.message}`, 8000);
});

console.info('OPEN ALL NIGHT Night 1 vertical slice booted');
