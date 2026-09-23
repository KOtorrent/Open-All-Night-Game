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
  /** Any further primitives (e.g. a can's separate cap + label band) to also disable, if any. */
  extraEntities?: pc.Entity[];
  kind: 'box' | 'carton' | 'bag' | 'bottle' | 'bread' | 'can' | 'candyBar';
  variantIndex: number;
  color: pc.Color;
  /** Local yaw so the authored mesh faces the same way the primitive it replaces did. */
  yaw: number;
  /** Uniform scale applied to the authored mesh to roughly match the primitive's footprint. */
  scale: number;
  /** Graphics overhaul Pass 6: which fictional-brand family this slot draws from (see
   * docs/PASS6_PACKAGING_ATLAS.md). Undefined slots fall back to PackagingLabelSystem's own
   * per-kind default brand list. */
  category?: 'snack' | 'boxed' | 'drink' | 'household' | 'candy';
}

export interface BuiltWorld {
  colliders: Collider2D[];
  interactables: Interactable[];
  spawn: pc.Vec3;
  spawnYaw: number;
  merchandiseSlots: MerchandiseSlot[];
  /** Graphics overhaul Pass 6 Phase 9: checkout candy/gum primitives (register-side impulse rack) -
   * these never get an authored-mesh swap, just a direct packaging-label material once the atlas is
   * ready, applied in main.ts via PackagingLabelSystem.applyToPrimitive(). */
  checkoutCandyEntities: pc.Entity[];
  checkoutGumEntities: pc.Entity[];
}
