import * as pc from 'playcanvas';
import { AssetRegistry } from './assetRegistry';

const CHARACTER_BASE = 'https://raw.githubusercontent.com/intellicia-public/parastore/main/frontend/public/assets/characters';

interface CharacterBinding {
  rootName: string;
  assetId: string;
  file: string;
  scale: number;
  y?: number;
  yaw?: number;
}

/**
 * Optional authored-character experiment. The current Kenney mini-character set is deliberately
 * NOT enabled in the normal game because the first graphics playtest proved the proportions are
 * too toy-like/chibi for Open All Night. The normal-proportioned primitive actors stay active
 * until a better human asset set is selected and visually approved.
 */
export class AuthoredCharacterSystem {
  private readonly registry: AssetRegistry;
  private readonly attached = new Set<string>();
  private readonly loading = new Set<string>();
  private readonly disabled: boolean;

  private readonly bindings: CharacterBinding[] = [
    { rootName: 'Earl-Regular-Customer', assetId: 'character-earl', file: 'character-male-a.glb', scale: 2.22, yaw: 180 },
    { rootName: 'Silent-Customer', assetId: 'character-silent', file: 'character-female-f.glb', scale: 2.18, yaw: 180 },
    { rootName: 'Jenna', assetId: 'character-jenna', file: 'character-female-b.glb', scale: 2.16, yaw: 180 },
    { rootName: 'LateNightTraveler', assetId: 'character-traveler', file: 'character-male-c.glb', scale: 2.22, yaw: 180 },
    { rootName: 'Dale', assetId: 'character-dale', file: 'character-male-f.glb', scale: 2.28, yaw: 180 },
    { rootName: 'Marcus-Regular', assetId: 'character-marcus', file: 'character-male-d.glb', scale: 2.24, yaw: 180 }
  ];

  constructor(private readonly app: pc.Application) {
    this.registry = new AssetRegistry(app);
    const params = new URLSearchParams(window.location.search);
    // Rejected content (see class comment) that still lives on the temporary remote mirror - also
    // require ?dev=1 so a normal player can never trigger a request to that third-party host just
    // by guessing a query param, the way ?characters=1 alone used to allow.
    const explicitlyEnabled = params.get('dev') === '1' &&
      (params.get('characters') === '1' || params.get('experimentalCharacters') === '1');
    this.disabled = params.get('assets') === '0' || !explicitlyEnabled;

    for (const binding of this.bindings) {
      this.registry.register({ id: binding.assetId, url: `${CHARACTER_BASE}/${binding.file}`, scale: binding.scale });
    }

    if (this.disabled) {
      console.info('OPEN ALL NIGHT authored mini-character layer disabled; using normal-proportioned fallback actors.');
    }
  }

  update(): void {
    if (this.disabled) return;
    for (const binding of this.bindings) {
      if (this.attached.has(binding.rootName) || this.loading.has(binding.rootName)) continue;
      const node = this.app.root.findByName(binding.rootName);
      if (!(node instanceof pc.Entity) || !node.enabled) continue;
      this.loading.add(binding.rootName);
      void this.attach(node, binding);
    }
  }

  private async attach(root: pc.Entity, binding: CharacterBinding): Promise<void> {
    try {
      root.setLocalScale(1, 1, 1);
      const model = await this.registry.instantiate(binding.assetId, root, {
        position: new pc.Vec3(0, binding.y ?? 0, 0),
        rotation: new pc.Vec3(0, binding.yaw ?? 180, 0),
        scale: binding.scale
      });
      model.name = `${binding.rootName}-AuthoredModel`;
      this.hidePrimitiveChildren(root, model);
      this.attached.add(binding.rootName);
      console.info(`OPEN ALL NIGHT experimental authored character attached: ${binding.rootName}`);
    } catch (error) {
      console.warn(`Authored character unavailable for ${binding.rootName}; keeping primitive fallback.`, error);
    } finally {
      this.loading.delete(binding.rootName);
    }
  }

  private hidePrimitiveChildren(root: pc.Entity, keep: pc.Entity): void {
    const stack: pc.GraphNode[] = [...root.children];
    while (stack.length) {
      const node = stack.pop();
      if (!node || node === keep || this.isDescendantOf(node, keep)) continue;
      stack.push(...node.children);
      const entity = node as pc.Entity;
      if (entity.render) entity.render.enabled = false;
    }
  }

  private isDescendantOf(node: pc.GraphNode, ancestor: pc.GraphNode): boolean {
    let current = node.parent;
    while (current) {
      if (current === ancestor) return true;
      current = current.parent;
    }
    return false;
  }
}
