import * as pc from 'playcanvas';
import type { BuiltWorld } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

function mat(color: pc.Color, gloss = 0.2, emissive?: pc.Color): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.gloss = gloss;
  if (emissive) {
    m.emissive = emissive;
    m.emissiveIntensity = 1;
  }
  m.update();
  return m;
}

/**
 * Night 1 foreshadowing only: an unattended sedan appears at Pump 7 for a while and then is gone.
 * No rule, no fail state, no jumpscare. It exists to teach the player that the forecourt can change
 * while they are busy inside.
 */
export class PumpSevenSystem {
  private readonly app: pc.Application;
  private readonly state: GameState;
  private readonly ui: GameUI;
  private car?: pc.Entity;
  private spawned = false;
  private vanished = false;

  constructor(app: pc.Application, _world: BuiltWorld, state: GameState, ui: GameUI) {
    this.app = app;
    this.state = state;
    this.ui = ui;
  }

  update(): void {
    const minute = this.state.getGameMinutes();
    if (!this.spawned && minute >= 27 * 60 + 8) this.spawn();
    if (this.spawned && !this.vanished && minute >= 27 * 60 + 28) this.vanish();
  }

  private spawn(): void {
    this.spawned = true;
    const root = new pc.Entity('Pump7-Unattended-Sedan');
    const body = mat(new pc.Color(0.055, 0.058, 0.065), 0.50);
    const glass = mat(new pc.Color(0.012, 0.028, 0.035), 0.72);
    const rubber = mat(new pc.Color(0.012, 0.013, 0.013), 0.10);

    const add = (name: string, type: 'box' | 'cylinder', pos: pc.Vec3, scale: pc.Vec3, material: pc.StandardMaterial): pc.Entity => {
      const e = new pc.Entity(name);
      e.addComponent('render', { type });
      e.setLocalPosition(pos);
      e.setLocalScale(scale);
      if (e.render) e.render.material = material;
      root.addChild(e);
      return e;
    };

    add('Body', 'box', new pc.Vec3(0, 0.52, 0), new pc.Vec3(1.72, 0.54, 3.35), body);
    add('Cabin', 'box', new pc.Vec3(0, 0.98, -0.12), new pc.Vec3(1.43, 0.58, 1.65), glass);
    for (const x of [-0.77, 0.77]) {
      for (const z of [-1.04, 1.04]) {
        const wheel = add(`Wheel-${x}-${z}`, 'cylinder', new pc.Vec3(x, 0.30, z), new pc.Vec3(0.36, 0.19, 0.36), rubber);
        wheel.setLocalEulerAngles(0, 0, 90);
      }
    }

    // Pump 7 is the first unit on the far-right rear island in the current pump numbering.
    root.setPosition(4.0, 0, 30.7);
    root.setEulerAngles(0, 180, 0);
    this.app.root.addChild(root);
    this.car = root;

    // Intentionally no UI announcement. The event is only discovered by looking outside/CCTV.
  }

  private vanish(): void {
    this.vanished = true;
    if (this.car) this.car.enabled = false;
    this.state.complete('pump7-night1-seen-or-missed');
    // Small auditory clue only if the player happens to be paying attention around the transition.
    this.ui.showMessage('For a second, you think you hear tires on the road. Then only the cooler hum.', 2800);
  }
}
