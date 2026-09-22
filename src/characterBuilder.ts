import * as pc from 'playcanvas';

/**
 * Shared modular low-poly human builder.
 *
 * Pass 1 replaced the old per-file "capsule mannequin" pattern (a pill-shaped torso capsule +
 * sphere head + two capsule legs + two capsule arms, roughly 4.5 heads tall) with a segmented
 * ~7.5-8-head-tall rig. Pass 2 adds the detail needed for it to read as more than a technical base:
 * simple facial planes (brow, nose, shadowed eye sockets, chin already present), a wider clothing
 * vocabulary (jacket/hoodie/flannel/vest/workshirt/T-shirt, jeans/slacks, sneakers/boots), more hair/
 * headwear silhouettes, and a `stretch` control for deliberately taller/leaner presence figures
 * (Tall Man) that reads as intentional rather than a broken scale bug.
 *
 * All geometry stays primitive-composed (box/cylinder/sphere) - license-free, dependency-free,
 * consistent with this codebase's existing rendering approach, no external model files or network
 * fetches involved.
 */

export type BodyBuild = 'slim' | 'average' | 'heavy' | 'lanky';
export type HairStyle = 'short' | 'buzz' | 'bald' | 'cap' | 'trucker_cap' | 'beanie' | 'long' | 'bun';
export type OuterLayer = 'none' | 'jacket' | 'hoodie' | 'flannel' | 'vest' | 'coat' | 'workshirt';
export type PantsStyle = 'jeans' | 'slacks';
export type ShoeStyle = 'sneaker' | 'boot';

export interface HumanAppearance {
  /** Overall height multiplier around the ~1.78m baseline. 1.0 = average adult. */
  heightScale?: number;
  /**
   * Extra anisotropic stretch beyond heightScale: >1 elongates neck/limbs relative to torso for a
   * deliberately unusual presence (Tall Man) without simply scaling the whole figure uniformly
   * (which reads as "everything is bigger" rather than "this figure's proportions are wrong").
   */
  stretch?: number;
  build?: BodyBuild;
  skinTone: pc.Color;
  hairColor: pc.Color;
  hairStyle?: HairStyle;
  shirtColor: pc.Color;
  pantsColor: pc.Color;
  pantsStyle?: PantsStyle;
  shoeColor?: pc.Color;
  shoeStyle?: ShoeStyle;
  /** Outer clothing layer; 'none' leaves just the shirt visible. */
  outerLayer?: OuterLayer;
  jacketColor?: pc.Color;
  /** Secondary accent color: flannel plaid stripe, vest trim, jacket cuffs. */
  accentColor?: pc.Color;
  gloss?: number;
  /** Slight forward head tilt / hunch for older or road-weary characters. */
  posture?: 'upright' | 'stooped';
  /** Skip facial detail (brow/nose/eye sockets) for silhouette-only presence figures. */
  minimalFace?: boolean;
}

const BUILD_WIDTH: Record<BodyBuild, number> = {
  slim: 0.88,
  average: 1.0,
  heavy: 1.22,
  lanky: 0.90
};

const BUILD_LIMB_LENGTH: Record<BodyBuild, number> = {
  slim: 1.0,
  average: 1.0,
  heavy: 0.96,
  lanky: 1.08
};

function mat(color: pc.Color, gloss = 0.16, metalness = 0): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.gloss = gloss;
  m.metalness = metalness;
  m.update();
  return m;
}

function part(
  parent: pc.Entity,
  name: string,
  type: 'box' | 'sphere' | 'cylinder' | 'capsule',
  pos: pc.Vec3,
  scale: pc.Vec3,
  material: pc.StandardMaterial,
  euler?: pc.Vec3
): pc.Entity {
  const e = new pc.Entity(name);
  e.addComponent('render', { type });
  e.setLocalPosition(pos);
  e.setLocalScale(scale);
  if (euler) e.setLocalEulerAngles(euler.x, euler.y, euler.z);
  if (e.render) e.render.material = material;
  parent.addChild(e);
  return e;
}

