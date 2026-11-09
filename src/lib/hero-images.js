// Home hero photos (Jesse, 2026-11-09). The default photo is
// public/assets/home-hero.(jpg|webp|png); each hero variant can name its own
// photo in public/assets/hero/ (content/variants/pz-home-hero/*.md `image:`),
// and the program variant uses hero/program-<program id> with hero/program as
// the fallback. Photos are optional: whatever is present at build time is
// listed for the browser, and anything missing falls back to the default.
import fs from 'node:fs';
import path from 'node:path';
import { getCollection } from 'astro:content';

const EXTS = ['jpg', 'jpeg', 'webp', 'png'];
const ASSETS = path.join(process.cwd(), 'public', 'assets');

function find(dir, base) {
  const ext = EXTS.find((e) => fs.existsSync(path.join(dir, `${base}.${e}`)));
  return ext ? `${base}.${ext}` : null;
}

let cached;

/** { defaultUrl, images: { 'hero/admitted': '/assets/hero/admitted.jpg', ... } } */
export async function heroImages() {
  if (cached) return cached;
  const def = find(ASSETS, 'home-hero');
  const images = {};
  const dir = path.join(ASSETS, 'hero');
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir).sort()) {
      const m = f.match(/^([a-z0-9-]+)\.(jpg|jpeg|webp|png)$/);
      if (m && !images[`hero/${m[1]}`]) images[`hero/${m[1]}`] = `/assets/hero/${f}`;
    }
  }
  // Report what's still missing, so whoever adds the photos knows what's left.
  const programs = (await getCollection('programs')).map((p) => p.id);
  const variants = (await getCollection('variants')).filter((v) => v.data.zone === 'pz-home-hero');
  const expected = new Set(['home-hero']);
  for (const v of variants) {
    for (const key of [v.data.image, v.data.imageFallback].filter(Boolean)) {
      if (key.includes('[[programId]]')) programs.forEach((id) => expected.add(key.replace('[[programId]]', id)));
      else expected.add(key);
    }
  }
  const have = new Set([...(def ? ['home-hero'] : []), ...Object.keys(images)]);
  const missing = [...expected].filter((k) => !have.has(k));
  console.info(`[hero images] ${expected.size - missing.length} of ${expected.size} present${missing.length ? `; missing: ${missing.join(', ')}` : ''}`);
  cached = { defaultUrl: def ? `/assets/${def}` : null, images };
  return cached;
}
