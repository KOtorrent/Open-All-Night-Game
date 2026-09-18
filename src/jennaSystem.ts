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

/** Ordinary local customer used to keep Night 1 mundane between larger events. */
export class JennaSystem {
  private actor?: Actor;
  private spawned = false;
  private items: pc.Entity[] = [];

  constructor(private readonly app: pc.Application, private readonly world: BuiltWorld, private readonly state: GameState, private readonly ui: GameUI) {
    this.wrapRegister();
  }

  update(dt: number): void {
    const minute = this.state.getGameMinutes();
    if (!this.spawned && minute >= 24 * 60 + 55 && !this.state.isComplete('jenna-sale')) this.spawn();
    this.updateActor(dt);
  }

  private wrapRegister(): void {
    const register = this.world.interactables.find((x) => x.id === 'register');
    if (!register) return;
    const fallback = register.onInteract;
    register.onInteract = () => {
      if (this.actor?.phase === 'waiting' && !this.state.isComplete('jenna-sale')) {
        this.state.complete('jenna-sale');
        this.clearItems();
        this.actor.phase = 'leaving';
        this.actor.route = [new pc.Vec3(-2.05, 0, 8.5), new pc.Vec3(0, 0, 10.4), new pc.Vec3(0, 0, 13.8)];
        this.actor.waypoint = 0;
        return 'Milk, aspirin, and crackers — $9.41. Cash $20.00. Change $10.59.  Jenna says, "My kid picked a hell of a night to get sick."';
      }
      return fallback();
    };
  }

  private spawn(): void {
    this.spawned = true;
    this.state.addTask('jenna-sale', 'Serve Jenna');
    const root = new pc.Entity('Jenna');
    const skin = mat(new pc.Color(0.58, 0.43, 0.34));
    const jacket = mat(new pc.Color(0.17, 0.22, 0.29), 0.12);
    const jeans = mat(new pc.Color(0.07, 0.10, 0.16), 0.10);
    const hair = mat(new pc.Color(0.07, 0.045, 0.03), 0.10);
    part(root, 'Torso', 'capsule', new pc.Vec3(0, 1.12, 0), new pc.Vec3(0.62, 0.78, 0.42), jacket);
    part(root, 'Head', 'sphere', new pc.Vec3(0, 1.82, 0), new pc.Vec3(0.39, 0.45, 0.39), skin);
    part(root, 'Hair', 'sphere', new pc.Vec3(0, 1.98, 0.02), new pc.Vec3(0.41, 0.24, 0.41), hair);
    part(root, 'LegL', 'capsule', new pc.Vec3(-0.18, 0.48, 0), new pc.Vec3(0.21, 0.60, 0.21), jeans);
    part(root, 'LegR', 'capsule', new pc.Vec3(0.18, 0.48, 0), new pc.Vec3(0.21, 0.60, 0.21), jeans);
    part(root, 'ArmL', 'capsule', new pc.Vec3(-0.39, 1.15, 0), new pc.Vec3(0.16, 0.58, 0.16), jacket);
    part(root, 'ArmR', 'capsule', new pc.Vec3(0.39, 1.15, 0), new pc.Vec3(0.16, 0.58, 0.16), jacket);
    // Every other Night 1 customer (Earl, LateNightTraveler, Dale, Marcus) applies a ~0.86-0.88
    // root scale to land at normal adult height; Jenna was missing this, so she rendered noticeably
    // taller than every other customer — the "accidental asset scaling" VISUAL_TARGET.md's character
    // rule explicitly calls out as unacceptable, confirmed by comparing her un-scaled head-top height
    // against the others' scaled height.
    root.setLocalScale(0.86, 0.86, 0.86);
    root.setPosition(0, 0, 14.0);
    root.setEulerAngles(0, 180, 0);
    this.app.root.addChild(root);
    this.actor = {
      root,
      phase: 'entering',
      route: [new pc.Vec3(0, 0, 10.2), new pc.Vec3(5.2, 0, 5.1), new pc.Vec3(5.0, 0, -3.8), new pc.Vec3(-1.8, 0, 0.3), new pc.Vec3(-3.40, 0, 7.45)],
      waypoint: 0,
      speed: 1.55
    };
    this.ui.showMessage('DING-DONG. Jenna hurries in, already looking tired.', 2800);
  }

  private updateActor(dt: number): void {
    const c = this.actor;
    if (!c || c.phase === 'waiting' || c.phase === 'done') return;
    if (c.waypoint >= c.route.length) {
      if (c.phase === 'leaving') {
        c.phase = 'done';
        c.root.enabled = false;
        return;
      }
      c.phase = 'waiting';
      c.root.setEulerAngles(0, 180, 0);
      this.spawnItems();
      this.ui.showMessage('Jenna sets milk, aspirin, and crackers on the counter.', 2600);
      return;
    }
    const pos = c.root.getPosition().clone();
    const target = c.route[c.waypoint];
    const delta = new pc.Vec3().sub2(target, pos); delta.y = 0;
    const distance = delta.length();
    if (distance < 0.08) { c.waypoint += 1; return; }
    delta.normalize();
    pos.add(delta.mulScalar(Math.min(distance, c.speed * dt)));
    c.root.setPosition(pos);
    c.root.setEulerAngles(0, Math.atan2(-delta.x, -delta.z) * 180 / Math.PI, 0);
  }

  private spawnItems(): void {
    const white = mat(new pc.Color(0.72, 0.72, 0.66), 0.12);
    const blue = mat(new pc.Color(0.10, 0.26, 0.42), 0.14);
    const red = mat(new pc.Color(0.52, 0.08, 0.06), 0.12);
    const specs: Array<[string, pc.Vec3, pc.Vec3, pc.StandardMaterial]> = [
      ['JennaMilk', new pc.Vec3(-4.05, 1.46, 8.12), new pc.Vec3(0.28, 0.58, 0.28), white],
      ['JennaAspirin', new pc.Vec3(-3.65, 1.44, 8.14), new pc.Vec3(0.24, 0.34, 0.18), blue],
      ['JennaCrackers', new pc.Vec3(-3.29, 1.44, 8.12), new pc.Vec3(0.34, 0.42, 0.16), red]
    ];
    for (const [name, pos, scale, material] of specs) {
      const e = new pc.Entity(name); e.addComponent('render', { type: 'box' }); e.setPosition(pos); e.setLocalScale(scale); if (e.render) e.render.material = material; this.app.root.addChild(e); this.items.push(e);
    }
  }

  private clearItems(): void { for (const item of this.items) item.destroy(); this.items.length = 0; }
}
