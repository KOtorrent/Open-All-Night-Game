import { NIGHTS, type NightId } from './campaignDefinition';
import type { GameSession } from './gameSession';

/**
 * The title/chapter-select presentation. Previously this only ever appeared as an F2/`?menu=1`
 * debug overlay - a normal player loading the site went straight into live gameplay with no title
 * screen at all. It now also shows automatically on a genuine bare landing (no `mode`/`night` in
 * the URL), so the game actually has a front door, while every existing entry point (F2, `?menu=1`,
 * and every `?mode=...` deep link used by dev tooling and QA capture scripts) keeps working exactly
 * as before - only the "nothing was asked for" case changed.
 */
export class GameFrameworkUI {
  private readonly badge: HTMLDivElement;
  private readonly menu: HTMLDivElement;
  private visible = false;

  constructor(private readonly session: GameSession) {
    this.badge = document.createElement('div');
    this.badge.style.cssText = [
      'position:fixed', 'right:14px', 'top:42px', 'z-index:18', 'padding:5px 8px',
      'font:10px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace', 'letter-spacing:1.2px',
      'color:#bdb58b', 'background:rgba(5,6,5,.58)', 'border:1px solid rgba(190,177,112,.18)', 'pointer-events:none'
    ].join(';');
    this.badge.textContent = this.session.isEndless() ? 'ENDLESS MODE' : `NIGHT ${this.session.config.night} — ${this.session.night.title}`;
    document.body.appendChild(this.badge);

    this.menu = document.createElement('div');
    this.menu.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:100', 'display:none', 'align-items:center', 'justify-content:center',
      'font-family:ui-monospace,SFMono-Regular,Consolas,monospace', 'color:#e7dfb4',
      // A layered gradient instead of a flat black rectangle: dark at the top and bottom edges,
      // a slightly lighter band through the middle third so the live game canvas (the storefront
      // exterior, already rendering behind this overlay) reads through as an atmospheric backdrop -
      // "the station as an island of light" bleeding faintly through the menu's darkness, per the
      // visual style bible, instead of hiding it behind solid black.
      'background:linear-gradient(180deg, rgba(3,4,5,.97) 0%, rgba(4,7,8,.90) 30%, rgba(4,7,8,.86) 55%, rgba(3,4,5,.95) 82%, rgba(2,3,3,.98) 100%)'
    ].join(';');
    document.body.appendChild(this.menu);
    this.renderMenu();

    const params = new URLSearchParams(window.location.search);
    const bareLanding = !params.get('mode') && !params.get('night') && !params.get('seed');
    if (params.get('menu') === '1' || (bareLanding && params.get('menu') !== '0')) this.show();

