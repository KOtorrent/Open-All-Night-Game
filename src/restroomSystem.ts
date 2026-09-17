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

export class RestroomSystem {
  private readonly app: pc.Application;
  private readonly world: BuiltWorld;
  private readonly state: GameState;
  private readonly ui: GameUI;
  private knocking = false;
  private knockTimer = 0;
  private knockPulse = 0;
  private finished = false;
  private door?: pc.Entity;
  private doorInteractable?: Interactable;

  constructor(app: pc.Application, world: BuiltWorld, state: GameState, ui: GameUI) {
    this.app = app;
    this.world = world;
    this.state = state;
    this.ui = ui;
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
    const wall = mat(new pc.Color(0.24, 0.27, 0.27), 0, 0.13);
    const tile = mat(new pc.Color(0.38, 0.40, 0.37), 0, 0.28);
    const ceramic = mat(new pc.Color(0.78, 0.78, 0.70), 0, 0.50);
    const steel = mat(new pc.Color(0.32, 0.34, 0.33), 0.7, 0.42);
    const doorMat = mat(new pc.Color(0.12, 0.13, 0.12), 0.2, 0.22);

    // Small customer restroom tucked between office and stock area.
    box(this.app, 'RestroomFloor', new pc.Vec3(-3.95, 0.01, -10.25), new pc.Vec3(1.95, 0.08, 3.25), tile);
    box(this.app, 'RestroomLeftWall', new pc.Vec3(-4.95, 1.55, -10.25), new pc.Vec3(0.12, 3.1, 3.3), wall);
    box(this.app, 'RestroomRightWall', new pc.Vec3(-2.95, 1.55, -10.25), new pc.Vec3(0.12, 3.1, 3.3), wall);
    box(this.app, 'RestroomBackWall', new pc.Vec3(-3.95, 1.55, -11.82), new pc.Vec3(2.1, 3.1, 0.12), wall);
    box(this.app, 'RestroomFrontWallL', new pc.Vec3(-4.60, 1.55, -8.64), new pc.Vec3(0.75, 3.1, 0.12), wall);
    box(this.app, 'RestroomFrontWallR', new pc.Vec3(-3.30, 1.55, -8.64), new pc.Vec3(0.75, 3.1, 0.12), wall);

    const door = box(this.app, 'RestroomDoor', new pc.Vec3(-3.95, 1.42, -8.57), new pc.Vec3(0.80, 2.82, 0.09), doorMat);
    this.door = door;
    cylinder(this.app, 'RestroomKnob', new pc.Vec3(-3.66, 1.38, -8.49), new pc.Vec3(0.09, 0.09, 0.09), steel).setEulerAngles(90, 0, 0);

    // Recognizable fixture silhouettes inside the room.
    const toiletBase = cylinder(this.app, 'RestroomToiletBase', new pc.Vec3(-4.25, 0.28, -11.0), new pc.Vec3(0.52, 0.48, 0.65), ceramic);
    toiletBase.setEulerAngles(0, 0, 0);
    cylinder(this.app, 'RestroomToiletBowl', new pc.Vec3(-4.25, 0.52, -10.85), new pc.Vec3(0.60, 0.20, 0.78), ceramic);
    box(this.app, 'RestroomToiletTank', new pc.Vec3(-4.25, 0.78, -11.33), new pc.Vec3(0.72, 0.78, 0.30), ceramic);
    box(this.app, 'RestroomSink', new pc.Vec3(-3.42, 0.90, -9.62), new pc.Vec3(0.72, 0.16, 0.52), ceramic);
    cylinder(this.app, 'RestroomSinkPedestal', new pc.Vec3(-3.42, 0.46, -9.62), new pc.Vec3(0.28, 0.76, 0.28), ceramic);
    cylinder(this.app, 'RestroomFaucet', new pc.Vec3(-3.42, 1.08, -9.78), new pc.Vec3(0.07, 0.22, 0.07), steel);
    box(this.app, 'RestroomMirror', new pc.Vec3(-2.87, 1.78, -9.62), new pc.Vec3(0.05, 0.95, 0.78), steel);

    // Closed door collision; restroom is deliberately not a gameplay room yet.
    this.world.colliders.push({ minX: -4.36, maxX: -3.54, minZ: -8.68, maxZ: -8.48, name: 'Restroom door' });

    const interactable: Interactable = {
      id: 'restroom-door',
      label: 'check restroom',
      position: new pc.Vec3(-3.95, 1.45, -8.15),
      radius: 2.2,
      onInteract: () => this.useDoor()
    };
    this.doorInteractable = interactable;
    this.world.interactables.push(interactable);
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
    this.door.setLocalScale(0.82, 2.82, 0.10);
    window.setTimeout(() => this.door?.setLocalScale(0.80, 2.82, 0.09), 90);
  }
}
