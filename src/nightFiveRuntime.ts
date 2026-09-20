import * as pc from 'playcanvas';
import type { BuiltWorld } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

export class NightFiveRuntime {
  private larry?: pc.Entity;
  private spawned = false;
  private dialogueStep = 0;
  private ritualArmed = false;
  private ritualAnnounced = false;

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

    world.interactables.push({
      // Confirmed in-engine: this previously sat at the exact same position as 'n5-coffee' above.
      // With identical position, the aim-target scores tie exactly, and 'n5-coffee' (registered
      // first) always won — permanently shadowing this interactable so the ritual step could never
      // be completed, which blocked every Night 5 ending. Offset within the same coffee counter.
      id: 'n5-ritual-coffee', label: 'keep coffee running', position: new pc.Vec3(6.3, 1.1, 8.75), radius: 2.2, aimRadius: 0.50,
      onInteract: () => this.completeRitualStep('n5-ritual-coffee', 'The brewer stays on. The hum steadies.')
    });
    world.interactables.push({
      id: 'n5-ritual-rear', label: 'secure rear door', position: new pc.Vec3(-0.1, 1.25, -11.1), radius: 2.4, aimRadius: 0.52,
      onInteract: () => this.completeRitualStep('n5-ritual-rear', 'You set the rear deadbolt exactly the way Larry’s notes describe.')
    });
    world.interactables.push({
      id: 'n5-ritual-register', label: 'return to register', position: new pc.Vec3(-4.75, 1.2, 7.7), radius: 2.3, aimRadius: 0.52,
      onInteract: () => this.completeRitualStep('n5-ritual-register', 'You stand behind the counter. The store feels like it is waiting.')
    });
  }

  update(): void {
    const minute = this.state.getGameMinutes();
    if (!this.spawned && minute >= 29 * 60 + 40) this.spawnLarry();

    if (!this.ritualArmed && minute >= 29 * 60 + 55) {
      this.ritualArmed = true;
      this.state.addTask('n5-ritual-coffee', 'Keep the coffee running');
      this.state.addTask('n5-ritual-rear', 'Secure the rear door');
      this.state.addTask('n5-ritual-register', 'Return behind the register');
    }

    if (this.ritualArmed && minute >= 30 * 60 && !this.ritualAnnounced) {
      this.ritualAnnounced = true;
      this.state.complete('five-sixty');
      // The always-visible clock used to keep ticking normally up to a clean "6:00 AM" right next
      // to a message claiming the time is "5:60" - two contradicting clocks on screen at once reads
      // as a UI bug, not a horror beat. Freezing the real clock display on the impossible time
      // (until the ritual is actually finished) makes the wrongness something the player can see
      // continuously instead of being told about it once while the HUD disagrees.
      this.state.setClockOverride('5:60 AM');
      this.ui.flashWarning('5:60 AM', 2600);
      this.ui.showMessage('The clock rolls past 5:59 without reaching six. Finish the routine.', 5200);
    }

    const ritualDone = ['n5-ritual-coffee','n5-ritual-rear','n5-ritual-register'].every((id) => this.state.isComplete(id));
    if (ritualDone && this.state.isComplete('larry-conversation') && !this.state.isComplete('n5-ritual-complete')) {
      this.state.complete('n5-ritual-complete');
      this.state.setClockOverride(null);
      this.ui.flashWarning('SHIFT CHANGE', 1800);
      this.ui.showMessage('Coffee. Door. Counter. Someone is ready to take the shift.', 4200);
      if (this.canUnlockSabotage()) this.state.complete('ending-break-available');
    }
  }

  private completeRitualStep(id: string, text: string): string {
    if (!this.ritualArmed) return 'Not yet. Keep the routine moving.';
    if (!this.state.isComplete(id)) this.state.complete(id);
    this.ui.showMessage(text, 3200);
    return text;
  }

  private canUnlockSabotage(): boolean {
    return this.state.isComplete('n5-larry-file') &&
      this.state.isComplete('n5-ritual-complete') &&
      this.state.isComplete('larry-conversation') &&
      this.state.isComplete('n5-count') &&
      this.state.isComplete('resolved:wrong-door') &&
      this.state.isComplete('resolved:frozen-clock');
  }

  private spawnLarry(): void {
    this.spawned = true;
    // Larry used to be a single bare capsule with no head, limbs or clothing - by far the crudest
    // model in the game despite being the finale character. Rebuilt with the same
    // torso/head/hair/legs/arms construction the other named characters use, kept deliberately plain
    // (gray work shirt, no cap, thin gray hair) so he reads as the store's own long-serving night
    // clerk rather than another customer - never supernatural-looking, still just Larry.
    const mat = (color: pc.Color, gloss = 0.14): pc.StandardMaterial => {
      const m = new pc.StandardMaterial();
      m.diffuse = color;
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

    const skin = mat(new pc.Color(0.58, 0.51, 0.45));
    const shirt = mat(new pc.Color(0.30, 0.31, 0.28), 0.12);
    const pants = mat(new pc.Color(0.10, 0.10, 0.11), 0.10);
    const hair = mat(new pc.Color(0.52, 0.51, 0.49), 0.08);

    const root = new pc.Entity('LarryCase');
    const body = new pc.Entity('LarryBody');
    part(body, 'Torso', 'capsule', new pc.Vec3(0, 1.12, 0), new pc.Vec3(0.70, 0.84, 0.48), shirt);
    part(body, 'Head', 'sphere', new pc.Vec3(0, 1.88, 0), new pc.Vec3(0.42, 0.48, 0.42), skin);
    part(body, 'Hair', 'sphere', new pc.Vec3(0, 2.03, -0.02), new pc.Vec3(0.41, 0.16, 0.41), hair);
    part(body, 'LegL', 'capsule', new pc.Vec3(-0.19, 0.48, 0), new pc.Vec3(0.23, 0.62, 0.23), pants);
    part(body, 'LegR', 'capsule', new pc.Vec3(0.19, 0.48, 0), new pc.Vec3(0.23, 0.62, 0.23), pants);
    part(body, 'ArmL', 'capsule', new pc.Vec3(-0.43, 1.17, 0), new pc.Vec3(0.18, 0.62, 0.18), shirt).setLocalEulerAngles(0, 0, 7);
    part(body, 'ArmR', 'capsule', new pc.Vec3(0.43, 1.17, 0), new pc.Vec3(0.18, 0.62, 0.18), shirt).setLocalEulerAngles(0, 0, -7);
    body.setLocalScale(0.87, 0.87, 0.87);
    root.addChild(body);
    root.setPosition(0, 0, 7.9);
    root.setEulerAngles(0, 180, 0);
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
      if (this.canUnlockSabotage()) this.state.complete('ending-break-available');
    }
    this.ui.showMessage(line, 3600);
    return line;
  }
}
