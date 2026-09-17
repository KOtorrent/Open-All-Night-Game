import * as pc from 'playcanvas';
import type { BuiltWorld, Interactable } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

/** A restrained, non-rule scare: the counter phone rings, but the line only carries store ambience. */
export class StorePhoneSystem {
  private triggered = false;
  private ringing = false;
  private answered = false;
  private ringTimer = 0;
  private pulse = 0;
  private phone?: pc.Entity;
  private interaction?: Interactable;

  constructor(private readonly app: pc.Application, private readonly world: BuiltWorld, private readonly state: GameState, private readonly ui: GameUI) {
    this.buildPhone();
  }

  update(dt: number): void {
    if (!this.triggered && this.state.getGameMinutes() >= 25 * 60 + 24) this.startRinging();
    if (!this.ringing) return;
    this.ringTimer -= dt;
    this.pulse -= dt;
    if (this.pulse <= 0 && this.ringTimer > 0) {
      this.pulse = 2.35;
      this.ringTone();
      this.ui.showMessage('RING.  RING.', 900);
    }
    if (this.ringTimer <= 0 && !this.answered) {
      this.ringing = false;
      this.removeInteraction();
      this.ui.showMessage('The counter phone stops ringing.', 1800);
    }
  }

  private buildPhone(): void {
    const dark = new pc.StandardMaterial();
    dark.diffuse = new pc.Color(0.045, 0.05, 0.048); dark.gloss = 0.22; dark.update();
    const root = new pc.Entity('CounterPhone');
    const base = new pc.Entity('CounterPhoneBase'); base.addComponent('render', { type: 'box' }); base.setLocalScale(0.34, 0.09, 0.24); base.setLocalPosition(0, 0.045, 0); if (base.render) base.render.material = dark; root.addChild(base);
    const handset = new pc.Entity('CounterPhoneHandset'); handset.addComponent('render', { type: 'capsule' }); handset.setLocalScale(0.10, 0.34, 0.10); handset.setLocalEulerAngles(0, 0, 90); handset.setLocalPosition(0, 0.15, 0); if (handset.render) handset.render.material = dark; root.addChild(handset);
    root.setPosition(-6.58, 1.40, 8.10);
    root.setEulerAngles(0, 8, 0);
    this.app.root.addChild(root);
    this.phone = root;
  }

  private startRinging(): void {
    this.triggered = true;
    this.ringing = true;
    this.ringTimer = 17;
    this.pulse = 0.1;
    const interaction: Interactable = {
      id: 'counter-phone',
      label: 'answer phone',
      position: new pc.Vec3(-6.58, 1.50, 8.10),
      radius: 2.2,
      aimRadius: 0.42,
      onInteract: () => this.answer()
    };
    this.interaction = interaction;
    this.world.interactables.push(interaction);
  }

  private answer(): string {
    if (!this.ringing || this.answered) return 'The line is dead.';
    this.answered = true;
    this.ringing = false;
    this.removeInteraction();
    this.state.complete('answered-store-phone');
    return 'You lift the receiver. For several seconds you hear refrigeration hum — the same hum as the store around you — then a click.';
  }

  private removeInteraction(): void {
    if (!this.interaction) return;
    const i = this.world.interactables.indexOf(this.interaction);
    if (i >= 0) this.world.interactables.splice(i, 1);
    this.interaction = undefined;
  }

  private ringTone(): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.frequency.value = 720; osc.type = 'square'; gain.gain.value = 0.025;
      osc.connect(gain); gain.connect(ctx.destination); osc.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22); osc.stop(ctx.currentTime + 0.24);
      osc.addEventListener('ended', () => void ctx.close());
    } catch { /* optional audio only */ }
  }
}
