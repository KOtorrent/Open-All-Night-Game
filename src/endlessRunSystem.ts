import type { GameSession } from './gameSession';
import type { GameState } from './gameState';
import type { PlayerController } from './playerController';

export class EndlessRunSystem {
  private ended = false;
  private readonly overlay: HTMLDivElement;

  constructor(
    private readonly session: GameSession,
    private readonly state: GameState,
    private readonly player: PlayerController
  ) {
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = 'position:fixed;inset:0;z-index:80;display:none;place-items:center;background:rgba(0,0,0,.90);color:#e6dbab;font-family:ui-monospace,SFMono-Regular,Consolas,monospace';
    document.body.appendChild(this.overlay);
  }

  update(): void {
    if (!this.session.isEndless() || this.ended) return;
    const misses = this.state.getCompletedIds().filter((id) => id.startsWith('endless-miss:')).length;
    if (misses < 3) return;
    this.finish(misses);
  }

  private finish(misses: number): void {
    this.ended = true;
    this.player.setActive(false);
    const stats = this.session.getEndlessStats();
    const mins = Math.floor(stats.seconds / 60);
    const secs = Math.floor(stats.seconds % 60).toString().padStart(2, '0');
    this.overlay.innerHTML = `<div style="width:min(560px,90vw);padding:30px;background:#080a09;border:1px solid #6e633d;text-align:center">
      <div style="font-size:11px;letter-spacing:3px;color:#b7a45d">ENDLESS RUN OVER</div>
      <div style="font-size:28px;margin:8px 0 18px">THE STORE WON</div>
      <div style="line-height:1.8;color:#bbb494">SURVIVED <b>${mins}:${secs}</b><br>ANOMALIES <b>${stats.anomalies}</b><br>INTENSITY <b>${stats.tier}</b><br>SCORE <b>${stats.score.toLocaleString()}</b><br>MISSED RESPONSES <b>${misses}</b></div>
      <button data-retry style="${this.buttonCss()}">RETRY SAME SEED</button>
      <button data-new style="${this.buttonCss()}">NEW RUN</button>
      <button data-menu style="${this.buttonCss()}">FRAMEWORK MENU</button>
    </div>`;
    this.overlay.style.display = 'grid';

    this.overlay.querySelector<HTMLButtonElement>('[data-retry]')?.addEventListener('click', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', 'endless');
      url.searchParams.set('seed', String(this.session.config.seed));
      window.location.href = url.toString();
    });
    this.overlay.querySelector<HTMLButtonElement>('[data-new]')?.addEventListener('click', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', 'endless');
      url.searchParams.delete('seed');
      window.location.href = url.toString();
    });
    this.overlay.querySelector<HTMLButtonElement>('[data-menu]')?.addEventListener('click', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('menu', '1');
      url.searchParams.set('mode', 'campaign');
      url.searchParams.delete('seed');
      window.location.href = url.toString();
    });
  }

  private buttonCss(): string {
    return 'display:block;width:100%;margin:9px 0;padding:11px;background:#151813;color:#e7dca9;border:1px solid #6e633d;font:12px ui-monospace,SFMono-Regular,Consolas,monospace;cursor:pointer';
  }
}
