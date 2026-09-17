import * as pc from 'playcanvas';
import type { BuiltWorld, Interactable } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

function mat(color: pc.Color, gloss = 0.22, emissive?: pc.Color): pc.StandardMaterial {
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

function box(app: pc.Application, name: string, pos: pc.Vec3, scale: pc.Vec3, material: pc.StandardMaterial): pc.Entity {
  const e = new pc.Entity(name);
  e.addComponent('render', { type: 'box' });
  e.setPosition(pos);
  e.setLocalScale(scale);
  if (e.render) e.render.material = material;
  app.root.addChild(e);
  return e;
}

/**
 * Mundane fuel-desk work for Night 1. A car pulls to Pump 5, a request lamp appears on the
 * counter console, and the clerk must authorize the pump. This deliberately gives the player
 * a reason to watch the forecourt and keeps the job loop moving between horror beats.
 */
export class FuelSystem {
  private readonly app: pc.Application;
  private readonly world: BuiltWorld;
  private readonly state: GameState;
  private readonly ui: GameUI;
  private requested = false;
  private authorized = false;
  private car?: pc.Entity;
  private requestLight?: pc.Entity;
  private interactable?: Interactable;
  private departTimer = 0;
  private departing = false;

  constructor(app: pc.Application, world: BuiltWorld, state: GameState, ui: GameUI) {
    this.app = app;
    this.world = world;
    this.state = state;
    this.ui = ui;
    this.buildFuelConsole();
  }

  update(dt: number): void {
    const minute = this.state.getGameMinutes();
    if (!this.requested && minute >= 24 * 60 + 10 && !this.state.isComplete('authorize-pump-5')) {
      this.beginRequest();
    }

    if (this.authorized && !this.departing) {
      this.departTimer += dt;
      if (this.departTimer >= 8) this.departing = true;
    }

    if (this.departing && this.car?.enabled) {
      const pos = this.car.getPosition().clone();
      pos.z += 4.8 * dt;
      this.car.setPosition(pos);
      if (pos.z > 43) this.car.enabled = false;
    }
  }

  private buildFuelConsole(): void {
    const shell = mat(new pc.Color(0.055, 0.06, 0.06), 0.28);
    const face = mat(new pc.Color(0.13, 0.15, 0.14), 0.34);
    const idle = mat(new pc.Color(0.035, 0.07, 0.035), 0.45, new pc.Color(0.01, 0.025, 0.01));

    box(this.app, 'FuelConsoleBody', new pc.Vec3(-4.15, 1.48, 7.73), new pc.Vec3(0.80, 0.20, 0.48), shell);
    box(this.app, 'FuelConsoleFace', new pc.Vec3(-4.15, 1.60, 7.61), new pc.Vec3(0.68, 0.08, 0.32), face).setEulerAngles(-12, 0, 0);
    this.requestLight = box(this.app, 'FuelConsoleRequestLight', new pc.Vec3(-4.15, 1.655, 7.48), new pc.Vec3(0.18, 0.035, 0.08), idle);

    const panel: Interactable = {
      id: 'fuel-console',
      label: 'check fuel console',
      position: new pc.Vec3(-4.15, 1.60, 7.60),
      radius: 2.5,
      aimRadius: 0.42,
      onInteract: () => {
        if (!this.requested) return 'No pending fuel requests.';
        if (this.authorized || this.state.isComplete('authorize-pump-5')) return 'Pump 5 is authorized. $40.00 prepaid.';
        this.authorized = true;
        this.state.complete('authorize-pump-5');
        this.setRequestLight(false);
        return 'PUMP 5 — AUTHORIZED — $40.00 PREPAY. The pump chirps outside.';
      }
    };
    this.interactable = panel;
    this.world.interactables.push(panel);
  }

  private beginRequest(): void {
    this.requested = true;
    this.state.addTask('authorize-pump-5', 'Authorize $40 on Pump 5');
    this.spawnCar();
    this.setRequestLight(true);
    if (this.interactable) this.interactable.label = 'authorize pump 5';
    this.ui.showMessage('BEEP. Fuel request — Pump 5 — $40.00 prepaid.', 3300);
  }

  private setRequestLight(active: boolean): void {
    if (!this.requestLight?.render) return;
    this.requestLight.render.material = active
      ? mat(new pc.Color(0.62, 0.34, 0.025), 0.34, new pc.Color(0.42, 0.16, 0.01))
      : mat(new pc.Color(0.035, 0.07, 0.035), 0.45, new pc.Color(0.01, 0.025, 0.01));
    if (this.interactable && !active) this.interactable.label = 'check fuel console';
  }

  private spawnCar(): void {
    if (this.car) return;
    const root = new pc.Entity('Pump5CustomerCar');
    const body = mat(new pc.Color(0.11, 0.12, 0.14), 0.58);
    const glass = mat(new pc.Color(0.025, 0.055, 0.065), 0.72);
    const rubber = mat(new pc.Color(0.018, 0.019, 0.019), 0.12);
    const lamp = mat(new pc.Color(0.75, 0.68, 0.45), 0.30, new pc.Color(0.46, 0.34, 0.11));

    const add = (name: string, type: 'box' | 'cylinder', pos: pc.Vec3, scale: pc.Vec3, material: pc.StandardMaterial) => {
      const e = new pc.Entity(name);
      e.addComponent('render', { type });
      e.setLocalPosition(pos);
      e.setLocalScale(scale);
      if (e.render) e.render.material = material;
      root.addChild(e);
      return e;
    };

    add('CarBody', 'box', new pc.Vec3(0, 0.55, 0), new pc.Vec3(1.75, 0.55, 3.45), body);
    const cabin = add('CarCabin', 'box', new pc.Vec3(0, 0.98, -0.18), new pc.Vec3(1.50, 0.58, 1.72), glass);
    cabin.setLocalEulerAngles(0, 0, 0);
    for (const x of [-0.78, 0.78]) {
      for (const z of [-1.05, 1.05]) {
        const wheel = add(`Wheel-${x}-${z}`, 'cylinder', new pc.Vec3(x, 0.32, z), new pc.Vec3(0.38, 0.20, 0.38), rubber);
        wheel.setLocalEulerAngles(0, 0, 90);
      }
    }
    add('HeadlampL', 'box', new pc.Vec3(-0.52, 0.58, -1.74), new pc.Vec3(0.28, 0.16, 0.05), lamp);
    add('HeadlampR', 'box', new pc.Vec3(0.52, 0.58, -1.74), new pc.Vec3(0.28, 0.16, 0.05), lamp);

    root.setPosition(-5.9, 0, 25.3);
    root.setEulerAngles(0, 180, 0);
    this.app.root.addChild(root);
    this.car = root;
  }
}
