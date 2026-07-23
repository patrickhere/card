# card

digital business cards for hartforge.dev. sibling to `keys` - same cloudflare
pages + functions pattern, same design system, same `/<handle>` shape, so the
two read as one system rather than two one-offs.

status: **live** at card.hartforge.dev. deploys on push via forgejo mirror ->
github -> pages action. editing `functions/_people.js` and pushing is the whole
workflow (re-run `node tools/gen-og.mjs` too when a rendered field changes).

## routes

| route | serves |
|---|---|
| `/` | index of cards |
| `/patrick` | the card - one screen, qr, add-to-contacts |
| `/patrick.vcf` | vcard 3.0, `Content-Disposition: attachment` |
| `/og/patrick.png` | the social-preview image (static, from `tools/gen-og.mjs`) |

## link previews (imessage, slack, etc)

`[handle].js` emits open graph + twitter-card meta so a shared link renders as a
rich card instead of bare text. the piece that matters is `og:image`: without
it, imessage shows nothing.

that image is a **static PNG per person**, `public/og/<handle>.png`, rendered by
`tools/gen-og.mjs` (headless chrome, forge palette, 2400x1260). it is committed,
not built in CI, so the deploy needs no chrome and the image only changes when
the person's fields do. regenerate after editing `_people.js`:

```sh
node tools/gen-og.mjs
```

static and not a worker-rendered image on purpose: preview scrapers want a plain
PNG at a stable url and mis-handle SVG, and a card's fields change ~never, so a
per-request rasterizer would buy nothing. the `og:image:width/height` in
`[handle].js` must match what the script renders (2x -> 2400x1260).

## decisions worth keeping

**this did not replace `/links` on hartforge.com.** that page is a web index and
does its job. a card is a different object: it gets held up on a phone, scanned
once, and succeeds by landing in someone's contacts. different layout, different
payload, different success condition. `/links` should link here.

**vcard 3.0, not 4.0.** 3.0 imports cleanly on both ios contacts and android;
4.0 still trips some readers. crlf line endings and rfc 6350 folding at 75
octets, which the long linkedin url would otherwise breach.

**the qr encodes the card url, not the vcard body.** a whole vcard pushes the qr
to a high version with dense modules that phone cameras struggle with in poor
light. a short url stays low-version and survives being printed small. the url
then offers the .vcf, so the contact still lands in one extra tap.

**the qr encoder is vendored (`qrcode-generator`), not hand-rolled.** qr has a
fiddly spec - masking, error correction, version sizing - and writing one by
diffing against a reference until it happens to scan is the exact trap to skip.

**everything in `_people.js` is public.** masked contact email only, no personal
address or phone. never the pobox address.

## local

```sh
npx wrangler pages dev --port 8797
```

## deploy (needs approval)

```sh
npx wrangler pages deploy public --project-name card
```

then add the proxied cname for `card.hartforge.dev` -> `card-*.pages.dev` and
the pages custom domain. same-zone custom domains are not auto-created by the
api, and hammering the dns api while it propagates trips a throttle - set it
once and wait.
