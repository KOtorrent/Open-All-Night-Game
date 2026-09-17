import * as pc from 'playcanvas';

const canvas = document.getElementById('application') as HTMLCanvasElement;
if (!canvas) throw new Error('Missing #application canvas');

const app = new pc.Application(canvas);
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.scene.ambientLight = new pc.Color(0.08, 0.09, 0.1);
app.start();

const resize = () => app.resizeCanvas(canvas.width, canvas.height);
window.addEventListener('resize', resize);

function material(color: pc.Color, metalness = 0, gloss = 0.25): pc.StandardMaterial {
  const mat = new pc.StandardMaterial();
  mat.diffuse = color;
  mat.metalness = metalness;
  mat.gloss = gloss;
  mat.update();
  return mat;
}

function box(
  name: string,
  position: pc.Vec3,
  scale: pc.Vec3,
  mat: pc.StandardMaterial
): pc.Entity {
  const entity = new pc.Entity(name);
  entity.addComponent('render', { type: 'box' });
  entity.setPosition(position);
  entity.setLocalScale(scale);
  if (entity.render) entity.render.material = mat;
  app.root.addChild(entity);
  return entity;
}

const wallMat = material(new pc.Color(0.28, 0.31, 0.33), 0, 0.18);
const floorMat = material(new pc.Color(0.08, 0.085, 0.09), 0, 0.32);
const counterMat = material(new pc.Color(0.28, 0.12, 0.07), 0, 0.28);
const metalMat = material(new pc.Color(0.3, 0.32, 0.34), 0.7, 0.45);
const trimMat = material(new pc.Color(0.07, 0.08, 0.075), 0.2, 0.2);
const redMat = material(new pc.Color(0.45, 0.04, 0.03), 0, 0.25);

// Visual proof-of-concept: one authored convenience-store corner.
box('Floor', new pc.Vec3(0, -0.1, 0), new pc.Vec3(12, 0.2, 10), floorMat);
box('BackWall', new pc.Vec3(0, 2.5, -5), new pc.Vec3(12, 5, 0.2), wallMat);
box('SideWall', new pc.Vec3(-6, 2.5, 0), new pc.Vec3(0.2, 5, 10), wallMat);
box('Ceiling', new pc.Vec3(0, 5.05, 0), new pc.Vec3(12, 0.1, 10), trimMat);

// Counter shell.
box('CounterBase', new pc.Vec3(0, 0.65, -2.2), new pc.Vec3(5.5, 1.3, 1.1), counterMat);
box('CounterTop', new pc.Vec3(0, 1.36, -2.2), new pc.Vec3(5.8, 0.14, 1.25), metalMat);

// Simple shelving placeholder for the POC; this gets replaced by real GLB assets.
for (let i = 0; i < 4; i++) {
  box(`Shelf-${i}`, new pc.Vec3(3.7, 0.45 + i * 0.8, -4.45), new pc.Vec3(3.2, 0.08, 0.65), metalMat);
}
box('ShelfBack', new pc.Vec3(3.7, 1.7, -4.78), new pc.Vec3(3.2, 3.4, 0.08), trimMat);

// Register silhouette.
box('RegisterBase', new pc.Vec3(0.7, 1.62, -2.15), new pc.Vec3(1.05, 0.32, 0.72), trimMat);
box('RegisterScreen', new pc.Vec3(0.7, 2.0, -2.15), new pc.Vec3(0.78, 0.58, 0.12), metalMat);
box('Scanner', new pc.Vec3(-0.55, 1.53, -2.1), new pc.Vec3(0.75, 0.12, 0.55), trimMat);

// Product blocks only as scale references until real assets are imported.
for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 6; col++) {
    const product = box(
      `Product-${row}-${col}`,
      new pc.Vec3(2.45 + col * 0.5, 0.86 + row * 0.8, -4.35),
      new pc.Vec3(0.28, 0.62, 0.34),
      col % 2 === 0 ? redMat : counterMat
    );
    product.setEulerAngles(0, (col % 3 - 1) * 3, 0);
  }
}

// Main fluorescent fixtures.
for (const x of [-2.4, 2.4]) {
  const light = new pc.Entity(`Fluorescent-${x}`);
  light.addComponent('light', {
    type: 'omni',
    color: new pc.Color(0.82, 0.9, 1),
    intensity: 1.7,
    range: 7,
    castShadows: true,
    shadowResolution: 1024
  });
  light.setPosition(x, 4.25, -1.6);
  app.root.addChild(light);

  box(`Fixture-${x}`, new pc.Vec3(x, 4.82, -1.6), new pc.Vec3(1.8, 0.08, 0.45), material(new pc.Color(0.8, 0.82, 0.78), 0, 0.1));
}

const camera = new pc.Entity('Camera');
camera.addComponent('camera', {
  clearColor: new pc.Color(0.015, 0.02, 0.025),
  farClip: 100,
  fov: 64
});
camera.setPosition(0.2, 1.75, 5.6);
camera.lookAt(new pc.Vec3(0, 1.45, -2.4));
app.root.addChild(camera);

// Small title overlay so we always know which build is running.
const overlay = document.createElement('div');
overlay.textContent = 'OPEN ALL NIGHT — PLAYCANVAS POC';
overlay.style.cssText = 'position:fixed;left:18px;top:16px;color:#e8dfb1;font:13px monospace;letter-spacing:1px;pointer-events:none;text-shadow:0 1px 3px #000';
document.body.appendChild(overlay);
