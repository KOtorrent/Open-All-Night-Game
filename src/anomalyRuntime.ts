import type { AnomalyDefinition } from './anomalyCatalog';
import type { GameUI } from './ui';
import type { GameSession } from './gameSession';

export type AnomalyHandler = (definition: AnomalyDefinition) => void | Promise<void>;

export class AnomalyRuntime {
  private readonly handlers = new Map<string, AnomalyHandler>();
  private readonly fallbackSeen = new Set<string>();

  constructor(private readonly session: GameSession, private readonly ui: GameUI) {}

  register(id: string, handler: AnomalyHandler): void {
    this.handlers.set(id, handler);
  }

  async trigger(definition: AnomalyDefinition): Promise<boolean> {
    this.session.progression.recordAnomaly(definition.id, definition.tier === 'mythic');
    const handler = this.handlers.get(definition.id);
    if (handler) {
      await handler(definition);
      return true;
    }

    // Framework fallback: future anomaly IDs are safe to schedule before their authored behavior is
    // implemented. Dev builds announce the missing implementation instead of silently failing.
    if (new URLSearchParams(window.location.search).get('dev') === '1' && !this.fallbackSeen.has(definition.id)) {
      this.fallbackSeen.add(definition.id);
      this.ui.showMessage(`[FRAMEWORK] ${definition.title} is scheduled but has no runtime handler yet.`, 3500);
    }
    return false;
  }
}
