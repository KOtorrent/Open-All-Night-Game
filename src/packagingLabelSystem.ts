import * as pc from 'playcanvas';
import type { ProductKind } from './merchandiseAssetSystem';

// Graphics overhaul Pass 6: fictional packaging art. Two 1024x1024 4x4-cell atlases, procedurally
// authored for this repository (not sourced) - see docs/PASS6_PACKAGING_ATLAS.md for the full
// region map and the reasoning for the decal-plane approach (the Pass 5 meshes' own UVs are baked
// into their vertex data via KHR_texture_transform, so remapping them at runtime would mean a
// small mesh-processing pipeline for one asset family - explicitly avoided per the brief).
const ATLAS_BASE = '/assets/merchandise/labels';
const CELL = 0.25; // 1/4 of the atlas per cell, both atlases use the same 4x4 grid

export interface Brand {
  name: string;
  atlas: 1 | 2;
  col: number;
  row: number;
  /** Dominant packaging color - used to retint the underlying mesh body so the decal doesn't sit
   * on a mismatched (e.g. random primitive) base color. */
  baseColor: pc.Color;
}

const SNACK_BRANDS: Brand[] = [
  { name: 'Ridge Crunch', atlas: 1, col: 0, row: 0, baseColor: new pc.Color(0.62, 0.20, 0.08) },
  { name: 'Night Owl', atlas: 1, col: 1, row: 0, baseColor: new pc.Color(0.16, 0.10, 0.24) },
  { name: 'County Crisps', atlas: 1, col: 2, row: 0, baseColor: new pc.Color(0.14, 0.30, 0.15) },
  { name: 'Ridge Crunch BBQ', atlas: 1, col: 3, row: 0, baseColor: new pc.Color(0.55, 0.24, 0.08) },
  { name: 'Ridge Crunch Sour Cream', atlas: 1, col: 0, row: 3, baseColor: new pc.Color(0.18, 0.36, 0.13) },
  { name: 'Night Owl Spicy', atlas: 1, col: 1, row: 3, baseColor: new pc.Color(0.30, 0.18, 0.08) }
];

const BOXED_BRANDS: Brand[] = [
  { name: 'Homestead Pantry Crackers', atlas: 1, col: 0, row: 1, baseColor: new pc.Color(0.72, 0.66, 0.48) },
  { name: 'Quick Meal', atlas: 1, col: 1, row: 1, baseColor: new pc.Color(0.82, 0.87, 0.92) },
  { name: 'Homestead Pantry Cereal', atlas: 1, col: 2, row: 1, baseColor: new pc.Color(0.72, 0.66, 0.48) },
  { name: 'Harvest Table', atlas: 1, col: 3, row: 1, baseColor: new pc.Color(0.78, 0.72, 0.55) },
  { name: 'Quick Meal Value Pack', atlas: 1, col: 2, row: 3, baseColor: new pc.Color(0.85, 0.80, 0.70) }
];

const DRINK_BRANDS: Brand[] = [
  { name: 'Redline Cola', atlas: 2, col: 0, row: 0, baseColor: new pc.Color(0.55, 0.06, 0.06) },
  { name: 'Route 9 Soda', atlas: 2, col: 1, row: 0, baseColor: new pc.Color(0.08, 0.20, 0.38) },
  { name: 'Highbeam Energy', atlas: 2, col: 2, row: 0, baseColor: new pc.Color(0.06, 0.06, 0.06) },
  { name: 'Clear Creek Water', atlas: 2, col: 3, row: 0, baseColor: new pc.Color(0.55, 0.78, 0.88) },
  { name: 'Redline Cola Zero', atlas: 2, col: 0, row: 3, baseColor: new pc.Color(0.08, 0.08, 0.08) },
  { name: 'Highbeam Berry', atlas: 2, col: 1, row: 3, baseColor: new pc.Color(0.20, 0.06, 0.30) }
];

