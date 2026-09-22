import * as pc from 'playcanvas';

function material(color: pc.Color, metalness = 0, gloss = 0.2, emissive?: pc.Color, emissiveIntensity = 1): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.metalness = metalness;
  m.gloss = gloss;
  if (emissive) {
    m.emissive = emissive;
    m.emissiveIntensity = emissiveIntensity;
  }
  m.update();
  return m;
}

function box(app: pc.Application, name: string, position: pc.Vec3, scale: pc.Vec3, mat: pc.StandardMaterial): pc.Entity {
  const e = new pc.Entity(name);
  e.addComponent('render', { type: 'box' });
  e.setPosition(position);
  e.setLocalScale(scale);
  if (e.render) e.render.material = mat;
  app.root.addChild(e);
  return e;
}

function addFillLight(
  app: pc.Application,
  name: string,
  position: pc.Vec3,
  color: pc.Color,
  intensity: number,
  range: number
): pc.Entity {
  const light = new pc.Entity(name);
  light.addComponent('light', {
    type: 'omni',
    color,
    intensity,
    range,
    castShadows: false
  });
  light.setPosition(position);
  app.root.addChild(light);
  return light;
}

/**
 * Cohesive visual baseline for Case's. This is intentionally code-authored structural dressing:
 * it improves readability, material separation and gas-station identity without turning hero props
 * back into primitive-only assets. Hero props continue to move toward validated GLBs.
 */
export class VisualPolishSystem {
  constructor(private readonly app: pc.Application) {
    this.applySceneBaseline();
    this.polishFloor();
    this.polishWallsAndCeiling();
    this.polishCheckoutAndCoffee();
    this.polishAislesAndCoolers();
    this.polishExteriorFacade();
    this.addReadableLighting();
  }

  private applySceneBaseline(): void {
    // Night-shift dark, but never eye-straining. Horror should come from contrast and uncertainty,
    // not from making the player stare into crushed black pixels.
    this.app.scene.ambientLight = new pc.Color(0.135, 0.142, 0.145);

    // Graphics overhaul Pass 2 fix: this used to unconditionally replace the Floor/Ceiling entities'
    // materials with flat colors here, which ran right after storeBuilder.ts set them to the shared
    // vinyl_floor/ceiling_tile textures - silently discarding that material work every time the scene
    // loaded (confirmed in-engine: the live Floor material had no diffuseMap at all). storeBuilder.ts
    // now tints those textured materials directly to the same dark target this method used to hard-set,
    // so the floor/ceiling keep their tile/seam texture detail instead of being flat single colors.
  }

  private polishFloor(): void {
    const seam = material(new pc.Color(0.055, 0.06, 0.062), 0, 0.10);
    const lane = material(new pc.Color(0.145, 0.15, 0.145), 0, 0.16);

    // Broad vinyl-tile seams: enough surface identity to break up the giant flat floor without
    // adding hundreds of individual tile meshes.
    for (let x = -8; x <= 8; x += 2) {
      box(this.app, `FloorSeamX-${x}`, new pc.Vec3(x, 0.006, 0), new pc.Vec3(0.018, 0.008, 23.5), seam);
    }
    for (let z = -10; z <= 10; z += 2) {
      box(this.app, `FloorSeamZ-${z}`, new pc.Vec3(0, 0.007, z), new pc.Vec3(19.5, 0.008, 0.018), seam);
    }

    // Slightly brighter customer lanes help the store read spatially from normal first-person height.
    for (const x of [-6.75, -3.4, 0, 3.4, 6.75]) {
      box(this.app, `AisleWalkLane-${x}`, new pc.Vec3(x, 0.010, 0.35), new pc.Vec3(0.035, 0.008, 8.6), lane);
    }

    // Subtle worn-floor grime at the highest-traffic spots (entrance, checkout, coffee, staff
    // doorway). The store is open and operating, not abandoned, so this stays faint and small -
    // a believable years-of-foot-traffic patina rather than dirt or damage.
    const grime = material(new pc.Color(0.045, 0.048, 0.045), 0, 0.06);
    const grimeSpots: Array<[number, number, number, number]> = [
      [0, 10.9, 2.6, 1.1],
      [-5.0, 7.6, 1.9, 1.4],
      [6.2, 7.9, 1.7, 1.2],
      [-3.9, -6.9, 1.6, 0.9]
    ];
    for (const [x, z, sx, sz] of grimeSpots) {
      box(this.app, `FloorGrime-${x}-${z}`, new pc.Vec3(x, 0.008, z), new pc.Vec3(sx, 0.004, sz), grime);
    }
  }

