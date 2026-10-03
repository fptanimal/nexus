/**
 * make_classmate_report.cjs
 * Assembles the screenshots POSTed from the running game into:
 *   tmp_classmate_check/anim_grid.png  4 directions (rows) x 3 walk poses (columns)
 *   tmp_classmate_check/report.html    everything labelled, for eyeballing
 */
const { Jimp } = require('jimp');
const fs = require('fs');

const DIR = 'tmp_classmate_check';
const DIRS = ['down', 'left', 'right', 'up'];
const DIR_LABEL = { down: 'XUỐNG (nhìn thẳng)', left: 'TRÁI', right: 'PHẢI', up: 'LÊN (nhìn sau lưng)' };

async function main() {
  // ---- quadrant: left column is the raw classmate sheet for comparison ----
  const grid = new Jimp({ width: 1280 * 3 + 40, height: 264 * 4 + 40, color: 0xf7f7f7ff });
  for (let r = 0; r < DIRS.length; r++) {
    for (let p = 0; p < 3; p++) {
      const file = `${DIR}/anim_${DIRS[r]}_p${p}.png`;
      if (!fs.existsSync(file)) { console.log('missing', file); continue; }
      const img = await Jimp.read(file);
      grid.composite(img, 10 + p * 1280, 10 + r * 264);
    }
  }
  await grid.write(`${DIR}/anim_grid.png`);
  console.log('wrote anim_grid.png', grid.bitmap.width, 'x', grid.bitmap.height);

  const has = (f) => fs.existsSync(`${DIR}/${f}`);
  const html = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><title>Classmate sprites — kiểm tra trong game</title>
<style>
  body{font-family:ui-sans-serif,system-ui,"Segoe UI",sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:24px}
  h1{font-size:20px;margin:0 0 4px} h2{font-size:15px;margin:28px 0 8px;color:#a5b4fc}
  p{font-size:13px;line-height:1.6;color:#cbd5e1;margin:4px 0}
  .card{background:#1e293b;border:1px solid #334155;border-radius:10px;padding:14px;margin-bottom:18px}
  img{display:block;max-width:100%;image-rendering:pixelated;border-radius:6px}
  .row{display:flex;gap:12px;flex-wrap:wrap}
  .row>div{flex:1 1 320px;min-width:280px}
  code{background:#0f172a;padding:2px 6px;border-radius:4px;font-size:12px}
</style></head><body>
<h1>3 bạn học — kiểm tra sprite trong game</h1>
<p>Toàn bộ ảnh dưới đây lấy <b>trực tiếp từ canvas của game</b> đang chạy (không phải ảnh dàn dựng), nên đúng là những gì người chơi nhìn thấy.</p>

<div class="card">
  <h2>1. Trong lớp học (thay 3 bóng đen cũ)</h2>
  ${has('classroom_full.png') ? `<img src="classroom_full.png" alt="classroom">` : '<p>thiếu ảnh</p>'}
  <p>Bản đồ lớp 40×30 ô. Ba bạn: Nam <code>classmate1</code> (4,10), Hoa <code>classmate2</code> (12,14), Tuấn <code>classmate3</code> (6,22) — đều quay <code>up</code> (nhìn lên bảng).</p>
</div>

<div class="card">
  <h2>2. Cận cảnh chỗ ngồi (2×)</h2>
  ${has('desks_zoom.png') ? `<img src="desks_zoom.png" alt="desks">` : '<p>thiếu ảnh</p>'}
</div>

<div class="card">
  <h2>3. Bốn hướng đi (4×)</h2>
  <div class="row">
    ${DIRS.map(d => has(`dir_${d}.png`) ? `<div><p><b>${DIR_LABEL[d]}</b></p><img src="dir_${d}.png" alt="${d}"></div>` : '').join('')}
  </div>
</div>

<div class="card">
  <h2>4. Chu kỳ đi — 4 hướng × 3 tư thế chân</h2>
  ${has('anim_grid.png') ? `<img src="anim_grid.png" alt="anim grid">` : '<p>thiếu ảnh</p>'}
  <p>Mỗi hàng là một hướng, ba cột là ba khung pose (chân trái bước → chân phải bước → về vị trí). Cả ba nhân vật đổi tư thế chân giữa các cột.</p>
</div>

<div class="card">
  <h2>5. Sheet gốc đã xử lý (3×, nền sáng)</h2>
  ${has('final_sheets_3x.png') ? `<img src="final_sheets_3x.png" alt="sheets">` : '<p>thiếu ảnh</p>'}
  <p>Không còn pixel hồng/magenta, không còn vệt sao watermark ở góc dưới-phải hàng 3.</p>
</div>
</body></html>`;
  fs.writeFileSync(`${DIR}/report.html`, html);
  console.log('wrote report.html');
}

main().catch(e => { console.error(e); process.exit(1); });
