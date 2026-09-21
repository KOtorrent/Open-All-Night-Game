import * as pc from 'playcanvas';

/**
 * Shared, reusable material library backed by small (128-256px) locally-generated textures under
 * public/textures/generated/ (see docs/VISUAL_STYLE_BIBLE.md for the material language these map
 * to, and docs/ASSET_SOURCES.md for provenance - every file here is procedurally authored for this
 * repository, not sourced externally). One StandardMaterial instance is created per named surface
 * and reused everywhere that surface appears, instead of the old one-off flat-color-per-object
 * pattern, keeping draw calls/materials low per the graphics overhaul's performance requirements.
 *
 * Textures load synchronously-enough for scene construction: PlayCanvas texture assets set with
 * `preload: true` and consumed via `app.assets.load` + awaiting completion before any material is
 * handed out. Callers that build the scene during startup should `await MaterialLibrary.ready()`
 * once, before using `.get()`.
 */

export type SurfaceId =
  | 'asphalt' | 'concrete' | 'painted_metal_pump_red' | 'painted_metal_shelving'
  | 'brushed_steel' | 'cooler_metal' | 'vinyl_floor' | 'off_white_wall' | 'drywall_office'
  | 'ceiling_tile' | 'cases_brand_panel' | 'laminate_counter' | 'restroom_tile' | 'cardboard'
  | 'paper' | 'generic_label_red' | 'generic_label_green' | 'generic_label_blue' | 'generic_label_gold'
  | 'sky_gradient'
  | 'pump_number_1' | 'pump_number_2' | 'pump_number_3' | 'pump_number_4'
  | 'pump_number_5' | 'pump_number_6' | 'pump_number_7' | 'pump_number_8';

interface SurfaceSpec {
  file: string;
  tint?: pc.Color;
  gloss?: number;
  metalness?: number;
  tiling?: [number, number];
  /** Renders purely from the texture's own color regardless of scene lighting (for the sky backdrop). */
  emissiveOnly?: boolean;
}

const SPECS: Record<SurfaceId, SurfaceSpec> = {
  asphalt: { file: 'asphalt.png', gloss: 0.08, tiling: [10, 10] },
  concrete: { file: 'concrete.png', gloss: 0.10, tiling: [6, 6] },
  painted_metal_pump_red: { file: 'painted_metal_pump_red.png', gloss: 0.32, metalness: 0.25, tiling: [1, 1] },
  painted_metal_shelving: { file: 'painted_metal_shelving.png', gloss: 0.26, metalness: 0.2, tiling: [2, 2] },
  brushed_steel: { file: 'brushed_steel.png', gloss: 0.55, metalness: 0.75, tiling: [2, 2] },
  cooler_metal: { file: 'cooler_metal.png', gloss: 0.42, metalness: 0.55, tiling: [2, 1] },
  vinyl_floor: { file: 'vinyl_floor.png', gloss: 0.18, tiling: [5, 5] },
  off_white_wall: { file: 'off_white_wall.png', gloss: 0.08, tiling: [4, 2] },
  drywall_office: { file: 'drywall_office.png', gloss: 0.06, tiling: [3, 2] },
  ceiling_tile: { file: 'ceiling_tile.png', gloss: 0.06, tiling: [6, 4] },
  cases_brand_panel: { file: 'cases_brand_panel.png', gloss: 0.30, tiling: [2, 1] },
  laminate_counter: { file: 'laminate_counter.png', gloss: 0.34, tiling: [3, 1] },
  restroom_tile: { file: 'restroom_tile.png', gloss: 0.22, tiling: [3, 3] },
  cardboard: { file: 'cardboard.png', gloss: 0.05, tiling: [1, 1] },
  paper: { file: 'paper.png', gloss: 0.08, tiling: [1, 1] },
  generic_label_red: { file: 'generic_label_red.png', gloss: 0.20, tiling: [1, 1] },
  generic_label_green: { file: 'generic_label_green.png', gloss: 0.20, tiling: [1, 1] },
  generic_label_blue: { file: 'generic_label_blue.png', gloss: 0.20, tiling: [1, 1] },
  generic_label_gold: { file: 'generic_label_gold.png', gloss: 0.20, tiling: [1, 1] },
  sky_gradient: { file: 'sky_gradient.png', gloss: 0, tiling: [1, 1], emissiveOnly: true },
  pump_number_1: { file: 'pump_number_1.png', gloss: 0.15, tiling: [1, 1] },
  pump_number_2: { file: 'pump_number_2.png', gloss: 0.15, tiling: [1, 1] },
  pump_number_3: { file: 'pump_number_3.png', gloss: 0.15, tiling: [1, 1] },
  pump_number_4: { file: 'pump_number_4.png', gloss: 0.15, tiling: [1, 1] },
  pump_number_5: { file: 'pump_number_5.png', gloss: 0.15, tiling: [1, 1] },
  pump_number_6: { file: 'pump_number_6.png', gloss: 0.15, tiling: [1, 1] },
  pump_number_7: { file: 'pump_number_7.png', gloss: 0.15, tiling: [1, 1] },
  pump_number_8: { file: 'pump_number_8.png', gloss: 0.15, tiling: [1, 1] }
};

