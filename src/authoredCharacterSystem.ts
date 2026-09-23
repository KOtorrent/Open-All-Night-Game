import * as pc from 'playcanvas';
import { AssetRegistry } from './assetRegistry';

const BASE = '/assets/characters/quaternius';
const IDLE_CLIP = 'Idle';
const WALK_CLIP = 'Walk';
const WALK_SPEED_THRESHOLD = 0.08; // m/s - below this, treat the actor as stationary (idle)
// The pack's own Walk clip is a 1.333s in-place stride cycle with no baked root motion (the game
// always drives the NPC root's actual position/rotation itself, exactly as before - this constant
// only affects how fast the LEGS cycle, never how fast the character actually moves). Customer
// systems use per-character speeds from 1.35 to 1.72 m/s; 1.4 m/s is a reasonable "the clip's
// authored pace" reference, so anim.speed is scaled proportionally to each character's own actual
// measured movement speed at the moment they start walking - this is the general fix, not a
// per-character guess, and applies identically to every current and future bound character.
const REFERENCE_WALK_SPEED = 1.4; // m/s
const MIN_WALK_ANIM_SPEED = 0.6;
const MAX_WALK_ANIM_SPEED = 2.2;

// World-proportion calibration (human review pass): the original per-character scales landed every
// character inside the brief's own stated meter ranges, but the checkout counter top (1.365m -
// see storeBuilder.ts CounterTop) still read at ~77% up an adult's body - upper chest/collar, not
// waist. Direct in-engine measurement confirmed the whole store (ceiling 4.1m, doors ~2.85-3.1m,
// aisle shelving ~2.85m tall) is built roughly 1.4-1.5x taller than strict real-world proportions,
// so a literal waist-height counter read is architecturally out of reach without pushing character
// heights well past 2.3m and erasing Tall Man's relative distinctiveness. This +10% multiplier is
// the deliberately modest correction: verified in-engine to move the counter from upper-chest
// toward lower-ribcage/stomach (counterFraction 0.77 -> 0.70, a real, visible improvement) while
// keeping every character close to (not wildly past) their stated target range.
const SCALE_CORRECTION = 1.10;

interface CharacterBinding {
  /** Name of the existing procedural NPC/player root entity to attach to. */
  rootName: string;
  assetId: string;
  /** Path relative to BASE, e.g. 'male/Casual_2.gltf'. */
  file: string;
  /** Uniform world-space scale applied to the authored mesh (bbox-height-derived; see docs/QUATERNIUS_CHARACTER_INTEGRATION.md). */
  scale: number;
  yaw?: number;
  /**
   * Extra local Z offset applied only to the player avatar so the FPS camera clears the mesh.
   * The avatar root sits exactly under the camera every frame (see playerAvatar.ts), so this is
   * the only thing keeping the camera from rendering from inside its own head/shoulders. 0.18 (the
   * original primitive-era value, sized for a thin neck cylinder) was measured in-engine to leave
   * ZERO clearance against the full authored mesh - 0.6 leaves ~0.31m, comfortably past the 0.05m
   * near-clip plane. See docs/CUSTOMER_SHOPPING_BEHAVIOR.md Phase 1 for the measurement.
   */
  offsetZ?: number;
  /** Selective per-material-name-substring diffuse color override (skin/hair/eyes are left alone). */
  overrides: Record<string, pc.Color>;
}

interface AnimatedModel extends pc.Entity {
  __idleTrack?: pc.AnimTrack;
  __walkTrack?: pc.AnimTrack;
  __animState?: 'idle' | 'walk';
  __lastX?: number;
  __lastZ?: number;
}

/**
 * Authored, rigged, CC0 Quaternius character models (see docs/QUATERNIUS_CHARACTER_INTEGRATION.md)
 * replacing the procedural primitive-composed actors as the game's visual foundation for humans.
 * Discovers each named NPC/player root by name every frame (whatever spawned it, whenever it
 * spawned), attaches the authored mesh as a child of that same root, and hides the primitive
 * fallback siblings in place rather than destroying them - so a failed/slow load always leaves the
 * normal-proportioned primitive actor visible instead of an empty gap.
 */
