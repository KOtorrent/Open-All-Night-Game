import type { GameState } from './gameState';

interface SaleFeedback {
  id: string;
  title: string;
  lines: string[];
  total: string;
  payment: string;
  change: string;
}

/**
 * Gives checkout interactions a brief POS-style visual response instead of leaving successful
 * sales as text-only messages. It intentionally reads completion flags rather than owning register
 * logic, so every customer system remains independent and the overlay cannot double-charge anyone.
 */
export class TransactionFeedbackSystem {
  private readonly state: GameState;
  private readonly panel: HTMLDivElement;
  private readonly shown = new Set<string>();
  private hideTimer?: number;

  private readonly sales: SaleFeedback[] = [
    {
      id: 'first-sale',
      title: 'SALE COMPLETE',
      lines: ['BOTTLED DRINK       $2.49', 'CANDY BAR           $3.98'],
      total: '$6.47',
      payment: '$10.00 CASH',
      change: '$3.53'
    },
    {
      id: 'jenna-sale',
      title: 'SALE COMPLETE',
      lines: ['MILK                $3.89', 'ASPIRIN             $3.19', 'CRACKERS            $2.33'],
      total: '$9.41',
      payment: '$20.00 CASH',
      change: '$10.59'
    },
    {
      id: 'late-sale',
      title: 'SALE COMPLETE',
      lines: ['BOTTLED WATER       $2.09', 'CHIPS               $3.04', 'LOTTERY             $2.99'],
      total: '$8.12',
      payment: '$10.00 CASH',
      change: '$1.88'
    },
    {
      id: 'dale-sale',
      title: 'SALE COMPLETE',
      lines: ['BEEF JERKY          $3.69', 'ROOT BEER           $2.15'],
      total: '$5.84',
      payment: '$5.84 CASH',
      change: '$0.00'
    },
    {
      id: 'marcus-sale',
      title: 'SALE COMPLETE',
      lines: ['LARGE COFFEE        $2.29', 'CHIPS               $2.99', 'GUM                 $1.98'],
      total: '$7.26',
      payment: '$10.00 CASH',
      change: '$2.74'
    }
  ];

  constructor(state: GameState) {
    this.state = state;
    this.panel = document.createElement('div');
    this.panel.style.cssText = [
      'position:fixed', 'right:22px', 'bottom:24px', 'width:280px', 'padding:13px 15px',
      'background:rgba(5,12,10,.94)', 'border:1px solid rgba(117,192,139,.42)',
      'box-shadow:0 8px 30px rgba(0,0,0,.55),inset 0 0 22px rgba(42,130,75,.06)',
      'color:#cde8ce', 'font:12px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace',
      'letter-spacing:.35px', 'z-index:25', 'opacity:0', 'transform:translateY(8px)',
      'transition:opacity .16s ease,transform .16s ease', 'pointer-events:none'
    ].join(';');
    document.body.appendChild(this.panel);
  }

  update(): void {
    for (const sale of this.sales) {
      if (!this.state.isComplete(sale.id) || this.shown.has(sale.id)) continue;
      this.shown.add(sale.id);
      this.show(sale);
      break;
    }
  }

  private show(sale: SaleFeedback): void {
    if (this.hideTimer !== undefined) window.clearTimeout(this.hideTimer);
    this.panel.innerHTML = `
      <div style="color:#87d99c;font-weight:700;letter-spacing:1.4px;margin-bottom:8px">${sale.title}</div>
      <div style="white-space:pre;color:#b9cbbb">${sale.lines.join('<br>')}</div>
      <div style="height:1px;background:rgba(135,217,156,.24);margin:9px 0"></div>
      <div style="display:grid;grid-template-columns:1fr auto;gap:3px 12px">
        <span>TOTAL</span><strong>${sale.total}</strong>
        <span>TENDER</span><span>${sale.payment}</span>
        <span style="color:#87d99c">CHANGE</span><strong style="color:#87d99c">${sale.change}</strong>
      </div>
    `;
    this.panel.style.opacity = '1';
    this.panel.style.transform = 'translateY(0)';
    this.hideTimer = window.setTimeout(() => {
      this.panel.style.opacity = '0';
      this.panel.style.transform = 'translateY(8px)';
    }, 3300);
  }
}
