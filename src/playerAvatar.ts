import * as pc from 'playcanvas';
import type { PlayerController } from './playerController';

function mat(color: pc.Color, gloss = 0.16): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.gloss = gloss;
  m.update();
  return m;
}

function primitive(parent: pc.Entity, name: string, type: 'box' | 'sphere' | 'cylinder' | 'capsule', pos: pc.Vec3, scale: pc.Vec3, material: pc.StandardMaterial): pc.Entity {
  const e = new pc.Entity(name);
  e.addComponent('render', { type });
  e.setLocalPosition(pos);
  e.setLocalScale(scale);
  if (e.render) e.render.material = material;
  parent.addChild(e);
  return e;
}

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

    const shirt = mat(new pc.Color(0.075, 0.12, 0.14));
    const pants = mat(new pc.Color(0.035, 0.04, 0.045));
    const skin = mat(new pc.Color(0.52, 0.40, 0.31), 0.12);
    const shoes = mat(new pc.Color(0.018, 0.02, 0.02), 0.10);

    primitive(this.root, 'PlayerTorso', 'capsule', new pc.Vec3(0, 1.03, 0), new pc.Vec3(0.58, 0.72, 0.40), shirt);
    primitive(this.root, 'PlayerHead', 'sphere', new pc.Vec3(0, 1.56, 0.08), new pc.Vec3(0.34, 0.38, 0.34), skin);
    primitive(this.root, 'PlayerLegL', 'capsule', new pc.Vec3(-0.16, 0.43, 0), new pc.Vec3(0.19, 0.55, 0.19), pants);
    primitive(this.root, 'PlayerLegR', 'capsule', new pc.Vec3(0.16, 0.43, 0), new pc.Vec3(0.19, 0.55, 0.19), pants);
    primitive(this.root, 'PlayerArmL', 'capsule', new pc.Vec3(-0.36, 1.03, 0), new pc.Vec3(0.14, 0.54, 0.14), shirt).setLocalEulerAngles(0, 0, 5);
    primitive(this.root, 'PlayerArmR', 'capsule', new pc.Vec3(0.36, 1.03, 0), new pc.Vec3(0.14, 0.54, 0.14), shirt).setLocalEulerAngles(0, 0, -5);
    primitive(this.root, 'PlayerShoeL', 'box', new pc.Vec3(-0.16, 0.10, -0.08), new pc.Vec3(0.20, 0.13, 0.34), shoes);
    primitive(this.root, 'PlayerShoeR', 'box', new pc.Vec3(0.16, 0.10, -0.08), new pc.Vec3(0.20, 0.13, 0.34), shoes);

    app.root.addChild(this.root);
    this.update();
  }

  update(): void {
    const cameraPos = this.player.getPosition();
    this.root.setPosition(cameraPos.x, 0, cameraPos.z);
    this.root.setEulerAngles(0, this.player.getYaw(), 0);
  }
}
