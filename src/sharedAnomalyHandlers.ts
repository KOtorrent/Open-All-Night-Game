import * as pc from 'playcanvas';
import type { BuiltWorld } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';
import type { AnomalyRuntime } from './anomalyRuntime';
import { buildLowPolyHuman } from './characterBuilder';

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

    // Used to be a single bare capsule with no head or limbs, then (Pass 1) a segmented figure with
    // a uniform non-uniform Y-scale hack for tall-man that stretched the head into a distorted egg
    // shape along with everything else. Now built with the shared low-poly human builder
    // (characterBuilder.ts): each presence gets real facial planes, clothing, and - for tall-man -
    // the dedicated `stretch` control, which elongates only the neck/arms/legs (not the head or
    // torso), so an ordinary-sized head sits atop unnaturally long limbs. That reads as deliberately
    // wrong rather than a scaling bug, per the horror-presence direction: uncanny-human, not
    // creature-heavy.
    const isTall = id === 'tall-man';
    const isSmilingWoman = id === 'smiling-woman';

    const root = new pc.Entity(`AnomalyPresence-${id}`);
    const body = new pc.Entity('body');
    root.addChild(body);

    if (isTall) {
      buildLowPolyHuman(body, {
        heightScale: 1.0,
        stretch: 1.42,
        build: 'slim',
        skinTone: new pc.Color(0.40, 0.35, 0.33),
        hairColor: new pc.Color(0.03, 0.032, 0.035),
        hairStyle: 'bald',
        shirtColor: color,
        pantsColor: new pc.Color(0.035, 0.04, 0.045),
        pantsStyle: 'slacks',
        shoeStyle: 'sneaker',
        outerLayer: 'coat',
        jacketColor: new pc.Color(0.045, 0.05, 0.055),
        gloss: 0.08,
        minimalFace: true
      });
      // Restrained horror-presence upgrade (Pass 2, Phase 6): an abnormally tall figure that stares
      // straight ahead reads as a scaling bug. A deliberate, exaggerated downward head tilt reads as
      // "looking down at you" - a choice, not a glitch. A dim, cool uplight from near the floor (the
      // opposite of how the store's own fixtures light everything else from above) throws his lower
      // half into a slightly wrong shadow without any creature-anatomy tricks.
      const head = body.findByName('Head') as pc.Entity | null;
      head?.setLocalEulerAngles(16, -5, 2);
      const uplight = new pc.Entity('TallManUplight');
      uplight.addComponent('light', { type: 'omni', color: new pc.Color(0.30, 0.36, 0.46), intensity: 0.75, range: 2.4, castShadows: false });
      uplight.setLocalPosition(0, 0.15, 0.25);
      body.addChild(uplight);
    } else if (isSmilingWoman) {
      buildLowPolyHuman(body, {
        heightScale: 1.0,
        build: 'average',
        skinTone: new pc.Color(0.58, 0.46, 0.40),
        hairColor: new pc.Color(0.10, 0.06, 0.04),
        hairStyle: 'long',
        shirtColor: new pc.Color(0.42, 0.35, 0.10),
        pantsColor: new pc.Color(0.10, 0.09, 0.08),
        pantsStyle: 'slacks',
        shoeStyle: 'sneaker',
        // The yellow coat is the point of this anomaly - a bright, ordinary color that stands out
        // precisely because it does not try to blend into the store or the dark.
        outerLayer: 'coat',
        jacketColor: color,
        gloss: 0.16
      });
      // A slight, held head tilt reads as an expression frozen a beat too long, rather than a body
      // pose. A faint warm glow keyed to the coat's own color (not a spotlight) makes her read as
      // slightly lit wrong for the room - brighter than the ambient store light should allow at this
      // distance from any real fixture - without any obvious light source explaining it.
      const head = body.findByName('Head') as pc.Entity | null;
      head?.setLocalEulerAngles(-3, 9, 6);
      const glow = new pc.Entity('SmilingWomanGlow');
      glow.addComponent('light', { type: 'omni', color: new pc.Color(0.66, 0.52, 0.20), intensity: 0.55, range: 2.0, castShadows: false });
      glow.setLocalPosition(0, 1.15, 0.15);
      body.addChild(glow);
    } else {
      buildLowPolyHuman(body, {
        heightScale: 1.0,
        build: 'average',
        skinTone: new pc.Color(0.42, 0.36, 0.32),
        hairColor: new pc.Color(0.035, 0.04, 0.045),
        hairStyle: 'short',
        shirtColor: color,
        pantsColor: new pc.Color(0.035, 0.04, 0.045),
        pantsStyle: 'jeans',
        shoeStyle: 'sneaker',
        outerLayer: 'jacket',
        jacketColor: color,
        gloss: 0.10
      });
    }

    root.setPosition(position);
    this.ctx.app.root.addChild(root);

    this.transient = root;
    this.transientTimer = seconds;
    this.ctx.state.complete(`anomaly:${id}`);
    this.ctx.ui.showMessage(text, 4200);
  }
}
