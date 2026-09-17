import type { GameState } from './gameState';

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  test: (state: GameState) => boolean;
}

const CHORE_IDS = [
  'restock-aisle-1',
  'clean-spill',
  'take-trash',
  'delivery-manifest',
  'delivery-stocked',
  'closing-faceup',
  'closing-counter',
  'closing-coffee'
];

const NIGHT1_CUSTOMER_SALES = ['first-sale', 'jenna-sale', 'late-sale', 'dale-sale', 'marcus-sale'];

/**
 * Steam-independent achievement foundation. Unlock state is local for now; the same IDs can later
 * be mirrored to Steamworks without changing gameplay systems.
 */
export class AchievementSystem {
  private readonly state: GameState;
  private readonly toast: HTMLDivElement;
  private readonly unlocked = new Set<string>();
  private hideTimer?: number;

  private readonly defs: AchievementDef[] = [
    {
      id: 'FIRST_DAY',
      title: 'FIRST DAY',
      description: 'Finish your first shift at Case’s.',
      test: (state) => state.isComplete('night1-clock-out')
    },
    {
      id: 'REGULAR',
      title: 'REGULAR',
      description: 'Serve every ordinary customer during Night 1.',
      test: (state) => NIGHT1_CUSTOMER_SALES.every((id) => state.isComplete(id))
    },
    {
      id: 'DALE_WAS_FINE',
      title: 'DALE WAS FINE',
      description: 'Serve Dale. Nothing bad happens.',
      test: (state) => state.isComplete('dale-was-fine')
    },
    {
      id: 'TRUST_ISSUES',
      title: 'TRUST ISSUES',
      description: 'Make it through the silent customer without speaking.',
      test: (state) => state.isComplete('silent-customer-survived')
    },
    {
      id: 'EMPLOYEE_OF_THE_MONTH',
      title: 'EMPLOYEE OF THE MONTH',
      description: 'Finish Night 1, obey every rule, and leave no assigned work unfinished.',
      test: (state) => state.isComplete('night1-clock-out') &&
        !state.isComplete('silent-rule-broken') &&
        !state.isComplete('freezer-rule-broken') &&
        !state.isComplete('restroom-rule-broken') &&
        CHORE_IDS.every((id) => state.isComplete(id))
    }
  ];

  constructor(state: GameState) {
    this.state = state;
    this.load();

    this.toast = document.createElement('div');
    this.toast.style.cssText = [
      'position:fixed', 'left:50%', 'top:72px', 'transform:translate(-50%,-8px)',
      'min-width:310px', 'max-width:460px', 'padding:11px 14px',
      'background:rgba(9,10,9,.94)', 'border:1px solid rgba(214,190,101,.42)',
      'box-shadow:0 8px 28px rgba(0,0,0,.55)',
      'font:12px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace',
      'color:#ddd4a5', 'z-index:30', 'opacity:0',
      'transition:opacity .18s ease,transform .18s ease', 'pointer-events:none'
    ].join(';');
    document.body.appendChild(this.toast);
  }

  update(): void {
    for (const def of this.defs) {
      if (this.unlocked.has(def.id) || !def.test(this.state)) continue;
      this.unlock(def);
      break;
    }
  }

  private unlock(def: AchievementDef): void {
    this.unlocked.add(def.id);
    this.save();
    if (this.hideTimer !== undefined) window.clearTimeout(this.hideTimer);
    this.toast.innerHTML = `
      <div style="font-size:10px;letter-spacing:1.6px;color:#b19a52;margin-bottom:3px">ACHIEVEMENT UNLOCKED</div>
      <div style="font-weight:800;font-size:14px;letter-spacing:.9px;color:#efe4af">${def.title}</div>
      <div style="margin-top:2px;color:#bdb99e">${def.description}</div>
    `;
    this.toast.style.opacity = '1';
    this.toast.style.transform = 'translate(-50%,0)';
    this.hideTimer = window.setTimeout(() => {
      this.toast.style.opacity = '0';
      this.toast.style.transform = 'translate(-50%,-8px)';
    }, 4300);
  }

  private load(): void {
    try {
      const raw = localStorage.getItem('open-all-night-achievements');
      if (!raw) return;
      const values = JSON.parse(raw) as unknown;
      if (Array.isArray(values)) for (const value of values) if (typeof value === 'string') this.unlocked.add(value);
    } catch {
      localStorage.removeItem('open-all-night-achievements');
    }
  }

  private save(): void {
    localStorage.setItem('open-all-night-achievements', JSON.stringify([...this.unlocked]));
  }
}
