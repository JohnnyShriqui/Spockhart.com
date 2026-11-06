/**
 * Generates the favicon set from the mark geometry.
 * Run with: npm run icons
 */
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { upperPath, lowerPath } from '../src/lib/logo.ts';

const BRAND = '#1f4d6f';

// A tile in the logo blue with the white mark, as in the original logo.
const tile = (size, radius) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-160 -160 320 320">` +
  `<rect x="-160" y="-160" width="320" height="320" rx="${radius}" fill="${BRAND}"/>` +
  `<g fill="#fff" transform="scale(0.92)"><path d="${upperPath}"/><path d="${lowerPath}"/></g></svg>`;

writeFileSync('public/favicon.svg', tile(64, 64).replace(' width="64" height="64"', ''));
await sharp(Buffer.from(tile(32, 64))).png().toFile('public/favicon-32.png');
await sharp(Buffer.from(tile(180, 0))).png().toFile('public/apple-touch-icon.png');
await sharp(Buffer.from(tile(512, 0))).png().toFile('public/icon-512.png');
console.log('icons written');
