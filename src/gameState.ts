import type { GameUI } from './ui';

interface SaveData {
  gameMinutes: number;
  completed: string[];
  dynamicTasks: Array<{ id: string; text: string }>;
}

export class GameState {
  private readonly ui: GameUI;
  private gameMinutes = 22 * 60 + 55;
  private completed = new Set<string>();
  private dynamicTasks: Array<{ id: string; text: string }> = [];
  private autosaveTimer = 0;
  private readonly baseTasks = [
    { id: 'clock-in', text: 'Clock in at the register' },
    { id: 'coffee', text: 'Start a fresh pot of coffee' },
    { id: 'notebook', text: 'Read the night clerk notebook' }
  ];

  constructor(ui: GameUI) {
    this.ui = ui;
    this.load();
    this.refreshUI();
  }

  update(dt: number): void {
    // Canon pacing: 1 in-game hour = 4 real minutes, therefore 1 game minute = 4 real seconds.
    this.gameMinutes += dt / 4;
    if (this.gameMinutes >= 30 * 60) this.gameMinutes = 30 * 60;
    this.autosaveTimer += dt;
    if (this.autosaveTimer >= 10) {
      this.autosaveTimer = 0;
      this.save();
    }
    this.ui.setClock(this.formatClock(this.gameMinutes));
  }

  getGameMinutes(): number {
    return this.gameMinutes;
  }

  /** Developer/playtest helper. Only surfaced by the UI when ?dev=1 is present. */
  advanceMinutes(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) return;
    this.gameMinutes = Math.min(30 * 60, this.gameMinutes + amount);
    this.save();
    this.refreshUI();
  }

  complete(id: string): boolean {
    if (this.completed.has(id)) return false;
    this.completed.add(id);
    this.save();
    this.refreshUI();
    return true;
  }

  isComplete(id: string): boolean {
    return this.completed.has(id);
  }

  addTask(id: string, text: string): void {
    if (this.baseTasks.some((task) => task.id === id) || this.dynamicTasks.some((task) => task.id === id)) {
      this.refreshUI();
      return;
    }
    this.dynamicTasks.push({ id, text });
    this.save();
    this.refreshUI();
  }

  resetSave(): void {
    this.gameMinutes = 22 * 60 + 55;
    this.completed.clear();
    this.dynamicTasks = [];
    localStorage.removeItem('open-all-night-poc-save');
    this.refreshUI();
  }

  private refreshUI(): void {
    const tasks = [...this.baseTasks, ...this.dynamicTasks];
    this.ui.setTasks(tasks.map((task) => ({ text: task.text, done: this.completed.has(task.id) })));
    this.ui.setClock(this.formatClock(this.gameMinutes));
  }

  private formatClock(minutes: number): string {
    const whole = Math.floor(minutes);
    const hour24 = whole / 60 | 0;
    const minute = whole % 60;
    const normalized = hour24 % 24;
    const suffix = normalized >= 12 ? 'PM' : 'AM';
    const hour12 = normalized % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${suffix}`;
  }

  private save(): void {
    const data: SaveData = {
      gameMinutes: this.gameMinutes,
      completed: [...this.completed],
      dynamicTasks: this.dynamicTasks
    };
    localStorage.setItem('open-all-night-poc-save', JSON.stringify(data));
  }

  private load(): void {
    try {
      const raw = localStorage.getItem('open-all-night-poc-save');
      if (!raw) return;
      const data = JSON.parse(raw) as Partial<SaveData>;
      if (typeof data.gameMinutes === 'number') this.gameMinutes = data.gameMinutes;
      if (Array.isArray(data.completed)) this.completed = new Set(data.completed);
      if (Array.isArray(data.dynamicTasks)) {
        this.dynamicTasks = data.dynamicTasks.filter((task): task is { id: string; text: string } =>
          typeof task?.id === 'string' && typeof task?.text === 'string'
        );
      }
    } catch {
      localStorage.removeItem('open-all-night-poc-save');
    }
  }
}
