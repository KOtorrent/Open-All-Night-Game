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
 * A deliberately boring 3:40-ish customer to keep the night anchored in retail work. Marcus is a
 * local road worker grabbing coffee and chips on his way to an early job. Nothing supernatural
 * happens; that normality gives the surrounding horror beats room to breathe.
 */
export class MarcusSystem {
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
    if (!this.spawned && minute >= 27 * 60 + 42 && this.state.isComplete('dale-sale') && !this.state.isComplete('marcus-sale')) {
      this.spawn();
    }
    this.updateActor(dt);
  }

  private wrapRegister(): void {
    const register = this.world.interactables.find((x) => x.id === 'register');
    if (!register) return;
    const fallback = register.onInteract;
    register.onInteract = () => {
      if (this.actor?.phase === 'waiting' && !this.state.isComplete('marcus-sale')) {
        this.state.complete('marcus-sale');
        this.clearItems();
        this.actor.phase = 'leaving';
        this.actor.route = [new pc.Vec3(-2.2, 0, 8.5), new pc.Vec3(0, 0, 10.4), new pc.Vec3(0, 0, 13.8)];
        this.actor.waypoint = 0;
        this.beep();
        return 'Large coffee, chips, and gum — $7.26. Cash $10.00. Change $2.74.  Marcus says, "See you tomorrow night."';
      }
      return fallback();
    };
  }

  private spawn(): void {
    this.spawned = true;
    this.state.addTask('marcus-sale', 'Serve Marcus');

    const root = new pc.Entity('Marcus-Regular');
    const skin = mat(new pc.Color(0.43, 0.32, 0.23), 0.12);
    const workShirt = mat(new pc.Color(0.16, 0.25, 0.19), 0.10);
    const pants = mat(new pc.Color(0.055, 0.065, 0.07), 0.10);
    const cap = mat(new pc.Color(0.08, 0.08, 0.07), 0.08);

    part(root, 'Torso', 'capsule', new pc.Vec3(0, 1.12, 0), new pc.Vec3(0.72, 0.84, 0.48), workShirt);
    part(root, 'Head', 'sphere', new pc.Vec3(0, 1.88, 0), new pc.Vec3(0.42, 0.48, 0.42), skin);
    part(root, 'Cap', 'cylinder', new pc.Vec3(0, 2.08, 0), new pc.Vec3(0.44, 0.12, 0.44), cap);
    part(root, 'LegL', 'capsule', new pc.Vec3(-0.19, 0.48, 0), new pc.Vec3(0.23, 0.62, 0.23), pants);
    part(root, 'LegR', 'capsule', new pc.Vec3(0.19, 0.48, 0), new pc.Vec3(0.23, 0.62, 0.23), pants);
    part(root, 'ArmL', 'capsule', new pc.Vec3(-0.43, 1.17, 0), new pc.Vec3(0.18, 0.62, 0.18), workShirt);
    part(root, 'ArmR', 'capsule', new pc.Vec3(0.43, 1.17, 0), new pc.Vec3(0.18, 0.62, 0.18), workShirt);
    root.setLocalScale(0.87, 0.87, 0.87);
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
        new pc.Vec3(6.0, 0, 8.4),
        new pc.Vec3(6.0, 0, 7.6),
        new pc.Vec3(1.4, 0, 4.8),
        new pc.Vec3(-3.55, 0, 7.35)
      ]
    };

    this.chime();
    this.ui.showMessage('DING-DONG. Marcus comes in wearing a reflective work jacket, already looking half-awake.', 3400);
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
      this.ui.showMessage('Marcus sets a coffee, chips, and a pack of gum on the counter.', 2600);
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
    const cupMat = mat(new pc.Color(0.78, 0.71, 0.54), 0.12);
    const lidMat = mat(new pc.Color(0.08, 0.07, 0.06), 0.18);
    const chipsMat = mat(new pc.Color(0.16, 0.30, 0.54), 0.18);
    const gumMat = mat(new pc.Color(0.20, 0.54, 0.33), 0.22);

    const cup = new pc.Entity('MarcusCoffee');
    part(cup, 'Cup', 'cylinder', new pc.Vec3(0, 0.16, 0), new pc.Vec3(0.23, 0.32, 0.23), cupMat);
    part(cup, 'Lid', 'cylinder', new pc.Vec3(0, 0.34, 0), new pc.Vec3(0.25, 0.05, 0.25), lidMat);
    cup.setPosition(-4.28, 1.39, 8.14);
    this.app.root.addChild(cup);

    const chips = new pc.Entity('MarcusChips');
    const bag = part(chips, 'Bag', 'box', new pc.Vec3(0, 0.13, 0), new pc.Vec3(0.42, 0.26, 0.14), chipsMat);
    bag.setLocalEulerAngles(0, 12, -5);
    chips.setPosition(-3.82, 1.39, 8.12);
    this.app.root.addChild(chips);

    const gum = new pc.Entity('MarcusGum');
    part(gum, 'Pack', 'box', new pc.Vec3(0, 0.035, 0), new pc.Vec3(0.31, 0.07, 0.15), gumMat);
    gum.setPosition(-3.45, 1.39, 8.12);
    gum.setEulerAngles(0, -8, 0);
    this.app.root.addChild(gum);

    this.items.push(cup, chips, gum);
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
      // Audio feedback must never block gameplay.
    }
  }
}
