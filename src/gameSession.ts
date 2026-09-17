import { NIGHTS, type GameMode, type NightId, type NightDefinition } from './campaignDefinition';
import { ANOMALIES, type AnomalyDefinition } from './anomalyCatalog';
import { ProgressionStore } from './progressionStore';

export interface SessionConfig {
  mode: GameMode;
  night: NightId;
  seed: number;
}

export class GameSession {
  readonly progression = new ProgressionStore();
  readonly config: SessionConfig;
  readonly night: NightDefinition;
  private endlessPool: AnomalyDefinition[] = [];
  private endlessElapsed = 0;
  private endlessAnomalies = 0;
  private nextEndlessAt = 45;
  private rngState: number;

  constructor() {
    this.config = this.resolveConfig();
    this.night = NIGHTS[this.config.night];
    this.rngState = this.config.seed || 1;
    this.endlessPool = ANOMALIES.filter((x) => x.category !== 'finale' && x.endlessWeight > 0);
  }

  isCampaignNight(night: NightId): boolean {
    return this.config.mode !== 'endless' && this.config.night === night;
  }

  isEndless(): boolean {
    return this.config.mode === 'endless';
  }

  updateEndless(dt: number): AnomalyDefinition | null {
    if (!this.isEndless()) return null;
    this.endlessElapsed += dt;
    this.progression.recordEndless(this.endlessElapsed, this.endlessAnomalies);
    if (this.endlessElapsed < this.nextEndlessAt) return null;
    const chosen = this.pickWeighted(this.endlessPool);
    this.endlessAnomalies++;
    const intensity = Math.min(1, this.endlessElapsed / 3600);
    const gap = 50 - intensity * 25 + this.random() * 22;
    this.nextEndlessAt = this.endlessElapsed + Math.max(18, gap);
    return chosen;
  }

  getEndlessStats(): { seconds: number; anomalies: number } {
    return { seconds: this.endlessElapsed, anomalies: this.endlessAnomalies };
  }

  private resolveConfig(): SessionConfig {
    const params = new URLSearchParams(window.location.search);
    const requestedMode = params.get('mode');
    const mode: GameMode = requestedMode === 'endless' || requestedMode === 'chapter' ? requestedMode : 'campaign';
    const rawNight = Number(params.get('night') ?? 1);
    let night = Math.min(5, Math.max(1, Number.isFinite(rawNight) ? Math.floor(rawNight) : 1)) as NightId;
    if (mode === 'campaign' && !this.progression.isNightUnlocked(night)) night = this.progression.snapshot().unlockedNight;
    const seedParam = Number(params.get('seed'));
    const seed = Number.isFinite(seedParam) && seedParam !== 0 ? Math.floor(seedParam) : (Date.now() & 0x7fffffff);
    return { mode, night, seed };
  }

  private pickWeighted(pool: AnomalyDefinition[]): AnomalyDefinition {
    const total = pool.reduce((sum, x) => sum + x.endlessWeight, 0);
    let cursor = this.random() * total;
    for (const item of pool) {
      cursor -= item.endlessWeight;
      if (cursor <= 0) return item;
    }
    return pool[pool.length - 1];
  }

  private random(): number {
    let x = this.rngState |= 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.rngState = x | 0;
    return ((x >>> 0) % 1000000) / 1000000;
  }
}
