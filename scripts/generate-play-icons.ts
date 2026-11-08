import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const ICONS_DIR = path.join(PUBLIC_DIR, 'icons');
const WELL_KNOWN_DIR = path.join(PUBLIC_DIR, '.well-known');

fs.mkdirSync(ICONS_DIR, { recursive: true });
fs.mkdirSync(WELL_KNOWN_DIR, { recursive: true });

// 1. Standalone / Any Icon SVG (Royal Purple background, Briefcase + Search Beam)
const regularSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7e22ce" />
      <stop offset="50%" stop-color="#581c87" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Outer Ring Pulse -->
  <circle cx="256" cy="256" r="210" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="4" stroke-dasharray="16 12" />
  
  <!-- Briefcase Body -->
  <g filter="url(#shadow)">
    <!-- Briefcase Handle -->
    <path d="M192 168 V140 C192 122 206 108 224 108 H288 C306 108 320 122 320 140 V168" fill="none" stroke="#c084fc" stroke-width="24" stroke-linecap="round" />
    
    <!-- Main Bag Body -->
    <rect x="96" y="168" width="320" height="236" rx="36" fill="url(#glassGrad)" stroke="#c084fc" stroke-width="8" />
    
    <!-- Bag Horizontal Strap -->
    <path d="M96 248 H416" stroke="rgba(255,255,255,0.18)" stroke-width="8" stroke-dasharray="8 8" />
    
    <!-- Gold / Emerald Badge Clasp -->
    <rect x="236" y="232" width="40" height="32" rx="8" fill="url(#accentGrad)" stroke="#ffffff" stroke-width="4" />
  </g>

  <!-- Search Loupe Overlay (Over lower right) -->
  <g filter="url(#shadow)">
    <!-- Glass circle -->
    <circle cx="340" cy="340" r="76" fill="#1e1b4b" stroke="#38bdf8" stroke-width="14" />
    <circle cx="340" cy="340" r="56" fill="rgba(56, 189, 248, 0.2)" />
    
    <!-- Checkmark inside glass for Match/Verification -->
    <path d="M316 340 L334 358 L368 324" fill="none" stroke="#34d399" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
    
    <!-- Handle -->
    <line x1="394" y1="394" x2="444" y2="444" stroke="#38bdf8" stroke-width="18" stroke-linecap="round" />
  </g>

  <!-- Top-left Sparkle Star -->
  <path d="M136 128 L142 144 L158 150 L142 156 L136 172 L130 156 L114 150 L130 144 Z" fill="#34d399" />
</svg>
`;

// 2. Maskable Icon SVG (Has a guaranteed 20% safe zone margin for squircle / circle Android clipping)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7e22ce" />
      <stop offset="50%" stop-color="#581c87" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
  </defs>

  <!-- Solid full background (NO corner radius for maskable) -->
  <rect width="512" height="512" fill="url(#bgMask)" />

  <!-- Center Content scaled down inside safe circle (within radius 180) -->
  <g transform="translate(64, 64) scale(0.75)">
    <!-- Briefcase Handle -->
    <path d="M192 168 V140 C192 122 206 108 224 108 H288 C306 108 320 122 320 140 V168" fill="none" stroke="#c084fc" stroke-width="26" stroke-linecap="round" />
    
    <!-- Main Bag Body -->
    <rect x="96" y="168" width="320" height="236" rx="36" fill="rgba(255,255,255,0.12)" stroke="#c084fc" stroke-width="12" />
    
    <!-- Clasp -->
    <rect x="236" y="232" width="40" height="32" rx="8" fill="url(#accentGrad)" stroke="#ffffff" stroke-width="4" />

    <!-- Search Loupe -->
    <circle cx="340" cy="340" r="76" fill="#1e1b4b" stroke="#38bdf8" stroke-width="14" />
    <path d="M316 340 L334 358 L368 324" fill="none" stroke="#34d399" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" />
    <line x1="394" y1="394" x2="444" y2="444" stroke="#38bdf8" stroke-width="20" stroke-linecap="round" />
  </g>
</svg>
`;

async function main() {
  console.log('Generating Google Play PWA Icons...');

  // Save SVG
  fs.writeFileSync(path.join(ICONS_DIR, 'icon.svg'), regularSvg.trim());
  fs.writeFileSync(path.join(ICONS_DIR, 'icon-maskable.svg'), maskableSvg.trim());

  // Generate 192x192 PNG
  await sharp(Buffer.from(regularSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(ICONS_DIR, 'icon-192.png'));
  console.log('Generated icon-192.png');

  // Generate 512x512 PNG
  await sharp(Buffer.from(regularSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(ICONS_DIR, 'icon-512.png'));
  console.log('Generated icon-512.png');

  // Generate 512x512 Maskable PNG
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(ICONS_DIR, 'icon-maskable-512.png'));
  console.log('Generated icon-maskable-512.png');

  // Generate 180x180 Apple Touch Icon PNG
  await sharp(Buffer.from(regularSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(ICONS_DIR, 'icon-180.png'));
  console.log('Generated icon-180.png');

  // Generate 32x32 Favicon PNG
  await sharp(Buffer.from(regularSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(ICONS_DIR, 'favicon-32.png'));
  console.log('Generated favicon-32.png');

  console.log('All icons generated successfully!');
}

main().catch(console.error);
