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
  private readonly endlessLastSeen = new Map<string, number>();
  private endlessLastId = '';

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
    const eligible = this.endlessPool.filter((item) => {
      if (item.id === this.endlessLastId) return false;
      const last = this.endlessLastSeen.get(item.id);
      if (last === undefined) return true;
      const cooldownSeconds = Math.min(240, Math.max(35, item.cooldownMinutes * 2));
      return this.endlessElapsed - last >= cooldownSeconds;
    });
    const chosen = this.pickWeighted(eligible.length ? eligible : this.endlessPool);
    this.endlessLastId = chosen.id;
    this.endlessLastSeen.set(chosen.id, this.endlessElapsed);
    this.endlessAnomalies++;
    const tier = this.getEndlessTier();
    const intensity = Math.min(1, this.endlessElapsed / 3600);
    const tierPressure = (tier - 1) * 3.5;
    const gap = 50 - intensity * 25 - tierPressure + this.random() * 22;
    this.nextEndlessAt = this.endlessElapsed + Math.max(12, gap);
    return chosen;
  }

  getEndlessStats(): { seconds: number; anomalies: number; tier: number; score: number } {
    const tier = this.getEndlessTier();
    const score = Math.floor(this.endlessElapsed * 3 + this.endlessAnomalies * 150 + tier * 500);
    return { seconds: this.endlessElapsed, anomalies: this.endlessAnomalies, tier, score };
  }

  getEndlessTier(): number {
    if (this.endlessElapsed >= 3600 || this.endlessAnomalies >= 45) return 5;
    if (this.endlessElapsed >= 2400 || this.endlessAnomalies >= 30) return 4;
    if (this.endlessElapsed >= 1500 || this.endlessAnomalies >= 20) return 3;
    if (this.endlessElapsed >= 600 || this.endlessAnomalies >= 10) return 2;
    return 1;
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
