/**
 * Generate PWA icon PNGs for Smart Fishing app.
 * Uses pure Node.js with zlib - no external dependencies needed.
 *
 * Run: node public/icons/generate-icons.mjs
 */
import { writeFileSync } from 'fs';
import { deflateSync } from 'zlib';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function createPNG(width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeAndData = Buffer.concat([Buffer.from(type), data]);
    const crc = crc32(typeAndData);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc >>> 0);
    return Buffer.concat([len, typeAndData, crcBuf]);
  }

  // CRC32
  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // IDAT - raw pixels with filter bytes
  const rawLen = height * (1 + width * 4);
  const raw = Buffer.alloc(rawLen);
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = y * (1 + width * 4) + 1 + x * 4;
      raw[dstIdx] = pixels[srcIdx];
      raw[dstIdx + 1] = pixels[srcIdx + 1];
      raw[dstIdx + 2] = pixels[srcIdx + 2];
      raw[dstIdx + 3] = pixels[srcIdx + 3];
    }
  }
  const compressed = deflateSync(raw, { level: 9 });

  // IEND
  const iend = Buffer.alloc(0);

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', iend),
  ]);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function generateIcon(size) {
  const pixels = new Uint8Array(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.46875;
  const cornerRadius = size * 0.12; // For maskable icon safe zone

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > radius + 1) {
        // Outside - transparent
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
        continue;
      }

      // Anti-aliased edge
      let alpha = 1.0;
      if (dist > radius - 1) {
        alpha = Math.max(0, radius + 1 - dist) / 2;
      }

      // Background gradient: #1e40af (30,64,175) to #3b82f6 (59,130,246)
      const t = (x + y) / (2 * size);
      let r = Math.round(lerp(30, 59, t));
      let g = Math.round(lerp(64, 130, t));
      let b = Math.round(lerp(175, 246, t));

      // === Wave patterns at bottom ===
      const waveBase1 = 0.60 * size;
      const waveAmp1 = 0.025 * size;
      const waveY1 = waveBase1 + waveAmp1 * Math.sin((x / size) * 4 * Math.PI);
      if (y > waveY1) {
        r = Math.round(r * 0.85);
        g = Math.round(g * 0.88);
        b = Math.min(255, Math.round(b * 1.02));
      }

      const waveBase2 = 0.68 * size;
      const waveAmp2 = 0.02 * size;
      const waveY2 = waveBase2 + waveAmp2 * Math.sin((x / size) * 3.5 * Math.PI + 1);
      if (y > waveY2) {
        r = Math.round(r * 0.9);
        g = Math.round(g * 0.92);
        b = Math.min(255, Math.round(b * 1.01));
      }

      // === Fish body (white ellipse) ===
      const fishCx = 0.53 * size;
      const fishCy = 0.42 * size;
      const fishRx = 0.20 * size;
      const fishRy = 0.10 * size;
      const ex = (x - fishCx) / fishRx;
      const ey = (y - fishCy) / fishRy;
      const fishDist = ex * ex + ey * ey;

      if (fishDist <= 1.0) {
        const fishAlpha = fishDist > 0.92 ? Math.max(0, (1.0 - fishDist) / 0.08) : 1.0;
        r = Math.round(lerp(r, 248, fishAlpha));
        g = Math.round(lerp(g, 250, fishAlpha));
        b = Math.round(lerp(b, 252, fishAlpha));
      }

      // === Fish tail (triangle pointing left) ===
      const tailTipX = 0.27 * size;
      const tailBaseX = 0.34 * size;
      const tailCy = 0.42 * size;
      const tailHalfH = 0.10 * size;

      if (x >= tailTipX && x <= tailBaseX) {
        const tx = (tailBaseX - x) / (tailBaseX - tailTipX);
        const halfH = tailHalfH * tx;
        if (Math.abs(y - tailCy) <= halfH) {
          const edgeDist = halfH - Math.abs(y - tailCy);
          const tailAlpha = edgeDist < 2 ? edgeDist / 2 : 1.0;
          r = Math.round(lerp(r, 248, tailAlpha));
          g = Math.round(lerp(g, 250, tailAlpha));
          b = Math.round(lerp(b, 252, tailAlpha));
        }
      }

      // === Fish dorsal fin (top) ===
      const finCx = 0.50 * size;
      const finBaseY = 0.33 * size;
      const finTopY = 0.24 * size;
      const finHalfW = 0.06 * size;

      if (y >= finTopY && y <= finBaseY && Math.abs(x - finCx) <= finHalfW) {
        const fy = (finBaseY - y) / (finBaseY - finTopY);
        const allowedHalfW = finHalfW * (1 - fy * 0.8);
        if (Math.abs(x - finCx) <= allowedHalfW) {
          r = Math.round(lerp(r, 147, 0.7));
          g = Math.round(lerp(g, 197, 0.7));
          b = Math.round(lerp(b, 253, 0.7));
        }
      }

      // === Fish eye ===
      const eyeCx = 0.64 * size;
      const eyeCy = 0.39 * size;
      const eyeR = 0.028 * size;
      const eyeDist = Math.sqrt((x - eyeCx) ** 2 + (y - eyeCy) ** 2);
      if (eyeDist <= eyeR) {
        r = 25; g = 50; b = 160;
        // Highlight
        const hlCx = 0.648 * size;
        const hlCy = 0.382 * size;
        const hlR = 0.010 * size;
        const hlDist = Math.sqrt((x - hlCx) ** 2 + (y - hlCy) ** 2);
        if (hlDist <= hlR) {
          r = 255; g = 255; b = 255;
        }
      }

      // === Fish mouth ===
      const mouthCx = 0.725 * size;
      const mouthCy = 0.43 * size;
      const mouthDist = Math.sqrt((x - mouthCx) ** 2 + (y - mouthCy) ** 2);
      const mouthR = 0.015 * size;
      if (mouthDist >= mouthR * 0.6 && mouthDist <= mouthR * 1.2 && x > mouthCx - mouthR * 0.3) {
        const angle = Math.atan2(y - mouthCy, x - mouthCx);
        if (angle > -0.8 && angle < 0.8) {
          r = Math.round(r * 0.6);
          g = Math.round(g * 0.6);
          b = Math.round(b * 0.7);
        }
      }

      // === Scale pattern (subtle curved lines on fish body) ===
      if (fishDist < 0.85 && fishDist > 0.15) {
        const scaleFreqX = 8;
        const scaleFreqY = 6;
        const sx = Math.sin((x / size) * scaleFreqX * Math.PI);
        const sy = Math.sin((y / size) * scaleFreqY * Math.PI);
        if (Math.abs(sx * sy) > 0.85) {
          r = Math.max(0, r - 8);
          g = Math.max(0, g - 8);
          b = Math.max(0, b - 5);
        }
      }

      // === Fishing line (dotted, coming from top) ===
      const lineX = 0.64 * size;
      const lineTopY = 0.10 * size;
      const lineBottomY = 0.28 * size;
      if (Math.abs(x - lineX) < 1.5 && y >= lineTopY && y <= lineBottomY) {
        const seg = Math.floor((y - lineTopY) / (size * 0.015));
        if (seg % 2 === 0) {
          r = 220; g = 225; b = 235;
        }
      }

      // === Fishing hook ===
      const hookCx = 0.64 * size;
      const hookCy = 0.30 * size;
      const hookR = 0.025 * size;
      const hookDist = Math.sqrt((x - hookCx) ** 2 + (y - hookCy) ** 2);
      if (hookDist >= hookR - 1.5 && hookDist <= hookR + 1.5) {
        const hookAngle = Math.atan2(y - hookCy, x - hookCx);
        if (hookAngle > 0 && hookAngle < Math.PI * 0.8) {
          r = 210; g = 215; b = 225;
        }
      }
      // Hook point
      const hookPointX = hookCx - hookR;
      const hookPointY = hookCy;
      if (Math.sqrt((x - hookPointX) ** 2 + (y - hookPointY) ** 2) < 2.5) {
        r = 210; g = 215; b = 225;
      }

      // === "SF" text at bottom ===
      const textY = 0.78 * size;
      const textH = 0.09 * size;
      const textCx2 = 0.5 * size;
      // Simple block-letter approximation for "S" and "F"
      if (y >= textY && y <= textY + textH) {
        const ty = (y - textY) / textH; // 0 to 1

        // Letter "S"
        const sLeft = textCx2 - 0.12 * size;
        const sRight = sLeft + 0.09 * size;
        const sMid = (sLeft + sRight) / 2;
        const thickness = Math.max(2, size * 0.012);

        if (x >= sLeft && x <= sRight) {
          let drawS = false;
          // Top bar
          if (ty < 0.18) drawS = true;
          // Left upper
          if (ty >= 0.0 && ty < 0.5 && x < sLeft + thickness) drawS = true;
          // Middle bar
          if (ty >= 0.42 && ty < 0.58) drawS = true;
          // Right lower
          if (ty >= 0.5 && ty < 1.0 && x > sRight - thickness) drawS = true;
          // Bottom bar
          if (ty > 0.82) drawS = true;

          if (drawS) {
            r = Math.min(255, r + Math.round((255 - r) * 0.85));
            g = Math.min(255, g + Math.round((255 - g) * 0.85));
            b = Math.min(255, b + Math.round((255 - b) * 0.85));
          }
        }

        // Letter "F"
        const fLeft = textCx2 + 0.03 * size;
        const fRight = fLeft + 0.09 * size;

        if (x >= fLeft && x <= fRight) {
          let drawF = false;
          // Top bar
          if (ty < 0.18) drawF = true;
          // Left vertical
          if (x < fLeft + thickness) drawF = true;
          // Middle bar
          if (ty >= 0.42 && ty < 0.58 && x < fRight - thickness * 1.5) drawF = true;

          if (drawF) {
            r = Math.min(255, r + Math.round((255 - r) * 0.85));
            g = Math.min(255, g + Math.round((255 - g) * 0.85));
            b = Math.min(255, b + Math.round((255 - b) * 0.85));
          }
        }
      }

      // Write pixel
      const a = Math.round(alpha * 255);
      pixels[idx] = r;
      pixels[idx + 1] = g;
      pixels[idx + 2] = b;
      pixels[idx + 3] = a;
    }
  }

  return pixels;
}

// Generate both icon sizes
for (const size of [192, 512]) {
  console.log(`Generating ${size}x${size} icon...`);
  const pixels = generateIcon(size);
  const png = createPNG(size, size, pixels);
  const outPath = join(__dirname, `icon-${size}x${size}.png`);
  writeFileSync(outPath, png);
  console.log(`  Written: ${outPath} (${png.length} bytes)`);
}

console.log('Done! Icons generated successfully.');