export class AuthoredCharacterSystem {
  private readonly registry: AssetRegistry;
  private readonly loadingGuids = new Set<string>();
  private readonly disabled: boolean;

  private readonly bindings: CharacterBinding[] = [
    // Earl: older regular, plain casual clothes, muted browns/grays.
    {
      rootName: 'Earl-Regular-Customer', assetId: 'q-earl', file: 'male/Casual_2.gltf', scale: (0.955) * SCALE_CORRECTION, yaw: 180,
      overrides: {
        LightBrown: new pc.Color(0.22, 0.20, 0.17),
        Red_Dark: new pc.Color(0.16, 0.15, 0.14),
        White: new pc.Color(0.30, 0.29, 0.26),
        Skin_Darker: new pc.Color(0.42, 0.30, 0.20)
      }
    },
    // Jenna: casual adult woman, restrained navy/gray.
    {
      rootName: 'Jenna', assetId: 'q-jenna', file: 'female/Casual.gltf', scale: (0.93) * SCALE_CORRECTION, yaw: 180,
      overrides: {
        White: new pc.Color(0.20, 0.22, 0.26),
        Grey: new pc.Color(0.10, 0.10, 0.11),
        Orange: new pc.Color(0.30, 0.17, 0.07)
      }
    },
    // Marcus: distinct from Earl - hoodie/jacket silhouette, charcoal not purple.
    {
      rootName: 'Marcus-Regular', assetId: 'q-marcus', file: 'male/Casual_Hoodie.gltf', scale: (0.965) * SCALE_CORRECTION, yaw: 180,
      overrides: {
        Purple: new pc.Color(0.09, 0.10, 0.12),
        White: new pc.Color(0.26, 0.25, 0.23),
        LightBlue: new pc.Color(0.09, 0.11, 0.13)
      }
    },
    // Dale: suspicious-looking but harmless - heavier darker workwear, not construction-bright.
    {
      rootName: 'Dale', assetId: 'q-dale', file: 'male/Worker.gltf', scale: (0.965) * SCALE_CORRECTION, yaw: 180,
      overrides: {
        Worker_Yellow: new pc.Color(0.14, 0.13, 0.11),
        Worker_Vest: new pc.Color(0.20, 0.09, 0.08),
        LightBrown: new pc.Color(0.16, 0.15, 0.14)
      }
    },
    // Traveler: road-weary, dark olive/charcoal travel jacket, no adventurer gold accents.
    {
      rootName: 'LateNightTraveler', assetId: 'q-traveler', file: 'male/Adventurer.gltf', scale: (0.955) * SCALE_CORRECTION, yaw: 180,
      overrides: {
        Green: new pc.Color(0.10, 0.11, 0.09),
        LightGreen: new pc.Color(0.14, 0.15, 0.12),
        Gold: new pc.Color(0.16, 0.15, 0.13),
        Brown: new pc.Color(0.14, 0.11, 0.08),
        Brown2: new pc.Color(0.10, 0.08, 0.06)
      }
    },
    // Silent Customer: plain, nondescript suit - ordinary base, no red tie.
    {
      rootName: 'Silent-Customer', assetId: 'q-silent', file: 'male/Suit.gltf', scale: (0.955) * SCALE_CORRECTION, yaw: 180,
      overrides: {
        Suit: new pc.Color(0.05, 0.05, 0.055),
        Tie: new pc.Color(0.05, 0.05, 0.055),
        DarkBrown: new pc.Color(0.08, 0.075, 0.07),
        White: new pc.Color(0.28, 0.27, 0.25)
      }
    },
    // Larry: older, tired, subdued cardigan-over-workshirt in brown/gray/green.
    {
      rootName: 'LarryCase', assetId: 'q-larry', file: 'male/Farmer.gltf', scale: (0.935) * SCALE_CORRECTION, yaw: 180,
      overrides: {
        LightBlue: new pc.Color(0.16, 0.17, 0.15),
        Brown: new pc.Color(0.18, 0.17, 0.13),
        Beige: new pc.Color(0.24, 0.23, 0.19),
        Brown2: new pc.Color(0.13, 0.12, 0.10),
        Red: new pc.Color(0.14, 0.14, 0.13)
      }
    },
    // Smiling Woman: mandatory yellow coat via the Suit blazer material.
    {
      rootName: 'AnomalyPresence-smiling-woman', assetId: 'q-smiling-woman', file: 'female/Suit.gltf', scale: (0.935) * SCALE_CORRECTION, yaw: 180,
      overrides: {
        Black: new pc.Color(0.63, 0.48, 0.10),
        White: new pc.Color(0.30, 0.28, 0.20),
        Hair_Brown: new pc.Color(0.05, 0.03, 0.02),
        Hair_Blond: new pc.Color(0.05, 0.03, 0.02)
      }
    },
    // Tall Man: narrow dark clothing; scaled ~12% taller at spawn time (see spawnPresence caller).
    {
      rootName: 'AnomalyPresence-tall-man', assetId: 'q-tall-man', file: 'male/Swat.gltf', scale: (0.955 * 1.12) * SCALE_CORRECTION, yaw: 180,
      overrides: {
        Swat: new pc.Color(0.045, 0.05, 0.055),
        Swat_Black: new pc.Color(0.02, 0.02, 0.022),
        Black: new pc.Color(0.02, 0.02, 0.022),
        Grey: new pc.Color(0.04, 0.04, 0.045),
        Visor: new pc.Color(0.02, 0.02, 0.022)
      }
    },
    // Player avatar / Duplicate Player: neutral employee look, same model+overrides for both so the
    // duplicate genuinely resembles the player.
    {
      rootName: 'Player-World-Avatar', assetId: 'q-player', file: 'male/Beach.gltf', scale: (0.945) * SCALE_CORRECTION, yaw: 180, offsetZ: 0.6,
      overrides: {
        Red_Dark: new pc.Color(0.09, 0.13, 0.10),
        LightBrown: new pc.Color(0.16, 0.15, 0.14),
        White: new pc.Color(0.26, 0.26, 0.24),
        Earrings: new pc.Color(0.10, 0.10, 0.10)
      }
    }
  ];

