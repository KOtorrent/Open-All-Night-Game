import * as pc from 'playcanvas';
import type { PlayerController } from './playerController';

function mat(color: pc.Color, metalness = 0, gloss = 0.2, opacity = 1): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.metalness = metalness;
  m.gloss = gloss;
  if (opacity < 1) {
    m.opacity = opacity;
    m.blendType = pc.BLEND_NORMAL;
    m.depthWrite = false;
  }
  m.update();
  return m;
}

/**
 * Gives the front entrance a physical automatic glass door instead of an empty collision opening.
 * The door reacts to the player and all current Night 1 customer roots without owning any gameplay
 * state, so customer systems remain independent.
 */
export class FrontDoorSystem {
  private readonly app: pc.Application;
  private readonly player: PlayerController;
  private readonly pivot: pc.Entity;
  private angle = 0;
  private targetAngle = 0;

  private readonly actorNames = [
    'Earl-Regular-Customer',
    'Silent-Customer',
    'Jenna-Regular',
    'LateNightTraveler',
    'Dale',
    'Marcus-Regular'
  ];

  constructor(app: pc.Application, player: PlayerController) {
    this.app = app;
    this.player = player;

    const frameMat = mat(new pc.Color(0.14, 0.15, 0.15), 0.72, 0.42);
    const glassMat = mat(new pc.Color(0.20, 0.30, 0.32), 0.05, 0.70, 0.23);
    const pushMat = mat(new pc.Color(0.34, 0.35, 0.33), 0.82, 0.54);

    this.pivot = new pc.Entity('FrontDoorPivot');
    this.pivot.setPosition(-0.92, 0, 11.79);
    app.root.addChild(this.pivot);

    const glass = new pc.Entity('FrontDoorGlass');
    glass.addComponent('render', { type: 'box' });
    glass.setLocalPosition(0.92, 1.30, 0);
    glass.setLocalScale(1.78, 2.58, 0.055);
    if (glass.render) glass.render.material = glassMat;
    this.pivot.addChild(glass);

    const leftRail = new pc.Entity('FrontDoorLeftRail');
    leftRail.addComponent('render', { type: 'box' });
    leftRail.setLocalPosition(0.06, 1.30, 0);
    leftRail.setLocalScale(0.075, 2.66, 0.075);
    if (leftRail.render) leftRail.render.material = frameMat;
    this.pivot.addChild(leftRail);

    const rightRail = new pc.Entity('FrontDoorRightRail');
    rightRail.addComponent('render', { type: 'box' });
    rightRail.setLocalPosition(1.79, 1.30, 0);
    rightRail.setLocalScale(0.075, 2.66, 0.075);
    if (rightRail.render) rightRail.render.material = frameMat;
    this.pivot.addChild(rightRail);

    for (const y of [0.05, 2.57]) {
      const rail = new pc.Entity(`FrontDoorRail-${y}`);
      rail.addComponent('render', { type: 'box' });
      rail.setLocalPosition(0.92, y, 0);
      rail.setLocalScale(1.84, 0.075, 0.075);
      if (rail.render) rail.render.material = frameMat;
      this.pivot.addChild(rail);
    }

    const push = new pc.Entity('FrontDoorPushBar');
    push.addComponent('render', { type: 'box' });
    push.setLocalPosition(1.05, 1.08, -0.07);
    push.setLocalScale(0.96, 0.07, 0.07);
    if (push.render) push.render.material = pushMat;
    this.pivot.addChild(push);
  }

  update(dt: number): void {
    this.targetAngle = this.shouldOpen() ? -78 : 0;
    const speed = this.targetAngle === 0 ? 115 : 165;
    const delta = this.targetAngle - this.angle;
    const step = Math.sign(delta) * Math.min(Math.abs(delta), speed * dt);
    this.angle += step;
    this.pivot.setLocalEulerAngles(0, this.angle, 0);
  }

  private shouldOpen(): boolean {
    const playerPos = this.player.getPosition();
    if (Math.abs(playerPos.x) < 2.1 && playerPos.z > 9.6 && playerPos.z < 14.0) return true;

    for (const name of this.actorNames) {
      const actor = this.app.root.findByName(name) as pc.Entity | null;
      if (!actor?.enabled) continue;
      const pos = actor.getPosition();
      if (Math.abs(pos.x) < 2.2 && pos.z > 9.5 && pos.z < 14.2) return true;
    }
    return false;
  }
}
