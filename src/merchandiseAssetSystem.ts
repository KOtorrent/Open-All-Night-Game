import * as pc from 'playcanvas';
import { AssetRegistry } from './assetRegistry';
import type { MerchandiseSlot } from './gameTypes';
import { PackagingLabelSystem } from './packagingLabelSystem';

// Graphics overhaul Pass 5: authored low-poly product meshes (box/carton/bag/bottle/bread),
// vendored locally from Kenney's CC0 "Mini Market" pack - see docs/ASSET_SOURCES.md and
// docs/PASS5_MERCHANDISE_ASSET_REVIEW.md for full provenance/license record. No runtime dependency
// on any third-party host: these ship in public/assets/ and load same-origin in production.
const MERCHANDISE_BASE = '/assets/merchandise/kenney-mini-market';
// Graphics overhaul Pass 6: fills the Pass 5-documented can-shaped gap. Kenney's Mini Market pack
// genuinely has no can model (confirmed against the FULL original pack this time, not just a
// mirrored subset - see docs/PASS5_MERCHANDISE_ASSET_REVIEW.md's Phase 5 update), but Kenney's
// separate "Food Kit" (same CC0 license, same shorepine/kenney mirror) has `soda-can.glb` and
// `candy-bar-wrapper.glb` - both single-object files, vendored the same way as the Pass 5 assets.
const FOOD_BASE = '/assets/merchandise/kenney-food';

/** Same pattern as authoredRetailAssetSystem.ts's retint() - discards the source pack's own bright
 * shared-atlas coloring and replaces it with one of this game's own dark commercial materials,
 * which is how a handful of meshes become "multiple fictional variants" per the brief. */
function retint(entity: pc.Entity, color: pc.Color, metalness: number, gloss: number): void {
  const material = new pc.StandardMaterial();
  material.diffuse = color;
  material.metalness = metalness;
  material.gloss = gloss;
  material.update();
  const renders = entity.findComponents('render') as pc.RenderComponent[];
  for (const render of renders) {
    for (const meshInstance of render.meshInstances) {
      meshInstance.material = material;
    }
  }
}

export type ProductKind = 'box' | 'carton' | 'bag' | 'bottle' | 'bread' | 'can' | 'candyBar';

interface HarvestSpec {
  assetId: string;
  url: string;
  /** [glTF node name, target ProductKind] pairs to pull out of this container. */
  nodes: Array<[string, ProductKind]>;
}

const SPECS: HarvestSpec[] = [
  { assetId: 'merch-shelf-boxes', url: `${MERCHANDISE_BASE}/shelf-boxes.glb`, nodes: [['carton', 'carton'], ['box', 'box']] },
  { assetId: 'merch-shelf-bags', url: `${MERCHANDISE_BASE}/shelf-bags.glb`, nodes: [['bag', 'bag']] },
  { assetId: 'merch-shelf-end', url: `${MERCHANDISE_BASE}/shelf-end.glb`, nodes: [['bottle', 'bottle'], ['carton', 'carton']] },
  { assetId: 'merch-display-bread', url: `${MERCHANDISE_BASE}/display-bread.glb`, nodes: [['bread', 'bread']] },
  { assetId: 'merch-soda-can', url: `${FOOD_BASE}/soda-can.glb`, nodes: [['soda-can', 'can']] },
  { assetId: 'merch-candy-wrapper', url: `${FOOD_BASE}/candy-bar-wrapper.glb`, nodes: [['candy-bar-wrapper', 'candyBar']] }
];

/**
 * Loads a small set of authored Kenney product meshes once at startup, harvests the individual
 * named product nodes out of each multi-object source file, and hands out cheap clones on request
 * so callers (storeBuilder.ts, customerShoppingSystem.ts) can swap a primitive box/cylinder for a
 * real modeled product without this system knowing anything about shelves, aisles or gameplay.
 * Fully optional at every call site: if loading fails (offline, blocked host, missing files) or
 * hasn't finished yet, createProduct() returns null and every caller falls back to its own existing
 * primitive geometry - this system can never be the reason a shelf renders empty.
 */
export class MerchandiseAssetSystem {
  private readonly app: pc.Application;
  private readonly registry: AssetRegistry;
  private readonly templates = new Map<ProductKind, pc.Entity[]>();
  private ready = false;
  private failed = false;
  private readonly packaging?: PackagingLabelSystem;

  constructor(app: pc.Application, packaging?: PackagingLabelSystem) {
    this.app = app;
    this.packaging = packaging;
    this.registry = new AssetRegistry(app);
    for (const spec of SPECS) this.registry.register({ id: spec.assetId, url: spec.url });
  }

