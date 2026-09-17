import * as pc from 'playcanvas';
import type { BuiltWorld, Interactable } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

interface TimedChore {
  id: string;
  text: string;
  triggerMinute: number;
  spawned: boolean;
  interactable?: Interactable;
  entity?: pc.Entity;
}

function mat(color: pc.Color, gloss = 0.18): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.gloss = gloss;
  m.update();
  return m;
}

export class ChoreSystem {
  private readonly app: pc.Application;
  private readonly world: BuiltWorld;
  private readonly state: GameState;
  private readonly ui: GameUI;
  private readonly chores: TimedChore[] = [
    { id: 'restock-aisle-1', text: 'Restock Aisle 1', triggerMinute: 23 * 60 + 22, spawned: false },
    { id: 'clean-spill', text: 'Clean the spill by Aisle 3', triggerMinute: 23 * 60 + 31, spawned: false },
    { id: 'take-trash', text: 'Take the counter trash out', triggerMinute: 23 * 60 + 48, spawned: false }
  ];

  constructor(app: pc.Application, world: BuiltWorld, state: GameState, ui: GameUI) {
    this.app = app;
    this.world = world;
    this.state = state;
    this.ui = ui;
  }

  update(): void {
    const minute = this.state.getGameMinutes();
    for (const chore of this.chores) {
      if (!chore.spawned && minute >= chore.triggerMinute && !this.state.isComplete(chore.id)) {
        this.spawn(chore);
      }
    }
  }

  private spawn(chore: TimedChore): void {
    chore.spawned = true;
    this.state.addTask(chore.id, chore.text);
    if (chore.id === 'restock-aisle-1') this.spawnRestock(chore);
    if (chore.id === 'clean-spill') this.spawnSpill(chore);
    if (chore.id === 'take-trash') this.spawnTrash(chore);
  }

  private spawnRestock(chore: TimedChore): void {
    const cardboard = mat(new pc.Color(0.34, 0.20, 0.09), 0.08);
    const box = new pc.Entity('RestockCarton');
    box.addComponent('render', { type: 'box' });
    box.setPosition(-7.1, 0.34, 4.6);
    box.setLocalScale(0.72, 0.68, 0.58);
    if (box.render) box.render.material = cardboard;
    this.app.root.addChild(box);
    chore.entity = box;

    const interactable: Interactable = {
      id: chore.id,
      label: 'restock shelf',
      position: new pc.Vec3(-6.3, 1.0, 3.8),
      radius: 2.5,
      onInteract: () => this.finish(chore, 'You fill the empty facings. The shelf looks normal again.')
    };
    chore.interactable = interactable;
    this.world.interactables.push(interactable);
    this.ui.showMessage('A restock carton is waiting beside Aisle 1.', 2800);
  }

  private spawnSpill(chore: TimedChore): void {
    const spillMat = mat(new pc.Color(0.12, 0.085, 0.045), 0.58);
    const spill = new pc.Entity('Aisle3Spill');
    spill.addComponent('render', { type: 'cylinder' });
    spill.setPosition(3.1, 0.015, -1.8);
    spill.setLocalScale(1.15, 0.018, 0.72);
    if (spill.render) spill.render.material = spillMat;
    this.app.root.addChild(spill);
    chore.entity = spill;

    const interactable: Interactable = {
      id: chore.id,
      label: 'clean spill',
      position: new pc.Vec3(3.1, 0.25, -1.8),
      radius: 2.2,
      onInteract: () => this.finish(chore, 'Paper towels, cleaner, thirty seconds. Retail glamour.')
    };
    chore.interactable = interactable;
    this.world.interactables.push(interactable);
    this.ui.showMessage('Something hits the floor near Aisle 3.', 2200);
  }

  private spawnTrash(chore: TimedChore): void {
    const bagMat = mat(new pc.Color(0.025, 0.028, 0.027), 0.12);
    const bag = new pc.Entity('CounterTrashBag');
    bag.addComponent('render', { type: 'sphere' });
    bag.setPosition(-8.3, 0.38, 8.2);
    bag.setLocalScale(0.65, 0.78, 0.65);
    if (bag.render) bag.render.material = bagMat;
    this.app.root.addChild(bag);
    chore.entity = bag;

    const interactable: Interactable = {
      id: chore.id,
      label: 'take trash',
      position: new pc.Vec3(-8.1, 0.8, 7.8),
      radius: 2.2,
      onInteract: () => this.finish(chore, 'You tie off the bag and take it out back. The night air feels colder.')
    };
    chore.interactable = interactable;
    this.world.interactables.push(interactable);
    this.ui.showMessage('The trash under the counter is full.', 2400);
  }

  private finish(chore: TimedChore, message: string): string {
    if (this.state.isComplete(chore.id)) return message;
    this.state.complete(chore.id);
    if (chore.entity) chore.entity.enabled = false;
    if (chore.interactable) {
      const index = this.world.interactables.indexOf(chore.interactable);
      if (index >= 0) this.world.interactables.splice(index, 1);
    }
    return message;
  }
}