  constructor(private readonly app: pc.Application) {
    this.registry = new AssetRegistry(app);
    const params = new URLSearchParams(window.location.search);
    // Authored Quaternius characters are this pass's visual foundation and ship enabled by default;
    // ?characters=0 (or ?assets=0, matching the retail hero-prop kill switch) instantly reverts to
    // the normal-proportioned primitive actors for direct human before/after comparison.
    this.disabled = params.get('characters') === '0' || params.get('assets') === '0';

    for (const binding of this.bindings) {
      this.registry.register({ id: binding.assetId, url: `${BASE}/${binding.file}` });
    }

    if (this.disabled) {
      console.info('OPEN ALL NIGHT authored Quaternius character layer disabled; using primitive fallback actors.');
    }
  }

  update(dt: number): void {
    if (this.disabled) return;
    for (const binding of this.bindings) {
      const root = this.app.root.findByName(binding.rootName) as pc.Entity | null;
      if (!root || !root.enabled) continue;

      const modelName = `${binding.rootName}-AuthoredModel`;
      const existing = root.findByName(modelName) as AnimatedModel | null;
      if (existing) {
        this.driveAnimation(root, existing, dt);
        continue;
      }

      const guid = root.getGuid();
      if (this.loadingGuids.has(guid)) continue;
      this.loadingGuids.add(guid);
      void this.attach(root, binding, modelName, guid);
    }
  }

