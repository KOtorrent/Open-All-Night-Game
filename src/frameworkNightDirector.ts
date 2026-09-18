import type { GameState } from './gameState';
import type { GameSession } from './gameSession';
import type { GameUI } from './ui';
import type { AnomalyRuntime } from './anomalyRuntime';
import { ANOMALY_BY_ID } from './anomalyCatalog';
import { NIGHT_TIMELINES, type NightBeat } from './nightTimelineCatalog';

// Every night's own timeline places its "five minutes left" finale beat at 29:55 (Night 5 also
// spawns Larry at 29:40). The mythic window closes well clear of all of that, and opens after each
// night's earliest scripted beats so it never fires before the shift has properly started.
const MYTHIC_WINDOW_START = 23 * 60 + 40;
const MYTHIC_WINDOW_END = 28 * 60 + 30;
const MYTHIC_CHANCE = 0.25;

function seededFraction(seed: number, salt: number): number {
  let x = (seed ^ salt) | 0;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  return ((x >>> 0) % 1000000) / 1000000;
}

/**
 * Data-driven campaign scaffold for Nights 2-5. It owns timeline sequencing now; authored systems
 * can progressively register anomaly handlers and task interactables without rewriting the night flow.
 *
 * It also wires up campaignDefinition.ts's per-night `mythicIds`, which previously had no consumer
 * anywhere: nothing ever scheduled a campaign mythic, so 'larry-parking-lot' (excluded from Endless
 * because it's category 'finale') was unreachable through any path, permanently blocking ALL_MYTHICS
 * and ALL_ACHIEVEMENTS. At most one mythic is planned per run, deterministically from the session
 * seed (so a given seed always behaves the same way and this stays testable via dev time-skips
 * rather than depending on this environment's real frame rate), landing once inside the safe window
 * above. It fires through the existing AnomalyRuntime so progression recording (recordAnomaly with
 * mythic=true) stays centralized exactly like every other anomaly.
 */
export class FrameworkNightDirector {
  private readonly timeline: NightBeat[];
  private readonly fired = new Set<string>();
  private readonly mythicPlan?: { minute: number; id: string };
  private mythicFired: boolean;

  constructor(
    private readonly session: GameSession,
    private readonly state: GameState,
    private readonly ui: GameUI,
    private readonly anomalies: AnomalyRuntime
  ) {
    this.timeline = NIGHT_TIMELINES[session.config.night] ?? [];
    for (const beat of this.timeline) if (state.isComplete(`framework-beat:${beat.id}`)) this.fired.add(beat.id);
    this.mythicFired = state.isComplete('campaign-mythic-fired');
    this.mythicPlan = this.planMythic();
  }

  update(): void {
    if (this.session.isEndless() || this.session.config.night === 1) return;
    const minute = this.state.getGameMinutes();
    for (const beat of this.timeline) {
      if (minute < beat.minute || this.fired.has(beat.id)) continue;
      this.fire(beat);
    }
    this.updateMythic(minute);
  }

  private planMythic(): { minute: number; id: string } | undefined {
    const pool = this.session.night.mythicIds;
    if (!pool.length) return undefined;

    const params = new URLSearchParams(window.location.search);
    if (params.get('dev') === '1') {
      const forced = params.get('forceMythic');
      if (forced) {
        const id = pool.includes(forced) ? forced : pool[0];
        return { minute: MYTHIC_WINDOW_START, id };
      }
    }

    const seed = this.session.config.seed;
    const night = this.session.config.night;
    const chanceRoll = seededFraction(seed, night * 97 + 1);
    if (chanceRoll >= MYTHIC_CHANCE) return undefined;

    const pickRoll = seededFraction(seed, night * 97 + 2);
    const id = pool[Math.floor(pickRoll * pool.length) % pool.length];
    const minuteRoll = seededFraction(seed, night * 97 + 3);
    const minute = MYTHIC_WINDOW_START + Math.floor(minuteRoll * (MYTHIC_WINDOW_END - MYTHIC_WINDOW_START));
    return { minute, id };
  }

  private updateMythic(minute: number): void {
    if (this.mythicFired || !this.mythicPlan || minute < this.mythicPlan.minute) return;
    this.mythicFired = true;
    this.state.complete('campaign-mythic-fired');
    const def = ANOMALY_BY_ID.get(this.mythicPlan.id);
    if (def) void this.anomalies.trigger(def);
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
