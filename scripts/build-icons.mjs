// Generates PWA + apple-touch-icon PNGs from a master SVG.
// Run via: node scripts/build-icons.mjs

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const MASTER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="sky" cx="50%" cy="55%" r="68%">
      <stop offset="0%" stop-color="#2a2358"/>
      <stop offset="60%" stop-color="#1a1538"/>
      <stop offset="100%" stop-color="#0c0a1f"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff5e1" stop-opacity="0.55"/>
      <stop offset="40%" stop-color="#d8c4ff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#221c46" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="starCore" cx="42%" cy="42%" r="55%">
      <stop offset="0%" stop-color="#fffaf0"/>
      <stop offset="50%" stop-color="#ffe9c4"/>
      <stop offset="100%" stop-color="#d8c4ff"/>
    </radialGradient>
  </defs>

  <!-- Sky -->
  <rect width="1024" height="1024" fill="url(#sky)"/>

  <!-- Background tiny stars -->
  <g fill="#fff5e1">
    <circle cx="160" cy="220" r="3" opacity="0.7"/>
    <circle cx="780" cy="180" r="2.5" opacity="0.55"/>
    <circle cx="220" cy="820" r="3.2" opacity="0.65"/>
    <circle cx="860" cy="780" r="2.6" opacity="0.55"/>
    <circle cx="900" cy="320" r="2" opacity="0.5"/>
    <circle cx="120" cy="520" r="2" opacity="0.5"/>
  </g>

  <!-- Center glow -->
  <circle cx="512" cy="512" r="320" fill="url(#glow)"/>

  <!-- Center star -->
  <g transform="translate(512 512)">
    <circle r="120" fill="url(#starCore)"/>
    <path
      d="M 0 -180
         L 22 -22
         L 180 0
         L 22 22
         L 0 180
         L -22 22
         L -180 0
         L -22 -22 Z"
      fill="#fffaf0"
      opacity="0.95"
    />
  </g>
</svg>
`;

const SIZES = [
  { name: "milky-192.png", size: 192 },
  { name: "milky-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
  // Maskable: same artwork; the master SVG already has comfortable padding.
  { name: "milky-maskable-512.png", size: 512 },
];

async function main() {
  const outDir = join(root, "public", "icons");
  await mkdir(outDir, { recursive: true });

  // Save the master SVG so users can inspect / edit
  await writeFile(join(outDir, "milky-master.svg"), MASTER_SVG.trim() + "\n", "utf8");

  for (const { name, size } of SIZES) {
    const out = join(outDir, name);
    const buf = await sharp(Buffer.from(MASTER_SVG), { density: 384 })
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toBuffer();
    await writeFile(out, buf);
    console.log(`  ${name}  (${size}x${size}, ${(buf.length / 1024).toFixed(1)} kB)`);
  }
}

main().catch((err) => {
  console.error("icon build failed:", err);
  process.exit(1);
});
