import * as pc from 'playcanvas';

/**
 * Lightweight runtime profile for constrained browser environments such as GitHub Codespaces.
 * It does not change gameplay; it only reduces expensive rendering work while testing.
 */
export function applyPerformanceProfile(app: pc.Application): { low: boolean; reason: string } {
  const params = new URLSearchParams(window.location.search);
  const forcedLow = params.get('low') === '1' || params.get('perf') === '1';
  const forcedHigh = params.get('low') === '0' || params.get('perf') === '0';
  const host = window.location.hostname.toLowerCase();
  const codespaces = host.includes('app.github.dev') || host.includes('githubpreview.dev');
  const low = !forcedHigh && (forcedLow || codespaces);

  if (low) {
    // PlayCanvas honors maxPixelRatio when RESOLUTION_AUTO is active. Capping it avoids
    // rendering a 1440p/4K browser tab at full device DPR inside a tiny cloud VM.
    const device = app.graphicsDevice as pc.GraphicsDevice & { maxPixelRatio?: number };
    if ('maxPixelRatio' in device) device.maxPixelRatio = 1;

    // Secondary shadow maps are one of the most expensive parts of this prototype.
    // Hero/primary lighting remains intact; this pass only lowers resolution globally.
    for (const entity of app.root.findComponents('light')) {
      const light = entity as unknown as pc.LightComponent;
      if (light.castShadows) light.shadowResolution = Math.min(light.shadowResolution || 512, 256);
    }
  }

  return {
    low,
    reason: forcedLow ? 'URL override' : codespaces ? 'Codespaces detected' : forcedHigh ? 'high-quality override' : 'default'
  };
}
