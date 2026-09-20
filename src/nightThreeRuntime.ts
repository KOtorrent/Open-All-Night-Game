import * as pc from 'playcanvas';
import type { BuiltWorld } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';
import type { ProgressionStore } from './progressionStore';

export class NightThreeRuntime {
  private stormPulse = 0;
  private blackoutArmed = false;
  private blackoutTimer = 0;
  private blackoutGrace = 0;
  private blackoutActive = false;
  private emergencyLights: pc.Entity[] = [];
  private pump7Armed = false;
  private pump7Timer = 0;
  private rearDoorArmed = false;
  private rearDoorTimer = 0;

  constructor(
    private readonly app: pc.Application,
    world: BuiltWorld,
    private readonly state: GameState,
    private readonly ui: GameUI,
    private readonly progression: ProgressionStore,
    private readonly camera: pc.Entity
  ) {
    const add = (id: string, label: string, pos: pc.Vec3, text: string) => world.interactables.push({
      id, label, position: pos, radius: 2.4, aimRadius: 0.56,
      onInteract: () => {
        if (!this.state.isComplete(id)) this.state.complete(id);
        this.ui.showMessage(text, 3200);
        return text;
      }
    });

    add('n3-storm-check', 'check exterior doors', new pc.Vec3(0, 1.4, 10.5), 'Front doors latched. Wind pushes rain under the mat.');
    add('n3-breaker', 'verify breaker panel', new pc.Vec3(-8.8, 1.35, -9.6), 'Breaker labels are intact. The MAIN switch is warm.');
    add('n3-mop', 'mop entrance water', new pc.Vec3(0.6, 0.35, 9.5), 'You push the rainwater back toward the door.');
    add('n3-delivery', 'reconcile storm manifest', new pc.Vec3(-7.6, 1.0, -10.4), 'The storm manifest lists one carton that never arrived.');
    add('n3-larry', 'read incident note', new pc.Vec3(-7.5, 1.35, -9.25), 'L. CASE: “Storm nights make the road shorter. Don’t follow headlights.”');

    world.interactables.push({
      id: 'n3-pump7-deny', label: 'deny Pump 7', position: new pc.Vec3(-4.35, 1.18, 7.65), radius: 2.2, aimRadius: 0.45,
      onInteract: () => {
        if (!this.pump7Armed) return 'Pump 7 has no request pending.';
        if (!this.state.isComplete('n3-pump7-denied')) {
          this.state.complete('n3-pump7-denied');
          this.state.complete('pump7-denied');
          this.ui.flashWarning('PUMP 7 DENIED', 1200);
        }
        return 'Authorization denied. The request light goes dark.';
      }
    });

    world.interactables.push({
      id: 'n3-camera6-verify', label: 'verify Camera 6', position: new pc.Vec3(-7.6, 1.32, -9.55), radius: 2.3, aimRadius: 0.50,
      onInteract: () => {
        if (!this.rearDoorArmed) return 'Camera 6 shows the rear lot.';
        this.state.complete('n3-camera6-verified');
        return 'Camera 6: rear door, loading pad, rain. No person visible.';
      }
    });

    world.interactables.push({
      id: 'n3-rear-door-check', label: 'check rear door lock', position: new pc.Vec3(-0.1, 1.25, -11.1), radius: 2.4, aimRadius: 0.52,
      onInteract: () => {
        if (!this.rearDoorArmed) return 'Rear door is locked.';
        if (!this.state.isComplete('n3-camera6-verified')) {
          this.breakRule('n3-rear-door', 'You touch the rear lock before checking Camera 6.');
          return 'The handle jerks once in your hand.';
        }
        this.state.complete('n3-rear-door-safe');
        this.state.complete('rear-door-checked');
        return 'Camera checked first. You confirm the deadbolt and step away.';
      }
    });

    app.scene.ambientLight = new pc.Color(0.055, 0.065, 0.075);
  }

  update(dt: number): void {
    this.updateStorm(dt);
    this.updateBlackout(dt);
    this.updatePumpSeven(dt);
    this.updateRearDoor(dt);
  }

  private updateStorm(dt: number): void {
    this.stormPulse += dt;
    if (this.stormPulse < 7.5) return;
    this.stormPulse = 0;
    if (Math.random() > 0.36) return;
    this.app.scene.ambientLight = new pc.Color(0.22, 0.25, 0.29);
    window.setTimeout(() => {
      this.app.scene.ambientLight = new pc.Color(0.055, 0.065, 0.075);
    }, 120);
  }

