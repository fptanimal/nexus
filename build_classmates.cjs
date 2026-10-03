/**
 * build_classmates.cjs
 *
 * Rebuilds src/assets/classmate{1,2,3}_final.png from the three Gemini sheets.
 * Run with:  node build_classmates.cjs
 *
 * SOURCE LAYOUT (all three sheets 960x1102, 6 columns):
 *   classmate1 (kính cận) : 3 bands -> band0 = DOWN, band1 = SIDE, band2 = UP
 *   classmate2 (bạn gái)  : 4 bands -> band0 = DOWN, band1 = SIDE (complete, both
 *                           directions), band2 = extra/broken duplicate of the side row
 *                           (empty column 2) and band3 = UP (complete).
 *   classmate3 (tóc xoăn) : 3 bands -> band0 = DOWN, band1 = SIDE, band2 = UP
 *
 * FACING of the SIDE row - verified numerically (verify_facing_edges.cjs / make_head_strip.cjs)
 * and by eye at zoom (nose_zoom.png):
 *   c0 c1 c2 face RIGHT   (skin hugs the right silhouette edge, mean dL≈52 / dR≈12 px)
 *   c3 c4 c5 face LEFT    (skin hugs the left edge, mean dL≈12 / dR≈52 px)
 *   Mirror check: c3 ≈ mirror(c0) with <3.3% mismatch for all three characters,
 *   so the sheet really is [R R R L L L] and NOT a single direction duplicated.
 *   => NO runtime mirroring is applied; the columns are assigned exactly as read.
 *
 * OUTPUT: 6 columns x 4 rows, cell 152x200 (same geometry as teacher_final.png):
 *   row0 = down, row1 = left, row2 = right, row3 = up
 *   columns 0..2 are the three real walk poses and 3..5 repeat them, so the engine loop
 *   (frameCount = 6) plays stand -> step1 -> step2 -> stand -> step1 -> step2 with no jump.
 *
 * REPAIRS
 *   classmate1 & classmate3: the last frame of the UP row (bottom-right) carries the AI
 *     sparkle watermark -> replaced by column 5 (c4) of the same row, which is the same
 *     pose (silhouette mismatch ~0.4%), so the sparkle disappears with no visible pop.
 *   classmate2: the broken extra row is not used at all. The real UP row (band3) is
 *     complete, so the up-walk loop is 6 full frames and never shows a blank/black frame.
 *
 * BACKGROUND: only magenta-family pixels are removed (distance to #FF00FF < 60, plus a
 * pink-fringe rule: red AND blue clearly above green). Black/brown hair, skin, white
 * shirt, dark trousers/skirt and glasses are never touched.
 *
 * The baked magenta contact shadow under the feet is peeled off because the engine draws
 * its own shadow blob.
 *
 * ALIGNMENT: every frame in a row is scaled by the SAME factor (so the walk poses are not
 * flattened into each other) and is anchored by (head centroid x, feet y), which keeps the
 * torso still and the feet on the same baseline across the six frames.
 */
const { Jimp } = require('jimp');
const fs = require('fs');

const OUT_DIR = 'src/assets';
const DEBUG_DIR = 'tmp_classmate_check';
const LOG = [];

const CELL_W = 152;
const CELL_H = 200;
const FRAMES_PER_ROW = 6;
const TARGET_ON_SCREEN_H = 42;   // px, same as teacher/father/mother draw size
const FEET_Y = CELL_H - 1;       // feet sit on the bottom row of the cell (like teacher_final)
const BODY_H = 190;              // full sprite height inside the 200px cell

// ── magenta removal ────────────────────────────────────────────────────────────
const MAGENTA_TOL = 60;
const isMagenta = (r, g, b) => Math.hypot(r - 255, g - 0, b - 255) < MAGENTA_TOL;
const isPinkFringe = (r, g, b) => (r - g >= 30 && b - g >= 30);
const isArt = (r, g, b) => !isMagenta(r, g, b) && !isPinkFringe(r, g, b);
const lum = (r, g, b) => (r + g + b) / 3;

/** Baked magenta contact shadow: dark, magenta-family (min(r,b) clearly above g). */
const isBakedShadow = (r, g, b) => {
  const ms = Math.min(r, b) - g;
  return ms >= 12 && lum(r, g, b) < 135;
};

