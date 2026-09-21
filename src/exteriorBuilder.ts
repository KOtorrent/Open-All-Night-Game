import * as pc from 'playcanvas';
import type { Collider2D } from './gameTypes';
import type { MaterialLibrary } from './materialLibrary';

function material(color: pc.Color, metalness = 0, gloss = 0.2, emissive?: pc.Color): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.metalness = metalness;
  m.gloss = gloss;
  if (emissive) {
    m.emissive = emissive;
    m.emissiveIntensity = 1;
  }
  m.update();
  return m;
}

function box(app: pc.Application, name: string, pos: pc.Vec3, scale: pc.Vec3, mat: pc.StandardMaterial): pc.Entity {
  const e = new pc.Entity(name);
  e.addComponent('render', { type: 'box' });
  e.setPosition(pos);
  e.setLocalScale(scale);
  if (e.render) e.render.material = mat;
  app.root.addChild(e);
  return e;
}

function cylinder(app: pc.Application, name: string, pos: pc.Vec3, scale: pc.Vec3, mat: pc.StandardMaterial): pc.Entity {
  const e = new pc.Entity(name);
  e.addComponent('render', { type: 'cylinder' });
  e.setPosition(pos);
  e.setLocalScale(scale);
  if (e.render) e.render.material = mat;
  app.root.addChild(e);
  return e;
}

function collider(colliders: Collider2D[], x: number, z: number, sx: number, sz: number, name: string): void {
  colliders.push({ minX: x - sx / 2, maxX: x + sx / 2, minZ: z - sz / 2, maxZ: z + sz / 2, name });
}

const PUMP_NUMBER_IDS = [
  'pump_number_1', 'pump_number_2', 'pump_number_3', 'pump_number_4',
  'pump_number_5', 'pump_number_6', 'pump_number_7', 'pump_number_8'
] as const;

