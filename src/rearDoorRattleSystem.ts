import type { BuiltWorld } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

/**
 * A non-rule rear-door scare. The handle rattles once; checking the door finds nobody outside.
 * Later nights can escalate the same surface into an actual rule without making Night 1 punitive.
 */
export class RearDoorRattleSystem {
  private readonly world: BuiltWorld;
  private readonly state: GameState;
  private readonly ui: GameUI;
  private triggered = false;
  private expiresAt = 0;

  constructor(world: BuiltWorld, state: GameState, ui: GameUI) {
    this.world = world;
    this.state = state;
    this.ui = ui;
  }

  update(dt: number): void {
    if (!this.triggered && this.state.getGameMinutes() >= 27 * 60 + 56) {
      this.triggered = true;
      this.expiresAt = 9;
      this.wrapDoorInteraction();
      this.ui.showMessage('CLACK. The rear delivery-door handle moves once.', 2800);
      this.rattleSound();
      return;
    }

    if (this.expiresAt > 0) this.expiresAt -= dt;
  }

  private wrapDoorInteraction(): void {
    const door = this.world.interactables.find((item) => item.id === 'back-door');
    if (!door) return;
    const fallback = door.onInteract;
    door.onInteract = () => {
      if (this.expiresAt > 0 && !this.state.isComplete('checked-rear-rattle')) {
        this.state.complete('checked-rear-rattle');
        this.expiresAt = 0;
        return 'Locked. Through the narrow glass: loading pad, dumpster, darkness. Nobody there.';
      }
      return fallback();
    };
  }

  private rattleSound(): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 145 + i * 32;
        gain.gain.value = 0.018;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const start = ctx.currentTime + i * 0.09;
        osc.start(start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.045);
        osc.stop(start + 0.05);
      }
      window.setTimeout(() => void ctx.close(), 900);
    } catch {
      // Atmosphere audio is optional.
    }
  }
}
