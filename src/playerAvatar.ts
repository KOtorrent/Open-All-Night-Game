import * as pc from 'playcanvas';
import type { PlayerController } from './playerController';
import { buildLowPolyHuman } from './characterBuilder';

/**
 * A simple third-person body proxy that follows the FPS camera so security cameras,
 * mirrors later, and other world-space observers can actually see the player.
 * The head is intentionally low-profile and slightly behind the eye point so it
 * does not fill the first-person camera.
 */
export class PlayerAvatar {
  private readonly root: pc.Entity;
  private readonly player: PlayerController;

  constructor(app: pc.Application, player: PlayerController) {
    this.player = player;
    this.root = new pc.Entity('Player-World-Avatar');
    app.root.addChild(this.root);

    buildLowPolyHuman(this.root, {
      build: 'average',
      skinTone: new pc.Color(0.52, 0.40, 0.31),
      hairColor: new pc.Color(0.12, 0.09, 0.07),
      hairStyle: 'short',
      shirtColor: new pc.Color(0.075, 0.12, 0.14),
      pantsColor: new pc.Color(0.035, 0.04, 0.045),
      shoeColor: new pc.Color(0.018, 0.02, 0.02),
      gloss: 0.14
    });

    // Local +Z is "behind" the FPS camera's look direction (local -Z is forward, per
    // playerController's own forward-vector convention). Nudge the head assembly backward so it
    // sits clear of the camera's near clip plane instead of surrounding the lens - the capsule-era
    // avatar relied on the same trick (a +0.08 head offset) for the same reason.
    for (const partName of ['Head', 'Jaw', 'Neck', 'Hair']) {
      const node = this.root.findByName(partName) as pc.Entity | null;
      if (node) node.setLocalPosition(node.getLocalPosition().x, node.getLocalPosition().y, node.getLocalPosition().z + 0.12);
    }

    this.update();
  }

  update(): void {
    const cameraPos = this.player.getPosition();
    this.root.setPosition(cameraPos.x, 0, cameraPos.z);
    this.root.setEulerAngles(0, this.player.getYaw(), 0);
  }
}
