import type { GameSession } from './gameSession';

export class EndlessHudSystem {
  private readonly el: HTMLDivElement;

  constructor(private readonly session: GameSession) {
    this.el = document.createElement('div');
    this.el.style.cssText = 'position:fixed;right:22px;bottom:22px;z-index:12;padding:8px 10px;background:rgba(0,0,0,.50);border-right:2px solid #8f7e42;color:#d9d2aa;font:11px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.5px;display:none';
    document.body.appendChild(this.el);
    if (session.isEndless()) this.el.style.display = 'block';
  }

  update(): void {
    if (!this.session.isEndless()) return;
    const stats = this.session.getEndlessStats();
    const mins = Math.floor(stats.seconds / 60);
    const secs = Math.floor(stats.seconds % 60).toString().padStart(2, '0');
    this.el.innerHTML = `ENDLESS MODE<br><b>${mins}:${secs}</b> &nbsp; • &nbsp; ${stats.anomalies} anomalies`;
  }
}
