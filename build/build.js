#!/usr/bin/env node
/*
============================================================
Static site build

Reads the content modules, writes every page, sitemap.xml and
robots.txt. Run it with:  npm run build

Adding a tool takes three steps:
  1. register it in a js/ module with Tools.add({ ... })
  2. add an entry to build/content-tools.js
  3. run this script
============================================================
*/

import { writeFile, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { SITE } from "./site.js";
import { layout, adSlot, breadcrumbs, faqSchema, softwareSchema, abs, esc } from "./render.js";
import { TOOL_PAGES } from "./content-tools.js";
import { CURL_SECTIONS, CURL_FAQS, CURL_LANGUAGES } from "./content-curl.js";
import { ABOUT, CONTACT, PRIVACY, TERMS } from "./content-pages.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const CATEGORY_ORDER = ["cURL", "JSON", "Auth", "API", "Webhooks", "Utilities"];

const CATEGORY_BLURB = {
  "cURL": "Turn a request you already have into code you can run.",
  "JSON": "Read, check, compare and generate types from JSON payloads.",
  "Auth": "Tokens, encodings and headers — decoded without leaving the page.",
  "API": "Compose, inspect and understand HTTP requests and responses.",
  "Webhooks": "Inspect payloads, generate signatures and test your endpoint.",
  "Utilities": "The small lookups that interrupt everything else."
};


/*
------------------------------------------------------------
The flagship cURL page, plus one page per target language
------------------------------------------------------------
*/

const CURL_FLAGSHIP = {
  slug: "curl-to-code",
  toolId: "curl-to-code",
  category: "cURL",
  module: "js/curl.js",
  card: "cURL → Code Converter",
  blurb: "Convert a cURL command into runnable code in nine languages.",
  featured: true,
  title: "cURL to Code Converter — 9 Languages | curl2code",
  description:
    "Paste a cURL command and get working code in JavaScript, Python, Go, Java, PHP, C#, Ruby or Node.js. Handles headers, auth, JSON and uploads. Free.",
  prefill: true,
  h1: "cURL to code converter",
  intro:
    "Paste a cURL command and get the same request as runnable code in nine languages. Headers, query parameters, JSON and form bodies, basic and bearer auth and multipart uploads are all converted. Everything happens in your browser, so a command carrying a live token never leaves your machine.",
  sections: CURL_SECTIONS,
  faqs: CURL_FAQS
};


function languagePage(language) {

  return {
    slug: language.slug,
    toolId: "curl-to-code",
    preset: { lang: language.lang },
    prefill: true,
    category: "cURL",
    module: "js/curl.js",
    card: "cURL → " + language.name,
    blurb: language.blurb,
    title: language.title,
    description: language.description,
    h1: language.h1,
    intro: language.intro,
    sections: [
      {
        h2: "Running the generated " + language.name + " code",
        html: language.notes
      },
      {
        h2: "What gets converted",
        html: `
<p>
  The parser reads the method, URL and query string, every <code>-H</code> header,
  cookies and user agent, <code>-u</code> and <code>--oauth2-bearer</code>
  credentials, all the <code>-d</code> body variants including
  <code>--data-urlencode</code> and <code>--json</code>, <code>-G</code>, and
  multipart <code>-F</code> uploads. Flags that only affect the terminal, such as
  <code>-s</code> or <code>-v</code>, are ignored; flags with no code equivalent
  are reported above the output rather than dropped silently.
</p>
<p>
  The full option table, worked examples and answers to common problems are on the
  <a href="/tools/curl-to-code/">main converter page</a>, which offers every
  language in one place.
</p>`
      }
    ],
    otherLanguages: true
  };
}


const ALL_TOOL_PAGES = [
  CURL_FLAGSHIP,
  ...CURL_LANGUAGES.map(languagePage),
  ...TOOL_PAGES
];

/* the nine language pages all host the converter, so counting pages
   would overstate how many distinct tools the site actually has */
const TOOL_COUNT = new Set(ALL_TOOL_PAGES.map(page => page.toolId)).size;


/*
------------------------------------------------------------
Fragments
------------------------------------------------------------
*/

function toolPath(slug) {
  return "/tools/" + slug + "/";
}


function crumbNav(page) {

  return `      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="../../">Home</a>
        <span aria-hidden="true">/</span>
        <a href="../">Tools</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">${esc(page.card)}</span>
      </nav>`;
}


function toolApp(page) {

  return `      <div class="tool-app">

        <div class="grid">

          <section class="panel">
            <div class="panel-header">
              <h2 class="panel-title">Input</h2>
              <button id="exampleBtn" class="ghost" type="button" hidden>Load example</button>
            </div>
            <div id="input-fields"></div>
          </section>

          <section class="panel">
            <div class="panel-header">
              <h2 class="panel-title" id="output-label">Output</h2>
              <button id="copyBtn" class="ghost" type="button">Copy</button>
            </div>
            <div id="output"><div class="placeholder">Loading the tool…</div></div>
          </section>

        </div>

        <div class="actions">
          <button id="runBtn" class="primary" type="button">Run</button>
          <button id="copyBtn2" type="button">Copy output</button>
          <button id="clearBtn" type="button">Clear</button>
          <span class="actions-note">Runs in your browser. <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd> to run.</span>
        </div>

      </div>`;
}


function languageStrip(currentSlug) {

  const label = currentSlug === "curl-to-code" ? "Language guides:" : "Other languages:";

  const links = CURL_LANGUAGES.map(language => {

    const active = language.slug === currentSlug;

    return active
      ? `        <span class="chip chip-active" aria-current="page">${esc(language.name)}</span>`
      : `        <a class="chip" href="../${language.slug}/">${esc(language.name)}</a>`;
  }).join("\n");

  return `      <nav class="chips" aria-label="Target languages">
        <span class="chips-label">${label}</span>
${links}
      </nav>`;
}


function relatedBlock(page) {

  const related = ALL_TOOL_PAGES
    .filter(other => other.slug !== page.slug && other.category === page.category)
    .slice(0, 4);

  const fallback = ALL_TOOL_PAGES
    .filter(other => other.slug !== page.slug && !related.includes(other))
    .slice(0, Math.max(0, 4 - related.length));

  const items = [...related, ...fallback].map(other =>
    `        <li><a href="../${other.slug}/"><strong>${esc(other.card)}</strong><span>${esc(other.blurb)}</span></a></li>`
  ).join("\n");

  return `      <section class="related">
        <h2>Related tools</h2>
        <ul class="card-list">
${items}
        </ul>
        <p class="related-all"><a href="../">Browse all ${TOOL_COUNT} tools →</a></p>
      </section>`;
}


function faqBlock(faqs) {

  const items = faqs.map(faq => `          <div class="faq-item">
            <h3>${esc(faq.q)}</h3>
            <p>${faq.a}</p>
          </div>`).join("\n");

  return `        <section class="faq">
          <h2>Frequently asked questions</h2>
${items}
        </section>`;
}


/*
------------------------------------------------------------
Page builders
------------------------------------------------------------
*/

function buildToolPage(page) {

  const path = toolPath(page.slug);

  const modules = ["js/app.js", ...(page.extraModules || []), page.module];

  const sections = (page.sections || [])
    .map(section => `        <section>\n          <h2>${esc(section.h2)}</h2>${section.html}\n        </section>`)
    .join("\n\n");

  const config = { id: page.toolId };

  if (page.preset) config.preset = page.preset;
  if (page.prefill) config.prefill = true;

  const declaration = `<script>window.TOOL = ${JSON.stringify(config)};</script>`;

  const body = [
    `    <div class="wrap">`,
    "",
    crumbNav(page),
    "",
    `      <header class="page-head">
        <p class="eyebrow">${esc(page.category)}</p>
        <h1>${esc(page.h1)}</h1>
        <p class="lead">${page.intro}</p>
      </header>`,
    "",
    page.otherLanguages || page.slug === "curl-to-code" ? languageStrip(page.slug) + "\n" : "",
    toolApp(page),
    "",
    adSlot("below-tool"),
    "",
    `      <div class="prose">`,
    sections,
    page.faqs ? "\n" + faqBlock(page.faqs) : "",
    `      </div>`,
    "",
    relatedBlock(page),
    "",
    `    </div>`
  ].filter(Boolean).join("\n");

  const jsonLd = [
    softwareSchema({ h1: page.h1, path, description: page.description }),
    breadcrumbs([
      { label: "Home", path: "/" },
      { label: "Tools", path: "/tools/" },
      { label: page.card, path }
    ])
  ];

  if (page.faqs) jsonLd.push(faqSchema(page.faqs));

  return {
    path,
    file: join("tools", page.slug, "index.html"),
    html: layout({
      path,
      title: page.title,
      description: page.description,
      ogType: "website",
      jsonLd,
      bodyClass: "tool-page",
      body,
      inlineScript: declaration,
      scripts: modules
    })
  };
}


function buildToolsIndex() {

  const groups = CATEGORY_ORDER.map(category => {

    const tools = ALL_TOOL_PAGES.filter(page => page.category === category);

    if (!tools.length) return "";

    const items = tools.map(page => {

      const search = (page.card + " " + page.blurb + " " + page.h1).toLowerCase();

      return `          <li data-tool-card="${esc(search)}">
            <a href="${page.slug}/">
              <strong>${esc(page.card)}</strong>
              <span>${esc(page.blurb)}</span>
            </a>
          </li>`;
    }).join("\n");

    return `      <section class="tool-group" data-tool-group>
        <h2 id="${category.toLowerCase().replace(/[^a-z]/g, "")}">${esc(category)}</h2>
        <p class="group-blurb">${esc(CATEGORY_BLURB[category])}</p>
        <ul class="card-list">
${items}
        </ul>
      </section>`;
  }).filter(Boolean).join("\n\n");

  const body = `    <div class="wrap">

      <header class="page-head">
        <p class="eyebrow">Directory</p>
        <h1>All developer tools</h1>
        <p class="lead">
          ${TOOL_COUNT} free tools for working with HTTP APIs. Each one runs in your
          browser — no account, no upload, no limit. The cURL converter has a page
          per target language.
        </p>
      </header>

      <div class="filter-wrap">
        <label class="visually-hidden" for="toolFilter">Filter tools</label>
        <input id="toolFilter" type="search" placeholder="Filter tools — try “json” or “jwt”" autocomplete="off">
      </div>

      <p id="toolFilterEmpty" class="empty-note" hidden>No tools match that filter.</p>

${groups}

    </div>`;

  return {
    path: "/tools/",
    file: join("tools", "index.html"),
    html: layout({
      path: "/tools/",
      title: "All Developer Tools — cURL, JSON, JWT, HTTP | curl2code",
      description:
        "A directory of " + TOOL_COUNT + " free developer tools: cURL to code conversion, JSON formatting and type generation, JWT decoding, encoding helpers, webhook utilities and more.",
      jsonLd: [
        breadcrumbs([{ label: "Home", path: "/" }, { label: "Tools", path: "/tools/" }]),
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "curl2code developer tools",
          itemListElement: ALL_TOOL_PAGES.map((page, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: page.card,
            url: abs(toolPath(page.slug))
          }))
        }
      ],
      body
    })
  };
}