/**
 * Builds a full low-poly adult human rig under `root` and returns it. `root` should already be
 * added to the scene graph (or added immediately after) at the desired world position, with the
 * figure's feet at local y=0.
 */
export function buildLowPolyHuman(root: pc.Entity, appearance: HumanAppearance): pc.Entity {
  const w = BUILD_WIDTH[appearance.build ?? 'average'];
  const limb = BUILD_LIMB_LENGTH[appearance.build ?? 'average'] * (appearance.stretch ?? 1.0);
  const h = appearance.heightScale ?? 1.0;
  const gloss = appearance.gloss ?? 0.14;
  const stooped = appearance.posture === 'stooped';
  const outer = appearance.outerLayer ?? 'none';

  const skin = mat(appearance.skinTone, 0.10);
  const hair = mat(appearance.hairColor, 0.22);
  const shirt = mat(appearance.shirtColor, gloss);
  const pants = mat(appearance.pantsColor, gloss * (appearance.pantsStyle === 'slacks' ? 0.9 : 0.6));
  const shoes = mat(appearance.shoeColor ?? new pc.Color(0.02, 0.02, 0.022), 0.20);
  const eyeSocket = mat(new pc.Color(appearance.skinTone.r * 0.45, appearance.skinTone.g * 0.42, appearance.skinTone.b * 0.42), 0.05);
  const outerMat = appearance.jacketColor ? mat(appearance.jacketColor, gloss * 0.9) : undefined;
  const accentMat = appearance.accentColor ? mat(appearance.accentColor, gloss * 0.7) : undefined;

  // Baseline layout at h=1 is tuned to land at ~1.78m tall / ~0.22m head height (~8 heads tall).
  const footY = 0.045 * h;
  const shinLen = 0.40 * limb * h;
  const kneeY = footY + shinLen;
  const thighLen = 0.42 * limb * h;
  const hipY = kneeY + thighLen;
  const torsoLen = 0.46 * h;
  const shoulderY = hipY + torsoLen;
  const neckLen = 0.07 * limb * h;
  const headBaseY = shoulderY + neckLen;
  const headH = 0.22 * h;

  const hipWidth = 0.30 * w;
  const shoulderWidth = 0.40 * w;
  const legRadius = 0.075 * w;
  const armRadius = 0.058 * w;
  const isBoot = appearance.shoeStyle === 'boot';

  // Feet (flat boxes, forward-offset so the figure doesn't look like it's balancing on a pin).
  // Boots add a taller ankle collar; sneakers stay low-profile.
  for (const side of [-1, 1] as const) {
    const fx = side * hipWidth * 0.42;
    part(root, side < 0 ? 'FootL' : 'FootR', 'box', new pc.Vec3(fx, footY * 0.5, 0.05 * h), new pc.Vec3(0.11 * w, footY, 0.27 * h), shoes);
    if (isBoot) {
      part(root, side < 0 ? 'BootCollarL' : 'BootCollarR', 'cylinder', new pc.Vec3(fx, footY + 0.09 * h, -0.01 * h), new pc.Vec3(0.115 * w, 0.16 * h, 0.115 * w), shoes);
    }
  }

  // Shins.
  const shinBottomY = isBoot ? footY + 0.13 * h : footY;
  part(root, 'ShinL', 'cylinder', new pc.Vec3(-hipWidth * 0.42, shinBottomY + shinLen / 2, 0), new pc.Vec3(legRadius * 1.7, shinLen, legRadius * 1.7), pants);
  part(root, 'ShinR', 'cylinder', new pc.Vec3(hipWidth * 0.42, shinBottomY + shinLen / 2, 0), new pc.Vec3(legRadius * 1.7, shinLen, legRadius * 1.7), pants);

  // Thighs (slightly wider, tapering toward the hip).
  part(root, 'ThighL', 'cylinder', new pc.Vec3(-hipWidth * 0.40, kneeY + thighLen / 2, 0), new pc.Vec3(legRadius * 2.1, thighLen, legRadius * 2.1), pants);
  part(root, 'ThighR', 'cylinder', new pc.Vec3(hipWidth * 0.40, kneeY + thighLen / 2, 0), new pc.Vec3(legRadius * 2.1, thighLen, legRadius * 2.1), pants);

  // Hips / pelvis block ties the legs into the torso instead of a bare gap.
  part(root, 'Hips', 'box', new pc.Vec3(0, hipY + 0.05 * h, 0), new pc.Vec3(hipWidth * 1.05, 0.11 * h, 0.24 * h), pants);
  // Belt line accent - cheap but reads as "these are actually pants with a waistband".
  part(root, 'Belt', 'box', new pc.Vec3(0, hipY + 0.02 * h, 0), new pc.Vec3(hipWidth * 1.08, 0.03 * h, 0.245 * h), mat(new pc.Color(0.08, 0.07, 0.06), 0.3));

  // Torso as a chunky rectangular block (clothed silhouette) rather than a pill/capsule.
  const torsoEuler = stooped ? new pc.Vec3(6, 0, 0) : undefined;
  const torsoZ = stooped ? -0.02 * h : 0;
  part(root, 'Torso', 'box', new pc.Vec3(0, hipY + torsoLen / 2, torsoZ), new pc.Vec3(shoulderWidth * 0.92, torsoLen, 0.26 * h), shirt, torsoEuler);

  buildOuterLayer(root, outer, outerMat ?? shirt, accentMat, hipY, torsoLen, torsoZ, shoulderWidth, h, torsoEuler, stooped);

  // Neck + head.
  part(root, 'Neck', 'cylinder', new pc.Vec3(0, shoulderY + neckLen / 2, torsoZ * 0.6), new pc.Vec3(0.09 * h, neckLen * 1.4, 0.09 * h), skin);
  const headCenterY = headBaseY + headH / 2;
  const headZ = stooped ? -0.05 * h : 0;
  part(root, 'Head', 'box', new pc.Vec3(0, headCenterY, headZ), new pc.Vec3(0.17 * h, headH, 0.19 * h), skin);
  // Jaw taper suggestion: a slightly narrower lower-front block.
  part(root, 'Jaw', 'box', new pc.Vec3(0, headCenterY - headH * 0.32, headZ + 0.05 * h), new pc.Vec3(0.13 * h, headH * 0.32, 0.11 * h), skin);

  if (!appearance.minimalFace) buildFace(root, skin, eyeSocket, headCenterY, headH, headZ, h);

  buildHair(root, appearance.hairStyle ?? 'short', hair, headCenterY, headH, headZ, h);

  // Arms: shoulder->elbow->wrist, angled slightly inward so they read as hanging at the sides.
  const armTopY = shoulderY - 0.02 * h;
  const upperArmLen = 0.24 * limb * h;
  const foreArmLen = 0.22 * limb * h;
  const armX = shoulderWidth * 0.56;
  const sleeveMat = outer !== 'none' && outer !== 'vest' ? (outerMat ?? shirt) : shirt;
  for (const side of [-1, 1] as const) {
    const sx = side * armX;
    part(root, side < 0 ? 'UpperArmL' : 'UpperArmR', 'cylinder',
      new pc.Vec3(sx, armTopY - upperArmLen / 2, 0), new pc.Vec3(armRadius * 1.7, upperArmLen, armRadius * 1.7),
      sleeveMat, new pc.Vec3(0, 0, side * -4));
    part(root, side < 0 ? 'ForeArmL' : 'ForeArmR', 'cylinder',
      new pc.Vec3(sx * 1.05, armTopY - upperArmLen - foreArmLen / 2, 0.02 * h), new pc.Vec3(armRadius * 1.4, foreArmLen, armRadius * 1.4),
      shirt, new pc.Vec3(4, 0, side * -2));
    part(root, side < 0 ? 'HandL' : 'HandR', 'box',
      new pc.Vec3(sx * 1.08, armTopY - upperArmLen - foreArmLen - 0.03 * h, 0.03 * h), new pc.Vec3(0.075 * h, 0.09 * h, 0.06 * h),
      skin);
  }

  return root;
}

