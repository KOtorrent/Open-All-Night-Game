import * as pc from 'playcanvas';
import type { BuiltWorld } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

export class NightFourRuntime {
  constructor(world: BuiltWorld, private readonly state: GameState, private readonly ui: GameUI) {
    const add = (id: string, label: string, pos: pc.Vec3, text: string) => world.interactables.push({
      id, label, position: pos, radius: 2.25, aimRadius: 0.52,
      onInteract: () => {
        if (!this.state.isComplete(id)) this.state.complete(id);
        this.ui.showMessage(text, 3400);
        return text;
      }
    });

    add('n4-review-rules', 'compare notebook pages', new pc.Vec3(-5.1, 1.1, 7.9), 'The new page contradicts the older handwriting in two places.');
    add('n4-camera-check', 'verify cameras 4 and 6', new pc.Vec3(-7.6, 1.3, -9.55), 'Camera 4 and Camera 6 disagree by eleven seconds.');
    add('n4-trash', 'check rear trash route', new pc.Vec3(-9.2, 1.0, -10.4), 'Camera 6 is clear. The real rear lot is not.');
    add('n4-daniel-note', 'read Daniel’s corrected note', new pc.Vec3(-7.35, 1.35, -9.3), 'Daniel underlined one sentence: THE RULES CAN LIE. THE ROUTINE DOESN’T.');

    world.interactables.push({
      id: 'n4-rule-verification',
      label: 'mark suspicious rule', position: new pc.Vec3(-5.0, 1.05, 7.75), radius: 2.2, aimRadius: 0.46,
      onInteract: () => {
        const verified = this.state.isComplete('n4-camera-check') && this.state.isComplete('n4-review-rules');
        if (!verified) return 'You need another source before deciding which rule is false.';
        this.state.complete('n4-rule-verified');
        this.ui.flashWarning('RULE VERIFIED', 1400);
        return 'The altered rule does not match the old notes or the cameras. You cross it out.';
      }
    });
  }
}