const JOBS = [
  {
    key: 'classmate1',
    src: 'src/assets/classmate1_raw.png',
    out: 'classmate1_final.png',
    bands: { down: 0, side: 1, up: 2 },
    upColMap: [0, 1, 2, 3, 4, 4],   // c5 sparkle watermark -> reuse the pose from c4
  },
  {
    key: 'classmate2',
    src: 'src/assets/classmate2_raw.png',
    out: 'classmate2_final.png',
    bands: { down: 0, side: 1, up: 3 },  // band2 is the broken duplicate row, unused
    upColMap: [0, 1, 2, 3, 4, 5],        // band3 up row is complete
  },
  {
    key: 'classmate3',
    src: 'src/assets/classmate3_raw.png',
    out: 'classmate3_final.png',
    bands: { down: 0, side: 1, up: 2 },
    upColMap: [0, 1, 2, 3, 4, 4],   // c5 sparkle watermark -> reuse the pose from c4
  },
];

// ── helpers ────────────────────────────────────────────────────────────────────

function detectBands(img, log) {
  const { width: w, height: h, data: d } = img.bitmap;
  const rowCount = new Array(h).fill(0);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const p = (y * w + x) * 4;
    if (isArt(d[p], d[p + 1], d[p + 2])) rowCount[y]++;
  }
  const raw = [];
  let start = -1;
  for (let y = 0; y < h; y++) {
    const on = rowCount[y] > 2;
    if (on && start < 0) start = y;
    if ((!on || y === h - 1) && start >= 0) { raw.push([start, on ? y : y - 1]); start = -1; }
  }
  const bands = [];
  for (const b of raw) {
    if (bands.length && b[0] - bands[bands.length - 1][1] <= 12) bands[bands.length - 1][1] = b[1];
    else bands.push([...b]);
  }
  log.push(`  detected ${bands.length} row bands: ` + bands.map((b, i) => `[${i}] y ${b[0]}..${b[1]}`).join(' | '));
  return bands;
}

/** Extract one frame, drop magenta + fringe, peel the baked shadow, scrub the halo. */
function extractFrame(img, x0, y0, x1, y1, log, tag) {
  const { width: w, data: d } = img.bitmap;
  const fw = x1 - x0 + 1;
  const fh = y1 - y0 + 1;
  const px = new Uint8ClampedArray(fw * fh * 4);

  let removed = 0, fringe = 0;
  for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) {
    const sp = ((y0 + y) * w + (x0 + x)) * 4;
    const r = d[sp], g = d[sp + 1], b = d[sp + 2];
    const o = (y * fw + x) * 4;
    if (isMagenta(r, g, b)) { removed++; continue; }
    if (isPinkFringe(r, g, b)) { fringe++; continue; }
    px[o] = r; px[o + 1] = g; px[o + 2] = b; px[o + 3] = 255;
  }
  const f = { w: fw, h: fh, px };
  const peeled = peelShadow(f);
  const scrubbed = scrubHalo(f);
  log.push(`    ${tag}: ${fw}x${fh}  magenta ${removed}px, fringe ${fringe}px, shadow ${peeled}px, halo ${scrubbed}px`);
  return f;
}

function frameBBox(f) {
  let minX = 1e9, maxX = -1, minY = 1e9, maxY = -1;
  for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) {
    if (f.px[(y * f.w + x) * 4 + 3] === 0) continue;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  return { minX, maxX, minY, maxY };
}

/** Peel the baked magenta contact shadow below the feet. */
function peelShadow(f) {
  const bb = frameBBox(f);
  if (bb.maxY < 0) return 0;
  const footBandTop = bb.maxY - Math.round((bb.maxY - bb.minY + 1) * 0.16);
  let peeled = 0;
  for (let y = footBandTop; y <= bb.maxY; y++) for (let x = bb.minX; x <= bb.maxX; x++) {
    const o = (y * f.w + x) * 4;
    if (f.px[o + 3] === 0) continue;
    if (isBakedShadow(f.px[o], f.px[o + 1], f.px[o + 2])) { f.px[o + 3] = 0; peeled++; }
  }
  return peeled;
}

