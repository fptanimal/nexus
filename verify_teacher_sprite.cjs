/**
 * verify_teacher_sprite.cjs
 * Checks src/assets/teacher_final.png the way the engine consumes it (6 cols x 4 rows,
 * row0 down, row1 left, row2 right, row3 up) and prints a PASS/FAIL report.
 *   node verify_teacher_sprite.cjs
 */
const { Jimp } = require('jimp');

const ROWS = ['down', 'left', 'right', 'up'];
const EXPECT = { down: 'front', left: 'LEFT', right: 'RIGHT', up: 'back' };
const BG = { r: 243, g: 209, b: 171 }; // original beige background

const isGrey = (r, g, b) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx - mn <= 38 && r >= 80 && r <= 175; };
const isBeige = (r, g, b) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return r >= 70 && r > g && g >= b && (r - b) >= 20 && (r - b) <= 90 && mx - mn <= 80; };

let fails = 0;
const check = (ok, msg) => { if (!ok) fails++; console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${msg}`); };

(async () => {
  const img = await Jimp.read('src/assets/teacher_final.png');
  const W = img.bitmap.width, H = img.bitmap.height, d = img.bitmap.data;
  const cw = W / 6, ch = H / 4;
  console.log(`teacher_final.png  ${W}x${H}   cell ${cw}x${ch}`);
  console.log(`engine draw size   ${32}x${((ch / cw) * 32).toFixed(1)} px per frame\n`);

  const cell = (r, c) => ({ x0: Math.round(c * cw), y0: Math.round(r * ch), w: Math.floor(cw), h: Math.floor(ch) });

  const stats = (r, c) => {
    const { x0, y0, w, h } = cell(r, c);
    let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1, n = 0, sumX = 0, sumY = 0;
    let skinX = 0, skinN = 0, darkX = 0, darkN = 0, grey = 0, beige = 0;
    // head strip = top 32% of the opaque content
    let top = -1, bottom = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = ((y0 + y) * W + (x0 + x)) * 4;
      if (d[i + 3] < 32) continue;
      if (top < 0) top = y;
      bottom = y;
    }
    const headLimit = top + Math.max(8, Math.round((bottom - top + 1) * 0.32));
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = ((y0 + y) * W + (x0 + x)) * 4;
      if (d[i + 3] < 32) continue;
      const r0 = d[i], g0 = d[i + 1], b0 = d[i + 2];
      n++; sumX += x; sumY += y;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (isGrey(r0, g0, b0)) grey++;
      if (isBeige(r0, g0, b0)) beige++;
      if (y <= headLimit) {
        const skin = r0 > 175 && g0 > 120 && g0 < 225 && b0 < 190 && r0 > b0 + 35;
        const hair = r0 < 95 && g0 < 95 && b0 < 115;
        if (skin) { skinX += x; skinN++; }
        else if (hair) { darkX += x; darkN++; }
      }
    }
    return { minX, minY, maxX, maxY, n, cx: sumX / n, cy: sumY / n, skinX, skinN, darkX, darkN, grey, beige, top, bottom };
  };

  // pixel-level difference restricted to the leg region (bottom 25% of the body)
  const legDiff = (r, c1, c2) => {
    const a = cell(r, c1), b = cell(r, c2);
    const top = Math.min(a.y0, b.y0), h = a.h;
    let s = a.y0 + Math.round(h * 0.72);
    let sum = 0, n = 0;
    for (let y = 0; y < Math.round(h * 0.26); y++) for (let x = 0; x < a.w; x++) {
      const ia = ((s + y) * W + (a.x0 + x)) * 4;
      const ib = ((s + y) * W + (b.x0 + x)) * 4;
      const aa = d[ia + 3] > 32, ba = d[ib + 3] > 32;
      if (!aa && !ba) continue;
      n++;
      if (aa !== ba) { sum += 255; continue; }
      sum += (Math.abs(d[ia] - d[ib]) + Math.abs(d[ia + 1] - d[ib + 1]) + Math.abs(d[ia + 2] - d[ib + 2])) / 3;
    }
    return n ? sum / n : 0;
  };

  console.log('── 1. every frame is populated ──');
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 6; c++) {
      const s = stats(r, c);
      check(s.n > 800, `row ${ROWS[r]} col${c}: ${s.n} opaque px`);
    }
  }

  console.log('\n── 2. facing per row (face skin must be on the correct side of the hair) ──');
  for (let r = 0; r < 4; r++) {
    const offsets = [];
    for (let c = 0; c < 6; c++) {
      const s = stats(r, c);
      offsets.push((s.skinX / Math.max(1, s.skinN)) - (s.darkX / Math.max(1, s.darkN)));
    }
    const avg = offsets.reduce((a, b) => a + b, 0) / offsets.length;
    const label = EXPECT[ROWS[r]];
    let ok;
    if (label === 'RIGHT') ok = avg > 4;
    else if (label === 'LEFT') ok = avg < -4;
    else ok = Math.abs(avg) < 4;
    check(ok, `row ${ROWS[r]} expects ${label}: offsets [${offsets.map(o => o.toFixed(1)).join(', ')}] avg ${avg.toFixed(1)}`);
  }

  console.log('\n── 3. left row is the exact mirror of the right row ──');
  {
    let worst = 0;
    for (let c = 0; c < 6; c++) {
      const a = cell(1, c), b = cell(2, c);
      for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) {
        const ia = ((a.y0 + y) * W + (a.x0 + x)) * 4;
        const ib = ((b.y0 + y) * W + (b.x0 + (a.w - 1 - x))) * 4;
        const aa = d[ia + 3] > 32, ba = d[ib + 3] > 32;
        if (aa !== ba) worst++;
        else if (aa) worst += (Math.abs(d[ia] - d[ib]) + Math.abs(d[ia + 1] - d[ib + 1]) + Math.abs(d[ia + 2] - d[ib + 2])) / 255;
      }
    }
    check(worst < 40, `mirror mismatch score ${worst.toFixed(1)} (0 = perfect)`);
  }

  console.log('\n── 4. walk animation: 3 poses must actually differ in the legs ──');
  for (let r = 0; r < 4; r++) {
    const d01 = legDiff(r, 0, 1), d12 = legDiff(r, 1, 2), d02 = legDiff(r, 0, 2);
    const min = Math.min(d01, d12, d02);
    check(min > 3, `row ${ROWS[r]}: leg diff a-b=${d01.toFixed(1)} b-c=${d12.toFixed(1)} a-c=${d02.toFixed(1)}`);
  }

  console.log('\n── 4b. the 6 columns repeat the 3 poses (cols 3,4,5 == 0,1,2) ──');
  for (let r = 0; r < 4; r++) {
    let bad = 0;
    for (let c = 0; c < 3; c++) {
      const a = cell(r, c), b = cell(r, c + 3);
      for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) {
        const ia = ((a.y0 + y) * W + (a.x0 + x)) * 4;
        const ib = ((b.y0 + y) * W + (b.x0 + x)) * 4;
        if ((d[ia + 3] > 32) !== (d[ib + 3] > 32)) bad++;
      }
    }
    check(bad === 0, `row ${ROWS[r]}: column repeat mismatch ${bad} px`);
  }

  console.log('\n── 5. no jitter: consistent feet baseline + horizontal anchor per row ──');
  for (let r = 0; r < 4; r++) {
    const bottoms = [], centres = [], widths = [];
    for (let c = 0; c < 6; c++) {
      const s = stats(r, c);
      bottoms.push(s.maxY);
      centres.push((s.minX + s.maxX) / 2);
      widths.push(s.maxX - s.minX + 1);
    }
    const bSpread = Math.max(...bottoms) - Math.min(...bottoms);
    const cSpread = Math.max(...centres) - Math.min(...centres);
    check(bSpread <= 4, `row ${ROWS[r]}: feet baseline spread ${bSpread}px (y ${Math.min(...bottoms)}..${Math.max(...bottoms)})`);
    check(cSpread <= 4, `row ${ROWS[r]}: silhouette centre spread ${cSpread}px (widths ${Math.min(...widths)}..${Math.max(...widths)})`);
  }
  console.log('  (within-row silhouette drift is the walk itself; the anchor is fixed per row)');

  console.log('\n── 6. no leftover background / baked shadow ──');
  {
    // Palette of the real artwork (sampled from the source art).
    const ART = [[110, 191, 238], [29, 40, 46], [4, 4, 6], [225, 177, 71], [178, 147, 82], [240, 224, 200], [80, 64, 48]];
    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    let total = 0, halo = 0, exactBg = 0, grey = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (d[i + 3] < 32) continue;
      total++;
      const px = [d[i], d[i + 1], d[i + 2]];
      if (Math.abs(px[0] - BG.r) <= 6 && Math.abs(px[1] - BG.g) <= 6 && Math.abs(px[2] - BG.b) <= 6) exactBg++;
      if (isGrey(px[0], px[1], px[2])) grey++;
      const onEdge = (x > 0 && d[(y * W + x - 1) * 4 + 3] < 32) || (x < W - 1 && d[(y * W + x + 1) * 4 + 3] < 32) ||
                     (y > 0 && d[((y - 1) * W + x) * 4 + 3] < 32) || (y < H - 1 && d[((y + 1) * W + x) * 4 + 3] < 32);
      if (!onEdge) continue;
      const dToBg = dist(px, [BG.r, BG.g, BG.b]);
      let dToArt = 1e9;
      for (const a of ART) dToArt = Math.min(dToArt, dist(px, a));
      if (dToBg < dToArt) halo++;
    }
    // The player-visible defect is a beige rim AROUND the sprite, so the strict check is
    // on the silhouette boundary.  Enclosed pixels merely close to the background colour
    // are reported for information (the artwork itself has cream highlights there).
    check(halo === 0, `silhouette-edge pixels closer to the beige background than to any art colour (halo): ${halo} of ${total}`);
    console.log(`  info  enclosed background-coloured pixels (art highlights): ${exactBg}`);
    check(grey / total < 0.02, `grey-ish pixels: ${grey} of ${total} (${(100 * grey / total).toFixed(2)}%)`);
  }

  console.log('\n── 7. sprite scale matches the other characters ──');
  {
    const s = stats(0, 0);
    const charH = s.maxY - s.minY + 1;
    const onScreen = charH / cw * 32;
    check(onScreen > 35 && onScreen < 48, `character ${charH}px in a ${cw}px cell -> ${onScreen.toFixed(1)}px tall in game (father ~41px)`);
  }

  console.log(`\n${fails === 0 ? 'ALL CHECKS PASSED' : fails + ' CHECK(S) FAILED'}`);
  process.exit(fails === 0 ? 0 : 1);
})();