function buildOuterLayer(
  root: pc.Entity, outer: OuterLayer, outerMat: pc.StandardMaterial, accentMat: pc.StandardMaterial | undefined,
  hipY: number, torsoLen: number, torsoZ: number, shoulderWidth: number, h: number, torsoEuler: pc.Vec3 | undefined, stooped: boolean
): void {
  if (outer === 'none') return;
  const cy = hipY + torsoLen / 2;
  if (outer === 'vest') {
    // Open vest: two front panels rather than a full wrap, so the shirt shows through the middle.
    part(root, 'VestL', 'box', new pc.Vec3(-shoulderWidth * 0.24, cy, torsoZ - 0.015 * h), new pc.Vec3(shoulderWidth * 0.4, torsoLen * 1.02, 0.29 * h), outerMat, torsoEuler);
    part(root, 'VestR', 'box', new pc.Vec3(shoulderWidth * 0.24, cy, torsoZ - 0.015 * h), new pc.Vec3(shoulderWidth * 0.4, torsoLen * 1.02, 0.29 * h), outerMat, torsoEuler);
    return;
  }
  part(root, 'OuterLayer', 'box', new pc.Vec3(0, cy + 0.01 * h, torsoZ - 0.015 * h), new pc.Vec3(shoulderWidth, torsoLen * 1.04, 0.29 * h), outerMat, torsoEuler);
  if (outer === 'flannel' && accentMat) {
    // A single diagonal accent stripe suggests a plaid pattern without needing a texture.
    const stripe = part(root, 'FlannelStripe', 'box', new pc.Vec3(0.02 * h, cy, torsoZ - 0.017 * h), new pc.Vec3(shoulderWidth * 0.98, 0.05 * h, 0.30 * h), accentMat, torsoEuler);
    stripe.rotateLocal(0, 0, 18);
  }
  if (outer === 'coat') {
    // A longer hem extending past the hips for a coat/overcoat silhouette.
    part(root, 'CoatHem', 'box', new pc.Vec3(0, hipY - 0.06 * h, torsoZ - 0.01 * h), new pc.Vec3(shoulderWidth * 0.98, 0.16 * h, 0.27 * h), outerMat, torsoEuler);
  }
  if (outer === 'hoodie') {
    // Hood resting on the upper back/shoulders.
    part(root, 'Hood', 'box', new pc.Vec3(0, cy + torsoLen * 0.42, torsoZ - 0.10 * h - (stooped ? 0.03 * h : 0)), new pc.Vec3(shoulderWidth * 0.5, 0.16 * h, 0.16 * h), outerMat);
  }
  if ((outer === 'jacket' || outer === 'workshirt') && accentMat) {
    // Chest pocket detail.
    part(root, 'ChestPocket', 'box', new pc.Vec3(shoulderWidth * 0.20, cy + torsoLen * 0.18, torsoZ - 0.017 * h), new pc.Vec3(0.09 * h, 0.09 * h, 0.01 * h), accentMat, torsoEuler);
  }
}

