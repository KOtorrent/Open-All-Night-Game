import * as pc from 'playcanvas';
import type { BuiltWorld, Interactable } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

function material(color: pc.Color, gloss = 0.14): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.gloss = gloss;
  m.update();
  return m;
}

/** Adds boring, believable mid-shift retail work between the scarier beats. */
export class MidShiftTaskSystem {
  private readonly app: pc.Application;
  private readonly world: BuiltWorld;
  private readonly state: GameState;
  private readonly ui: GameUI;
  private coolerSpawned = false;
  private lotterySpawned = false;

  constructor(app: pc.Application, world: BuiltWorld, state: GameState, ui: GameUI) {
    this.app = app;
    this.world = world;
    this.state = state;
    this.ui = ui;
  }

  update(): void {
    const minute = this.state.getGameMinutes();
    if (!this.coolerSpawned && minute >= 26 * 60 + 34 && !this.state.isComplete('cooler-temp-log')) {
      this.coolerSpawned = true;
      this.spawnCoolerCheck();
    }
    if (!this.lotterySpawned && minute >= 28 * 60 + 2 && !this.state.isComplete('lottery-count')) {
      this.lotterySpawned = true;
      this.spawnLotteryCount();
    }
  }

  private spawnCoolerCheck(): void {
    this.state.addTask('cooler-temp-log', 'Record the cooler temperature');
    const shell = material(new pc.Color(0.18, 0.20, 0.19), 0.35);
    const face = material(new pc.Color(0.68, 0.72, 0.66), 0.18);

    const meter = this.box('CoolerThermometer', new pc.Vec3(7.72, 1.72, -9.88), new pc.Vec3(0.30, 0.52, 0.08), shell);
    this.box('CoolerThermometerFace', new pc.Vec3(7.72, 1.72, -9.82), new pc.Vec3(0.22, 0.34, 0.018), face);

    let item: Interactable;
    item = {
      id: 'cooler-temp-log',
      label: 'record cooler temperature',
      position: new pc.Vec3(7.72, 1.72, -9.72),
      radius: 2.2,
      aimRadius: 0.42,
      onInteract: () => {
        if (!this.state.complete('cooler-temp-log')) return 'Cooler temperature already logged: 37°F.';
        meter.enabled = true;
        this.remove(item);
        return '37°F. You write it on the log sheet. Completely normal.';
      }
    };
    this.world.interactables.push(item);
    this.ui.showMessage('Routine check: record the cooler temperature.', 2800);
  }

  private spawnLotteryCount(): void {
    this.state.addTask('lottery-count', 'Count the scratch-off ticket packs');
    const tray = material(new pc.Color(0.08, 0.09, 0.085), 0.34);
    const ticketColors = [
      new pc.Color(0.36, 0.08, 0.05),
      new pc.Color(0.08, 0.19, 0.34),
      new pc.Color(0.28, 0.23, 0.05),
      new pc.Color(0.10, 0.28, 0.13)
    ];

    this.box('LotteryTray', new pc.Vec3(-5.88, 1.40, 7.92), new pc.Vec3(0.88, 0.06, 0.52), tray);
    for (let i = 0; i < 4; i++) {
      const ticket = this.box(`LotteryPack-${i}`, new pc.Vec3(-6.16 + i * 0.19, 1.445, 7.92), new pc.Vec3(0.16, 0.025, 0.38), material(ticketColors[i], 0.12));
      ticket.setEulerAngles(0, -4 + i * 3, 0);
    }

    let item: Interactable;
    item = {
      id: 'lottery-count',
      label: 'count lottery packs',
      position: new pc.Vec3(-5.88, 1.47, 7.92),
      radius: 2.25,
      aimRadius: 0.50,
      onInteract: () => {
        if (!this.state.complete('lottery-count')) return 'Scratch-off count already entered.';
        this.remove(item);
        return 'Four open packs, seals intact. You initial the count sheet.';
      }
    };
    this.world.interactables.push(item);
    this.ui.showMessage('Manager note: count the scratch-off packs before dawn.', 3000);
  }

  private box(name: string, position: pc.Vec3, scale: pc.Vec3, mat: pc.StandardMaterial): pc.Entity {
    const e = new pc.Entity(name);
    e.addComponent('render', { type: 'box' });
    e.setPosition(position);
    e.setLocalScale(scale);
    if (e.render) e.render.material = mat;
    this.app.root.addChild(e);
    return e;
  }

  private remove(item: Interactable): void {
    const index = this.world.interactables.indexOf(item);
    if (index >= 0) this.world.interactables.splice(index, 1);
  }
}
