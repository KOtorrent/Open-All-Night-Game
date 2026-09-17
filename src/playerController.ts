import * as pc from 'playcanvas';
import type { Collider2D, Interactable } from './gameTypes';
import type { GameUI } from './ui';

export class PlayerController {
  private readonly camera: pc.Entity;
  private readonly canvas: HTMLCanvasElement;
  private readonly colliders: Collider2D[];
  private readonly interactables: Interactable[];
  private readonly ui: GameUI;
  private readonly keys = new Set<string>();
  private yaw = 180;
  private pitch = 0;
  private locked = false;
  private active = true;
  private playerRadius = 0.28;
  // Tuned after first browser playtest. The original 3.2 m/s felt sluggish in the 20x24m store.
  private walkSpeed = 4.8;
  private sprintSpeed = 7.3;
  private currentTarget?: Interactable;

  constructor(
    camera: pc.Entity,
    canvas: HTMLCanvasElement,
    colliders: Collider2D[],
    interactables: Interactable[],
    ui: GameUI,
    yaw = 180
  ) {
    this.camera = camera;
    this.canvas = canvas;
    this.colliders = colliders;
    this.interactables = interactables;
    this.ui = ui;
    this.yaw = yaw;
    this.camera.setLocalEulerAngles(this.pitch, this.yaw, 0);
    this.bindInput();
  }

  setActive(active: boolean): void {
    this.active = active;
    this.keys.clear();
    this.currentTarget = undefined;
    this.ui.setPrompt(undefined);
  }

  isActive(): boolean {
    return this.active;
  }

  private bindInput(): void {
    this.canvas.addEventListener('click', () => {
      if (this.active) this.canvas.requestPointerLock();
    });
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === this.canvas;
      this.ui.help.style.opacity = this.locked ? '.25' : '.82';
    });
    window.addEventListener('keydown', (event) => {
      if (!this.active) return;
      this.keys.add(event.code);
      if (event.code === 'KeyE' && !event.repeat) this.interact();
    });
    window.addEventListener('keyup', (event) => this.keys.delete(event.code));
    window.addEventListener('blur', () => this.keys.clear());
    window.addEventListener('mousemove', (event) => {
      if (!this.active || !this.locked) return;
      this.yaw -= event.movementX * 0.105;
      this.pitch -= event.movementY * 0.105;
      this.pitch = Math.max(-82, Math.min(82, this.pitch));
      this.camera.setLocalEulerAngles(this.pitch, this.yaw, 0);
    });
  }

  update(dt: number): void {
    if (!this.active) return;

    const sprinting = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const speed = sprinting ? this.sprintSpeed : this.walkSpeed;
    let forwardInput = 0;
    let strafeInput = 0;
    if (this.keys.has('KeyW')) forwardInput += 1;
    if (this.keys.has('KeyS')) forwardInput -= 1;
    if (this.keys.has('KeyD')) strafeInput += 1;
    if (this.keys.has('KeyA')) strafeInput -= 1;

    if (forwardInput !== 0 || strafeInput !== 0) {
      const mag = Math.hypot(forwardInput, strafeInput) || 1;
      forwardInput /= mag;
      strafeInput /= mag;
      const radians = this.yaw * Math.PI / 180;
      const fx = -Math.sin(radians);
      const fz = -Math.cos(radians);
      const rx = Math.cos(radians);
      const rz = -Math.sin(radians);
      const dx = (fx * forwardInput + rx * strafeInput) * speed * dt;
      const dz = (fz * forwardInput + rz * strafeInput) * speed * dt;
      const pos = this.camera.getPosition().clone();
      const nextX = pos.x + dx;
      if (!this.blocked(nextX, pos.z)) pos.x = nextX;
      const nextZ = pos.z + dz;
      if (!this.blocked(pos.x, nextZ)) pos.z = nextZ;
      pos.y = 1.72;
      this.camera.setPosition(pos);
    }

    this.updateTarget();
  }

  private blocked(x: number, z: number): boolean {
    for (const c of this.colliders) {
      if (
        x + this.playerRadius > c.minX &&
        x - this.playerRadius < c.maxX &&
        z + this.playerRadius > c.minZ &&
        z - this.playerRadius < c.maxZ
      ) return true;
    }
    return false;
  }

  private updateTarget(): void {
    const pos = this.camera.getPosition();
    const yaw = this.yaw * Math.PI / 180;
    const pitch = this.pitch * Math.PI / 180;
    const forward = new pc.Vec3(
      -Math.sin(yaw) * Math.cos(pitch),
      -Math.sin(pitch),
      -Math.cos(yaw) * Math.cos(pitch)
    );

    let best: Interactable | undefined;
    let bestScore = -Infinity;
    for (const item of this.interactables) {
      const to = new pc.Vec3().sub2(item.position, pos);
      const distance = to.length();
      const maxDistance = item.radius ?? 2.6;
      if (distance > maxDistance) continue;
      to.normalize();
      const facing = forward.dot(to);
      if (facing < 0.72) continue;
      const score = facing * 2 - distance * 0.2;
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }
    this.currentTarget = best;
    this.ui.setPrompt(best?.label);
  }

  private interact(): void {
    if (!this.currentTarget) return;
    const result = this.currentTarget.onInteract();
    if (result) this.ui.showMessage(result);
  }
}
