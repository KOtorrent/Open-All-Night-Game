import * as pc from 'playcanvas';

export interface Collider2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  name?: string;
}

export interface Interactable {
  id: string;
  label: string;
  position: pc.Vec3;
  radius?: number;
  /** Maximum perpendicular distance from the player's center-screen aim ray. */
  aimRadius?: number;
  onInteract: () => string | void;
}

/**
 * Graphics overhaul Pass 5: a primitive product entity storeBuilder.ts is willing to have swapped
 * for an authored mesh once MerchandiseAssetSystem finishes loading. Recording these at
 * construction time (rather than re-discovering them later by name-pattern scanning) keeps
 * storeBuilder.ts the single source of truth for what counts as swappable merchandise.
 */
export interface MerchandiseSlot {
  /** The primitive entity to disable once a real mesh is available. */
  entity: pc.Entity;
  /** A second primitive (e.g. a box's label plane, a bottle's cap) to also disable, if any. */
  secondaryEntity?: pc.Entity;
  kind: 'box' | 'carton' | 'bag' | 'bottle' | 'bread';
  variantIndex: number;
  color: pc.Color;
  /** Local yaw so the authored mesh faces the same way the primitive it replaces did. */
  yaw: number;
  /** Uniform scale applied to the authored mesh to roughly match the primitive's footprint. */
  scale: number;
}

export interface BuiltWorld {
  colliders: Collider2D[];
  interactables: Interactable[];
  spawn: pc.Vec3;
  spawnYaw: number;
  merchandiseSlots: MerchandiseSlot[];
}
