import * as pc from 'playcanvas';
import type { BuiltWorld, Interactable } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

function mat(color: pc.Color, gloss = 0.2, emissive?: pc.Color): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.gloss = gloss;
  if (emissive) {
    m.emissive = emissive;
    m.emissiveIntensity = 1;
  }
  m.update();
  return m;
}

/** Gives the vertical slice a real ending instead of letting the clock simply stop at 6:00 AM. */
export class ShiftEndSystem {
  private readonly app: pc.Application;
  private readonly world: BuiltWorld;
  private readonly state: GameState;
  private readonly ui: GameUI;
  private prompted = false;
  private interactable: Interactable;
  private statusLight: pc.Entity;

  constructor(app: pc.Application, world: BuiltWorld, state: GameState, ui: GameUI) {
    this.app = app;
    this.world = world;
    this.state = state;
    this.ui = ui;

    const shell = mat(new pc.Color(0.055, 0.06, 0.058), 0.28);
    const face = mat(new pc.Color(0.12, 0.13, 0.12), 0.30);
    const dark = mat(new pc.Color(0.05, 0.015, 0.01), 0.24, new pc.Color(0.03, 0.005, 0.002));

    const body = new pc.Entity('TimeClockBody');
    body.addComponent('render', { type: 'box' });
    body.setPosition(-8.35, 1.55, 7.58);
    body.setLocalScale(0.58, 0.72, 0.16);
    if (body.render) body.render.material = shell;
    app.root.addChild(body);

    const panel = new pc.Entity('TimeClockFace');
    panel.addComponent('render', { type: 'box' });
    panel.setPosition(-8.35, 1.58, 7.49);
    panel.setLocalScale(0.42, 0.42, 0.025);
    if (panel.render) panel.render.material = face;
    app.root.addChild(panel);

    this.statusLight = new pc.Entity('TimeClockStatus');
    this.statusLight.addComponent('render', { type: 'box' });
    this.statusLight.setPosition(-8.35, 1.79, 7.47);
    this.statusLight.setLocalScale(0.18, 0.055, 0.02);
    if (this.statusLight.render) this.statusLight.render.material = dark;
    app.root.addChild(this.statusLight);

    this.interactable = {
      id: 'shift-time-clock',
      label: 'check time clock',
      position: new pc.Vec3(-8.35, 1.58, 7.46),
      radius: 2.2,
      aimRadius: 0.40,
      onInteract: () => this.clockOut()
    };
    world.interactables.push(this.interactable);
  }

  update(): void {
    const minute = this.state.getGameMinutes();
    if (!this.prompted && minute >= 29 * 60 + 55 && !this.state.isComplete('night1-clock-out')) {
      this.prompted = true;
      this.state.addTask('night1-clock-out', 'Clock out when the shift reaches 6:00 AM');
      this.interactable.label = 'check time clock';
      this.setStatus(true);
      this.ui.showMessage('5:55 AM. Five minutes. Almost done.', 3200);
    }
  }

  private clockOut(): string {
    const minute = this.state.getGameMinutes();
    if (minute < 30 * 60) {
      const remaining = Math.max(1, Math.ceil(30 * 60 - minute));
      return `${remaining} minute${remaining === 1 ? '' : 's'} left on the shift.`;
    }
    if (this.state.isComplete('night1-clock-out')) return '6:00 AM. You are already clocked out.';

    this.state.complete('night1-clock-out');
    this.interactable.label = 'shift complete';
    this.setStatus(false);
    this.ui.flashWarning('SHIFT COMPLETE', 2200);
    this.ui.showMessage('6:00 AM. The fluorescent hum suddenly feels ordinary again. Night 1 complete.', 6500);
    return 'You punch out. 6:00 AM.';
  }

  private setStatus(active: boolean): void {
    if (!this.statusLight.render) return;
    this.statusLight.render.material = active
      ? mat(new pc.Color(0.48, 0.30, 0.025), 0.25, new pc.Color(0.24, 0.11, 0.005))
      : mat(new pc.Color(0.035, 0.08, 0.035), 0.28, new pc.Color(0.008, 0.025, 0.008));
  }
}