/** Scrub magenta/pink blend pixels sitting on the silhouette edge. */
function scrubHalo(f) {
  const w = f.w, h = f.h;
  const alpha = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : f.px[(y * w + x) * 4 + 3];
  let scrubbed = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = (y * w + x) * 4;
    if (f.px[o + 3] === 0) continue;
    const isEdge = alpha(x - 1, y) === 0 || alpha(x + 1, y) === 0 || alpha(x, y - 1) === 0 || alpha(x, y + 1) === 0;
    if (!isEdge) continue;
    if (isMagenta(f.px[o], f.px[o + 1], f.px[o + 2]) || isPinkFringe(f.px[o], f.px[o + 1], f.px[o + 2])) {
      f.px[o + 3] = 0; scrubbed++;
    }
  }
  return scrubbed;
}

function scaleFrame(f, s) {
  const nw = Math.max(1, Math.round(f.w * s));
  const nh = Math.max(1, Math.round(f.h * s));
  const out = { w: nw, h: nh, px: new Uint8ClampedArray(nw * nh * 4) };
  for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) {
    const sx = Math.min(f.w - 1, Math.floor(x / s));
    const sy = Math.min(f.h - 1, Math.floor(y / s));
    const so = (sy * f.w + sx) * 4;
    const o = (y * nw + x) * 4;
    out.px[o] = f.px[so]; out.px[o + 1] = f.px[so + 1];
    out.px[o + 2] = f.px[so + 2]; out.px[o + 3] = f.px[so + 3];
  }
  return out;
}

/**
 * Horizontal anchor = centroid of the HEAD band (top 30% of the sprite). Using the head
 * instead of the bounding box keeps the torso nailed to the cell centre while the legs
 * swing, so the character stops sliding sideways between walk frames.
 */
function anchorX(f) {
  const bb = frameBBox(f);
  if (bb.maxY < 0) return f.w / 2;
  const bandH = Math.max(1, Math.round((bb.maxY - bb.minY + 1) * 0.30));
  let sx = 0, n = 0;
  for (let y = bb.minY; y < bb.minY + bandH; y++) for (let x = 0; x < f.w; x++) {
    if (f.px[(y * f.w + x) * 4 + 3] === 0) continue;
    sx += x; n++;
  }
  return n ? sx / n : (bb.minX + bb.maxX) / 2;
}

/**
 * Scale by ONE factor for the whole row (so the pose differences inside the row survive
 * instead of being normalised away), then anchor the feet on FEET_Y and the head centroid
 * on the cell centre.
 */
function placeInCell(f, scale, cellW, cellH, feetY) {
  const cell = new Uint8ClampedArray(cellW * cellH * 4);
  const bb = frameBBox(f);
  if (bb.maxY < 0) return cell;
  const scaled = Math.abs(scale - 1) > 0.004 ? scaleFrame(f, scale) : f;
  const sbb = frameBBox(scaled);
  const dx = Math.round(cellW / 2 - anchorX(scaled));
  const dy = Math.round(feetY - sbb.maxY);
  for (let y = 0; y < scaled.h; y++) for (let x = 0; x < scaled.w; x++) {
    const so = (y * scaled.w + x) * 4;
    if (scaled.px[so + 3] === 0) continue;
    const tx = x + dx, ty = y + dy;
    if (tx < 0 || ty < 0 || tx >= cellW || ty >= cellH) continue;
    const o = (ty * cellW + tx) * 4;
    cell[o] = scaled.px[so]; cell[o + 1] = scaled.px[so + 1];
    cell[o + 2] = scaled.px[so + 2]; cell[o + 3] = 255;
  }
  return cell;
}

// ── main build ─────────────────────────────────────────────────────────────────

