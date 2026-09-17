import type { GameState } from './gameState';
import type { GameSession } from './gameSession';
import type { GameUI } from './ui';
import type { AnomalyRuntime } from './anomalyRuntime';
import { ANOMALY_BY_ID } from './anomalyCatalog';
import { NIGHT_TIMELINES, type NightBeat } from './nightTimelineCatalog';

/**
 * Data-driven campaign scaffold for Nights 2-5. It owns timeline sequencing now; authored systems
 * can progressively register anomaly handlers and task interactables without rewriting the night flow.
 */
export class FrameworkNightDirector {
  private readonly timeline: NightBeat[];
  private readonly fired = new Set<string>();

  constructor(
    private readonly session: GameSession,
    private readonly state: GameState,
    private readonly ui: GameUI,
    private readonly anomalies: AnomalyRuntime
  ) {
    this.timeline = NIGHT_TIMELINES[session.config.night] ?? [];
    for (const beat of this.timeline) if (state.isComplete(`framework-beat:${beat.id}`)) this.fired.add(beat.id);
  }

  update(): void {
    if (this.session.isEndless() || this.session.config.night === 1) return;
    const minute = this.state.getGameMinutes();
    for (const beat of this.timeline) {
      if (minute < beat.minute || this.fired.has(beat.id)) continue;
      this.fire(beat);
    }
  }

  private fire(beat: NightBeat): void {
    this.fired.add(beat.id);
    this.state.complete(`framework-beat:${beat.id}`);
    switch (beat.kind) {
      case 'task':
      case 'lore':
        this.state.addTask(beat.id, beat.text);
        this.ui.showMessage(beat.text, 3200);
        break;
      case 'anomaly': {
        const def = ANOMALY_BY_ID.get(beat.id);
        if (def) void this.anomalies.trigger(def);
        else this.ui.showMessage(beat.text, 3200);
        break;
      }
      case 'finale':
        this.ui.flashWarning(beat.text, 2200);
        break;
      default:
        this.ui.showMessage(beat.text, 3200);
        break;
    }
  }
}