function buildFace(root: pc.Entity, skin: pc.StandardMaterial, eyeSocket: pc.StandardMaterial, headCenterY: number, headH: number, headZ: number, h: number): void {
  const frontZ = headZ + 0.095 * h;
  // Brow ridge: a thin horizontal bar suggesting where the eyebrows sit.
  part(root, 'Brow', 'box', new pc.Vec3(0, headCenterY + headH * 0.06, frontZ - 0.005 * h), new pc.Vec3(0.15 * h, 0.02 * h, 0.02 * h), skin);
  // Shadowed eye sockets: two small dark inset patches just below the brow.
  for (const side of [-1, 1] as const) {
    part(root, side < 0 ? 'EyeSocketL' : 'EyeSocketR', 'box',
      new pc.Vec3(side * 0.045 * h, headCenterY + headH * 0.02, frontZ - 0.002 * h),
      new pc.Vec3(0.045 * h, 0.025 * h, 0.012 * h), eyeSocket);
  }
  // Nose: a small forward-projecting wedge.
  part(root, 'Nose', 'box', new pc.Vec3(0, headCenterY - headH * 0.05, frontZ + 0.02 * h), new pc.Vec3(0.04 * h, 0.06 * h, 0.045 * h), skin);
  // Mouth hint: a thin darker line beneath the nose.
  part(root, 'Mouth', 'box', new pc.Vec3(0, headCenterY - headH * 0.18, frontZ), new pc.Vec3(0.07 * h, 0.012 * h, 0.01 * h), eyeSocket);
}

