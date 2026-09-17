import * as pc from 'playcanvas';
import { GameUI } from './ui';
import { GameState } from './gameState';
import { buildStore } from './storeBuilder';
import { buildExterior } from './exteriorBuilder';
import { PlayerController } from './playerController';
import { NightOneDirector } from './nightOneDirector';
import { ChoreSystem } from './choreSystem';
import { AmbientAudio } from './ambientAudio';
import { PowerSystem } from './powerSystem';
import { CctvSystem } from './cctvSystem';
import { RestroomSystem } from './restroomSystem';

const canvas = document.getElementById('application') as HTMLCanvasElement | null;
if (!canvas) throw new Error('Missing application canvas');

const app = new pc.Application(canvas);
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.scene.ambientLight = new pc.Color(0.045, 0.05, 0.055);
app.start();

const resize = () => app.resizeCanvas(canvas.width, canvas.height);
window.addEventListener('resize', resize);
resize();

const ui = new GameUI();
const state = new GameState(ui);
const world = buildStore(app, state, ui);
buildExterior(app, world.colliders);

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
const nightOne = new NightOneDirector(app, world, state, ui, camera);
const chores = new ChoreSystem(app, world, state, ui);
const ambience = new AmbientAudio(canvas);
const power = new PowerSystem(app, world, state, ui);
new CctvSystem(app, world, ui, player, camera);
const restroom = new RestroomSystem(app, world, state, ui);

app.on('update', (dt: number) => {
  const safeDt = Math.min(dt, 0.05);
  player.update(safeDt);
  state.update(dt);
  nightOne.update(safeDt);
  chores.update();
  power.update(safeDt);
  restroom.update(safeDt);
  ambience.update(camera);
});

window.addEventListener('error', (event) => {
  ui.showMessage(`Runtime error: ${event.message}`, 8000);
});

console.info('OPEN ALL NIGHT Night 1 vertical slice booted');
