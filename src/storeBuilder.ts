import * as pc from 'playcanvas';
import type { BuiltWorld, Collider2D, Interactable } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';
import type { MaterialLibrary } from './materialLibrary';

function mat(color: pc.Color, metalness = 0, gloss = 0.25, emissive?: pc.Color, opacity = 1): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.metalness = metalness;
  m.gloss = gloss;
  if (emissive) {
    m.emissive = emissive;
    m.emissiveIntensity = 1;
  }
  if (opacity < 1) {
    // Without this, StandardMaterial defaults to BLEND_NONE and renders fully opaque regardless of
    // the opacity value — confirmed in-engine to be why the cooler bank's stocked shelf props were
    // completely invisible behind "glass" doors that were actually solid. See frontDoorSystem.ts for
    // the same pattern already used correctly there.
    m.opacity = opacity;
    m.blendType = pc.BLEND_NORMAL;
    m.depthWrite = false;
  }
  m.update();
  return m;
}

function addBox(
  app: pc.Application,
  name: string,
  position: pc.Vec3,
  scale: pc.Vec3,
  material: pc.StandardMaterial
): pc.Entity {
  const e = new pc.Entity(name);
  e.addComponent('render', { type: 'box' });
  e.setPosition(position);
  e.setLocalScale(scale);
  if (e.render) e.render.material = material;
  app.root.addChild(e);
  return e;
}

function addCylinder(
  app: pc.Application,
  name: string,
  position: pc.Vec3,
  scale: pc.Vec3,
  material: pc.StandardMaterial
): pc.Entity {
  const e = new pc.Entity(name);
  e.addComponent('render', { type: 'cylinder' });
  e.setPosition(position);
  e.setLocalScale(scale);
  if (e.render) e.render.material = material;
  app.root.addChild(e);
  return e;
}

function colliderFromBox(colliders: Collider2D[], x: number, z: number, sx: number, sz: number, name: string): void {
  colliders.push({ minX: x - sx / 2, maxX: x + sx / 2, minZ: z - sz / 2, maxZ: z + sz / 2, name });
}

