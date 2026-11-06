/**
 * Makes a self-contained copy of the built site in ./portable that works from
 * any folder or preview host: every root-relative link becomes a relative one,
 * and folder links point at their index.html.
 *
 * Run with: npm run portable
 */
import { cpSync, readFileSync, writeFileSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname, extname, sep } from 'node:path';

const SRC = 'dist';
const OUT = 'portable';
const SKIP = new Set(['CNAME', 'robots.txt', 'site.webmanifest', 'sitemap-index.xml', 'sitemap-0.xml']);

rmSync(OUT, { recursive: true, force: true });
cpSync(SRC, OUT, { recursive: true, filter: (p) => !SKIP.has(p.split(sep).pop()) });

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const files = walk(OUT);

const toRelative = (fileDir, target) => {
  const [pathAndQuery, hash = ''] = target.split('#');
  const [path, query = ''] = pathAndQuery.split('?');
  let resolved = path;
  if (!extname(path)) resolved = (path.endsWith('/') ? path : `${path}/`) + 'index.html';
  let rel = relative(fileDir, join(OUT, resolved)).split(sep).join('/');
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel + (query ? `?${query}` : '') + (hash ? `#${hash}` : '');
};

for (const file of files) {
  const dir = dirname(file);
  if (file.endsWith('.html')) {
    let html = readFileSync(file, 'utf8');
    html = html.replace(/<link rel="(manifest|sitemap)"[^>]*>/g, '');
    html = html.replace(/\b(href|src|action|data-href)="(\/(?!\/)[^"]*)"/g, (_, attr, url) => `${attr}="${toRelative(dir, url)}"`);
    html = html.replace(/url\((['"]?)(\/(?!\/)[^)'"]+)\1\)/g, (_, q, url) => `url(${q}${toRelative(dir, url)}${q})`);
    writeFileSync(file, html);
  } else if (file.endsWith('.css')) {
    let css = readFileSync(file, 'utf8');
    css = css.replace(/url\((['"]?)(\/(?!\/)[^)'"]+)\1\)/g, (_, q, url) => `url(${q}${toRelative(dir, url)}${q})`);
    writeFileSync(file, css);
  }
}

const list = walk(OUT)
  .map((p) => relative(OUT, p).split(sep).join('/'))
  .filter((p) => p !== 'index.html')
  .sort();
writeFileSync(join(OUT, '.files.json'), JSON.stringify(list, null, 2));
console.log(`portable: ${list.length + 1} files in ./${OUT}`);