const HOUSEHOLD_BRANDS: Brand[] = [
  { name: 'CleanWay Glass Cleaner', atlas: 2, col: 0, row: 2, baseColor: new pc.Color(0.65, 0.78, 0.88) },
  { name: 'SureWash Laundry', atlas: 2, col: 1, row: 2, baseColor: new pc.Color(0.72, 0.85, 0.70) },
  { name: 'HomeBright All-Purpose', atlas: 2, col: 2, row: 2, baseColor: new pc.Color(0.88, 0.80, 0.55) },
  { name: 'CleanWay Disinfectant', atlas: 2, col: 3, row: 2, baseColor: new pc.Color(0.65, 0.78, 0.88) },
  { name: 'SureWash Dish Soap', atlas: 2, col: 2, row: 3, baseColor: new pc.Color(0.72, 0.85, 0.70) },
  { name: 'HomeBright Paper Towels', atlas: 2, col: 3, row: 3, baseColor: new pc.Color(0.88, 0.80, 0.55) }
];

const CARTON_BRANDS: Brand[] = [
  { name: 'Farmstead Dairy', atlas: 2, col: 2, row: 1, baseColor: new pc.Color(0.90, 0.90, 0.85) },
  { name: 'Farmstead Orchard', atlas: 2, col: 3, row: 1, baseColor: new pc.Color(0.88, 0.82, 0.55) },
  { name: "Case's Bottled Water", atlas: 2, col: 0, row: 1, baseColor: new pc.Color(0.09, 0.23, 0.15) }
];

const CANDY_BRANDS: Brand[] = [
  { name: 'Sweet Stop', atlas: 1, col: 0, row: 2, baseColor: new pc.Color(0.55, 0.10, 0.30) },
  { name: 'Pop Chew', atlas: 1, col: 1, row: 2, baseColor: new pc.Color(0.08, 0.22, 0.37) },
  { name: 'Road Candy', atlas: 1, col: 2, row: 2, baseColor: new pc.Color(0.42, 0.10, 0.10) }
];

/** Sized/positioned per Pass 5's own measured bounding boxes for each harvested Kenney mesh.
 * 'can' (soda-can.glb: radius 0.1123, height 0.3506) and 'candyBar' (candy-bar-wrapper.glb:
 * w0.2924/h0.0812/d0.1169) were measured during Pass 6's own kenney-food vendoring - see
 * docs/PASS6_PACKAGING_ATLAS.md. The can's decal is a wrap-style label centered on its cylinder
 * height rather than a flat front-face plane (a flat decal on a cylinder either floats off the
 * curved surface or clips into it at the edges) - z is pulled in close to the radius so the plane
 * sits just proud of the can body instead of a front-face offset like the other kinds. */
const DECAL_LAYOUT: Partial<Record<ProductKind, { w: number; h: number; y: number; z: number }>> = {
  box: { w: 0.19, h: 0.22, y: 0.15, z: 0.052 },
  carton: { w: 0.12, h: 0.19, y: 0.16, z: 0.079 },
  bag: { w: 0.19, h: 0.10, y: 0.075, z: 0.177 },
  bottle: { w: 0.10, h: 0.15, y: 0.16, z: 0.070 },
  can: { w: 0.18, h: 0.22, y: 0.175, z: 0.106 },
  candyBar: { w: 0.26, h: 0.075, y: 0.041, z: 0.059 }
};

function retint(entity: pc.Entity, color: pc.Color, metalness: number, gloss: number): void {
  const material = new pc.StandardMaterial();
  material.diffuse = color;
  material.metalness = metalness;
  material.gloss = gloss;
  material.update();
  const renders = entity.findComponents('render') as pc.RenderComponent[];
  for (const render of renders) {
    for (const meshInstance of render.meshInstances) meshInstance.material = material;
  }
}

export class PackagingLabelSystem {
  private readonly app: pc.Application;
  private atlas1?: pc.Texture;
  private atlas2?: pc.Texture;
  private ready = false;
  private readonly materialCache = new Map<string, pc.StandardMaterial>();

  constructor(app: pc.Application) {
    this.app = app;
  }