async function buildCharacter(job) {
  LOG.push(`\n=== ${job.key} <- ${job.src} ===`);
  const img = await Jimp.read(job.src);
  const { width: w } = img.bitmap;
  const bands = detectBands(img, LOG);

  const cellW = w / 6;
  const cols = [];
  for (let ci = 0; ci < 6; ci++) cols.push([Math.round(ci * cellW), Math.min(w - 1, Math.round((ci + 1) * cellW) - 1)]);

  const pick = (bandIdx, ci, tag) =>
    extractFrame(img, cols[ci][0], bands[bandIdx][0], cols[ci][1], bands[bandIdx][1], LOG, tag);

  // ---- DOWN row: all 6 source frames, source order ----
  const downFrames = [];
  for (let ci = 0; ci < 6; ci++) downFrames.push(pick(job.bands.down, ci, `down c${ci}`));

  // ---- SIDE row: c0..c2 face RIGHT, c3..c5 face LEFT (verified, no runtime mirror) ----
  // The sheet only carries 3 real poses per direction, so each direction row is filled by
  // repeating its 3 poses twice -> the engine's frameCount = 6 loop still walks a full cycle.
  const sideFrames = [];
  for (let ci = 0; ci < 6; ci++) sideFrames.push(pick(job.bands.side, ci, `side c${ci}`));
  const rightPoses = [sideFrames[0], sideFrames[1], sideFrames[2]];
  const leftPoses = [sideFrames[3], sideFrames[4], sideFrames[5]];
  const rightFrames = [...rightPoses, ...rightPoses];
  const leftFrames = [...leftPoses, ...leftPoses];
  LOG.push(`  side row facing: c0..c2 = RIGHT, c3..c5 = LEFT (verified numerically + by eye)`);
  LOG.push(`  side rows filled as [R0 R1 R2 R0 R1 R2] / [L0 L1 L2 L0 L1 L2]`);

  // ---- UP row: repaired column map ----
  const upFrames = [];
  for (let ci = 0; ci < 6; ci++) {
    const src = job.upColMap[ci];
    upFrames.push(pick(job.bands.up, src, `up c${ci} <- src c${src}`));
  }
  LOG.push(`  up row column map: [${job.upColMap.join(', ')}]`);

  const rowsOut = [
    { name: 'down', frames: downFrames },
    { name: 'left', frames: leftFrames },
    { name: 'right', frames: rightFrames },
    { name: 'up', frames: upFrames },
  ];

  for (const r of rowsOut) {
    let maxH = 0;
    for (const f of r.frames) {
      const bb = frameBBox(f);
      if (bb.maxY >= 0) maxH = Math.max(maxH, bb.maxY - bb.minY + 1);
    }
    r.charH = maxH;
    r.scale = BODY_H / maxH;
  }
  LOG.push(`  source body height per row: ` + rowsOut.map(r => `${r.name}=${r.charH}`).join(' '));
  LOG.push(`  row scale factors: ` + rowsOut.map(r => `${r.name}=${r.scale.toFixed(3)}`).join(' '));

  const sheetW = CELL_W * FRAMES_PER_ROW;
  const sheetH = CELL_H * 4;
  const sheet = new Uint8ClampedArray(sheetW * sheetH * 4);

  for (let ri = 0; ri < 4; ri++) {
    for (let ci = 0; ci < FRAMES_PER_ROW; ci++) {
      const cell = placeInCell(rowsOut[ri].frames[ci], rowsOut[ri].scale, CELL_W, CELL_H, FEET_Y);
      for (let y = 0; y < CELL_H; y++) for (let x = 0; x < CELL_W; x++) {
        const so = (y * CELL_W + x) * 4;
        if (cell[so + 3] === 0) continue;
        const o = ((ri * CELL_H + y) * sheetW + (ci * CELL_W + x)) * 4;
        sheet[o] = cell[so]; sheet[o + 1] = cell[so + 1];
        sheet[o + 2] = cell[so + 2]; sheet[o + 3] = 255;
      }
    }
  }

  const outImg = new Jimp({ width: sheetW, height: sheetH, color: 0x00000000 });
  outImg.bitmap.data = Buffer.from(sheet.buffer);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await outImg.write(`${OUT_DIR}/${job.out}`);
  LOG.push(`  wrote ${OUT_DIR}/${job.out}  ${sheetW}x${sheetH}  cell ${CELL_W}x${CELL_H}`);
  LOG.push(`  character ${BODY_H}px in a ${CELL_H}px cell -> ${(BODY_H / CELL_H * TARGET_ON_SCREEN_H).toFixed(1)}px tall on screen`);
}

async function main() {
  for (const job of JOBS) await buildCharacter(job);
  fs.mkdirSync(DEBUG_DIR, { recursive: true });
  fs.writeFileSync(`${DEBUG_DIR}/build_log.txt`, LOG.join('\n'));
  console.log(LOG.join('\n'));
}

main().catch(e => { console.error(e); process.exit(1); });
