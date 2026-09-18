import * as pc from 'playcanvas';
import type { BuiltWorld } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

export class NightThreeRuntime {
  private flashTimer = 0;
  private stormPulse = 0;

  constructor(private readonly app: pc.Application, world: BuiltWorld, private readonly state: GameState, private readonly ui: GameUI) {
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

    app.scene.ambientLight = new pc.Color(0.055, 0.065, 0.075);
  }

  update(dt: number): void {
    this.stormPulse += dt;
    if (this.stormPulse < 7.5) return;
    this.stormPulse = 0;
    if (Math.random() > 0.36) return;
    this.flashTimer = 0.12;
    this.app.scene.ambientLight = new pc.Color(0.22, 0.25, 0.29);
    window.setTimeout(() => {
      this.app.scene.ambientLight = new pc.Color(0.055, 0.065, 0.075);
    }, 120);
  }
}
