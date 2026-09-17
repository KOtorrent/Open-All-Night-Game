import * as pc from 'playcanvas';

export interface AssetSpec {
  id: string;
  url: string;
  scale?: number;
}

export class AssetRegistry {
  private readonly app: pc.Application;
  private readonly specs = new Map<string, AssetSpec>();
  private readonly assets = new Map<string, pc.Asset>();

  constructor(app: pc.Application) {
    this.app = app;
  }

  register(spec: AssetSpec): void {
    this.specs.set(spec.id, spec);
  }

  has(id: string): boolean {
    return this.specs.has(id);
  }

  async preload(id: string): Promise<void> {
    if (this.assets.has(id)) return;
    const spec = this.specs.get(id);
    if (!spec) throw new Error(`Unknown asset id: ${id}`);

    const asset = new pc.Asset(spec.id, 'container', { url: spec.url });
    this.app.assets.add(asset);
    this.assets.set(id, asset);

    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        asset.off('load', onLoad);
        asset.off('error', onError);
      };
      const onLoad = () => {
        cleanup();
        resolve();
      };
      const onError = (error: unknown) => {
        cleanup();
        reject(error instanceof Error ? error : new Error(`Failed to load ${id}`));
      };
      asset.on('load', onLoad);
      asset.on('error', onError);
      this.app.assets.load(asset);
    });
  }

  async instantiate(id: string, parent: pc.Entity = this.app.root): Promise<pc.Entity> {
    await this.preload(id);
    const asset = this.assets.get(id);
    const spec = this.specs.get(id);
    if (!asset?.resource || !spec) throw new Error(`Asset ${id} loaded without a container resource`);

    const resource = asset.resource as pc.ContainerResource;
    const entity = resource.instantiateRenderEntity();
    entity.name = id;
    const scale = spec.scale ?? 1;
    entity.setLocalScale(scale, scale, scale);
    parent.addChild(entity);
    return entity;
  }
}
