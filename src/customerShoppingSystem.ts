import * as pc from 'playcanvas';

const HAND_BONE = 'Wrist.R';
const TURN_DEGREES_PER_SECOND = 420; // completes a ~180 deg turn in well under the brief's 0.2-0.5s window

interface ShoppingStop {
  rootName: string;
  /** World XZ position that matches the dwell waypoint written into that customer's own route. */
  stopX: number;
  stopZ: number;
  radius: number;
  dwellSeconds: number;
  facingTarget: pc.Vec3;
  prop: 'snack' | 'box' | 'bottle' | 'can' | 'cup';
  coolerDoorIndex?: number;
}

/**
 * Presentation-only layer for the customer shopping detours added in
 * docs/CUSTOMER_SHOPPING_BEHAVIOR.md. Never touches route/phase/timing logic (that lives in each
 * customer system's own dwellAt/dwellRemaining fields) - this only watches for a named customer
 * root sitting still at a known stop position and, purely visually, turns them to face the
 * fixture, shows a small carried-item prop on their hand, and (for the cooler stop) swings the
 * matching glass door open and closed. If it can't find something it expects (a bone, an entity),
 * it fails silently and leaves the character where the base walk/idle system already put them.
 */
export class CustomerShoppingSystem {
  private readonly app: pc.Application;
  private readonly stops: ShoppingStop[] = [
    { rootName: 'Earl-Regular-Customer', stopX: 2.3, stopZ: 2.4, radius: 0.35, dwellSeconds: 2.2, facingTarget: new pc.Vec3(1.15, 1.4, 2.4), prop: 'snack' },
    { rootName: 'Marcus-Regular', stopX: 5.65, stopZ: 1.0, radius: 0.35, dwellSeconds: 2.0, facingTarget: new pc.Vec3(5.1, 1.4, 1.0), prop: 'box' },
    { rootName: 'Marcus-Regular', stopX: 1.7, stopZ: 3.5, radius: 0.35, dwellSeconds: 2.0, facingTarget: new pc.Vec3(2.25, 1.4, 3.5), prop: 'can' },
    { rootName: 'Dale', stopX: 4.74, stopZ: -9.55, radius: 0.35, dwellSeconds: 3.2, facingTarget: new pc.Vec3(4.74, 1.6, -10.20), prop: 'bottle', coolerDoorIndex: 2 },
    { rootName: 'LateNightTraveler', stopX: 6.3, stopZ: 9.0, radius: 0.35, dwellSeconds: 2.0, facingTarget: new pc.Vec3(6.1, 1.4, 8.15), prop: 'cup' }
  ];

  // Each customer's final (checkout) route waypoint, used only to clear a carried prop once they
  // arrive - the existing per-customer spawnItems()/clearCheckoutItems() counter-item visuals
  // (already implemented in each customer system) remain the sole "item on the counter"
  // representation, so this never spawns a second, possibly-mismatched counter prop.
  private readonly checkoutPositions: Record<string, { x: number; z: number }> = {
    'Earl-Regular-Customer': { x: -3.90, z: 7.45 },
    'Marcus-Regular': { x: -3.55, z: 7.35 },
    'Dale': { x: -2.40, z: 7.45 },
    'LateNightTraveler': { x: -2.90, z: 7.45 }
  };

  // Per-root live state, keyed by root entity guid (survives across multiple stops for the same
  // customer, e.g. Marcus's two aisle visits).
  private readonly active = new Map<string, {
    stop: ShoppingStop;
    elapsed: number;
    propEntity?: pc.Entity;
    turnBackYaw?: number;
  }>();

  /** Carried-item prop entities that persist after a stop ends, cleared on checkout arrival. */
  private readonly carriedProps = new Map<string, pc.Entity>();

  private readonly coolerDoorState = new Map<number, { pivot: pc.Entity; angle: number; target: number }>();
  private readonly propMaterials = new Map<string, pc.StandardMaterial>();
  private readonly getRouteInfo: (rootName: string) => { route: pc.Vec3[]; waypoint: number } | null;

  constructor(app: pc.Application, getRouteInfo: (rootName: string) => { route: pc.Vec3[]; waypoint: number } | null) {
    this.app = app;
    this.getRouteInfo = getRouteInfo;
  }

