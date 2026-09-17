import * as pc from 'playcanvas';
import type { BuiltWorld } from './gameTypes';

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

export function buildStaffArea(app: pc.Application, world: BuiltWorld): void {
  const wall = mat(new pc.Color(0.25, 0.27, 0.265), 0, 0.14);
  const trim = mat(new pc.Color(0.075, 0.08, 0.08), 0.45, 0.28);
  const laminate = mat(new pc.Color(0.30, 0.20, 0.13), 0, 0.26);
  const steel = mat(new pc.Color(0.22, 0.24, 0.25), 0.65, 0.38);
  const paper = mat(new pc.Color(0.72, 0.68, 0.52), 0, 0.12);
  const cork = mat(new pc.Color(0.30, 0.17, 0.08), 0, 0.12);
  const screen = mat(new pc.Color(0.015, 0.06, 0.055), 0, 0.55, new pc.Color(0.01, 0.08, 0.065));
  const doorMat = mat(new pc.Color(0.13, 0.14, 0.14), 0.55, 0.24);

  // Relocate temporary stock fixtures and remove their obsolete collision boxes.
  for (let i = world.colliders.length - 1; i >= 0; i--) {
    if (world.colliders[i].name === 'Stock shelf A' || world.colliders[i].name === 'Stock shelf B') world.colliders.splice(i, 1);
  }
  app.root.findByName('StockShelfA')?.setPosition(-5.05, 1.35, -9.55);
  app.root.findByName('StockShelfB')?.setPosition(-4.35, 1.35, -10.15);
  for (let i = 0; i < 7; i++) {
    app.root.findByName(`StockBox-${i}`)?.setPosition(-4.85 + (i % 2) * 0.62, 0.45 + (i % 3) * 0.58, -10.85 + (i % 2) * 1.05);
  }

  // Move the original temporary desk and monitor into the office proper.
  app.root.findByName('OfficeDesk')?.setPosition(-7.65, 0.75, -10.45);
  app.root.findByName('OfficeMonitor')?.setPosition(-7.65, 1.25, -10.48);
  app.root.findByName('OfficeMonitorScreen')?.setPosition(-7.65, 1.26, -10.37);

  // Manager office shell with a centered doorway.
  box(app, 'ManagerOfficeFloor', -7.75, 0.015, -10.0, 4.1, 0.06, 3.8, laminate);
  box(app, 'ManagerOfficeLeftWall', -9.72, 1.55, -10.0, 0.12, 3.1, 3.8, wall);
  box(app, 'ManagerOfficeRightWall', -5.78, 1.55, -10.0, 0.12, 3.1, 3.8, wall);
  box(app, 'ManagerOfficeBackWall', -7.75, 1.55, -11.82, 4.05, 3.1, 0.12, wall);
  box(app, 'ManagerOfficeFrontWallL', -8.95, 1.55, -8.18, 1.62, 3.1, 0.12, wall);
  box(app, 'ManagerOfficeFrontWallR', -6.42, 1.55, -8.18, 1.32, 3.1, 0.12, wall);
  box(app, 'ManagerOfficeDoorHeader', -7.65, 2.87, -8.18, 1.18, 0.46, 0.12, wall);
  box(app, 'ManagerOfficeDoorFrameL', -8.20, 1.35, -8.12, 0.08, 2.65, 0.12, trim);
  box(app, 'ManagerOfficeDoorFrameR', -7.10, 1.35, -8.12, 0.08, 2.65, 0.12, trim);

  collider(world, -9.72, -10.0, 0.12, 3.8, 'Manager office left wall');
  collider(world, -5.78, -10.0, 0.12, 3.8, 'Manager office right wall');
  collider(world, -7.75, -11.82, 4.05, 0.12, 'Manager office back wall');
  collider(world, -8.95, -8.18, 1.62, 0.12, 'Manager office front wall L');
  collider(world, -6.42, -8.18, 1.32, 0.12, 'Manager office front wall R');

  // Office props.
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

  const lamp = new pc.Entity('ManagerOfficeLight');
  lamp.addComponent('light', { type: 'omni', color: new pc.Color(0.92, 0.72, 0.45), intensity: 0.48, range: 4.1, castShadows: true, shadowResolution: 512 });
  lamp.setPosition(-7.55, 2.65, -10.0);
  app.root.addChild(lamp);

  // Middle stock/utility space with a visible rear delivery door.
  collider(world, -5.05, -9.55, 0.70, 4.0, 'Relocated stock shelf A');
  collider(world, -4.35, -10.15, 0.70, 2.6, 'Relocated stock shelf B');
  box(app, 'RearDeliveryDoor', -3.35, 1.45, -11.86, 1.20, 2.85, 0.09, doorMat);
  box(app, 'RearDoorPushBar', -3.35, 1.25, -11.79, 0.68, 0.08, 0.06, steel);
  const rearDoor = world.interactables.find((x) => x.id === 'back-door');
  if (rearDoor) {
    rearDoor.position.set(-3.35, 1.35, -11.72);
    rearDoor.radius = 2.3;
    rearDoor.aimRadius = 0.52;
  }

  const stockLight = new pc.Entity('StockRoomLight');
  stockLight.addComponent('light', { type: 'omni', color: new pc.Color(0.58, 0.67, 0.66), intensity: 0.30, range: 3.8, castShadows: false });
  stockLight.setPosition(-4.45, 2.65, -9.5);
  app.root.addChild(stockLight);
}
