import { NIGHTS, type NightId } from './campaignDefinition';
import type { GameSession } from './gameSession';
import type { ProgressionData } from './progressionStore';

/**
 * The title/chapter-select presentation. Previously this only ever appeared as an F2/`?menu=1`
 * debug overlay - a normal player loading the site went straight into live gameplay with no title
 * screen at all. It now also shows automatically on a genuine bare landing (no `mode`/`night` in
 * the URL), so the game actually has a front door, while every existing entry point (F2, `?menu=1`,
 * and every `?mode=...` deep link used by dev tooling and QA capture scripts) keeps working exactly
 * as before - only the "nothing was asked for" case changed.
 *
 * Graphics overhaul Pass 2: human visual review found the Pass 1 menu still read as a generic UI
 * form (a centered, uniformly-bordered box of spreadsheet-like tiles) rather than a title screen.
 * This pass leans harder on the live game world already rendering behind the overlay as the hero
 * image - the scrim now fades left-to-right instead of covering the whole frame, so the storefront
 * and forecourt read as the background art - and replaces the grid-of-identical-buttons look with
 * left-aligned typography, per-chapter status cards (locked/next-up/complete), and text-button style
 * actions with a thin accent rule instead of a full border box.
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
      'position:fixed', 'inset:0', 'z-index:100', 'display:none', 'align-items:center', 'justify-content:flex-start',
      'font-family:ui-monospace,SFMono-Regular,Consolas,monospace', 'color:#e7dfb4',
      'padding-left:min(9vw,110px)', 'box-sizing:border-box',
      // A left-weighted scrim instead of a near-opaque full-frame gradient: dark and readable behind
      // the text column, fading away by mid-frame so the live game canvas (the storefront exterior,
      // already rendering behind this overlay) reads as the actual hero image on the right two-thirds
      // of the screen, per the visual style bible's "the station as an island of light" direction. A
      // thin top/bottom vignette keeps the very edges from feeling like a hard crop.
      'background:' +
        'linear-gradient(100deg, rgba(3,4,5,.96) 0%, rgba(4,7,8,.90) 26%, rgba(4,7,8,.52) 48%, rgba(4,7,8,.14) 68%, rgba(4,7,8,.03) 84%),' +
        'linear-gradient(180deg, rgba(2,3,3,.5) 0%, rgba(2,3,3,0) 16%, rgba(2,3,3,0) 80%, rgba(2,3,3,.6) 100%)'
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
    const nextNight = progress.unlockedNight;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = [
      'width:min(640px,84vw)', 'max-height:90vh', 'overflow:auto',
      'display:flex', 'flex-direction:column', 'align-items:flex-start', 'text-align:left'
    ].join(';');

    const title = document.createElement('div');
    title.style.cssText = [
      'font-size:clamp(32px,5.2vw,50px)', 'letter-spacing:8px', 'font-weight:700', 'color:#efe6bd',
      'text-shadow:0 0 30px rgba(232,214,128,.24),0 3px 12px rgba(0,0,0,.8)', 'line-height:1.05'
    ].join(';');
    title.textContent = 'OPEN ALL NIGHT';
    wrapper.appendChild(title);

    const bar = document.createElement('div');
    bar.style.cssText = 'width:100px;height:2px;margin:14px 0 10px;background:linear-gradient(90deg,#c74b3a,#3f6b4c 60%,transparent)';
    wrapper.appendChild(bar);

    const tagline = document.createElement('div');
    tagline.style.cssText = 'color:#a49a76;font-size:13px;letter-spacing:1.4px;font-style:italic;margin-bottom:36px';
    tagline.textContent = 'Your shift ends at 6:00 AM. Probably.';
    wrapper.appendChild(tagline);

    const sectionLabel = document.createElement('div');
    sectionLabel.style.cssText = 'font-size:10.5px;letter-spacing:3px;color:#8f9d80;margin-bottom:12px;display:flex;align-items:center;gap:9px';
    sectionLabel.innerHTML = '<span style="width:20px;height:1px;background:#5c6e52;display:inline-block"></span>CHAPTER SELECT';
    wrapper.appendChild(sectionLabel);

    const nightRow = document.createElement('div');
    nightRow.style.cssText = 'display:flex;gap:7px;width:100%;margin-bottom:22px';
    for (const id of [1, 2, 3, 4, 5] as NightId[]) {
      nightRow.appendChild(this.buildChapterCard(id, progress));
    }
    wrapper.appendChild(nightRow);

    const campaign = this.buildActionButton(
      `CONTINUE — NIGHT ${nextNight}`,
      NIGHTS[nextNight].title,
      'primary',
      true
    );
    campaign.onclick = () => this.navigate('campaign', nextNight);
    wrapper.appendChild(campaign);

    const endlessUnlocked = progress.completedNights.length >= 5;
    const endless = this.buildActionButton(
      'ENDLESS MODE',
      endlessUnlocked ? 'Survive as long as you can.' : 'Unlocks after finishing the campaign.',
      'secondary',
      endlessUnlocked
    );
    if (endlessUnlocked) endless.onclick = () => this.navigate('endless', 5);
    wrapper.appendChild(endless);

    const stats = document.createElement('div');
    stats.style.cssText = 'margin-top:18px;color:#726d58;font-size:9.5px;letter-spacing:1.1px;opacity:.85';
    stats.textContent = `${progress.unlockedAchievements.length}/30 ACHIEVEMENTS   ${progress.completedNights.length}/5 NIGHTS   ${progress.endingsSeen.length}/3 ENDINGS`;
    wrapper.appendChild(stats);

    const hint = document.createElement('div');
    hint.style.cssText = 'margin-top:6px;color:#4c4a3c;font-size:9px;letter-spacing:.5px';
    hint.textContent = 'F2 toggles this menu during a shift.';
    wrapper.appendChild(hint);

    this.menu.appendChild(wrapper);
  }

  private buildChapterCard(id: NightId, progress: ProgressionData): HTMLButtonElement {
    const def = NIGHTS[id];
    const completed = progress.completedNights.includes(id);
    const locked = id > progress.unlockedNight;
    const current = !locked && !completed;

    const restBg = current ? 'linear-gradient(165deg, rgba(41,36,18,.55), rgba(15,19,15,.6))' : 'rgba(15,19,15,.55)';
    const hoverBg = current ? 'linear-gradient(165deg, rgba(52,45,20,.68), rgba(20,25,19,.72))' : 'rgba(28,35,27,.72)';

    const card = document.createElement('button');
    card.style.cssText = [
      'flex:1', 'min-width:0', 'display:flex', 'flex-direction:column', 'gap:5px',
      'padding:11px 8px 10px', 'text-align:left', `background:${restBg}`,
      'border:none', `border-bottom:2px solid ${current ? '#c9a24a' : completed ? 'rgba(90,150,100,.55)' : 'rgba(90,100,84,.28)'}`,
      'transition:background-color .14s,box-shadow .14s,transform .14s',
      'font-family:inherit', `cursor:${locked ? 'default' : 'pointer'}`,
      current ? 'box-shadow:0 0 0 1px rgba(201,162,74,.22),0 0 18px rgba(201,162,74,.12)' : 'box-shadow:none',
      locked ? 'opacity:.55' : 'opacity:1'
    ].join(';');

    const number = document.createElement('div');
    number.style.cssText = `font-size:19px;font-weight:700;letter-spacing:.5px;color:${locked ? '#5a5a4e' : current ? '#f1d99a' : '#dfe0c9'}`;
    number.textContent = `N${id}`;
    card.appendChild(number);

    const titleEl = document.createElement('div');
    titleEl.style.cssText = `font-size:9.5px;line-height:1.3;letter-spacing:.3px;min-height:22px;color:${locked ? '#4c4b41' : '#a9a488'}`;
    titleEl.textContent = def.title;
    card.appendChild(titleEl);

    const tag = document.createElement('div');
    tag.style.cssText = 'font-size:8px;letter-spacing:1.4px;margin-top:2px;font-weight:600';
    if (locked) {
      tag.style.color = '#54523f';
      tag.textContent = 'LOCKED';
    } else if (completed) {
      tag.style.color = '#7fb37f';
      tag.textContent = '✓ COMPLETE';
    } else {
      tag.style.color = '#d9b667';
      tag.textContent = '▸ NEXT UP';
    }
    card.appendChild(tag);

    card.disabled = locked;
    if (!locked) {
      card.addEventListener('mouseenter', () => { card.style.background = hoverBg; card.style.transform = 'translateY(-1px)'; });
      card.addEventListener('mouseleave', () => { card.style.background = restBg; card.style.transform = 'none'; });
      card.addEventListener('focus', () => { card.style.boxShadow = '0 0 0 1px rgba(232,214,128,.55)'; });
      card.addEventListener('blur', () => { card.style.boxShadow = current ? '0 0 0 1px rgba(201,162,74,.22),0 0 18px rgba(201,162,74,.12)' : 'none'; });
      card.onclick = () => this.navigate('chapter', id);
    }

    return card;
  }

  private buildActionButton(label: string, sub: string, kind: 'primary' | 'secondary', enabled: boolean): HTMLButtonElement {
    const accent = kind === 'primary' ? '#3f6b4c' : '#c74b3a';
    const fg = enabled ? (kind === 'primary' ? '#f1ecc9' : '#e2c3b6') : '#565448';
    const restBg = 'rgba(14,18,14,.5)';
    const hoverBg = kind === 'primary' ? 'rgba(47,73,53,.42)' : 'rgba(60,28,22,.38)';

    const button = document.createElement('button');
    button.style.cssText = [
      'width:100%', 'text-align:left', 'padding:13px 16px 12px 16px', 'margin-bottom:8px',
      'font-family:inherit', `background:${restBg}`, 'border:none',
      `border-left:2px solid ${enabled ? accent : 'rgba(90,90,80,.3)'}`,
      'display:flex', 'flex-direction:column', 'gap:2px',
      'transition:background-color .14s,box-shadow .14s,padding-left .14s',
      `cursor:${enabled ? 'pointer' : 'default'}`
    ].join(';');

    const top = document.createElement('div');
    top.style.cssText = `font-size:13px;letter-spacing:1.6px;font-weight:700;color:${fg};display:flex;justify-content:space-between;align-items:center`;
    const label1 = document.createElement('span');
    label1.textContent = label;
    top.appendChild(label1);
    if (enabled) {
      const arrow = document.createElement('span');
      arrow.style.cssText = 'opacity:.6;font-weight:400';
      arrow.textContent = '→';
      top.appendChild(arrow);
    }
    button.appendChild(top);

    const bottom = document.createElement('div');
    bottom.style.cssText = `font-size:10px;letter-spacing:.4px;font-style:italic;color:${enabled ? '#8f8a70' : '#4c4a3e'}`;
    bottom.textContent = sub;
    button.appendChild(bottom);

    button.disabled = !enabled;
    if (enabled) {
      button.addEventListener('mouseenter', () => { button.style.background = hoverBg; button.style.paddingLeft = '20px'; });
      button.addEventListener('mouseleave', () => { button.style.background = restBg; button.style.paddingLeft = '16px'; });
      button.addEventListener('focus', () => { button.style.boxShadow = `inset 0 0 0 1px ${accent}`; });
      button.addEventListener('blur', () => { button.style.boxShadow = 'none'; });
    }

    return button;
  }

  private navigate(mode: 'campaign' | 'chapter' | 'endless', night: NightId): void {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', mode);
    url.searchParams.set('night', String(night));
    url.searchParams.delete('menu');
    window.location.href = url.toString();
  }
}
