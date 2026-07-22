// serves /<handle> (the card) and /<handle>.vcf (the contact file).
import { getPerson } from "./_people.js";
import { vcard, qrSvg } from "./_vcard.js";

const SPARK = `<svg class="spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0l2.1 9.9L24 12l-9.9 2.1L12 24l-2.1-9.9L0 12l9.9-2.1z" fill="#ff6a1f"/></svg>`;

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

export async function onRequestGet(context) {
  const { params, request } = context;
  const origin = new URL(request.url).origin;
  let handle = params.handle || "";

  let kind = "page";
  if (handle.endsWith(".vcf")) {
    kind = "vcf";
    handle = handle.slice(0, -4);
  }

  const person = getPerson(handle);
  if (!person) {
    // unknown handle - let pages try a static asset (favicon, css), else 404.
    return context.next();
  }

  if (kind === "vcf") {
    return new Response(vcard(person, origin), {
      headers: {
        // attachment, so a phone offers "add to contacts" instead of
        // rendering the raw text in a browser tab.
        "Content-Type": "text/vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="${person.handle}.vcf"`,
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const cardUrl = `${origin}/${person.handle}`;
  const links = person.links
    .map(
      (l) =>
        `<li><span class="arw">-&gt;</span><a href="${escapeHtml(l.url)}" rel="me noopener">${escapeHtml(l.label)}</a></li>`
    )
    .join("\n");

  const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(person.name)} - card</title>
<meta name="description" content="${escapeHtml(person.name)} - ${escapeHtml(person.role)}">
<meta name="theme-color" content="#0f1113">
<link rel="icon" href="/favicon.svg">
<link rel="stylesheet" href="/hartforge.css">
<style>
  /* one screen, no scroll. this page gets held up on a phone, so the qr and
     the add-to-contacts button are the only things that must never be below
     the fold. */
  .card { display: grid; gap: 1.25rem; justify-items: center; text-align: center; }
  .who { font-size: 1.5rem; font-weight: 600; letter-spacing: -0.01em; }
  .role { color: var(--muted, #8b909a); font-size: 0.95rem; }
  .qrwrap { background: #fff; padding: 10px; border-radius: 10px; line-height: 0; }
  .qr { width: min(46vw, 190px); height: auto; }
  .vcf {
    display: inline-block; padding: 0.6rem 1.1rem; border-radius: 8px;
    border: 1px solid #ff6a1f; color: #ff6a1f; text-decoration: none;
    font-weight: 600; font-size: 0.95rem;
  }
  .vcf:hover { background: #ff6a1f; color: #0f1113; }
  .rows { list-style: none; padding: 0; display: grid; gap: 0.4rem; }
  .arw { opacity: 0.5; margin-right: 0.5rem; }
</style>
</head><body><div class="page">
<div class="banner">
  <a class="brand" href="https://hartforge.dev">${SPARK}<span class="wordmark">hart forge</span></a>
  <span class="rev">card</span>
</div>

<div class="sec card">
  <div>
    <div class="who">${escapeHtml(person.name)}</div>
    <div class="role">${escapeHtml(person.role)}</div>
  </div>

  <div class="qrwrap">${qrSvg(cardUrl)}</div>

  <a class="vcf" href="/${escapeHtml(person.handle)}.vcf">add to contacts</a>

  <ul class="rows">${links}</ul>

  <p class="tagline">${escapeHtml(person.tagline)}</p>
</div>
</div></body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });
}
