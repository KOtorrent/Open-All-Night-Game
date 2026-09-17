import * as pc from 'playcanvas';
import type { BuiltWorld, Interactable } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

function mat(color: pc.Color, gloss = 0.16): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.gloss = gloss;
  m.update();
  return m;
}

/**
 * Keeps the last stretch of Night 1 grounded in boring work instead of turning it into a pure
 * horror gauntlet. Three simple closing chores appear across the final hour and use visible props.
 */
export class ClosingChoreSystem {
  private readonly app: pc.Application;
  private readonly world: BuiltWorld;
  private readonly state: GameState;
  private readonly ui: GameUI;
  private faceUpSpawned = false;
  private wipeSpawned = false;
  private coffeeSpawned = false;

  constructor(app: pc.Application, world: BuiltWorld, state: GameState, ui: GameUI) {
    this.app = app;
    this.world = world;
    this.state = state;
    this.ui = ui;
  }

  update(): void {
    const minute = this.state.getGameMinutes();
    if (!this.faceUpSpawned && minute >= 28 * 60 + 35 && !this.state.isComplete('closing-faceup')) {
      this.faceUpSpawned = true;
      this.spawnFaceUpTask();
    }
    if (!this.wipeSpawned && minute >= 29 * 60 + 2 && !this.state.isComplete('closing-counter')) {
      this.wipeSpawned = true;
      this.spawnCounterTask();
    }
    if (!this.coffeeSpawned && minute >= 29 * 60 + 28 && !this.state.isComplete('closing-coffee')) {
      this.coffeeSpawned = true;
      this.spawnCoffeeTask();
    }
  }

  private spawnFaceUpTask(): void {
    this.state.addTask('closing-faceup', 'Face up Aisle 2 before morning');
    const marker = new pc.Entity('FaceUpCrate');
    marker.addComponent('render', { type: 'box' });
    marker.setPosition(-1.15, 0.28, -3.35);
    marker.setLocalScale(0.52, 0.40, 0.42);
    if (marker.render) marker.render.material = mat(new pc.Color(0.30, 0.20, 0.09), 0.10);
    this.app.root.addChild(marker);

    this.addInteractable({
      id: 'closing-faceup',
      label: 'face up Aisle 2',
      position: new pc.Vec3(-1.15, 0.48, -3.35),
      radius: 2.4,
      aimRadius: 0.48,
      onInteract: () => {
        if (!this.state.complete('closing-faceup')) return 'Aisle 2 is already faced up.';
        marker.enabled = false;
        return 'You pull the front row forward and straighten the labels. Good enough for morning.';
      }
    });
    this.ui.showMessage('Closing work: face up Aisle 2 before morning.', 3000);
  }

  private spawnCounterTask(): void {
    this.state.addTask('closing-counter', 'Wipe down the checkout counter');
    const rag = new pc.Entity('ClosingCounterRag');
    rag.addComponent('render', { type: 'box' });
    rag.setPosition(-6.00, 1.39, 8.04);
    rag.setLocalScale(0.42, 0.025, 0.30);
    rag.setEulerAngles(0, 18, 0);
    if (rag.render) rag.render.material = mat(new pc.Color(0.14, 0.26, 0.30), 0.05);
    this.app.root.addChild(rag);

    this.addInteractable({
      id: 'closing-counter',
      label: 'wipe counter',
      position: new pc.Vec3(-6.00, 1.43, 8.04),
      radius: 2.4,
      aimRadius: 0.48,
      onInteract: () => {
        if (!this.state.complete('closing-counter')) return 'The counter is already wiped down.';
        rag.enabled = false;
        return 'Sticky rings, coffee sugar, lottery dust. The rag comes away gray.';
      }
    });
    this.ui.showMessage('Closing work: wipe down the checkout counter.', 2800);
  }

  private spawnCoffeeTask(): void {
    this.state.addTask('closing-coffee', 'Top off the coffee station for morning');
    const packet = new pc.Entity('ClosingCoffeePacket');
    packet.addComponent('render', { type: 'box' });
    packet.setPosition(6.78, 1.42, 8.36);
    packet.setLocalScale(0.24, 0.08, 0.32);
    if (packet.render) packet.render.material = mat(new pc.Color(0.36, 0.17, 0.06), 0.10);
    this.app.root.addChild(packet);

    this.addInteractable({
      id: 'closing-coffee',
      label: 'top off coffee station',
      position: new pc.Vec3(6.78, 1.50, 8.36),
      radius: 2.4,
      aimRadius: 0.46,
      onInteract: () => {
        if (!this.state.complete('closing-coffee')) return 'The coffee station is ready for morning.';
        packet.enabled = false;
        return 'Fresh filter, fresh grounds, cups topped off. Whoever opens next owes you one.';
      }
    });
    this.ui.showMessage('Closing work: set the coffee station for morning.', 2800);
  }

  private addInteractable(interactable: Interactable): void {
    this.world.interactables.push(interactable);
  }
}
