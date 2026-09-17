import * as pc from 'playcanvas';

function mat(color: pc.Color, metalness = 0, gloss = 0.18): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color;
  m.metalness = metalness;
  m.gloss = gloss;
  m.update();
  return m;
}

function box(app: pc.Application, name: string, pos: pc.Vec3, scale: pc.Vec3, material: pc.StandardMaterial): pc.Entity {
  const e = new pc.Entity(name);
  e.addComponent('render', { type: 'box' });
  e.setPosition(pos);
  e.setLocalScale(scale);
  if (e.render) e.render.material = material;
  app.root.addChild(e);
  return e;
}

function cyl(app: pc.Application, name: string, pos: pc.Vec3, scale: pc.Vec3, material: pc.StandardMaterial): pc.Entity {
  const e = new pc.Entity(name);
  e.addComponent('render', { type: 'cylinder' });
  e.setPosition(pos);
  e.setLocalScale(scale);
  if (e.render) e.render.material = material;
  app.root.addChild(e);
  return e;
}

/** Static dressing that makes the employee side read as a real working gas station. */
export class StaffDetailSystem {
  constructor(app: pc.Application) {
    const steel = mat(new pc.Color(0.20, 0.22, 0.21), 0.72, 0.30);
    const dark = mat(new pc.Color(0.055, 0.06, 0.058), 0.35, 0.18);
    const gray = mat(new pc.Color(0.28, 0.29, 0.27), 0.15, 0.16);
    const yellow = mat(new pc.Color(0.56, 0.43, 0.06), 0.12, 0.20);
    const red = mat(new pc.Color(0.42, 0.06, 0.045), 0.22, 0.22);
    const blue = mat(new pc.Color(0.06, 0.16, 0.25), 0.18, 0.18);
    const paper = mat(new pc.Color(0.68, 0.66, 0.55), 0, 0.05);

    // Two dented employee lockers in the utility corridor.
    for (let i = 0; i < 2; i++) {
      const x = -3.34 + i * 0.62;
      box(app, `EmployeeLocker-${i}`, new pc.Vec3(x, 1.05, -10.65), new pc.Vec3(0.54, 2.05, 0.48), steel);
      box(app, `EmployeeLockerVent-${i}`, new pc.Vec3(x, 1.55, -10.40), new pc.Vec3(0.30, 0.08, 0.025), dark);
      box(app, `EmployeeLockerHandle-${i}`, new pc.Vec3(x + 0.16, 1.08, -10.39), new pc.Vec3(0.035, 0.20, 0.035), dark);
    }

    // Janitorial corner: utility sink, mop bucket, broom and chemical jugs.
    box(app, 'UtilitySinkBasin', new pc.Vec3(-3.15, 0.92, -7.70), new pc.Vec3(0.92, 0.22, 0.70), gray);
    box(app, 'UtilitySinkPedestal', new pc.Vec3(-3.15, 0.45, -7.70), new pc.Vec3(0.36, 0.72, 0.32), steel);
    cyl(app, 'UtilitySinkFaucet', new pc.Vec3(-3.15, 1.18, -7.93), new pc.Vec3(0.055, 0.24, 0.055), steel);

    cyl(app, 'MopBucket', new pc.Vec3(-4.02, 0.31, -7.72), new pc.Vec3(0.48, 0.46, 0.48), yellow);
    const mopHandle = cyl(app, 'MopHandle', new pc.Vec3(-4.12, 1.18, -7.74), new pc.Vec3(0.055, 1.90, 0.055), gray);
    mopHandle.setEulerAngles(0, 0, -9);
    const broomHandle = cyl(app, 'BroomHandle', new pc.Vec3(-4.55, 1.10, -7.62), new pc.Vec3(0.045, 1.82, 0.045), gray);
    broomHandle.setEulerAngles(0, 0, 7);
    box(app, 'BroomHead', new pc.Vec3(-4.66, 0.20, -7.62), new pc.Vec3(0.48, 0.12, 0.16), dark).setEulerAngles(0, 0, 7);

    for (let i = 0; i < 3; i++) {
      const color = i === 0 ? red : i === 1 ? blue : yellow;
      cyl(app, `CleaningJug-${i}`, new pc.Vec3(-3.75 + i * 0.28, 1.26, -7.98), new pc.Vec3(0.19, 0.32, 0.19), color);
    }

    // Hand truck and collapsed cardboard near delivery door.
    box(app, 'HandTruckFrame', new pc.Vec3(-5.82, 0.92, -7.42), new pc.Vec3(0.08, 1.72, 0.72), steel).setEulerAngles(0, 0, -4);
    box(app, 'HandTruckToe', new pc.Vec3(-5.72, 0.12, -7.42), new pc.Vec3(0.48, 0.08, 0.76), steel);
    for (let i = 0; i < 3; i++) {
      const cardboard = box(app, `CollapsedCarton-${i}`, new pc.Vec3(-5.26 + i * 0.035, 0.42 + i * 0.025, -7.28), new pc.Vec3(0.75, 0.035, 1.02), mat(new pc.Color(0.33, 0.20, 0.09), 0, 0.06));
      cardboard.setEulerAngles(0, 9 - i * 6, -68 + i * 3);
    }

    // Office clutter: filing cabinet, corkboard, coffee mug and paper stack.
    box(app, 'OfficeFilingCabinet', new pc.Vec3(-9.23, 0.72, -9.20), new pc.Vec3(0.72, 1.42, 0.62), steel);
    for (let i = 0; i < 3; i++) {
      box(app, `OfficeDrawerPull-${i}`, new pc.Vec3(-9.23, 0.36 + i * 0.43, -8.87), new pc.Vec3(0.25, 0.035, 0.03), dark);
    }
    box(app, 'OfficeCorkboard', new pc.Vec3(-9.66, 1.87, -10.30), new pc.Vec3(0.035, 1.02, 1.42), mat(new pc.Color(0.36, 0.21, 0.09), 0, 0.08));
    for (let i = 0; i < 5; i++) {
      const note = box(app, `OfficeBoardNote-${i}`, new pc.Vec3(-9.63, 1.58 + (i % 2) * 0.38, -10.76 + i * 0.23), new pc.Vec3(0.018, 0.24, 0.18), paper);
      note.setEulerAngles(0, 0, -5 + i * 3);
    }
    cyl(app, 'OfficeMug', new pc.Vec3(-8.62, 1.21, -10.18), new pc.Vec3(0.14, 0.20, 0.14), red);
    for (let i = 0; i < 4; i++) {
      const sheet = box(app, `OfficeLoosePaper-${i}`, new pc.Vec3(-7.68 + i * 0.03, 1.20 + i * 0.008, -10.12 + i * 0.02), new pc.Vec3(0.46, 0.009, 0.62), paper);
      sheet.setEulerAngles(0, -8 + i * 5, 0);
    }
  }
}
