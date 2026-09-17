import * as pc from 'playcanvas';
import type { BuiltWorld, Collider2D, Interactable } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

function mat(color: pc.Color, metalness = 0, gloss = 0.25, emissive?: pc.Color): pc.StandardMaterial {
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

export function buildStore(app: pc.Application, state: GameState, ui: GameUI): BuiltWorld {
  const colliders: Collider2D[] = [];
  const interactables: Interactable[] = [];

  const wall = mat(new pc.Color(0.33, 0.35, 0.34), 0, 0.16);
  const floor = mat(new pc.Color(0.075, 0.078, 0.08), 0, 0.24);
  const ceiling = mat(new pc.Color(0.10, 0.11, 0.105), 0, 0.12);
  const steel = mat(new pc.Color(0.27, 0.29, 0.30), 0.65, 0.42);
  const darkSteel = mat(new pc.Color(0.055, 0.06, 0.06), 0.7, 0.30);
  const counter = mat(new pc.Color(0.25, 0.105, 0.06), 0, 0.28);
  const laminate = mat(new pc.Color(0.48, 0.45, 0.36), 0, 0.34);
  const green = mat(new pc.Color(0.035, 0.18, 0.095), 0, 0.2);
  const red = mat(new pc.Color(0.48, 0.045, 0.025), 0, 0.23);
  const cream = mat(new pc.Color(0.68, 0.65, 0.48), 0, 0.18);
  const blue = mat(new pc.Color(0.10, 0.23, 0.32), 0, 0.25);
  const white = mat(new pc.Color(0.78, 0.81, 0.78), 0, 0.18);
  const screen = mat(new pc.Color(0.025, 0.08, 0.07), 0, 0.55, new pc.Color(0.015, 0.11, 0.085));
  const coolerGlass = mat(new pc.Color(0.08, 0.14, 0.16), 0.05, 0.72);

  // Main shell: 20m x 24m, player-height authored around real-world scale.
  addBox(app, 'Floor', new pc.Vec3(0, -0.08, 0), new pc.Vec3(20, 0.16, 24), floor);
  addBox(app, 'Ceiling', new pc.Vec3(0, 4.15, 0), new pc.Vec3(20, 0.10, 24), ceiling);
  addBox(app, 'LeftWall', new pc.Vec3(-10, 2.05, 0), new pc.Vec3(0.18, 4.1, 24), wall);
  addBox(app, 'RightWall', new pc.Vec3(10, 2.05, 0), new pc.Vec3(0.18, 4.1, 24), wall);
  addBox(app, 'BackWall', new pc.Vec3(0, 2.05, -12), new pc.Vec3(20, 4.1, 0.18), wall);
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

  // Coffee station, front-right.
  addBox(app, 'CoffeeCounter', new pc.Vec3(6.5, 0.62, 8.8), new pc.Vec3(4.5, 1.24, 1.15), counter);
  addBox(app, 'CoffeeTop', new pc.Vec3(6.5, 1.30, 8.8), new pc.Vec3(4.7, 0.12, 1.32), laminate);
  colliderFromBox(colliders, 6.5, 8.8, 4.5, 1.15, 'Coffee counter');
  addBox(app, 'CoffeeMachine', new pc.Vec3(6.1, 1.78, 8.85), new pc.Vec3(0.9, 0.92, 0.62), darkSteel);
  addBox(app, 'CoffeeFace', new pc.Vec3(6.1, 1.86, 8.52), new pc.Vec3(0.58, 0.42, 0.05), steel);
  addCylinder(app, 'CoffeePot', new pc.Vec3(6.1, 1.48, 8.47), new pc.Vec3(0.46, 0.48, 0.46), coolerGlass);
  for (let i = 0; i < 5; i++) addCylinder(app, `Cup-${i}`, new pc.Vec3(7.12, 1.47 + i * 0.08, 8.63), new pc.Vec3(0.32, 0.22, 0.32), cream);
  interactables.push({
    id: 'coffee', label: 'brew coffee', position: new pc.Vec3(6.1, 1.65, 8.15), radius: 2.5,
    onInteract: () => {
      if (state.complete('coffee')) return 'The brewer gurgles to life. Cheap coffee smells better at night.';
      return 'Coffee is already brewing.';
    }
  });

  // Four central aisles with thinner retail fixtures and deliberately varied merchandise.
  const aisleXs = [-5.1, -1.7, 1.7, 5.1];
  const productMats = [red, cream, blue, green, mat(new pc.Color(0.42, 0.22, 0.06)), mat(new pc.Color(0.15, 0.35, 0.22))];
  aisleXs.forEach((x, aisleIndex) => {
    const z = 0.4;
    addBox(app, `Aisle${aisleIndex + 1}-Base`, new pc.Vec3(x, 0.12, z), new pc.Vec3(2.15, 0.24, 8.3), darkSteel);
    addBox(app, `Aisle${aisleIndex + 1}-Back`, new pc.Vec3(x, 1.55, z), new pc.Vec3(0.08, 2.85, 8.2), steel);
    for (let side of [-1, 1]) {
      for (let tier = 0; tier < 4; tier++) {
        const shelfX = x + side * 0.55;
        const y = 0.43 + tier * 0.66;
        addBox(app, `A${aisleIndex + 1}-Shelf-${side}-${tier}`, new pc.Vec3(shelfX, y, z), new pc.Vec3(1.0, 0.055, 8.15), steel);
        for (let item = 0; item < 9; item++) {
          if ((item + tier + aisleIndex) % 7 === 0) continue;
          const pz = -3.25 + item * 0.80;
          const pm = productMats[(item + tier * 2 + aisleIndex) % productMats.length];
          const h = 0.27 + ((item + tier + aisleIndex) % 3) * 0.08;
          if ((item + aisleIndex) % 3 === 0) {
            addCylinder(app, `A${aisleIndex + 1}-Can-${side}-${tier}-${item}`, new pc.Vec3(shelfX - side * 0.06, y + h / 2 + 0.035, pz), new pc.Vec3(0.22, h, 0.22), pm);
          } else {
            addBox(app, `A${aisleIndex + 1}-Box-${side}-${tier}-${item}`, new pc.Vec3(shelfX - side * 0.06, y + h / 2 + 0.035, pz), new pc.Vec3(0.28, h, 0.20), pm);
          }
        }
      }
    }
    colliderFromBox(colliders, x, z, 2.15, 8.3, `Aisle ${aisleIndex + 1}`);
  });

  // Aisle 4 / rear cooler wall: dark frames, repeated doors, internal shelves and emissive-ish strips.
  const coolerZ = -10.7;
  addBox(app, 'CoolerBank', new pc.Vec3(4.8, 1.65, coolerZ), new pc.Vec3(9.5, 3.25, 0.9), darkSteel);
  colliderFromBox(colliders, 4.8, coolerZ, 9.5, 0.9, 'Cooler bank');
  for (let door = 0; door < 5; door++) {
    const x = 1.1 + door * 1.82;
    addBox(app, `CoolerGlass-${door}`, new pc.Vec3(x, 1.72, -10.20), new pc.Vec3(1.56, 2.72, 0.05), coolerGlass);
    addBox(app, `CoolerHandle-${door}`, new pc.Vec3(x + 0.57, 1.72, -10.13), new pc.Vec3(0.055, 1.45, 0.07), steel);
    for (let tier = 0; tier < 4; tier++) {
      const y = 0.60 + tier * 0.63;
      addBox(app, `CoolerShelf-${door}-${tier}`, new pc.Vec3(x, y, -10.47), new pc.Vec3(1.45, 0.045, 0.62), steel);
      for (let item = 0; item < 5; item++) {
        const px = x - 0.54 + item * 0.27;
        addCylinder(app, `CoolerDrink-${door}-${tier}-${item}`, new pc.Vec3(px, y + 0.18, -10.30), new pc.Vec3(0.15, 0.31, 0.15), productMats[(door + tier + item) % productMats.length]);
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
  addBox(app, 'StockShelfA', new pc.Vec3(-8.0, 1.35, -9.3), new pc.Vec3(0.7, 2.6, 4.0), steel);
  addBox(app, 'StockShelfB', new pc.Vec3(-5.6, 1.35, -10.0), new pc.Vec3(0.7, 2.6, 2.6), steel);
  colliderFromBox(colliders, -8.0, -9.3, 0.7, 4.0, 'Stock shelf A');
  colliderFromBox(colliders, -5.6, -10.0, 0.7, 2.6, 'Stock shelf B');
  for (let i = 0; i < 7; i++) {
    addBox(app, `StockBox-${i}`, new pc.Vec3(-7.9, 0.55 + (i % 3) * 0.65, -10.7 + (i % 2) * 1.2), new pc.Vec3(0.48, 0.48, 0.68), cream);
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