  async start(): Promise<void> {
    try {
      await this.registry.preloadMany(SPECS.map((s) => s.assetId));
    } catch (e) {
      // Offline, host blocked, or files not yet vendored - every caller already has a primitive
      // fallback, so this is a quiet degrade, not a broken build.
      console.warn('MerchandiseAssetSystem: authored product meshes unavailable, primitives remain in use', e);
      this.failed = true;
      return;
    }

    const staging = new pc.Entity('MerchandiseAssetStaging');
    staging.enabled = false;
    this.app.root.addChild(staging);

    for (const spec of SPECS) {
      const root = await this.registry.instantiate(spec.assetId, staging);
      for (const [nodeName, kind] of spec.nodes) {
        let matches = root.find('name', nodeName) as pc.Entity[];
        // Pass 6: single-object glTF files (soda-can.glb, candy-bar-wrapper.glb) have exactly one
        // scene node, and that node IS the container root - but AssetRegistry.instantiate() always
        // renames the root entity to the asset id before this harvest runs, so the node's own name
        // (which is what spec.nodes references) never survives to be found as a descendant. Multi-
        // object files (shelf-boxes.glb etc.) are unaffected: their target nodes are children of the
        // renamed root, not the root itself.
        if (!matches.length && spec.nodes.length === 1 && root.findComponent('render')) {
          matches = [root];
        }
        if (!matches.length) continue;
        const list = this.templates.get(kind) ?? [];
        list.push(...matches);
        this.templates.set(kind, list);
      }
    }

    this.ready = true;
  }

  isReady(): boolean {
    return this.ready;
  }

  /** True once loading has failed or definitively has nothing for this kind - lets a caller stop
   * asking (and stop paying the .clone() attempt cost) instead of calling every frame/spawn. */
  hasNothingFor(kind: ProductKind): boolean {
    return this.failed || (this.ready && !this.templates.get(kind)?.length);
  }

  /**
   * Returns a freshly cloned, tinted product mesh, or null if this system isn't ready/has no
   * mesh for this kind - callers must handle null by using their existing primitive geometry.
   * `variantIndex` cycles deterministically through the available source nodes for that kind
   * (matches the rest of the codebase's modulo-cycling convention rather than randomizing).
   */
  createProduct(
    kind: ProductKind,
    variantIndex: number,
    color: pc.Color,
    metalness = 0,
    gloss = 0.22,
    category?: string
  ): pc.Entity | null {
    const list = this.templates.get(kind);
    if (!list || list.length === 0) return null;
    const template = list[((variantIndex % list.length) + list.length) % list.length];
    const clone = template.clone() as pc.Entity;
    clone.enabled = true;

    // Graphics overhaul Pass 6: prefer real fictional packaging art over the Pass 5 flat tint
    // whenever the atlas system is ready and has a brand for this product kind/category. Falls
    // back to the original flat-color retint() for kinds the packaging system doesn't cover
    // (currently 'bread') or if the atlas failed to load - never a broken/untextured product.
    const brand = this.packaging?.isReady() ? this.packaging.pickBrand(kind, category, variantIndex) : null;
    if (brand && this.packaging) {
      this.packaging.applyToAuthoredProduct(clone, kind, brand);
    } else {
      retint(clone, color, metalness, gloss);
    }
    return clone;
  }
}

/**
 * Walks every slot storeBuilder.ts registered and, wherever an authored mesh exists for that
 * slot's kind, disables the primitive(s) and drops a tinted authored clone in their place at the
 * same world position. Slots with no matching authored mesh are left completely untouched (the
 * primitive stays visible and active) - this function can be called with a system that only
 * loaded some categories (e.g. offline testing with a partial local vendor) without breaking
 * anything.
 */
export function applyMerchandiseVisuals(app: pc.Application, slots: MerchandiseSlot[], merch: MerchandiseAssetSystem): number {
  let swapped = 0;
  for (const slot of slots) {
    if (merch.hasNothingFor(slot.kind)) continue;
    const clone = merch.createProduct(slot.kind, slot.variantIndex, slot.color, 0, 0.22, slot.category);
    if (!clone) continue;

    // The harvested Kenney nodes are all modeled with their local origin at the mesh's own BASE
    // (confirmed by inspecting each accessor's bounding box before vendoring: Y ranges 0..height,
    // never -height/2..height/2), unlike this codebase's primitive boxes/cylinders which are
    // centered on their position. Reading the primitive's own world-space AABB minimum instead of
    // its raw position (a center point) is what keeps the authored clone standing on the shelf
    // instead of floating half-height too high.
    const render = slot.entity.findComponent('render') as pc.RenderComponent | null;
    const aabb = render?.meshInstances[0]?.aabb;
    const worldPos = slot.entity.getPosition().clone();
    if (aabb) {
      worldPos.x = aabb.center.x;
      worldPos.y = aabb.getMin().y;
      worldPos.z = aabb.center.z;
    }
    slot.entity.enabled = false;
    if (slot.secondaryEntity) slot.secondaryEntity.enabled = false;
    if (slot.extraEntities) for (const extra of slot.extraEntities) extra.enabled = false;

    clone.setPosition(worldPos);
    clone.setEulerAngles(0, slot.yaw, 0);
    clone.setLocalScale(slot.scale, slot.scale, slot.scale);
    app.root.addChild(clone);
    swapped++;
  }
  return swapped;
}
