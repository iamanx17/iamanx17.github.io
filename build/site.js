/*
Site-wide constants. Change the domain here and every canonical
URL, Open Graph tag and sitemap entry follows.
*/

export const SITE = {
  name: "curl2code",
  domain: "https://curl2code.xyz",
  tagline: "Free developer tools that run in your browser",
  description:
    "Free browser-based developer tools: convert cURL to code in nine languages, format JSON, decode JWTs, generate UUIDs. Nothing you paste is uploaded.",
  locale: "en",
  contactEmail: "hello@curl2code.xyz",
  /* used in legal pages */
  effectiveDate: "8 September 2026"
};

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/tools/", label: "Tools" },
  { href: "/tools/curl-to-code/", label: "cURL → Code" },
  { href: "/about/", label: "About" }
];

export const FOOTER_LINKS = [
  { href: "/tools/", label: "All tools" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
  { href: "/privacy/", label: "Privacy" },
  { href: "/terms/", label: "Terms" }
];
