/*
One entry per tool page. `sections` is the written content that
sits under the tool — kept short and specific on purpose. If a
tool does not warrant a paragraph, it does not warrant a page.
*/

export const TOOL_PAGES = [

  /* ---------------------------------------------------- JSON */

  {
    slug: "json-formatter",
    toolId: "json-formatter",
    category: "JSON",
    module: "js/json.js",
    card: "JSON Formatter",
    blurb: "Pretty-print or minify JSON, with optional key sorting.",
    title: "JSON Formatter and Beautifier — Free Online Tool | curl2code",
    description:
      "Format, indent, minify and sort JSON in your browser. Handles large payloads, never uploads your data, and reports exactly where invalid JSON breaks.",
    h1: "JSON formatter",
    intro:
      "Paste JSON and read it. Indent it for review, minify it for a request body, or sort keys so two payloads can be compared line by line.",
    sections: [
      {
        h2: "What it does",
        html: `
<p>
  API responses arrive on one line. This re-indents them with two or four spaces
  (or tabs), or collapses them back to the smallest valid form. Sorting keys is
  the option worth knowing about: two responses with the same data but different
  key order produce identical text once sorted, which turns a hopeless visual
  comparison into a one-line diff.
</p>`
      },
      {
        h2: "Notes",
        html: `
<ul class="doc-list">
  <li>Numbers are re-serialised by JavaScript, so an integer larger than 2^53 loses precision. Keep such ids as strings.</li>
  <li>Duplicate keys are not preserved — JSON.parse keeps the last one, which is also what most parsers do.</li>
  <li>Formatting happens on your machine; nothing is uploaded, so production payloads are safe to paste.</li>
  <li>For an explanation of <em>why</em> a document is rejected, use the <a href="/tools/json-validator/">JSON validator</a>.</li>
</ul>`
      }
    ]
  },

  {
    slug: "json-validator",
    toolId: "json-validator",
    category: "JSON",
    module: "js/json.js",
    card: "JSON Validator",
    blurb: "Check whether JSON is valid and see exactly where it breaks.",
    title: "JSON Validator — Find the Exact Syntax Error | curl2code",
    description:
      "Validate JSON and get the line, column and surrounding text of the first syntax error, plus a summary of the parsed document. Free and browser-based.",
    h1: "JSON validator",
    intro:
      "Paste JSON and find out whether it parses. When it does not, you get the line and column of the failure with the offending text in context, instead of a bare character offset.",
    sections: [
      {
        h2: "The four errors that cause most failures",
        html: `
<ul class="doc-list">
  <li><strong>Trailing comma.</strong> Valid in JavaScript, invalid in JSON. The last element of an array or object must not be followed by a comma.</li>
  <li><strong>Single quotes.</strong> JSON strings and keys require double quotes.</li>
  <li><strong>Unquoted keys.</strong> <code>{name: "x"}</code> is a JavaScript object literal, not JSON.</li>
  <li><strong>Something that is not JSON at all.</strong> An HTML error page or a stack trace returned by a proxy is a common cause when the response "suddenly stopped parsing".</li>
</ul>
<p>
  <code>NaN</code>, <code>Infinity</code>, comments and unescaped control characters
  inside strings are also rejected by the specification, even though some parsers
  accept them.
</p>`
      }
    ]
  },

  {
    slug: "json-diff",
    toolId: "json-diff",
    category: "JSON",
    module: "js/json.js",
    card: "JSON Diff",
    blurb: "Compare two JSON documents key by key.",
    title: "JSON Diff — Compare Two JSON Objects | curl2code",
    description:
      "Compare two JSON documents and see added, removed and changed keys with their full paths. Order-independent, runs in your browser, nothing uploaded.",
    h1: "JSON diff",
    intro:
      "Paste two JSON documents and see what changed: keys added, keys removed, and values that differ, each with the full path to reach them.",
    sections: [
      {
        h2: "Why not a text diff",
        html: `
<p>
  A line-based diff on JSON reports every key that moved, even when nothing about
  the data changed. This comparison walks the structure instead, so key order and
  whitespace are irrelevant and the output is limited to differences that matter.
  It is the fastest way to answer "what changed between the staging response and
  production" or "which field does the new API version drop".
</p>
<p>
  Arrays are compared by position, so an element inserted at the front will be
  reported as a change to every following index.
</p>`
      }
    ]
  },

  {
    slug: "json-to-typescript",
    toolId: "json-to-typescript",
    category: "JSON",
    module: "js/json.js",
    card: "JSON → TypeScript",
    blurb: "Generate TypeScript interfaces from a JSON sample.",
    title: "JSON to TypeScript — Generate Interfaces from JSON | curl2code",
    description:
      "Turn a JSON sample into TypeScript interfaces, with nested objects and array element types inferred. Free, instant and fully client-side.",
    h1: "JSON to TypeScript converter",
    intro:
      "Paste a JSON response and get TypeScript interfaces for it, including nested objects as named types and inferred element types for arrays.",
    sections: [
      {
        h2: "What the generator infers, and what it cannot",
        html: `
<p>
  Types are inferred from one sample, which is exact for the shape you paste and a
  guess about everything else. Two limits are worth knowing before you commit the
  output:
</p>
<ul class="doc-list">
  <li><strong>null tells you very little.</strong> A field that is <code>null</code> in your sample has no inferable type. Paste a sample where it is populated, or widen the type by hand.</li>
  <li><strong>Optional fields are invisible.</strong> A field missing from your sample cannot be discovered. Compare against the API documentation and mark optional fields with <code>?</code>.</li>
</ul>
<p>
  For runtime checking rather than compile-time types, generate a
  <a href="/tools/json-to-zod/">Zod schema</a> instead — it validates the payload
  and infers the TypeScript type from the same definition.
</p>`
      }
    ]
  },

  {
    slug: "json-to-zod",
    toolId: "json-to-zod",
    category: "JSON",
    module: "js/json.js",
    card: "JSON → Zod",
    blurb: "Generate a Zod schema from a JSON sample.",
    title: "JSON to Zod Schema Generator | curl2code",
    description:
      "Convert a JSON sample into a Zod schema for runtime validation, with nested objects and arrays handled. Free developer tool, runs in your browser.",
    h1: "JSON to Zod schema generator",
    intro:
      "Paste a JSON sample and get a Zod schema that validates it at runtime — useful for checking that an API response is actually shaped the way its documentation claims.",
    sections: [
      {
        h2: "Using the generated schema",
        html: `
<p>
  Zod gives you validation and types from one definition: <code>z.infer&lt;typeof
  Schema&gt;</code> produces the TypeScript type, so the two can never drift apart.
</p>
<ul class="doc-list">
  <li>Prefer <code>safeParse()</code> over <code>parse()</code> at an API boundary — it returns a result object instead of throwing.</li>
  <li>Zod objects strip unknown keys by default. Call <code>.passthrough()</code> if the API adds fields you want to keep.</li>
  <li>A <code>null</code> in the sample becomes <code>z.null()</code>; widen it to <code>z.string().nullable()</code> or similar once you know the real type.</li>
</ul>`
      }
    ]
  },

  {
    slug: "json-to-pydantic",
    toolId: "json-to-pydantic",
    category: "JSON",
    module: "js/json.js",
    card: "JSON → Pydantic",
    blurb: "Generate Pydantic v2 models from a JSON sample.",
    title: "JSON to Pydantic Model Generator (v2) | curl2code",
    description:
      "Convert a JSON sample into Pydantic v2 models with nested classes and typed fields. Free, instant, and runs entirely in your browser.",
    h1: "JSON to Pydantic model generator",
    intro:
      "Paste a JSON sample and get Pydantic v2 models, with nested objects turned into their own classes and field types inferred from the values.",
    sections: [
      {
        h2: "Notes for Pydantic v2",
        html: `
<ul class="doc-list">
  <li>Models are emitted in dependency order, so nested classes are defined before the model that uses them.</li>
  <li>Keys that are not valid Python identifiers, or that collide with keywords, need <code>Field(alias="…")</code> and <code>model_config = ConfigDict(populate_by_name=True)</code>.</li>
  <li>Validate with <code>Model.model_validate(payload)</code> — <code>parse_obj()</code> is the v1 spelling and is deprecated.</li>
  <li>A field that is <code>null</code> in the sample is typed <code>None</code>; change it to <code>str | None</code> once you know what it holds when populated.</li>
</ul>`
      }
    ]
  },

  /* ---------------------------------------------------- Auth */

  {
    slug: "jwt-decoder",
    toolId: "jwt-decoder",
    category: "Auth",
    module: "js/auth.js",
    card: "JWT Decoder",
    blurb: "Decode the header and payload of a JSON Web Token.",
    title: "JWT Decoder — Decode JSON Web Tokens Safely | curl2code",
    description:
      "Decode a JWT header and payload in your browser. The token is never uploaded, so you can safely inspect production tokens. Claims are shown in full.",
    h1: "JWT decoder",
    intro:
      "Paste a JSON Web Token to read its header and payload. Decoding happens in your browser — the token is never transmitted, which matters because a JWT is a live credential.",
    sections: [
      {
        h2: "What decoding does and does not prove",
        html: `
<p>
  A JWT is three Base64URL segments separated by dots: header, payload and
  signature. The first two are <strong>encoded, not encrypted</strong>. Anyone
  holding the token can read every claim in it, which is why a JWT must never
  carry a password, a card number or anything else you would not print in a log.
</p>
<p>
  Decoding tells you nothing about authenticity. Only verifying the signature with
  the issuer's key does that, and it cannot be done here without the key. Use this
  tool to read claims while debugging; verify in your application.
</p>`
      },
      {
        h2: "Claims worth checking first",
        html: `
<ul class="doc-list">
  <li><code>exp</code> — expiry, as a Unix timestamp in <em>seconds</em>. The most common cause of an unexpected 401. Check it with the <a href="/tools/jwt-expiry-checker/">JWT expiry checker</a>.</li>
  <li><code>iat</code> and <code>nbf</code> — issued-at and not-before. A clock skew of a few seconds between machines can make a fresh token invalid.</li>
  <li><code>iss</code> and <code>aud</code> — issuer and audience. A token minted for a different audience is a frequent cause of a valid-looking token being rejected.</li>
  <li><code>alg</code> in the header — if it says <code>none</code>, the token is unsigned and must be rejected.</li>
</ul>`
      }
    ]
  },

  {
    slug: "jwt-expiry-checker",
    toolId: "jwt-expiry",
    category: "Auth",
    module: "js/auth.js",
    card: "JWT Expiry Checker",
    blurb: "See whether a JWT is expired, not yet valid, or still good.",
    title: "JWT Expiry Checker — Is My Token Expired? | curl2code",
    description:
      "Check a JWT's exp, iat and nbf claims and see whether the token is still valid, how long it has left, or how long ago it expired. Free and client-side.",
    h1: "JWT expiry checker",
    intro:
      "Paste a token to see whether its time-based claims still hold, when it expires in your local time zone, and how long is left.",
    sections: [
      {
        h2: "Reading the result",
        html: `
<p>
  JWT timestamps are Unix seconds, not milliseconds — a ten-digit number. Passing
  a millisecond value into <code>exp</code> produces a token that appears valid
  until the year 50000, and passing seconds where milliseconds are expected makes
  a fresh token look decades old.
</p>
<p>
  If the token is valid here but your API still returns 401, the cause is usually
  the signature, the audience, or a revoked session — none of which are visible in
  the timestamps. Decode the full payload with the
  <a href="/tools/jwt-decoder/">JWT decoder</a> and compare <code>iss</code> and
  <code>aud</code> with what the API expects.
</p>`
      }
    ]
  },

  {
    slug: "base64-encoder-decoder",
    toolId: "base64",
    category: "Auth",
    module: "js/auth.js",
    card: "Base64 Encoder / Decoder",
    blurb: "Encode or decode Base64 and Base64URL, Unicode-safe.",
    title: "Base64 Encoder and Decoder (Base64URL supported) | curl2code",
    description:
      "Encode and decode Base64 and Base64URL text in your browser, with correct UTF-8 handling for non-ASCII characters. Free, instant, nothing uploaded.",
    h1: "Base64 encoder and decoder",
    intro:
      "Convert text to Base64 and back, in the standard alphabet or the URL-safe variant used by JWTs and query parameters.",
    sections: [
      {
        h2: "Standard Base64 versus Base64URL",
        html: `
<p>
  Standard Base64 uses <code>+</code> and <code>/</code>, both of which have
  meaning inside a URL — <code>+</code> is read as a space in a query string. The
  URL-safe alphabet replaces them with <code>-</code> and <code>_</code> and
  usually drops the <code>=</code> padding. JWT segments use this variant, which
  is why pasting one into a standard decoder often fails on the last few
  characters.
</p>
<ul class="doc-list">
  <li>Base64 is an encoding, not encryption. It hides nothing from anyone who can read it.</li>
  <li>Encoded output is about 33% larger than the input.</li>
  <li>Non-ASCII text is encoded as UTF-8 first, so accents and emoji survive the round trip intact.</li>
</ul>`
      }
    ]
  },

  {
    slug: "url-encoder-decoder",
    toolId: "url-encoder",
    category: "Auth",
    module: "js/auth.js",
    card: "URL Encoder / Decoder",
    blurb: "Percent-encode or decode text for use in URLs.",
    title: "URL Encoder and Decoder — Percent Encoding Tool | curl2code",
    description:
      "Percent-encode or decode text for query strings, paths and form bodies, with the difference between component and full-URL encoding made explicit.",
    h1: "URL encoder and decoder",
    intro:
      "Percent-encode a value before putting it in a URL, or decode one you found in a log or a redirect.",
    sections: [
      {
        h2: "Encoding a component, not a URL",
        html: `
<p>
  Encoding a whole URL and encoding one value inside it are different operations.
  A query parameter's value must have <code>&amp;</code>, <code>=</code>,
  <code>?</code> and <code>#</code> escaped, because leaving them raw ends the
  value early — the standard way to break a redirect URL passed as a parameter.
  A complete URL must keep those characters intact.
</p>
<ul class="doc-list">
  <li>In JavaScript that distinction is <code>encodeURIComponent()</code> versus <code>encodeURI()</code>.</li>
  <li>A space is <code>%20</code> in a path and may be <code>+</code> in a query string; the two are only interchangeable in form-encoded data.</li>
  <li>Double-encoding produces <code>%2520</code> — if you see that in a log, something encoded an already-encoded value.</li>
</ul>`
      }
    ]
  },

  {
    slug: "basic-auth-generator",
    toolId: "basic-auth",
    category: "Auth",
    module: "js/auth.js",
    card: "Basic Auth Generator",
    blurb: "Build or read back an HTTP Basic Authorization header.",
    title: "Basic Auth Header Generator and Decoder | curl2code",
    description:
      "Build an HTTP Basic Authorization header from a username and password, or decode one back into its credentials. Runs entirely in your browser.",
    h1: "Basic auth header generator",
    intro:
      "Turn a username and password into an <code>Authorization: Basic</code> header, or paste an existing header to read the credentials back.",
    sections: [
      {
        h2: "How Basic authentication works",
        html: `
<p>
  The header is the literal string <code>username:password</code>, Base64-encoded
  and prefixed with <code>Basic </code>. There is no hashing and no secret: the
  encoding is trivially reversible, which is exactly what the decode direction of
  this tool demonstrates. Basic auth is only safe over HTTPS.
</p>
<ul class="doc-list">
  <li>A colon is not allowed in the username — the first colon separates the two halves.</li>
  <li>Many APIs use Basic auth with an API key as the username and an empty password; that trailing colon is required.</li>
  <li>The generated header is a live credential. Keep it out of commits, screenshots and bug reports.</li>
</ul>`
      }
    ]
  },

  /* ---------------------------------------------------- API */

  {
    slug: "http-request-builder",
    toolId: "request-builder",
    category: "API",
    module: "js/api.js",
    extraModules: ["js/curl.js"],
    card: "HTTP Request Builder",
    blurb: "Build a request from parts and export it as cURL or code.",
    title: "HTTP Request Builder — Export as cURL or Code | curl2code",
    description:
      "Compose an HTTP request from method, URL, headers and body, then export it as a cURL command, a fetch() call, an Axios config or Python requests code.",
    h1: "HTTP request builder",
    intro:
      "Fill in a method, URL, headers and body, and export the result as a cURL command or as code. The reverse direction of the converter: parts in, request out.",
    sections: [
      {
        h2: "Why build a cURL command rather than write one",
        html: `
<p>
  Quoting is where hand-written cURL commands go wrong — a JSON body containing
  double quotes, an apostrophe in a value, a header with a space. The builder
  quotes every part correctly and produces a command that runs unchanged in a
  POSIX shell.
</p>
<p>
  The code exports run through the same parser the
  <a href="/tools/curl-to-code/">cURL converter</a> uses, so the command and the
  code always describe the same request.
</p>`
      }
    ]
  },

  {
    slug: "http-status-codes",
    toolId: "status-lookup",
    category: "API",
    module: "js/api.js",
    card: "HTTP Status Lookup",
    blurb: "Look up an HTTP status code by number or keyword.",
    title: "HTTP Status Code Lookup — What Does This Code Mean? | curl2code",
    description:
      "Look up any HTTP status code by number or by name and get its meaning, category and when to use it. Free reference for API developers.",
    h1: "HTTP status code lookup",
    intro:
      "Type a status code, or a word like “conflict” or “gateway”, to get the name, class and meaning.",
    sections: [
      {
        h2: "The distinctions that get confused",
        html: `
<ul class="doc-list">
  <li><strong>401 versus 403.</strong> 401 means the request was not authenticated — credentials are missing or invalid, and retrying with valid ones may work. 403 means the caller is known and still not allowed; retrying will not help.</li>
  <li><strong>400 versus 422.</strong> 400 is malformed syntax the server cannot parse. 422 is well-formed content that fails validation.</li>
  <li><strong>301 versus 308.</strong> Both are permanent, but 301 historically allows clients to change a POST into a GET. 308 forbids it — use it when the method must be preserved.</li>
  <li><strong>502 versus 504.</strong> 502 means an upstream returned something invalid; 504 means it did not answer in time.</li>
  <li><strong>429.</strong> Rate limited. Honour the <code>Retry-After</code> header rather than backing off blindly.</li>
</ul>`
      }
    ]
  },

  {
    slug: "http-header-parser",
    toolId: "header-parser",
    category: "API",
    module: "js/api.js",
    card: "HTTP Header Parser",
    blurb: "Turn a raw header block into a table and a JSON object.",
    title: "HTTP Header Parser — Raw Headers to JSON | curl2code",
    description:
      "Paste a raw HTTP header block and get a readable table plus a JSON object you can drop straight into code. Free, browser-based, nothing uploaded.",
    h1: "HTTP header parser",
    intro:
      "Paste headers copied from <code>curl -i</code>, DevTools or a log, and get them as a sorted table and as a JSON object ready to paste into code.",
    sections: [
      {
        h2: "What it handles",
        html: `
<p>
  Header names are case-insensitive per the specification, and HTTP/2 lowercases
  them all, so the same header can look different depending on where you copied it
  from. The parser keeps what you pasted and lines everything up so the values are
  comparable.
</p>
<p>
  Useful when a request works from one client and not another: parse both header
  blocks and the difference is usually a single <code>Accept</code>,
  <code>Content-Type</code> or <code>User-Agent</code> line.
</p>`
      }
    ]
  },

  {
    slug: "url-parser",
    toolId: "url-parser",
    category: "API",
    module: "js/api.js",
    card: "URL Parser",
    blurb: "Break a URL into its parts and list its query parameters.",
    title: "URL Parser — Split a URL Into Its Components | curl2code",
    description:
      "Break any URL into scheme, host, port, path, query and fragment, with every query parameter decoded and listed. Free and runs in your browser.",
    h1: "URL parser",
    intro:
      "Paste a URL to see its scheme, host, port, path, query parameters and fragment, with each parameter percent-decoded.",
    sections: [
      {
        h2: "Where long URLs hide their problems",
        html: `
<p>
  OAuth callbacks, tracking links and signed asset URLs are long enough that
  reading them by eye is unreliable. Splitting them out makes the usual faults
  obvious: a parameter that was double-encoded, a redirect URI that does not match
  the one registered with the provider, a repeated parameter, or a fragment that
  never reaches the server at all — everything after <code>#</code> stays in the
  browser.
</p>`
      }
    ]
  },

  {
    slug: "query-string-parser",
    toolId: "query-parser",
    category: "API",
    module: "js/api.js",
    card: "Query String Parser",
    blurb: "Convert a query string to JSON, or JSON back to a query string.",
    title: "Query String to JSON Converter (and back) | curl2code",
    description:
      "Convert a URL query string into JSON, or turn a JSON object into an encoded query string. Handles repeated keys and percent-encoding. Free tool.",
    h1: "Query string parser",
    intro:
      "Turn <code>?a=1&amp;b=hello%20world</code> into JSON, or turn a JSON object into a properly encoded query string.",
    sections: [
      {
        h2: "Repeated keys and arrays",
        html: `
<p>
  Query strings have no standard for arrays, and every framework picked a
  different convention: <code>tag=a&amp;tag=b</code>, <code>tag[]=a&amp;tag[]=b</code>
  and <code>tag=a,b</code> are all in wide use. If a list is arriving as a single
  value, or only the last element survives, this mismatch is almost always why.
  Check what the receiving framework expects before choosing a form.
</p>`
      }
    ]
  },

  {
    slug: "http-response-formatter",
    toolId: "response-formatter",
    category: "API",
    module: "js/api.js",
    card: "HTTP Response Formatter",
    blurb: "Split a raw HTTP response into status, headers and a pretty body.",
    title: "HTTP Response Formatter — Parse a Raw Response | curl2code",
    description:
      "Paste a raw HTTP response from curl -i and get the status line, a header table and a pretty-printed body. Free, browser-based developer tool.",
    h1: "HTTP response formatter",
    intro:
      "Paste the output of <code>curl -i</code> and get the status line, the headers as a table, and the body pretty-printed if it is JSON.",
    sections: [
      {
        h2: "Reading a raw response",
        html: `
<p>
  A raw response is the status line, then headers, then a blank line, then the
  body. That blank line is the whole format — if the body looks like it contains
  headers, an upstream proxy added a second response, which is a real bug worth
  chasing.
</p>
<p>
  With <code>-i -L</code>, cURL prints one header block per redirect hop. The
  formatter shows them in order, which makes it easy to see where a redirect chain
  loses a cookie or an <code>Authorization</code> header — most clients drop
  authentication when a redirect crosses to a different host.
</p>`
      }
    ]
  },

  /* ---------------------------------------------------- Webhooks */

  {
    slug: "webhook-payload-formatter",
    toolId: "webhook-formatter",
    category: "Webhooks",
    module: "js/webhooks.js",
    card: "Webhook Payload Formatter",
    blurb: "Pretty-print a webhook payload and summarise its event fields.",
    title: "Webhook Payload Formatter and Inspector | curl2code",
    description:
      "Pretty-print a webhook payload and pull out the event type, id and timestamp fields used by Stripe, GitHub, Shopify and similar providers.",
    h1: "Webhook payload formatter",
    intro:
      "Paste a webhook body to read it properly, with the event type, id and timestamp fields lifted out of the payload.",
    sections: [
      {
        h2: "What to check in a webhook payload",
        html: `
<ul class="doc-list">
  <li><strong>The event id.</strong> Providers retry, so the same event can arrive more than once. Store the id and ignore repeats — delivery is at-least-once, never exactly-once.</li>
  <li><strong>The timestamp.</strong> Events can arrive out of order. If the payload describes a state, compare timestamps before overwriting newer data with older.</li>
  <li><strong>The event type.</strong> Providers add new types over time; an unknown type should be logged and acknowledged, not treated as an error.</li>
</ul>
<p>
  Verify the signature before trusting any of it — see the
  <a href="/tools/webhook-signature-generator/">signature generator</a>.
</p>`
      }
    ]
  },

  {
    slug: "webhook-signature-generator",
    toolId: "webhook-signature",
    category: "Webhooks",
    module: "js/webhooks.js",
    card: "Webhook Signature Generator",
    blurb: "Build a provider-style webhook signature header from a payload and secret.",
    title: "Webhook Signature Generator — HMAC Signatures | curl2code",
    description:
      "Generate provider-style webhook signature headers from a payload and secret so you can test signature verification locally. Runs in your browser.",
    h1: "Webhook signature generator",
    intro:
      "Produce the signature header a provider would send for a given payload and secret, so you can test your verification code without waiting for a real event.",
    sections: [
      {
        h2: "Why local verification usually fails",
        html: `
<ul class="doc-list">
  <li><strong>The signature covers the raw bytes.</strong> Parse the body to JSON and re-serialise it, and the signature will never match — key order and whitespace change. Capture the raw body before your framework parses it.</li>
  <li><strong>Signed payloads often include more than the body.</strong> Stripe signs <code>timestamp.body</code>; other providers prepend an id. Read the provider's documentation for the exact string.</li>
  <li><strong>Compare in constant time.</strong> Use <code>crypto.timingSafeEqual</code> or your language's equivalent, not <code>===</code>.</li>
  <li><strong>Check the timestamp too.</strong> A valid signature on a replayed request is still a replay; reject events older than a few minutes.</li>
</ul>`
      }
    ]
  },

  {
    slug: "hmac-generator",
    toolId: "hmac-generator",
    category: "Webhooks",
    module: "js/webhooks.js",
    card: "HMAC Generator",
    blurb: "Compute an HMAC digest of any message with any supported hash.",
    title: "HMAC Generator — SHA-256, SHA-1, SHA-512 | curl2code",
    description:
      "Compute an HMAC digest of any message with SHA-1, SHA-256, SHA-384 or SHA-512, in hex or Base64, using the browser's Web Crypto API.",
    h1: "HMAC generator",
    intro:
      "Compute an HMAC over any message with any supported hash, in hex or Base64 — the primitive behind webhook signatures and most request-signing schemes.",
    sections: [
      {
        h2: "Notes",
        html: `
<ul class="doc-list">
  <li>Digests are computed with the browser's native Web Crypto API, so the secret never leaves your machine.</li>
  <li>HMAC is a keyed hash, not encryption: it proves the message was produced by someone holding the secret and has not been altered. It does not hide the message.</li>
  <li>SHA-1 is still specified by some older webhook providers. Support it for compatibility; do not choose it for new work.</li>
  <li>Encoding matters. Hex and Base64 of the same digest are different strings, and comparing one against the other always fails.</li>
</ul>`
      }
    ]
  },

  {
    slug: "webhook-tester",
    toolId: "webhook-tester",
    category: "Webhooks",
    module: "js/webhooks.js",
    card: "Webhook Tester",
    blurb: "Send a signed test webhook from your browser and read the response.",
    title: "Webhook Tester — Send a Test Webhook Request | curl2code",
    description:
      "Send a test webhook with custom headers, a payload and an optional HMAC signature, then inspect the status, headers and body of the response.",
    h1: "Webhook tester",
    intro:
      "Send a test request to your endpoint with the headers, payload and signature of your choice, and inspect what comes back.",
    sections: [
      {
        h2: "Before you send",
        html: `
<p>
  This is the one tool on the site that makes a network request. It goes
  <strong>directly from your browser to the URL you enter</strong> — it is not
  proxied through curl2code, and the payload and secret are not stored or logged
  anywhere.
</p>
<ul class="doc-list">
  <li><strong>CORS applies.</strong> Your browser blocks the response unless the endpoint allows this origin. The request usually still arrives; you just cannot read the reply. If that matters, send from a terminal instead.</li>
  <li><strong>Localhost will not work</strong> from a page served over HTTPS. Use a tunnel such as ngrok or Cloudflare Tunnel.</li>
  <li><strong>Send only to endpoints you control.</strong></li>
</ul>`
      }
    ]
  },

  /* ---------------------------------------------------- Utilities */

  {
    slug: "uuid-generator",
    toolId: "uuid-generator",
    category: "Utilities",
    module: "js/dev.js",
    card: "UUID Generator",
    blurb: "Generate v4 or time-ordered v7 UUIDs in bulk.",
    title: "UUID Generator — v4 and v7 UUIDs in Bulk | curl2code",
    description:
      "Generate cryptographically random v4 UUIDs or time-ordered v7 UUIDs, up to 500 at a time, with optional uppercase and hyphen removal. Free tool.",
    h1: "UUID generator",
    intro:
      "Generate up to 500 UUIDs at once, as random v4 or time-ordered v7, using the browser's cryptographic random number generator.",
    sections: [
      {
        h2: "v4 or v7?",
        html: `
<p>
  <strong>v4</strong> is 122 random bits. Collisions are not a practical concern,
  and it reveals nothing about when it was created — the right default when the
  id is exposed publicly.
</p>
<p>
  <strong>v7</strong>, standardised in RFC 9562, puts a 48-bit millisecond
  timestamp first and fills the rest with randomness. Ids generated in sequence
  sort in creation order, which matters a great deal as a database primary key: a
  random v4 scatters inserts across a B-tree index and fragments it, while v7
  appends. Choose v7 for primary keys, v4 for public identifiers.
</p>
<p>
  Both are generated with <code>crypto.getRandomValues()</code> in your browser.
  Nothing is requested from a server, so no one — including this site — ever sees
  the values you generate.
</p>`
      }
    ]
  },

  {
    slug: "regex-tester",
    toolId: "regex-tester",
    category: "Utilities",
    module: "js/dev.js",
    card: "Regex Tester",
    blurb: "Test a regular expression and inspect every match and capture group.",
    title: "Regex Tester — Test JavaScript Regular Expressions | curl2code",
    description:
      "Test a JavaScript regular expression against sample text and see every match, its index and each capture group, named groups included. Free tool.",
    h1: "Regex tester",
    intro:
      "Enter a pattern and some text, and see every match with its position and capture groups, updated as you type.",
    sections: [
      {
        h2: "Notes on the JavaScript flavour",
        html: `
<p>
  Patterns are evaluated with the browser's own engine, so what you see here is
  exactly what <code>String.prototype.matchAll</code> will do in your code. That
  flavour differs from PCRE and from Python's <code>re</code> in ways that matter:
  no atomic groups, no recursion, and lookbehind requires a recent browser.
</p>
<ul class="doc-list">
  <li>The <code>g</code> flag is added automatically so all matches are listed, not only the first.</li>
  <li>Named groups — <code>(?&lt;year&gt;\\d{4})</code> — are shown by name.</li>
  <li>Nested quantifiers such as <code>(a+)+</code> can backtrack catastrophically. If the page stalls on a long input, that is the cause, and the same pattern would stall your server.</li>
</ul>`
      }
    ]
  },

  {
    slug: "timestamp-converter",
    toolId: "timestamp-converter",
    category: "Utilities",
    module: "js/dev.js",
    card: "Unix Timestamp Converter",
    blurb: "Convert between Unix timestamps, ISO 8601 and human dates.",
    title: "Unix Timestamp Converter — Epoch to Date and Back | curl2code",
    description:
      "Convert Unix timestamps to ISO 8601, UTC and local time, or turn a date back into epoch seconds. Seconds, milliseconds and microseconds detected.",
    h1: "Unix timestamp converter",
    intro:
      "Paste a Unix timestamp, an ISO 8601 date or the word <code>now</code>, and get every common representation at once.",
    sections: [
      {
        h2: "Seconds, milliseconds, microseconds",
        html: `
<p>
  The unit is the usual source of confusion. Unix time is defined in seconds, but
  JavaScript's <code>Date.now()</code> returns milliseconds and several databases
  store microseconds. A value of the wrong magnitude does not error — it silently
  lands in 1970 or in the year 50000. This converter detects the unit from the
  number of digits, and shows both seconds and milliseconds so you can see which
  one your system expects.
</p>
<ul class="doc-list">
  <li>Unix time is always UTC; a timestamp has no time zone of its own.</li>
  <li>ISO 8601 with a <code>Z</code> means UTC. A string with no offset at all is ambiguous and will be read differently by different parsers.</li>
  <li>32-bit signed timestamps overflow on 19 January 2038 — still worth checking in older systems.</li>
</ul>`
      }
    ]
  }
];
