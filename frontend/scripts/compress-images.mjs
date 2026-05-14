// 原地压缩图片到 <= 800KB，保持文件名与扩展名不变
// 运行: node scripts/compress-images.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const MAX_BYTES = 800 * 1024; // 800KB
const TARGETS = [
  path.resolve('public/images'),
  path.resolve('vibe_images'),
];

const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

// 质量阶梯（从高到低），以及对应的最长边限制（不缩放 / 1920 / 1600 / 1280 / 1024）
const QUALITY_STEPS = [90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40];
const SIZE_STEPS = [null, 1920, 1600, 1280, 1024];

async function statSize(p) {
  const s = await fs.stat(p);
  return s.size;
}

async function compressOne(file) {
  const ext = path.extname(file).toLowerCase();
  if (!IMG_EXT.has(ext)) return { file, skipped: true };

  const origSize = await statSize(file);
  if (origSize <= MAX_BYTES) return { file, origSize, finalSize: origSize, unchanged: true };

  const inputBuffer = await fs.readFile(file);
  const meta = await sharp(inputBuffer).metadata();
  const longest = Math.max(meta.width || 0, meta.height || 0);

  let best = null;

  outer: for (const maxSide of SIZE_STEPS) {
    for (const q of QUALITY_STEPS) {
      let pipe = sharp(inputBuffer, { failOn: 'none' }).rotate();
      if (maxSide && longest > maxSide) {
        pipe = pipe.resize({
          width: meta.width >= meta.height ? maxSide : null,
          height: meta.height > meta.width ? maxSide : null,
          withoutEnlargement: true,
        });
      }
      if (ext === '.png') {
        // PNG 以无损重新压缩优先，再用有损 palette 降级
        if (q >= 80) {
          pipe = pipe.png({ compressionLevel: 9, palette: false });
        } else {
          pipe = pipe.png({ compressionLevel: 9, palette: true, quality: q, effort: 10 });
        }
      } else if (ext === '.webp') {
        pipe = pipe.webp({ quality: q });
      } else {
        pipe = pipe.jpeg({ quality: q, mozjpeg: true, progressive: true });
      }
      const out = await pipe.toBuffer();
      if (out.length <= MAX_BYTES) {
        best = { buf: out, q, maxSide };
        break outer;
      }
      // 跟踪到目前为止体积最小的，作为兜底
      if (!best || out.length < best.buf.length) best = { buf: out, q, maxSide };
    }
  }

  if (!best) return { file, origSize, failed: true };

  // 仅当压缩后体积确实更小才覆盖
  if (best.buf.length < origSize) {
    await fs.writeFile(file, best.buf);
  }
  const finalSize = (await fs.stat(file)).size;
  return { file, origSize, finalSize, q: best.q, maxSide: best.maxSide, ok: finalSize <= MAX_BYTES };
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

function fmt(b) { return (b / 1024).toFixed(1) + 'KB'; }

(async () => {
  const files = [];
  for (const root of TARGETS) {
    try {
      const list = await walk(root);
      files.push(...list);
    } catch (e) {
      console.warn('skip root:', root, e.message);
    }
  }
  const imgs = files.filter(f => IMG_EXT.has(path.extname(f).toLowerCase()));
  console.log(`扫描到 ${imgs.length} 个图片`);

  let changed = 0, stillOver = 0, totalSaved = 0;
  for (const f of imgs) {
    try {
      const r = await compressOne(f);
      if (r.unchanged) continue;
      if (r.failed) { console.log('FAIL', f); continue; }
      const saved = r.origSize - r.finalSize;
      totalSaved += saved;
      changed++;
      if (!r.ok) stillOver++;
      console.log(`${r.ok ? 'OK ' : 'OVR'} ${path.relative(process.cwd(), f)}  ${fmt(r.origSize)} -> ${fmt(r.finalSize)}  q=${r.q}${r.maxSide ? ' side=' + r.maxSide : ''}`);
    } catch (e) {
      console.log('ERR', f, e.message);
    }
  }
  console.log(`\n完成：处理 ${changed} 张，仍超标 ${stillOver} 张，总计节省 ${fmt(totalSaved)}`);
})();
