import * as pc from 'playcanvas';
import type { BuiltWorld, Interactable } from './gameTypes';
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
    // IMPORTANT: the manager office is authored exclusively by staffAreaBuilder.
    // This system owns only the restroom so the two rooms can never overlap/duplicate again.
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
    const wall = mat(new pc.Color(0.34, 0.37, 0.36), 0, 0.15);
    const tile = mat(new pc.Color(0.44, 0.46, 0.43), 0, 0.30);
    const ceramic = mat(new pc.Color(0.82, 0.82, 0.74), 0, 0.52);
    const steel = mat(new pc.Color(0.36, 0.38, 0.37), 0.7, 0.44);
    const doorMat = mat(new pc.Color(0.17, 0.18, 0.17), 0.2, 0.23);

    // Dedicated room on the right side of the stock area. There is a full stock/utility gap
    // between this room and the manager office on the far left.
    const cx = -1.25;
    const frontZ = -8.55;
    const backZ = -11.82;
    const leftX = -2.45;
    const rightX = -0.05;

    box(this.app, 'RestroomFloor', new pc.Vec3(cx, 0.015, -10.18), new pc.Vec3(2.40, 0.08, 3.28), tile);
    box(this.app, 'RestroomCeiling', new pc.Vec3(cx, 3.08, -10.18), new pc.Vec3(2.40, 0.12, 3.28), wall);
    box(this.app, 'RestroomLeftWall', new pc.Vec3(leftX, 1.55, -10.18), new pc.Vec3(0.16, 3.10, 3.28), wall);
    box(this.app, 'RestroomRightWall', new pc.Vec3(rightX, 1.55, -10.18), new pc.Vec3(0.16, 3.10, 3.28), wall);
    box(this.app, 'RestroomBackWall', new pc.Vec3(cx, 1.55, backZ), new pc.Vec3(2.40, 3.10, 0.16), wall);

    // Front wall is split around ONE doorway and includes a header so there is no see-through gap.
    box(this.app, 'RestroomFrontWallL', new pc.Vec3(-2.04, 1.55, frontZ), new pc.Vec3(0.66, 3.10, 0.16), wall);
    box(this.app, 'RestroomFrontWallR', new pc.Vec3(-0.46, 1.55, frontZ), new pc.Vec3(0.66, 3.10, 0.16), wall);
    box(this.app, 'RestroomDoorHeader', new pc.Vec3(cx, 2.82, frontZ), new pc.Vec3(0.92, 0.56, 0.16), wall);

    this.door = box(this.app, 'RestroomDoor', new pc.Vec3(cx, 1.38, -8.48), new pc.Vec3(0.90, 2.70, 0.11), doorMat);
    cylinder(this.app, 'RestroomKnob', new pc.Vec3(-0.93, 1.35, -8.40), new pc.Vec3(0.09, 0.09, 0.09), steel).setEulerAngles(90, 0, 0);

    cylinder(this.app, 'RestroomToiletBase', new pc.Vec3(-1.70, 0.28, -11.00), new pc.Vec3(0.52, 0.48, 0.65), ceramic);
    cylinder(this.app, 'RestroomToiletBowl', new pc.Vec3(-1.70, 0.52, -10.84), new pc.Vec3(0.60, 0.20, 0.78), ceramic);
    box(this.app, 'RestroomToiletTank', new pc.Vec3(-1.70, 0.78, -11.31), new pc.Vec3(0.72, 0.78, 0.30), ceramic);
    box(this.app, 'RestroomSink', new pc.Vec3(-0.72, 0.90, -9.60), new pc.Vec3(0.72, 0.16, 0.52), ceramic);
    cylinder(this.app, 'RestroomSinkPedestal', new pc.Vec3(-0.72, 0.46, -9.60), new pc.Vec3(0.28, 0.76, 0.28), ceramic);
    cylinder(this.app, 'RestroomFaucet', new pc.Vec3(-0.72, 1.08, -9.76), new pc.Vec3(0.07, 0.22, 0.07), steel);
    box(this.app, 'RestroomMirror', new pc.Vec3(-0.14, 1.78, -9.60), new pc.Vec3(0.05, 0.95, 0.78), steel);

    // Bright enough to read clearly but still colder than the manager office.
    const light = new pc.Entity('RestroomCeilingLight');
    light.addComponent('light', {
      type: 'omni',
      color: new pc.Color(0.80, 0.88, 0.86),
      intensity: 0.78,
      range: 4.0,
      castShadows: false
    });
    light.setPosition(cx, 2.72, -10.0);
    this.app.root.addChild(light);

    addCollider(this.world, leftX, -10.18, 0.16, 3.28, 'Restroom left wall');
    addCollider(this.world, rightX, -10.18, 0.16, 3.28, 'Restroom right wall');
    addCollider(this.world, cx, backZ, 2.40, 0.16, 'Restroom back wall');
    addCollider(this.world, -2.04, frontZ, 0.66, 0.16, 'Restroom front wall L');
    addCollider(this.world, -0.46, frontZ, 0.66, 0.16, 'Restroom front wall R');
    addCollider(this.world, cx, frontZ + 0.03, 0.90, 0.18, 'Restroom door');

    this.world.interactables.push({
      id: 'restroom-door',
      label: 'check restroom',
      position: new pc.Vec3(cx, 1.45, -8.18),
      radius: 2.25,
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
    this.door.setLocalScale(0.92, 2.70, 0.12);
    window.setTimeout(() => this.door?.setLocalScale(0.90, 2.70, 0.11), 90);
  }
}
