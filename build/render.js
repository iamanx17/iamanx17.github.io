import { SITE, NAV, FOOTER_LINKS } from "./site.js";

/*
============================================================
HTML rendering

One layout function builds every page so head tags, navigation
and structured data can never drift between pages.
============================================================
*/

const YEAR = new Date().getFullYear();


export function abs(path) {
  return SITE.domain + path;
}


function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


function depth(path) {

  /* strip a trailing filename — /404.html lives at the root, not below it */
  const directories = path.replace(/[^/]*$/, "");
  const segments = directories.split("/").filter(Boolean).length;

  return segments === 0 ? "" : "../".repeat(segments);
}


function head(page) {

  const canonical = abs(page.path);
  const root = depth(page.path);

  const tags = [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="theme-color" content="#0b0d12">',
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}">`,
    `<link rel="canonical" href="${canonical}">`,
    "",
    `<meta property="og:type" content="${page.ogType || "website"}">`,
    `<meta property="og:site_name" content="${SITE.name}">`,
    `<meta property="og:title" content="${esc(page.ogTitle || page.title)}">`,
    `<meta property="og:description" content="${esc(page.description)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${abs("/assets/img/og.png")}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${esc(page.ogTitle || page.title)}">`,
    `<meta name="twitter:description" content="${esc(page.description)}">`,
    `<meta name="twitter:image" content="${abs("/assets/img/og.png")}">`,
    "",
    `<link rel="stylesheet" href="${root}assets/css/site.css">`,
    `<link rel="icon" href="${root}assets/img/favicon.svg" type="image/svg+xml">`,
    `<link rel="apple-touch-icon" href="${root}assets/img/icon-180.png">`
  ];

  if (page.noindex) tags.push('<meta name="robots" content="noindex, follow">');

  for (const block of page.jsonLd || []) {
    tags.push(`<script type="application/ld+json">${JSON.stringify(block)}</script>`);
  }

  tags.push(`<script src="${root}js/analytics.js"></script>`);

  return tags.map(tag => (tag ? "  " + tag : "")).join("\n");
}


function header(page) {

  const root = depth(page.path);

  const links = NAV.map(item => {

    const active = item.href === page.path ||
      (item.href !== "/" && page.path.startsWith(item.href));

    return `        <a href="${root}${item.href.slice(1)}"${active ? ' aria-current="page"' : ""}>${esc(item.label)}</a>`;
  }).join("\n");

  return `  <a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header">
    <div class="wrap">

      <a class="brand" href="${root || "/"}">
        <span class="brand-mark">c2</span>
        <span class="brand-name">curl<span>2code</span></span>
      </a>

      <button id="navToggle" class="nav-toggle" aria-expanded="false" aria-controls="siteNav" aria-label="Toggle navigation">
        <span></span><span></span><span></span>
      </button>

      <nav id="siteNav" class="site-nav" aria-label="Main">
${links}
      </nav>

    </div>
  </header>`;
}


function footer(page) {

  const root = depth(page.path);

  const links = FOOTER_LINKS
    .map(item => `        <a href="${root}${item.href.slice(1)}">${esc(item.label)}</a>`)
    .join("\n");

  return `  <footer class="site-footer">
    <div class="wrap">

      <nav class="footer-links" aria-label="Footer">
${links}
      </nav>

      <p class="footer-note">
        Every tool on ${SITE.name} runs entirely in your browser. Commands, tokens and
        payloads you paste are never uploaded to a server.
      </p>

      <p class="footer-copy">&copy; ${YEAR} ${SITE.name}</p>

    </div>
  </footer>`;
}


/*
Ad placement is prepared but switched off. The container is
hidden by CSS until `.ad-slot` is given content, so an empty
slot can never push the tool down the page or cause layout shift.
*/
export function adSlot(name) {
  return `      <!-- ad slot: ${name} — see README before enabling -->
      <aside class="ad-slot" data-slot="${name}" aria-hidden="true"></aside>`;
}


export function layout(page) {

  const root = depth(page.path);

  const scripts = (page.scripts || [])
    .map(src => `  <script src="${root}${src}"></script>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${SITE.locale}">
<head>
${head(page)}
</head>
<body${page.bodyClass ? ` class="${page.bodyClass}"` : ""}>

${header(page)}

  <main id="main">
${page.body}
  </main>

${footer(page)}

  <div id="toast" role="status" aria-live="polite"></div>

${page.inlineScript ? "  " + page.inlineScript + "\n" : ""}  <script src="${root}js/site.js"></script>
${scripts}
</body>
</html>
`;
}


export function breadcrumbs(trail) {

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: abs(item.path)
    }))
  };
}


export function faqSchema(faqs) {

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a.replace(/<[^>]+>/g, "") }
    }))
  };
}


export function softwareSchema(page) {

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: page.h1,
    url: abs(page.path),
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any browser",
    description: page.description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  };
}


export { esc, depth };
