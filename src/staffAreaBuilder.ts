import * as pc from 'playcanvas';
import type { BuiltWorld } from './gameTypes';
import type { MaterialLibrary } from './materialLibrary';

function mat(color: pc.Color, metalness = 0, gloss = 0.2, emissive?: pc.Color): pc.StandardMaterial {
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

function box(app: pc.Application, name: string, x: number, y: number, z: number, sx: number, sy: number, sz: number, material: pc.StandardMaterial): pc.Entity {
  const e = new pc.Entity(name);
  e.addComponent('render', { type: 'box' });
  e.setPosition(x, y, z);
  e.setLocalScale(sx, sy, sz);
  if (e.render) e.render.material = material;
  app.root.addChild(e);
  return e;
}

function cylinder(app: pc.Application, name: string, x: number, y: number, z: number, sx: number, sy: number, sz: number, material: pc.StandardMaterial): pc.Entity {
  const e = new pc.Entity(name);
  e.addComponent('render', { type: 'cylinder' });
  e.setPosition(x, y, z);
  e.setLocalScale(sx, sy, sz);
  if (e.render) e.render.material = material;
  app.root.addChild(e);
  return e;
}

function collider(world: BuiltWorld, x: number, z: number, sx: number, sz: number, name: string): void {
  world.colliders.push({ minX: x - sx / 2, maxX: x + sx / 2, minZ: z - sz / 2, maxZ: z + sz / 2, name });
}

function removeCollider(world: BuiltWorld, ...names: string[]): void {
  for (let i = world.colliders.length - 1; i >= 0; i--) {
    if (names.includes(world.colliders[i].name ?? '')) world.colliders.splice(i, 1);
  }
}

function addFixtureLight(
  app: pc.Application,
  name: string,
  x: number,
  z: number,
  intensity: number,
  range: number,
  fixtureMaterial: pc.StandardMaterial,
  castShadows = false
): void {
  box(app, `${name}-Fixture`, x, 3.02, z, 1.05, 0.06, 0.28, fixtureMaterial);
  const light = new pc.Entity(name);
  light.addComponent('light', {
    type: 'omni',
    color: new pc.Color(0.78, 0.84, 0.82),
    intensity,
    range,
    castShadows,
    shadowResolution: 512
  });
  light.setPosition(x, 2.82, z);
  app.root.addChild(light);
}

export function buildStaffArea(app: pc.Application, world: BuiltWorld, materials: MaterialLibrary): void {
  // Office/stockroom materials now draw from the shared library (graphics overhaul Pass 2) instead
  // of flat single colors: aged office drywall, a real laminate desktop/floor, brushed steel for the
  // file cabinet and hardware, and the paper texture for the corkboard notices.
  const wall = materials.getTiled('drywall_office', 4.05, 3.1);
  const trim = mat(new pc.Color(0.075, 0.08, 0.08), 0.45, 0.28);
  const laminate = materials.getTiled('laminate_counter', 4.1, 3.8);
  const steel = materials.get('brushed_steel');
  const paper = materials.get('paper');
  const cork = mat(new pc.Color(0.30, 0.17, 0.08), 0, 0.12);
  const screen = mat(new pc.Color(0.015, 0.06, 0.055), 0, 0.55, new pc.Color(0.01, 0.08, 0.065));
  const doorMat = mat(new pc.Color(0.13, 0.14, 0.14), 0.55, 0.24);
  const fixtureMat = mat(new pc.Color(0.76, 0.80, 0.78), 0, 0.18, new pc.Color(0.18, 0.22, 0.21));

  // These shelves previously sat at z=-9.55/-10.15, which put their collider fully across the
  // manager office's only doorway (door gap z -10.2 to -9.0) with just a 0.32m sliver to the wall
  // on either side — narrower than the player's 0.56m collision width. A BFS reachability check
  // over the actual world.colliders confirmed the office (and its lore interactables) was
  // completely unreachable on foot. Tucking the shelves into the back-wall corner instead, clear
  // of the door's z-band, restores a walkable corridor while keeping them in the same stockroom nook.
  removeCollider(world, 'Stock shelf A', 'Stock shelf B');
  // The back-wall nook available here is only ~1.6m deep (back wall at z=-11.82 to the office
  // door's z-band starting at -10.2), far shallower than these shelves' original 4.0m/2.6m length,
  // so they are shortened to actually fit the nook instead of sticking out across the doorway again.
  const stockShelfA = app.root.findByName('StockShelfA') as pc.Entity | null;
  stockShelfA?.setPosition(-5.05, 1.35, -11.15);
  stockShelfA?.setLocalScale(0.7, 2.6, 1.3);
  const stockShelfB = app.root.findByName('StockShelfB') as pc.Entity | null;
  stockShelfB?.setPosition(-4.35, 1.35, -11.05);
  stockShelfB?.setLocalScale(0.7, 2.6, 1.0);
  for (let i = 0; i < 7; i++) {
    app.root.findByName(`StockBox-${i}`)?.setPosition(-4.85 + (i % 2) * 0.62, 0.45 + (i % 3) * 0.58, -11.35 + (i % 2) * 0.55);
  }

  app.root.findByName('OfficeDesk')?.setPosition(-7.65, 0.75, -10.45);
  app.root.findByName('OfficeMonitor')?.setPosition(-7.65, 1.25, -10.48);
  app.root.findByName('OfficeMonitorScreen')?.setPosition(-7.65, 1.26, -10.37);

  box(app, 'ManagerOfficeFloor', -7.75, 0.015, -10.0, 4.1, 0.06, 3.8, laminate);
  box(app, 'ManagerOfficeLeftWall', -9.72, 1.55, -10.0, 0.12, 3.1, 3.8, wall);
  box(app, 'ManagerOfficeBackWall', -7.75, 1.55, -11.82, 4.05, 3.1, 0.12, wall);
  box(app, 'ManagerOfficeFrontWall', -7.75, 1.55, -8.18, 4.05, 3.1, 0.12, wall);
  box(app, 'ManagerOfficeRightWallBack', -5.78, 1.55, -11.01, 0.12, 3.1, 1.62, wall);
  box(app, 'ManagerOfficeRightWallFront', -5.78, 1.55, -8.59, 0.12, 3.1, 0.82, wall);
  box(app, 'ManagerOfficeSideDoorHeader', -5.78, 2.87, -9.60, 0.12, 0.46, 1.20, wall);
  box(app, 'ManagerOfficeSideDoorFrameBack', -5.72, 1.35, -10.15, 0.10, 2.65, 0.08, trim);
  box(app, 'ManagerOfficeSideDoorFrameFront', -5.72, 1.35, -9.05, 0.10, 2.65, 0.08, trim);

  collider(world, -9.72, -10.0, 0.12, 3.8, 'Manager office left wall');
  collider(world, -7.75, -11.82, 4.05, 0.12, 'Manager office back wall');
  collider(world, -7.75, -8.18, 4.05, 0.12, 'Manager office front wall');
  collider(world, -5.78, -11.01, 0.12, 1.62, 'Manager office right wall back');
  collider(world, -5.78, -8.59, 0.12, 0.82, 'Manager office right wall front');

  cylinder(app, 'OfficeChairPedestal', -8.45, 0.47, -9.73, 0.20, 0.70, 0.20, trim);
  box(app, 'OfficeChairSeat', -8.45, 0.86, -9.73, 0.62, 0.13, 0.62, trim);
  const chairBack = box(app, 'OfficeChairBack', -8.45, 1.22, -10.02, 0.62, 0.67, 0.12, trim);
  chairBack.setEulerAngles(-8, 0, 0);
  box(app, 'OfficeFileCabinet', -6.35, 0.82, -11.05, 0.72, 1.62, 0.62, steel);
  for (let i = 0; i < 3; i++) {
    box(app, `OfficeFileDrawer-${i}`, -6.35, 0.38 + i * 0.46, -10.72, 0.58, 0.34, 0.025, trim);
    box(app, `OfficeFileHandle-${i}`, -6.35, 0.38 + i * 0.46, -10.69, 0.18, 0.04, 0.025, steel);
  }
  box(app, 'OfficeBulletinBoard', -9.63, 1.80, -10.15, 0.035, 1.20, 1.55, cork);
  for (let i = 0; i < 4; i++) box(app, `OfficePaper-${i}`, -9.59, 1.45 + (i % 2) * 0.52, -10.57 + Math.floor(i / 2) * 0.78, 0.018, 0.36, 0.54, paper);
  box(app, 'OfficeMonitorGlow', -7.65, 1.26, -10.34, 0.54, 0.36, 0.018, screen);
  // Keyboard and mug on the clear right-hand side of the desk, away from the monitor and the
  // roster/incident-folder/terminal props officeLoreSystem.ts already lays out on the left side.
  box(app, 'OfficeKeyboard', -6.95, 0.825, -10.30, 0.42, 0.02, 0.16, trim).setEulerAngles(0, -6, 0);
  cylinder(app, 'OfficeMug', -6.85, 0.87, -10.55, 0.11, 0.14, 0.11, mat(new pc.Color(0.42, 0.06, 0.05), 0.15, 0.2));

  // Human playtesting confirmed the staff area reads as crushed-black despite these fixtures being
  // present: PlayCanvas omni-light falloff at the intensity scale used elsewhere in this file (under
  // ~1.0) is nearly invisible on these mid-gray diffuse walls. Empirically verified in-engine that an
  // intensity around 4 on a ~6m range is what actually reads as "lit room" without blowing out.
  addFixtureLight(app, 'ManagerOfficeCeilingLight', -7.65, -9.65, 4.0, 6.0, fixtureMat, true);
  const deskLamp = new pc.Entity('ManagerDeskLamp');
  deskLamp.addComponent('light', {
    type: 'omni', color: new pc.Color(0.94, 0.74, 0.48), intensity: 1.6, range: 3.4,
    castShadows: false
  });
  deskLamp.setPosition(-7.45, 1.72, -10.35);
  app.root.addChild(deskLamp);

  collider(world, -5.05, -11.15, 0.70, 1.3, 'Relocated stock shelf A');
  collider(world, -4.35, -11.05, 0.70, 1.0, 'Relocated stock shelf B');
  box(app, 'RearDeliveryDoor', -3.35, 1.45, -11.86, 1.20, 2.85, 0.09, doorMat);
  box(app, 'RearDoorPushBar', -3.35, 1.25, -11.79, 0.68, 0.08, 0.06, steel);
  const rearDoor = world.interactables.find((x) => x.id === 'back-door');
  if (rearDoor) {
    rearDoor.position.set(-3.35, 1.35, -11.72);
    rearDoor.radius = 2.3;
    rearDoor.aimRadius = 0.52;
  }

  addFixtureLight(app, 'StockRoomFrontLight', -4.25, -8.45, 2.8, 5.6, fixtureMat, false);
  addFixtureLight(app, 'StockRoomRearLight', -3.65, -10.65, 2.4, 5.2, fixtureMat, false);

  const oldBackLight = app.root.findByName('BackHallLight') as pc.Entity | null;
  if (oldBackLight?.light) oldBackLight.light.intensity = 0.18;
}
