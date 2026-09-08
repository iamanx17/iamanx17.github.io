# curl2code

Free, browser-based developer tools for working with HTTP APIs. 26 tools across 35 pages:
convert a cURL command into code in nine languages, format and compare JSON, decode a JWT,
test a regular expression, explain a cron schedule.

Every tool runs in the browser. Nothing you paste is uploaded — the one exception is the
webhook tester, whose whole purpose is to send a request.

## Running it

```sh
npm install
npm run dev      # http://localhost:3000
```

```sh
npm run build    # production build
npm run start    # serve it
npm run lint     # type-check
```

## Layout

```
app/                     routes — one file per page
  tools/[slug]/page.tsx  every tool page comes from here
components/
  ToolRunner.tsx         the only client component: form, output, copy, download
  Output.tsx             draws the blocks a tool returns
lib/
  tools/                 one file per tool: metadata, inputs, run(), page content
    types.ts             the Tool shape and the result helpers
    index.ts             the registry
  curl/                  the cURL parser and the nine code generators
  site.ts                name, URL, navigation
  seo.ts                 JSON-LD
```

## How a tool works

A tool is one object in `lib/tools/`. It carries its own metadata, its input fields, the
function that produces output, and the written content for its page:

```ts
export const myTool: Tool = {
  slug: "my-tool",
  name: "My Tool",
  category: "Utilities",
  summary: "One line for the card and the meta description.",
  title: "My Tool — … | curl2code",
  description: "The paragraph under the heading. Written for someone who has not used it.",
  inputs: [{ key: "input", label: "Text", type: "textarea" }],
  run: (values) => text(str(values, "input").toUpperCase()),
  docs: [{ heading: "How to use it", html: "<p>…</p>" }],
  faqs: [{ q: "…", a: "…" }],
};
```

Add it to the array in `lib/tools/index.ts` and the page, the directory listing, the sitemap
and the related-tools block all follow. There is no separate registration step.

`run()` returns data, never markup:

- `text(value, notes?)` — a block of code or plain output, with optional warnings
- `blocks([...], copy?)` — headings, tables, lists and code, plus what the copy button takes
- `empty(message)` — nothing to do yet, such as an empty input

`Output.tsx` decides how each block is drawn, so no tool escapes anything and React handles
it. Anything a tool throws is shown as an error message, which is why those messages are
written for a person: what went wrong and what to do about it.

Input types are `text`, `textarea`, `select` and `checkbox`. Set `manual: true` if the tool
should only run when asked — the webhook tester uses it, because it sends a real request.
Set `download` to a filename, or a function of the values, to get a download button.

## Analytics

Off unless `NEXT_PUBLIC_GA_ID` is set. Events carry the tool's slug and nothing else:
`tool_opened`, `copy_clicked`, `download_clicked`, `example_loaded`. No field contents are
ever sent — see `lib/analytics.ts`.

## Notes

- `NEXT_PUBLIC_SITE_URL` sets canonical URLs and the sitemap. It defaults to the production
  domain, so set it when running anywhere else.
- Pages are prerendered at build time, so the site is static in practice even though it is
  served by Node.
- The tool registry is imported by the client component, so tool page content ships in the
  page bundle. If that ever matters, move `docs` and `faqs` out of the tool objects into a
  map the page imports on its own — nothing else needs to change.
- If a chunk 404s locally, you rebuilt while `next start` was running. Restart it.
