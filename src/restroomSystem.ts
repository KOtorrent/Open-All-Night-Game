import * as pc from 'playcanvas';
import type { BuiltWorld } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

function mat(color: pc.Color, metalness = 0, gloss = 0.2): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.metalness = metalness;
  m.gloss = gloss;
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

function cylinder(app: pc.Application, name: string, pos: pc.Vec3, scale: pc.Vec3, material: pc.StandardMaterial): pc.Entity {
  const e = new pc.Entity(name);
  e.addComponent('render', { type: 'cylinder' });
  e.setPosition(pos);
  e.setLocalScale(scale);
  if (e.render) e.render.material = material;
  app.root.addChild(e);
  return e;
}

function addCollider(world: BuiltWorld, x: number, z: number, sx: number, sz: number, name: string): void {
  world.colliders.push({ minX: x - sx / 2, maxX: x + sx / 2, minZ: z - sz / 2, maxZ: z + sz / 2, name });
}

/** Night 1 restroom and its 2:00 AM knocking rule event. */
export class RestroomSystem {
  private knocking = false;
  private knockTimer = 0;
  private knockPulse = 0;
  private finished = false;
  private door?: pc.Entity;

  constructor(
    private readonly app: pc.Application,
    private readonly world: BuiltWorld,
    private readonly state: GameState,
    private readonly ui: GameUI
  ) {
    this.buildRestroom();
  }

  update(dt: number): void {
    if (this.finished) return;
    if (!this.knocking && this.state.getGameMinutes() >= 26 * 60) this.startKnocking();
    if (!this.knocking) return;

    this.knockTimer -= dt;
    this.knockPulse -= dt;
    if (this.knockPulse <= 0 && this.knockTimer > 0) {
      this.knockPulse = 3.8;
      this.ui.showMessage('KNOCK.  KNOCK.  KNOCK.', 1300);
      this.bumpDoor();
    }
    if (this.knockTimer <= 0) {
      this.knocking = false;
      this.finished = true;
      if (!this.state.isComplete('restroom-rule-broken')) {
        this.state.complete('restroom-knock-survived');
        this.ui.showMessage('The knocking stops. Nothing comes out.', 3000);
      }
    }
  }

