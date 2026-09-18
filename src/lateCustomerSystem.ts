import * as pc from 'playcanvas';
import type { BuiltWorld } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

type Phase = 'entering' | 'shopping' | 'waiting' | 'leaving' | 'done';

interface Actor {
  root: pc.Entity;
  phase: Phase;
  route: pc.Vec3[];
  waypoint: number;
  speed: number;
}

function mat(color: pc.Color, gloss = 0.18): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.gloss = gloss;
  m.update();
  return m;
}

function part(parent: pc.Entity, name: string, type: 'box' | 'sphere' | 'cylinder' | 'capsule', pos: pc.Vec3, scale: pc.Vec3, material: pc.StandardMaterial): pc.Entity {
  const e = new pc.Entity(name);
  e.addComponent('render', { type });
  e.setLocalPosition(pos);
  e.setLocalScale(scale);
  if (e.render) e.render.material = material;
  parent.addChild(e);
  return e;
}

/**
 * A second completely ordinary sale later in Night 1. The point is pacing: after the first
 * supernatural beats, the game returns to boring retail work instead of becoming a nonstop
 * haunted-house sequence.
 */
export class LateCustomerSystem {
  private readonly app: pc.Application;
  private readonly world: BuiltWorld;
  private readonly state: GameState;
  private readonly ui: GameUI;
  private actor?: Actor;
  private spawned = false;
  private items: pc.Entity[] = [];

  constructor(app: pc.Application, world: BuiltWorld, state: GameState, ui: GameUI) {
    this.app = app;
    this.world = world;
    this.state = state;
    this.ui = ui;
    this.wrapRegister();
  }

  update(dt: number): void {
    const minute = this.state.getGameMinutes();
    const silentResolved = this.state.isComplete('silent-customer-survived') || this.state.isComplete('silent-rule-broken');
    if (!this.spawned && minute >= 25 * 60 + 10 && silentResolved && !this.state.isComplete('late-sale')) {
      this.spawn();
    }
    this.updateActor(dt);
  }

  private wrapRegister(): void {
    const register = this.world.interactables.find((item) => item.id === 'register');
    if (!register) return;
    const fallback = register.onInteract;
    register.onInteract = () => {
      if (this.actor?.phase === 'waiting' && !this.state.isComplete('late-sale')) {
        this.state.complete('late-sale');
        this.actor.phase = 'leaving';
        this.actor.route = [
          new pc.Vec3(-2.1, 0, 8.0),
          new pc.Vec3(0.0, 0, 10.3),
          new pc.Vec3(0.0, 0, 13.8)
        ];
        this.actor.waypoint = 0;
        this.clearItems();
        this.beep();
        return 'Water, chips, and a lottery ticket — $8.12.  "Road’s dead tonight. Be careful out here."';
      }
      return fallback();
    };
  }

  private spawn(): void {
    this.spawned = true;
    this.state.addTask('late-sale', 'Serve the late-night traveler');

    const root = new pc.Entity('LateNightTraveler');
    const skin = mat(new pc.Color(0.44, 0.33, 0.25), 0.14);
    const jacket = mat(new pc.Color(0.18, 0.12, 0.075), 0.12);
    const jeans = mat(new pc.Color(0.07, 0.11, 0.16), 0.10);
    const dark = mat(new pc.Color(0.025, 0.028, 0.03), 0.10);

    part(root, 'Torso', 'capsule', new pc.Vec3(0, 1.12, 0), new pc.Vec3(0.70, 0.84, 0.48), jacket);
    part(root, 'Head', 'sphere', new pc.Vec3(0, 1.88, 0), new pc.Vec3(0.42, 0.48, 0.42), skin);
    part(root, 'Cap', 'cylinder', new pc.Vec3(0, 2.08, 0), new pc.Vec3(0.44, 0.12, 0.44), dark);
    part(root, 'LegL', 'capsule', new pc.Vec3(-0.19, 0.48, 0), new pc.Vec3(0.23, 0.62, 0.23), jeans);
    part(root, 'LegR', 'capsule', new pc.Vec3(0.19, 0.48, 0), new pc.Vec3(0.23, 0.62, 0.23), jeans);
    part(root, 'ArmL', 'capsule', new pc.Vec3(-0.43, 1.17, 0), new pc.Vec3(0.18, 0.62, 0.18), jacket);
    part(root, 'ArmR', 'capsule', new pc.Vec3(0.43, 1.17, 0), new pc.Vec3(0.18, 0.62, 0.18), jacket);
    root.setLocalScale(0.86, 0.86, 0.86);
    root.setPosition(0, 0, 14.0);
    root.setEulerAngles(0, 180, 0);
    this.app.root.addChild(root);

    this.actor = {
      root,
      phase: 'entering',
      waypoint: 0,
      speed: 1.72,
      route: [
        new pc.Vec3(0, 0, 10.3),
        new pc.Vec3(5.8, 0, 7.0),
        new pc.Vec3(5.0, 0, 1.5),
        new pc.Vec3(1.8, 0, -4.2),
        new pc.Vec3(-2.90, 0, 7.45)
      ]
    };

    this.chime();
    this.ui.showMessage('DING-DONG. Headlights sweep the windows and another customer comes in.', 3400);
  }

