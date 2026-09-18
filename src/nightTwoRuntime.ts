import * as pc from 'playcanvas';
import type { BuiltWorld } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';
import type { ProgressionStore } from './progressionStore';

export class NightTwoRuntime {
  private repeaterTimer = 0;
  private headCountTimer = 0;
  private receiptTimer = 0;
  private repeaterArmed = false;
  private headCountArmed = false;
  private receiptArmed = false;

  constructor(world: BuiltWorld, private readonly state: GameState, private readonly ui: GameUI, private readonly progression: ProgressionStore) {
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

    world.interactables.push({
      id: 'n2-repeater-response', label: 'refuse repeat sale', position: new pc.Vec3(-4.65, 1.12, 7.72), radius: 2.2, aimRadius: 0.48,
      onInteract: () => {
        if (!this.repeaterArmed) return 'No duplicate sale is pending.';
        if (this.state.isComplete('n2-repeater-refused')) return 'You already refused the duplicate sale.';
        this.state.complete('n2-repeater-refused');
        this.ui.flashWarning('SALE REFUSED', 1200);
        return 'Same customer. Same items. Same hour. You refuse the sale.';
      }
    });

    world.interactables.push({
      id: 'n2-headcount-response', label: 'verify head count', position: new pc.Vec3(-4.95, 1.18, 7.62), radius: 2.2, aimRadius: 0.48,
      onInteract: () => {
        if (!this.headCountArmed) return 'The count is stable for now.';
        if (!this.state.isComplete('n2-headcount-verified')) {
          this.state.complete('n2-headcount-verified');
          this.ui.flashWarning('COUNT VERIFIED', 1200);
        }
        return 'You recount using the register pad and the cameras. One person exists only in the old count.';
      }
    });

    world.interactables.push({
      id: 'n2-early-receipt-response', label: 'discard early receipt', position: new pc.Vec3(-4.25, 1.16, 7.58), radius: 2.0, aimRadius: 0.42,
      onInteract: () => {
        if (!this.receiptArmed) return 'Nothing unusual is on the printer.';
        if (!this.state.isComplete('n2-early-receipt-discarded')) {
          this.state.complete('n2-early-receipt-discarded');
          this.ui.showMessage('You tear it off without reading the customer name.', 3000);
        }
        return 'The early receipt goes face-down into the trash.';
      }
    });
  }

  update(dt: number): void {
    if (!this.repeaterArmed && this.state.isComplete('anomaly:repeater')) {
      this.repeaterArmed = true;
      this.repeaterTimer = 22;
      this.state.addTask('n2-repeater-refused', 'Refuse the duplicate customer sale');
      this.ui.showMessage('Rule 2: do not serve the same customer twice in one hour.', 3600);
    }
    if (this.repeaterArmed && !this.state.isComplete('n2-repeater-refused') && !this.state.isComplete('rule-broken:n2-repeater')) {
      this.repeaterTimer -= dt;
      if (this.repeaterTimer <= 0) this.breakRule('n2-repeater', 'You let the repeat transaction complete.');
    }

    if (!this.headCountArmed && this.state.isComplete('anomaly:head-count')) {
      this.headCountArmed = true;
      this.headCountTimer = 26;
      this.state.addTask('n2-headcount-verified', 'Verify the customer count against CCTV');
    }
    if (this.headCountArmed && !this.state.isComplete('n2-headcount-verified') && !this.state.isComplete('rule-broken:n2-headcount')) {
      this.headCountTimer -= dt;
      if (this.headCountTimer <= 0) this.breakRule('n2-headcount', 'You stop tracking the extra customer.');
    }

    if (!this.receiptArmed && this.state.isComplete('anomaly:impossible-receipt')) {
      this.receiptArmed = true;
      this.receiptTimer = 20;
      this.state.addTask('n2-early-receipt-discarded', 'Discard the early receipt without reading the name');
    }
    if (this.receiptArmed && !this.state.isComplete('n2-early-receipt-discarded') && !this.state.isComplete('rule-broken:n2-receipt')) {
      this.receiptTimer -= dt;
      if (this.receiptTimer <= 0) this.breakRule('n2-receipt', 'You stare at the receipt long enough to read the name.');
    }
  }

  private breakRule(id: string, text: string): void {
    this.state.complete(`rule-broken:${id}`);
    this.progression.recordRuleBreak(2);
    this.ui.flashWarning('RULE BROKEN', 1700);
    this.ui.showMessage(text, 4200);
  }
}
