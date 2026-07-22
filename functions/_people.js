// source of truth for card.hartforge.dev.
// mirrors the shape of keys/functions/_identities.js on purpose - the two sites
// are siblings and should stay readable as one system.
//
// everything in here is PUBLIC. no personal address, no personal phone, and the
// email is the masked public one, never the pobox address.

export const people = {
  patrick: {
    handle: "patrick",
    name: "Patrick Hart",
    role: "systems + solutions engineering",
    org: "hart forge",
    tagline: "homelab-scale infrastructure, client-facing delivery",
    email: "resume@hartforge.com",
    links: [
      { label: "hartforge.com", url: "https://hartforge.com" },
      { label: "keys", url: "https://keys.hartforge.dev/patrick" },
      { label: "forgejo", url: "https://git.hartforge.dev" },
      { label: "github", url: "https://github.com/patrickhere" },
      { label: "linkedin", url: "https://www.linkedin.com/in/patrick--hart/" },
    ],
  },
};

export function getPerson(handle) {
  return people[handle] || null;
}