function buildHome() {

  const featured = [
    CURL_FLAGSHIP,
    ...["json-formatter", "jwt-decoder", "json-to-typescript", "uuid-generator", "base64-encoder-decoder"]
      .map(slug => ALL_TOOL_PAGES.find(page => page.slug === slug))
  ];

  const cards = featured.map(page =>
    `          <li${page.featured ? ' class="card-featured"' : ""}>
            <a href="tools/${page.slug}/">
              <strong>${esc(page.card)}</strong>
              <span>${esc(page.blurb)}</span>
            </a>
          </li>`
  ).join("\n");

  const body = `    <div class="wrap">

      <header class="hero">
        <h1>Free developer tools that run in your browser</h1>
        <p class="lead">
          curl2code converts a cURL command into working code in nine languages, and
          bundles the everyday API utilities — JSON formatting and type generation, JWT
          decoding, encoding helpers, webhook signatures — into one fast site.
          No accounts, no limits, and nothing you paste is ever uploaded.
        </p>
        <p class="hero-actions">
          <a class="btn btn-primary" href="tools/curl-to-code/">Open the cURL converter</a>
          <a class="btn" href="tools/">Browse all tools</a>
        </p>
      </header>

      <section class="home-section">
        <h2>Start here</h2>
        <ul class="card-list card-list-home">
${cards}
        </ul>
      </section>

      <section class="home-section">
        <h2>What problem this solves</h2>
        <div class="cols">
          <div>
            <h3>API docs show cURL. Your project is not cURL.</h3>
            <p>
              Every API's quickstart is a cURL command. Turning it into a request in your
              language means transcribing headers, guessing how the body should be encoded,
              and finding out later that authentication was attached the wrong way. The
              <a href="tools/curl-to-code/">converter</a> does the transcription and gets the
              details right — including the ones that only surface in production, like a
              missing timeout or an unchecked status code.
            </p>
          </div>
          <div>
            <h3>The small lookups add up.</h3>
            <p>
              Reading a JWT, checking what 422 means, formatting a payload someone pasted into
              a ticket, generating an id: individually trivial, collectively a steady drain of
              attention and browser tabs. These tools are all one page each, load instantly,
              and do the specific thing they claim to do.
            </p>
          </div>
          <div>
            <h3>Pasting a token into a website should not be a risk.</h3>
            <p>
              Most online converters send your input to a server. Here every tool is JavaScript
              running in your tab: the command, the token and the payload stay on your machine.
              You can verify it — open DevTools, watch the network panel, and convert a command.
              Nothing goes out.
            </p>
          </div>
        </div>
      </section>

      <section class="home-section">
        <h2>Built to stay out of the way</h2>
        <ul class="feature-list">
          <li><strong>No sign-up, no quota.</strong> Open a page and use it.</li>
          <li><strong>Nothing uploaded.</strong> Every tool is client-side, so production payloads are safe to paste.</li>
          <li><strong>Fast.</strong> No frameworks, no web fonts, no third-party scripts. Pages weigh a few kilobytes.</li>
          <li><strong>Works offline.</strong> Once a page has loaded, it keeps working with the network off.</li>
          <li><strong>Keyboard friendly.</strong> <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd> re-runs any tool.</li>
        </ul>
      </section>

      <section class="home-section">
        <h2>Everything on the site</h2>
        <p>
          There are ${TOOL_COUNT} tools, grouped by what they are for:
          <a href="tools/#curl">cURL conversion</a>, <a href="tools/#json">JSON</a>,
          <a href="tools/#auth">auth and encoding</a>, <a href="tools/#api">HTTP requests</a>,
          <a href="tools/#webhooks">webhooks</a> and <a href="tools/#utilities">general utilities</a>.
          New ones are added when they solve a problem worth solving — not to fill a directory.
        </p>
        <p><a class="btn" href="tools/">Browse all tools</a></p>
      </section>

    </div>`;

  return {
    path: "/",
    file: "index.html",
    html: layout({
      path: "/",
      title: "curl2code — Free Developer Tools for HTTP APIs",
      description: SITE.description,
      bodyClass: "home",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE.name,
          url: SITE.domain,
          description: SITE.description
        }
      ],
      body
    })
  };
}