  private async attach(root: pc.Entity, binding: CharacterBinding, modelName: string, guid: string): Promise<void> {
    try {
      await this.registry.preload(binding.assetId);
      const model = await this.registry.instantiate(binding.assetId, root, {
        position: new pc.Vec3(0, 0, binding.offsetZ ?? 0),
        rotation: new pc.Vec3(0, binding.yaw ?? 180, 0),
        scale: binding.scale
      }) as AnimatedModel;
      model.name = modelName;

      this.retintByMaterialName(model, binding.overrides);
      this.hideWeaponProps(model);

      const asset = this.registry.getAsset(binding.assetId);
      const container = asset?.resource as pc.ContainerResource | undefined;
      this.setupAnimation(model, container);

      this.hidePrimitiveChildren(root, model);
      console.info(`OPEN ALL NIGHT authored Quaternius character attached: ${binding.rootName}`);
    } catch (error) {
      console.warn(`Authored character unavailable for ${binding.rootName}; keeping primitive fallback.`, error);
    } finally {
      this.loadingGuids.delete(guid);
    }
  }

  /**
   * The Suit and Swat source outfits (Silent Customer, Tall Man) each bundle a holstered "Pistol"
   * node baked into the rig. Open All Night is a horror-of-the-uncanny game, not an armed-threat
   * game, and no named character is meant to read as visibly armed - so any node literally named
   * "Pistol" (or similar) is disabled on attach, for every character, as a blanket safety net
   * rather than a per-binding special case.
   */
  private hideWeaponProps(model: pc.Entity): void {
    const banned = /pistol|weapon|gun|knife|rifle/i;
    const stack: pc.GraphNode[] = [model];
    while (stack.length) {
      const node = stack.pop();
      if (!node) continue;
      stack.push(...node.children);
      if (banned.test(node.name)) {
        const entity = node as pc.Entity;
        if (entity.render) entity.render.enabled = false;
      }
    }
  }

  /** Overrides diffuse color on meshInstances whose glTF material name contains a bound key, leaving skin/hair/eyes untouched. */
  private retintByMaterialName(model: pc.Entity, overrides: Record<string, pc.Color>): void {
    if (!Object.keys(overrides).length) return;
    const cache = new Map<string, pc.StandardMaterial>();
    const renders = model.findComponents('render') as pc.RenderComponent[];
    for (const render of renders) {
      for (const meshInstance of render.meshInstances) {
        const sourceName = meshInstance.material?.name ?? '';
        for (const key of Object.keys(overrides)) {
          if (!sourceName.includes(key)) continue;
          let mat = cache.get(key);
          if (!mat) {
            mat = new pc.StandardMaterial();
            mat.diffuse = overrides[key];
            mat.metalness = 0;
            mat.gloss = 0.32;
            mat.update();
            cache.set(key, mat);
          }
          meshInstance.material = mat;
          break;
        }
      }
    }
  }

  private setupAnimation(model: AnimatedModel, container: pc.ContainerResource | undefined): void {
    // Not in the engine's .d.ts (glTF containers only), but present on GlbContainerResource at
    // runtime - see node_modules/playcanvas/build/playcanvas.mjs GlbContainerResource constructor.
    const animAssets = (container as unknown as { animations?: pc.Asset[] } | undefined)?.animations;
    if (!animAssets?.length) return;
    const trackName = (asset: pc.Asset): string | undefined => (asset.resource as pc.AnimTrack | undefined)?.name;
    const idle = animAssets.find((a) => trackName(a) === IDLE_CLIP);
    if (!idle?.resource) return;
    const walk = animAssets.find((a) => trackName(a) === WALK_CLIP);

    try {
      const anim = model.addComponent('anim', { activate: true }) as pc.AnimComponent;
      anim.assignAnimation('Base', idle.resource as pc.AnimTrack, undefined, 1, true);
      model.__idleTrack = idle.resource as pc.AnimTrack;
      model.__walkTrack = (walk?.resource as pc.AnimTrack | undefined) ?? (idle.resource as pc.AnimTrack);
      model.__animState = 'idle';
      const pos = model.parent!.getPosition();
      model.__lastX = pos.x;
      model.__lastZ = pos.z;
    } catch (error) {
      console.warn('Authored character animation unavailable; using static pose.', error);
    }
  }