export function buildStore(app: pc.Application, state: GameState, ui: GameUI, materials: MaterialLibrary): BuiltWorld {
  const colliders: Collider2D[] = [];
  const interactables: Interactable[] = [];

  // Wall/floor/ceiling now use the shared tiled texture set (docs/VISUAL_STYLE_BIBLE.md) instead of
  // flat single colors - this also covers the storefront facade (FrontWallL/R below), since PlayCanvas
  // primitive UVs are fixed per-face at 0..1 and don't auto-scale with an entity's localScale, each
  // wall/floor/ceiling segment gets its own getTiled() variant sized to its own visible-face
  // dimensions rather than one shared material with one fixed tiling (which would either smear
  // across the big surfaces or over-repeat on the small ones). Interior hero props (shelving,
  // coolers, counter) keep their existing flat materials for now; that pass is scoped for later per
  // docs/GRAPHICS_OVERHAUL_BASELINE.md.
  const floor = materials.getTiled('vinyl_floor', 20, 24);
  const ceiling = materials.getTiled('ceiling_tile', 20, 24);
  // Tinted down from the raw texture (sampled at ~0.57/~0.77 average diffuse): the lighting audit
  // for graphics overhaul Pass 2 found that at those native brightnesses, the store's existing bank
  // of fill lights (visualPolishSystem.ts) blows the floor/ceiling out toward flat white instead of
  // reading as "worn commercial vinyl" / "acoustic ceiling tile" at night. Tinting the shared diffuseMap
  // (rather than replacing it with a flat color) keeps the seam/tile texture detail visible while
  // landing back in the same dark, night-appropriate brightness range the store was designed around.
  floor.diffuse = new pc.Color(0.20, 0.20, 0.19);
  floor.update();
  ceiling.diffuse = new pc.Color(0.155, 0.16, 0.155);
  ceiling.update();
  const wallLR = materials.getTiled('off_white_wall', 24, 4.1);
  const wallBack = materials.getTiled('off_white_wall', 20, 4.1);
  const wallFront = materials.getTiled('off_white_wall', 5.6, 4.1);
  const wall = wallFront;
  // Interior hero props now draw from the same material library instead of flat single colors
  // (graphics overhaul Pass 2, Phase 2/3): painted-metal shelving/fixtures, a real laminate
  // countertop, brushed steel for register/ATM/cooler hardware.
  const steel = materials.get('brushed_steel');
  const shelfMetal = materials.getTiled('painted_metal_shelving', 2.15, 2.85, 1.2);
  // Lifted from (0.055,0.06,0.06): the lighting audit for this pass confirmed that at the fixture
  // intensities used across the sales floor, that albedo was low enough to crush to a flat black
  // silhouette on anything not directly under a fixture (the checkout counter's cash drawer, candy
  // rack and register housing all read as a pure-black dead zone). This keeps the "dark steel"
  // read while leaving enough diffuse response for ambient/fixture light to actually show form.
  const darkSteel = mat(new pc.Color(0.11, 0.115, 0.115), 0.7, 0.30);
  const counter = materials.getTiled('painted_metal_shelving', 6.2, 1.24, 1.0);
  const laminate = materials.getTiled('laminate_counter', 6.45, 1.48);
  const coffeeLaminate = materials.getTiled('laminate_counter', 4.7, 1.32);
  const coolerMetal = materials.getTiled('cooler_metal', 9.5, 3.25, 0.7);
  const green = mat(new pc.Color(0.035, 0.18, 0.095), 0, 0.2);
  const red = mat(new pc.Color(0.48, 0.045, 0.025), 0, 0.23);
  const cream = mat(new pc.Color(0.68, 0.65, 0.48), 0, 0.18);
  const blue = mat(new pc.Color(0.10, 0.23, 0.32), 0, 0.25);
  const white = mat(new pc.Color(0.78, 0.81, 0.78), 0, 0.18);
  const screen = mat(new pc.Color(0.025, 0.08, 0.07), 0, 0.55, new pc.Color(0.015, 0.11, 0.085));
  const coolerGlass = mat(new pc.Color(0.08, 0.14, 0.16), 0.05, 0.72, undefined, 0.32);
  const paperLabel = materials.get('generic_label_gold');
  const productLabels = [
    materials.get('generic_label_red'), materials.get('generic_label_green'),
    materials.get('generic_label_blue'), materials.get('generic_label_gold')
  ];

  // Main shell: 20m x 24m, player-height authored around real-world scale.
  addBox(app, 'Floor', new pc.Vec3(0, -0.08, 0), new pc.Vec3(20, 0.16, 24), floor);
  addBox(app, 'Ceiling', new pc.Vec3(0, 4.15, 0), new pc.Vec3(20, 0.10, 24), ceiling);
  addBox(app, 'LeftWall', new pc.Vec3(-10, 2.05, 0), new pc.Vec3(0.18, 4.1, 24), wallLR);
  addBox(app, 'RightWall', new pc.Vec3(10, 2.05, 0), new pc.Vec3(0.18, 4.1, 24), wallLR);
  addBox(app, 'BackWall', new pc.Vec3(0, 2.05, -12), new pc.Vec3(20, 4.1, 0.18), wallBack);
  // Front wall split around entrance and windows.
  addBox(app, 'FrontWallL', new pc.Vec3(-7.2, 2.05, 12), new pc.Vec3(5.6, 4.1, 0.18), wall);
  addBox(app, 'FrontWallR', new pc.Vec3(7.2, 2.05, 12), new pc.Vec3(5.6, 4.1, 0.18), wall);
  addBox(app, 'FrontHeader', new pc.Vec3(0, 3.65, 12), new pc.Vec3(8.8, 0.9, 0.18), wall);
  addBox(app, 'DoorFrameL', new pc.Vec3(-1.45, 1.55, 11.92), new pc.Vec3(0.12, 3.1, 0.16), darkSteel);
  addBox(app, 'DoorFrameR', new pc.Vec3(1.45, 1.55, 11.92), new pc.Vec3(0.12, 3.1, 0.16), darkSteel);
  addBox(app, 'DoorHeader', new pc.Vec3(0, 3.04, 11.92), new pc.Vec3(3, 0.12, 0.16), darkSteel);
  addBox(app, 'WindowL', new pc.Vec3(-4.2, 1.75, 11.90), new pc.Vec3(3.6, 2.5, 0.08), coolerGlass);
  addBox(app, 'WindowR', new pc.Vec3(4.2, 1.75, 11.90), new pc.Vec3(3.6, 2.5, 0.08), coolerGlass);

  colliderFromBox(colliders, -10, 0, 0.18, 24, 'Left wall');
  colliderFromBox(colliders, 10, 0, 0.18, 24, 'Right wall');
  colliderFromBox(colliders, 0, -12, 20, 0.18, 'Back wall');
  colliderFromBox(colliders, -7.2, 12, 5.6, 0.18, 'Front wall L');
  colliderFromBox(colliders, 7.2, 12, 5.6, 0.18, 'Front wall R');

  // Restrained floor/corner wall grime (visual pass 4, Phase 1): a thin dark strip at the actual
  // floor-wall junction, not baked into the repeating off_white_wall texture itself - a directional
  // feature in a texture tiled 2x vertically would reappear as a visible seam partway up the wall
  // (confirmed while authoring the new texture). This reads as scuffed baseboard/mop-line wear
  // without needing new geometry beyond a thin box per wall run, reusing darkSteel so no new
  // material/draw call is introduced.
  const baseboardH = 0.16;
  addBox(app, 'BaseboardLeft', new pc.Vec3(-9.90, baseboardH / 2, 0), new pc.Vec3(0.05, baseboardH, 24), darkSteel);
  addBox(app, 'BaseboardRight', new pc.Vec3(9.90, baseboardH / 2, 0), new pc.Vec3(0.05, baseboardH, 24), darkSteel);
  addBox(app, 'BaseboardBack', new pc.Vec3(0, baseboardH / 2, -11.90), new pc.Vec3(20, baseboardH, 0.05), darkSteel);
  addBox(app, 'BaseboardFrontL', new pc.Vec3(-7.2, baseboardH / 2, 11.90), new pc.Vec3(5.6, baseboardH, 0.05), darkSteel);
  addBox(app, 'BaseboardFrontR', new pc.Vec3(7.2, baseboardH / 2, 11.90), new pc.Vec3(5.6, baseboardH, 0.05), darkSteel);

  // Checkout counter, front-left.
  addBox(app, 'CounterBase', new pc.Vec3(-5.6, 0.62, 8.0), new pc.Vec3(6.2, 1.24, 1.25), counter);
  addBox(app, 'CounterTop', new pc.Vec3(-5.6, 1.30, 8.0), new pc.Vec3(6.45, 0.13, 1.48), laminate);
  colliderFromBox(colliders, -5.6, 8.0, 6.2, 1.25, 'Counter');

  // Register/POS silhouette with screen, keypad, scanner and drawer seam.
  addBox(app, 'POSBase', new pc.Vec3(-5.0, 1.48, 7.95), new pc.Vec3(1.2, 0.22, 0.72), darkSteel);
  const posScreen = addBox(app, 'POSScreen', new pc.Vec3(-5.0, 1.92, 8.02), new pc.Vec3(0.82, 0.60, 0.10), screen);
  posScreen.setEulerAngles(-8, 0, 0);
  addBox(app, 'POSKeypad', new pc.Vec3(-5.0, 1.45, 7.60), new pc.Vec3(0.72, 0.07, 0.42), steel).setEulerAngles(-10, 0, 0);
  addBox(app, 'ScannerGlass', new pc.Vec3(-6.15, 1.40, 7.92), new pc.Vec3(0.82, 0.045, 0.58), screen);
  addBox(app, 'ReceiptPrinter', new pc.Vec3(-3.95, 1.49, 8.05), new pc.Vec3(0.52, 0.24, 0.48), darkSteel);
  addBox(app, 'Notebook', new pc.Vec3(-6.78, 1.40, 7.95), new pc.Vec3(0.58, 0.045, 0.76), cream).setEulerAngles(0, 11, 0);
  // Cash drawer beneath the register face - a real POS's most recognizable missing piece.
  addBox(app, 'CashDrawer', new pc.Vec3(-5.0, 1.29, 8.10), new pc.Vec3(0.62, 0.14, 0.50), materials.get('brushed_steel'));
  addBox(app, 'CashDrawerHandle', new pc.Vec3(-5.0, 1.29, 8.36), new pc.Vec3(0.36, 0.03, 0.03), darkSteel);
  // Bagging area beside the register: a bag stand with a paper bag ready and a small stack of
  // plastic bags on a hook, so the checkout reads as a real workstation with somewhere for
  // groceries to go rather than just a screen and a scanner.
  addBox(app, 'BagStandFrame', new pc.Vec3(-4.15, 1.55, 7.70), new pc.Vec3(0.05, 0.42, 0.05), materials.get('brushed_steel'));
  addBox(app, 'BagStandRing', new pc.Vec3(-4.15, 1.42, 7.70), new pc.Vec3(0.30, 0.02, 0.24), darkSteel);
  addBox(app, 'PaperBag', new pc.Vec3(-4.15, 1.60, 7.70), new pc.Vec3(0.26, 0.34, 0.20), materials.get('cardboard'));

  // A small non-shadow fill at counter height: the nearest ceiling fixture sits almost directly
  // above the counter, but its light falls mostly onto the counter TOP - the customer-facing front
  // (cash drawer, candy rack, POS housing) was reading as a near-black dead zone in the lighting
  // audit for this pass. This is a practical fixture change (an under-fixture task light, not a
  // scene-wide ambient bump) that fills just that front face without adding a new shadow caster.
  const checkoutFill = new pc.Entity('CheckoutFillLight');
  checkoutFill.addComponent('light', {
    type: 'omni', color: new pc.Color(0.80, 0.84, 0.84), intensity: 1.1, range: 3.4, castShadows: false
  });
  checkoutFill.setPosition(-4.6, 1.95, 8.9);
  app.root.addChild(checkoutFill);

  interactables.push({
    id: 'register', label: 'clock in', position: new pc.Vec3(-5.0, 1.7, 7.4), radius: 2.7,
    onInteract: () => {
      if (state.complete('clock-in')) return 'You clock in. 10:55 PM. Seven hours to go.';
      return 'The register is running. Your shift has already started.';
    }
  });
  interactables.push({
    id: 'notebook', label: 'read notebook', position: new pc.Vec3(-6.78, 1.45, 7.6), radius: 2.5,
    onInteract: () => {
      state.complete('notebook');
      return 'NIGHT SHIFT — 1) If the freezer lights flash, leave Aisle 4 until they stop.  2) If someone enters without the chime, do not speak.  3) Restroom closes at 2:00 AM. If you hear knocking after that, do not open it.';
    }
  });

  // Impulse-buy rack, lottery display and register clutter, all resting on the real countertop
  // surface (CounterTop is centered y=1.30 with 0.13 height, so its top face is at y=1.365) rather
  // than floating or clipping into the counter body. Purely decorative - none of it overlaps the
  // register/notebook/scanner interactable positions above, so their prompts/aim targets are
  // unaffected.
  const ticketColors = [red, blue, green, cream];
  const candyColors = [red, blue, green];
  const counterTopY = 1.365;
  addBox(app, 'CandyRackFrame', new pc.Vec3(-3.05, counterTopY + 0.325, 8.30), new pc.Vec3(0.62, 0.65, 0.30), darkSteel);
  for (let tier = 0; tier < 3; tier++) {
    const shelfY = counterTopY + 0.10 + tier * 0.20;
    addBox(app, `CandyRackShelf-${tier}`, new pc.Vec3(-3.05, shelfY, 8.20), new pc.Vec3(0.56, 0.02, 0.20), steel);
    for (let i = 0; i < 3; i++) {
      addBox(app, `CandyBar-${tier}-${i}`, new pc.Vec3(-3.24 + i * 0.19, shelfY + 0.09, 8.20), new pc.Vec3(0.15, 0.16, 0.03), candyColors[(tier + i) % candyColors.length]);
    }
  }
  addBox(app, 'LotteryPanel', new pc.Vec3(-7.85, counterTopY + 0.31, 7.85), new pc.Vec3(0.05, 0.62, 0.92), darkSteel).setEulerAngles(0, 8, 0);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 2; col++) {
      addBox(app, `LotteryTicket-${row}-${col}`, new pc.Vec3(-7.82, counterTopY + 0.10 + row * 0.14, 7.55 + col * 0.30), new pc.Vec3(0.012, 0.11, 0.24), ticketColors[(row + col) % ticketColors.length]).setEulerAngles(0, 8, 0);
    }
  }
  addBox(app, 'ReceiptClutter-0', new pc.Vec3(-3.72, counterTopY + 0.003, 8.20), new pc.Vec3(0.20, 0.006, 0.30), cream).setEulerAngles(0, -12, 0);
  addBox(app, 'ReceiptClutter-1', new pc.Vec3(-3.68, counterTopY + 0.007, 8.16), new pc.Vec3(0.20, 0.006, 0.30), cream).setEulerAngles(0, 6, 0);
  // Employee-side storage cubby, facing away from the customer aisle under the counter.
  addBox(app, 'EmployeeShelfUnder', new pc.Vec3(-5.6, 0.30, 8.35), new pc.Vec3(5.6, 0.05, 0.55), darkSteel);
  addBox(app, 'EmployeeBoxA', new pc.Vec3(-7.1, 0.52, 8.35), new pc.Vec3(0.55, 0.40, 0.45), mat(new pc.Color(0.33, 0.20, 0.09), 0, 0.06));
  addBox(app, 'EmployeeBoxB', new pc.Vec3(-6.3, 0.48, 8.35), new pc.Vec3(0.45, 0.32, 0.42), mat(new pc.Color(0.30, 0.18, 0.08), 0, 0.06));

  // Visual pass 4, Phase 4: a bit more believable small retail clutter around the counter - none of
  // it overlaps the register/notebook interactable positions or radii above (register -5.0,7.4 r2.7;
  // notebook -6.78,7.6 r2.5), and it stays clear of the bagging stand and POS cluster.
  // z=7.35 (front edge of the counter, clear of CandyRackFrame's own z=8.15-8.45 footprint even
  // though this shares similar x-range).
  const gumMats = [red, green, blue];
  for (let i = 0; i < 5; i++) {
    addBox(app, `GumRow-${i}`, new pc.Vec3(-2.55 - i * 0.155, counterTopY + 0.045, 7.35), new pc.Vec3(0.14, 0.09, 0.16), gumMats[i % gumMats.length]);
  }
  addCylinder(app, 'ReceiptRoll', new pc.Vec3(-5.55, counterTopY + 0.05, 7.45), new pc.Vec3(0.06, 0.10, 0.06), cream).setEulerAngles(0, 0, 90);
  // A short stack of plastic bags behind the paper-bag stand (BagStandFrame is at -4.15,7.70).
  for (let i = 0; i < 4; i++) {
    addBox(app, `PlasticBagStack-${i}`, new pc.Vec3(-4.40, counterTopY + 0.02 + i * 0.028, 7.85), new pc.Vec3(0.22, 0.02, 0.17), white).setEulerAngles(0, (i % 2) * 6 - 3, 0);
  }
  // Small standing "NO CHECKS" policy card, propped against the lottery panel base.
  addBox(app, 'NoChecksCard', new pc.Vec3(-7.55, counterTopY + 0.10, 8.05), new pc.Vec3(0.16, 0.11, 0.01), darkSteel).setEulerAngles(-18, -20, 0);
  // Worn/stained countertop patch near the register - a flat, low-opacity dark smudge rather than
  // new geometry, reusing the same opacity/blend pattern as coolerGlass above.
  addBox(app, 'CounterWearPatch', new pc.Vec3(-5.15, counterTopY + 0.002, 7.75), new pc.Vec3(0.55, 0.003, 0.42), mat(new pc.Color(0.05, 0.05, 0.045), 0, 0.06, undefined, 0.30));

  // Coffee station, front-right.
  addBox(app, 'CoffeeCounter', new pc.Vec3(6.5, 0.62, 8.8), new pc.Vec3(4.5, 1.24, 1.15), counter);
  addBox(app, 'CoffeeTop', new pc.Vec3(6.5, 1.30, 8.8), new pc.Vec3(4.7, 0.12, 1.32), coffeeLaminate);
  colliderFromBox(colliders, 6.5, 8.8, 4.5, 1.15, 'Coffee counter');
  addBox(app, 'CoffeeMachine', new pc.Vec3(6.1, 1.78, 8.85), new pc.Vec3(0.9, 0.92, 0.62), darkSteel);
  addBox(app, 'CoffeeFace', new pc.Vec3(6.1, 1.86, 8.52), new pc.Vec3(0.58, 0.42, 0.05), steel);
  // A small "brewing" indicator light. The dark-steel housing has such a low diffuse albedo that no
  // reasonable fill-light intensity reads as anything but a near-black silhouette (confirmed via
  // runtime screenshot); a warm emissive accent gives the eye something to land on without having to
  // blow out the rest of the counter to compensate, and doubles as a nice "always on" horror detail.
  addBox(app, 'CoffeeBrewLight', new pc.Vec3(6.1, 1.62, 8.53), new pc.Vec3(0.30, 0.035, 0.02), mat(new pc.Color(0.62, 0.32, 0.08), 0, 0.2, new pc.Color(0.85, 0.45, 0.10)));
  addCylinder(app, 'CoffeePot', new pc.Vec3(6.1, 1.48, 8.47), new pc.Vec3(0.46, 0.48, 0.46), coolerGlass);
  for (let i = 0; i < 5; i++) addCylinder(app, `Cup-${i}`, new pc.Vec3(7.12, 1.47 + i * 0.08, 8.63), new pc.Vec3(0.32, 0.22, 0.32), cream);
  addCylinder(app, 'CupLidStack', new pc.Vec3(7.12, 1.47 + 5 * 0.08 + 0.02, 8.63), new pc.Vec3(0.34, 0.05, 0.34), white);
  // Napkin holder, stir sticks and a small condiment tray so the station reads as a real self-serve
  // counter rather than just a brewer - all thin, reused-material primitives beside the cups.
  addBox(app, 'NapkinHolder', new pc.Vec3(7.75, 1.44, 8.60), new pc.Vec3(0.22, 0.16, 0.16), white);
  addBox(app, 'NapkinHolderSlot', new pc.Vec3(7.75, 1.51, 8.60), new pc.Vec3(0.16, 0.02, 0.10), cream);
  addCylinder(app, 'StirStickCup', new pc.Vec3(8.05, 1.44, 8.55), new pc.Vec3(0.10, 0.16, 0.10), darkSteel);
  const condimentColors = [blue, red, cream];
  for (let i = 0; i < 3; i++) {
    addBox(app, `CondimentPacket-${i}`, new pc.Vec3(8.30 + (i % 2) * 0.09, 1.365 + 0.008 + Math.floor(i / 2) * 0.016, 8.50 - (i % 2) * 0.09), new pc.Vec3(0.08, 0.016, 0.05), condimentColors[i]).setEulerAngles(0, i * 25, 0);
  }

  // Visual pass 4, Phase 5: sugar/creamer caddy, a small handwritten-style price card and a subtle
  // ring of counter stains - clear of the brewer/pot/coffee interactable (id 'coffee', position
  // 6.1,8.15) so the Coffee Rule and player's own brewing interaction stay visually unobstructed.
  addBox(app, 'SugarCaddy', new pc.Vec3(8.05, 1.44, 9.00), new pc.Vec3(0.20, 0.14, 0.14), white);
  const sugarPacketColors = [white, mat(new pc.Color(0.70, 0.42, 0.10)), cream];
  for (let i = 0; i < 3; i++) {
    addBox(app, `SugarPacket-${i}`, new pc.Vec3(8.02 + (i % 2) * 0.05, 1.53, 8.96 + Math.floor(i / 2) * 0.05), new pc.Vec3(0.055, 0.012, 0.035), sugarPacketColors[i]).setEulerAngles(0, i * 30, 0);
  }
  for (let i = 0; i < 3; i++) {
    addCylinder(app, `CreamerCup-${i}`, new pc.Vec3(4.75 + i * 0.11, 1.395, 9.05), new pc.Vec3(0.045, 0.045, 0.045), cream);
  }
  addBox(app, 'CoffeePriceCard', new pc.Vec3(6.85, 1.395 + 0.01, 8.30), new pc.Vec3(0.16, 0.004, 0.10), cream).setEulerAngles(0, -4, 0);
  // Faint dark rings under the pot/cup-stack positions - reused low-opacity flat pattern, not a new
  // texture, matching CounterWearPatch's approach near the register.
  addBox(app, 'CoffeeCounterStain', new pc.Vec3(6.1, 1.395 + 0.001, 8.47), new pc.Vec3(0.50, 0.002, 0.50), mat(new pc.Color(0.10, 0.07, 0.04), 0, 0.05, undefined, 0.24));
  addBox(app, 'TrashSlot', new pc.Vec3(4.55, 1.395 + 0.001, 8.85), new pc.Vec3(0.30, 0.006, 0.22), mat(new pc.Color(0.03, 0.03, 0.03), 0, 0.10));
  interactables.push({
    id: 'coffee', label: 'brew coffee', position: new pc.Vec3(6.1, 1.65, 8.15), radius: 2.5,
    onInteract: () => {
      if (state.complete('coffee')) return 'The brewer gurgles to life. Cheap coffee smells better at night.';
      return 'Coffee is already brewing.';
    }
  });

  // Four central aisles with thinner retail fixtures and deliberately varied merchandise.
  // Visual pass 4, Phase 2/3: each aisle now reads as a distinct category mix matching its own
  // overhead sign (storeSignageSystem.ts's AisleSign1-4: SNACKS/CANDY, HOUSEHOLD, GROCERIES, COLD
  // DRINKS) rather than every aisle cycling through the exact same material/shape sequence. Still
  // just 4 shared primitive silhouettes (can, box, bag, bottle) and shared flat-color materials -
  // no new textures, no per-product unique materials, no geometry beyond one extra thin "label
  // band" cylinder per can (matching the existing per-item cap cost).
  const aisleXs = [-5.1, -1.7, 1.7, 5.1];
  const productMats = [red, cream, blue, green, mat(new pc.Color(0.42, 0.22, 0.06)), mat(new pc.Color(0.15, 0.35, 0.22))];
  const capMat = mat(new pc.Color(0.62, 0.63, 0.60), 0.3, 0.35);
  const householdMats = [mat(new pc.Color(0.16, 0.42, 0.40)), cream, mat(new pc.Color(0.58, 0.60, 0.56)), blue];
  const snackMats = [red, mat(new pc.Color(0.62, 0.36, 0.04)), mat(new pc.Color(0.15, 0.35, 0.22)), cream];
  const groceryMats = [green, mat(new pc.Color(0.42, 0.22, 0.06)), red, blue];
  const drinkMats = [blue, red, cream, mat(new pc.Color(0.15, 0.35, 0.22))];
  // kind order per shelf position: 0=can 1=box 2=bag 3=bottle. Each aisle's own short cycle biases
  // toward its category's typical packaging (e.g. Household leans boxed/bottle, Snacks leans bag).
  interface AisleProfile { label: string; mats: pc.StandardMaterial[]; kinds: number[]; }
  const aisleProfiles: AisleProfile[] = [
    { label: 'Snacks/Candy', mats: snackMats, kinds: [2, 2, 1, 2, 0, 2] },
    { label: 'Household', mats: householdMats, kinds: [1, 1, 3, 1, 3, 1] },
    { label: 'Groceries', mats: groceryMats, kinds: [0, 1, 0, 1, 0, 2] },
    { label: 'Cold Drinks', mats: drinkMats, kinds: [3, 0, 3, 0, 3, 2] }
  ];
  aisleXs.forEach((x, aisleIndex) => {
    const z = 0.4;
    const profile = aisleProfiles[aisleIndex];
    addBox(app, `Aisle${aisleIndex + 1}-Base`, new pc.Vec3(x, 0.12, z), new pc.Vec3(2.15, 0.24, 8.3), darkSteel);
    addBox(app, `Aisle${aisleIndex + 1}-Back`, new pc.Vec3(x, 1.55, z), new pc.Vec3(0.08, 2.85, 8.2), shelfMetal);
    for (let side of [-1, 1]) {
      for (let tier = 0; tier < 4; tier++) {
        const shelfX = x + side * 0.55;
        const y = 0.43 + tier * 0.66;
        const eyeLevel = tier === 1 || tier === 2;
        addBox(app, `A${aisleIndex + 1}-Shelf-${side}-${tier}`, new pc.Vec3(shelfX, y, z), new pc.Vec3(1.0, 0.055, 8.15), shelfMetal);
        for (let item = 0; item < 9; item++) {
          // Fuller eye-level shelves, rarer gaps there; top/bottom tiers keep the old gap rate -
          // "used, stocked store" rather than a perfectly uniform grid or a half-empty one.
          const gapMod = eyeLevel ? 11 : 6;
          if ((item + tier + aisleIndex) % gapMod === 0) continue;
          const pz = -3.25 + item * 0.80;
          const pm = profile.mats[(item + tier * 2 + aisleIndex) % profile.mats.length];
          const h = 0.27 + ((item + tier + aisleIndex) % 3) * 0.08;
          const px = shelfX - side * 0.06;
          const kind = profile.kinds[(item + tier) % profile.kinds.length];
          if (kind === 0) {
            addCylinder(app, `A${aisleIndex + 1}-Can-${side}-${tier}-${item}`, new pc.Vec3(px, y + h / 2 + 0.035, pz), new pc.Vec3(0.22, h, 0.22), pm);
            addCylinder(app, `A${aisleIndex + 1}-Cap-${side}-${tier}-${item}`, new pc.Vec3(px, y + h + 0.075, pz), new pc.Vec3(0.10, 0.06, 0.10), capMat);
            addCylinder(app, `A${aisleIndex + 1}-CanLabel-${side}-${tier}-${item}`, new pc.Vec3(px, y + h * 0.38 + 0.035, pz), new pc.Vec3(0.226, h * 0.34, 0.226), productLabels[(item + tier + aisleIndex) % productLabels.length]);
          } else if (kind === 1) {
            addBox(app, `A${aisleIndex + 1}-Box-${side}-${tier}-${item}`, new pc.Vec3(px, y + h / 2 + 0.035, pz), new pc.Vec3(0.28, h, 0.20), pm);
            addBox(app, `A${aisleIndex + 1}-Label-${side}-${tier}-${item}`, new pc.Vec3(px - side * 0.145, y + h / 2 + 0.035, pz), new pc.Vec3(0.008, h * 0.5, 0.14), productLabels[(item + tier + aisleIndex) % productLabels.length]);
          } else if (kind === 3) {
            // Bottle: narrower/taller body + a distinct narrow neck so it reads differently from a
            // can silhouette at a glance, still 2 primitives (same cost as the can+cap pair).
            const bh = h * 1.15;
            addCylinder(app, `A${aisleIndex + 1}-Bottle-${side}-${tier}-${item}`, new pc.Vec3(px, y + bh / 2 + 0.035, pz), new pc.Vec3(0.16, bh, 0.16), pm);
            addCylinder(app, `A${aisleIndex + 1}-Neck-${side}-${tier}-${item}`, new pc.Vec3(px, y + bh + 0.05, pz), new pc.Vec3(0.07, 0.10, 0.07), capMat);
          } else {
            addBox(app, `A${aisleIndex + 1}-Bag-${side}-${tier}-${item}`, new pc.Vec3(px, y + h * 0.42 + 0.035, pz), new pc.Vec3(0.34, h * 0.82, 0.24), pm);
          }
        }
      }
    }
    colliderFromBox(colliders, x, z, 2.15, 8.3, `Aisle ${aisleIndex + 1}`);
  });

  // Endcaps: a small stacked-box display at the front of each aisle (visible from the entrance
  // approach, z~4.55, clear of the AisleSign overhead signage at z=5.0) - promo/overstock presence
  // without adding to the walkable aisle interior itself. Built like the aisle's own shelving (thin
  // back panel + a base + items stacked in the open space in front of it) rather than one thick
  // solid box, which was found in-engine to swallow the stacked boxes inside its own geometry.
  aisleXs.forEach((x, aisleIndex) => {
    const profile = aisleProfiles[aisleIndex];
    // Back panel at z=4.05 (thin, like Aisle-Back), boxes stacked toward the entrance up to z~4.50
    // - stays inside the aisle's own collider edge at z=4.55 (colliderFromBox above), so no extra
    // collider is needed for the display itself.
    const backZ = 4.05;
    addBox(app, `Endcap${aisleIndex + 1}-Back`, new pc.Vec3(x, 0.95, backZ), new pc.Vec3(1.05, 1.9, 0.06), shelfMetal);
    addBox(app, `Endcap${aisleIndex + 1}-BaseShelf`, new pc.Vec3(x, 0.14, backZ + 0.20), new pc.Vec3(1.05, 0.05, 0.44), shelfMetal);
    for (let i = 0; i < 5; i++) {
      const row = i % 3;
      const col = Math.floor(i / 3);
      addBox(app, `Endcap${aisleIndex + 1}-Box-${i}`, new pc.Vec3(x - 0.28 + col * 0.56, 0.34 + row * 0.30, backZ + 0.24), new pc.Vec3(0.42, 0.28, 0.36), materials.get('cardboard'));
    }
    addBox(app, `Endcap${aisleIndex + 1}-PromoTray`, new pc.Vec3(x, 1.62, backZ + 0.20), new pc.Vec3(0.9, 0.05, 0.40), darkSteel);
    for (let i = 0; i < 4; i++) {
      addCylinder(app, `Endcap${aisleIndex + 1}-Promo-${i}`, new pc.Vec3(x - 0.32 + i * 0.21, 1.82, backZ + 0.20), new pc.Vec3(0.13, 0.17, 0.13), profile.mats[i % profile.mats.length]);
    }
  });

  // Aisle 4 / rear cooler wall: dark frames, repeated doors, internal shelves and emissive-ish strips.
  const coolerZ = -10.7;
  addBox(app, 'CoolerBank', new pc.Vec3(4.8, 1.65, coolerZ), new pc.Vec3(9.5, 3.25, 0.9), coolerMetal);
  // Header trim strip along the top of the cooler bank - a small detail that reads as "commercial
  // fixture" rather than a bare frame, per the graphics overhaul's cooler-bank brief.
  addBox(app, 'CoolerHeaderTrim', new pc.Vec3(4.8, 3.24, coolerZ + 0.02), new pc.Vec3(9.6, 0.10, 0.94), materials.get('brushed_steel'));
  colliderFromBox(colliders, 4.8, coolerZ, 9.5, 0.9, 'Cooler bank');
  for (let door = 0; door < 5; door++) {
    const x = 1.1 + door * 1.82;
    addBox(app, `CoolerGlass-${door}`, new pc.Vec3(x, 1.72, -10.20), new pc.Vec3(1.56, 2.72, 0.05), coolerGlass);
    addBox(app, `CoolerHandle-${door}`, new pc.Vec3(x + 0.57, 1.72, -10.13), new pc.Vec3(0.055, 1.45, 0.07), steel);
    for (let tier = 0; tier < 4; tier++) {
      const y = 0.60 + tier * 0.63;
      addBox(app, `CoolerShelf-${door}-${tier}`, new pc.Vec3(x, y, -10.47), new pc.Vec3(1.45, 0.045, 0.62), steel);
      for (let item = 0; item < 5; item++) {
        // Visual pass 4, Phase 6: occasional empty slot (a real cooler is never perfectly full),
        // a milk-carton silhouette mixed in among the round bottles/cans, and width variation so
        // the row doesn't read as one item repeated 5x - stock presentation only, no new geometry
        // budget beyond what a can+cap pair already cost.
        if ((door + tier * 2 + item) % 9 === 0) continue;
        const px = x - 0.54 + item * 0.27;
        const dh = 0.27 + ((door + tier + item) % 3) * 0.055;
        const isCarton = (door + tier + item) % 6 === 5;
        if (isCarton) {
          addBox(app, `CoolerDrink-${door}-${tier}-${item}`, new pc.Vec3(px, y + dh / 2 + 0.025, -10.30), new pc.Vec3(0.20, dh, 0.16), white);
          addBox(app, `CoolerDrinkCap-${door}-${tier}-${item}`, new pc.Vec3(px, y + dh - 0.02, -10.30), new pc.Vec3(0.12, 0.06, 0.16), white).setEulerAngles(0, 45, 0);
        } else {
          const dw = 0.13 + ((door + item) % 2) * 0.04;
          addCylinder(app, `CoolerDrink-${door}-${tier}-${item}`, new pc.Vec3(px, y + dh / 2 + 0.025, -10.30), new pc.Vec3(dw, dh, dw), productMats[(door + tier + item) % productMats.length]);
          addCylinder(app, `CoolerDrinkCap-${door}-${tier}-${item}`, new pc.Vec3(px, y + dh + 0.06, -10.30), new pc.Vec3(dw * 0.5, 0.05, dw * 0.5), capMat);
          addCylinder(app, `CoolerDrinkLabel-${door}-${tier}-${item}`, new pc.Vec3(px, y + dh * 0.4 + 0.025, -10.30), new pc.Vec3(dw + 0.01, dh * 0.3, dw + 0.01), productLabels[(door + tier + item) % productLabels.length]);
        }
      }
    }
  }
  interactables.push({
    id: 'cooler', label: 'check cooler', position: new pc.Vec3(4.8, 1.5, -9.85), radius: 2.4,
    onInteract: () => 'The compressor hums steadily. The lights are not flashing. Not yet.'
  });

  // Back-room divider with a central employee door and utility areas.
  addBox(app, 'BackDividerL', new pc.Vec3(-6.8, 2.05, -7.2), new pc.Vec3(6.4, 4.1, 0.16), wall);
  addBox(app, 'BackDividerR', new pc.Vec3(-1.3, 2.05, -7.2), new pc.Vec3(2.6, 4.1, 0.16), wall);
  colliderFromBox(colliders, -6.8, -7.2, 6.4, 0.16, 'Back divider L');
  colliderFromBox(colliders, -1.3, -7.2, 2.6, 0.16, 'Back divider R');
  addBox(app, 'EmployeesOnlyHeader', new pc.Vec3(-3.9, 3.20, -7.1), new pc.Vec3(2.6, 0.40, 0.12), red);

  // Back room / office / restroom silhouettes visible through employee corridor.
  addBox(app, 'StockShelfA', new pc.Vec3(-8.0, 1.35, -9.3), new pc.Vec3(0.7, 2.6, 4.0), shelfMetal);
  addBox(app, 'StockShelfB', new pc.Vec3(-5.6, 1.35, -10.0), new pc.Vec3(0.7, 2.6, 2.6), shelfMetal);
  colliderFromBox(colliders, -8.0, -9.3, 0.7, 4.0, 'Stock shelf A');
  colliderFromBox(colliders, -5.6, -10.0, 0.7, 2.6, 'Stock shelf B');
  for (let i = 0; i < 7; i++) {
    addBox(app, `StockBox-${i}`, new pc.Vec3(-7.9, 0.55 + (i % 3) * 0.65, -10.7 + (i % 2) * 1.2), new pc.Vec3(0.48, 0.48, 0.68), materials.get('cardboard'));
  }
  addBox(app, 'OfficeDesk', new pc.Vec3(-2.1, 0.75, -10.2), new pc.Vec3(2.1, 0.12, 1.0), laminate);
  addBox(app, 'OfficeMonitor', new pc.Vec3(-2.1, 1.25, -10.3), new pc.Vec3(0.75, 0.55, 0.18), darkSteel);
  addBox(app, 'OfficeMonitorScreen', new pc.Vec3(-2.1, 1.26, -10.19), new pc.Vec3(0.58, 0.40, 0.025), screen);

  interactables.push({
    id: 'back-door', label: 'check rear door', position: new pc.Vec3(-9.55, 1.4, -10.7), radius: 2.3,
    onInteract: () => 'Locked. The parking lot beyond the rear wall is completely dark.'
  });

  // ATM and lottery clutter near front wall.
  addBox(app, 'ATMBody', new pc.Vec3(8.85, 1.05, 6.4), new pc.Vec3(1.2, 2.1, 0.85), darkSteel);
  addBox(app, 'ATMScreen', new pc.Vec3(8.84, 1.47, 5.95), new pc.Vec3(0.72, 0.52, 0.045), screen);
  addBox(app, 'ATMKeypad', new pc.Vec3(8.84, 0.98, 5.94), new pc.Vec3(0.56, 0.26, 0.05), steel);
  colliderFromBox(colliders, 8.85, 6.4, 1.2, 0.85, 'ATM');

  // Fluorescent grid. Each visible fixture has a nearby light so illumination has a source.
  const fixtureMat = mat(new pc.Color(0.72, 0.77, 0.75), 0, 0.12, new pc.Color(0.20, 0.24, 0.23));
  const fixturePoints: Array<[number, number]> = [
    [-6, 8], [0, 8], [6, 8], [-6, 3], [0, 3], [6, 3], [-6, -2], [0, -2], [6, -2], [-5, -8], [4, -8]
  ];
  fixturePoints.forEach(([x, z], index) => {
    addBox(app, `Fixture-${index}`, new pc.Vec3(x, 4.02, z), new pc.Vec3(1.55, 0.055, 0.38), fixtureMat);
    const light = new pc.Entity(`FixtureLight-${index}`);
    light.addComponent('light', {
      type: 'omni', color: new pc.Color(0.72, 0.82, 0.86), intensity: 0.78,
      range: 5.7, castShadows: index % 2 === 0, shadowResolution: 512
    });
    light.setPosition(x, 3.75, z);
    app.root.addChild(light);
  });

  // Tiny red spill above the employees-only corridor for a stronger horror composition.
  const backLight = new pc.Entity('BackHallLight');
  backLight.addComponent('light', { type: 'omni', color: new pc.Color(0.55, 0.055, 0.035), intensity: 0.65, range: 3.4, castShadows: true });
  backLight.setPosition(-3.9, 2.75, -7.5);
  app.root.addChild(backLight);

  ui.showMessage('Click the game to capture the mouse. Your shift starts in five minutes.', 4200);

  return {
    colliders,
    interactables,
    spawn: new pc.Vec3(0, 1.72, 10.0),
    spawnYaw: 180
  };
}
