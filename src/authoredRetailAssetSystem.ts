import * as pc from 'playcanvas';
import { AssetRegistry } from './assetRegistry';

// The two models actually used by default (register, entry rug) are vendored locally - see
// docs/ASSET_SOURCES.md for full provenance/license record. A release build must not depend on a
// third-party GitHub mirror at runtime for anything a normal player can reach without ?dev=1.
const LOCAL_MARKET_BASE = '/assets/market';
// Everything below this line is still experimental/unapproved content (the cooler import is
// explicitly rejected; the rest is pending an in-game visual check) and is not part of the shipped
// game - it stays on the temporary mirror and is gated behind ?dev=1 below so a normal player can
// never trigger a request to it.
const REMOTE_MARKET_BASE = 'https://raw.githubusercontent.com/intellicia-public/parastore/main/frontend/public/assets/market';

/**
 * Runtime bridge for real authored retail models. Primitive gameplay geometry remains collision /
 * fallback. Only visually approved replacements are enabled by default; everything else is opt-in
 * behind ?dev=1&experimentalAssets=1 until scale, silhouette and placement have been checked in-game.
 */
export class AuthoredRetailAssetSystem {
  private readonly registry: AssetRegistry;

  constructor(private readonly app: pc.Application) {
    this.registry = new AssetRegistry(app);

    this.registry.register({ id: 'authored-register', url: `${LOCAL_MARKET_BASE}/cash-register.glb`, scale: 0.95 });
    this.registry.register({ id: 'authored-entry-rug', url: `${LOCAL_MARKET_BASE}/rugRectangle.glb`, scale: 1.0 });
    this.registry.register({ id: 'authored-coolers', url: `${REMOTE_MARKET_BASE}/freezers-standing.glb`, scale: 1.10 });
    this.registry.register({ id: 'authored-shelf-boxes', url: `${REMOTE_MARKET_BASE}/shelf-boxes.glb`, scale: 1.0 });
    this.registry.register({ id: 'authored-shelf-bags', url: `${REMOTE_MARKET_BASE}/shelf-bags.glb`, scale: 1.0 });
    this.registry.register({ id: 'authored-display-bread', url: `${REMOTE_MARKET_BASE}/display-bread.glb`, scale: 1.0 });
    this.registry.register({ id: 'authored-display-fruit', url: `${REMOTE_MARKET_BASE}/display-fruit.glb`, scale: 1.0 });
    this.registry.register({ id: 'authored-bottle-return', url: `${REMOTE_MARKET_BASE}/bottle-return.glb`, scale: 1.0 });
    this.registry.register({ id: 'authored-shelf-end', url: `${REMOTE_MARKET_BASE}/shelf-end.glb`, scale: 1.0 });
    this.registry.register({ id: 'authored-chest-freezer', url: `${REMOTE_MARKET_BASE}/freezer.glb`, scale: 1.0 });
  }

  async start(): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    if (params.get('assets') === '0') {
      console.info('OPEN ALL NIGHT authored asset layer disabled by ?assets=0');
      return;
    }

    // After the graphics playtest, the cooler import is no longer considered approved: it was the
    // unexplained gray object sitting in front of the freezer wall. Keep the normal build clean.
    const jobs: Promise<void>[] = [this.replaceRegister(), this.addEntryRug()];

    if (params.get('dev') === '1' && params.get('experimentalAssets') === '1') {
      jobs.push(this.replaceCoolerVisual(), this.addShelfHeroSamples(), this.addRetailAccents());
    }

    await Promise.allSettled(jobs);
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
    } catch (error) {
      console.warn('Experimental cooler bank unavailable; keeping primitive fallback.', error);
    }
  }

  private async addEntryRug(): Promise<void> {
    try {
      const rug = await this.registry.instantiate('authored-entry-rug', this.app.root, {
        position: new pc.Vec3(0, 0.025, 9.75), rotation: new pc.Vec3(0, 0, 0), scale: 1.15
      });
      rug.name = 'AuthoredEntryRug';
    } catch (error) {
      console.warn('Authored entry rug unavailable; continuing without it.', error);
    }
  }

  private async addShelfHeroSamples(): Promise<void> {
    try {
      const left = await this.registry.instantiate('authored-shelf-boxes', this.app.root, {
        position: new pc.Vec3(-8.35, 0.0, 3.8), rotation: new pc.Vec3(0, 90, 0), scale: 0.92
      });
      left.name = 'AuthoredShelfSampleBoxes';
      const right = await this.registry.instantiate('authored-shelf-bags', this.app.root, {
        position: new pc.Vec3(8.35, 0.0, 3.8), rotation: new pc.Vec3(0, -90, 0), scale: 0.92
      });
      right.name = 'AuthoredShelfSampleBags';
    } catch (error) {
      console.warn('Experimental shelf samples unavailable; continuing without them.', error);
    }
  }

  private async addRetailAccents(): Promise<void> {
    const placements = [
      ['authored-display-bread', 'AuthoredBreadDisplay', new pc.Vec3(7.55, 0, 4.7), new pc.Vec3(0, -90, 0), 0.84],
      ['authored-display-fruit', 'AuthoredFruitDisplay', new pc.Vec3(6.10, 0, 5.5), new pc.Vec3(0, 180, 0), 0.78],
      ['authored-bottle-return', 'AuthoredBottleReturn', new pc.Vec3(8.25, 0, -5.65), new pc.Vec3(0, -90, 0), 0.92],
      ['authored-shelf-end', 'AuthoredEndcapA', new pc.Vec3(-3.70, 0, 3.05), new pc.Vec3(0, 0, 0), 0.88],
      ['authored-shelf-end', 'AuthoredEndcapB', new pc.Vec3(3.70, 0, 3.05), new pc.Vec3(0, 180, 0), 0.88],
      ['authored-chest-freezer', 'AuthoredChestFreezer', new pc.Vec3(7.55, 0, -6.95), new pc.Vec3(0, -90, 0), 0.95]
    ] as const;

    await Promise.allSettled(placements.map(async ([id, name, position, rotation, scale]) => {
      const model = await this.registry.instantiate(id, this.app.root, { position, rotation, scale });
      model.name = name;
    }));
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
