import type { GameSession } from './gameSession';

export class EndlessHudSystem {
  private readonly el: HTMLDivElement;
  private lastTier = 1;

  constructor(private readonly session: GameSession) {
    this.el = document.createElement('div');
    this.el.style.cssText = 'position:fixed;right:22px;bottom:22px;z-index:12;padding:8px 10px;background:rgba(0,0,0,.50);border-right:2px solid #8f7e42;color:#d9d2aa;font:11px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.5px;display:none;text-align:right';
    document.body.appendChild(this.el);
    if (session.isEndless()) this.el.style.display = 'block';
  }

  update(): void {
    if (!this.session.isEndless()) return;
    const stats = this.session.getEndlessStats();
    const mins = Math.floor(stats.seconds / 60);
    const secs = Math.floor(stats.seconds % 60).toString().padStart(2, '0');

    if (stats.tier !== this.lastTier) {
      this.lastTier = stats.tier;
      const banner = document.createElement('div');
      banner.textContent = `ENDLESS INTENSITY ${stats.tier}`;
      banner.style.cssText = 'position:fixed;left:50%;top:28%;transform:translate(-50%,-50%);z-index:55;padding:10px 14px;background:rgba(0,0,0,.75);border:1px solid #76683a;color:#e3d49c;font:700 14px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:2px';
      document.body.appendChild(banner);
      window.setTimeout(() => banner.remove(), 2200);
    }

    this.el.innerHTML = `ENDLESS MODE — TIER ${stats.tier}<br><b>${mins}:${secs}</b> &nbsp; • &nbsp; ${stats.anomalies} anomalies<br>SCORE <b>${stats.score.toLocaleString()}</b>`;
  }
}