  private driveAnimation(root: pc.Entity, model: AnimatedModel, dt: number): void {
    if (!model.anim || !model.__idleTrack || !model.__walkTrack || dt <= 0) return;
    const pos = root.getPosition();
    const lastX = model.__lastX ?? pos.x;
    const lastZ = model.__lastZ ?? pos.z;
    const speed = Math.hypot(pos.x - lastX, pos.z - lastZ) / dt;
    model.__lastX = pos.x;
    model.__lastZ = pos.z;

    const shouldWalk = speed > WALK_SPEED_THRESHOLD;
    const nextState = shouldWalk ? 'walk' : 'idle';
    if (model.__animState === nextState) return;
    model.__animState = nextState;
    const animSpeed = shouldWalk
      ? Math.min(MAX_WALK_ANIM_SPEED, Math.max(MIN_WALK_ANIM_SPEED, speed / REFERENCE_WALK_SPEED))
      : 1;
    model.anim.assignAnimation('Base', shouldWalk ? model.__walkTrack : model.__idleTrack, undefined, animSpeed, true);
  }

  private hidePrimitiveChildren(root: pc.Entity, keep: pc.Entity): void {
    const stack: pc.GraphNode[] = [...root.children];
    while (stack.length) {
      const node = stack.pop();
      if (!node || node === keep || this.isDescendantOf(node, keep)) continue;
      stack.push(...node.children);
      const entity = node as pc.Entity;
      if (entity.render) entity.render.enabled = false;
    }
  }

  private isDescendantOf(node: pc.GraphNode, ancestor: pc.GraphNode): boolean {
    let current = node.parent;
    while (current) {
      if (current === ancestor) return true;
      current = current.parent;
    }
    return false;
  }

  /**
   * Transient CCTV-flavored visual for the duplicate-player anomaly (Night 4's "Camera 4 shows you
   * in Aisle 3" line): a static clone using the exact same model/material as the player avatar
   * binding above, spawned briefly in an aisle so the anomaly has something to actually show, not
   * just tell. Called from sharedAnomalyHandlers.ts alongside its existing text trigger - it does
   * not touch routing, collision or any existing anomaly state.
   */
  async spawnDuplicatePlayer(seconds = 6): Promise<void> {
    if (this.disabled) return;
    const binding = this.bindings.find((b) => b.rootName === 'Player-World-Avatar');
    if (!binding) return;
    try {
      await this.registry.preload(binding.assetId);
      const root = new pc.Entity('DuplicatePlayerFigure');
      root.setPosition(-3.6, 0, 3.3);
      root.setEulerAngles(0, 40, 0);
      this.app.root.addChild(root);
      const model = await this.registry.instantiate(binding.assetId, root, { scale: binding.scale }) as AnimatedModel;
      this.retintByMaterialName(model, binding.overrides);
      this.hideWeaponProps(model);
      // Idle only, by construction - this entity never moves, so driveAnimation() (which is never
      // even called for it, since it isn't in the per-frame update() poll) would stay Idle anyway;
      // this call just avoids a frozen bind-T-pose for its 6-second lifetime. "No generic shopper
      // behavior" per the brief's anomaly-animation rules.
      const asset = this.registry.getAsset(binding.assetId);
      this.setupAnimation(model, asset?.resource as pc.ContainerResource | undefined);
      window.setTimeout(() => root.destroy(), seconds * 1000);
    } catch (error) {
      console.warn('Duplicate-player visual unavailable; text-only anomaly still fired.', error);
    }
  }
}
