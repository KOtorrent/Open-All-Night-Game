import type { GameState } from './gameState';
import type { GameUI } from './ui';

/**
 * Opt-in browser playtest controls. Nothing appears in normal play.
 * Add ?dev=1 to the forwarded Codespaces URL to expose fast time jumps so event testing does not
 * require sitting through the full four-real-minutes-per-game-hour clock on a laggy remote session.
 */
export class DevTools {
  constructor(state: GameState, ui: GameUI) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('dev') !== '1') return;

    const panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:100;display:flex;gap:6px;pointer-events:auto;font:10px ui-monospace,SFMono-Regular,Consolas,monospace';

    const makeButton = (text: string, minutes: number) => {
      const button = document.createElement('button');
      button.textContent = text;
      button.style.cssText = 'border:1px solid rgba(220,205,145,.35);background:rgba(0,0,0,.72);color:#d8cf9b;padding:5px 8px;cursor:pointer;font:inherit';
      button.addEventListener('click', () => {
        state.advanceMinutes(minutes);
        ui.showMessage(`DEV: advanced ${minutes} game minutes.`, 1400);
      });
      panel.appendChild(button);
    };

    makeButton('+15 MIN', 15);
    makeButton('+30 MIN', 30);
    makeButton('+60 MIN', 60);
    document.body.appendChild(panel);
  }
}
