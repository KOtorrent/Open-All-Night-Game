import * as pc from 'playcanvas';

export interface Collider2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  name?: string;
}

export interface Interactable {
  id: string;
  label: string;
  position: pc.Vec3;
  radius?: number;
  onInteract: () => string | void;
}

export interface BuiltWorld {
  colliders: Collider2D[];
  interactables: Interactable[];
  spawn: pc.Vec3;
  spawnYaw: number;
}