    window.addEventListener('keydown', (event) => {
      if (event.code === 'F2') {
        event.preventDefault();
        this.visible ? this.hide() : this.show();
      }
    });
  }

  show(): void { this.menu.style.display = 'flex'; this.visible = true; }
  hide(): void { this.menu.style.display = 'none'; this.visible = false; }

  private renderMenu(): void {
    const progress = this.session.progression.snapshot();

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'width:min(760px,92vw);max-height:88vh;overflow:auto;display:flex;flex-direction:column;align-items:center;padding:8px 4px';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:clamp(34px,6vw,54px);letter-spacing:9px;font-weight:700;color:#efe6bd;text-shadow:0 0 26px rgba(232,214,128,.20),0 2px 0 rgba(0,0,0,.6);text-align:center';
    title.textContent = 'OPEN ALL NIGHT';
    wrapper.appendChild(title);

    const bar = document.createElement('div');
    bar.style.cssText = 'width:120px;height:3px;margin:14px 0 10px;background:linear-gradient(90deg,transparent,#3f6b4c,#c74b3a,#3f6b4c,transparent)';
    wrapper.appendChild(bar);

    const tagline = document.createElement('div');
    tagline.style.cssText = 'color:#a49a76;font-size:13px;letter-spacing:1.5px;font-style:italic;margin-bottom:30px';
    tagline.textContent = 'Your shift ends at 6:00 AM. Probably.';
    wrapper.appendChild(tagline);

    const panel = document.createElement('div');
    panel.style.cssText = [
      'width:100%', 'padding:22px 26px 20px', 'background:linear-gradient(165deg, rgba(10,16,12,.82), rgba(6,9,7,.90))',
      'border:1px solid rgba(140,171,140,.22)', 'border-left:3px solid #3f6b4c', 'box-shadow:0 24px 70px rgba(0,0,0,.55), inset 0 0 40px rgba(0,0,0,.25)'
    ].join(';');

    const sectionLabel = document.createElement('div');
    sectionLabel.style.cssText = 'font-size:11px;letter-spacing:2.4px;color:#c9bd7c;margin-bottom:12px;display:flex;align-items:center;gap:8px';
    sectionLabel.innerHTML = '<span style="width:16px;height:1px;background:#c9bd7c;display:inline-block"></span>CAMPAIGN / CHAPTER SELECT';
    panel.appendChild(sectionLabel);

    const nightGrid = document.createElement('div');
    nightGrid.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:16px';
    for (const id of [1, 2, 3, 4, 5] as NightId[]) {
      const def = NIGHTS[id];
      const unlocked = id <= progress.unlockedNight;
      const button = document.createElement('button');
      button.disabled = !unlocked;
      button.innerHTML = `<strong style="letter-spacing:1px">NIGHT ${id}</strong><br><span style="font-size:9px;opacity:.85">${def.title}</span>`;
      this.styleButton(button, unlocked ? 'tile' : 'disabled');
      button.onclick = () => this.navigate('chapter', id);
      nightGrid.appendChild(button);
    }
    panel.appendChild(nightGrid);

    const campaign = document.createElement('button');
    campaign.textContent = `CONTINUE CAMPAIGN — NIGHT ${progress.unlockedNight}`;
    this.styleButton(campaign, 'primary');
    campaign.style.width = '100%';
    campaign.style.marginBottom = '9px';
    campaign.onclick = () => this.navigate('campaign', progress.unlockedNight);
    panel.appendChild(campaign);

    const endlessUnlocked = progress.completedNights.length >= 5;
    const endless = document.createElement('button');
    endless.textContent = endlessUnlocked ? 'ENDLESS MODE' : 'ENDLESS MODE — UNLOCKS AFTER CAMPAIGN';
    endless.disabled = !endlessUnlocked;
    this.styleButton(endless, endlessUnlocked ? 'secondary' : 'disabled');
    endless.style.width = '100%';
    endless.onclick = () => this.navigate('endless', 5);
    panel.appendChild(endless);

    wrapper.appendChild(panel);

    const stats = document.createElement('div');
    stats.style.cssText = 'margin-top:16px;color:#8e896f;font-size:10.5px;letter-spacing:.6px;text-align:center';
    stats.textContent = `${progress.unlockedAchievements.length}/30 ACHIEVEMENTS  •  ${progress.completedNights.length}/5 NIGHTS COMPLETE  •  ${progress.endingsSeen.length}/3 ENDINGS`;
    wrapper.appendChild(stats);

    const hint = document.createElement('div');
    hint.style.cssText = 'margin-top:8px;color:#5c5946;font-size:9.5px;letter-spacing:.5px;text-align:center';
    hint.textContent = 'F2 toggles this menu during a shift.';
    wrapper.appendChild(hint);

    this.menu.appendChild(wrapper);
  }

  private navigate(mode: 'campaign' | 'chapter' | 'endless', night: NightId): void {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', mode);
    url.searchParams.set('night', String(night));
    url.searchParams.delete('menu');
    window.location.href = url.toString();
  }

  private styleButton(button: HTMLButtonElement, kind: 'tile' | 'primary' | 'secondary' | 'disabled'): void {
    const base = [
      'padding:12px 9px', 'font:11px ui-monospace,SFMono-Regular,Consolas,monospace', 'letter-spacing:.5px',
      'transition:background-color .12s,border-color .12s,box-shadow .12s', 'text-align:center'
    ];
    if (kind === 'disabled') {
      button.style.cssText = [...base, 'border:1px solid rgba(93,92,80,.35)', 'background:rgba(17,19,17,.7)', 'color:#5d5c50', 'cursor:default'].join(';');
      return;
    }
    const colors = {
      tile: { border: 'rgba(140,171,140,.30)', bg: 'rgba(24,32,24,.72)', fg: '#eee5b5', hoverBorder: '#8fae7a', hoverBg: 'rgba(37,51,35,.9)' },
      primary: { border: '#3f6b4c', bg: 'linear-gradient(180deg,#2c4a34,#213a29)', fg: '#f3ecc7', hoverBorder: '#5c8a67', hoverBg: 'linear-gradient(180deg,#345a3e,#294630)' },
      secondary: { border: 'rgba(199,75,58,.45)', bg: 'rgba(30,18,16,.72)', fg: '#e9c9b8', hoverBorder: '#c74b3a', hoverBg: 'rgba(48,24,20,.85)' }
    }[kind];
    button.style.cssText = [...base, `border:1px solid ${colors.border}`, `background:${colors.bg}`, `color:${colors.fg}`, 'cursor:pointer'].join(';');
    button.addEventListener('mouseenter', () => {
      button.style.borderColor = colors.hoverBorder;
      button.style.background = colors.hoverBg;
      button.style.boxShadow = `0 0 14px ${kind === 'secondary' ? 'rgba(199,75,58,.25)' : 'rgba(143,174,122,.22)'}`;
    });
    button.addEventListener('mouseleave', () => {
      button.style.borderColor = colors.border;
      button.style.background = colors.bg;
      button.style.boxShadow = 'none';
    });
  }
}
