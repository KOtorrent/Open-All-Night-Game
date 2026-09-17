import * as pc from 'playcanvas';
import type { BuiltWorld } from './gameTypes';
import type { GameState } from './gameState';

/** Keeps context prompts semantically tied to what the player is actually looking at. */
export class InteractionPolishSystem {
  private readonly app: pc.Application;
  private readonly world: BuiltWorld;
  private readonly state: GameState;

  constructor(app: pc.Application, world: BuiltWorld, state: GameState) {
    this.app = app;
    this.world = world;
    this.state = state;
  }

  update(): void {
    const register = this.world.interactables.find((x) => x.id === 'register');
    if (register) {
      const checkoutItemsVisible = Boolean(this.app.root.findByName('Checkout-Drink')?.enabled || this.app.root.findByName('Checkout-Candy')?.enabled);
      register.label = !this.state.isComplete('clock-in') ? 'clock in' : checkoutItemsVisible ? 'ring up items' : 'use register';
      register.position.set(-5.0, 1.62, 7.62);
      register.aimRadius = 0.62;
    }

    const notebook = this.world.interactables.find((x) => x.id === 'notebook');
    if (notebook) {
      notebook.label = this.state.isComplete('notebook') ? 'review night rules' : 'read notebook';
      notebook.position.set(-6.78, 1.42, 7.92);
      notebook.aimRadius = 0.48;
    }

    const coffee = this.world.interactables.find((x) => x.id === 'coffee');
    if (coffee) {
      coffee.label = this.state.isComplete('coffee') ? 'check coffee' : 'brew coffee';
      coffee.position.set(6.10, 1.70, 8.48);
      coffee.aimRadius = 0.58;
    }

    const cooler = this.world.interactables.find((x) => x.id === 'cooler');
    if (cooler) {
      cooler.position.set(4.8, 1.55, -10.12);
      cooler.aimRadius = 0.72;
    }
  }
}