function buildArticlePage(config) {

  const body = `    <div class="wrap wrap-narrow">

      <header class="page-head">
        <h1>${esc(config.h1)}</h1>
      </header>

      <div class="prose">
${config.content}
      </div>

    </div>`;

  return {
    path: config.path,
    file: join(config.path.replace(/^\/|\/$/g, ""), "index.html"),
    html: layout({
      path: config.path,
      title: config.title,
      description: config.description,
      jsonLd: [breadcrumbs([{ label: "Home", path: "/" }, { label: config.h1, path: config.path }])],
      body
    })
  };
}


function buildNotFound() {

  const body = `    <div class="wrap wrap-narrow">
      <header class="page-head">
        <h1>Page not found</h1>
        <p class="lead">That URL does not exist. It may have moved when the site was reorganised.</p>
      </header>
      <div class="prose">
        <p><a href="/tools/">Browse all tools</a> or go to the <a href="/">home page</a>.</p>
      </div>
    </div>`;

  return {
    path: "/404.html",
    file: "404.html",
    html: layout({
      path: "/404.html",
      title: "Page not found — curl2code",
      description: "That page does not exist on curl2code. Browse the full directory of free browser-based developer tools instead.",
      noindex: true,
      body
    })
  };
}


/*
------------------------------------------------------------
Build
------------------------------------------------------------
*/

