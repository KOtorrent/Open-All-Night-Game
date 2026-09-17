import * as pc from 'playcanvas';
import type { BuiltWorld, Interactable } from './gameTypes';
import type { GameState } from './gameState';
import type { GameUI } from './ui';

function mat(color: pc.Color, gloss = 0.12): pc.StandardMaterial {
  const material = new pc.StandardMaterial();
  material.diffuse = color;
  material.gloss = gloss;
  material.update();
  return material;
}

/**
 * Gives the manager office a reason to exist beyond CCTV. These are optional Night 1 lore reads:
 * mundane records first, then tiny inconsistencies that reward nosy players without explaining the mystery.
 */
export class OfficeLoreSystem {
  private readonly app: pc.Application;
  private readonly world: BuiltWorld;
  private readonly state: GameState;
  private readonly ui: GameUI;
  private overlay?: HTMLDivElement;

  constructor(app: pc.Application, world: BuiltWorld, state: GameState, ui: GameUI) {
    this.app = app;
    this.world = world;
    this.state = state;
    this.ui = ui;
    this.buildProps();
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Escape' && this.overlay) this.closeOverlay();
    });
  }

  private buildProps(): void {
    const paper = mat(new pc.Color(0.72, 0.69, 0.57), 0.05);
    const folder = mat(new pc.Color(0.28, 0.22, 0.10), 0.06);
    const plastic = mat(new pc.Color(0.055, 0.062, 0.058), 0.28);
    const screen = mat(new pc.Color(0.055, 0.12, 0.08), 0.20);

    const roster = this.box('OfficeRoster', new pc.Vec3(-8.62, 1.28, -10.06), new pc.Vec3(0.44, 0.018, 0.61), paper);
    roster.setEulerAngles(0, 14, 0);
    const incident = this.box('OfficeIncidentFolder', new pc.Vec3(-7.62, 1.28, -10.08), new pc.Vec3(0.52, 0.04, 0.66), folder);
    incident.setEulerAngles(0, -11, 0);
    this.box('OfficeComputerBase', new pc.Vec3(-8.12, 1.36, -10.77), new pc.Vec3(0.54, 0.24, 0.34), plastic);
    this.box('OfficeComputerScreen', new pc.Vec3(-8.12, 1.67, -10.58), new pc.Vec3(0.62, 0.46, 0.05), screen);

    this.add({
      id: 'lore-roster',
      label: 'read employee roster',
      position: new pc.Vec3(-8.62, 1.32, -10.06),
      radius: 2.0,
      aimRadius: 0.42,
      onInteract: () => {
        this.state.complete('lore-roster');
        return 'EMPLOYEE ROSTER — Day: Jenna. Swing: Marcus. Night: DANIEL. An older line above it reads: L. CASE — NIGHT.';
      }
    });

    this.add({
      id: 'lore-incident-log',
      label: 'read incident folder',
      position: new pc.Vec3(-7.62, 1.32, -10.08),
      radius: 2.0,
      aimRadius: 0.45,
      onInteract: () => {
        this.state.complete('lore-incident-log');
        return 'INCIDENT LOG — Pump 7 reset twice with no sale attached. Camera review: no vehicle visible. Manager note: "watch it, don’t comp anything."';
      }
    });

    this.add({
      id: 'office-terminal',
      label: 'use office terminal',
      position: new pc.Vec3(-8.12, 1.62, -10.56),
      radius: 2.2,
      aimRadius: 0.46,
      onInteract: () => this.openTerminal()
    });
  }

  private openTerminal(): string {
    this.state.complete('lore-terminal');
    if (this.overlay) return 'The office terminal is already open.';

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:38;display:grid;place-items:center;background:rgba(0,0,0,.82);font-family:ui-monospace,SFMono-Regular,Consolas,monospace;color:#9fc6a2;pointer-events:auto';
    overlay.innerHTML = `
      <div style="width:min(720px,90vw);background:#071009;border:1px solid rgba(104,171,112,.42);box-shadow:0 22px 80px #000;padding:24px 28px">
        <div style="font-size:11px;letter-spacing:2px;color:#6e9b73">CASE'S STORE MANAGEMENT 2.4</div>
        <div style="font-size:22px;margin:7px 0 18px;color:#b4d8b7">NIGHT OPERATIONS</div>
        <div style="display:grid;grid-template-columns:150px 1fr;gap:7px 16px;font-size:13px;line-height:1.55">
          <span style="color:#6e9b73">SHIFT USER</span><span>NIGHT CLERK</span>
          <span style="color:#6e9b73">REGISTER</span><span>ONLINE</span>
          <span style="color:#6e9b73">PUMPS</span><span>1–8 ONLINE / PUMP 7: MANUAL REVIEW</span>
          <span style="color:#6e9b73">CAMERA 4</span><span>IMAGE DELAY REPORTED — SERVICE DEFERRED</span>
          <span style="color:#6e9b73">LAST NOTE</span><span>"If the timestamps drift, write it down. Do not reset the recorder during a shift."</span>
        </div>
        <div style="margin-top:22px;padding-top:14px;border-top:1px solid rgba(104,171,112,.2);font-size:12px;color:#7fa484">No network connection. Local records only.</div>
        <button id="office-terminal-close" style="margin-top:20px;padding:8px 12px;background:#0b180e;color:#afd0b2;border:1px solid #446648;font:12px inherit;cursor:pointer">CLOSE [ESC]</button>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector<HTMLButtonElement>('#office-terminal-close')?.addEventListener('click', () => this.closeOverlay());
    this.overlay = overlay;
    return 'The old management terminal hums awake.';
  }

  private closeOverlay(): void {
    this.overlay?.remove();
    this.overlay = undefined;
    this.ui.showMessage('Terminal closed.', 1200);
  }

  private box(name: string, position: pc.Vec3, scale: pc.Vec3, material: pc.StandardMaterial): pc.Entity {
    const entity = new pc.Entity(name);
    entity.addComponent('render', { type: 'box' });
    entity.setPosition(position);
    entity.setLocalScale(scale);
    if (entity.render) entity.render.material = material;
    this.app.root.addChild(entity);
    return entity;
  }

  private add(interactable: Interactable): void {
    this.world.interactables.push(interactable);
  }
}
