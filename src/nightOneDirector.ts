import * as pc from 'playcanvas';
import type { BuiltWorld, Interactable } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

type CustomerPhase = 'entering' | 'shopping' | 'approaching' | 'waiting' | 'leaving' | 'done';

interface CustomerActor {
  root: pc.Entity;
  phase: CustomerPhase;
  waypoint: number;
  route: pc.Vec3[];
  speed: number;
  served: boolean;
}

function makeMat(color: pc.Color, gloss = 0.22): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.gloss = gloss;
  m.update();
  return m;
}

function addPrimitive(parent: pc.Entity, name: string, type: 'box' | 'sphere' | 'cylinder' | 'capsule', pos: pc.Vec3, scale: pc.Vec3, material: pc.StandardMaterial): pc.Entity {
  const e = new pc.Entity(name);
  e.addComponent('render', { type });
  e.setLocalPosition(pos);
  e.setLocalScale(scale);
  if (e.render) e.render.material = material;
  parent.addChild(e);
  return e;
}

function createCustomer(app: pc.Application, name: string, coat: pc.Color): pc.Entity {
  const root = new pc.Entity(name);
  const skin = makeMat(new pc.Color(0.48, 0.38, 0.30), 0.16);
  const cloth = makeMat(coat, 0.12);
  const dark = makeMat(new pc.Color(0.035, 0.04, 0.045), 0.10);

  addPrimitive(root, 'Torso', 'capsule', new pc.Vec3(0, 1.12, 0), new pc.Vec3(0.68, 0.82, 0.46), cloth);
  addPrimitive(root, 'Head', 'sphere', new pc.Vec3(0, 1.86, 0), new pc.Vec3(0.42, 0.48, 0.42), skin);
  addPrimitive(root, 'Hair', 'sphere', new pc.Vec3(0, 2.02, 0.01), new pc.Vec3(0.43, 0.22, 0.43), dark);
  addPrimitive(root, 'LegL', 'capsule', new pc.Vec3(-0.19, 0.48, 0), new pc.Vec3(0.23, 0.62, 0.23), dark);
  addPrimitive(root, 'LegR', 'capsule', new pc.Vec3(0.19, 0.48, 0), new pc.Vec3(0.23, 0.62, 0.23), dark);
  addPrimitive(root, 'ArmL', 'capsule', new pc.Vec3(-0.43, 1.17, 0), new pc.Vec3(0.18, 0.62, 0.18), cloth).setLocalEulerAngles(0, 0, 7);
  addPrimitive(root, 'ArmR', 'capsule', new pc.Vec3(0.43, 1.17, 0), new pc.Vec3(0.18, 0.62, 0.18), cloth).setLocalEulerAngles(0, 0, -7);
  root.setLocalScale(0.86, 0.86, 0.86);
  app.root.addChild(root);
  return root;
}

export class NightOneDirector {
  private readonly app: pc.Application;
  private readonly state: GameState;
  private readonly ui: GameUI;
  private readonly camera: pc.Entity;
  private customer?: CustomerActor;
  private regularSpawned = false;
  private anomalyStarted = false;
  private anomalyTimer = 0;
  private coolerLights: pc.Entity[] = [];
  private playerWasOutside = false;
  private transactionInteractable?: Interactable;
  private lastChimeAt = -100;
  private elapsed = 0;

  constructor(app: pc.Application, world: BuiltWorld, state: GameState, ui: GameUI, camera: pc.Entity) {
    this.app = app;
    this.state = state;
    this.ui = ui;
    this.camera = camera;
    this.installRegisterTransaction(world.interactables);
    this.buildCoolerLighting();
  }

  update(dt: number): void {
    this.elapsed += dt;
    this.updateEntranceSensor();
    this.updateCustomer(dt);

    const minutes = this.state.getGameMinutes();
    if (!this.regularSpawned && (minutes >= 23 * 60 + 5 || this.elapsed > 7)) this.spawnRegular();

    if (!this.anomalyStarted && this.customer?.phase === 'done' && (minutes >= 23 * 60 + 18 || this.elapsed > 35)) {
      this.startFreezerFlicker();
    }
    if (this.anomalyStarted && this.anomalyTimer > 0) this.updateFreezerFlicker(dt);
  }

  private installRegisterTransaction(interactables: Interactable[]): void {
    const register = interactables.find((x) => x.id === 'register');
    if (!register) return;
    const normalAction = register.onInteract;
    register.onInteract = () => {
      if (this.customer?.phase === 'waiting' && !this.customer.served) {
        this.customer.served = true;
        this.customer.phase = 'leaving';
        this.customer.route = [
          new pc.Vec3(-3.1, 0, 8.0),
          new pc.Vec3(0.0, 0, 10.0),
          new pc.Vec3(0.0, 0, 13.6)
        ];
        this.customer.waypoint = 0;
        this.state.complete('first-sale');
        this.state.addTask('first-sale', 'Serve the first customer');
        this.playRegisterBeep();
        return '2 items — $6.47. Cash $10.00. Change $3.53.  "Thanks. See you tomorrow."';
      }
      return normalAction();
    };
    this.transactionInteractable = register;
  }