const pages = [
  buildHome(),
  buildToolsIndex(),
  ...ALL_TOOL_PAGES.map(buildToolPage),
  buildArticlePage({
    path: "/about/",
    h1: "About curl2code",
    title: "About curl2code — Who Builds These Tools and Why",
    description:
      "curl2code is an independent, ad-light collection of browser-based developer tools for working with HTTP APIs. How it works and why it is free.",
    content: ABOUT
  }),
  buildArticlePage({
    path: "/contact/",
    h1: "Contact",
    title: "Contact — Report a Bug or Suggest a Tool | curl2code",
    description:
      "Get in touch about a conversion bug, a tool suggestion, or a privacy question. Email reaches the developer who maintains curl2code.",
    content: CONTACT
  }),
  buildArticlePage({
    path: "/privacy/",
    h1: "Privacy policy",
    title: "Privacy Policy | curl2code",
    description:
      "What curl2code does with your data: the tools run in your browser and your input is never transmitted. Hosting, analytics and cookies explained.",
    content: PRIVACY
  }),
  buildArticlePage({
    path: "/terms/",
    h1: "Terms of service",
    title: "Terms of Service | curl2code",
    description:
      "The terms covering use of curl2code's free developer tools, including permitted use, warranty disclaimer and limitation of liability.",
    content: TERMS
  }),
  buildNotFound()
];


