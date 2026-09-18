import * as pc from 'playcanvas';
import type { BuiltWorld } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

export class NightTwoRuntime {
  constructor(world: BuiltWorld, private readonly state: GameState, private readonly ui: GameUI) {
    const add = (id: string, label: string, pos: pc.Vec3, doneText: string) => world.interactables.push({
      id, label, position: pos, radius: 2.2, aimRadius: 0.52,
      onInteract: () => {
        if (this.state.isComplete(id)) return doneText;
        this.state.complete(id);
        this.ui.showMessage(doneText, 3000);
        return doneText;
      }
    });

    add('n2-customer-count', 'count customers', new pc.Vec3(-4.8, 1.25, 7.7), 'You mark the current head count on the register pad.');
    add('n2-face-candy', 'face candy rack', new pc.Vec3(-5.1, 1.0, 2.2), 'You pull the candy forward into neat rows.');
    add('n2-coffee', 'refresh coffee station', new pc.Vec3(6.35, 1.1, 8.4), 'Fresh coffee replaces the burnt pot.');
    add('n2-daniel', 'read old schedule', new pc.Vec3(-7.7, 1.3, -9.5), 'Daniel’s name appears on the old schedule. His final week is crossed out twice.');
    add('n2-stock', 'finish stock count', new pc.Vec3(-6.4, 1.0, -9.5), 'The overnight stock count balances. One item has no SKU.');
  }
}
