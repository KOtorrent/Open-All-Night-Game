import * as pc from 'playcanvas';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

function mat(color: pc.Color): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.gloss = 0.04;
  m.update();
  return m;
}

/**
 * A camera-only Night 1 discrepancy. The figure is parented to CAM 4 so it exists only in that
 * camera's view and never in the physical store. It is deliberately non-failing foreshadowing.
 */
export class CctvAnomalySystem {
  private readonly app: pc.Application;
  private readonly state: GameState;
  private readonly ui: GameUI;
  private figure?: pc.Entity;
  private shown = false;
  private watchedSeconds = 0;
  private completed = false;

  constructor(app: pc.Application, state: GameState, ui: GameUI) {
    this.app = app;
    this.state = state;
    this.ui = ui;
  }

  update(dt: number): void {
    if (this.completed) return;
    const minute = this.state.getGameMinutes();
    if (minute < 27 * 60 + 33 || minute > 27 * 60 + 44) return;

    const camera = this.app.root.findByName('CCTV-Camera-4') as pc.Entity | null;
    if (!camera?.camera?.enabled) return;

    if (!this.figure) this.spawn(camera);
    if (!this.figure) return;

    this.watchedSeconds += dt;
    if (!this.shown) {
      this.shown = true;
      this.state.complete('cctv-figure-seen');
    }

    if (this.watchedSeconds > 3.8) {
      this.figure.enabled = false;
      this.completed = true;
      this.ui.showMessage('CAM 4 jitters. The aisle is empty again.', 2400);
    }
  }

  private spawn(camera: pc.Entity): void {
    const root = new pc.Entity('CAM4-Only-Figure');
    const black = mat(new pc.Color(0.003, 0.003, 0.004));

    const torso = new pc.Entity('CAM4-Figure-Torso');
    torso.addComponent('render', { type: 'capsule' });
    torso.setLocalPosition(0, -0.15, -7.2);
    torso.setLocalScale(0.48, 1.18, 0.38);
    if (torso.render) torso.render.material = black;
    root.addChild(torso);

    const head = new pc.Entity('CAM4-Figure-Head');
    head.addComponent('render', { type: 'sphere' });
    head.setLocalPosition(0, 0.92, -7.2);
    head.setLocalScale(0.42, 0.48, 0.42);
    if (head.render) head.render.material = black;
    root.addChild(head);

    const armL = new pc.Entity('CAM4-Figure-ArmL');
    armL.addComponent('render', { type: 'capsule' });
    armL.setLocalPosition(-0.42, -0.08, -7.2);
    armL.setLocalScale(0.16, 1.00, 0.16);
    if (armL.render) armL.render.material = black;
    root.addChild(armL);

    const armR = armL.clone();
    armR.name = 'CAM4-Figure-ArmR';
    armR.setLocalPosition(0.42, -0.08, -7.2);
    root.addChild(armR);

    camera.addChild(root);
    this.figure = root;
  }
}
