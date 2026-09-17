import * as pc from 'playcanvas';
import { AssetRegistry } from './assetRegistry';

const MARKET_BASE = 'https://raw.githubusercontent.com/intellicia-public/parastore/main/frontend/public/assets/market';

/**
 * Runtime bridge for real authored retail models. The current models are Kenney Mini Market
 * derivatives served from a public MIT repository; original Kenney assets are CC0 and provenance
 * is recorded in docs/ASSET_SOURCES.md.
 *
 * Primitive gameplay geometry remains in place as collision/fallback. Visual placeholder pieces
 * are hidden only after the authored model has loaded successfully. Add ?assets=0 to disable this
 * layer during troubleshooting.
 */
export class AuthoredRetailAssetSystem {
  private readonly app: pc.Application;
  private readonly registry: AssetRegistry;

  constructor(app: pc.Application) {
    this.app = app;
    this.registry = new AssetRegistry(app);

    this.registry.register({ id: 'authored-register', url: `${MARKET_BASE}/cash-register.glb`, scale: 0.95 });
    this.registry.register({ id: 'authored-coolers', url: `${MARKET_BASE}/freezers-standing.glb`, scale: 1.10 });
    this.registry.register({ id: 'authored-shelf-boxes', url: `${MARKET_BASE}/shelf-boxes.glb`, scale: 1.0 });
    this.registry.register({ id: 'authored-shelf-bags', url: `${MARKET_BASE}/shelf-bags.glb`, scale: 1.0 });
    this.registry.register({ id: 'authored-display-bread', url: `${MARKET_BASE}/display-bread.glb`, scale: 1.0 });
    this.registry.register({ id: 'authored-display-fruit', url: `${MARKET_BASE}/display-fruit.glb`, scale: 1.0 });
    this.registry.register({ id: 'authored-bottle-return', url: `${MARKET_BASE}/bottle-return.glb`, scale: 1.0 });
    this.registry.register({ id: 'authored-shelf-end', url: `${MARKET_BASE}/shelf-end.glb`, scale: 1.0 });
    this.registry.register({ id: 'authored-chest-freezer', url: `${MARKET_BASE}/freezer.glb`, scale: 1.0 });
    this.registry.register({ id: 'authored-entry-rug', url: `${MARKET_BASE}/rugRectangle.glb`, scale: 1.0 });
  }

  async start(): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    if (params.get('assets') === '0') {
      console.info('OPEN ALL NIGHT authored asset layer disabled by ?assets=0');
      return;
    }

    await Promise.allSettled([
      this.replaceRegister(),
      this.replaceCoolerVisual(),
      this.addShelfHeroSamples(),
      this.addRetailAccents()
    ]);
  }

  private async replaceRegister(): Promise<void> {
    try {
      const model = await this.registry.instantiate('authored-register', this.app.root, {
        position: new pc.Vec3(-5.0, 1.37, 7.90),
        rotation: new pc.Vec3(0, 180, 0),
        scale: 0.92
      });
      model.name = 'AuthoredRegister';
      this.setNamedVisualsEnabled(['POSBase', 'POSScreen', 'POSKeypad'], false);
      console.info('OPEN ALL NIGHT authored register loaded');
    } catch (error) {
      console.warn('Authored register unavailable; keeping primitive fallback.', error);
    }
  }

  private async replaceCoolerVisual(): Promise<void> {
    try {
      const model = await this.registry.instantiate('authored-coolers', this.app.root, {
        position: new pc.Vec3(4.7, 0.0, -10.25),
        rotation: new pc.Vec3(0, 180, 0),
        scale: 1.28
      });
      model.name = 'AuthoredCoolers';
      this.setPrefixVisualsEnabled('CoolerGlass-', false);
      console.info('OPEN ALL NIGHT authored cooler bank loaded');
    } catch (error) {
      console.warn('Authored cooler bank unavailable; keeping primitive fallback.', error);
    }
  }

  private async addShelfHeroSamples(): Promise<void> {
    try {
      const left = await this.registry.instantiate('authored-shelf-boxes', this.app.root, {
        position: new pc.Vec3(-8.35, 0.0, 3.8),
        rotation: new pc.Vec3(0, 90, 0),
        scale: 0.92
      });
      left.name = 'AuthoredShelfSampleBoxes';

      const right = await this.registry.instantiate('authored-shelf-bags', this.app.root, {
        position: new pc.Vec3(8.35, 0.0, 3.8),
        rotation: new pc.Vec3(0, -90, 0),
        scale: 0.92
      });
      right.name = 'AuthoredShelfSampleBags';
      console.info('OPEN ALL NIGHT authored shelf samples loaded');
    } catch (error) {
      console.warn('Authored shelf samples unavailable; continuing without them.', error);
    }
  }

  private async addRetailAccents(): Promise<void> {
    const placements = [
      ['authored-display-bread', 'AuthoredBreadDisplay', new pc.Vec3(7.55, 0, 4.7), new pc.Vec3(0, -90, 0), 0.84],
      ['authored-display-fruit', 'AuthoredFruitDisplay', new pc.Vec3(6.10, 0, 5.5), new pc.Vec3(0, 180, 0), 0.78],
      ['authored-bottle-return', 'AuthoredBottleReturn', new pc.Vec3(8.25, 0, -5.65), new pc.Vec3(0, -90, 0), 0.92],
      ['authored-shelf-end', 'AuthoredEndcapA', new pc.Vec3(-3.70, 0, 3.05), new pc.Vec3(0, 0, 0), 0.88],
      ['authored-shelf-end', 'AuthoredEndcapB', new pc.Vec3(3.70, 0, 3.05), new pc.Vec3(0, 180, 0), 0.88],
      ['authored-chest-freezer', 'AuthoredChestFreezer', new pc.Vec3(7.55, 0, -6.95), new pc.Vec3(0, -90, 0), 0.95],
      ['authored-entry-rug', 'AuthoredEntryRug', new pc.Vec3(0, 0.025, 9.75), new pc.Vec3(0, 0, 0), 1.15]
    ] as const;

    const results = await Promise.allSettled(placements.map(async ([id, name, position, rotation, scale]) => {
      const model = await this.registry.instantiate(id, this.app.root, { position, rotation, scale });
      model.name = name;
      return model;
    }));

    const successCount = results.filter((result) => result.status === 'fulfilled').length;
    console.info(`OPEN ALL NIGHT authored retail accents loaded: ${successCount}/${placements.length}`);
  }

  private setNamedVisualsEnabled(names: string[], enabled: boolean): void {
    for (const name of names) {
      const node = this.app.root.findByName(name) as pc.Entity | null;
      if (node?.render) node.render.enabled = enabled;
    }
  }

  private setPrefixVisualsEnabled(prefix: string, enabled: boolean): void {
    const stack: pc.GraphNode[] = [...this.app.root.children];
    while (stack.length) {
      const node = stack.pop();
      if (!node) continue;
      stack.push(...node.children);
      if (!node.name.startsWith(prefix)) continue;
      const entity = node as pc.Entity;
      if (entity.render) entity.render.enabled = enabled;
    }
  }
}
