import * as pc from 'playcanvas';
import type { BuiltWorld } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';
import type { AnomalyRuntime } from './anomalyRuntime';

interface Context {
  app: pc.Application;
  world: BuiltWorld;
  state: GameState;
  ui: GameUI;
}

/**
 * Registers reusable authored behaviors for anomaly IDs shared by Nights 2-5 and Endless.
 * These are intentionally systemic: later nights reuse the same handler instead of cloning
 * one-off directors.
 */
export class SharedAnomalyHandlers {
  private transient?: pc.Entity;
  private transientTimer = 0;

  constructor(private readonly ctx: Context, runtime: AnomalyRuntime) {
    const messageOnly: Record<string, string> = {
      'wrong-price': 'The register total does not match the shelf tag.',
      'no-chime-exit': 'The door opens. No exit chime follows.',
      'same-car': 'The same car rolls past the windows again. Same plate. Same dent.',
      'pump-counter-rollover': 'A pump total starts climbing with nobody at the nozzle.',
      'lottery-repeat': 'The same scratch-off serial appears twice in the pack.',
      'shelf-reset': 'The shelf you just faced has returned to exactly how it was.',
      'freezer-handprint': 'A handprint blooms in the freezer condensation from the inside.',
      'radio-voice': 'The store radio says your name between two songs.',
      'receipt-name': 'The receipt contains a name you never entered.',
      'light-follow': 'One pool of fluorescent light seems to move when you do.',
      'mirror-delay': 'Your reflection finishes turning a beat after you stop.',
      'empty-queue': 'The register beeps for the next customer. Nobody is there.',
      'door-chime-false': 'The entrance chime rings. The doorway stays empty.',
      'cctv-time-slip': 'The CCTV timestamp is several minutes ahead of the wall clock.',
      'camera-desync': 'The camera feed and the room in front of you do not agree.',
      'wrong-door': 'The doorway opens onto a room that cannot fit inside the building.',
      'corrupted-rule': 'One line in the notebook is written in different ink.',
      'coffee-rule': 'The coffee machine clicks off by itself. The handwritten note says: KEEP IT RUNNING.',
      'head-count': 'The number of people you can see does not match the number you counted.',
      'customer-stayed': 'Someone you already watched leave is standing at the end of an aisle.',
      'impossible-receipt': 'The printer feeds a receipt for a transaction that has not happened yet.',
      'repeater': 'A customer you just served walks in again wearing the same expression.',
      'wrong-face': 'You know the customer. Their face is not the one you remember.',
      'false-cop': 'The badge says HALL — 271. The person wearing it does not know the sheriff’s first name.',
      'frozen-clock': 'The wall clock stops. Everything else keeps moving.',
      'pump-7': 'Pump 7 wakes up with no customer at the island.',
      'rear-door-knock': 'Three knocks hit the rear delivery door.',
      'storm-blackout': 'The fluorescents die. Emergency light begins to hum.',
      'freezer-flicker': 'The freezer lights begin flashing.',
      'silent-customer': 'The entrance opens without the chime.',
      'bathroom-knock': 'Knocking starts behind the restroom door.',
      'cam4-figure': 'Camera 4 contains a person the sales floor does not.',
      'window-watcher': 'A figure stands beyond the front glass without a car nearby.'
    };

    for (const [id, text] of Object.entries(messageOnly)) {
      runtime.register(id, () => this.triggerMessage(id, text));
    }

    runtime.register('smiling-woman', () => this.spawnPresence('smiling-woman', new pc.Vec3(3.8, 1.0, 7.4), new pc.Color(0.63, 0.48, 0.10), 'The woman in the yellow coat keeps smiling.'));
    runtime.register('tall-man', () => this.spawnPresence('tall-man', new pc.Vec3(4.6, 1.7, 13.4), new pc.Color(0.08, 0.09, 0.10), 'Something much too tall is standing beneath the canopy.', 18));
    runtime.register('window-reflection', () => this.spawnPresence('window-reflection', new pc.Vec3(-4.5, 1.3, 11.9), new pc.Color(0.15, 0.17, 0.16), 'The front window reflection contains one extra person.', 11));
    runtime.register('duplicate-player', () => this.triggerMessage('duplicate-player', 'Camera 4 shows you in Aisle 3 while you are standing somewhere else.'));
    runtime.register('missing-aisle', () => this.triggerMessage('missing-aisle', 'For several seconds, Aisle 2 ends at a blank wall.'));
    runtime.register('extra-door', () => this.triggerMessage('extra-door', 'A narrow black door is standing where the back wall should be.'));
  }

  update(dt: number): void {
    if (!this.transient) return;
    this.transientTimer -= dt;
    if (this.transientTimer > 0) return;
    this.transient.destroy();
    this.transient = undefined;
  }

  private triggerMessage(id: string, text: string): void {
    this.ctx.state.complete(`anomaly:${id}`);
    this.ctx.ui.showMessage(text, 4200);
  }

  private spawnPresence(id: string, position: pc.Vec3, color: pc.Color, text: string, seconds = 14): void {
    this.transient?.destroy();

    const material = new pc.StandardMaterial();
    material.diffuse = color;
    material.gloss = 0.08;
    material.update();

    const root = new pc.Entity(`AnomalyPresence-${id}`);
    const body = new pc.Entity('body');
    body.addComponent('render', { type: 'capsule' });
    body.setLocalScale(id === 'tall-man' ? 0.65 : 0.52, id === 'tall-man' ? 2.4 : 1.45, id === 'tall-man' ? 0.65 : 0.52);
    body.setLocalPosition(0, id === 'tall-man' ? 1.15 : 0.75, 0);
    if (body.render) body.render.material = material;
    root.addChild(body);
    root.setPosition(position);
    this.ctx.app.root.addChild(root);

    this.transient = root;
    this.transientTimer = seconds;
    this.ctx.state.complete(`anomaly:${id}`);
    this.ctx.ui.showMessage(text, 4200);
  }
}
