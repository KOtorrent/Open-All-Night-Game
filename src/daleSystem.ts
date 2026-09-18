import * as pc from 'playcanvas';
import type { BuiltWorld, Interactable } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

type Phase = 'entering' | 'wandering' | 'waiting' | 'leaving' | 'done';

interface DaleActor {
  root: pc.Entity;
  phase: Phase;
  route: pc.Vec3[];
  waypoint: number;
  speed: number;
}

function mat(color: pc.Color, gloss = 0.16): pc.StandardMaterial {
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
 * Dale is deliberately suspicious-looking and completely harmless. Keeping that promise is
 * important to the game's rule uncertainty: not every uncomfortable person is supernatural.
 */
export class DaleSystem {
  private readonly app: pc.Application;
  private readonly world: BuiltWorld;
  private readonly state: GameState;
  private readonly ui: GameUI;
  private actor?: DaleActor;
  private spawned = false;
  private talk?: Interactable;
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
    if (!this.spawned && minute >= 26 * 60 + 5 && !this.state.isComplete('dale-sale')) this.spawn();
    this.updateActor(dt);
  }

  private wrapRegister(): void {
    const register = this.world.interactables.find((x) => x.id === 'register');
    if (!register) return;
    const fallback = register.onInteract;
    register.onInteract = () => {
      if (this.actor?.phase === 'waiting' && !this.state.isComplete('dale-sale')) {
        this.state.complete('dale-sale');
        this.state.complete('dale-was-fine');
        this.removeTalk();
        this.clearItems();
        this.actor.phase = 'leaving';
        this.actor.route = [new pc.Vec3(-0.85, 0, 8.4), new pc.Vec3(0, 0, 10.4), new pc.Vec3(0, 0, 13.8)];
        this.actor.waypoint = 0;
        this.beep();
        return 'Jerky and a root beer — $5.84.  Dale counts exact change twice, nods, and says, "Long night."';
      }
      return fallback();
    };
  }

  private spawn(): void {
    this.spawned = true;
    this.state.addTask('dale-sale', 'Serve Dale');

    const root = new pc.Entity('Dale');
    const skin = mat(new pc.Color(0.42, 0.31, 0.23), 0.12);
    const flannel = mat(new pc.Color(0.19, 0.045, 0.035), 0.10);
    const vest = mat(new pc.Color(0.10, 0.105, 0.09), 0.10);
    const denim = mat(new pc.Color(0.055, 0.08, 0.12), 0.10);
    const cap = mat(new pc.Color(0.025, 0.027, 0.025), 0.08);

    part(root, 'Torso', 'capsule', new pc.Vec3(0, 1.12, 0), new pc.Vec3(0.76, 0.86, 0.50), flannel);
    part(root, 'Vest', 'box', new pc.Vec3(0, 1.20, -0.18), new pc.Vec3(0.58, 0.70, 0.16), vest);
    part(root, 'Head', 'sphere', new pc.Vec3(0, 1.90, 0), new pc.Vec3(0.44, 0.49, 0.44), skin);
    part(root, 'Cap', 'cylinder', new pc.Vec3(0, 2.09, 0), new pc.Vec3(0.45, 0.12, 0.45), cap);
    part(root, 'LegL', 'capsule', new pc.Vec3(-0.20, 0.48, 0), new pc.Vec3(0.24, 0.62, 0.24), denim);
    part(root, 'LegR', 'capsule', new pc.Vec3(0.20, 0.48, 0), new pc.Vec3(0.24, 0.62, 0.24), denim);
    part(root, 'ArmL', 'capsule', new pc.Vec3(-0.46, 1.18, 0), new pc.Vec3(0.19, 0.64, 0.19), flannel);
    part(root, 'ArmR', 'capsule', new pc.Vec3(0.46, 1.18, 0), new pc.Vec3(0.19, 0.64, 0.19), flannel);
    root.setLocalScale(0.88, 0.88, 0.88);
    root.setPosition(0, 0, 14.0);
    root.setEulerAngles(0, 180, 0);
    this.app.root.addChild(root);

    this.actor = {
      root,
      phase: 'entering',
      route: [
        new pc.Vec3(0, 0, 10.3),
        new pc.Vec3(-5.5, 0, 4.5),
        new pc.Vec3(-5.0, 0, -4.8),
        new pc.Vec3(4.9, 0, -7.1),
        new pc.Vec3(4.9, 0, -8.3),
        new pc.Vec3(-2.40, 0, 7.45)
      ],
      waypoint: 0,
      speed: 1.45
    };

    this.chime();
    this.ui.showMessage('DING-DONG. Dale comes in, glances at you, then heads straight for the back aisle.', 3600);
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
      this.installTalk();
      this.ui.showMessage('Dale sets jerky and a root beer on the counter. He does not smile.', 3000);
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

  private installTalk(): void {
    if (this.talk) return;
    this.talk = {
      id: 'dale-talk',
      label: 'talk to Dale',
      position: new pc.Vec3(-2.40, 1.55, 7.45),
      radius: 2.5,
      aimRadius: 0.42,
      onInteract: () => {
        this.state.complete('dale-talked');
        return 'Dale: "You’re Daniel’s replacement? ...Huh."  He looks toward Aisle 4. "Coffee still terrible?"';
      }
    };
    this.world.interactables.push(this.talk);
  }

  private removeTalk(): void {
    if (!this.talk) return;
    const i = this.world.interactables.indexOf(this.talk);
    if (i >= 0) this.world.interactables.splice(i, 1);
    this.talk = undefined;
  }

  private spawnItems(): void {
    const darkRed = mat(new pc.Color(0.32, 0.055, 0.035), 0.18);
    const brown = mat(new pc.Color(0.20, 0.09, 0.035), 0.16);
    const cream = mat(new pc.Color(0.62, 0.56, 0.38), 0.16);

    const bottle = new pc.Entity('DaleRootBeer');
    part(bottle, 'Bottle', 'cylinder', new pc.Vec3(0, 0.17, 0), new pc.Vec3(0.20, 0.34, 0.20), brown);
    part(bottle, 'Cap', 'cylinder', new pc.Vec3(0, 0.39, 0), new pc.Vec3(0.11, 0.05, 0.11), cream);
    bottle.setPosition(-3.05, 1.39, 8.16);
    this.app.root.addChild(bottle);

    const jerky = new pc.Entity('DaleJerky');
    part(jerky, 'Bag', 'box', new pc.Vec3(0, 0.13, 0), new pc.Vec3(0.34, 0.26, 0.10), darkRed).setLocalEulerAngles(0, -10, 4);
    jerky.setPosition(-2.57, 1.39, 8.13);
    this.app.root.addChild(jerky);
    this.items.push(bottle, jerky);
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