  private updateBlackout(dt: number): void {
    if (!this.blackoutArmed && this.state.isComplete('anomaly:storm-blackout')) {
      this.blackoutArmed = true;
      this.blackoutTimer = 14;
      // Whatever the player was doing when the anomaly fires (checking a camera, restocking,
      // reading the notebook) is very rarely "already standing behind the counter" - confirmed
      // in-engine that with no grace period, the position check below ran on the same frame as
      // arming and broke the rule (and immediately reverted the emergency lighting it had just
      // switched on) before the player could ever react. A few seconds to actually get there keeps
      // the rule "avoidable" the way its own task text ("stay behind the counter") implies, instead
      // of an instant, unwinnable fail unless the player happened to already be at the counter.
      this.blackoutGrace = 6;
      this.state.addTask('n3-blackout-hold', 'Stay behind the counter until emergency lights stabilize');
      this.ui.flashWarning('POWER OUT', 1200);
      this.setBlackoutLighting(true);
    }
    if (!this.blackoutArmed || this.state.isComplete('n3-blackout-held') || this.state.isComplete('rule-broken:n3-blackout')) return;

    if (this.blackoutGrace > 0) {
      this.blackoutGrace -= dt;
      return;
    }

    const pos = this.camera.getPosition();
    const behindCounter = pos.z > 6.4 && pos.x < -2.7;
    if (!behindCounter) {
      this.setBlackoutLighting(false);
      this.breakRule('n3-blackout', 'You leave the counter before the emergency lights stabilize.');
      return;
    }

    this.blackoutTimer -= dt;
    if (this.blackoutTimer <= 0) {
      this.state.complete('n3-blackout-held');
      this.setBlackoutLighting(false);
      this.ui.showMessage('Emergency lights settle into a weak red glow. You can move again.', 3200);
    }
  }

  // The blackout anomaly's own text ("The fluorescents die. Emergency light begins to hum.") had
  // nothing behind it - the store's fluorescent fixtures stayed fully lit the whole time, directly
  // contradicting the narration. Cuts the main ceiling fixtures and swaps in a few dim red emergency
  // pools instead, matching "blackout scary but playable / emergency-lit store readable": the
  // counter the player is required to stay at keeps a lit pool, the rest of the floor goes dim red.
  private setBlackoutLighting(active: boolean): void {
    if (this.blackoutActive === active) return;
    this.blackoutActive = active;

    for (const component of this.app.root.findComponents('light')) {
      const light = component as unknown as pc.LightComponent;
      if (light.entity.name.startsWith('FixtureLight-')) light.intensity = active ? 0.02 : 0.78;
    }

    if (active && this.emergencyLights.length === 0) {
      const positions: pc.Vec3[] = [new pc.Vec3(-5.6, 2.5, 7.4), new pc.Vec3(0, 2.5, -1), new pc.Vec3(4.8, 2.5, -8.0)];
      for (const [i, position] of positions.entries()) {
        const light = new pc.Entity(`EmergencyLight-${i}`);
        light.addComponent('light', { type: 'omni', color: new pc.Color(0.85, 0.10, 0.06), intensity: 1.3, range: 6.8, castShadows: false });
        light.setPosition(position);
        this.app.root.addChild(light);
        this.emergencyLights.push(light);
      }
    }
    for (const light of this.emergencyLights) light.enabled = active;
  }

  private updatePumpSeven(dt: number): void {
    if (!this.pump7Armed && this.state.isComplete('anomaly:pump-7')) {
      this.pump7Armed = true;
      this.pump7Timer = 18;
      this.state.addTask('n3-pump7-denied', 'Deny the Pump 7 authorization request');
    }
    if (!this.pump7Armed || this.state.isComplete('n3-pump7-denied') || this.state.isComplete('rule-broken:n3-pump7')) return;
    this.pump7Timer -= dt;
    if (this.pump7Timer <= 0) this.breakRule('n3-pump7', 'Pump 7 authorizes itself while you hesitate.');
  }

  private updateRearDoor(dt: number): void {
    if (!this.rearDoorArmed && this.state.isComplete('anomaly:rear-door-knock')) {
      this.rearDoorArmed = true;
      this.rearDoorTimer = 28;
      this.state.addTask('n3-rear-door-safe', 'Check Camera 6 before touching the rear lock');
    }
    if (!this.rearDoorArmed || this.state.isComplete('n3-rear-door-safe') || this.state.isComplete('rule-broken:n3-rear-door')) return;
    this.rearDoorTimer -= dt;
    if (this.rearDoorTimer <= 0) {
      this.state.complete('n3-rear-door-safe');
      this.ui.showMessage('The knocking stops. You never touched the lock.', 3200);
    }
  }

  private breakRule(id: string, text: string): void {
    this.state.complete(`rule-broken:${id}`);
    this.progression.recordRuleBreak(3);
    this.ui.flashWarning('RULE BROKEN', 1700);
    this.ui.showMessage(text, 4200);
  }
}
