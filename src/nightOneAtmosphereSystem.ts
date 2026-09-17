import * as pc from 'playcanvas';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

/**
 * Non-failing atmosphere beats. These are intentionally restrained and never masquerade as rule
 * checks. They keep long stretches of Night 1 from feeling mechanically empty.
 */
export class NightOneAtmosphereSystem {
  private readonly app: pc.Application;
  private readonly state: GameState;
  private readonly ui: GameUI;
  private flickerDone = false;
  private roadPassDone = false;
  private shelfKnockDone = false;
  private fixture?: pc.Entity;
  private originalIntensity = 0;
  private flickerTimer = 0;

  constructor(app: pc.Application, state: GameState, ui: GameUI) {
    this.app = app;
    this.state = state;
    this.ui = ui;
    const fixtureNode = app.root.findByName('StoreLight-2') ?? app.root.findByName('StoreLight-1');
    this.fixture = fixtureNode instanceof pc.Entity ? fixtureNode : undefined;
    if (this.fixture?.light) this.originalIntensity = this.fixture.light.intensity;
  }

  update(dt: number): void {
    const minute = this.state.getGameMinutes();

    if (!this.roadPassDone && minute >= 24 * 60 + 48) {
      this.roadPassDone = true;
      this.ui.showMessage('Headlights crawl across the front windows, then disappear down the road.', 3200);
      this.sweepRoadLight();
    }

    if (!this.flickerDone && minute >= 25 * 60 + 42) {
      this.flickerDone = true;
      this.flickerTimer = 1.9;
      this.ui.showMessage('One fluorescent tube sputters overhead.', 2200);
    }

    if (this.flickerTimer > 0 && this.fixture?.light) {
      this.flickerTimer -= dt;
      this.fixture.light.intensity = Math.floor(this.flickerTimer * 12) % 3 === 0 ? 0.03 : Math.max(0.25, this.originalIntensity);
      if (this.flickerTimer <= 0) this.fixture.light.intensity = this.originalIntensity;
    }

    if (!this.shelfKnockDone && minute >= 28 * 60 + 12) {
      this.shelfKnockDone = true;
      this.ui.showMessage('Something shifts on a shelf somewhere behind you.', 2600);
      this.tapSound();
    }
  }

  private sweepRoadLight(): void {
    const light = new pc.Entity('PassingRoadHeadlights');
    light.addComponent('light', {
      type: 'omni',
      color: new pc.Color(0.68, 0.72, 0.62),
      intensity: 0.65,
      range: 8,
      castShadows: false
    });
    light.setPosition(-9, 1.1, 14.5);
    this.app.root.addChild(light);

    let x = -9;
    const step = () => {
      x += 0.95;
      light.setPosition(x, 1.1, 14.5);
      if (x < 9) window.setTimeout(step, 55);
      else light.destroy();
    };
    step();
  }

  private tapSound(): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'square';
      oscillator.frequency.value = 88;
      gain.gain.value = 0.018;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      oscillator.stop(ctx.currentTime + 0.13);
      oscillator.addEventListener('ended', () => void ctx.close());
    } catch {
      // Atmosphere audio must never block gameplay.
    }
  }
}
