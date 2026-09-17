import type { GameState } from './gameState';
import type { GameUI } from './ui';

/** Adds cheap analog/digital security-monitor polish without creating extra render cameras. */
export class CctvPolishSystem {
  private readonly ui: GameUI;
  private readonly state: GameState;
  private readonly timecode: HTMLDivElement;
  private readonly staticFlash: HTMLDivElement;
  private tick = 0;

  constructor(ui: GameUI, state: GameState) {
    this.ui = ui;
    this.state = state;

    this.timecode = document.createElement('div');
    this.timecode.style.cssText = 'position:absolute;right:22px;top:20px;padding:6px 9px;background:rgba(0,0,0,.55);border:1px solid rgba(200,220,210,.16);font:12px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:1.2px;color:#aebfb2';

    this.staticFlash = document.createElement('div');
    this.staticFlash.style.cssText = 'position:absolute;inset:0;opacity:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(235,245,238,.17) 0 1px,rgba(0,0,0,.33) 1px 3px),repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 2px,transparent 2px 7px);mix-blend-mode:screen;transition:opacity .04s';

    ui.cctv.append(this.timecode, this.staticFlash);
    window.addEventListener('keydown', (event) => {
      if (ui.cctv.style.display !== 'block' || event.repeat) return;
      if (event.code === 'KeyQ' || event.code === 'KeyE') this.flashStatic();
    });
  }

  update(dt: number): void {
    if (this.ui.cctv.style.display !== 'block') return;
    this.tick -= dt;
    if (this.tick > 0) return;
    this.tick = 0.25;
    this.timecode.textContent = `${this.format(this.state.getGameMinutes())}   REC ●`;
  }

  private flashStatic(): void {
    this.staticFlash.style.opacity = '.72';
    window.setTimeout(() => { this.staticFlash.style.opacity = '0'; }, 85);
  }

  private format(minutes: number): string {
    const whole = Math.floor(minutes);
    const hour24 = Math.floor(whole / 60) % 24;
    const minute = whole % 60;
    const second = Math.floor((minutes - Math.floor(minutes)) * 60) % 60;
    const h = hour24.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    const s = second.toString().padStart(2, '0');
    return `1999-10-31  ${h}:${m}:${s}`;
  }
}
