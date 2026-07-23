// renders the social preview card (og:image) for each person, in the forge
// palette, via headless chrome. run it whenever _people.js changes:
//
//   node tools/gen-og.mjs
//
// output is public/og/<handle>.png, served statically by cloudflare pages at
// card.hartforge.dev/og/<handle>.png and pointed at by the og:image meta in
// [handle].js. committed to the repo (not generated in CI) so the deploy has no
// chrome dependency - the image only changes when the person's fields do.
//
// why a static PNG and not a dynamic worker-rendered image: imessage and the
// other link-preview scrapers want a plain PNG/JPEG at a stable url, and reject
// or mis-size SVG. a card's fields change about never, so paying for a
// rasterizer on every request would buy nothing.

import { people } from "../functions/_people.js";
import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const HERE = dirname(fileURLToPath(import.meta.url));
const OUTDIR = join(HERE, "..", "public", "og");
mkdirSync(OUTDIR, { recursive: true });

const esc = (s) =>
  String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

// the same forge spark the card banner and favicon use.
const SPARK =
  '<svg viewBox="0 0 24 24" width="52" height="52" aria-hidden="true">' +
  '<path d="M12 0l2.1 9.9L24 12l-9.9 2.1L12 24l-2.1-9.9L0 12l9.9-2.1z" fill="#ff6a1f"/></svg>';

// tokens lifted from the design system (hartforge.css :root). kept inline
// because this renders in a throwaway chrome tab with no stylesheet.
function template(p) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1200px;height:630px}
  body{background:#0f1113;color:#e7eaec;position:relative;
    font-family:"SF Mono",ui-monospace,"JetBrains Mono",Menlo,monospace;
    display:flex;flex-direction:column;padding:76px 88px}
  .brand{display:flex;align-items:center;gap:16px}
  .wm{font-size:30px;letter-spacing:.06em;color:#e7eaec}
  .mid{flex:1;display:flex;flex-direction:column;justify-content:center}
  h1{font-size:84px;font-weight:600;letter-spacing:-0.02em;line-height:1}
  .role{color:#a3a9ad;font-size:34px;margin-top:22px}
  .loc{color:#6b7075;font-size:26px;margin-top:14px}
  .foot{display:flex;justify-content:space-between;align-items:flex-end;gap:40px}
  .url{font-size:26px;color:#6b7075;white-space:nowrap}
  .url b{color:#ff6a1f;font-weight:600}
  .tag{color:#6d90ac;font-size:24px;max-width:560px;text-align:right;line-height:1.4}
  /* an ember baseline, the same accent rule the card page carries */
  .rule{position:absolute;left:0;right:0;bottom:0;height:6px;background:#ff6a1f}
  </style></head><body>
  <div class="brand">${SPARK}<span class="wm">hart forge</span></div>
  <div class="mid">
    <h1>${esc(p.name)}</h1>
    <div class="role">${esc(p.role)}</div>
    <div class="loc">${esc(p.locality)}, ${esc(p.region)}</div>
  </div>
  <div class="foot">
    <div class="url">card.hartforge.dev<b>/${esc(p.handle)}</b></div>
    <div class="tag">${esc(p.tagline)}</div>
  </div>
  <div class="rule"></div>
  </body></html>`;
}

for (const p of Object.values(people)) {
  const tmp = join(tmpdir(), `og-${p.handle}.html`);
  writeFileSync(tmp, template(p));
  const out = join(OUTDIR, `${p.handle}.png`);
  // scale-factor 2 -> a 1200x630 file for a crisp preview on retina. the
  // og:image:width/height in [handle].js must match these actual dimensions.
  execFileSync(
    CHROME,
    ["--headless", "--disable-gpu", "--force-device-scale-factor=1",
     "--hide-scrollbars", "--window-size=1200,630",
     `--screenshot=${out}`, `file://${tmp}`],
    { stdio: "ignore" }
  );
  console.log("rendered", out);
}
