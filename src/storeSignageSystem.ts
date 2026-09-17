import * as pc from 'playcanvas';

interface SignStyle {
  background: string;
  foreground: string;
  border: string;
  sub?: string;
}

/** Adds readable retail identity without baking text into structural geometry. */
export class StoreSignageSystem {
  private readonly app: pc.Application;
  private readonly textures: pc.Texture[] = [];

  constructor(app: pc.Application) {
    this.app = app;
    this.build();
  }

  private build(): void {
    const aisleStyle: SignStyle = { background: '#173a27', foreground: '#efe8c0', border: '#d9d0a3' };
    const serviceStyle: SignStyle = { background: '#7d221b', foreground: '#fff0d4', border: '#d8b28b' };
    const utilityStyle: SignStyle = { background: '#282b29', foreground: '#ece6cc', border: '#8b8c7b' };

    this.createDoubleSign('AisleSign1', new pc.Vec3(-5.1, 3.35, 5.0), new pc.Vec2(1.65, 0.48), 'AISLE 1', 'SNACKS • CANDY', aisleStyle);
    this.createDoubleSign('AisleSign2', new pc.Vec3(-1.7, 3.35, 5.0), new pc.Vec2(1.65, 0.48), 'AISLE 2', 'HOUSEHOLD', aisleStyle);
    this.createDoubleSign('AisleSign3', new pc.Vec3(1.7, 3.35, 5.0), new pc.Vec2(1.65, 0.48), 'AISLE 3', 'GROCERIES', aisleStyle);
    this.createDoubleSign('AisleSign4', new pc.Vec3(5.1, 3.35, 5.0), new pc.Vec2(1.65, 0.48), 'AISLE 4', 'COLD DRINKS', aisleStyle);

    this.createWallSign('CoffeeSign', new pc.Vec3(6.45, 2.75, 9.45), new pc.Vec2(1.8, 0.55), new pc.Vec3(0, 180, 0), 'FRESH COFFEE', '24 HOURS', serviceStyle);
    this.createWallSign('EmployeesSign', new pc.Vec3(-7.2, 2.65, -8.72), new pc.Vec2(1.55, 0.46), new pc.Vec3(0, 0, 0), 'EMPLOYEES ONLY', '', serviceStyle);
    this.createWallSign('RestroomSign', new pc.Vec3(7.2, 2.55, -8.72), new pc.Vec2(1.35, 0.46), new pc.Vec3(0, 0, 0), 'RESTROOM', '', utilityStyle);

    // Front branding is deliberately simple and readable from the forecourt, matching the game's
    // fictional gas-station identity rather than looking like another debug box.
    this.createWallSign('CasesFrontBrand', new pc.Vec3(0, 3.48, 12.14), new pc.Vec2(4.8, 0.88), new pc.Vec3(0, 180, 0), "CASE'S COUNTRY GAS STOP", 'FOOD • FUEL • OPEN 24 HOURS', serviceStyle);
  }

  private createDoubleSign(name: string, pos: pc.Vec3, size: pc.Vec2, title: string, subtitle: string, style: SignStyle): void {
    const material = this.makeSignMaterial(title, subtitle, style);
    const backing = this.makeBacking(name, pos, new pc.Vec3(size.x + 0.08, size.y + 0.08, 0.07));

    const front = this.makePlane(`${name}-Front`, material, pos, size);
    front.setEulerAngles(0, 0, 0);
    front.translateLocal(0, 0, 0.042);

    const back = this.makePlane(`${name}-Back`, material, pos, size);
    back.setEulerAngles(0, 180, 0);
    back.translateLocal(0, 0, 0.042);

    backing.addChild(front);
    backing.addChild(back);
    front.setLocalPosition(0, 0, 0.042);
    back.setLocalPosition(0, 0, -0.042);
  }

  private createWallSign(name: string, pos: pc.Vec3, size: pc.Vec2, rotation: pc.Vec3, title: string, subtitle: string, style: SignStyle): void {
    const material = this.makeSignMaterial(title, subtitle, style);
    this.makeBacking(name, pos, new pc.Vec3(size.x + 0.08, size.y + 0.08, 0.055));
    const plane = this.makePlane(`${name}-Face`, material, pos, size);
    plane.setEulerAngles(rotation);
  }

  private makeBacking(name: string, pos: pc.Vec3, scale: pc.Vec3): pc.Entity {
    const material = new pc.StandardMaterial();
    material.diffuse = new pc.Color(0.025, 0.027, 0.025);
    material.gloss = 0.16;
    material.update();

    const e = new pc.Entity(`${name}-Backing`);
    e.addComponent('render', { type: 'box' });
    e.setPosition(pos);
    e.setLocalScale(scale);
    if (e.render) e.render.material = material;
    this.app.root.addChild(e);
    return e;
  }

  private makePlane(name: string, material: pc.StandardMaterial, pos: pc.Vec3, size: pc.Vec2): pc.Entity {
    const e = new pc.Entity(name);
    e.addComponent('render', { type: 'plane' });
    e.setPosition(pos);
    e.setLocalScale(size.x, 1, size.y);
    // PlayCanvas primitive plane lies on X/Z by default; rotate upright to X/Y.
    e.setLocalEulerAngles(90, 0, 0);
    if (e.render) e.render.material = material;
    this.app.root.addChild(e);
    return e;
  }

  private makeSignMaterial(title: string, subtitle: string, style: SignStyle): pc.StandardMaterial {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable for signage');

    ctx.fillStyle = style.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = style.border;
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = style.foreground;
    ctx.font = '700 44px monospace';
    ctx.fillText(title, canvas.width / 2, subtitle ? 64 : 80);

    if (subtitle) {
      ctx.fillStyle = style.sub ?? '#d8ca78';
      ctx.font = '700 20px monospace';
      ctx.fillText(subtitle, canvas.width / 2, 116);
    }

    const texture = new pc.Texture(this.app.graphicsDevice, {
      width: canvas.width,
      height: canvas.height,
      format: pc.PIXELFORMAT_RGBA8,
      minFilter: pc.FILTER_LINEAR,
      magFilter: pc.FILTER_LINEAR,
      addressU: pc.ADDRESS_CLAMP_TO_EDGE,
      addressV: pc.ADDRESS_CLAMP_TO_EDGE
    });
    texture.setSource(canvas);
    this.textures.push(texture);

    const material = new pc.StandardMaterial();
    material.diffuseMap = texture;
    material.emissiveMap = texture;
    material.emissive = new pc.Color(0.16, 0.16, 0.13);
    material.emissiveIntensity = 0.42;
    material.gloss = 0.12;
    material.update();
    return material;
  }
}
