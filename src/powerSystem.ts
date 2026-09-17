import * as pc from 'playcanvas';
import type { BuiltWorld, Interactable } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

function mat(color: pc.Color, metalness = 0.4, gloss = 0.25, emissive?: pc.Color): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.metalness = metalness;
  m.gloss = gloss;
  if (emissive) {
    m.emissive = emissive;
    m.emissiveIntensity = 1;
  }
  m.update();
  return m;
}

export class PowerSystem {
  private readonly app: pc.Application;
  private readonly world: BuiltWorld;
  private readonly state: GameState;
  private readonly ui: GameUI;
  private elapsed = 0;
  private triggered = false;
  private restored = false;
  private breakerInteractable?: Interactable;
  private affectedLights: pc.Entity[] = [];
  private indicator?: pc.Entity;

  constructor(app: pc.Application, world: BuiltWorld, state: GameState, ui: GameUI) {
    this.app = app;
    this.world = world;
    this.state = state;
    this.ui = ui;
    this.buildBreakerBox();
  }

  update(dt: number): void {
    this.elapsed += dt;
    if (this.restored || this.triggered) return;
    const minute = this.state.getGameMinutes();
    if (minute >= 24 * 60 + 5 || this.elapsed >= 88) this.triggerOutage();
  }

  private buildBreakerBox(): void {
    const steel = mat(new pc.Color(0.20, 0.22, 0.21), 0.65, 0.38);
    const dark = mat(new pc.Color(0.035, 0.04, 0.04), 0.25, 0.15);
    const greenGlow = mat(new pc.Color(0.02, 0.15, 0.05), 0, 0.18, new pc.Color(0.015, 0.17, 0.045));

    const body = new pc.Entity('BreakerBox');
    body.addComponent('render', { type: 'box' });
    body.setPosition(-9.52, 1.50, -8.55);
    body.setLocalScale(0.18, 1.05, 0.82);
    if (body.render) body.render.material = steel;
    this.app.root.addChild(body);

    const door = new pc.Entity('BreakerDoor');
    door.addComponent('render', { type: 'box' });
    door.setPosition(-9.40, 1.50, -8.55);
    door.setLocalScale(0.07, 0.93, 0.70);
    if (door.render) door.render.material = dark;
    this.app.root.addChild(door);

    const indicator = new pc.Entity('BreakerIndicator');
    indicator.addComponent('render', { type: 'sphere' });
    indicator.setPosition(-9.35, 1.82, -8.55);
    indicator.setLocalScale(0.07, 0.07, 0.07);
    if (indicator.render) indicator.render.material = greenGlow;
    this.app.root.addChild(indicator);
    this.indicator = indicator;
  }

  private triggerOutage(): void {
    this.triggered = true;
    this.state.addTask('reset-breaker', 'Reset the rear breaker');
    this.affectedLights = ['FixtureLight-6', 'FixtureLight-7', 'FixtureLight-8', 'FixtureLight-9', 'BackHallLight']
      .map((name) => this.app.root.findByName(name))
      .filter((entity): entity is pc.Entity => Boolean(entity));
    for (const light of this.affectedLights) light.enabled = false;
    if (this.indicator?.render) {
      const red = mat(new pc.Color(0.18, 0.015, 0.01), 0, 0.14, new pc.Color(0.30, 0.015, 0.008));
      this.indicator.render.material = red;
    }

    const interactable: Interactable = {
      id: 'reset-breaker',
      label: 'reset breaker',
      position: new pc.Vec3(-9.1, 1.5, -8.55),
      radius: 2.2,
      onInteract: () => this.restorePower()
    };
    this.breakerInteractable = interactable;
    this.world.interactables.push(interactable);
    this.ui.showMessage('CLICK. Half the store drops into darkness.', 3400);
  }

  private restorePower(): string {
    if (this.restored) return 'The breaker is holding.';
    this.restored = true;
    for (const light of this.affectedLights) light.enabled = true;
    this.state.complete('reset-breaker');
    if (this.indicator?.render) {
      const green = mat(new pc.Color(0.02, 0.15, 0.05), 0, 0.18, new pc.Color(0.015, 0.17, 0.045));
      this.indicator.render.material = green;
    }
    if (this.breakerInteractable) {
      const index = this.world.interactables.indexOf(this.breakerInteractable);
      if (index >= 0) this.world.interactables.splice(index, 1);
    }
    return 'The fluorescents buzz back to life one bank at a time.';
  }
}
