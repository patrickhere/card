// landing page at /. mirrors keys.hartforge.dev's index so the two read as a set.
import { people } from "./_people.js";

const SPARK = `<svg class="spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0l2.1 9.9L24 12l-9.9 2.1L12 24l-2.1-9.9L0 12l9.9-2.1z" fill="#ff6a1f"/></svg>`;

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

export function onRequestGet() {
  const rows = Object.values(people)
    .map(
      (p) =>
        `<li><span class="arw">-&gt;</span><a href="/${escapeHtml(p.handle)}">${escapeHtml(p.name)}</a><span class="desc">@${escapeHtml(p.handle)}</span></li>`
    )
    .join("\n");

  const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>card.hartforge.dev</title>
<meta name="description" content="digital business cards for hart forge">
<meta name="theme-color" content="#0f1113">
<link rel="icon" href="/favicon.svg">
<link rel="stylesheet" href="/hartforge.css">
<style>.rows{list-style:none;padding:0;display:grid;gap:.4rem}.arw{opacity:.5;margin-right:.5rem}.desc{opacity:.6;margin-left:.6rem;font-size:.9rem}</style>
</head><body><div class="page">
<div class="banner">
  <a class="brand" href="https://hartforge.dev">${SPARK}<span class="wordmark">hart forge</span></a>
  <span class="rev">card</span>
</div>
<p class="tagline">digital business cards &middot; every handle also serves /&lt;handle&gt;.vcf</p>

<div class="sec">
  <div class="lbl">cards</div>
  <ul class="rows">${rows}</ul>
</div>
</div></body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
