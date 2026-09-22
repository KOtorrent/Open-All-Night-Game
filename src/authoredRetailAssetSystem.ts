import * as pc from 'playcanvas';
import { AssetRegistry } from './assetRegistry';

// The two models actually used by default (register, entry rug) are vendored locally - see
// docs/ASSET_SOURCES.md for full provenance/license record. A release build must not depend on a
// third-party GitHub mirror at runtime for anything a normal player can reach without ?dev=1.
const LOCAL_MARKET_BASE = '/assets/market';
// Graphics overhaul Pass 3: hero props sourced from the Tiny Treats / KayKit CC0 packs (see
// docs/ASSET_SOURCES.md), vendored locally the same way as the Pass 1 market assets above.
const PASS3_BASE = '/assets/pass3';

/**
 * These packs' native "chunky stylized" look uses bright, saturated colors that would read as
 * pasted-in against Case's worn-commercial palette. Rather than edit the shared texture atlas
 * (which would affect every other model that reuses it), each imported model's materials are
 * overridden in-engine with one of these dark, low-gloss commercial materials, keeping the
 * authored mesh/silhouette but discarding the original diffuse map entirely.
 */
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

    // Pass 3: the Kenney till (cash-register.glb) read as flat/generic in human review even once
    // in place - swapped for the Tiny Treats "Bakery Interior" register, which has a taller body
    // and a raised display stalk that reads more like a real POS terminal from customer height.
    this.registry.register({ id: 'authored-register', url: `${PASS3_BASE}/checkout/cash_register.gltf`, scale: 0.36 });
    this.registry.register({ id: 'authored-coffee-machine', url: `${PASS3_BASE}/coffee/coffee_machine.gltf`, scale: 0.44 });
    this.registry.register({ id: 'authored-coffee-cup', url: `${PASS3_BASE}/coffee/coffee_cup_takeaway.gltf`, scale: 0.30 });
    this.registry.register({ id: 'authored-toilet', url: `${PASS3_BASE}/restroom/toilet.gltf`, scale: 0.52 });
    this.registry.register({ id: 'authored-bathroom-mirror', url: `${PASS3_BASE}/restroom/mirror.gltf`, scale: 0.42 });
    this.registry.register({ id: 'authored-office-desk', url: `${PASS3_BASE}/office/desk.gltf`, scale: 0.46 });
    this.registry.register({ id: 'authored-office-chair', url: `${PASS3_BASE}/office/chair_desk_A.gltf`, scale: 0.62 });
    this.registry.register({ id: 'authored-office-monitor', url: `${PASS3_BASE}/office/monitor.gltf`, scale: 0.30 });
    this.registry.register({ id: 'authored-office-keyboard', url: `${PASS3_BASE}/office/keyboard.gltf`, scale: 0.50 });
    this.registry.register({ id: 'authored-office-mouse', url: `${PASS3_BASE}/office/mouse.gltf`, scale: 0.32 });
    this.registry.register({ id: 'authored-office-lamp', url: `${PASS3_BASE}/office/lamp_desk.gltf`, scale: 0.34 });
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
    const jobs: Promise<void>[] = [
      this.replaceRegister(),
      this.addEntryRug(),
      this.replaceCoffeeStation(),
      this.replaceRestroomFixtures(),
      this.replaceOfficeFurniture()
    ];

    if (params.get('dev') === '1' && params.get('experimentalAssets') === '1') {
      jobs.push(this.replaceCoolerVisual(), this.addShelfHeroSamples(), this.addRetailAccents());
    }

    await Promise.allSettled(jobs);
  }

  private async replaceRegister(): Promise<void> {
    try {
      // Counter top's own top face sits at y=1.365 (CounterTop is centered y=1.30, height 0.13 -
      // see storeBuilder.ts); the register's local origin sits at its own base (bbox min-y ~0), so
      // placing it right at that height rests it on the counter rather than floating or sinking in.
      const model = await this.registry.instantiate('authored-register', this.app.root, {
        position: new pc.Vec3(-5.0, 1.365, 7.90),
        rotation: new pc.Vec3(0, 180, 0)
      });
      model.name = 'AuthoredRegister';
      retint(model, new pc.Color(0.10, 0.105, 0.11), 0.55, 0.42);
      this.setNamedVisualsEnabled(['POSBase', 'POSScreen', 'POSKeypad'], false);
    } catch (error) {
      console.warn('Authored register unavailable; keeping primitive fallback.', error);
    }
  }

  private async replaceCoffeeStation(): Promise<void> {
    try {
      // CoffeeCounter top sits at y=1.30 + half its 0.12 height = 1.36 (storeBuilder.ts); the
      // authored machine's own base sits at local y=0, matching the register's placement logic.
      const machine = await this.registry.instantiate('authored-coffee-machine', this.app.root, {
        position: new pc.Vec3(6.1, 1.365, 8.75),
        rotation: new pc.Vec3(0, -20, 0)
      });
      machine.name = 'AuthoredCoffeeMachine';
      retint(machine, new pc.Color(0.16, 0.045, 0.03), 0.35, 0.38);
      this.setNamedVisualsEnabled(['CoffeeMachine', 'CoffeeFace'], false);

      const cup = await this.registry.instantiate('authored-coffee-cup', this.app.root, {
        position: new pc.Vec3(6.85, 1.375, 8.55),
        rotation: new pc.Vec3(0, 15, 0)
      });
      cup.name = 'AuthoredCoffeeCup';
      retint(cup, new pc.Color(0.86, 0.83, 0.76), 0, 0.15);
    } catch (error) {
      console.warn('Authored coffee station props unavailable; keeping primitive fallback.', error);
    }
  }

  private async replaceRestroomFixtures(): Promise<void> {
    try {
      const toilet = await this.registry.instantiate('authored-toilet', this.app.root, {
        position: new pc.Vec3(-1.58, 0.0, -10.98),
        rotation: new pc.Vec3(0, 90, 0)
      });
      toilet.name = 'AuthoredToilet';
      retint(toilet, new pc.Color(0.86, 0.87, 0.85), 0, 0.55);
      this.setNamedVisualsEnabled(['RestroomToiletBase', 'RestroomToiletBowl', 'RestroomToiletTank'], false);

      const mirror = await this.registry.instantiate('authored-bathroom-mirror', this.app.root, {
        position: new pc.Vec3(-0.14, 1.62, -10.00),
        rotation: new pc.Vec3(0, 90, 0)
      });
      mirror.name = 'AuthoredBathroomMirror';
      // A dark, high-metalness tint read as a flat black disc under this room's restrained lighting
      // (confirmed via screenshot) - a mirror has no real-time reflection in this engine anyway, so
      // a light, low-metalness "frosted glass" tint that stays legible regardless of light angle
      // reads better than chasing a physically-accurate reflective look that this renderer can't do.
      retint(mirror, new pc.Color(0.58, 0.62, 0.62), 0.1, 0.7);
      this.setNamedVisualsEnabled(['RestroomMirror'], false);
    } catch (error) {
      console.warn('Authored restroom fixtures unavailable; keeping primitive fallback.', error);
    }
  }

  private async replaceOfficeFurniture(): Promise<void> {
    try {
      const desk = await this.registry.instantiate('authored-office-desk', this.app.root, {
        position: new pc.Vec3(-7.65, 0.0, -10.45),
        rotation: new pc.Vec3(0, 0, 0)
      });
      desk.name = 'AuthoredOfficeDesk';
      retint(desk, new pc.Color(0.28, 0.19, 0.11), 0, 0.22);
      this.setNamedVisualsEnabled(['OfficeDesk'], false);

      const chair = await this.registry.instantiate('authored-office-chair', this.app.root, {
        position: new pc.Vec3(-8.45, 0.0, -9.73),
        rotation: new pc.Vec3(0, 165, 0)
      });
      chair.name = 'AuthoredOfficeChair';
      retint(chair, new pc.Color(0.08, 0.085, 0.09), 0.15, 0.25);
      this.setNamedVisualsEnabled(['OfficeChairPedestal', 'OfficeChairSeat', 'OfficeChairBack'], false);

      // "cabinet_small" from this pack turned out to be a soft-furnishing ottoman/pouf shape once
      // seen in-engine (the pack's own preview renders don't make this obvious at a glance), not a
      // filing cabinet - confirmed via screenshot during this pass's own verification pass. Rather
      // than ship a visibly wrong object, the procedural gray steel file cabinet stays in place.
      // See docs/PASS3_CHARACTER_ASSET_REVIEW.md-style honesty note in ASSET_SOURCES.md.

      const monitor = await this.registry.instantiate('authored-office-monitor', this.app.root, {
        position: new pc.Vec3(-7.65, 0.75, -10.44),
        rotation: new pc.Vec3(0, 0, 0)
      });
      monitor.name = 'AuthoredOfficeMonitor';
      retint(monitor, new pc.Color(0.06, 0.065, 0.065), 0.4, 0.3);
      this.setNamedVisualsEnabled(['OfficeMonitor'], false);

      const keyboard = await this.registry.instantiate('authored-office-keyboard', this.app.root, {
        position: new pc.Vec3(-6.95, 0.82, -10.30),
        rotation: new pc.Vec3(0, -6, 0)
      });
      keyboard.name = 'AuthoredOfficeKeyboard';
      retint(keyboard, new pc.Color(0.62, 0.61, 0.58), 0, 0.2);
      this.setNamedVisualsEnabled(['OfficeKeyboard'], false);

      const mouse = await this.registry.instantiate('authored-office-mouse', this.app.root, {
        position: new pc.Vec3(-6.65, 0.82, -10.30),
        rotation: new pc.Vec3(0, 20, 0)
      });
      mouse.name = 'AuthoredOfficeMouse';
      retint(mouse, new pc.Color(0.62, 0.61, 0.58), 0, 0.2);

      const lamp = await this.registry.instantiate('authored-office-lamp', this.app.root, {
        position: new pc.Vec3(-7.45, 0.75, -10.35),
        rotation: new pc.Vec3(0, 0, 0)
      });
      lamp.name = 'AuthoredOfficeLamp';
      retint(lamp, new pc.Color(0.16, 0.17, 0.16), 0.3, 0.3);
    } catch (error) {
      console.warn('Authored office furniture unavailable; keeping primitive fallback.', error);
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
