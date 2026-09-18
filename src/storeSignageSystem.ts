import * as pc from 'playcanvas';

interface SignStyle {
  background: string;
  foreground: string;
  border: string;
  sub?: string;
}

/** Adds readable retail identity without baking text into structural geometry. */
export class StoreSignageSystem {
  private readonly textures: pc.Texture[] = [];

  constructor(private readonly app: pc.Application) {
    this.build();
  }

  private build(): void {
    const aisleStyle: SignStyle = { background: '#173a27', foreground: '#efe8c0', border: '#d9d0a3' };
    const serviceStyle: SignStyle = { background: '#7d221b', foreground: '#fff0d4', border: '#d8b28b' };
    const utilityStyle: SignStyle = { background: '#282b29', foreground: '#ece6cc', border: '#8b8c7b' };
    const exteriorStyle: SignStyle = { background: '#163d26', foreground: '#fff0c2', border: '#d7be63', sub: '#f0c85a' };
    const pumpStyle: SignStyle = { background: '#751d18', foreground: '#fff5d8', border: '#dac37b', sub: '#f0d986' };

    this.createDoubleSign('AisleSign1', new pc.Vec3(-5.1, 3.35, 5.0), new pc.Vec2(1.65, 0.48), 'AISLE 1', 'SNACKS • CANDY', aisleStyle);
    this.createDoubleSign('AisleSign2', new pc.Vec3(-1.7, 3.35, 5.0), new pc.Vec2(1.65, 0.48), 'AISLE 2', 'HOUSEHOLD', aisleStyle);
    this.createDoubleSign('AisleSign3', new pc.Vec3(1.7, 3.35, 5.0), new pc.Vec2(1.65, 0.48), 'AISLE 3', 'GROCERIES', aisleStyle);
    this.createDoubleSign('AisleSign4', new pc.Vec3(5.1, 3.35, 5.0), new pc.Vec2(1.65, 0.48), 'AISLE 4', 'COLD DRINKS', aisleStyle);

    this.createWallSign('CoffeeSign', new pc.Vec3(6.45, 2.75, 9.45), new pc.Vec2(1.8, 0.55), new pc.Vec3(0, 180, 0), 'FRESH COFFEE', '24 HOURS', serviceStyle);

    // There is exactly one employee entrance from the sales floor: the original central gap in the
    // back divider. Put its sign over THAT opening instead of over the office wall.
    this.createWallSign('EmployeesSign', new pc.Vec3(-3.10, 2.82, -7.10), new pc.Vec2(1.55, 0.46), new pc.Vec3(0, 0, 0), 'EMPLOYEES ONLY', '', serviceStyle);

    // Restroom sign now lives inside the staff corridor beside the west-facing restroom door; it is
    // deliberately not visible as a second doorway from the sales floor.
    this.createWallSign('RestroomSign', new pc.Vec3(-2.56, 2.22, -9.62), new pc.Vec2(1.20, 0.40), new pc.Vec3(0, 90, 0), 'RESTROOM', '', utilityStyle);

    // z pushed out from the original 12.24 to 12.55: visualPolishSystem.ts's facade fascia
    // (StorefrontFasciaCap/GreenBand/CreamStripe) sits at z 12.07-12.25 in almost the same y-band as
    // this sign, added independently by a different system. The two were nearly coincident in depth,
    // so the fascia's solid green band was burying the sign's face - confirmed via runtime screenshot
    // showing no readable branding at all above the entrance even a few meters out. This is the
    // exact "large illuminated facade branding... unmistakable from outside" identity requirement.
    this.createWallSign('CasesFrontBrand', new pc.Vec3(0, 3.48, 12.55), new pc.Vec2(5.8, 1.02), new pc.Vec3(0, 180, 0), "CASE'S COUNTRY GAS STOP", 'FOOD • FUEL • OPEN 24 HOURS', exteriorStyle, 1.35);
    this.createWallSign('FrontWindowCoffeeDecal', new pc.Vec3(4.2, 2.15, 12.02), new pc.Vec2(1.50, 0.44), new pc.Vec3(0, 180, 0), 'HOT COFFEE', 'ALL NIGHT', serviceStyle, 0.95);
    this.createWallSign('FrontWindowAtmDecal', new pc.Vec3(-4.2, 2.15, 12.02), new pc.Vec2(1.20, 0.44), new pc.Vec3(0, 180, 0), 'ATM', 'INSIDE', utilityStyle, 0.82);
    this.createDoubleSign('RoadsideBrand', new pc.Vec3(-11.5, 5.0, 36.84), new pc.Vec2(3.9, 1.62), "CASE'S", 'COUNTRY GAS • OPEN 24 HOURS', exteriorStyle, 1.20);

    const pumpPositions: Array<[number, number, number]> = [
      [1, -5.9, 25.3], [2, -4.5, 25.3], [3, 4.5, 25.3], [4, 5.9, 25.3],
      [5, -5.9, 30.7], [6, -4.5, 30.7], [7, 4.5, 30.7], [8, 5.9, 30.7]
    ];
    for (const [number, x, z] of pumpPositions) {
      this.createDoubleSign(`PumpNumber-${number}`, new pc.Vec3(x, 2.33, z), new pc.Vec2(0.54, 0.38), `PUMP ${number}`, '', pumpStyle, 0.88);
    }

    const facadeLight = new pc.Entity('FacadeSignLight');
    facadeLight.addComponent('light', {
      type: 'omni',
      color: new pc.Color(0.95, 0.78, 0.42),
      intensity: 0.62,
      range: 7.5,
      castShadows: false
    });
    facadeLight.setPosition(0, 3.35, 13.0);
    this.app.root.addChild(facadeLight);
  }