  private buildRestroom(): void {
    const wall = mat(new pc.Color(0.36, 0.39, 0.38), 0, 0.15);
    const tile = mat(new pc.Color(0.46, 0.49, 0.46), 0, 0.30);
    const ceramic = mat(new pc.Color(0.84, 0.84, 0.78), 0, 0.52);
    const steel = mat(new pc.Color(0.38, 0.40, 0.39), 0.7, 0.44);
    const doorMat = mat(new pc.Color(0.16, 0.17, 0.17), 0.2, 0.23);

    // The restroom is now a fully enclosed room BEHIND the employee divider, with its only door
    // on the west wall facing the stock corridor. There is no restroom opening visible from the
    // sales floor anymore, so it cannot read as a second employee doorway or overlap the office.
    const cx = -1.25;
    const frontZ = -8.55;
    const backZ = -11.82;
    const leftX = -2.45;
    const rightX = -0.05;
    const doorZ = -9.62;

    box(this.app, 'RestroomFloor', new pc.Vec3(cx, 0.015, -10.18), new pc.Vec3(2.40, 0.08, 3.28), tile);
    box(this.app, 'RestroomCeiling', new pc.Vec3(cx, 3.08, -10.18), new pc.Vec3(2.40, 0.12, 3.28), wall);
    box(this.app, 'RestroomRightWall', new pc.Vec3(rightX, 1.55, -10.18), new pc.Vec3(0.16, 3.10, 3.28), wall);
    box(this.app, 'RestroomBackWall', new pc.Vec3(cx, 1.55, backZ), new pc.Vec3(2.40, 3.10, 0.16), wall);
    box(this.app, 'RestroomFrontWall', new pc.Vec3(cx, 1.55, frontZ), new pc.Vec3(2.40, 3.10, 0.16), wall);

    // West/left wall split around ONE side-facing doorway.
    box(this.app, 'RestroomLeftWallFront', new pc.Vec3(leftX, 1.55, -8.83), new pc.Vec3(0.16, 3.10, 0.56), wall);
    box(this.app, 'RestroomLeftWallBack', new pc.Vec3(leftX, 1.55, -10.95), new pc.Vec3(0.16, 3.10, 1.74), wall);
    box(this.app, 'RestroomDoorHeader', new pc.Vec3(leftX, 2.82, doorZ), new pc.Vec3(0.16, 0.56, 0.98), wall);

    this.door = box(this.app, 'RestroomDoor', new pc.Vec3(-2.39, 1.38, doorZ), new pc.Vec3(0.11, 2.70, 0.92), doorMat);
    cylinder(this.app, 'RestroomKnob', new pc.Vec3(-2.30, 1.35, -9.32), new pc.Vec3(0.09, 0.09, 0.09), steel).setEulerAngles(0, 0, 90);

    // Fixtures intentionally remain on the far/right and rear walls so nothing clips into the
    // manager office or protrudes into the stock corridor.
    cylinder(this.app, 'RestroomToiletBase', new pc.Vec3(-1.58, 0.28, -11.02), new pc.Vec3(0.52, 0.48, 0.65), ceramic);
    cylinder(this.app, 'RestroomToiletBowl', new pc.Vec3(-1.58, 0.52, -10.84), new pc.Vec3(0.60, 0.20, 0.78), ceramic);
    box(this.app, 'RestroomToiletTank', new pc.Vec3(-1.58, 0.78, -11.31), new pc.Vec3(0.72, 0.78, 0.30), ceramic);
    box(this.app, 'RestroomSink', new pc.Vec3(-0.62, 0.90, -10.02), new pc.Vec3(0.72, 0.16, 0.52), ceramic);
    cylinder(this.app, 'RestroomSinkPedestal', new pc.Vec3(-0.62, 0.46, -10.02), new pc.Vec3(0.28, 0.76, 0.28), ceramic);
    cylinder(this.app, 'RestroomFaucet', new pc.Vec3(-0.62, 1.08, -10.18), new pc.Vec3(0.07, 0.22, 0.07), steel);
    box(this.app, 'RestroomMirror', new pc.Vec3(-0.14, 1.78, -10.02), new pc.Vec3(0.05, 0.95, 0.78), steel);

    // Recognizable restroom hardware beyond the three big fixtures: dispensers, a trash can and a
    // soap pump, so the room reads as a real gas-station bathroom rather than an empty tiled box.
    box(this.app, 'ToiletPaperDispenser', new pc.Vec3(-2.30, 0.62, -11.15), new pc.Vec3(0.06, 0.22, 0.22), steel);
    cylinder(this.app, 'ToiletPaperRoll', new pc.Vec3(-2.24, 0.62, -11.15), new pc.Vec3(0.16, 0.20, 0.16), mat(new pc.Color(0.82, 0.80, 0.74), 0, 0.15)).setEulerAngles(0, 0, 90);
    box(this.app, 'PaperTowelDispenser', new pc.Vec3(-0.12, 1.55, -9.35), new pc.Vec3(0.08, 0.36, 0.30), steel);
    box(this.app, 'TrashCan', new pc.Vec3(-0.35, 0.28, -9.15), new pc.Vec3(0.34, 0.56, 0.34), mat(new pc.Color(0.16, 0.17, 0.16), 0.3, 0.2));
    cylinder(this.app, 'SoapDispenser', new pc.Vec3(-0.30, 1.02, -10.12), new pc.Vec3(0.09, 0.20, 0.09), mat(new pc.Color(0.62, 0.66, 0.30), 0, 0.4));

    const light = new pc.Entity('RestroomCeilingLight');
    light.addComponent('light', {
      type: 'omni',
      color: new pc.Color(0.82, 0.90, 0.88),
      // Boosted from 0.88: at that intensity the enclosed restroom rendered as crushed-black despite
      // the fixture being present, a confirmed human-playtest complaint. See staffAreaBuilder.ts for
      // the same empirically-verified intensity/range scale used across the staff area.
      intensity: 3.6,
      range: 5.0,
      castShadows: false
    });
    light.setPosition(cx, 2.72, -10.0);
    this.app.root.addChild(light);

    addCollider(this.world, rightX, -10.18, 0.16, 3.28, 'Restroom right wall');
    addCollider(this.world, cx, backZ, 2.40, 0.16, 'Restroom back wall');
    addCollider(this.world, cx, frontZ, 2.40, 0.16, 'Restroom front wall');
    addCollider(this.world, leftX, -8.83, 0.16, 0.56, 'Restroom left wall front');
    addCollider(this.world, leftX, -10.95, 0.16, 1.74, 'Restroom left wall back');
    addCollider(this.world, leftX + 0.03, doorZ, 0.18, 0.92, 'Restroom door');

    this.world.interactables.push({
      id: 'restroom-door',
      label: 'check restroom',
      position: new pc.Vec3(-2.78, 1.45, doorZ),
      radius: 2.15,
      aimRadius: 0.46,
      onInteract: () => this.useDoor()
    });
  }

  private startKnocking(): void {
    this.knocking = true;
    this.knockTimer = 18;
    this.knockPulse = 0.15;
    this.ui.showMessage('2:00 AM. The restroom is closed.', 2600);
  }

  private useDoor(): string {
    if (!this.knocking) {
      if (this.state.getGameMinutes() < 26 * 60) return 'Restroom is open. Fluorescent light. Bleach. Nothing unusual.';
      return 'Restroom closed at 2:00 AM.';
    }
    if (!this.state.isComplete('restroom-rule-broken')) {
      this.state.complete('restroom-rule-broken');
      this.ui.flashWarning('RULE BROKEN');
      if (this.door) this.door.setEulerAngles(0, -18, 0);
      return 'The knob turns too easily. The knocking stops immediately.';
    }
    return 'The restroom is silent now.';
  }

  private bumpDoor(): void {
    if (!this.door) return;
    this.door.setLocalScale(0.12, 2.70, 0.94);
    window.setTimeout(() => this.door?.setLocalScale(0.11, 2.70, 0.92), 90);
  }
}
