import * as pc from 'playcanvas';
import type { BuiltWorld, Interactable } from './gameTypes';
import type { GameSession } from './gameSession';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

interface RetailBeat {
  minute: number;
  id: string;
  name: string;
  items: string[];
  total: number;
  tender: number;
}

const t = (hour: number, minute: number) => (hour < 12 ? hour + 24 : hour) * 60 + minute;

const RETAIL: Record<number, RetailBeat[]> = {
  2: [
    { minute: t(23,18), id: 'n2-sale-1', name: 'Earl', items: ['Coffee', 'Jerky'], total: 5.84, tender: 10 },
    { minute: t(24,6), id: 'n2-sale-2', name: 'Jenna', items: ['Milk', 'Pain reliever'], total: 8.63, tender: 20 },
    { minute: t(25,2), id: 'n2-sale-3', name: 'Dale', items: ['Soda', 'Peanuts'], total: 4.72, tender: 5 },
    { minute: t(27,4), id: 'n2-sale-4', name: 'Marcus', items: ['Coffee', 'Chips'], total: 6.41, tender: 10 },
    { minute: t(28,26), id: 'n2-sale-5', name: 'Traveler', items: ['Water', 'Map'], total: 7.15, tender: 10 }
  ],
  3: [
    { minute: t(23,17), id: 'n3-sale-1', name: 'Wet commuter', items: ['Coffee', 'Umbrella'], total: 11.28, tender: 20 },
    { minute: t(24,44), id: 'n3-sale-2', name: 'Truck driver', items: ['Energy drink', 'Jerky'], total: 9.37, tender: 10 },
    { minute: t(26,2), id: 'n3-sale-3', name: 'Deputy Hall', items: ['Coffee'], total: 2.19, tender: 5 },
    { minute: t(28,18), id: 'n3-sale-4', name: 'Stranded motorist', items: ['Water', 'Flashlight batteries'], total: 13.42, tender: 20 }
  ],
  4: [
    { minute: t(23,20), id: 'n4-sale-1', name: 'Regular', items: ['Coffee', 'Donut'], total: 4.54, tender: 5 },
    { minute: t(24,18), id: 'n4-sale-2', name: 'Woman in blue', items: ['Water', 'Gum'], total: 3.82, tender: 5 },
    { minute: t(25,43), id: 'n4-sale-3', name: 'Dale', items: ['Soda', 'Pretzels'], total: 5.16, tender: 10 },
    { minute: t(27,16), id: 'n4-sale-4', name: 'Night driver', items: ['Coffee', 'Motor oil'], total: 10.73, tender: 20 },
    { minute: t(28,31), id: 'n4-sale-5', name: 'Jenna', items: ['Crackers', 'Milk'], total: 7.94, tender: 10 }
  ],
  5: [
    { minute: t(23,22), id: 'n5-sale-1', name: 'Earl', items: ['Coffee'], total: 2.19, tender: 5 },
    { minute: t(24,8), id: 'n5-sale-2', name: 'Dale', items: ['Soda'], total: 2.67, tender: 5 },
    { minute: t(25,14), id: 'n5-sale-3', name: 'Jenna', items: ['Milk', 'Crackers'], total: 7.94, tender: 10 },
    { minute: t(26,25), id: 'n5-sale-4', name: 'Marcus', items: ['Coffee', 'Chips'], total: 6.41, tender: 10 },
    { minute: t(28,34), id: 'n5-sale-5', name: 'Last ordinary customer', items: ['Water'], total: 1.89, tender: 5 }
  ]
};

export class LaterNightRetailSystem {
  private readonly beats: RetailBeat[];
  private active?: RetailBeat;
  private queue: RetailBeat[] = [];
  private readonly register: Interactable;

  constructor(
    private readonly world: BuiltWorld,
    private readonly session: GameSession,
    private readonly state: GameState,
    private readonly ui: GameUI
  ) {
    this.beats = RETAIL[session.config.night] ?? [];
    this.register = {
      id: 'later-night-register-sale',
      label: 'serve customer',
      position: new pc.Vec3(-4.65, 1.15, 7.72),
      radius: 2.3,
      aimRadius: 0.50,
      onInteract: () => this.serve()
    };
    if (session.config.night >= 2 && session.config.night <= 5 && !session.isEndless()) world.interactables.push(this.register);
  }

  update(): void {
    if (this.session.isEndless() || this.session.config.night === 1) return;
    const minute = this.state.getGameMinutes();

    for (const beat of this.beats) {
      if (minute < beat.minute) continue;
      if (this.state.isComplete(`retail-arrived:${beat.id}`) || this.state.isComplete(beat.id)) continue;
      this.state.complete(`retail-arrived:${beat.id}`);
      this.queue.push(beat);
    }

    if (!this.active && this.queue.length) {
      this.active = this.queue.shift();
      if (this.active) {
        this.state.addTask(this.active.id, `Serve ${this.active.name}`);
        this.register.label = `ring up ${this.active.name}`;
        this.ui.showMessage(`${this.active.name} approaches the counter with ${this.active.items.join(' and ')}.`, 3600);
      }
    }
  }

  private serve(): string {
    if (!this.active) return 'No customer is waiting at the register.';
    const sale = this.active;
    if (!this.state.isComplete(sale.id)) {
      this.state.complete(sale.id);
      this.session.progression.addCustomerServed();
      const change = sale.tender - sale.total;
      this.ui.flashWarning('SALE COMPLETE', 900);
      this.ui.showMessage(`${sale.items.join(' • ')}  $${sale.total.toFixed(2)}  —  Tender $${sale.tender.toFixed(2)}  —  Change $${change.toFixed(2)}`, 4200);
    }
    this.active = undefined;
    this.register.label = 'use register';
    return `${sale.name} takes the receipt and leaves the counter.`;
  }
}
