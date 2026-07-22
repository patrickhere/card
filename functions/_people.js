// source of truth for card.hartforge.dev.
// mirrors the shape of keys/functions/_identities.js on purpose - the two sites
// are siblings and should stay readable as one system.
//
// everything in here is PUBLIC. no street address, no personal phone, and the
// email is the masked public one, never the pobox address.

export const people = {
  patrick: {
    handle: "patrick",
    name: "Patrick Hart",
    role: "systems + solutions engineering",
    org: "hart forge",
    tagline: "homelab-scale infrastructure, client-facing delivery",
    email: "resume@hartforge.com",

    // city + region only. recruiters filter hard on location and a card with
    // none reads as evasive; a street address on a crawlable page does not
    // belong here.
    locality: "Austin",
    region: "TX",
    country: "USA",

    // stable across every regeneration ON PURPOSE. contact apps key on UID, so
    // a fixed one means a second scan UPDATES the existing contact instead of
    // creating a duplicate - the exact thing that happens when someone scans at
    // a meetup and again months later. never regenerate this.
    uid: "urn:uuid:47951870-2cf2-46c5-bc8e-c92666ba3b3e",

    // bump when any field above changes. paired with UID this tells a client
    // which copy is newer; without it merge behaviour is undefined. NOT
    // generated per request - a REV that changes on every fetch would make
    // every download look like an edit.
    updated: "20260722T025000Z",

    // primary: what someone scanning this card actually came for.
    primary: [
      { label: "resume (pdf)", url: "https://hartforge.com/resume.pdf" },
      { label: "hire me", url: "https://hartforge.com/hire/" },
    ],

    // secondary: proof and provenance. kept visually quieter so the card does
    // not become a link dump - /links is the directory, this is a card.
    links: [
      { label: "hartforge.com", url: "https://hartforge.com" },
      { label: "github", url: "https://github.com/patrickhere", social: "GitHub" },
      { label: "linkedin", url: "https://www.linkedin.com/in/patrick--hart/", social: "LinkedIn" },
      { label: "keys", url: "https://keys.hartforge.dev/patrick" },
      { label: "forgejo", url: "https://git.hartforge.dev" },
    ],
  },
};

export function getPerson(handle) {
  return people[handle] || null;
}