  private polishWallsAndCeiling(): void {
    const baseboard = material(new pc.Color(0.055, 0.06, 0.062), 0.22, 0.22);
    const wallBand = material(new pc.Color(0.12, 0.25, 0.17), 0.05, 0.18);
    const ceilingRail = material(new pc.Color(0.055, 0.06, 0.06), 0.4, 0.20);

    // Commercial-store baseboards and a restrained green stripe make the shell feel designed.
    box(this.app, 'BaseboardLeft', new pc.Vec3(-9.88, 0.16, 0), new pc.Vec3(0.08, 0.30, 23.5), baseboard);
    box(this.app, 'BaseboardRight', new pc.Vec3(9.88, 0.16, 0), new pc.Vec3(0.08, 0.30, 23.5), baseboard);
    box(this.app, 'BaseboardBack', new pc.Vec3(0, 0.16, -11.88), new pc.Vec3(19.6, 0.30, 0.08), baseboard);
    box(this.app, 'WallBandLeft', new pc.Vec3(-9.86, 2.65, 0), new pc.Vec3(0.06, 0.18, 23.2), wallBand);
    box(this.app, 'WallBandRight', new pc.Vec3(9.86, 2.65, 0), new pc.Vec3(0.06, 0.18, 23.2), wallBand);
    box(this.app, 'WallBandBack', new pc.Vec3(0, 2.65, -11.86), new pc.Vec3(19.5, 0.18, 0.06), wallBand);

    // Sparse ceiling grid rails visually sell old suspended retail ceiling panels.
    for (const x of [-6, -2, 2, 6]) {
      box(this.app, `CeilingRailX-${x}`, new pc.Vec3(x, 4.08, 0), new pc.Vec3(0.035, 0.035, 23.4), ceilingRail);
    }
    for (const z of [-8, -4, 0, 4, 8]) {
      box(this.app, `CeilingRailZ-${z}`, new pc.Vec3(0, 4.075, z), new pc.Vec3(19.4, 0.035, 0.035), ceilingRail);
    }
  }

  private polishCheckoutAndCoffee(): void {
    const darkTrim = material(new pc.Color(0.05, 0.052, 0.05), 0.45, 0.28);
    const greenPanel = material(new pc.Color(0.035, 0.19, 0.10), 0.10, 0.22);
    const brass = material(new pc.Color(0.38, 0.29, 0.095), 0.55, 0.34);
    const backsplash = material(new pc.Color(0.23, 0.24, 0.22), 0.16, 0.30);

    // Checkout face is now broken into deliberate panels rather than one giant brown slab.
    box(this.app, 'CounterKickplate', new pc.Vec3(-5.6, 0.13, 8.64), new pc.Vec3(6.0, 0.22, 0.045), darkTrim);
    for (const x of [-7.7, -6.3, -4.9, -3.5]) {
      box(this.app, `CounterFacePanel-${x}`, new pc.Vec3(x, 0.72, 8.635), new pc.Vec3(1.14, 0.78, 0.035), greenPanel);
      box(this.app, `CounterPanelTrim-${x}`, new pc.Vec3(x, 1.11, 8.66), new pc.Vec3(1.16, 0.035, 0.035), brass);
    }

    box(this.app, 'CoffeeBacksplash', new pc.Vec3(6.5, 1.92, 9.34), new pc.Vec3(4.2, 1.18, 0.06), backsplash);
    box(this.app, 'CoffeeCounterKickplate', new pc.Vec3(6.5, 0.13, 9.38), new pc.Vec3(4.2, 0.22, 0.035), darkTrim);
  }

