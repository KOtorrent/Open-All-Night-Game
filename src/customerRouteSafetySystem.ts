import * as pc from 'playcanvas';

interface RouteActor {
  root: pc.Entity;
  phase: string;
  route: pc.Vec3[];
  waypoint: number;
}

interface ActorHost {
  actor?: RouteActor;
  customer?: RouteActor;
  silentVisitor?: RouteActor;
}

/**
 * Milestone playtesting exposed that several early hand-authored NPC waypoints were placed on top
 * of shelf footprints. This guard replaces only the initial shopping route for each known Night 1
 * actor with paths that stay in the actual walkable corridors between fixtures.
 *
 * It also fixes a confirmed human-playtest bug: every customer's final checkout waypoint used to
 * land on nearly the identical spot (~x=-3.5..-3.7, z=7.35). Because customer spawn timing is not
 * strictly serialized (e.g. Jenna can arrive before Earl has been served), two customers could end
 * up standing in the exact same position at the counter. Each named actor now gets its own queue
 * slot along the counter (0.5m spacing, x=-3.90/-3.40/-2.90/-2.40), forming a short line instead of
 * stacking. Item props and register-served "leaving" routes for each customer were shifted by the
 * same offset in their own system files to match.
 *
 * Leaving routes remain owned by the individual customer systems.
 */
export class CustomerRouteSafetySystem {
  private readonly patched = new Set<string>();

  constructor(private readonly systems: unknown[]) {}

  update(): void {
    for (const system of this.systems) {
      const host = system as ActorHost;
      for (const actor of [host.customer, host.silentVisitor, host.actor]) {
        if (!actor || !actor.root?.enabled || this.patched.has(actor.root.name)) continue;
        if (actor.phase === 'leaving' || actor.phase === 'done') continue;
        const route = this.safeRoute(actor.root.name);
        if (!route) continue;
        actor.route = route;
        actor.waypoint = 0;
        this.patched.add(actor.root.name);
      }
    }
  }

  private safeRoute(name: string): pc.Vec3[] | undefined {
    // Shelf blocks occupy x≈[-6.2,-4.0],[-2.8,-0.6],[0.6,2.8],[4.0,6.2]
    // from roughly z=-3.8..4.6. Corridors at x=-3.4,0,3.4 are intentionally reused.
    switch (name) {
      case 'Earl-Regular-Customer':
        return [
          new pc.Vec3(0, 0, 10.2),
          new pc.Vec3(0, 0, 5.8),
          new pc.Vec3(3.4, 0, 5.8),
          new pc.Vec3(3.4, 0, 1.8),
          new pc.Vec3(3.4, 0, 5.8),
          new pc.Vec3(0, 0, 5.8),
          new pc.Vec3(-3.90, 0, 7.45)
        ];
      case 'Silent-Customer':
        return [
          new pc.Vec3(0, 0, 10.2),
          new pc.Vec3(0, 0, 7.0),
          new pc.Vec3(-3.5, 0, 7.25)
        ];
      case 'Jenna':
        return [
          new pc.Vec3(0, 0, 10.2),
          new pc.Vec3(3.4, 0, 5.8),
          new pc.Vec3(3.4, 0, -2.8),
          new pc.Vec3(0, 0, -4.8),
          new pc.Vec3(0, 0, 5.8),
          new pc.Vec3(-3.40, 0, 7.45)
        ];
      case 'LateNightTraveler':
        return [
          new pc.Vec3(0, 0, 10.3),
          new pc.Vec3(3.4, 0, 5.8),
          new pc.Vec3(3.4, 0, 1.5),
          new pc.Vec3(0, 0, -4.8),
          new pc.Vec3(0, 0, 5.8),
          new pc.Vec3(-2.90, 0, 7.45)
        ];
      case 'Dale':
        return [
          new pc.Vec3(0, 0, 10.3),
          new pc.Vec3(-3.4, 0, 5.8),
          new pc.Vec3(-3.4, 0, -2.8),
          new pc.Vec3(0, 0, -4.8),
          new pc.Vec3(3.4, 0, -4.8),
          new pc.Vec3(3.4, 0, -7.3),
          new pc.Vec3(3.4, 0, -4.8),
          new pc.Vec3(0, 0, 5.8),
          new pc.Vec3(-2.40, 0, 7.45)
        ];
      case 'Marcus-Regular':
        return [
          new pc.Vec3(0, 0, 10.3),
          new pc.Vec3(3.4, 0, 6.1),
          new pc.Vec3(7.5, 0, 6.1),
          new pc.Vec3(3.4, 0, 6.1),
          new pc.Vec3(3.4, 0, 2.0),
          new pc.Vec3(0, 0, 5.8),
          new pc.Vec3(-3.55, 0, 7.35)
        ];
      default:
        return undefined;
    }
  }
}
