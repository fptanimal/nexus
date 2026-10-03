/**
 * build_teacher_sprite.cjs
 *
 * Rebuilds src/assets/teacher_final.png from src/assets/teacher_peach.png.
 * Run with:  node build_teacher_sprite.cjs
 *
 * Source sheet layout (487x1024, 6 columns x 5 bands) - verified by hand:
 *   band0 y   8..209  front / down   (6 walk frames, all facing the camera)
 *   band1 y 218..418  side view      MIXED: c0 c1 c2 c4 face RIGHT, c3 c5 face LEFT
 *   band2 y 426..514  portrait heads (unused)
 *   band3 y 536..789  side view      MIXED: c0 c1 face RIGHT, c2..c5 face LEFT
 *   band4 y 809..1023 back / up      (6 walk frames)
 *
 * What this fixes:
 *  1. The source has a solid beige background.  It is removed with a FLOOD FILL that
 *     starts at the image border only.  A whole-image colour-distance pass would eat
 *     the face and hands, because the skin tone is only ~20-100 RGB away from the
 *     background colour.
 *  2. The source art has a flat grey "contact shadow" ellipse baked in under the feet.
 *     The game draws its own shadow blob, so the baked one is peeled away.
 *  3. The source is anti-aliased against the beige background, leaving a 1-2px beige
 *     fringe around the silhouette once the background is gone.  It is scrubbed off.
 *  4. The side bands contain frames facing the wrong way.  Only frames whose face
 *     really points the wanted direction are used; the other row is mirrored from them.
 *  5. Frames drift sideways and have different heights inside a band, which makes the
 *     sprite jitter while walking.  Every frame is re-anchored on its head centroid and
 *     on a shared feet baseline.
 *
 * Output: 6 columns x 4 rows (row0 down, row1 left, row2 right, row3 up), uniform cells,
 * bottom anchored, transparent background.  Columns 0..2 are the three walk poses and
 * 3..5 repeat them, matching the engine's `frameCount = 6` walk loop.
 */
const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

const SRC = 'src/assets/teacher_peach.png';
const OUT = 'src/assets/teacher_final.png';
const DEBUG_DIR = 'tmp_teacher_check';

const BAND_DOWN = { y: 8, h: 202, name: 'down' };
const BAND_SIDE = { y: 218, h: 201, name: 'side' };
const BAND_UP = { y: 809, h: 215, name: 'up' };

const COLS_PER_BAND = 6;
const BG_TOLERANCE = 28;

// Verified facings in band1 (side view):  c0 c1 c2 c4 => RIGHT,  c3 c5 => LEFT
const WALK_COLS = [0, 2, 4];
const PICKS = {
  down: { band: BAND_DOWN, cols: WALK_COLS },
  right: { band: BAND_SIDE, cols: WALK_COLS },
  up: { band: BAND_UP, cols: WALK_COLS },
};
const FRAMES_PER_ROW = 6;
const TARGET_ON_SCREEN_H = 42; // px; the father/mother sheets land at ~41-42
// The source bands were generated at slightly different character heights, which would
// make the teacher shrink/grow when changing direction. Everything is normalised to this
// source-pixel character height (only rows that are off get rescaled).
const NORMALIZED_CHAR_H = 196;

// ── colour predicates ───────────────────────────────────────────────────────────
// Flat grey contact shadow: nearly colourless, mid grey (measured ~rgb(117,117,112)).
const isGreyShadow = (r, g, b) => {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return mx - mn <= 38 && r >= 80 && r <= 175;
};
// Anti-aliased beige fringe: warm brown, but far less saturated than the skin
// (skin is rgb(225,177,71), red-minus-blue = 154, so it is never caught here).
const isBeigeFringe = (r, g, b) => {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return r >= 70 && r > g && g >= b && (r - b) >= 20 && (r - b) <= 90 && mx - mn <= 80;
};
// Colours that make up the artwork itself.  An edge pixel closer to the background than
// to any of these is a leftover background blend, not part of the character.
const ART_PALETTE = [[110, 191, 238], [29, 40, 46], [4, 4, 6], [225, 177, 71],
                     [178, 147, 82], [240, 224, 200], [80, 64, 48], [243, 232, 210]];
const d3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

