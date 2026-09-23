import * as pc from 'playcanvas';

// Graphics overhaul Pass 6, Phase 6: small decorative shelf price tags. One shared 512x256 canvas
// atlas (6 cells, 3x2 grid) holds every price string this system uses - a handful of tags sampling
// shared UV cells via one material, matching the same shared-atlas-over-material-explosion approach
// packagingLabelSystem.ts already uses for product labels. Placed sparingly (a few per aisle, not
// under every item) per the brief's own "not under every object" instruction.
const CELL_COLS = 3;
const CELL_ROWS = 2;
const PRICES = ['$1.49', '$2.29', '2 FOR $5', '$3.99', '$0.99', '$4.49'];

interface PriceTagSpot {
  x: number;
  y: number;
  z: number;
  yaw: number;
  priceIndex: number;
}

export class PriceTagSystem {
  constructor(private readonly app: pc.Application) {
    this.build();
  }

  private build(): void {
    const atlas = this.makeAtlas();
    const material = new pc.StandardMaterial();
    material.diffuseMap = atlas;
    material.emissiveMap = atlas;
    material.emissive = new pc.Color(1, 1, 1);
    material.emissiveIntensity = 0.55;
    material.gloss = 0.08;
    material.cull = pc.CULLFACE_NONE;
    material.update();

    // Two or three tags per aisle, clipped to the front edge of an eye-level shelf tier (y=0.43 +
    // 1*0.66 = 1.09, matching storeBuilder.ts's A{n}-Shelf tier 1) rather than one per product -
    // small, sparse, believable, not a price sticker under every can.
    const aisleXs = [-5.1, -1.7, 1.7, 5.1];
    const spots: PriceTagSpot[] = [];
    aisleXs.forEach((x, aisleIndex) => {
      for (let side of [-1, 1]) {
        const shelfX = x + side * 0.55;
        spots.push({
          x: shelfX - side * 0.06, y: 1.09 + 0.03, z: -2.4 + aisleIndex * 0.6,
          yaw: side > 0 ? 90 : -90, priceIndex: (aisleIndex * 2 + (side > 0 ? 1 : 0)) % PRICES.length
        });
      }
    });
    // Checkout candy rack and cooler bank each get one, matching the same "believable, sparse"
    // treatment rather than leaving the new packaging art with zero price signage anywhere.
    spots.push({ x: -3.05, y: 1.365 + 0.10 + 0.20 + 0.02, z: 8.32, yaw: 0, priceIndex: 5 });
    spots.push({ x: 3.0, y: 1.40, z: -10.15, yaw: 0, priceIndex: 3 });

    spots.forEach((spot, i) => {
      // A thin box rather than a plane primitive: packagingLabelSystem.ts's decal-plane orientation
      // bug (fixed above, see that file's own comment) showed how easy a plane's single-sided-normal
      // convention is to get backwards. A box's standard cube-unwrap UVs don't have that failure mode
      // - every face samples the same atlas cell right-way-round regardless of which way it's viewed
      // from, so a small always-correct box is used here instead of chasing the same bug twice.
      const tag = new pc.Entity(`PriceTag-${i}`);
      tag.addComponent('render', { type: 'box' });
      tag.setPosition(spot.x, spot.y, spot.z);
      tag.setEulerAngles(0, spot.yaw, 0);
      tag.setLocalScale(0.14, 0.07, 0.012);
      if (tag.render) {
        const cellMat = material.clone() as pc.StandardMaterial;
        const col = spot.priceIndex % CELL_COLS;
        const row = Math.floor(spot.priceIndex / CELL_COLS);
        cellMat.diffuseMapTiling = new pc.Vec2(1 / CELL_COLS, 1 / CELL_ROWS);
        cellMat.diffuseMapOffset = new pc.Vec2(col / CELL_COLS, row / CELL_ROWS);
        cellMat.emissiveMapTiling = cellMat.diffuseMapTiling;
        cellMat.emissiveMapOffset = cellMat.diffuseMapOffset;
        cellMat.update();
        tag.render.material = cellMat;
      }
      this.app.root.addChild(tag);
    });
  }

  private makeAtlas(): pc.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable for price tags');
    const cellW = canvas.width / CELL_COLS;
    const cellH = canvas.height / CELL_ROWS;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    PRICES.forEach((price, i) => {
      const col = i % CELL_COLS;
      const row = Math.floor(i / CELL_COLS);
      const cx = col * cellW;
      const cy = row * cellH;
      ctx.fillStyle = '#fff8dc';
      ctx.fillRect(cx + 4, cy + 4, cellW - 8, cellH - 8);
      ctx.strokeStyle = '#c02020';
      ctx.lineWidth = 4;
      ctx.strokeRect(cx + 4, cy + 4, cellW - 8, cellH - 8);
      ctx.fillStyle = '#c02020';
      ctx.font = `700 ${price.length > 6 ? 30 : 42}px monospace`;
      ctx.fillText(price, cx + cellW / 2, cy + cellH / 2);
    });
    const texture = new pc.Texture(this.app.graphicsDevice, {
      width: canvas.width,
      height: canvas.height,
      format: pc.PIXELFORMAT_RGBA8,
      minFilter: pc.FILTER_LINEAR,
      magFilter: pc.FILTER_LINEAR,
      addressU: pc.ADDRESS_CLAMP_TO_EDGE,
      addressV: pc.ADDRESS_CLAMP_TO_EDGE
    });
    texture.setSource(canvas);
    return texture;
  }
}