  private spawnRegular(): void {
    this.regularSpawned = true;
    this.state.addTask('first-sale', 'Serve the first customer');
    const root = createCustomer(this.app, 'Earl-Regular-Customer', new pc.Color(0.16, 0.20, 0.24));
    root.setPosition(0, 0, 14.0);
    root.setEulerAngles(0, 180, 0);
    this.customer = {
      root,
      phase: 'entering',
      waypoint: 0,
      speed: 1.65,
      served: false,
      route: [
        new pc.Vec3(0, 0, 10.2),
        new pc.Vec3(2.3, 0, 5.6),
        new pc.Vec3(2.3, 0, 2.4),
        new pc.Vec3(-2.8, 0, 5.2),
        new pc.Vec3(-3.7, 0, 7.45)
      ]
    };
    this.playChime();
    this.ui.showMessage('DING-DONG. Someone comes in from the pumps.', 3200);
  }

  private updateCustomer(dt: number): void {
    const c = this.customer;
    if (!c || c.phase === 'waiting' || c.phase === 'done') return;
    if (c.waypoint >= c.route.length) {
      if (c.phase === 'leaving') {
        c.phase = 'done';
        c.root.enabled = false;
        this.playChime();
        this.ui.showMessage('The door chimes again. The store is quiet.', 2600);
      } else {
        c.phase = 'waiting';
        c.root.setEulerAngles(0, 180, 0);
        this.ui.showMessage('The customer sets two items on the counter.', 2600);
      }
      return;
    }

    const pos = c.root.getPosition().clone();
    const target = c.route[c.waypoint];
    const delta = new pc.Vec3().sub2(target, pos);
    delta.y = 0;
    const distance = delta.length();
    if (distance < 0.08) {
      c.waypoint += 1;
      return;
    }
    delta.normalize();
    const step = Math.min(distance, c.speed * dt);
    pos.add(delta.mulScalar(step));
    c.root.setPosition(pos);
    const yaw = Math.atan2(-delta.x, -delta.z) * 180 / Math.PI;
    c.root.setEulerAngles(0, yaw, 0);
  }

  private buildCoolerLighting(): void {
    for (let i = 0; i < 3; i++) {
      const light = new pc.Entity(`CoolerInteriorLight-${i}`);
      light.addComponent('light', {
        type: 'omni',
        color: new pc.Color(0.58, 0.80, 0.92),
        intensity: 0.55,
        range: 3.8,
        castShadows: false
      });
      light.setPosition(2.1 + i * 2.6, 2.2, -9.65);
      this.app.root.addChild(light);
      this.coolerLights.push(light);
    }
  }

  private startFreezerFlicker(): void {
    this.anomalyStarted = true;
    this.anomalyTimer = 10;
    this.ui.showMessage('The freezer lights begin to flash.', 3600);
  }

  private updateFreezerFlicker(dt: number): void {
    this.anomalyTimer -= dt;
    const on = Math.floor(this.anomalyTimer * 7) % 2 === 0;
    for (const entity of this.coolerLights) {
      if (entity.light) entity.light.intensity = on ? 0.7 : 0.015;
    }
    if (this.anomalyTimer <= 0) {
      for (const entity of this.coolerLights) if (entity.light) entity.light.intensity = 0.55;
      this.ui.showMessage('The freezer lights stop. The hum returns to normal.', 3200);
      this.state.complete('freezer-flicker-survived');
    }
  }

  private updateEntranceSensor(): void {
    const z = this.camera.getPosition().z;
    const outside = z > 12.15;
    if (outside !== this.playerWasOutside && this.elapsed - this.lastChimeAt > 1.2) {
      this.playerWasOutside = outside;
      this.lastChimeAt = this.elapsed;
      this.playChime();
    }
  }

  private playChime(): void {
    this.tone(660, 0.07, 0.06, 0);
    this.tone(880, 0.11, 0.045, 0.09);
  }

  private playRegisterBeep(): void {
    this.tone(1180, 0.07, 0.035, 0);
    this.tone(1480, 0.05, 0.025, 0.08);
  }

  private tone(frequency: number, duration: number, volume: number, delay: number): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gain.gain.value = volume;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      const start = ctx.currentTime + delay;
      oscillator.start(start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.stop(start + duration + 0.02);
      oscillator.addEventListener('ended', () => void ctx.close());
    } catch {
      // Audio is enhancement only; gameplay must continue if the browser blocks it.
    }
  }
}