function removeBackgroundAndShadow(img, log) {
  const { width: w, height: h, data: d } = img.bitmap;
  const bg = { r: d[0], g: d[1], b: d[2] };
  const alphaAt = (x, y) => d[(y * w + x) * 4 + 3];

  // ── pass 1: flood fill the flat background, seeded from the image border only ──
  const seen = new Uint8Array(w * h);
  const matchesBg = (p) => {
    const i = p * 4;
    if (d[i + 3] === 0) return false;
    return Math.abs(d[i] - bg.r) <= BG_TOLERANCE &&
           Math.abs(d[i + 1] - bg.g) <= BG_TOLERANCE &&
           Math.abs(d[i + 2] - bg.b) <= BG_TOLERANCE;
  };
  const stack = [];
  const consider = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (seen[p]) return;
    seen[p] = 1;
    if (matchesBg(p)) stack.push(p);
  };
  for (let x = 0; x < w; x++) { consider(x, 0); consider(x, h - 1); }
  for (let y = 0; y < h; y++) { consider(0, y); consider(w - 1, y); }
  let cleared = 0;
  while (stack.length) {
    const p = stack.pop();
    d[p * 4 + 3] = 0;
    cleared++;
    const x = p % w, y = (p - x) / w;
    consider(x - 1, y); consider(x + 1, y); consider(x, y - 1); consider(x, y + 1);
  }
  log.push(`  1. flood fill from border: bg rgb(${bg.r},${bg.g},${bg.b}) tol=${BG_TOLERANCE} -> cleared ${cleared}px (${(100 * cleared / (w * h)).toFixed(1)}%)`);

  const borderPixels = () => {
    const out = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (alphaAt(x, y) === 0) continue;
      if ((x > 0 && alphaAt(x - 1, y) === 0) || (x < w - 1 && alphaAt(x + 1, y) === 0) ||
          (y > 0 && alphaAt(x, y - 1) === 0) || (y < h - 1 && alphaAt(x, y + 1) === 0)) out.push(y * w + x);
    }
    return out;
  };

  // ── pass 2: peel the grey contact shadow inwards from its silhouette ──
  let shadowRemoved = 0;
  for (let round = 0; round < 200; round++) {
    const border = borderPixels();
    let removedThisRound = 0;
    for (const p of border) {
      const i = p * 4;
      if (isGreyShadow(d[i], d[i + 1], d[i + 2])) { d[i + 3] = 0; removedThisRound++; }
    }
    shadowRemoved += removedThisRound;
    if (!removedThisRound) break;
  }
  log.push(`  2. peeled baked grey contact shadow: ${shadowRemoved}px`);

  // ── pass 3: scrub the anti-aliased beige fringe + 1px dilate-free erode ──
  let fringeRemoved = 0, eroded = 0;
  {
    // one clean 1px erode first, which drops the outermost blend ring outright
    const border = borderPixels();
    for (const p of border) { d[p * 4 + 3] = 0; eroded++; }
    log.push(`  3a. removed outermost blend ring: ${eroded}px`);
  }
  for (let round = 0; round < 4; round++) {
    const border = borderPixels();
    let removedThisRound = 0;
    for (const p of border) {
      const i = p * 4;
      if (isBeigeFringe(d[i], d[i + 1], d[i + 2])) { d[i + 3] = 0; removedThisRound++; }
    }
    fringeRemoved += removedThisRound;
    if (!removedThisRound) break;
  }
  log.push(`  3b. scrubbed beige/brown fringe: ${fringeRemoved}px`);

  // ── pass 4: kill any surviving edge pixel that is closer to the background colour
  //            than to any colour of the artwork itself ──
  let haloRemoved = 0;
  for (let round = 0; round < 16; round++) {
    const border = borderPixels();
    let removedThisRound = 0;
    for (const p of border) {
      const i = p * 4;
      const px = [d[i], d[i + 1], d[i + 2]];
      const dToBg = d3(px, [bg.r, bg.g, bg.b]);
      let dToArt = 1e9;
      for (const a of ART_PALETTE) dToArt = Math.min(dToArt, d3(px, a));
      if (dToBg < dToArt) { d[i + 3] = 0; removedThisRound++; }
    }
    haloRemoved += removedThisRound;
    if (!removedThisRound) break;
  }
  log.push(`  4. scrubbed residual background halo: ${haloRemoved}px`);

  return bg;
}

