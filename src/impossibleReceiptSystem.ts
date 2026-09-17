import * as pc from 'playcanvas';
import type { BuiltWorld, Interactable } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

function paperMat(): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = new pc.Color(0.78, 0.76, 0.67);
  m.gloss = 0.04;
  m.update();
  return m;
}

/**
 * A small late-Night-1 anomaly: the receipt printer runs when nobody is at the counter.
 * It never creates a fail state; it simply introduces the idea that mundane store systems can lie.
 */
export class ImpossibleReceiptSystem {
  private readonly app: pc.Application;
  private readonly world: BuiltWorld;
  private readonly state: GameState;
  private readonly ui: GameUI;
  private spawned = false;
  private receipt?: pc.Entity;
  private interactable?: Interactable;

  constructor(app: pc.Application, world: BuiltWorld, state: GameState, ui: GameUI) {
    this.app = app;
    this.world = world;
    this.state = state;
    this.ui = ui;
  }

  update(): void {
    if (this.spawned || this.state.getGameMinutes() < 29 * 60 + 16) return;
    this.spawned = true;
    this.spawnReceipt();
  }

  private spawnReceipt(): void {
    this.receipt = new pc.Entity('ImpossibleReceipt');
    this.receipt.addComponent('render', { type: 'box' });
    this.receipt.setPosition(-3.62, 1.64, 7.84);
    this.receipt.setLocalScale(0.27, 0.012, 0.82);
    this.receipt.setEulerAngles(0, 8, -3);
    if (this.receipt.render) this.receipt.render.material = paperMat();
    this.app.root.addChild(this.receipt);

    this.printSound();
    this.ui.showMessage('The receipt printer starts by itself.', 3000);

    const item: Interactable = {
      id: 'impossible-receipt',
      label: 'read receipt',
      position: new pc.Vec3(-3.62, 1.65, 7.84),
      radius: 2.35,
      aimRadius: 0.42,
      onInteract: () => this.readReceipt()
    };
    this.interactable = item;
    this.world.interactables.push(item);
  }

  private readReceipt(): string {
    if (!this.state.isComplete('read-impossible-receipt')) {
      this.state.complete('read-impossible-receipt');
      return 'CASE’S COUNTRY GAS STOP — SALE 000000 — 6:01 AM — CASHIER: NIGHT CLERK — TOTAL: $0.00 — STATUS: OPEN';
    }
    return 'The timestamp still says 6:01 AM. The current time does not.';
  }

  private printSound(): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      for (let i = 0; i < 8; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 95 + (i % 3) * 28;
        gain.gain.value = 0.012;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const start = ctx.currentTime + i * 0.075;
        osc.start(start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.05);
        osc.stop(start + 0.055);
      }
      window.setTimeout(() => void ctx.close(), 1200);
    } catch {
      // Audio is optional.
    }
  }
}
