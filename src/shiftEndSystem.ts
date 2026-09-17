import * as pc from 'playcanvas';
import type { BuiltWorld, Interactable } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';
import type { ProgressionStore } from './progressionStore';

function mat(color: pc.Color, gloss = 0.2, emissive?: pc.Color): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.gloss = gloss;
  if (emissive) { m.emissive = emissive; m.emissiveIntensity = 1; }
  m.update();
  return m;
}

export class ShiftEndSystem {
  private prompted = false;
  private summaryShown = false;
  private progressionRecorded = false;
  private interactable: Interactable;
  private statusLight: pc.Entity;

  constructor(
    private readonly app: pc.Application,
    private readonly world: BuiltWorld,
    private readonly state: GameState,
    private readonly ui: GameUI,
    private readonly progression?: ProgressionStore
  ) {
    const shell = mat(new pc.Color(0.055, 0.06, 0.058), 0.28);
    const face = mat(new pc.Color(0.12, 0.13, 0.12), 0.30);
    const dark = mat(new pc.Color(0.05, 0.015, 0.01), 0.24, new pc.Color(0.03, 0.005, 0.002));
    const body = new pc.Entity('TimeClockBody');
    body.addComponent('render', { type: 'box' }); body.setPosition(-8.35, 1.55, 7.58); body.setLocalScale(0.58, 0.72, 0.16);
    if (body.render) body.render.material = shell; app.root.addChild(body);
    const panel = new pc.Entity('TimeClockFace');
    panel.addComponent('render', { type: 'box' }); panel.setPosition(-8.35, 1.58, 7.49); panel.setLocalScale(0.42, 0.42, 0.025);
    if (panel.render) panel.render.material = face; app.root.addChild(panel);
    this.statusLight = new pc.Entity('TimeClockStatus');
    this.statusLight.addComponent('render', { type: 'box' }); this.statusLight.setPosition(-8.35, 1.79, 7.47); this.statusLight.setLocalScale(0.18, 0.055, 0.02);
    if (this.statusLight.render) this.statusLight.render.material = dark; app.root.addChild(this.statusLight);
    this.interactable = { id: 'shift-time-clock', label: 'check time clock', position: new pc.Vec3(-8.35, 1.58, 7.46), radius: 2.2, aimRadius: 0.40, onInteract: () => this.clockOut() };
    world.interactables.push(this.interactable);
  }

  update(): void {
    const minute = this.state.getGameMinutes();
    if (!this.prompted && minute >= 29 * 60 + 55 && !this.state.isComplete('night1-clock-out')) {
      this.prompted = true;
      this.state.addTask('night1-clock-out', 'Clock out when the shift reaches 6:00 AM');
      this.interactable.label = 'check time clock';
      this.setStatus(true);
      this.ui.showMessage('5:55 AM. Five minutes. Almost done.', 3200);
    }
  }

  private clockOut(): string {
    const minute = this.state.getGameMinutes();
    if (minute < 30 * 60) {
      const remaining = Math.max(1, Math.ceil(30 * 60 - minute));
      return `${remaining} minute${remaining === 1 ? '' : 's'} left on the shift.`;
    }
    if (this.state.isComplete('night1-clock-out')) {
      if (!this.summaryShown) this.showSummary();
      return '6:00 AM. You are already clocked out.';
    }
    this.state.complete('night1-clock-out');
    this.state.complete('night1-complete');
    this.recordProgression();
    this.interactable.label = 'review shift';
    this.setStatus(false);
    this.ui.flashWarning('SHIFT COMPLETE', 2200);
    this.ui.showMessage('6:00 AM. The fluorescent hum suddenly feels ordinary again. Night 1 complete.', 5200);
    window.setTimeout(() => this.showSummary(), 2400);
    return 'You punch out. 6:00 AM.';
  }