  private updateActor(dt: number): void {
    const actor = this.actor;
    if (!actor || actor.phase === 'waiting' || actor.phase === 'done') return;

    if (actor.waypoint >= actor.route.length) {
      if (actor.phase === 'leaving') {
        actor.phase = 'done';
        actor.root.enabled = false;
        this.chime();
        return;
      }
      actor.phase = 'waiting';
      actor.root.setEulerAngles(0, 180, 0);
      this.spawnItems();
      this.ui.showMessage('The traveler puts water, chips, and a lottery slip on the counter.', 3000);
      return;
    }

    const pos = actor.root.getPosition().clone();
    const target = actor.route[actor.waypoint];
    const delta = new pc.Vec3().sub2(target, pos);
    delta.y = 0;
    const distance = delta.length();
    if (distance < 0.08) {
      actor.waypoint += 1;
      return;
    }
    delta.normalize();
    pos.add(delta.clone().mulScalar(Math.min(distance, actor.speed * dt)));
    actor.root.setPosition(pos);
    actor.root.setEulerAngles(0, Math.atan2(-delta.x, -delta.z) * 180 / Math.PI, 0);
  }

  private spawnItems(): void {
    if (this.items.length) return;
    const water = mat(new pc.Color(0.10, 0.32, 0.42), 0.38);
    const cap = mat(new pc.Color(0.78, 0.80, 0.74), 0.25);
    const chips = mat(new pc.Color(0.62, 0.28, 0.025), 0.18);
    const paper = mat(new pc.Color(0.68, 0.67, 0.56), 0.08);

    const bottle = new pc.Entity('LateSaleWater');
    part(bottle, 'Body', 'cylinder', new pc.Vec3(0, 0.16, 0), new pc.Vec3(0.18, 0.32, 0.18), water);
    part(bottle, 'Cap', 'cylinder', new pc.Vec3(0, 0.35, 0), new pc.Vec3(0.10, 0.06, 0.10), cap);
    bottle.setPosition(-3.50, 1.39, 8.15);
    this.app.root.addChild(bottle);

    const bag = new pc.Entity('LateSaleChips');
    const bagMesh = part(bag, 'Bag', 'box', new pc.Vec3(0, 0.12, 0), new pc.Vec3(0.40, 0.24, 0.13), chips);
    bagMesh.setLocalEulerAngles(0, 18, -6);
    bag.setPosition(-3.02, 1.39, 8.12);
    this.app.root.addChild(bag);

    const ticket = new pc.Entity('LateSaleLotterySlip');
    part(ticket, 'Slip', 'box', new pc.Vec3(0, 0.012, 0), new pc.Vec3(0.22, 0.018, 0.42), paper);
    ticket.setPosition(-2.65, 1.405, 8.15);
    ticket.setEulerAngles(0, -12, 0);
    this.app.root.addChild(ticket);

    this.items.push(bottle, bag, ticket);
  }

  private clearItems(): void {
    for (const item of this.items) item.destroy();
    this.items.length = 0;
  }

  private chime(): void {
    this.tone(660, 0.07, 0.05, 0);
    this.tone(880, 0.11, 0.04, 0.09);
  }

  private beep(): void {
    this.tone(1180, 0.07, 0.03, 0);
    this.tone(1480, 0.05, 0.02, 0.08);
  }

  private tone(frequency: number, duration: number, volume: number, delay: number): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.value = volume;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      const start = ctx.currentTime + delay;
      oscillator.start(start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.stop(start + duration + 0.02);
      oscillator.addEventListener('ended', () => void ctx.close());
    } catch {
      // Audio enhancement only.
    }
  }
}
