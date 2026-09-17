import * as pc from 'playcanvas';
import type { BuiltWorld, Interactable } from './gameTypes';
import type { GameState } from './gameState';
import type { GameSession } from './gameSession';
import type { GameUI } from './ui';
import { ENDINGS } from './campaignDefinition';

export class CampaignCompletionSystem {
  private prompted = false;
  private completed = false;
  private endingOverlay?: HTMLDivElement;
  private readonly clock: Interactable;

  constructor(
    private readonly world: BuiltWorld,
    private readonly state: GameState,
    private readonly session: GameSession,
    private readonly ui: GameUI
  ) {
    this.clock = {
      id: 'framework-shift-clock',
      label: 'check time clock',
      position: new pc.Vec3(-8.35, 1.58, 7.46),
      radius: 2.2,
      aimRadius: 0.42,
      onInteract: () => this.interact()
    };
    if (session.config.night !== 1 && !session.isEndless()) world.interactables.push(this.clock);
  }

  update(): void {
    if (this.session.isEndless() || this.session.config.night === 1 || this.completed) return;
    const minute = this.state.getGameMinutes();
    if (!this.prompted && minute >= this.session.night.endMinutes - 5) {
      this.prompted = true;
      this.state.addTask(`night${this.session.config.night}-clock-out`, this.session.config.night === 5 ? 'Stay on shift until morning arrives' : 'Clock out at 6:00 AM');
      this.ui.showMessage(this.session.config.night === 5 ? '5:55 AM. The clock is not behaving normally.' : '5:55 AM. Five minutes left.', 3500);
    }
    if (this.session.config.night === 5 && minute >= this.session.night.endMinutes && !this.endingOverlay) this.showEndingChoice();
  }

  private interact(): string {
    const night = this.session.config.night;
    if (this.state.getGameMinutes() < this.session.night.endMinutes) {
      const remaining = Math.max(1, Math.ceil(this.session.night.endMinutes - this.state.getGameMinutes()));
      return `${remaining} minute${remaining === 1 ? '' : 's'} left on the shift.`;
    }
    if (night === 5) {
      this.showEndingChoice();
      return 'The punch clock reads 5:60.';
    }
    if (!this.completed) this.finishNight();
    return `Night ${night} complete.`;
  }

  private finishNight(endingId?: string): void {
    if (this.completed) return;
    this.completed = true;
    const night = this.session.config.night;
    this.state.complete(`night${night}-complete`);
    const completedIds = this.state.getCompletedIds();
    const ruleBreaks = completedIds.filter((id) => id.includes('rule-broken')).length;
    const choreCount = completedIds.filter((id) => id.startsWith(`n${night}-`) && !id.includes('start')).length;
    this.session.progression.completeNight(night, {
      mode: this.session.config.mode,
      night,
      ruleBreaks,
      choresCompleted: choreCount,
      anomaliesSeen: this.session.progression.snapshot().anomaliesSeen,
      endingId
    });
    if (endingId) this.session.progression.recordEnding(endingId);
    this.ui.flashWarning(night === 5 ? 'SHIFT CHANGE' : 'SHIFT COMPLETE', 2400);
    this.ui.showMessage(night === 5 ? 'The night finally decides what morning means.' : `Night ${night} complete. Night ${Math.min(5, night + 1)} unlocked.`, 5200);
  }

  private showEndingChoice(): void {
    if (this.endingOverlay || this.completed) return;
    const allowHidden = this.state.isComplete('ending-break-available') || new URLSearchParams(window.location.search).get('dev') === '1';
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:70;display:grid;place-items:center;background:rgba(0,0,0,.90);color:#e7e0b6;font-family:ui-monospace,SFMono-Regular,Consolas,monospace';
    overlay.innerHTML = `<div style="width:min(620px,90vw);padding:32px;background:#080a09;border:1px solid #6a6240"><div style="font-size:12px;letter-spacing:3px;color:#b7a85f">5:60 AM</div><div style="font-size:27px;margin:8px 0 6px">SHIFT CHANGE</div><div style="color:#aaa389;margin-bottom:22px">Morning isn’t coming until somebody takes the shift.</div><button data-ending="${ENDINGS.clockOut.id}" style="${this.buttonCss()}">CLOCK OUT</button><button data-ending="${ENDINGS.stay.id}" style="${this.buttonCss()}">OPEN ALL NIGHT</button>${allowHidden ? `<button data-ending="${ENDINGS.breakRules.id}" style="${this.buttonCss()};border-color:#6e3131;color:#d9a5a0">BREAK THE RULES</button>` : ''}</div>`;
    document.body.appendChild(overlay);
    overlay.querySelectorAll<HTMLButtonElement>('[data-ending]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.ending;
        if (!id) return;
        overlay.remove();
        this.endingOverlay = undefined;
        this.finishNight(id);
      });
    });
    this.endingOverlay = overlay;
  }

  private buttonCss(): string {
    return 'display:block;width:100%;margin:8px 0;padding:12px;background:#141814;color:#ede4b4;border:1px solid #6f6740;font:12px ui-monospace,SFMono-Regular,Consolas,monospace;cursor:pointer';
  }
}
