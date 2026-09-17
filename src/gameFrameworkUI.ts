import { NIGHTS, type NightId } from './campaignDefinition';
import type { GameSession } from './gameSession';

export class GameFrameworkUI {
  private readonly badge: HTMLDivElement;
  private readonly menu: HTMLDivElement;

  constructor(private readonly session: GameSession) {
    this.badge = document.createElement('div');
    this.badge.style.cssText = [
      'position:fixed','right:14px','top:42px','z-index:18','padding:5px 8px',
      'font:10px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace','letter-spacing:1.2px',
      'color:#bdb58b','background:rgba(5,6,5,.58)','border:1px solid rgba(190,177,112,.18)','pointer-events:none'
    ].join(';');
    this.badge.textContent = this.session.isEndless() ? 'ENDLESS MODE' : `NIGHT ${this.session.config.night} — ${this.session.night.title}`;
    document.body.appendChild(this.badge);

    this.menu = document.createElement('div');
    this.menu.style.cssText = [
      'position:fixed','inset:0','z-index:100','display:none','align-items:center','justify-content:center',
      'background:rgba(0,0,0,.90)','font-family:ui-monospace,SFMono-Regular,Consolas,monospace','color:#e7dfb4'
    ].join(';');
    document.body.appendChild(this.menu);
    this.renderMenu();

    const params = new URLSearchParams(window.location.search);
    if (params.get('menu') === '1') this.show();
    window.addEventListener('keydown', (event) => {
      if (event.code === 'F2') {
        event.preventDefault();
        this.menu.style.display === 'flex' ? this.hide() : this.show();
      }
    });
  }

  show(): void { this.menu.style.display = 'flex'; }
  hide(): void { this.menu.style.display = 'none'; }

  private renderMenu(): void {
    const progress = this.session.progression.snapshot();
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'width:min(780px,92vw);padding:28px;background:#101310;border:1px solid #6f6944;box-shadow:0 22px 80px rgba(0,0,0,.75)';
    wrapper.innerHTML = `<div style="font-size:28px;letter-spacing:4px">OPEN ALL NIGHT</div><div style="margin:5px 0 22px;color:#8e896f">Your shift ends at 6:00 AM. Probably.</div><div style="font-size:12px;color:#c5b86d;margin-bottom:10px">CAMPAIGN / CHAPTER SELECT</div>`;

    const nightGrid = document.createElement('div');
    nightGrid.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:18px';
    for (const id of [1,2,3,4,5] as NightId[]) {
      const def = NIGHTS[id];
      const unlocked = id <= progress.unlockedNight;
      const button = document.createElement('button');
      button.disabled = !unlocked;
      button.innerHTML = `<strong>NIGHT ${id}</strong><br><span style="font-size:9px">${def.title}</span>`;
      button.style.cssText = this.buttonCss(unlocked);
      button.onclick = () => this.navigate('chapter', id);
      nightGrid.appendChild(button);
    }
    wrapper.appendChild(nightGrid);

    const campaign = document.createElement('button');
    campaign.textContent = `CONTINUE CAMPAIGN — NIGHT ${progress.unlockedNight}`;
    campaign.style.cssText = this.buttonCss(true) + ';width:100%;margin-bottom:8px';
    campaign.onclick = () => this.navigate('campaign', progress.unlockedNight);
    wrapper.appendChild(campaign);

    const endless = document.createElement('button');
    endless.textContent = progress.completedNights.length >= 5 ? 'ENDLESS MODE' : 'ENDLESS MODE — UNLOCKS AFTER CAMPAIGN';
    endless.disabled = progress.completedNights.length < 5;
    endless.style.cssText = this.buttonCss(!endless.disabled) + ';width:100%;margin-bottom:8px';
    endless.onclick = () => this.navigate('endless', 5);
    wrapper.appendChild(endless);

    const achievements = document.createElement('div');
    achievements.style.cssText = 'margin-top:14px;color:#8e896f;font-size:10px';
    achievements.textContent = `${progress.unlockedAchievements.length}/30 ACHIEVEMENTS • ${progress.completedNights.length}/5 NIGHTS COMPLETE • ${progress.endingsSeen.length}/3 ENDINGS`;
    wrapper.appendChild(achievements);
    this.menu.appendChild(wrapper);
  }

  private navigate(mode: 'campaign'|'chapter'|'endless', night: NightId): void {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', mode);
    url.searchParams.set('night', String(night));
    url.searchParams.delete('menu');
    window.location.href = url.toString();
  }

  private buttonCss(enabled: boolean): string {
    return [
      'padding:12px 9px','border:1px solid #756b3e','background:' + (enabled ? '#182018' : '#111311'),
      'color:' + (enabled ? '#eee5b5' : '#5d5c50'),'font:11px ui-monospace,SFMono-Regular,Consolas,monospace',
      'cursor:' + (enabled ? 'pointer' : 'default')
    ].join(';');
  }
}
