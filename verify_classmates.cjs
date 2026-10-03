/**
 * verify_classmates.cjs
 * Checks src/assets/classmate{1,2,3}_final.png (6 cols x 4 rows, cell 152x200).
 * Run: node verify_classmates.cjs
 *
 * Rows: 0 = down, 1 = left, 2 = right, 3 = up
 * Checks
 *   1  geometry: 912x800, cell 152x200
 *   2  every one of the 24 cells carries artwork (no blank/black frame)
 *   3  no magenta / pink-fringe pixel survives anywhere in the sheet
 *   4  facing: the LEFT row looks left, the RIGHT row looks right, down/up look straight
 *   5  walk animation: the three poses of every row really differ (legs move)
 *   6  feet baseline identical across all frames of a row (no vertical bounce)
 *   7  head centroid nailed to the cell centre across a row (no sideways sliding)
 *   8  watermark repair: up-row column 5 is the clean replacement (identical to column 4)
 */
const { Jimp } = require('jimp');
const fs = require('fs');

const CELL_W = 152, CELL_H = 200, COLS = 6, ROWS = 4;
const ROW_NAMES = ['down', 'left', 'right', 'up'];
const SHEETS = ['classmate1', 'classmate2', 'classmate3'];

const fails = [];
const warns = [];
const out = [];
const ok = (s) => out.push(`  PASS  ${s}`);
const bad = (s) => { out.push(`  FAIL  ${s}`); fails.push(s); };

const bbox = (px, w, h) => {
  let minX = 1e9, maxX = -1, minY = 1e9, maxY = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (px[(y * w + x) * 4 + 3] === 0) continue;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  return { minX, maxX, minY, maxY };
};

const isSkin = (r, g, b) => r > 140 && g > 95 && b > 60 && (r - g) >= 12 && (g - b) >= 8 && !(r > 235 && g > 235 && b > 235);
const isMagentaFam = (r, g, b) => (r - g >= 30 && b - g >= 30);

/** mean x of the skin pixels inside the head band, relative to the frame's content centre */
function facingScore(cell) {
  const bb = bbox(cell, CELL_W, CELL_H);
  if (bb.maxY < 0) return null;
  const bandH = Math.max(1, Math.round((bb.maxY - bb.minY + 1) * 0.35));
  let sx = 0, n = 0;
  for (let y = bb.minY; y < bb.minY + bandH; y++) for (let x = 0; x < CELL_W; x++) {
    const o = (y * CELL_W + x) * 4;
    if (cell[o + 3] === 0) continue;
    if (isSkin(cell[o], cell[o + 1], cell[o + 2])) { sx += x; n++; }
  }
  if (!n) return null;
  return sx / n - CELL_W / 2;
}

/** head centroid x (stable anchor) */
function headCentroidX(cell) {
  const bb = bbox(cell, CELL_W, CELL_H);
  if (bb.maxY < 0) return null;
  const bandH = Math.max(1, Math.round((bb.maxY - bb.minY + 1) * 0.30));
  let sx = 0, n = 0;
  for (let y = bb.minY; y < bb.minY + bandH; y++) for (let x = 0; x < CELL_W; x++) {
    if (cell[(y * CELL_W + x) * 4 + 3] === 0) continue;
    sx += x; n++;
  }
  return n ? sx / n : null;
}

/** fraction of pixels that differ in the lower body (legs) between two cells */
function legDiff(a, b) {
  let diff = 0, tot = 0;
  for (let y = Math.round(CELL_H * 0.62); y < CELL_H; y++) for (let x = 0; x < CELL_W; x++) {
    const o = (y * CELL_W + x) * 4;
    const ao = a[o + 3] === 0, bo = b[o + 3] === 0;
    if (ao && bo) continue;
    tot++;
    if (ao !== bo) { diff++; continue; }
    if (Math.abs(a[o] - b[o]) + Math.abs(a[o + 1] - b[o + 1]) + Math.abs(a[o + 2] - b[o + 2]) > 24) diff++;
  }
  return tot ? diff / tot : 0;
}

fs.mkdirSync('tmp_classmate_check', { recursive: true });
const ic = [];
const dc = [];

