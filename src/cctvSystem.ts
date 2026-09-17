import * as pc from 'playcanvas';
import type { BuiltWorld, Interactable } from './gameTypes';
import type { GameUI } from './ui';
import type { PlayerController } from './playerController';

interface CameraSpec {
  label: string;
  position: pc.Vec3;
  target: pc.Vec3;
}

export class CctvSystem {
  private readonly app: pc.Application;
  private readonly world: BuiltWorld;
  private readonly ui: GameUI;
  private readonly player: PlayerController;
  private readonly playerCamera: pc.Entity;
  private readonly cameras: pc.Entity[] = [];
  private readonly labels: string[] = [];
  private active = false;
  private index = 0;
  private enteredAt = 0;
  private interactable?: Interactable;

  constructor(app: pc.Application, world: BuiltWorld, ui: GameUI, player: PlayerController, playerCamera: pc.Entity) {
    this.app = app;
    this.world = world;
    this.ui = ui;
    this.player = player;
    this.playerCamera = playerCamera;
    this.buildCameras();
    this.installMonitorInteraction();
    window.addEventListener('keydown', (event) => this.onKeyDown(event));
  }

  private buildCameras(): void {
    const specs: CameraSpec[] = [
      { label: 'CAM 1 — FRONT ENTRANCE', position: new pc.Vec3(0.0, 3.65, 9.8), target: new pc.Vec3(0.0, 1.2, 4.8) },
      { label: 'CAM 2 — REGISTER', position: new pc.Vec3(-2.0, 3.45, 9.5), target: new pc.Vec3(-5.4, 1.25, 7.9) },
      { label: 'CAM 3 — AISLES 1–2', position: new pc.Vec3(-8.5, 3.55, 4.3), target: new pc.Vec3(-2.8, 1.1, -0.6) },
      { label: 'CAM 4 — AISLES 3–4', position: new pc.Vec3(8.5, 3.55, 4.3), target: new pc.Vec3(2.5, 1.1, -0.8) },
      { label: 'CAM 5 — COOLERS', position: new pc.Vec3(8.4, 3.35, -7.7), target: new pc.Vec3(4.8, 1.35, -10.25) },
      { label: 'CAM 6 — REAR DELIVERY', position: new pc.Vec3(-8.8, 3.15, -8.2), target: new pc.Vec3(-7.8, 1.0, -11.2) },
      { label: 'CAM 7 — PUMPS', position: new pc.Vec3(8.2, 3.65, 13.1), target: new pc.Vec3(0.0, 1.2, 27.5) },
      { label: 'CAM 8 — ROAD', position: new pc.Vec3(-8.2, 3.65, 13.1), target: new pc.Vec3(-10.0, 1.3, 38.0) }
    ];

    specs.forEach((spec, i) => {
      const camera = new pc.Entity(`CCTV-Camera-${i + 1}`);
      camera.addComponent('camera', {
        clearColor: new pc.Color(0.008, 0.012, 0.010),
        nearClip: 0.08,
        farClip: 180,
        fov: 66
      });
      camera.setPosition(spec.position);
      camera.lookAt(spec.target);
      if (camera.camera) camera.camera.enabled = false;
      this.app.root.addChild(camera);
      this.cameras.push(camera);
      this.labels.push(spec.label);
    });
  }

  private installMonitorInteraction(): void {
    const interactable: Interactable = {
      id: 'cctv-monitor',
      label: 'view CCTV',
      position: new pc.Vec3(-2.1, 1.3, -9.7),
      radius: 2.5,
      onInteract: () => {
        this.enter();
      }
    };
    this.interactable = interactable;
    this.world.interactables.push(interactable);
  }

  private enter(): void {
    if (this.active) return;
    this.active = true;
    this.enteredAt = performance.now();
    this.player.setActive(false);
    if (document.pointerLockElement) document.exitPointerLock();
    if (this.playerCamera.camera) this.playerCamera.camera.enabled = false;
    this.index = 0;
    this.enableSelectedCamera();
    this.ui.setCctv(true, this.labels[this.index]);
  }

  private exit(): void {
    if (!this.active) return;
    this.active = false;
    for (const camera of this.cameras) if (camera.camera) camera.camera.enabled = false;
    if (this.playerCamera.camera) this.playerCamera.camera.enabled = true;
    this.player.setActive(true);
    this.ui.setCctv(false);
    this.ui.showMessage('CCTV closed. Click to recapture the mouse.', 2200);
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (!this.active || event.repeat) return;
    if (performance.now() - this.enteredAt < 180) return;
    if (event.code === 'Escape') {
      event.preventDefault();
      this.exit();
      return;
    }
    if (event.code === 'KeyQ') {
      this.index = (this.index + this.cameras.length - 1) % this.cameras.length;
      this.enableSelectedCamera();
    } else if (event.code === 'KeyE') {
      this.index = (this.index + 1) % this.cameras.length;
      this.enableSelectedCamera();
    }
  }

  private enableSelectedCamera(): void {
    this.cameras.forEach((camera, i) => {
      if (camera.camera) camera.camera.enabled = i === this.index;
    });
    this.ui.setCctvLabel(`${this.labels[this.index]}   •   ${this.index + 1}/8   •   REC`);
  }
}