  private recordProgression(): void {
    if (!this.progression || this.progressionRecorded) return;
    this.progressionRecorded = true;
    const completed = new Set(this.state.getCompletedIds());
    const ruleBreakIds = ['freezer-rule-broken','silent-rule-broken','restroom-rule-broken'];
    const ruleBreaks = ruleBreakIds.filter((id) => completed.has(id)).length;
    if (ruleBreaks > 0) this.progression.recordRuleBreak(1);
    const choreIds = ['restock-aisle-1','clean-spill','take-trash','delivery-manifest','delivery-stocked','cooler-temp-log','lottery-count','closing-faceup','closing-counter','closing-coffee'];
    const anomalies = ['freezer-flicker-survived','silent-customer-survived','restroom-knock-survived','cctv-figure-seen','pump7-seen','read-impossible-receipt'].filter((id) => completed.has(id));
    this.progression.completeNight(1, {
      mode: 'campaign',
      night: 1,
      ruleBreaks,
      choresCompleted: choreIds.filter((id) => completed.has(id)).length,
      anomaliesSeen: anomalies
    });
  }

  private showSummary(): void {
    if (this.summaryShown) return;
    this.summaryShown = true;
    const completed = new Set(this.state.getCompletedIds());
    const ruleBroken = completed.has('freezer-rule-broken') || completed.has('silent-rule-broken') || completed.has('restroom-rule-broken');
    const survivedRules = [completed.has('freezer-flicker-survived'),completed.has('silent-customer-survived'),completed.has('restroom-knock-survived')].filter(Boolean).length;
    const jobs = ['first-sale','jenna-sale','restock-aisle-1','clean-spill','take-trash','authorize-pump-5','delivery-manifest','delivery-stocked','late-sale','dale-sale','cooler-temp-log','marcus-sale','lottery-count','closing-faceup','closing-counter','closing-coffee'];
    const jobsDone = jobs.filter((id) => completed.has(id)).length;
    const customers = ['first-sale','jenna-sale','late-sale','dale-sale','marcus-sale'];
    const customersServed = customers.filter((id) => completed.has(id)).length;
    const loreRead = ['lore-roster','lore-incident-log','lore-terminal'].filter((id) => completed.has(id)).length;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:40;display:grid;place-items:center;background:rgba(0,0,0,.84);color:#e7e2cb;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;pointer-events:auto';
    overlay.innerHTML = `<div style="width:min(600px,90vw);border:1px solid rgba(230,220,170,.28);background:#090b0b;padding:30px 34px;box-shadow:0 20px 80px #000"><div style="font-size:12px;letter-spacing:3px;color:#b7ad76">OPEN ALL NIGHT</div><div style="font-size:28px;margin-top:9px;letter-spacing:2px">NIGHT 1 — FIRST SHIFT</div><div style="font-size:13px;margin-top:6px;color:#9a9a8e">10:55 PM — 6:00 AM</div><div style="margin-top:26px;line-height:1.9;font-size:14px"><div>Rules survived: <b>${survivedRules}/3</b></div><div>Rule status: <b>${ruleBroken ? 'YOU BROKE A RULE' : 'NO KNOWN RULES BROKEN'}</b></div><div>Customers served: <b>${customersServed}/5</b></div><div>Assigned work completed: <b>${jobsDone}/${jobs.length}</b></div><div>Office records read: <b>${loreRead}/3</b></div><div>CAM 4: <b>${completed.has('cctv-figure-seen') ? 'something was there' : 'nothing noted'}</b></div><div>Dale: <b>${completed.has('dale-was-fine') ? 'was completely fine' : 'still suspicious, probably'}</b></div><div>Counter phone: <b>${completed.has('answered-store-phone') ? 'answered' : 'unanswered'}</b></div><div>Rear door: <b>${completed.has('checked-rear-rattle') ? 'checked after the rattle' : 'left alone'}</b></div><div>6:01 receipt: <b>${completed.has('read-impossible-receipt') ? 'read' : 'left on the printer'}</b></div></div><div style="margin-top:24px;color:#c5bea0;font-size:13px">Night 2 is now available through Chapter Select.</div><button id="night1-summary-close" style="margin-top:26px;padding:9px 13px;background:#171a18;color:#e6dfbd;border:1px solid #595541;font:12px inherit;cursor:pointer">RETURN TO STORE</button></div>`;
    document.body.appendChild(overlay);
    overlay.querySelector<HTMLButtonElement>('#night1-summary-close')?.addEventListener('click', () => overlay.remove());
  }

  private setStatus(active: boolean): void {
    if (!this.statusLight.render) return;
    this.statusLight.render.material = active ? mat(new pc.Color(0.48,0.30,0.025),0.25,new pc.Color(0.24,0.11,0.005)) : mat(new pc.Color(0.035,0.08,0.035),0.28,new pc.Color(0.008,0.025,0.008));
  }
}
