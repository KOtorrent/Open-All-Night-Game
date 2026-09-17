export class GameUI {
  readonly root: HTMLDivElement;
  readonly prompt: HTMLDivElement;
  readonly message: HTMLDivElement;
  readonly clock: HTMLDivElement;
  readonly tasks: HTMLDivElement;
  readonly crosshair: HTMLDivElement;
  readonly help: HTMLDivElement;
  readonly warning: HTMLDivElement;
  readonly vignette: HTMLDivElement;
  readonly cctv: HTMLDivElement;
  readonly cctvLabel: HTMLDivElement;
  readonly cctvHelp: HTMLDivElement;

  constructor() {
    this.root = document.createElement('div');
    this.root.id = 'game-ui';
    this.root.style.cssText = 'position:fixed;inset:0;pointer-events:none;color:#eee;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;text-shadow:0 1px 3px #000;z-index:10';

    this.clock = document.createElement('div');
    this.clock.style.cssText = 'position:absolute;right:24px;top:18px;font-size:21px;letter-spacing:2px;color:#f2e8b0';

    const title = document.createElement('div');
    title.textContent = 'CASE’S COUNTRY GAS STOP';
    title.style.cssText = 'position:absolute;left:18px;top:14px;font-size:12px;letter-spacing:1.5px;color:#d8cf9b;opacity:.9';

    this.crosshair = document.createElement('div');
    this.crosshair.textContent = '+';
    this.crosshair.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:17px;color:#ddd;opacity:.72';

    this.prompt = document.createElement('div');
    this.prompt.style.cssText = 'position:absolute;left:50%;top:60%;transform:translateX(-50%);padding:8px 12px;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.72);font-size:13px;letter-spacing:.6px;opacity:0;transition:opacity .1s';

    this.message = document.createElement('div');
    this.message.style.cssText = 'position:absolute;left:50%;bottom:96px;transform:translateX(-50%);padding:8px 12px;background:rgba(0,0,0,.7);font-size:13px;opacity:0;transition:opacity .2s;max-width:640px;text-align:center;line-height:1.35';

    this.tasks = document.createElement('div');
    this.tasks.style.cssText = 'position:absolute;left:18px;bottom:20px;width:290px;padding:10px 12px;background:rgba(0,0,0,.42);border-left:2px solid #b39b43;font-size:12px;line-height:1.55';

    this.help = document.createElement('div');
    this.help.textContent = 'CLICK TO LOOK  •  WASD MOVE  •  SHIFT SPRINT  •  E INTERACT  •  ESC RELEASE MOUSE';
    this.help.style.cssText = 'position:absolute;left:50%;top:18px;transform:translateX(-50%);font-size:11px;letter-spacing:.5px;color:#ddd;opacity:.72';

    this.warning = document.createElement('div');
    this.warning.style.cssText = 'position:absolute;left:50%;top:28%;transform:translate(-50%,-50%);font-size:27px;font-weight:700;letter-spacing:4px;color:#d9c8b2;opacity:0;transition:opacity .14s;text-shadow:0 0 18px rgba(255,40,20,.75),0 2px 3px #000';

    this.vignette = document.createElement('div');
    this.vignette.style.cssText = 'position:absolute;inset:0;background:radial-gradient(circle at center,transparent 56%,rgba(0,0,0,.20) 78%,rgba(0,0,0,.48) 100%);opacity:.52';

    this.cctv = document.createElement('div');
    this.cctv.style.cssText = 'position:absolute;inset:0;display:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.08) 0 2px,rgba(255,255,255,.015) 2px 4px);box-shadow:inset 0 0 130px rgba(0,0,0,.55);';

    this.cctvLabel = document.createElement('div');
    this.cctvLabel.style.cssText = 'position:absolute;left:22px;top:20px;padding:6px 9px;background:rgba(0,0,0,.62);border:1px solid rgba(200,220,210,.25);font-size:13px;letter-spacing:1.2px;color:#b9cfbd';

    this.cctvHelp = document.createElement('div');
    this.cctvHelp.textContent = 'Q / E — CHANGE CAMERA     ESC — EXIT CCTV';
    this.cctvHelp.style.cssText = 'position:absolute;left:50%;bottom:22px;transform:translateX(-50%);padding:7px 11px;background:rgba(0,0,0,.68);font-size:12px;letter-spacing:.7px;color:#bdc9bf';
    this.cctv.append(this.cctvLabel, this.cctvHelp);

    this.root.append(this.vignette, title, this.clock, this.crosshair, this.prompt, this.message, this.tasks, this.help, this.warning, this.cctv);
    document.body.appendChild(this.root);
  }

  setPrompt(text?: string): void {
    this.prompt.textContent = text ? `E — ${text.toUpperCase()}` : '';
    this.prompt.style.opacity = text ? '1' : '0';
  }

  showMessage(text: string, ms = 2600): void {
    this.message.textContent = text;
    this.message.style.opacity = '1';
    window.setTimeout(() => {
      if (this.message.textContent === text) this.message.style.opacity = '0';
    }, ms);
  }

  flashWarning(text: string, ms = 1300): void {
    this.warning.textContent = text;
    this.warning.style.opacity = '1';
    this.vignette.style.opacity = '.85';
    window.setTimeout(() => {
      if (this.warning.textContent === text) this.warning.style.opacity = '0';
      this.vignette.style.opacity = '.52';
    }, ms);
  }

  setCctv(active: boolean, label = ''): void {
    this.cctv.style.display = active ? 'block' : 'none';
    this.cctvLabel.textContent = label;
    this.crosshair.style.opacity = active ? '0' : '.72';
    this.tasks.style.opacity = active ? '0' : '1';
    this.help.style.opacity = active ? '0' : this.help.style.opacity;
  }

  setCctvLabel(label: string): void {
    this.cctvLabel.textContent = label;
  }

  setClock(text: string): void {
    this.clock.textContent = text;
  }

  setTasks(lines: Array<{ text: string; done: boolean }>): void {
    this.tasks.innerHTML = '<strong style="color:#e5d48d;letter-spacing:.7px">SHIFT TASKS</strong><br>' +
      lines.map((x) => `<span style="opacity:${x.done ? '.48' : '1'}">${x.done ? '✓' : '□'} ${x.text}</span>`).join('<br>');
  }
}
