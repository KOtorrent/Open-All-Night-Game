import * as pc from 'playcanvas';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

function mat(color: pc.Color, gloss = 0.08): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.gloss = gloss;
  m.update();
  return m;
}

function part(parent: pc.Entity, name: string, type: 'sphere' | 'capsule' | 'cylinder', pos: pc.Vec3, scale: pc.Vec3, material: pc.StandardMaterial): void {
  const e = new pc.Entity(name);
  e.addComponent('render', { type });
  e.setLocalPosition(pos);
  e.setLocalScale(scale);
  if (e.render) e.render.material = material;
  parent.addChild(e);
}

/**
 * A non-failing late-shift visual scare: somebody is standing beyond the front-right window with
 * no car, no chime, and no gameplay prompt. Looking away or walking toward the glass makes them
 * disappear. Night 1 keeps its three actual rules; this is only uncertainty.
 */
export class WindowWatcherSystem {
  private readonly app: pc.Application;
  private readonly state: GameState;
  private readonly ui: GameUI;
  private readonly camera: pc.Entity;
  private watcher?: pc.Entity;
  private spawned = false;
  private resolved = false;
  private visibleSeconds = 0;

  constructor(app: pc.Application, state: GameState, ui: GameUI, camera: pc.Entity) {
    this.app = app;
    this.state = state;
    this.ui = ui;
    this.camera = camera;
  }

  update(dt: number): void {
    const minute = this.state.getGameMinutes();
    if (!this.spawned && minute >= 28 * 60 + 25) this.spawn();
    if (!this.watcher || this.resolved) return;

    this.visibleSeconds += dt;
    const player = this.camera.getPosition();
    const watcherPos = this.watcher.getPosition();
    const dx = player.x - watcherPos.x;
    const dz = player.z - watcherPos.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    // It should never become a close-up monster. Approach the window or wait long enough and the
    // parking lot is simply empty again.
    if (distance < 5.0 || this.visibleSeconds > 22) this.vanish();
  }

  private spawn(): void {
    this.spawned = true;
    const root = new pc.Entity('WindowWatcher');
    const coat = mat(new pc.Color(0.014, 0.016, 0.017), 0.04);
    const skin = mat(new pc.Color(0.29, 0.285, 0.25), 0.05);

    part(root, 'Body', 'capsule', new pc.Vec3(0, 1.10, 0), new pc.Vec3(0.62, 0.90, 0.42), coat);
    part(root, 'Head', 'sphere', new pc.Vec3(0, 1.91, 0), new pc.Vec3(0.36, 0.43, 0.34), skin);
    part(root, 'LegL', 'capsule', new pc.Vec3(-0.16, 0.42, 0), new pc.Vec3(0.20, 0.58, 0.20), coat);
    part(root, 'LegR', 'capsule', new pc.Vec3(0.16, 0.42, 0), new pc.Vec3(0.20, 0.58, 0.20), coat);
    root.setPosition(5.15, 0, 13.65);
    root.setEulerAngles(0, 180, 0);
    root.setLocalScale(0.94, 1.02, 0.94);
    this.app.root.addChild(root);
    this.watcher = root;

    // No warning banner and no task. The player is allowed to miss this completely.
    this.ui.showMessage('For a second, something outside catches the corner of your eye.', 2200);
  }

  private vanish(): void {
    if (!this.watcher || this.resolved) return;
    this.resolved = true;
    this.watcher.destroy();
    this.watcher = undefined;
    this.state.complete('night1-window-watcher-seen');
  }
}