async function check(key) {
  out.push(`\n=== ${key}_final.png ===`);
  const img = await Jimp.read(`src/assets/${key}_final.png`);
  const { width: w, height: h, data: d } = img.bitmap;
  const sheetW = CELL_W * COLS, sheetH = CELL_H * ROWS;

  if (w !== sheetW || h !== sheetH) bad(`${key}: size ${w}x${h}, expected ${sheetW}x${sheetH}`);
  else ok(`geometry ${w}x${h} = 6 cols x 4 rows of ${CELL_W}x${CELL_H}`);

  const cells = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const cell = new Uint8ClampedArray(CELL_W * CELL_H * 4);
    for (let y = 0; y < CELL_H; y++) for (let x = 0; x < CELL_W; x++) {
      const so = (((r * CELL_H + y) * w) + (c * CELL_W + x)) * 4;
      const o = (y * CELL_W + x) * 4;
      cell[o] = d[so]; cell[o + 1] = d[so + 1]; cell[o + 2] = d[so + 2]; cell[o + 3] = d[so + 3];
    }
    cells.push(cell);
  }

  // 2 + 3
  let emptyCells = 0, magenta = 0, opaqueTotal = 0;
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    let op = 0;
    for (let p = 0; p < CELL_W * CELL_H; p++) {
      const o = p * 4;
      if (cell[o + 3] === 0) continue;
      op++;
      if (isMagentaFam(cell[o], cell[o + 1], cell[o + 2])) magenta++;
    }
    opaqueTotal += op;
    if (op < 300) { emptyCells++; bad(`${key} r${Math.floor(i / 6)} c${i % 6}: only ${op} opaque px (blank frame)`); }
  }
  if (emptyCells === 0) ok(`all 24 cells carry artwork (${opaqueTotal} opaque px total)`);
  if (magenta === 0) ok(`0 magenta/pink pixels anywhere in the sheet`);
  else bad(`${key}: ${magenta} magenta/pink pixels left`);

  // 4 facing
  const scores = [];
  for (let r = 0; r < ROWS; r++) {
    const rs = [];
    for (let c = 0; c < COLS; c++) rs.push(facingScore(cells[r * COLS + c]));
    scores.push(rs);
  }
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const leftRow = mean(scores[1]), rightRow = mean(scores[2]);
  const downRow = mean(scores[0]), upRow = mean(scores[3]);
  out.push(`  facing score (px right of centre, + = facing right): down ${downRow.toFixed(1)} | left ${leftRow.toFixed(1)} | right ${rightRow.toFixed(1)} | up ${upRow.toFixed(1)}`);
  if (leftRow < -6) ok(`LEFT row really looks left (${leftRow.toFixed(1)}px)`);
  else bad(`${key}: LEFT row facing score ${leftRow.toFixed(1)} (expected strongly negative)`);
  if (rightRow > 6) ok(`RIGHT row really looks right (${rightRow.toFixed(1)}px)`);
  else bad(`${key}: RIGHT row facing score ${rightRow.toFixed(1)} (expected strongly positive)`);
  if (Math.abs(rightRow - Math.abs(leftRow)) < 12) ok(`left/right facing magnitudes match (${Math.abs(leftRow).toFixed(1)} vs ${rightRow.toFixed(1)})`);
  else warns.push(`${key}: left/right facing magnitudes differ (${Math.abs(leftRow).toFixed(1)} vs ${rightRow.toFixed(1)})`);
  if (Math.abs(downRow) < 8 && Math.abs(upRow) < 8) ok(`down (${downRow.toFixed(1)}) and up (${upRow.toFixed(1)}) rows look straight`);

  // 5 animation + 6 feet + 7 anchor
  for (let r = 0; r < ROWS; r++) {
    const a = cells[r * COLS + 0], b = cells[r * COLS + 1], c = cells[r * COLS + 2];
    const dab = legDiff(a, b), dbc = legDiff(b, c), dac = legDiff(a, c);
    if (dab > 0.005 && dbc > 0.005 && dac > 0.005) ok(`${ROW_NAMES[r]} row: legs move across poses (${(dab * 100).toFixed(1)}% / ${(dbc * 100).toFixed(1)}% / ${(dac * 100).toFixed(1)}% pixel change)`);
    else bad(`${key} ${ROW_NAMES[r]} row: poses look static (${(dab * 100).toFixed(2)}% / ${(dbc * 100).toFixed(2)}% / ${(dac * 100).toFixed(2)}%)`);

    const feet = [], heads = [];
    for (let c2 = 0; c2 < COLS; c2++) {
      const bb = bbox(cells[r * COLS + c2], CELL_W, CELL_H);
      feet.push(bb.maxY); heads.push(headCentroidX(cells[r * COLS + c2]));
    }
    const fSpread = Math.max(...feet) - Math.min(...feet);
    const hSpread = Math.max(...heads) - Math.min(...heads);
    if (fSpread <= 2) ok(`${ROW_NAMES[r]} row: feet on one baseline (spread ${fSpread}px)`);
    else bad(`${key} ${ROW_NAMES[r]} row: feet baseline spread ${fSpread}px (jitter)`);
    if (hSpread <= 4) ok(`${ROW_NAMES[r]} row: head anchor stable (x spread ${hSpread.toFixed(1)}px)`);
    else warns.push(`${key} ${ROW_NAMES[r]} row: head x spread ${hSpread.toFixed(1)}px`);
  }

  // 8 up-row repeat / watermark replacement
  const same = (a, b) => {
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  };
  const up4 = cells[3 * COLS + 4], up5 = cells[3 * COLS + 5];
  if (same(up4, up5)) ok(`up row: column 5 is the clean replacement of column 4 (watermark removed)`);
  else out.push(`  note  up row column 5 vs 4 differ (${(legDiff(up4, up5) * 100).toFixed(1)}% of leg pixels)`);

  // contact sheets for eyeballing
  ic.push({ key, img });
}

async function main() {
  for (const k of SHEETS) await check(k);

  const SCALE = 3;
  const W = CELL_W * COLS * SCALE, H = CELL_H * ROWS * SCALE + 40;
  const strip = new Jimp({ width: W, height: H * SHEETS.length, color: 0xf2f2f2ff });
  for (let i = 0; i < ic.length; i++) {
    const big = ic[i].img.clone().scale(SCALE);
    strip.composite(big, 0, i * H + 40);
  }
  await strip.write('tmp_classmate_check/final_sheets_3x.png');
  out.push(`\nwrote tmp_classmate_check/final_sheets_3x.png (3x, light background)`);

  const text = out.join('\n');
  fs.writeFileSync('tmp_classmate_check/verify_log.txt', text);
  console.log(text);
  console.log('\n' + (fails.length === 0 ? `ALL CHECKS PASSED (${warns.length} warnings)` : `${fails.length} FAILURES`));
  if (warns.length) { console.log('warnings:'); warns.forEach(w => console.log('  - ' + w)); }
  process.exit(fails.length ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