  async start(): Promise<void> {
    try {
      const [t1, t2] = await Promise.all([
        this.loadTexture(`${ATLAS_BASE}/merchandise_atlas_01.png`),
        this.loadTexture(`${ATLAS_BASE}/merchandise_atlas_02.png`)
      ]);
      this.atlas1 = t1;
      this.atlas2 = t2;
      this.ready = true;
    } catch (e) {
      console.warn('PackagingLabelSystem: atlas textures unavailable, products stay unlabeled', e);
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  private loadTexture(url: string): Promise<pc.Texture> {
    return new Promise((resolve, reject) => {
      const asset = new pc.Asset(url, 'texture', { url });
      asset.on('load', () => resolve(asset.resource as pc.Texture));
      asset.on('error', (err: unknown) => reject(err instanceof Error ? err : new Error(`Failed to load ${url}`)));
      this.app.assets.add(asset);
      this.app.assets.load(asset);
    });
  }

  /** Picks a brand for the given product kind + aisle category, matching docs/PASS6_PACKAGING_ATLAS.md's
   * brand/category mapping. Returns null for kinds with no decal treatment (e.g. bread). */
  pickBrand(kind: ProductKind, category: string | undefined, variantIndex: number): Brand | null {
    const idx = ((variantIndex % 1000) + 1000); // guard against negative modulo
    switch (kind) {
      case 'bag': return SNACK_BRANDS[idx % SNACK_BRANDS.length];
      case 'carton': return CARTON_BRANDS[idx % CARTON_BRANDS.length];
      case 'box': {
        const list = category === 'household' ? HOUSEHOLD_BRANDS : BOXED_BRANDS;
        return list[idx % list.length];
      }
      case 'bottle': {
        const list = category === 'household' ? HOUSEHOLD_BRANDS : DRINK_BRANDS;
        return list[idx % list.length];
      }
      case 'can': return DRINK_BRANDS[idx % DRINK_BRANDS.length];
      case 'candyBar': return CANDY_BRANDS[idx % CANDY_BRANDS.length];
      default: return null;
    }
  }

  pickCandyBrand(variantIndex: number): Brand {
    const idx = ((variantIndex % 1000) + 1000);
    return CANDY_BRANDS[idx % CANDY_BRANDS.length];
  }

  private getAtlasMaterial(brand: Brand, gloss: number): pc.StandardMaterial {
    const key = `${brand.atlas}:${brand.col}:${brand.row}:${gloss}`;
    const cached = this.materialCache.get(key);
    if (cached) return cached;
    const tex = brand.atlas === 1 ? this.atlas1 : this.atlas2;
    const mat = new pc.StandardMaterial();
    mat.diffuseMap = tex ?? null;
    mat.diffuseMapTiling = new pc.Vec2(CELL, CELL);
    mat.diffuseMapOffset = new pc.Vec2(brand.col * CELL, brand.row * CELL);
    mat.gloss = gloss;
    mat.metalness = 0;
    mat.cull = pc.CULLFACE_NONE;
    mat.update();
    this.materialCache.set(key, mat);
    return mat;
  }

  /** Retints the authored mesh's body to the brand's packaging color and attaches a small decal
   * plane on its front face sampling the brand's atlas cell. No-op (silently) if the atlas isn't
   * loaded yet or this product kind has no decal layout - the mesh keeps its Pass 5 flat tint. */
  applyToAuthoredProduct(entity: pc.Entity, kind: ProductKind, brand: Brand): void {
    retint(entity, brand.baseColor, 0, 0.20);
    if (!this.ready) return;
    const layout = DECAL_LAYOUT[kind];
    if (!layout) return;
    const decal = new pc.Entity(`Label-${brand.name}`);
    decal.addComponent('render', { type: 'plane' });
    decal.setLocalScale(layout.w, 1, layout.h);
    decal.setLocalPosition(0, layout.y, layout.z);
    decal.setLocalEulerAngles(-90, 0, 0);
    if (decal.render) decal.render.material = this.getAtlasMaterial(brand, 0.10);
    entity.addChild(decal);
  }

  /** For checkout's primitive (non-authored-mesh) candy/gum boxes: samples the atlas directly on
   * the primitive's own default per-face UVs rather than adding a child decal, since a whole extra
   * entity for a tiny checkout item is unnecessary overhead. */
  applyToPrimitive(entity: pc.Entity, brand: Brand): void {
    if (!this.ready) return;
    const render = entity.findComponent('render') as pc.RenderComponent | null;
    if (render) render.material = this.getAtlasMaterial(brand, 0.18);
  }
}