  private createDoubleSign(name: string, pos: pc.Vec3, size: pc.Vec2, title: string, subtitle: string, style: SignStyle, emission = 0.72): void {
    const material = this.makeSignMaterial(title, subtitle, style, emission);
    this.makeBacking(name, pos, new pc.Vec3(size.x + 0.08, size.y + 0.08, 0.07));
    const front = this.makePlane(`${name}-Front`, material, pos, size);
    front.setEulerAngles(90, 0, 0);
    front.setPosition(pos.x, pos.y, pos.z + 0.042);
    const back = this.makePlane(`${name}-Back`, material, pos, size);
    back.setEulerAngles(90, 180, 0);
    back.setPosition(pos.x, pos.y, pos.z - 0.042);
  }

  private createWallSign(name: string, pos: pc.Vec3, size: pc.Vec2, rotation: pc.Vec3, title: string, subtitle: string, style: SignStyle, emission = 0.72): void {
    const material = this.makeSignMaterial(title, subtitle, style, emission);
    // Root cause of CasesFrontBrand (the main storefront sign) rendering as a plain black rectangle
    // instead of its texture, confirmed by moving just the face entity to a known-good interior spot
    // where it rendered perfectly: makeBacking's box was never rotated to match the sign's facing
    // direction, so for a Z-facing sign its unrotated 0.055-deep backing sat centered on the exact
    // same point as the (then paper-thin) face plane - and being deeper, its near surface ended up
    // slightly closer to the viewer than the face, burying it. For the one X-facing sign
    // (RestroomSign) the un-rotated backing was worse: 1.28m thick along the actual viewing axis
    // instead of the face's 0.03m, swallowing it entirely.
    // Rotating the backing to match fixes the second problem. For the first, rather than nudging the
    // face forward (which direction is "forward" depends on rotation.y in a way this call site
    // doesn't reliably encode - an offset that happened to work for one sign buried another), the
    // face is simply made thicker than the backing and centered on the same point, so it pokes out
    // past the backing on both sides regardless of which way the sign is rotated. Combined with the
    // material's cull:NONE, the sign face is always the outermost, always-visible surface.
    this.makeBacking(name, pos, new pc.Vec3(size.x + 0.08, size.y + 0.08, 0.05), rotation.y);
    const face = new pc.Entity(`${name}-Face`);
    face.addComponent('render', { type: 'box' });
    face.setPosition(pos);
    face.setEulerAngles(0, rotation.y, 0);
    face.setLocalScale(size.x, size.y, 0.09);
    if (face.render) face.render.material = material;
    this.app.root.addChild(face);
  }

  private makeBacking(name: string, pos: pc.Vec3, scale: pc.Vec3, yaw = 0): pc.Entity {
    const material = new pc.StandardMaterial();
    material.diffuse = new pc.Color(0.025, 0.027, 0.025);
    material.gloss = 0.16;
    material.update();
    const e = new pc.Entity(`${name}-Backing`);
    e.addComponent('render', { type: 'box' });
    e.setPosition(pos);
    e.setEulerAngles(0, yaw, 0);
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
    if (e.render) e.render.material = material;
    this.app.root.addChild(e);
    return e;
  }

  private makeSignMaterial(title: string, subtitle: string, style: SignStyle, emission: number): pc.StandardMaterial {
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
    const titleSize = title.length > 18 ? 34 : title.length > 10 ? 40 : 48;
    ctx.font = `700 ${titleSize}px monospace`;
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
    material.emissive = new pc.Color(1, 1, 1);
    material.emissiveIntensity = emission;
    material.gloss = 0.12;
    // Double-sided so a single-plane wall sign (createWallSign) never depends on getting its facing
    // direction exactly right, and so it keeps working now that createWallSign's face box is
    // rotated per-instance (see there for the actual bug this uncovered and fixed: the backing box
    // burying the face, not culling).
    material.cull = pc.CULLFACE_NONE;
    material.update();
    return material;
  }
}