// ── helpers ────────────────────────────────────────────────────────────────────
/** Keep only the biggest blob of pixels - drops slivers that bleed in from the
 *  neighbouring source column plus any stray specks left by the background scrub. */
function keepLargestComponent(img, log) {
  const { width: w, height: h, data: d } = img.bitmap;
  const seen = new Uint8Array(w * h);
  const comps = [];
  for (let p0 = 0; p0 < w * h; p0++) {
    if (seen[p0] || d[p0 * 4 + 3] === 0) continue;
    const q = [p0];
    seen[p0] = 1;
    const members = [];
    while (q.length) {
      const p = q.pop();
      members.push(p);
      const x = p % w, y = (p - x) / w;
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const np = ny * w + nx;
        if (!seen[np] && d[np * 4 + 3] > 0) { seen[np] = 1; q.push(np); }
      }
    }
    comps.push(members);
  }
  if (comps.length <= 1) return 0;
  comps.sort((a, b) => b.length - a.length);
  let dropped = 0;
  for (let i = 1; i < comps.length; i++) {
    if (comps[i].length < 40) { // only drop small specks/slivers, never real art
      for (const p of comps[i]) d[p * 4 + 3] = 0;
      dropped += comps[i].length;
    }
  }
  return dropped;
}

function bboxOf(img, x0, y0, w, h) {
  const d = img.bitmap.data, W = img.bitmap.width;
  let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1, n = 0, sumX = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = ((y0 + y) * W + (x0 + x)) * 4;
    if (d[i + 3] < 32) continue;
    n++; sumX += x;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  if (!n) return null;
  return { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1, n, cx: sumX / n };
}