  update(dt: number): void {
    for (const stop of this.stops) {
      const root = this.app.root.findByName(stop.rootName) as pc.Entity | null;
      if (!root || !root.enabled) continue;
      const guid = root.getGuid();
      const pos = root.getPosition();
      const dx = pos.x - stop.stopX, dz = pos.z - stop.stopZ;
      const withinStop = (dx * dx + dz * dz) < stop.radius * stop.radius;

      const existing = this.active.get(guid);
      if (withinStop && !existing) {
        // Lightweight reservation (Phase 14): every stop below happens to belong to a single,
        // distinct customer today, so this never actually blocks anything yet - kept as a genuine
        // safeguard for whenever a future pass reuses a stop position across two customers, rather
        // than a no-op check that would silently stop protecting anything the moment that happens.
        if (!this.isStopReservedByOther(stop, guid)) this.beginStop(root, stop, guid);
      } else if (existing && existing.stop === stop) {
        this.driveStop(root, existing, dt, guid);
        if (!withinStop) {
          // Customer's own route already advanced past the dwell (dwellRemaining hit zero and
          // moveActor resumed) - clean up immediately rather than waiting for the next frame.
          this.active.delete(guid);
        }
      }
    }

    this.updateCheckoutHandoff();
    this.updateCoolerDoors(dt);
  }

  /** Clears a carried prop (Phase 9/10) the moment its owner arrives at their own checkout spot - the existing per-customer counter-item spawn remains the single source of truth for "item on the counter". */
  private updateCheckoutHandoff(): void {
    for (const [guid, prop] of this.carriedProps) {
      const root = this.findRootByGuid(guid);
      if (!root) { prop.destroy(); this.carriedProps.delete(guid); continue; }
      const checkout = this.checkoutPositions[root.name];
      if (!checkout) continue;
      const pos = root.getPosition();
      const dx = pos.x - checkout.x, dz = pos.z - checkout.z;
      if (dx * dx + dz * dz < 0.6 * 0.6) {
        prop.destroy();
        this.carriedProps.delete(guid);
      }
    }
  }

  private findRootByGuid(guid: string): pc.Entity | null {
    for (const stop of this.stops) {
      const root = this.app.root.findByName(stop.rootName) as pc.Entity | null;
      if (root && root.getGuid() === guid) return root;
    }
    return null;
  }

  private isStopReservedByOther(stop: ShoppingStop, ownGuid: string): boolean {
    for (const [guid, state] of this.active) {
      if (guid !== ownGuid && state.stop === stop) return true;
    }
    return false;
  }

  private beginStop(root: pc.Entity, stop: ShoppingStop, guid: string): void {
    this.active.set(guid, { stop, elapsed: 0 });
    if (stop.coolerDoorIndex !== undefined) this.openCoolerDoor(stop.coolerDoorIndex);
  }

  private driveStop(root: pc.Entity, state: { stop: ShoppingStop; elapsed: number; propEntity?: pc.Entity }, dt: number, guid: string): void {
    state.elapsed += dt;
    const stop = state.stop;

    // First 40% of the dwell: turn to face the fixture. Last 40%: turn back toward the direction
    // they'll resume walking in (their route's next waypoint), so moveActor never has to snap when
    // it resumes. Middle 20%: hold facing the fixture and let the item appear in hand.
    const turnOutEnd = stop.dwellSeconds * 0.4;
    const turnBackStart = stop.dwellSeconds * 0.6;

    if (state.elapsed < turnOutEnd) {
      this.turnToward(root, stop.facingTarget, dt);
    } else if (state.elapsed >= turnOutEnd && !state.propEntity) {
      // A customer visiting two stops (Marcus) swaps their carried item rather than juggling two -
      // matches the brief's "0-2 visual items" cap without a second attachment point.
      const previous = this.carriedProps.get(guid);
      if (previous) previous.destroy();
      state.propEntity = this.attachHandProp(root, stop.prop);
      if (state.propEntity) this.carriedProps.set(guid, state.propEntity);
    }

    if (state.elapsed >= turnBackStart) {
      const nextDir = this.nextRouteDirection(root);
      if (nextDir) this.turnToward(root, nextDir, dt);
    }

    if (stop.coolerDoorIndex !== undefined && state.elapsed >= stop.dwellSeconds - 0.5) {
      this.closeCoolerDoor(stop.coolerDoorIndex);
    }
  }

  private turnToward(root: pc.Entity, target: pc.Vec3, dt: number): void {
    const pos = root.getPosition();
    const dx = target.x - pos.x, dz = target.z - pos.z;
    if (Math.abs(dx) < 0.001 && Math.abs(dz) < 0.001) return;
    const desiredYaw = Math.atan2(-dx, -dz) * 180 / Math.PI;
    const currentYaw = root.getEulerAngles().y;
    const delta = this.shortestAngleDelta(currentYaw, desiredYaw);
    const maxStep = TURN_DEGREES_PER_SECOND * dt;
    const step = Math.max(-maxStep, Math.min(maxStep, delta));
    root.setEulerAngles(0, currentYaw + step, 0);
  }

  private shortestAngleDelta(from: number, to: number): number {
    let delta = (to - from) % 360;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    return delta;
  }

  /** Reads (never mutates) the owning customer system's own current route/waypoint, purely to pick a natural turn-back direction once the dwell is ending. */
  private nextRouteDirection(root: pc.Entity): pc.Vec3 | null {
    const info = this.getRouteInfo(root.name);
    if (!info || info.waypoint >= info.route.length) return null;
    return info.route[info.waypoint];
  }

