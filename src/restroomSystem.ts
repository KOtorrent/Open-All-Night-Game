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
    this.rebuildStaffArea();
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

  private rebuildStaffArea(): void {
    const officeWall = mat(new pc.Color(0.22, 0.235, 0.225), 0, 0.14);
    const officeFloor = mat(new pc.Color(0.09, 0.085, 0.075), 0, 0.20);
    const trim = mat(new pc.Color(0.055, 0.06, 0.06), 0.45, 0.24);
    const warm = mat(new pc.Color(0.46, 0.39, 0.25), 0, 0.23);

    // Remove stale stock-shelf collision bounds from the original blockout before relocating them.
    for (let i = this.world.colliders.length - 1; i >= 0; i--) {
      const name = this.world.colliders[i].name;
      if (name === 'Stock shelf A' || name === 'Stock shelf B') this.world.colliders.splice(i, 1);
    }

    // Shift stock storage into the center of the staff room so the office can become a real separate room.
    const shelfA = this.app.root.findByName('StockShelfA');
    const shelfB = this.app.root.findByName('StockShelfB');
    shelfA?.setPosition(-5.25, 1.35, -9.55);
    shelfB?.setPosition(-4.15, 1.35, -10.15);
    this.world.colliders.push({ minX: -5.60, maxX: -4.90, minZ: -11.55, maxZ: -7.55, name: 'Stock shelf A' });
    this.world.colliders.push({ minX: -4.50, maxX: -3.80, minZ: -11.45, maxZ: -8.85, name: 'Stock shelf B' });

    for (let i = 0; i < 7; i++) {
      this.app.root.findByName(`StockBox-${i}`)?.setPosition(
        -5.15 + (i % 2) * 1.0,
        0.52 + (i % 3) * 0.62,
        -10.85 + (i % 2) * 1.15
      );
    }

    // Manager office: far-left rear room, separated from both the cooler bank and the restroom.
    box(this.app, 'ManagerOfficeFloor', new pc.Vec3(-8.05, 0.01, -10.05), new pc.Vec3(3.55, 0.08, 3.65), officeFloor);
    box(this.app, 'ManagerOfficeLeftWall', new pc.Vec3(-9.78, 1.55, -10.05), new pc.Vec3(0.12, 3.1, 3.70), officeWall);
    box(this.app, 'ManagerOfficeBackWall', new pc.Vec3(-8.05, 1.55, -11.82), new pc.Vec3(3.55, 3.1, 0.12), officeWall);
    box(this.app, 'ManagerOfficeFrontWall', new pc.Vec3(-8.05, 1.55, -8.25), new pc.Vec3(3.55, 3.1, 0.12), officeWall);
    // East wall is split to leave a real doorway into the stock room.
    box(this.app, 'ManagerOfficeRightWallA', new pc.Vec3(-6.28, 1.55, -11.10), new pc.Vec3(0.12, 3.1, 1.45), officeWall);
    box(this.app, 'ManagerOfficeRightWallB', new pc.Vec3(-6.28, 1.55, -8.78), new pc.Vec3(0.12, 3.1, 0.95), officeWall);
    box(this.app, 'ManagerOfficeDoorHeader', new pc.Vec3(-6.27, 2.72, -9.83), new pc.Vec3(0.14, 0.38, 1.15), trim);
    box(this.app, 'ManagerOfficeNameplate', new pc.Vec3(-6.19, 2.18, -9.83), new pc.Vec3(0.04, 0.28, 0.72), warm);

    this.world.colliders.push({ minX: -9.84, maxX: -9.72, minZ: -11.90, maxZ: -8.20, name: 'Manager office left wall' });
    this.world.colliders.push({ minX: -9.82, maxX: -6.28, minZ: -11.88, maxZ: -11.76, name: 'Manager office back wall' });
    this.world.colliders.push({ minX: -9.82, maxX: -6.28, minZ: -8.31, maxZ: -8.19, name: 'Manager office front wall' });
    this.world.colliders.push({ minX: -6.34, maxX: -6.22, minZ: -11.82, maxZ: -10.38, name: 'Manager office right wall A' });
    this.world.colliders.push({ minX: -6.34, maxX: -6.22, minZ: -9.26, maxZ: -8.30, name: 'Manager office right wall B' });

    // Move the existing desk/monitor into the enclosed office instead of leaving them against the coolers.
    this.app.root.findByName('OfficeDesk')?.setPosition(-8.15, 0.75, -10.45);
    this.app.root.findByName('OfficeMonitor')?.setPosition(-8.15, 1.25, -10.55);
    this.app.root.findByName('OfficeMonitorScreen')?.setPosition(-8.15, 1.26, -10.44);

    // Small office light; deliberately warmer and dimmer than the retail floor.
    const light = new pc.Entity('ManagerOfficeLight');
    light.addComponent('light', {
      type: 'omni',
      color: new pc.Color(0.76, 0.68, 0.50),
      intensity: 0.48,
      range: 4.2,
      castShadows: true,
      shadowResolution: 512
    });
    light.setPosition(-8.0, 3.1, -10.0);
    this.app.root.addChild(light);
  }

  private buildRestroom(): void {
    const wall = mat(new pc.Color(0.24, 0.27, 0.27), 0, 0.13);
    const tile = mat(new pc.Color(0.38, 0.40, 0.37), 0, 0.28);
    const ceramic = mat(new pc.Color(0.78, 0.78, 0.70), 0, 0.50);
    const steel = mat(new pc.Color(0.32, 0.34, 0.33), 0.7, 0.42);
    const doorMat = mat(new pc.Color(0.12, 0.13, 0.12), 0.2, 0.22);

    // Restroom now occupies its own far-right staff-room bay with stock space between it and the office.
    const cx = -1.45;
    box(this.app, 'RestroomFloor', new pc.Vec3(cx, 0.01, -10.25), new pc.Vec3(2.25, 0.08, 3.15), tile);
    box(this.app, 'RestroomLeftWall', new pc.Vec3(-2.60, 1.55, -10.25), new pc.Vec3(0.12, 3.1, 3.25), wall);
    box(this.app, 'RestroomRightWall', new pc.Vec3(-0.30, 1.55, -10.25), new pc.Vec3(0.12, 3.1, 3.25), wall);
    box(this.app, 'RestroomBackWall', new pc.Vec3(cx, 1.55, -11.82), new pc.Vec3(2.30, 3.1, 0.12), wall);
    box(this.app, 'RestroomFrontWallL', new pc.Vec3(-2.22, 1.55, -8.68), new pc.Vec3(0.65, 3.1, 0.12), wall);
    box(this.app, 'RestroomFrontWallR', new pc.Vec3(-0.68, 1.55, -8.68), new pc.Vec3(0.65, 3.1, 0.12), wall);

    const door = box(this.app, 'RestroomDoor', new pc.Vec3(cx, 1.42, -8.61), new pc.Vec3(0.86, 2.82, 0.09), doorMat);
    this.door = door;
    cylinder(this.app, 'RestroomKnob', new pc.Vec3(-1.14, 1.38, -8.53), new pc.Vec3(0.09, 0.09, 0.09), steel).setEulerAngles(90, 0, 0);

    // Recognizable fixture silhouettes inside the room.
    cylinder(this.app, 'RestroomToiletBase', new pc.Vec3(-1.78, 0.28, -11.0), new pc.Vec3(0.52, 0.48, 0.65), ceramic);
    cylinder(this.app, 'RestroomToiletBowl', new pc.Vec3(-1.78, 0.52, -10.85), new pc.Vec3(0.60, 0.20, 0.78), ceramic);
    box(this.app, 'RestroomToiletTank', new pc.Vec3(-1.78, 0.78, -11.33), new pc.Vec3(0.72, 0.78, 0.30), ceramic);
    box(this.app, 'RestroomSink', new pc.Vec3(-0.86, 0.90, -9.62), new pc.Vec3(0.72, 0.16, 0.52), ceramic);
    cylinder(this.app, 'RestroomSinkPedestal', new pc.Vec3(-0.86, 0.46, -9.62), new pc.Vec3(0.28, 0.76, 0.28), ceramic);
    cylinder(this.app, 'RestroomFaucet', new pc.Vec3(-0.86, 1.08, -9.78), new pc.Vec3(0.07, 0.22, 0.07), steel);
    box(this.app, 'RestroomMirror', new pc.Vec3(-0.23, 1.78, -9.62), new pc.Vec3(0.05, 0.95, 0.78), steel);

    // Closed-door collision plus room-shell collision. Door remains the gameplay boundary for Night 1.
    this.world.colliders.push({ minX: -1.88, maxX: -1.02, minZ: -8.72, maxZ: -8.50, name: 'Restroom door' });
    this.world.colliders.push({ minX: -2.66, maxX: -2.54, minZ: -11.88, maxZ: -8.62, name: 'Restroom left wall' });
    this.world.colliders.push({ minX: -0.36, maxX: -0.24, minZ: -11.88, maxZ: -8.62, name: 'Restroom right wall' });

    const interactable: Interactable = {
      id: 'restroom-door',
      label: 'check restroom',
      position: new pc.Vec3(cx, 1.45, -8.15),
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
    this.door.setLocalScale(0.88, 2.82, 0.10);
    window.setTimeout(() => this.door?.setLocalScale(0.86, 2.82, 0.09), 90);
  }
}
