// vcard generation + qr rendering.
//
// the qr encoder is the vendored `qrcode-generator` package, not something
// hand-rolled here. qr is a solved problem with a fiddly spec (masking,
// error correction, version sizing) and writing one by diffing against a
// reference until it scans is exactly the trap to avoid.

import qrcode from "qrcode-generator";

// vcard 3.0, not 4.0. 3.0 is what ios contacts and android both import
// cleanly; 4.0 still trips some readers.
const CRLF = "\r\n";

// escape the vcard specials: backslash, comma, semicolon, newline.
function esc(v) {
  return String(v)
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\r?\n/g, "\\n");
}

// rfc 6350 line folding: 75 octets, continuation lines start with one space.
// long URL lines are the realistic trigger here.
function fold(line) {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out = [];
  let cur = "";
  let len = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (len + n > 74) {
      out.push(cur);
      cur = " " + ch;
      len = 1 + n;
    } else {
      cur += ch;
      len += n;
    }
  }
  out.push(cur);
  return out.join(CRLF);
}

export function vcard(person, origin) {
  const [given, ...rest] = person.name.split(" ");
  const family = rest.join(" ");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(family)};${esc(given)};;;`,
    `FN:${esc(person.name)}`,
    `ORG:${esc(person.org)}`,
    `TITLE:${esc(person.role)}`,
    `EMAIL;TYPE=INTERNET,PREF:${esc(person.email)}`,
    `URL:${esc(person.links[0].url)}`,
    ...person.links.slice(1).map((l) => `URL;TYPE=${esc(l.label)}:${esc(l.url)}`),
    `NOTE:${esc(person.tagline)}`,
    `SOURCE:${esc(origin)}/${esc(person.handle)}.vcf`,
    "END:VCARD",
  ];
  return lines.map(fold).join(CRLF) + CRLF;
}

/**
 * qr as inline svg, drawn as one path.
 *
 * it encodes the card URL rather than the vcard body: a whole vcard pushes the
 * qr to a high version with dense modules that phone cameras struggle with in
 * bad light, and a url survives being printed small. the url then offers the
 * .vcf, so the contact still lands in one extra tap.
 */
export function qrSvg(text, opts = {}) {
  const margin = opts.margin ?? 2;
  const q = qrcode(0, "M"); // version 0 = auto-size, medium error correction
  q.addData(text);
  q.make();

  const count = q.getModuleCount();
  const size = count + margin * 2;
  let d = "";
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (q.isDark(r, c)) d += `M${c + margin} ${r + margin}h1v1h-1z`;
    }
  }
  return `<svg class="qr" viewBox="0 0 ${size} ${size}" role="img" aria-label="qr code linking to this card" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><path d="${d}" fill="#0f1113"/></svg>`;
}