  private attachHandProp(root: pc.Entity, prop: ShoppingStop['prop']): pc.Entity | undefined {
    const model = root.findByName(`${root.name}-AuthoredModel`) as pc.Entity | null;
    const hand = model?.findByName(HAND_BONE) as pc.Entity | null;
    if (!hand) return undefined;

    const entity = this.buildProp(prop);
    hand.addChild(entity);
    return entity;
  }

  private buildProp(prop: ShoppingStop['prop']): pc.Entity {
    const entity = new pc.Entity(`CarriedItem-${prop}`);
    const render = (type: 'box' | 'cylinder', color: pc.Color, gloss: number) => {
      entity.addComponent('render', { type });
      const mat = this.getPropMaterial(`${prop}`, color, gloss);
      if (entity.render) entity.render.material = mat;
    };
    switch (prop) {
      case 'snack':
        render('box', new pc.Color(0.58, 0.15, 0.05), 0.2);
        entity.setLocalScale(0.14, 0.20, 0.05);
        break;
      case 'box':
        render('box', new pc.Color(0.62, 0.55, 0.30), 0.15);
        entity.setLocalScale(0.13, 0.09, 0.16);
        break;
      case 'bottle':
        render('cylinder', new pc.Color(0.08, 0.34, 0.31), 0.34);
        entity.setLocalScale(0.08, 0.20, 0.08);
        break;
      case 'can':
        render('cylinder', new pc.Color(0.55, 0.08, 0.08), 0.4);
        entity.setLocalScale(0.065, 0.12, 0.065);
        break;
      case 'cup':
        render('cylinder', new pc.Color(0.78, 0.71, 0.54), 0.12);
        entity.setLocalScale(0.07, 0.11, 0.07);
        break;
    }
    // Local offset/rotation so the prop reads as held in a downward-hanging hand rather than
    // floating at the wrist joint's own pivot.
    entity.setLocalPosition(0.03, -0.08, 0.02);
    entity.setLocalEulerAngles(0, 0, 0);
    return entity;
  }

  private getPropMaterial(key: string, color: pc.Color, gloss: number): pc.StandardMaterial {
    let mat = this.propMaterials.get(key);
    if (!mat) {
      mat = new pc.StandardMaterial();
      mat.diffuse = color;
      mat.gloss = gloss;
      mat.update();
      this.propMaterials.set(key, mat);
    }
    return mat;
  }

  // --- Cooler door hinge (Phase 8) -------------------------------------------------------------
  //
  // The existing CoolerGlass-${index} box entities (storeBuilder.ts) are already one-per-door, not
  // a single shared pane, so no new door entities are needed - just a pivot to hinge each one
  // around its edge instead of its center. Reparenting an entity in this engine does not preserve
  // world transform (`reparent()` is a plain remove()+addChild()), so the pivot is set up once,
  // lazily, on first use: create a pivot entity at the door's LEFT edge (world space), reparent the
  // existing door as its child with the matching local offset, then only ever rotate the pivot
  // afterward. This preserves the door's original gameplay geometry/collider (untouched) and its
  // exact starting visual position - only its own render entity moves.

  private setupCoolerDoorPivot(index: number): pc.Entity | null {
    const door = this.app.root.findByName(`CoolerGlass-${index}`) as pc.Entity | null;
    if (!door) return null;
    const parent = door.parent as pc.Entity;
    const doorPos = door.getPosition();
    const halfWidth = door.getLocalScale().x / 2;
    const hingeWorldX = doorPos.x - halfWidth;

    const pivot = new pc.Entity(`CoolerDoorPivot-${index}`);
    parent.addChild(pivot);
    pivot.setPosition(hingeWorldX, doorPos.y, doorPos.z);

    door.reparent(pivot);
    door.setLocalPosition(halfWidth, 0, 0);
    door.setLocalEulerAngles(0, 0, 0);

    return pivot;
  }

  private openCoolerDoor(index: number): void {
    let state = this.coolerDoorState.get(index);
    if (!state) {
      const pivot = this.setupCoolerDoorPivot(index);
      if (!pivot) return;
      state = { pivot, angle: 0, target: 0 };
      this.coolerDoorState.set(index, state);
    }
    state.target = 85; // degrees - within the brief's 80-95 range
  }

  private closeCoolerDoor(index: number): void {
    const state = this.coolerDoorState.get(index);
    if (state) state.target = 0;
  }

  private updateCoolerDoors(dt: number): void {
    const HINGE_SPEED = 140; // deg/s
    for (const [, state] of this.coolerDoorState) {
      if (state.angle === state.target) continue;
      const delta = state.target - state.angle;
      const step = Math.max(-HINGE_SPEED * dt, Math.min(HINGE_SPEED * dt, delta));
      state.angle += step;
      state.pivot.setEulerAngles(0, state.angle, 0);
    }
  }
}