export class MaterialLibrary {
  private readonly app: pc.Application;
  private readonly materials = new Map<SurfaceId, pc.StandardMaterial>();
  private readonly textures = new Map<string, pc.Texture>();
  private readonly variants = new Map<string, pc.StandardMaterial>();
  private loaded = false;

  constructor(app: pc.Application) {
    this.app = app;
  }

  async ready(): Promise<void> {
    if (this.loaded) return;
    const ids = Object.keys(SPECS) as SurfaceId[];
    await Promise.all(ids.map((id) => this.loadOne(id)));
    this.loaded = true;
  }

  private async loadOne(id: SurfaceId): Promise<void> {
    const spec = SPECS[id];
    const texture = await this.loadTexture(spec.file);
    const mat = new pc.StandardMaterial();
    if (spec.emissiveOnly) {
      mat.diffuse = new pc.Color(0, 0, 0);
      mat.emissiveMap = texture;
      mat.emissive = new pc.Color(1, 1, 1);
      mat.emissiveIntensity = 1;
    } else {
      mat.diffuseMap = texture;
    }
    if (spec.tiling) {
      mat.diffuseMapTiling = new pc.Vec2(spec.tiling[0], spec.tiling[1]);
      mat.emissiveMapTiling = new pc.Vec2(spec.tiling[0], spec.tiling[1]);
    }
    if (spec.tint) mat.diffuse = spec.tint;
    mat.gloss = spec.gloss ?? 0.15;
    mat.metalness = spec.metalness ?? 0;
    mat.update();
    this.materials.set(id, mat);
  }

  private loadTexture(file: string): Promise<pc.Texture> {
    const cached = this.textures.get(file);
    if (cached) return Promise.resolve(cached);
    return new Promise((resolve, reject) => {
      const asset = new pc.Asset(file, 'texture', { url: `/textures/generated/${file}` });
      asset.on('load', () => {
        const tex = asset.resource as pc.Texture;
        tex.addressU = pc.ADDRESS_REPEAT;
        tex.addressV = pc.ADDRESS_REPEAT;
        this.textures.set(file, tex);
        resolve(tex);
      });
      asset.on('error', (err: unknown) => reject(err instanceof Error ? err : new Error(`Failed to load ${file}`)));
      this.app.assets.add(asset);
      this.app.assets.load(asset);
    });
  }

  /** Returns the shared default-tiling material for a surface. Call after `ready()` resolves. */
  get(id: SurfaceId): pc.StandardMaterial {
    const mat = this.materials.get(id);
    if (!mat) throw new Error(`MaterialLibrary.get('${id}') called before ready()`);
    return mat;
  }

  /**
   * PlayCanvas primitive meshes bake UVs at a fixed 0..1 range per face; an entity's `localScale`
   * stretches vertex positions but not those UVs, so one shared material's fixed tiling would smear
   * a tiny 256px texture across a 20x24m floor as a single giant blurry copy. This returns a
   * variant that reuses the *same loaded texture* (no extra load, same GPU memory) with tiling sized
   * for a specific surface's world dimensions, cached by id+tiling so repeated calls for
   * same-sized objects (e.g. every pump island) share one instance rather than creating a new
   * material each time.
   */
  getTiled(id: SurfaceId, worldWidth: number, worldHeight: number, repeatsPerMeter = 0.6): pc.StandardMaterial {
    const tx = Math.max(1, Math.round(worldWidth * repeatsPerMeter));
    const ty = Math.max(1, Math.round(worldHeight * repeatsPerMeter));
    const key = `${id}@${tx}x${ty}`;
    const cached = this.variants.get(key);
    if (cached) return cached;
    const base = this.get(id);
    const mat = new pc.StandardMaterial();
    mat.diffuseMap = base.diffuseMap;
    mat.diffuseMapTiling = new pc.Vec2(tx, ty);
    mat.gloss = base.gloss;
    mat.metalness = base.metalness;
    mat.update();
    this.variants.set(key, mat);
    return mat;
  }
}
