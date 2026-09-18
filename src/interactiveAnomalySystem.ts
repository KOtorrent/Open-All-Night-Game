import * as pc from 'playcanvas';
import type { BuiltWorld, Interactable } from './gameTypes';
import type { GameSession } from './gameSession';
import type { GameState } from './gameState';
import type { GameUI } from './ui';
import type { AnomalyRuntime } from './anomalyRuntime';
import type { AnomalyDefinition } from './anomalyCatalog';

interface Challenge {
  id: string;
  label: string;
  text: string;
  safeText: string;
  position: pc.Vec3;
  timeout: number;
}

export class InteractiveAnomalySystem {
  private active?: Challenge;
  private timer = 0;
  private missSerial = 0;
  private readonly action: Interactable;

  constructor(
    private readonly world: BuiltWorld,
    private readonly session: GameSession,
    private readonly state: GameState,
    private readonly ui: GameUI,
    runtime: AnomalyRuntime
  ) {
    this.action = {
      id: 'shared-anomaly-response',
      label: 'verify anomaly',
      position: new pc.Vec3(999, 999, 999),
      radius: 2.5,
      aimRadius: 0.56,
      onInteract: () => this.respond()
    };
    world.interactables.push(this.action);

    this.bind(runtime, 'false-cop', {
      label: 'verify badge number',
      text: 'The deputy asks you to unlock the rear door. Check the badge before obeying.',
      safeText: 'HALL — 271 is correct. The person wearing it is not Sheriff Hall.',
      position: new pc.Vec3(-4.7, 1.2, 7.7),
      timeout: 22
    });
    this.bind(runtime, 'wrong-face', {
      label: 'verify the regular',
      text: 'A familiar regular is at the counter. Something about the face is wrong.',
      safeText: 'The customer cannot answer the question the real regular always complains about.',
      position: new pc.Vec3(-4.7, 1.2, 7.7),
      timeout: 20
    });
    this.bind(runtime, 'customer-stayed', {
      label: 'refuse second service',
      text: 'The customer you watched leave is standing at the counter again.',
      safeText: 'You refuse the second transaction. The customer quietly walks away.',
      position: new pc.Vec3(-4.7, 1.2, 7.7),
      timeout: 24
    });
    this.bind(runtime, 'wrong-door', {
      label: 'mark door unsafe',
      text: 'The rear doorway opens onto somewhere that cannot fit inside the building.',
      safeText: 'You tape the handle and refuse to cross the threshold.',
      position: new pc.Vec3(-0.1, 1.25, -11.0),
      timeout: 24
    });
    this.bind(runtime, 'frozen-clock', {
      label: 'check backup time',
      text: 'The wall clock is frozen at 3:33. Verify time somewhere that is not connected to the store.',
      safeText: 'Your backup watch is still moving. You stop trusting the wall clock.',
      position: new pc.Vec3(-8.35, 1.58, 7.46),
      timeout: 26
    });
    this.bind(runtime, 'coffee-rule', {
      label: 'keep brewer running',
      text: 'The coffee machine shuts itself off. The old note says the pot must stay running.',
      safeText: 'You restart the brewer. The refrigeration hum settles with it.',
      position: new pc.Vec3(6.3, 1.1, 8.4),
      timeout: 20
    });
    this.bind(runtime, 'camera-desync', {
      label: 'compare camera feed',
      text: 'Camera 6 shows a different rear lot. Compare it against the physical door before acting.',
      safeText: 'The live rear door is locked. Camera 6 is showing somewhere else.',
      position: new pc.Vec3(-7.6, 1.32, -9.55),
      timeout: 24
    });
    this.bind(runtime, 'duplicate-player', {
      label: 'verify your location',
      text: 'CCTV shows you in another aisle. Confirm your current position before following the feed.',
      safeText: 'You stay put. The duplicate keeps moving without you.',
      position: new pc.Vec3(-7.6, 1.32, -9.55),
      timeout: 22
    });
    this.bind(runtime, 'receipt-name', {
      label: 'discard named receipt',
      text: 'A receipt prints with a customer name nobody told you.',
      safeText: 'You tear the receipt off face-down and throw it away.',
      position: new pc.Vec3(-4.25, 1.16, 7.58),
      timeout: 18
    });
    this.bind(runtime, 'pump-counter-rollover', {
      label: 'kill pump authorization',
      text: 'A pump total is climbing with no customer at the nozzle.',
      safeText: 'You cut authorization before the total can complete.',
      position: new pc.Vec3(-4.35, 1.18, 7.65),
      timeout: 20
    });
    this.bind(runtime, 'no-chime-exit', {
      label: 'log silent exit',
      text: 'A customer leaves without the exit chime. Do not follow them outside.',
      safeText: 'You log the silent exit and stay behind the glass.',
      position: new pc.Vec3(-4.7, 1.2, 7.7),
      timeout: 18
    });
  }

  update(dt: number): void {
    if (!this.active) return;
    this.timer -= dt;
    if (this.timer > 0) return;
    this.fail(this.active.id);
  }

  private bind(runtime: AnomalyRuntime, id: string, base: Omit<Challenge, 'id'>): void {
    runtime.register(id, (definition) => this.arm(definition, { id, ...base }));
  }

  private arm(definition: AnomalyDefinition, challenge: Challenge): void {
    this.session.progression.recordAnomaly(definition.id, definition.tier === 'mythic');
    if (this.active) {
      this.state.complete(`anomaly:${definition.id}`);
      this.ui.showMessage(`${definition.title}: ${challenge.text}`, 3600);
      return;
    }
    this.state.complete(`anomaly:${definition.id}`);
    this.active = challenge;
    this.timer = challenge.timeout;
    this.action.label = challenge.label;
    this.action.position.copy(challenge.position);
    this.state.addTask(`response:${challenge.id}`, challenge.label.charAt(0).toUpperCase() + challenge.label.slice(1));
    this.ui.flashWarning(definition.title.toUpperCase(), 1100);
    this.ui.showMessage(challenge.text, 4300);
  }

  private respond(): string {
    if (!this.active) return 'Nothing unusual needs verifying right now.';
    const challenge = this.active;
    this.state.complete(`response:${challenge.id}`);
    this.state.complete(`resolved:${challenge.id}`);
    this.ui.flashWarning('VERIFIED', 1000);
    this.active = undefined;
    this.action.label = 'verify anomaly';
    this.action.position.set(999, 999, 999);
    return challenge.safeText;
  }

  private fail(id: string): void {
    if (!this.active || this.active.id !== id) return;
    this.state.complete(`response-failed:${id}`);
    if (this.session.isEndless()) {
      this.missSerial++;
      this.state.complete(`endless-miss:${this.missSerial}`);
      this.ui.flashWarning('MISSED RESPONSE', 1500);
      this.ui.showMessage('The store remembers that you ignored it.', 3600);
    } else {
      const marker = `rule-broken:night${this.session.config.night}-${id}`;
      this.state.complete(marker);
      this.session.progression.recordRuleBreak(this.session.config.night);
      this.ui.flashWarning('RULE BROKEN', 1500);
      this.ui.showMessage('You let the anomaly resolve on its own. That was the wrong choice.', 4000);
    }
    this.active = undefined;
    this.action.label = 'verify anomaly';
    this.action.position.set(999, 999, 999);
  }
}
