import * as pc from 'playcanvas';

export class AmbientAudio {
  private ctx?: AudioContext;
  private master?: GainNode;
  private indoorGain?: GainNode;
  private outdoorGain?: GainNode;
  private started = false;

  constructor(canvas: HTMLCanvasElement) {
    const start = () => this.ensureStarted();
    canvas.addEventListener('click', start, { once: true });
  }

  update(camera: pc.Entity): void {
    if (!this.started || !this.ctx || !this.indoorGain || !this.outdoorGain) return;
    const outside = camera.getPosition().z > 12.15;
    const now = this.ctx.currentTime;
    this.indoorGain.gain.cancelScheduledValues(now);
    this.outdoorGain.gain.cancelScheduledValues(now);
    this.indoorGain.gain.linearRampToValueAtTime(outside ? 0.012 : 0.035, now + 0.45);
    this.outdoorGain.gain.linearRampToValueAtTime(outside ? 0.035 : 0.004, now + 0.45);
  }

  private ensureStarted(): void {
    if (this.started) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(ctx.destination);

      this.indoorGain = ctx.createGain();
      this.indoorGain.gain.value = 0.035;
      this.indoorGain.connect(this.master);

      // Layered 60Hz/120Hz refrigeration and fluorescent hum.
      const humA = ctx.createOscillator();
      humA.type = 'sine';
      humA.frequency.value = 60;
      const humAGain = ctx.createGain();
      humAGain.gain.value = 0.55;
      humA.connect(humAGain);
      humAGain.connect(this.indoorGain);
      humA.start();

      const humB = ctx.createOscillator();
      humB.type = 'sine';
      humB.frequency.value = 120;
      const humBGain = ctx.createGain();
      humBGain.gain.value = 0.18;
      humB.connect(humBGain);
      humBGain.connect(this.indoorGain);
      humB.start();

      // Filtered noise for distant wind / road hiss outside.
      const noiseLength = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 780;
      filter.Q.value = 0.7;
      this.outdoorGain = ctx.createGain();
      this.outdoorGain.gain.value = 0.004;
      noise.connect(filter);
      filter.connect(this.outdoorGain);
      this.outdoorGain.connect(this.master);
      noise.start();

      this.started = true;
    } catch {
      // Audio ambience is optional; gameplay remains functional when audio is unavailable.
    }
  }
}