function buildHair(root: pc.Entity, style: HairStyle, hairMat: pc.StandardMaterial, headCenterY: number, headH: number, headZ: number, h: number): void {
  if (style === 'bald') return;
  const topY = headCenterY + headH * 0.30;
  if (style === 'cap' || style === 'trucker_cap') {
    part(root, 'Hair', 'sphere', new pc.Vec3(0, topY - 0.01 * h, headZ - 0.01 * h), new pc.Vec3(0.185 * h, 0.10 * h, 0.20 * h), hairMat);
    if (style === 'trucker_cap') {
      part(root, 'CapBrim', 'box', new pc.Vec3(0, topY - 0.03 * h, headZ + 0.15 * h), new pc.Vec3(0.16 * h, 0.02 * h, 0.10 * h), hairMat);
    }
    return;
  }
  if (style === 'beanie') {
    part(root, 'Hair', 'sphere', new pc.Vec3(0, topY - 0.005 * h, headZ - 0.01 * h), new pc.Vec3(0.19 * h, 0.13 * h, 0.20 * h), hairMat);
    part(root, 'BeanieBand', 'box', new pc.Vec3(0, topY - 0.09 * h, headZ - 0.01 * h), new pc.Vec3(0.19 * h, 0.035 * h, 0.20 * h), hairMat);
    return;
  }
  if (style === 'long') {
    part(root, 'Hair', 'sphere', new pc.Vec3(0, topY, headZ - 0.02 * h), new pc.Vec3(0.19 * h, 0.14 * h, 0.20 * h), hairMat);
    part(root, 'HairBack', 'box', new pc.Vec3(0, topY - 0.18 * h, headZ - 0.09 * h), new pc.Vec3(0.15 * h, 0.30 * h, 0.06 * h), hairMat);
    return;
  }
  if (style === 'bun') {
    part(root, 'Hair', 'sphere', new pc.Vec3(0, topY, headZ - 0.02 * h), new pc.Vec3(0.185 * h, 0.11 * h, 0.19 * h), hairMat);
    part(root, 'HairBun', 'sphere', new pc.Vec3(0, topY + 0.06 * h, headZ - 0.10 * h), new pc.Vec3(0.09 * h, 0.09 * h, 0.09 * h), hairMat);
    return;
  }
  if (style === 'buzz') {
    part(root, 'Hair', 'sphere', new pc.Vec3(0, topY - 0.015 * h, headZ - 0.01 * h), new pc.Vec3(0.175 * h, 0.09 * h, 0.185 * h), hairMat);
    return;
  }
  // 'short' default.
  part(root, 'Hair', 'sphere', new pc.Vec3(0, topY - 0.005 * h, headZ - 0.01 * h), new pc.Vec3(0.185 * h, 0.115 * h, 0.195 * h), hairMat);
}
