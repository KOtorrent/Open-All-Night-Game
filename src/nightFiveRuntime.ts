import * as pc from 'playcanvas';
import type { BuiltWorld } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

export class NightFiveRuntime {
  private larry?: pc.Entity;
  private spawned = false;
  private dialogueStep = 0;

  constructor(private readonly app: pc.Application, private readonly world: BuiltWorld, private readonly state: GameState, private readonly ui: GameUI) {
    const add = (id: string, label: string, pos: pc.Vec3, text: string) => world.interactables.push({
      id, label, position: pos, radius: 2.3, aimRadius: 0.54,
      onInteract: () => {
        if (!this.state.isComplete(id)) this.state.complete(id);
        this.ui.showMessage(text, 3400);
        return text;
      }
    });

    add('n5-routine', 'repeat opening routine', new pc.Vec3(-4.9, 1.15, 7.8), 'Register, coffee, doors, lights. Same order as Night 1.');
    add('n5-count', 'count everyone', new pc.Vec3(-4.8, 1.2, 7.7), 'You count one more person than you can physically locate.');
    add('n5-coffee', 'make another pot', new pc.Vec3(6.3, 1.1, 8.4), 'The fresh pot smells exactly like the one from your first shift.');
    add('n5-larry-file', 'read Larry Case file', new pc.Vec3(-7.5, 1.35, -9.3), 'LARRY CASE — NIGHT CLERK. Years of incident notes. Final line: RULES KEEP THINGS MOVING.');
  }

  update(): void {
    if (!this.spawned && this.state.getGameMinutes() >= 29 * 60 + 40) this.spawnLarry();
  }

  private spawnLarry(): void {
    this.spawned = true;
    const material = new pc.StandardMaterial();
    material.diffuse = new pc.Color(0.15, 0.16, 0.14);
    material.gloss = 0.10;
    material.update();

    const root = new pc.Entity('LarryCase');
    const body = new pc.Entity('LarryBody');
    body.addComponent('render', { type: 'capsule' });
    body.setLocalScale(0.62, 1.62, 0.62);
    body.setLocalPosition(0, 0.85, 0);
    if (body.render) body.render.material = material;
    root.addChild(body);
    root.setPosition(0, 0, 7.9);
    this.app.root.addChild(root);
    this.larry = root;

    this.world.interactables.push({
      id: 'larry-finale-talk',
      label: 'talk to Larry',
      position: new pc.Vec3(0, 1.3, 7.9),
      radius: 2.6,
      aimRadius: 0.66,
      onInteract: () => this.talkLarry()
    });

    this.ui.showMessage('The entrance chime does not ring. An older man is standing inside.', 4200);
  }

  private talkLarry(): string {
    const lines = [
      '“Shift change.”',
      '“Gas station. Mostly.”',
      '“Customers.”',
      '“Rules keep things moving.”',
      '“Morning isn’t coming until somebody takes the shift.”',
      '“You’re already clocked in.”'
    ];
    const line = lines[Math.min(this.dialogueStep, lines.length - 1)];
    this.dialogueStep++;
    if (this.dialogueStep >= lines.length) {
      this.state.complete('larry-conversation');
      if (this.state.isComplete('n5-larry-file')) this.state.complete('ending-break-available');
    }
    this.ui.showMessage(line, 3600);
    return line;
  }
}
