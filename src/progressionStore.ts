import type { GameMode, NightId } from './campaignDefinition';

export interface RunSummary {
  mode: GameMode;
  night: NightId;
  completedAt: number;
  ruleBreaks: number;
  choresCompleted: number;
  anomaliesSeen: string[];
  endingId?: string;
}

export interface ProgressionData {
  unlockedNight: NightId;
  completedNights: NightId[];
  endingsSeen: string[];
  anomaliesSeen: string[];
  mythicsSeen: string[];
  unlockedAchievements: string[];
  campaignRuleBreaks: Record<string, number>;
  bestEndlessSeconds: number;
  bestEndlessAnomalies: number;
  totalCustomersServed: number;
  totalChoresCompleted: number;
  runs: RunSummary[];
}

const STORAGE_KEY = 'open-all-night-progression-v1';
const DEFAULT_DATA: ProgressionData = {
  unlockedNight: 1,
  completedNights: [],
  endingsSeen: [],
  anomaliesSeen: [],
  mythicsSeen: [],
  unlockedAchievements: [],
  campaignRuleBreaks: {},
  bestEndlessSeconds: 0,
  bestEndlessAnomalies: 0,
  totalCustomersServed: 0,
  totalChoresCompleted: 0,
  runs: []
};

export class ProgressionStore {
  private data: ProgressionData;

  constructor() {
    this.data = this.load();
  }

  snapshot(): ProgressionData {
    return JSON.parse(JSON.stringify(this.data)) as ProgressionData;
  }

  isNightUnlocked(night: NightId): boolean {
    return night <= this.data.unlockedNight;
  }

  completeNight(night: NightId, summary: Omit<RunSummary, 'completedAt'>): void {
    if (!this.data.completedNights.includes(night)) this.data.completedNights.push(night);
    if (night < 5) this.data.unlockedNight = Math.max(this.data.unlockedNight, (night + 1) as NightId) as NightId;
    this.data.runs.unshift({ ...summary, night, completedAt: Date.now() });
    this.data.runs = this.data.runs.slice(0, 30);
    this.save();
  }

  recordEnding(id: string): void {
    if (!this.data.endingsSeen.includes(id)) this.data.endingsSeen.push(id);
    this.save();
  }

  recordAnomaly(id: string, mythic = false): void {
    if (!this.data.anomaliesSeen.includes(id)) this.data.anomaliesSeen.push(id);
    if (mythic && !this.data.mythicsSeen.includes(id)) this.data.mythicsSeen.push(id);
    this.save();
  }

  recordRuleBreak(night: NightId): void {
    const key = String(night);
    this.data.campaignRuleBreaks[key] = (this.data.campaignRuleBreaks[key] ?? 0) + 1;
    this.save();
  }

  addCustomerServed(count = 1): void {
    this.data.totalCustomersServed += count;
    this.save();
  }

  addChoreCompleted(count = 1): void {
    this.data.totalChoresCompleted += count;
    this.save();
  }

  recordEndless(seconds: number, anomalies: number): void {
    this.data.bestEndlessSeconds = Math.max(this.data.bestEndlessSeconds, seconds);
    this.data.bestEndlessAnomalies = Math.max(this.data.bestEndlessAnomalies, anomalies);
    this.save();
  }

  unlockAchievement(id: string): boolean {
    if (this.data.unlockedAchievements.includes(id)) return false;
    this.data.unlockedAchievements.push(id);
    this.save();
    return true;
  }

  reset(): void {
    this.data = JSON.parse(JSON.stringify(DEFAULT_DATA)) as ProgressionData;
    localStorage.removeItem(STORAGE_KEY);
  }

  private load(): ProgressionData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_DATA)) as ProgressionData;
      const parsed = JSON.parse(raw) as Partial<ProgressionData>;
      return {
        ...JSON.parse(JSON.stringify(DEFAULT_DATA)) as ProgressionData,
        ...parsed,
        unlockedNight: Math.min(5, Math.max(1, Number(parsed.unlockedNight ?? 1))) as NightId,
        completedNights: Array.isArray(parsed.completedNights) ? parsed.completedNights.filter((x): x is NightId => [1,2,3,4,5].includes(x as number)) : [],
        endingsSeen: Array.isArray(parsed.endingsSeen) ? parsed.endingsSeen.filter((x): x is string => typeof x === 'string') : [],
        anomaliesSeen: Array.isArray(parsed.anomaliesSeen) ? parsed.anomaliesSeen.filter((x): x is string => typeof x === 'string') : [],
        mythicsSeen: Array.isArray(parsed.mythicsSeen) ? parsed.mythicsSeen.filter((x): x is string => typeof x === 'string') : [],
        unlockedAchievements: Array.isArray(parsed.unlockedAchievements) ? parsed.unlockedAchievements.filter((x): x is string => typeof x === 'string') : [],
        campaignRuleBreaks: parsed.campaignRuleBreaks && typeof parsed.campaignRuleBreaks === 'object' ? parsed.campaignRuleBreaks : {},
        runs: Array.isArray(parsed.runs) ? parsed.runs.slice(0, 30) as RunSummary[] : []
      };
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return JSON.parse(JSON.stringify(DEFAULT_DATA)) as ProgressionData;
    }
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }
}
