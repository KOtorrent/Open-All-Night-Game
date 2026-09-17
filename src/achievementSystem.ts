import type { GameState } from './gameState';
import { ACHIEVEMENTS, type AchievementDefinition } from './achievementCatalog';
import { MYTHIC_ANOMALIES } from './anomalyCatalog';
import { ProgressionStore } from './progressionStore';

const CHORE_IDS = ['restock-aisle-1','clean-spill','take-trash','delivery-manifest','delivery-stocked','cooler-temp-log','lottery-count','closing-faceup','closing-counter','closing-coffee'];
const NIGHT1_CUSTOMER_SALES = ['first-sale','jenna-sale','late-sale','dale-sale','marcus-sale'];

export class AchievementSystem {
  private readonly toast: HTMLDivElement;
  private readonly progression: ProgressionStore;
  private hideTimer?: number;

  constructor(private readonly state: GameState, progression?: ProgressionStore) {
    this.progression = progression ?? new ProgressionStore();
    this.toast = document.createElement('div');
    this.toast.style.cssText = [
      'position:fixed','left:50%','top:72px','transform:translate(-50%,-8px)',
      'min-width:310px','max-width:460px','padding:11px 14px','background:rgba(9,10,9,.94)',
      'border:1px solid rgba(214,190,101,.42)','box-shadow:0 8px 28px rgba(0,0,0,.55)',
      'font:12px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace','color:#ddd4a5','z-index:30','opacity:0',
      'transition:opacity .18s ease,transform .18s ease','pointer-events:none'
    ].join(';');
    document.body.appendChild(this.toast);
  }

  update(): void {
    for (const def of ACHIEVEMENTS) {
      if (!this.test(def)) continue;
      if (this.progression.unlockAchievement(def.id)) {
        this.show(def);
        break;
      }
    }
  }

  unlock(id: string): boolean {
    const def = ACHIEVEMENTS.find((x) => x.id === id);
    if (!def || !this.progression.unlockAchievement(id)) return false;
    this.show(def);
    return true;
  }

  private test(def: AchievementDefinition): boolean {
    const p = this.progression.snapshot();
    switch (def.id) {
      case 'FIRST_DAY': return this.state.isComplete('night1-clock-out') || p.completedNights.includes(1);
      case 'REGULAR': return NIGHT1_CUSTOMER_SALES.every((id) => this.state.isComplete(id));
      case 'STORM_WARNING': return p.completedNights.includes(3);
      case 'TRUST_ISSUES': return this.state.isComplete('silent-customer-survived');
      case 'OVERTIME': return this.state.isComplete('five-sixty') || p.completedNights.includes(5);
      case 'FUCK_THIS_JOB': return p.endingsSeen.includes('CLOCK_OUT');
      case 'OPEN_ALL_NIGHT': return p.endingsSeen.includes('OPEN_ALL_NIGHT');
      case 'BREAK_THE_RULES': return p.endingsSeen.includes('BREAK_THE_RULES');
      case 'CLOCKED_OUT_FOR_GOOD': return ['CLOCK_OUT','OPEN_ALL_NIGHT','BREAK_THE_RULES'].every((x) => p.endingsSeen.includes(x));
      case 'DALE_WAS_FINE': return this.state.isComplete('dale-was-fine');
      case 'EMPLOYEE_OF_THE_MONTH': return this.state.isComplete('night1-clock-out') && !this.hasKnownRuleBreak() && CHORE_IDS.every((id) => this.state.isComplete(id));
      case 'TENURE': return [1,2,3,4,5].every((n) => p.completedNights.includes(n as 1|2|3|4|5));
      case 'RULE_FOLLOWER': return p.runs.some((r) => r.ruleBreaks === 0);
      case 'RULE_BREAKER': return p.runs.some((r) => r.ruleBreaks > 0);
      case 'CAMERA_SHY': return p.anomaliesSeen.includes('cam4-figure') || p.anomaliesSeen.includes('camera-desync');
      case 'PUMP_SEVEN': return p.anomaliesSeen.includes('pump-7');
      case 'THREE_THIRTY_THREE': return p.anomaliesSeen.includes('frozen-clock');
      case 'NO_SERVICE': return this.state.isComplete('pump7-denied');
      case 'NOBODY_HOME': return this.state.isComplete('rear-door-checked');
      case 'WRONG_NUMBER': return this.state.isComplete('phone-answered');
      case 'PAPER_TRAIL': return this.state.isComplete('impossible-receipt-read');
      case 'NIGHT_AUDITOR': return ['office-roster','office-incidents','office-terminal'].every((x) => this.state.isComplete(x));
      case 'LARRY': return p.anomaliesSeen.includes('larry-arrival');
      case 'MYTHIC': return p.mythicsSeen.length > 0;
      case 'ALL_MYTHICS': return MYTHIC_ANOMALIES.every((x) => p.mythicsSeen.includes(x.id));
      case 'ENDLESS_30': return p.bestEndlessSeconds >= 1800;
      case 'ENDLESS_60': return p.bestEndlessSeconds >= 3600;
      case 'ENDLESS_100': return p.bestEndlessAnomalies >= 100;
      case 'PERFECT_WEEK': return [1,2,3,4,5].every((n) => p.completedNights.includes(n as 1|2|3|4|5) && (p.campaignRuleBreaks[String(n)] ?? 0) === 0);
      case 'ALL_ACHIEVEMENTS': return ACHIEVEMENTS.filter((x) => x.id !== 'ALL_ACHIEVEMENTS').every((x) => p.unlockedAchievements.includes(x.id));
      default: return false;
    }
  }

  private hasKnownRuleBreak(): boolean {
    return ['silent-rule-broken','freezer-rule-broken','restroom-rule-broken'].some((id) => this.state.isComplete(id));
  }

  private show(def: AchievementDefinition): void {
    if (this.hideTimer !== undefined) window.clearTimeout(this.hideTimer);
    this.toast.innerHTML = `<div style="font-size:10px;letter-spacing:1.6px;color:#b19a52;margin-bottom:3px">ACHIEVEMENT UNLOCKED</div><div style="font-weight:800;font-size:14px;letter-spacing:.9px;color:#efe4af">${def.title}</div><div style="margin-top:2px;color:#bdb99e">${def.description}</div>`;
    this.toast.style.opacity = '1';
    this.toast.style.transform = 'translate(-50%,0)';
    this.hideTimer = window.setTimeout(() => {
      this.toast.style.opacity = '0';
      this.toast.style.transform = 'translate(-50%,-8px)';
    }, 4300);
  }
}
