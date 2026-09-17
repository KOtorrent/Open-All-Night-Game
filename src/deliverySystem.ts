import * as pc from 'playcanvas';
import type { BuiltWorld, Interactable } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

function mat(color: pc.Color, gloss = 0.18, emissive?: pc.Color): pc.StandardMaterial {
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

function primitive(
  app: pc.Application,
  name: string,
  type: 'box' | 'cylinder',
  pos: pc.Vec3,
  scale: pc.Vec3,
  material: pc.StandardMaterial
): pc.Entity {
  const e = new pc.Entity(name);
  e.addComponent('render', { type });
  e.setPosition(pos);
  e.setLocalScale(scale);
  if (e.render) e.render.material = material;
  app.root.addChild(e);
  return e;
}

/**
 * Two-step delivery work: inspect the driver's manifest at the rear door, then shelve the
 * delivered cartons. The delivery truck is visible from the rear CCTV camera, making Camera 6
 * useful for ordinary work before it becomes a horror surface later in the campaign.
 */
export class DeliverySystem {
  private readonly app: pc.Application;
  private readonly world: BuiltWorld;
  private readonly state: GameState;
  private readonly ui: GameUI;
  private triggered = false;
  private accepted = false;
  private stocked = false;
  private truck?: pc.Entity;
  private clipboard?: pc.Entity;
  private cartons: pc.Entity[] = [];
  private manifestInteraction?: Interactable;
  private stockInteraction?: Interactable;
  private leaveTimer = 0;

  constructor(app: pc.Application, world: BuiltWorld, state: GameState, ui: GameUI) {
    this.app = app;
    this.world = world;
    this.state = state;
    this.ui = ui;
  }

  update(dt: number): void {
    const minute = this.state.getGameMinutes();
    if (!this.triggered && minute >= 24 * 60 + 35 && !this.state.isComplete('delivery-stocked')) {
      this.beginDelivery();
    }

    if (this.accepted && this.truck?.enabled) {
      this.leaveTimer += dt;
      if (this.leaveTimer >= 10) {
        const pos = this.truck.getPosition().clone();
        pos.x -= 4.0 * dt;
        this.truck.setPosition(pos);
        if (pos.x < -18) this.truck.enabled = false;
      }
    }
  }

  private beginDelivery(): void {
    this.triggered = true;
    this.state.addTask('delivery-manifest', 'Check the overnight delivery manifest');
    this.spawnTruck();
    this.spawnClipboard();
    this.ui.showMessage('Two knocks at the rear delivery door. A truck idles outside.', 3600);
  }

  private spawnTruck(): void {
    if (this.truck) return;
    const root = new pc.Entity('OvernightDeliveryTruck');
    const white = mat(new pc.Color(0.44, 0.45, 0.42), 0.20);
    const dark = mat(new pc.Color(0.03, 0.035, 0.035), 0.12);
    const glass = mat(new pc.Color(0.035, 0.07, 0.08), 0.62);
    const lamp = mat(new pc.Color(0.63, 0.10, 0.025), 0.25, new pc.Color(0.24, 0.025, 0.005));

    const add = (name: string, type: 'box' | 'cylinder', pos: pc.Vec3, scale: pc.Vec3, material: pc.StandardMaterial) => {
      const e = new pc.Entity(name);
      e.addComponent('render', { type });
      e.setLocalPosition(pos);
      e.setLocalScale(scale);
      if (e.render) e.render.material = material;
      root.addChild(e);
      return e;
    };

    add('TruckBox', 'box', new pc.Vec3(0, 1.6, 0.6), new pc.Vec3(2.4, 2.8, 4.6), white);
    add('TruckCab', 'box', new pc.Vec3(0, 1.25, -2.2), new pc.Vec3(2.15, 2.15, 1.65), white);
    add('TruckWindshield', 'box', new pc.Vec3(0, 1.75, -3.04), new pc.Vec3(1.65, 0.70, 0.04), glass);
    add('TruckTailLightL', 'box', new pc.Vec3(-0.72, 0.75, 2.92), new pc.Vec3(0.22, 0.18, 0.04), lamp);
    add('TruckTailLightR', 'box', new pc.Vec3(0.72, 0.75, 2.92), new pc.Vec3(0.22, 0.18, 0.04), lamp);
    for (const x of [-0.9, 0.9]) {
      for (const z of [-1.9, 1.8]) {
        const wheel = add(`TruckWheel-${x}-${z}`, 'cylinder', new pc.Vec3(x, 0.45, z), new pc.Vec3(0.48, 0.28, 0.48), dark);
        wheel.setLocalEulerAngles(0, 0, 90);
      }
    }

    root.setPosition(-4.1, 0, -16.4);
    root.setEulerAngles(0, 180, 0);
    this.app.root.addChild(root);
    this.truck = root;
  }

  private spawnClipboard(): void {
    if (this.clipboard) return;
    const board = mat(new pc.Color(0.34, 0.18, 0.07), 0.14);
    const paper = mat(new pc.Color(0.72, 0.69, 0.57), 0.08);
    const clip = mat(new pc.Color(0.34, 0.36, 0.35), 0.52);

    this.clipboard = primitive(this.app, 'DeliveryClipboard', 'box', new pc.Vec3(-3.95, 1.23, -11.48), new pc.Vec3(0.42, 0.045, 0.62), board);
    this.clipboard.setEulerAngles(0, -8, 0);
    const sheet = primitive(this.app, 'DeliveryManifestPaper', 'box', new pc.Vec3(-3.95, 1.26, -11.48), new pc.Vec3(0.35, 0.015, 0.50), paper);
    sheet.setEulerAngles(0, -8, 0);
    primitive(this.app, 'DeliveryClipboardClip', 'box', new pc.Vec3(-3.99, 1.29, -11.70), new pc.Vec3(0.18, 0.025, 0.08), clip).setEulerAngles(0, -8, 0);

    const item: Interactable = {
      id: 'delivery-manifest',
      label: 'check delivery manifest',
      position: new pc.Vec3(-3.95, 1.25, -11.48),
      radius: 2.25,
      aimRadius: 0.42,
      onInteract: () => this.acceptDelivery()
    };
    this.manifestInteraction = item;
    this.world.interactables.push(item);
  }

  private acceptDelivery(): string {
    if (this.accepted) return 'Manifest checked. Six cartons received.';
    this.accepted = true;
    this.state.complete('delivery-manifest');
    this.state.addTask('delivery-stocked', 'Put away the six delivery cartons');
    if (this.clipboard) this.clipboard.enabled = false;
    this.removeInteractable(this.manifestInteraction);
    this.spawnCartons();
    this.ui.showMessage('Manifest matches: six cartons. The driver leaves them in the stock room.', 3500);
    return 'MANIFEST — 6 cartons — quantity matches. You sign the delivery.';
  }

  private spawnCartons(): void {
    const cardboard = mat(new pc.Color(0.34, 0.19, 0.085), 0.10);
    const tape = mat(new pc.Color(0.58, 0.49, 0.29), 0.10);
    for (let i = 0; i < 6; i++) {
      const x = -4.75 + (i % 2) * 0.62;
      const y = 0.28 + Math.floor(i / 2) * 0.56;
      const z = -8.75 - (i % 2) * 0.12;
      const carton = primitive(this.app, `DeliveryCarton-${i}`, 'box', new pc.Vec3(x, y, z), new pc.Vec3(0.52, 0.52, 0.58), cardboard);
      primitive(this.app, `DeliveryTape-${i}`, 'box', new pc.Vec3(x, y + 0.265, z), new pc.Vec3(0.09, 0.012, 0.60), tape);
      this.cartons.push(carton);
    }

    const item: Interactable = {
      id: 'delivery-stocked',
      label: 'put away delivery',
      position: new pc.Vec3(-4.45, 0.88, -8.8),
      radius: 2.5,
      aimRadius: 0.72,
      onInteract: () => this.stockDelivery()
    };
    this.stockInteraction = item;
    this.world.interactables.push(item);
  }

  private stockDelivery(): string {
    if (this.stocked) return 'Delivery is already put away.';
    this.stocked = true;
    this.state.complete('delivery-stocked');
    for (const carton of this.cartons) carton.enabled = false;
    this.removeInteractable(this.stockInteraction);
    return 'You break down the cartons and stock the back-room shelves. Routine work. Mostly.';
  }

  private removeInteractable(item?: Interactable): void {
    if (!item) return;
    const index = this.world.interactables.indexOf(item);
    if (index >= 0) this.world.interactables.splice(index, 1);
  }
}
