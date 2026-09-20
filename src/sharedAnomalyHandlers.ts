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

    // Mythics are deliberately rare, but they are real runtime events now rather than catalog-only IDs.
    runtime.register('empty-bus', () => this.spawnPresence('empty-bus', new pc.Vec3(-7.5, 1.5, 27.0), new pc.Color(0.12, 0.13, 0.12), 'A bus is idling beyond the pumps with its doors open. There is nobody inside.', 24));
    runtime.register('second-store', () => this.triggerMythic('second-store', 'Across the road, another Case’s is open. Every light is on. Your silhouette is behind its counter.'));
    runtime.register('wrong-moon', () => this.triggerMythic('wrong-moon', 'The moon is too large, too low, and on the wrong side of the road.'));
    runtime.register('customer-with-your-name', () => this.triggerMythic('customer-with-your-name', 'A customer hands you an ID. The name on it is yours.'));
    runtime.register('larry-parking-lot', () => this.spawnPresence('larry-parking-lot', new pc.Vec3(2.8, 1.0, 19.5), new pc.Color(0.12, 0.12, 0.10), 'An older man is standing alone in the parking lot. When the canopy light flickers, he is gone.', 16));
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

  private triggerMythic(id: string, text: string): void {
    this.ctx.state.complete(`anomaly:${id}`);
    this.ctx.ui.flashWarning('SOMETHING IS VERY WRONG', 1500);
    this.ctx.ui.showMessage(text, 6200);
  }

  private spawnPresence(id: string, position: pc.Vec3, color: pc.Color, text: string, seconds = 14): void {
    this.transient?.destroy();

    // Used to be a single bare capsule with no head or limbs - functionally fine (it appears,
    // times out, sets its flags) but visually undercut every one of these anomalies: "the woman in
    // the yellow coat keeps smiling" pointed at a faceless blob that cannot smile. Built out with
    // the same torso/head/hair/legs/arms construction the named characters use so each presence
    // reads as an actual figure. tall-man keeps an exaggerated, elongated build - a stretched
    // person is more unsettling than a scaled-up blob, and still reads as "impossibly tall" rather
    // than just a bigger shapeless mass.
    const mat = (c: pc.Color, gloss = 0.1): pc.StandardMaterial => {
      const m = new pc.StandardMaterial();
      m.diffuse = c;
      m.gloss = gloss;
      m.update();
      return m;
    };
    const part = (parent: pc.Entity, name: string, type: 'sphere' | 'capsule', pos: pc.Vec3, scale: pc.Vec3, material: pc.StandardMaterial): pc.Entity => {
      const e = new pc.Entity(name);
      e.addComponent('render', { type });
      e.setLocalPosition(pos);
      e.setLocalScale(scale);
      if (e.render) e.render.material = material;
      parent.addChild(e);
      return e;
    };

    const isTall = id === 'tall-man';
    const skin = mat(new pc.Color(0.42, 0.36, 0.32));
    const cloth = mat(color, 0.10);
    const dark = mat(new pc.Color(0.035, 0.04, 0.045));

    const root = new pc.Entity(`AnomalyPresence-${id}`);
    const body = new pc.Entity('body');
    part(body, 'Torso', 'capsule', new pc.Vec3(0, 1.12, 0), new pc.Vec3(0.66, 0.80, 0.44), cloth);
    part(body, 'Head', 'sphere', new pc.Vec3(0, 1.84, 0), new pc.Vec3(0.40, 0.46, 0.40), skin);
    part(body, 'Hair', 'sphere', new pc.Vec3(0, 2.00, -0.01), new pc.Vec3(0.41, 0.20, 0.41), dark);
    part(body, 'LegL', 'capsule', new pc.Vec3(-0.18, 0.47, 0), new pc.Vec3(0.22, 0.60, 0.22), dark);
    part(body, 'LegR', 'capsule', new pc.Vec3(0.18, 0.47, 0), new pc.Vec3(0.22, 0.60, 0.22), dark);
    part(body, 'ArmL', 'capsule', new pc.Vec3(-0.41, 1.16, 0), new pc.Vec3(0.17, 0.60, 0.17), cloth);
    part(body, 'ArmR', 'capsule', new pc.Vec3(0.41, 1.16, 0), new pc.Vec3(0.17, 0.60, 0.17), cloth);
    // A uniform build stretched taller (not wider) keeps every limb anatomically connected while
    // still reading as "impossible height", rather than independently resizing individual parts.
    body.setLocalScale(isTall ? 0.72 : 0.87, isTall ? 1.55 : 0.87, isTall ? 0.72 : 0.87);
    root.addChild(body);
    root.setPosition(position);
    this.ctx.app.root.addChild(root);

    this.transient = root;
    this.transientTimer = seconds;
    this.ctx.state.complete(`anomaly:${id}`);
    this.ctx.ui.showMessage(text, 4200);
  }
}