  private polishAislesAndCoolers(): void {
    const header = material(new pc.Color(0.035, 0.15, 0.085), 0.28, 0.25);
    const shelfEdge = material(new pc.Color(0.44, 0.46, 0.43), 0.62, 0.34);
    const coolerHeader = material(new pc.Color(0.045, 0.055, 0.06), 0.62, 0.34);
    const coolerGlow = material(
      new pc.Color(0.62, 0.76, 0.82),
      0.08,
      0.32,
      new pc.Color(0.18, 0.30, 0.34),
      0.75
    );

    for (const [index, x] of [-5.1, -1.7, 1.7, 5.1].entries()) {
      box(this.app, `AisleHeaderCap-${index + 1}`, new pc.Vec3(x, 3.02, 0.4), new pc.Vec3(2.18, 0.18, 8.22), header);
      // End-edge highlights make long shelves readable from across the room.
      box(this.app, `AisleFrontEdge-${index + 1}`, new pc.Vec3(x, 1.40, 4.48), new pc.Vec3(2.15, 0.055, 0.08), shelfEdge);
      box(this.app, `AisleRearEdge-${index + 1}`, new pc.Vec3(x, 1.40, -3.68), new pc.Vec3(2.15, 0.055, 0.08), shelfEdge);
    }

    box(this.app, 'CoolerHeaderTrim', new pc.Vec3(4.8, 3.34, -10.20), new pc.Vec3(9.6, 0.24, 0.16), coolerHeader);
    for (let i = 0; i < 5; i++) {
      const x = 1.1 + i * 1.82;
      box(this.app, `CoolerTopGlow-${i}`, new pc.Vec3(x, 3.03, -10.14), new pc.Vec3(1.42, 0.055, 0.05), coolerGlow);
    }
  }

  private polishExteriorFacade(): void {
    const facadeDark = material(new pc.Color(0.055, 0.07, 0.062), 0.15, 0.18);
    const green = material(new pc.Color(0.025, 0.21, 0.095), 0.10, 0.22);
    const cream = material(new pc.Color(0.70, 0.66, 0.46), 0.04, 0.20);
    const emissiveCream = material(
      new pc.Color(0.76, 0.70, 0.43),
      0,
      0.18,
      new pc.Color(0.30, 0.25, 0.08),
      0.70
    );

    // A recognizable 1990s independent-gas-station facade: dark cap, green band, thin cream pinstripe.
    box(this.app, 'StorefrontFasciaCap', new pc.Vec3(0, 3.82, 12.16), new pc.Vec3(19.7, 0.42, 0.18), facadeDark);
    box(this.app, 'StorefrontGreenBand', new pc.Vec3(0, 3.58, 12.19), new pc.Vec3(19.6, 0.34, 0.10), green);
    box(this.app, 'StorefrontCreamStripe', new pc.Vec3(0, 3.36, 12.22), new pc.Vec3(19.55, 0.055, 0.055), cream);

    // Under-eave glow visually connects the sign and windows to the forecourt at night.
    for (const x of [-7.2, -3.6, 0, 3.6, 7.2]) {
      box(this.app, `StorefrontSoffitFixture-${x}`, new pc.Vec3(x, 3.20, 12.34), new pc.Vec3(0.72, 0.055, 0.18), emissiveCream);
    }

    // Canopy identity bands visually tie the pumps back to Case's storefront branding.
    box(this.app, 'CanopyCreamStripeFront', new pc.Vec3(0, 4.43, 33.94), new pc.Vec3(18.4, 0.075, 0.06), cream);
    box(this.app, 'CanopyCreamStripeRear', new pc.Vec3(0, 4.43, 22.46), new pc.Vec3(18.4, 0.075, 0.06), cream);
  }