function sitemap() {

  const priority = path =>
    path === "/" ? "1.0" :
    path === "/tools/curl-to-code/" ? "0.9" :
    path === "/tools/" ? "0.8" :
    path.startsWith("/tools/") ? "0.7" : "0.4";

  const today = new Date().toISOString().slice(0, 10);

  const urls = pages
    .filter(page => page.path !== "/404.html")
    .map(page => `  <url>
    <loc>${abs(page.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.path.startsWith("/tools") || page.path === "/" ? "weekly" : "yearly"}</changefreq>
    <priority>${priority(page.path)}</priority>
  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}


function robots() {

  return `# ${SITE.name}
User-agent: *
Allow: /

Sitemap: ${abs("/sitemap.xml")}
`;
}


async function build() {

  /* generated directories are rebuilt from scratch; js/ and assets/ are not touched */
  await rm(join(ROOT, "tools"), { recursive: true, force: true });

  for (const page of pages) {

    const target = join(ROOT, page.file);

    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, page.html, "utf8");
  }

  await writeFile(join(ROOT, "sitemap.xml"), sitemap(), "utf8");
  await writeFile(join(ROOT, "robots.txt"), robots(), "utf8");
  await writeFile(join(ROOT, "CNAME"), SITE.domain.replace(/^https?:\/\//, "") + "\n", "utf8");
  await writeFile(join(ROOT, ".nojekyll"), "", "utf8");

  console.log("Built " + pages.length + " pages, sitemap.xml and robots.txt.");
}

build();