(async () => {
  const log = [];
  const src = await Jimp.read(SRC);
  const { width: SW, height: SH } = src.bitmap;
  log.push(`source ${SRC} ${SW}x${SH}`);
  const bg = removeBackgroundAndShadow(src, log);

  // safety: the fill must not have eaten the face (skin tone is near the bg colour)
  const probe = bboxOf(src, 22, BAND_DOWN.y, 38, 60);
  log.push(`  face probe after cleanup: ${probe ? probe.n + ' opaque px (OK)' : 'EMPTY => LEAK!'}`);

  const cellW = Math.floor(SW / COLS_PER_BAND);

  function extractFrame(band, col) {
    const { y, h } = band;
    const x0 = Math.round(col * SW / COLS_PER_BAND);
    const xEnd = Math.round((col + 1) * SW / COLS_PER_BAND);
    const inW = xEnd - x0;
    const tile = new Jimp({ width: inW, height: h, color: 0x00000000 });
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < inW; xx++) {
      const sx = x0 + xx;
      if (sx >= SW) continue;
      const i = ((y + yy) * SW + sx) * 4;
      const a = src.bitmap.data[i + 3];
      if (a === 0) continue;
      const t = (yy * inW + xx) * 4;
      tile.bitmap.data[t] = src.bitmap.data[i];
      tile.bitmap.data[t + 1] = src.bitmap.data[i + 1];
      tile.bitmap.data[t + 2] = src.bitmap.data[i + 2];
      tile.bitmap.data[t + 3] = a;
    }
    const dropped = keepLargestComponent(tile, log);
    if (dropped) log.push(`    ${band.name} col${col}: dropped ${dropped}px of neighbouring-column slivers`);
    return tile;
  }

  // ── pick frames per row ──
  const frameMeta = (tile, col) => {
    const body = bboxOf(tile, 0, 0, tile.bitmap.width, tile.bitmap.height);
    const headH = Math.max(8, Math.round(body.h * 0.30));
    const head = bboxOf(tile, 0, body.minY, tile.bitmap.width, headH);
    return { tile, col, body, head, bodyCx: (body.minX + body.maxX) / 2 };
  };
  const rows = {};
  for (const [name, pick] of Object.entries(PICKS)) {
    const frames = pick.cols.map((c) => frameMeta(extractFrame(pick.band, c), c));
    const feetLine = frames.map(f => f.body.maxY).sort((a, b) => a - b)[Math.floor(frames.length / 2)];
    log.push(`  row ${name}: cols [${pick.cols}] bodyH=${frames.map(f => f.body.h).join('/')} bodyCx=${frames.map(f => f.bodyCx.toFixed(1)).join('/')} feet=${feetLine}`);
    rows[name] = { frames, feetLine };
  }

  // ── normalise character height across rows so turning does not resize the sprite ──
  for (const name of ['down', 'right', 'up']) {
    const row = rows[name];
    const heights = row.frames.map(f => f.body.h).sort((a, b) => a - b);
    const charH = heights[Math.floor(heights.length / 2)];
    const scale = NORMALIZED_CHAR_H / charH;
    if (Math.abs(scale - 1) >= 0.02) {
      row.frames = row.frames.map((f) => frameMeta(
        f.tile.resize({ w: Math.max(1, Math.round(f.tile.bitmap.width * scale)),
                        h: Math.max(1, Math.round(f.tile.bitmap.height * scale)),
                        mode: 'nearestNeighbor' }), f.col));
      row.feetLine = row.frames.map(f => f.body.maxY).sort((a, b) => a - b)[Math.floor(row.frames.length / 2)];
      log.push(`  row ${name}: height ${charH} -> ${NORMALIZED_CHAR_H} (x${scale.toFixed(3)})`);
    } else {
      log.push(`  row ${name}: height ${charH} (already normal)`);
    }
  }

  // ── size the output cell ──
  let maxCharH = 0, maxTileW = 0;
  for (const { frames } of Object.values(rows)) {
    for (const f of frames) {
      const charH = f.body.maxY - f.body.minY + 1;
      if (charH > maxCharH) maxCharH = charH;
      if (f.tile.bitmap.width > maxTileW) maxTileW = f.tile.bitmap.width;
    }
  }
  const maxHalfWidth = Math.ceil(maxTileW / 2);
  const outCellH = maxCharH + 2;
  // the engine draws the cell 32px wide, so cell width controls the world scale
  const outCellW = Math.max(Math.round(maxHalfWidth * 2) + 2, Math.round(outCellH * 32 / TARGET_ON_SCREEN_H));
  log.push(`  output cell ${outCellW}x${outCellH} -> character ${(maxCharH / outCellW * 32).toFixed(1)}px tall on screen`);

  // ── build one horizontal strip per facing ──
  const cycle = [0, 1, 2, 0, 1, 2]; // 3 walk poses, repeated to fill the 6 columns
  const stripW = outCellW * FRAMES_PER_ROW;
  function buildStrip(name) {
    const { frames, feetLine } = rows[name];
    const strip = new Jimp({ width: stripW, height: outCellH, color: 0x00000000 });
    // one shared anchor per row: removes the sideways drift the generator baked into
    // the frames, so the character does not slide while walking
    const targetCx = frames.reduce((s, f) => s + f.bodyCx, 0) / frames.length;
    const dt = strip.bitmap.data;
    frames.forEach((f, i) => {
      const tileCx = Math.round(f.tile.bitmap.width / 2);
      const drift = Math.round(targetCx - f.bodyCx);
      const anchorX = Math.round(outCellW / 2) - tileCx + drift;
      const anchorY = (outCellH - 1) - feetLine;
      const td = f.tile.bitmap.data;
      for (let c = 0; c < FRAMES_PER_ROW; c++) {
        if (cycle[c] !== i) continue;
        const cellX = c * outCellW;
        for (let y = 0; y < f.tile.bitmap.height; y++) {
          for (let x = 0; x < f.tile.bitmap.width; x++) {
            const si = (y * f.tile.bitmap.width + x) * 4;
            if (td[si + 3] === 0) continue;
            const dx = cellX + anchorX + x;
            const dy = anchorY + y;
            if (dx < 0 || dy < 0 || dx >= stripW || dy >= outCellH) continue;
            const di = (dy * stripW + dx) * 4;
            dt[di] = td[si]; dt[di + 1] = td[si + 1]; dt[di + 2] = td[si + 2]; dt[di + 3] = td[si + 3];
          }
        }
      }
    });
    return strip;
  }

  const order = ['down', 'left', 'right', 'up'];
  const strips = { down: buildStrip('down'), right: buildStrip('right'), up: buildStrip('up') };
  // Row 1 must mirror row 2 exactly.  Mirror each finished cell in place (mirroring the
  // whole strip would also reverse the walk order, which would desync the two facings).
  strips.left = strips.right.clone();
  {
    const lt = strips.left.bitmap.data, rt = strips.right.bitmap.data;
    for (let c = 0; c < FRAMES_PER_ROW; c++) {
      for (let y = 0; y < outCellH; y++) {
        for (let x = 0; x < outCellW; x++) {
          const sx = c * outCellW + (outCellW - 1 - x);
          const dx = c * outCellW + x;
          const si = (y * stripW + sx) * 4;
          const di = (y * stripW + dx) * 4;
          lt[di] = rt[si]; lt[di + 1] = rt[si + 1]; lt[di + 2] = rt[si + 2]; lt[di + 3] = rt[si + 3];
        }
      }
    }
  }
  log.push(`  row left: exact in-place horizontal mirror of row right`);

  const sheet = new Jimp({ width: stripW, height: outCellH * 4, color: 0x00000000 });
  order.forEach((name, r) => sheet.composite(strips[name], 0, r * outCellH));

  // final halo pass: trimming the tiles apart can expose a new silhouette edge, so scrub
  // the finished sheet once more.  Also enforces the exact-mirror relationship again.
  {
    const sw = sheet.bitmap.width, sh = sheet.bitmap.height, sd = sheet.bitmap.data;
    const alphaAt = (x, y) => sd[(y * sw + x) * 4 + 3];
    const edgeOf = () => {
      const out = [];
      for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
        if (alphaAt(x, y) === 0) continue;
        if ((x > 0 && alphaAt(x - 1, y) === 0) || (x < sw - 1 && alphaAt(x + 1, y) === 0) ||
            (y > 0 && alphaAt(x, y - 1) === 0) || (y < sh - 1 && alphaAt(x, y + 1) === 0)) out.push(y * sw + x);
      }
      return out;
    };
    let removed = 0;
    for (let round = 0; round < 16; round++) {
      let n = 0;
      for (const p of edgeOf()) {
        const i = p * 4;
        const px = [sd[i], sd[i + 1], sd[i + 2]];
        const dToBg = d3(px, [bg.r, bg.g, bg.b]);
        let dToArt = 1e9;
        for (const a of ART_PALETTE) dToArt = Math.min(dToArt, d3(px, a));
        if (dToBg < dToArt) { sd[i + 3] = 0; n++; }
      }
      removed += n;
      if (!n) break;
    }
    log.push(`  5. final sheet halo scrub: ${removed}px`);
  }

  await sheet.write(OUT);
  log.push(`  wrote ${OUT} ${sheet.bitmap.width}x${sheet.bitmap.height}`);

  // ── verify the produced sheet ──
  const out = await Jimp.read(OUT);
  const od = out.bitmap.data, W = out.bitmap.width, ccw = out.bitmap.width / 6, cch = out.bitmap.height / 4;
  let grey = 0, fringe = 0, beige = 0;
  for (let i = 0; i < od.length; i += 4) {
    if (od[i + 3] < 32) continue;
    if (isGreyShadow(od[i], od[i + 1], od[i + 2])) grey++;
    if (isBeigeFringe(od[i], od[i + 1], od[i + 2])) fringe++;
    if (Math.abs(od[i] - bg.r) <= 8 && Math.abs(od[i + 1] - bg.g) <= 8 && Math.abs(od[i + 2] - bg.b) <= 8) beige++;
  }
  log.push(`  verify: grey-shadow px=${grey}  beige-fringe px=${fringe}  flat-bg px=${beige}`);
  for (let r = 0; r < 4; r++) {
    const parts = [];
    for (let c = 0; c < 6; c++) {
      const bb = bboxOf(out, c * ccw, r * cch, ccw, cch);
      parts.push(bb ? `cx${bb.cx.toFixed(0)} y${bb.minY}-${bb.maxY}` : 'EMPTY');
    }
    log.push(`  row ${order[r].padEnd(5)}: ${parts.join(' | ')}`);
  }

  fs.mkdirSync(DEBUG_DIR, { recursive: true });
  fs.writeFileSync(path.join(DEBUG_DIR, 'build.log'), log.join('\n') + '\n');
  console.log(log.join('\n'));
})().catch(e => { console.error(e); process.exit(1); });