  private addReadableLighting(): void {
    const coolRetail = new pc.Color(0.78, 0.84, 0.82);
    const warmCounter = new pc.Color(0.90, 0.76, 0.56);
    const coolerBlue = new pc.Color(0.56, 0.72, 0.80);

    // Fill lights are deliberately shadowless: primary fixtures still shape the scene, while these
    // prevent shelves/customers/tasks from disappearing into black on constrained browser builds.
    for (const [i, x] of [-5.3, 0, 5.3].entries()) {
      addFillLight(this.app, `RetailFillFront-${i}`, new pc.Vec3(x, 2.7, 4.3), coolRetail, 0.34, 6.7);
      addFillLight(this.app, `RetailFillRear-${i}`, new pc.Vec3(x, 2.7, -3.3), coolRetail, 0.31, 6.4);
    }

    addFillLight(this.app, 'CheckoutReadableFill', new pc.Vec3(-5.4, 2.55, 7.0), warmCounter, 0.38, 5.0);
    // The coffee machine's own dark-steel housing (see storeBuilder.ts's CoffeeMachine/CoffeeFace)
    // reads almost as a black silhouette under the same fill level used at checkout — confirmed via
    // runtime screenshot, where it was noticeably darker than every other counter in the store even
    // though VISUAL_TARGET.md calls for the coffee area to read "slightly warm", not underlit.
    addFillLight(this.app, 'CoffeeReadableFill', new pc.Vec3(6.2, 2.45, 7.8), warmCounter, 0.85, 4.6);
    // Boosted alongside CoolerInteriorLight-* in nightOneDirector.ts: at 0.36 the cooler bank's
    // stocked shelf props were effectively invisible, matching the "cooler doors appear empty"
    // human-playtest complaint.
    addFillLight(this.app, 'CoolerReadableFill', new pc.Vec3(4.8, 2.35, -8.9), coolerBlue, 1.5, 6.2);
    addFillLight(this.app, 'StaffThresholdFill', new pc.Vec3(-4.5, 2.4, -7.0), coolRetail, 0.25, 4.6);

    // The staff corridor, office and restroom sit well behind the sales-floor fill lights above and
    // each currently relies on a single fixture light. In-engine testing showed the intensity scale
    // used elsewhere in this method (under ~0.4) is nearly invisible on these walls — that was a
    // confirmed human-playtest complaint, not just a stylistic choice. These extend readable fill
    // into the staff area interior at the same empirically-verified brightness used in
    // staffAreaBuilder.ts's primary fixtures, just dialed back since fills are meant to be secondary.
    // Range pulled in from 5.6 alongside staffAreaBuilder.ts's StockRoomFrontLight/StockRoomRearLight
    // - same non-shadow wall-leak into the restroom next door, found in the same lighting audit.
    addFillLight(this.app, 'CorridorReadableFill', new pc.Vec3(-4.5, 2.5, -10.2), coolRetail, 1.4, 4.2);
    // OfficeReadableFill/RestroomReadableFill were tuned (1.6/1.4) against the office/restroom's old
    // flat-color wall materials. Graphics overhaul Pass 2 swapped those to the drywall_office/
    // off_white_wall/restroom_tile textures, which measured ~0.72-0.82 average diffuse reflectance -
    // notably brighter than the old flat colors - and the lighting audit for this pass found these two
    // small, enclosed rooms were blowing out to flat white even after cutting each room's own dedicated
    // fixture light substantially (see staffAreaBuilder.ts / restroomSystem.ts). Since these fills sit
    // near the room center with no shadow occlusion, they were the dominant source and needed the same
    // re-tune.
    addFillLight(this.app, 'OfficeReadableFill', new pc.Vec3(-7.75, 2.5, -9.9), warmCounter, 0.55, 5.8);
    addFillLight(this.app, 'RestroomReadableFill', new pc.Vec3(-1.25, 2.5, -10.0), coolRetail, 0.28, 4.2);

    // Exterior sign/facade wash. This is subtle enough to keep the road dark but makes the store
    // itself unmistakable when the player turns around from the pumps.
    addFillLight(this.app, 'FrontBrandWash', new pc.Vec3(0, 3.4, 13.3), warmCounter, 0.42, 7.2);
  }
}
