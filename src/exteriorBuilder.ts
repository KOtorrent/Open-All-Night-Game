import * as pc from 'playcanvas';
import type { Collider2D } from './gameTypes';

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

export function buildExterior(app: pc.Application, colliders: Collider2D[]): void {
  const asphalt = material(new pc.Color(0.027, 0.031, 0.034), 0, 0.18);
  const curb = material(new pc.Color(0.29, 0.29, 0.25), 0, 0.16);
  const red = material(new pc.Color(0.37, 0.025, 0.018), 0.25, 0.28);
  const dark = material(new pc.Color(0.028, 0.033, 0.035), 0.45, 0.25);
  const metal = material(new pc.Color(0.34, 0.36, 0.34), 0.7, 0.42);
  const glass = material(new pc.Color(0.08, 0.18, 0.16), 0.05, 0.65, new pc.Color(0.01, 0.035, 0.025));
  const white = material(new pc.Color(0.72, 0.70, 0.61), 0, 0.16);
  const green = material(new pc.Color(0.025, 0.18, 0.075), 0, 0.2);
  const signGlow = material(new pc.Color(0.66, 0.58, 0.20), 0, 0.12, new pc.Color(0.32, 0.25, 0.055));
  const iceBlue = material(new pc.Color(0.62, 0.72, 0.74), 0.05, 0.25);

  // Forecourt and road. The interior ends at z=12; exterior extends to z=42.
  box(app, 'ForecourtAsphalt', new pc.Vec3(0, -0.10, 27), new pc.Vec3(34, 0.14, 30), asphalt);
  box(app, 'Road', new pc.Vec3(0, -0.12, 47), new pc.Vec3(50, 0.12, 10), asphalt);
  box(app, 'StoreWalkway', new pc.Vec3(0, -0.01, 14.2), new pc.Vec3(20, 0.16, 4.3), curb);

  // Parking stop blocks and faded lane stripes give the darkness scale.
  for (const x of [-7.2, -3.8, 3.8, 7.2]) {
    box(app, `ParkingStop-${x}`, new pc.Vec3(x, 0.05, 17.4), new pc.Vec3(1.8, 0.15, 0.26), curb);
  }
  for (const x of [-8.6, -5.5, -2.4, 2.4, 5.5, 8.6]) {
    box(app, `ParkingStripe-${x}`, new pc.Vec3(x, -0.01, 19.2), new pc.Vec3(0.08, 0.018, 5.2), white);
  }

  // Fuel canopy and support columns.
  box(app, 'CanopyRoof', new pc.Vec3(0, 4.7, 28.2), new pc.Vec3(18.5, 0.40, 11.5), white);
  box(app, 'CanopyFasciaFront', new pc.Vec3(0, 4.53, 33.78), new pc.Vec3(18.6, 0.62, 0.28), green);
  box(app, 'CanopyFasciaRear', new pc.Vec3(0, 4.53, 22.62), new pc.Vec3(18.6, 0.62, 0.28), green);
  for (const x of [-7.4, 7.4]) {
    cylinder(app, `CanopyColumn-${x}`, new pc.Vec3(x, 2.25, 28.2), new pc.Vec3(0.48, 4.5, 0.48), metal);
    collider(colliders, x, 28.2, 0.55, 0.55, 'Canopy column');
  }

  // Four islands / eight pumps. Pump 7 is one of the farthest units, matching game canon.
  const islandZ = [25.3, 30.7];
  let pumpNumber = 1;
  islandZ.forEach((z) => {
    for (const x of [-5.2, 5.2]) {
      box(app, `PumpIsland-${pumpNumber}`, new pc.Vec3(x, 0.10, z), new pc.Vec3(3.2, 0.22, 1.35), curb);
      for (const offset of [-0.70, 0.70]) {
        const px = x + offset;
        const n = pumpNumber++;
        box(app, `Pump-${n}-Body`, new pc.Vec3(px, 1.18, z), new pc.Vec3(0.82, 2.15, 0.64), red);
        box(app, `Pump-${n}-Face`, new pc.Vec3(px, 1.52, z - 0.335), new pc.Vec3(0.56, 0.52, 0.035), dark);
        box(app, `Pump-${n}-Display`, new pc.Vec3(px, 1.62, z - 0.357), new pc.Vec3(0.38, 0.18, 0.018), glass);
        box(app, `Pump-${n}-CardReader`, new pc.Vec3(px + 0.16, 1.27, z - 0.36), new pc.Vec3(0.14, 0.12, 0.02), dark);
        cylinder(app, `Pump-${n}-BollardL`, new pc.Vec3(px - 0.62, 0.54, z), new pc.Vec3(0.18, 1.08, 0.18), red);
        cylinder(app, `Pump-${n}-BollardR`, new pc.Vec3(px + 0.62, 0.54, z), new pc.Vec3(0.18, 1.08, 0.18), red);
        // A simple hose and nozzle hanging toward the island's other pump - two cheap primitives
        // per pump, no curve geometry, but enough to stop the pump body reading as a bare box.
        const hoseSide = offset < 0 ? 1 : -1;
        cylinder(app, `Pump-${n}-HoseMount`, new pc.Vec3(px + hoseSide * 0.42, 1.55, z), new pc.Vec3(0.08, 0.08, 0.08), dark);
        const hose = cylinder(app, `Pump-${n}-Hose`, new pc.Vec3(px + hoseSide * 0.55, 1.05, z), new pc.Vec3(0.045, 1.0, 0.045), dark);
        hose.setEulerAngles(0, 0, hoseSide * 18);
        box(app, `Pump-${n}-Nozzle`, new pc.Vec3(px + hoseSide * 0.70, 0.58, z), new pc.Vec3(0.10, 0.28, 0.09), dark);
        collider(colliders, px, z, 0.95, 0.78, `Pump ${n}`);
      }
    }
  });

  // Canopy lights with overlapping pools rather than one giant hotspot.
  for (const x of [-6.1, -2.0, 2.0, 6.1]) {
    const fixture = box(app, `CanopyFixture-${x}`, new pc.Vec3(x, 4.43, 28.2), new pc.Vec3(1.1, 0.055, 0.62), signGlow);
    fixture.setEulerAngles(0, 0, 0);
    const light = new pc.Entity(`CanopyLight-${x}`);
    light.addComponent('light', {
      type: 'omni',
      color: new pc.Color(0.88, 0.86, 0.69),
      intensity: 0.95,
      range: 7.3,
      castShadows: true,
      shadowResolution: 512
    });
    light.setPosition(x, 4.15, 28.2);
    app.root.addChild(light);
  }

  // Ice chest by the storefront.
  box(app, 'IceChestBody', new pc.Vec3(8.6, 0.72, 14.5), new pc.Vec3(1.75, 1.42, 1.0), iceBlue);
  const iceLid = box(app, 'IceChestLid', new pc.Vec3(8.6, 1.48, 14.5), new pc.Vec3(1.82, 0.16, 1.05), white);
  iceLid.setEulerAngles(-5, 0, 0);
  box(app, 'IceChestHandle', new pc.Vec3(8.6, 1.05, 13.98), new pc.Vec3(0.42, 0.10, 0.08), metal);
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
  cylinder(app, 'RoadSignPole', new pc.Vec3(-11.5, 2.6, 37.0), new pc.Vec3(0.22, 5.2, 0.22), metal);
  box(app, 'RoadSignPanel', new pc.Vec3(-11.5, 5.0, 37.0), new pc.Vec3(4.2, 1.9, 0.20), green);
  box(app, 'RoadSignGlowBand', new pc.Vec3(-11.5, 5.0, 36.88), new pc.Vec3(3.8, 0.18, 0.035), signGlow);

  // Darkness boundary silhouettes / tree line. Deliberately near-black, not detailed geometry.
  const treeMat = material(new pc.Color(0.006, 0.010, 0.008), 0, 0.05);
  for (let i = 0; i < 18; i++) {
    const x = -24 + i * 2.8;
    const height = 3.5 + ((i * 7) % 5) * 0.55;
    cylinder(app, `TreeTrunk-${i}`, new pc.Vec3(x, height * 0.35, 50.5), new pc.Vec3(0.28, height * 0.7, 0.28), treeMat);
    const crown = new pc.Entity(`TreeCrown-${i}`);
    crown.addComponent('render', { type: 'cone' });
    crown.setPosition(x, height, 50.5);
    crown.setLocalScale(2.2, height, 2.2);
    if (crown.render) crown.render.material = treeMat;
    app.root.addChild(crown);
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
