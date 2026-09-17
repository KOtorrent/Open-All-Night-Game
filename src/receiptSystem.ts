import * as pc from 'playcanvas';
import type { BuiltWorld } from './gameTypes';
import type { GameState } from './gameState';

function mat(color: pc.Color, gloss = 0.1): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.gloss = gloss;
  m.update();
  return m;
}

/**
 * Small persistent checkout feedback layer. Every completed sale spits a short paper receipt onto
 * the printer tray, so transactions leave a physical trace instead of only a text message.
 */
export class ReceiptSystem {
  private readonly app: pc.Application;
  private readonly state: GameState;
  private readonly receiptMat = mat(new pc.Color(0.74, 0.72, 0.62), 0.05);
  private spawned = new Set<string>();
  private readonly saleIds = ['first-sale', 'late-sale', 'dale-sale'];

  constructor(app: pc.Application, _world: BuiltWorld, state: GameState) {
    this.app = app;
    this.state = state;
  }

  update(): void {
    for (const id of this.saleIds) {
      if (this.state.isComplete(id) && !this.spawned.has(id)) {
        this.spawned.add(id);
        this.print(id);
      }
    }
  }

  private print(id: string): void {
    const index = this.saleIds.indexOf(id);
    const slip = new pc.Entity(`Receipt-${id}`);
    slip.addComponent('render', { type: 'box' });
    slip.setPosition(-3.92 + index * 0.08, 1.635 + index * 0.006, 7.83 + index * 0.035);
    slip.setLocalScale(0.22, 0.012, 0.48);
    slip.setEulerAngles(0, -7 + index * 5, 2 - index * 2);
    if (slip.render) slip.render.material = this.receiptMat;
    this.app.root.addChild(slip);
  }
}