export function buildExterior(app: pc.Application, colliders: Collider2D[], materials: MaterialLibrary): void {
  const asphaltMat = materials.getTiled('asphalt', 34, 30);
  const roadMat = materials.getTiled('asphalt', 50, 60, 0.35);
  const walkwayMat = materials.getTiled('concrete', 20, 4.3);
  const curbMat = materials.getTiled('concrete', 3, 3, 1.2);
  const canopyRoofMat = materials.getTiled('concrete', 18.5, 11.5, 0.5);
  const brandPanelMat = materials.getTiled('cases_brand_panel', 18.6, 0.62, 1.2);
  const columnMat = materials.get('brushed_steel');
  const pumpBodyMat = materials.get('painted_metal_pump_red');
  const dark = material(new pc.Color(0.06, 0.065, 0.07), 0.45, 0.25);
  const glass = material(new pc.Color(0.08, 0.18, 0.16), 0.05, 0.65, new pc.Color(0.01, 0.035, 0.025));
  const white = material(new pc.Color(0.72, 0.70, 0.61), 0, 0.16);
  const signGlow = material(new pc.Color(0.66, 0.58, 0.20), 0, 0.12, new pc.Color(0.32, 0.25, 0.055));
  const iceBlue = material(new pc.Color(0.62, 0.72, 0.74), 0.05, 0.25);
  const green = material(new pc.Color(0.025, 0.18, 0.075), 0, 0.2);
  const poleMat = material(new pc.Color(0.10, 0.09, 0.08), 0, 0.10);

  // ---------------------------------------------------------------------------------------------
  // Sky: a large inverted box surrounding the whole play area, textured with a vertical night-sky
  // gradient (dark zenith to a lighter blue-black horizon, with sparse stars) and rendered emissive
  // -only so it stays visible regardless of local scene lighting - this replaces the flat, gradient-
  // free pure-black clear color that previously made everything past the canopy read as an empty
  // void. cull=FRONT shows the inside face since the camera always sits well within the box.
  // ---------------------------------------------------------------------------------------------
  const sky = new pc.Entity('SkyDome');
  sky.addComponent('render', { type: 'box' });
  sky.setPosition(0, 20, 20);
  // Sized to stay well within the player camera's 220-unit far clip plane (see main.ts) from any
  // point in the playable area, while still being large enough that its curvature/edges are never
  // visible during normal play.
  sky.setLocalScale(300, 220, 300);
  if (sky.render) {
    const skyMat = materials.get('sky_gradient');
    skyMat.cull = pc.CULLFACE_FRONT;
    skyMat.update();
    sky.render.material = skyMat;
    sky.render.castShadows = false;
    sky.render.receiveShadows = false;
  }
  app.root.addChild(sky);

  // Forecourt and road. The interior ends at z=12; exterior extends to z=42.
  box(app, 'ForecourtAsphalt', new pc.Vec3(0, -0.10, 27), new pc.Vec3(34, 0.14, 30), asphaltMat);
  box(app, 'Road', new pc.Vec3(0, -0.12, 47), new pc.Vec3(50, 0.12, 10), roadMat);
  box(app, 'StoreWalkway', new pc.Vec3(0, -0.01, 14.2), new pc.Vec3(20, 0.16, 4.3), walkwayMat);

  // Parking stop blocks and faded lane stripes give the darkness scale.
  for (const x of [-7.2, -3.8, 3.8, 7.2]) {
    box(app, `ParkingStop-${x}`, new pc.Vec3(x, 0.05, 17.4), new pc.Vec3(1.8, 0.15, 0.26), curbMat);
  }
  for (const x of [-8.6, -5.5, -2.4, 2.4, 5.5, 8.6]) {
    box(app, `ParkingStripe-${x}`, new pc.Vec3(x, -0.01, 19.2), new pc.Vec3(0.08, 0.018, 5.2), white);
  }

  // Fuel canopy and support columns.
  box(app, 'CanopyRoof', new pc.Vec3(0, 4.7, 28.2), new pc.Vec3(18.5, 0.40, 11.5), canopyRoofMat);
  box(app, 'CanopyFasciaFront', new pc.Vec3(0, 4.53, 33.78), new pc.Vec3(18.6, 0.62, 0.28), brandPanelMat);
  box(app, 'CanopyFasciaRear', new pc.Vec3(0, 4.53, 22.62), new pc.Vec3(18.6, 0.62, 0.28), brandPanelMat);
  for (const x of [-7.4, 7.4]) {
    cylinder(app, `CanopyColumn-${x}`, new pc.Vec3(x, 2.25, 28.2), new pc.Vec3(0.48, 4.5, 0.48), columnMat);
    // Column base plinth - a small concrete collar where the steel column meets the pavement.
    cylinder(app, `CanopyColumnBase-${x}`, new pc.Vec3(x, 0.14, 28.2), new pc.Vec3(0.64, 0.28, 0.64), curbMat);
    collider(colliders, x, 28.2, 0.55, 0.55, 'Canopy column');
  }

  // Four islands / eight pumps. Pump 7 is one of the farthest units, matching game canon.
  // Believable late-90s/early-2000s pump silhouette: a distinct base plinth, a body, a payment/
  // display face, a nozzle cradle bracket (not just a bare hanging hose), and a numbered placard so
  // each pump reads as a specific, identifiable unit rather than a repeated anonymous box.
  const islandZ = [25.3, 30.7];
  let pumpNumber = 1;
  islandZ.forEach((z) => {
    for (const x of [-5.2, 5.2]) {
      box(app, `PumpIsland-${pumpNumber}`, new pc.Vec3(x, 0.10, z), new pc.Vec3(3.2, 0.22, 1.35), curbMat);
      for (const offset of [-0.70, 0.70]) {
        const px = x + offset;
        const n = pumpNumber++;
        // Base plinth: a low steel skirt the body sits on, distinct from the concrete island itself.
        box(app, `Pump-${n}-Base`, new pc.Vec3(px, 0.14, z), new pc.Vec3(0.74, 0.20, 0.58), dark);
        box(app, `Pump-${n}-Body`, new pc.Vec3(px, 1.18, z), new pc.Vec3(0.82, 2.15, 0.64), pumpBodyMat);
        box(app, `Pump-${n}-Face`, new pc.Vec3(px, 1.52, z - 0.335), new pc.Vec3(0.56, 0.52, 0.035), dark);
        box(app, `Pump-${n}-Display`, new pc.Vec3(px, 1.62, z - 0.357), new pc.Vec3(0.38, 0.18, 0.018), glass);
        box(app, `Pump-${n}-CardReader`, new pc.Vec3(px + 0.16, 1.27, z - 0.36), new pc.Vec3(0.14, 0.12, 0.02), dark);
        // Numbered placard on the pump's top cap - the generic identifying decal called for in the
        // graphics overhaul brief, using no real gasoline-company branding.
        const numberMat = materials.get(PUMP_NUMBER_IDS[(n - 1) % PUMP_NUMBER_IDS.length]);
        box(app, `Pump-${n}-NumberPlate`, new pc.Vec3(px, 2.14, z - 0.30), new pc.Vec3(0.22, 0.22, 0.02), numberMat);
        cylinder(app, `Pump-${n}-BollardL`, new pc.Vec3(px - 0.62, 0.54, z), new pc.Vec3(0.18, 1.08, 0.18), pumpBodyMat);
        cylinder(app, `Pump-${n}-BollardR`, new pc.Vec3(px + 0.62, 0.54, z), new pc.Vec3(0.18, 1.08, 0.18), pumpBodyMat);
        // Nozzle cradle: a small steel bracket the nozzle rests in, mounted on the pump's shoulder,
        // plus the hose/nozzle hanging from it toward the island's other pump.
        const hoseSide = offset < 0 ? 1 : -1;
        box(app, `Pump-${n}-Cradle`, new pc.Vec3(px + hoseSide * 0.40, 1.78, z), new pc.Vec3(0.14, 0.10, 0.16), dark);
        cylinder(app, `Pump-${n}-HoseMount`, new pc.Vec3(px + hoseSide * 0.42, 1.55, z), new pc.Vec3(0.08, 0.08, 0.08), dark);
        const hose = cylinder(app, `Pump-${n}-Hose`, new pc.Vec3(px + hoseSide * 0.55, 1.05, z), new pc.Vec3(0.045, 1.0, 0.045), dark);
        hose.setEulerAngles(0, 0, hoseSide * 18);
        box(app, `Pump-${n}-Nozzle`, new pc.Vec3(px + hoseSide * 0.70, 0.58, z), new pc.Vec3(0.10, 0.28, 0.09), dark);
        collider(colliders, px, z, 0.95, 0.78, `Pump ${n}`);
      }
    }
  });

  // Canopy lights with overlapping pools rather than one giant hotspot. See prior lighting-fix
  // history: boosted intensity/range here plus non-shadow fill lights below counter self-shadowing.
  for (const x of [-6.1, -2.0, 2.0, 6.1]) {
    const fixture = box(app, `CanopyFixture-${x}`, new pc.Vec3(x, 4.43, 28.2), new pc.Vec3(1.1, 0.055, 0.62), signGlow);
    fixture.setEulerAngles(0, 0, 0);
    const light = new pc.Entity(`CanopyLight-${x}`);
    light.addComponent('light', {
      type: 'omni',
      color: new pc.Color(0.88, 0.86, 0.69),
      intensity: 2.1,
      range: 8.6,
      castShadows: true,
      shadowResolution: 512
    });
    light.setPosition(x, 4.15, 28.2);
    app.root.addChild(light);
  }

  // Non-shadow fill lights: low, wide, deliberately dimmer than the canopy hotspots above so they
  // read as ambient fill rather than a second set of pools. Scoped in range/position to stay inside
  // the property so the distant road/treeline stays dark - only the forecourt/pump/parking area
  // brightens.
  const forecourtFill = [
    { z: 27.0, intensity: 0.85, range: 12.5 },
    { z: 19.0, intensity: 0.6, range: 11.0 }
  ];
  forecourtFill.forEach(({ z, intensity, range }, i) => {
    const fill = new pc.Entity(`ForecourtFillLight-${i}`);
    fill.addComponent('light', {
      type: 'omni',
      color: new pc.Color(0.58, 0.58, 0.52),
      intensity,
      range,
      castShadows: false
    });
    fill.setPosition(0, 2.6, z);
    app.root.addChild(fill);
  });

  // Ice chest by the storefront.
  box(app, 'IceChestBody', new pc.Vec3(8.6, 0.72, 14.5), new pc.Vec3(1.75, 1.42, 1.0), iceBlue);
  const iceLid = box(app, 'IceChestLid', new pc.Vec3(8.6, 1.48, 14.5), new pc.Vec3(1.82, 0.16, 1.05), white);
  iceLid.setEulerAngles(-5, 0, 0);
  box(app, 'IceChestHandle', new pc.Vec3(8.6, 1.05, 13.98), new pc.Vec3(0.42, 0.10, 0.08), columnMat);
  collider(colliders, 8.6, 14.5, 1.8, 1.05, 'Ice chest');

  // Dumpster / delivery-side clutter.
  box(app, 'DumpsterBody', new pc.Vec3(-8.4, 0.75, 16.2), new pc.Vec3(2.7, 1.5, 1.55), green);
  const dumpsterLid = box(app, 'DumpsterLid', new pc.Vec3(-8.4, 1.55, 16.2), new pc.Vec3(2.82, 0.18, 1.68), dark);
  dumpsterLid.setEulerAngles(-7, 0, 0);
  for (const x of [-9.3, -7.5]) {
    cylinder(app, `DumpsterWheel-${x}`, new pc.Vec3(x, 0.13, 16.72), new pc.Vec3(0.24, 0.18, 0.24), dark).setEulerAngles(90, 0, 0);
  }
  collider(colliders, -8.4, 16.2, 2.8, 1.65, 'Dumpster');

  // Roadside sign. Text comes later via authored texture; silhouette and glow are here now.
  cylinder(app, 'RoadSignPole', new pc.Vec3(-11.5, 2.6, 37.0), new pc.Vec3(0.22, 5.2, 0.22), columnMat);
  box(app, 'RoadSignPanel', new pc.Vec3(-11.5, 5.0, 37.0), new pc.Vec3(4.2, 1.9, 0.20), green);
  box(app, 'RoadSignGlowBand', new pc.Vec3(-11.5, 5.0, 36.88), new pc.Vec3(3.8, 0.18, 0.035), signGlow);

  // ---------------------------------------------------------------------------------------------
  // World depth: layered tree silhouettes at two distances (a near row and a hazier, taller far
  // row for atmospheric-perspective depth) plus a handful of roadside utility poles. All silhouette
  // geometry, deliberately simple, but now lit just enough by the sky's own faint horizon glow and a
  // dedicated low-intensity moonlight to actually read as shapes against the sky instead of
  // vanishing into it (the old pure #010101-ish tree material was, in practice, indistinguishable
  // from the old pure-black clear color it sat in front of).
  // ---------------------------------------------------------------------------------------------
  const moonlight = new pc.Entity('Moonlight');
  moonlight.addComponent('light', {
    type: 'directional',
    color: new pc.Color(0.20, 0.24, 0.32),
    intensity: 0.55,
    castShadows: false
  });
  moonlight.setEulerAngles(48, -35, 0);
  app.root.addChild(moonlight);

  const treeNear = material(new pc.Color(0.020, 0.028, 0.024), 0, 0.05);
  const treeFar = material(new pc.Color(0.045, 0.055, 0.065), 0, 0.04);
  for (let i = 0; i < 20; i++) {
    const x = -26 + i * 2.8;
    const height = 3.5 + ((i * 7) % 5) * 0.55;
    cylinder(app, `TreeTrunk-${i}`, new pc.Vec3(x, height * 0.35, 50.5), new pc.Vec3(0.28, height * 0.7, 0.28), treeNear);
    const crown = new pc.Entity(`TreeCrown-${i}`);
    crown.addComponent('render', { type: 'cone' });
    crown.setPosition(x, height, 50.5);
    crown.setLocalScale(2.2, height, 2.2);
    if (crown.render) crown.render.material = treeNear;
    app.root.addChild(crown);
  }
  // Far row: taller, sparser, further back and slightly bluer for a cheap haze/depth cue.
  for (let i = 0; i < 14; i++) {
    const x = -32 + i * 4.6;
    const height = 5.5 + ((i * 11) % 4) * 0.8;
    const crown = new pc.Entity(`TreeCrownFar-${i}`);
    crown.addComponent('render', { type: 'cone' });
    crown.setPosition(x, height * 0.9, 68);
    crown.setLocalScale(3.0, height, 3.0);
    if (crown.render) crown.render.material = treeFar;
    app.root.addChild(crown);
  }

  // Roadside utility poles: cheap silhouette accents (pole + crossbar) suggesting the wider rural
  // world without building an open world.
  for (const z of [40, 55, 70]) {
    const pole = cylinder(app, `UtilityPole-${z}`, new pc.Vec3(13.5, 3.4, z), new pc.Vec3(0.16, 6.8, 0.16), poleMat);
    void pole;
    box(app, `UtilityPoleCrossbar-${z}`, new pc.Vec3(13.5, 6.3, z), new pc.Vec3(1.6, 0.10, 0.10), poleMat);
  }

  // Soft storefront spill makes returning to the store readable from the forecourt.
  for (const x of [-4.5, 0, 4.5]) {
    const light = new pc.Entity(`StorefrontSpill-${x}`);
    light.addComponent('light', {
      type: 'omni',
      color: new pc.Color(0.65, 0.73, 0.68),
      intensity: 0.42,
      range: 5.6,
      castShadows: false
    });
    light.setPosition(x, 2.8, 13.4);
    app.root.addChild(light);
  }

  // Keep player within the useful exterior without blocking the store entrance.
  collider(colliders, -17.0, 29, 0.3, 34, 'West map boundary');
  collider(colliders, 17.0, 29, 0.3, 34, 'East map boundary');
  collider(colliders, 0, 44.8, 34, 0.3, 'Road boundary');
}
