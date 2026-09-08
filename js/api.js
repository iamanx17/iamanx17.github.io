/*
---------------------------------------------------
API tools
---------------------------------------------------
*/

function parseHeaderLines(text) {

  const headers = {};

  for (const raw of (text || "").split(/\r?\n/)) {

    const line = raw.trim();

    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf(":");

    if (separator === -1) continue;

    headers[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }

  return headers;
}


function shellQuote(value) {
  return "'" + String(value).replace(/'/g, `'\\''`) + "'";
}


/*
Request Builder
*/

Tools.add({
  id: "request-builder",
  cat: "API",
  name: "Request Builder",
  desc: "Build a request from parts and export it as cURL or code.",
  outputLabel: "Request",
  example: {
    method: "POST",
    url: "https://api.example.com/v1/users",
    headers: "Content-Type: application/json\nAuthorization: Bearer YOUR_TOKEN",
    body: '{"name":"Aman","email":"aman@example.com"}'
  },
  inputs: [
    {
      key: "method",
      label: "Method",
      type: "select",
      options: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]
    },
    { key: "url", label: "URL", type: "text", placeholder: "https://api.example.com/v1/users" },
    {
      key: "headers",
      label: "Headers (one per line, Key: Value)",
      type: "textarea",
      placeholder: "Content-Type: application/json"
    },
    { key: "body", label: "Body", type: "textarea", placeholder: '{"name":"Aman"}' },
    {
      key: "format",
      label: "Output as",
      type: "select",
      options: [
        { value: "curl", label: "cURL" },
        { value: "fetch", label: "JavaScript fetch" },
        { value: "axios", label: "Axios" },
        { value: "python", label: "Python requests" }
      ]
    }
  ],
  run(v) {

    if (!v.url.trim()) return { note: "Enter a URL." };

    const headers = parseHeaderLines(v.headers);
    const body = v.body.trim() ? v.body.trim() : null;

    const parts = ["curl -X " + v.method + " " + shellQuote(v.url.trim())];

    for (const [key, value] of Object.entries(headers)) {
      parts.push("  -H " + shellQuote(key + ": " + value));
    }

    if (body !== null) {
      parts.push("  --data-raw " + shellQuote(body));
    }

    const curl = parts.join(" \\\n");

    /* the code formats reuse the cURL parser so both paths stay in sync */
    if (v.format === "fetch")  return genFetch(parseCurl(curl));
    if (v.format === "axios")  return genAxios(parseCurl(curl));
    if (v.format === "python") return genPython(parseCurl(curl));

    return curl;
  }
});


/*
HTTP Status Lookup
*/

const HTTP_STATUS = {
  100: ["Continue", "Client should continue with the request body."],
  101: ["Switching Protocols", "Server is switching protocols (e.g. to WebSocket)."],
  102: ["Processing", "Server received the request but has no response yet."],
  103: ["Early Hints", "Preload hints sent before the final response."],
  200: ["OK", "Request succeeded."],
  201: ["Created", "Resource created. Usually returns a Location header."],
  202: ["Accepted", "Accepted for processing, not completed yet."],
  203: ["Non-Authoritative Information", "Response modified by a proxy."],
  204: ["No Content", "Success with no response body."],
  205: ["Reset Content", "Client should reset the document view."],
  206: ["Partial Content", "Range request succeeded."],
  207: ["Multi-Status", "WebDAV: multiple status codes in the body."],
  208: ["Already Reported", "WebDAV: members already enumerated."],
  226: ["IM Used", "Response is the result of instance manipulations."],
  300: ["Multiple Choices", "Several possible responses."],
  301: ["Moved Permanently", "Resource moved permanently to a new URL."],
  302: ["Found", "Temporary redirect."],
  303: ["See Other", "Fetch the resource at another URI with GET."],
  304: ["Not Modified", "Cached copy is still valid."],
  307: ["Temporary Redirect", "Temporary redirect, method preserved."],
  308: ["Permanent Redirect", "Permanent redirect, method preserved."],
  400: ["Bad Request", "Malformed syntax or invalid request."],
  401: ["Unauthorized", "Authentication required or failed."],
  402: ["Payment Required", "Reserved for payment-gated resources."],
  403: ["Forbidden", "Authenticated but not allowed."],
  404: ["Not Found", "Resource does not exist."],
  405: ["Method Not Allowed", "HTTP method not supported for this resource."],
  406: ["Not Acceptable", "Cannot produce a response matching Accept headers."],
  407: ["Proxy Authentication Required", "Must authenticate with the proxy."],
  408: ["Request Timeout", "Client took too long to send the request."],
  409: ["Conflict", "Conflicts with the current state of the resource."],
  410: ["Gone", "Resource permanently removed."],
  411: ["Length Required", "Content-Length header is missing."],
  412: ["Precondition Failed", "A conditional header failed."],
  413: ["Payload Too Large", "Request body is too big."],
  414: ["URI Too Long", "Request URI exceeds the server limit."],
  415: ["Unsupported Media Type", "Content-Type is not supported."],
  416: ["Range Not Satisfiable", "Requested range is invalid."],
  417: ["Expectation Failed", "Expect header cannot be met."],
  418: ["I'm a teapot", "April Fools' RFC 2324."],
  421: ["Misdirected Request", "Server cannot produce a response for this authority."],
  422: ["Unprocessable Content", "Semantically invalid — usually validation errors."],
  423: ["Locked", "WebDAV: resource is locked."],
  424: ["Failed Dependency", "WebDAV: previous request failed."],
  425: ["Too Early", "Server unwilling to risk replay."],
  426: ["Upgrade Required", "Client must switch protocols."],
  428: ["Precondition Required", "Request must be conditional."],
  429: ["Too Many Requests", "Rate limited. Check Retry-After."],
  431: ["Request Header Fields Too Large", "Headers are too large."],
  451: ["Unavailable For Legal Reasons", "Blocked for legal reasons."],
  500: ["Internal Server Error", "Unhandled server-side error."],
  501: ["Not Implemented", "Server does not support the functionality."],
  502: ["Bad Gateway", "Invalid response from an upstream server."],
  503: ["Service Unavailable", "Server overloaded or down for maintenance."],
  504: ["Gateway Timeout", "Upstream server timed out."],
  505: ["HTTP Version Not Supported", "HTTP version is not supported."],
  507: ["Insufficient Storage", "WebDAV: not enough storage."],
  508: ["Loop Detected", "WebDAV: infinite loop detected."],
  511: ["Network Authentication Required", "Client must authenticate to gain network access."]
};


function statusClass(code) {

  if (code < 300) return "ok";
  if (code < 400) return "warn";

  return "error";
}


Tools.add({
  id: "status-lookup",
  cat: "API",
  name: "HTTP Status Lookup",
  desc: "Look up an HTTP status code by number or keyword.",
  outputLabel: "Matches",
  example: { query: "429" },
  inputs: [
    {
      key: "query",
      label: "Status code or keyword",
      type: "text",
      placeholder: "404, 5xx, timeout, rate ..."
    }
  ],
  run(v) {

    const query = v.query.trim().toLowerCase();

    let entries = Object.entries(HTTP_STATUS);

    if (query) {

      if (/^\dxx$/.test(query)) {

        const group = query[0];
        entries = entries.filter(([code]) => code.startsWith(group));

      } else {

        entries = entries.filter(([code, [name, note]]) =>
          code.includes(query) ||
          name.toLowerCase().includes(query) ||
          note.toLowerCase().includes(query)
        );
      }
    }

    if (!entries.length) {
      return { html: '<span class="muted">No matching status code.</span>' };
    }

    const rows = entries.map(([code, [name, note]]) =>
      `<tr><td class="${statusClass(+code)}">${code}</td><td>${escapeHtml(name)}</td><td class="muted">${escapeHtml(note)}</td></tr>`
    ).join("");

    return {
      html: `<table><tr><th>Code</th><th>Name</th><th>Meaning</th></tr>${rows}</table>`
    };
  }
});


/*
HTTP Header Parser
*/

Tools.add({
  id: "header-parser",
  cat: "API",
  name: "HTTP Header Parser",
  desc: "Turn a raw header block into a table and a JSON object.",
  outputLabel: "Parsed headers",
  example: {
    raw: "HTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\nCache-Control: max-age=60, public\nX-RateLimit-Remaining: 42\nSet-Cookie: session=abc123; Path=/; HttpOnly"
  },
  inputs: [
    { key: "raw", label: "Raw headers", type: "textarea", tall: true, placeholder: "Content-Type: application/json" }
  ],
  run(v) {

    if (!v.raw.trim()) return { note: "Paste a raw header block." };

    const lines = v.raw.split(/\r?\n/).filter(l => l.trim());

    let statusLine = null;

    if (lines.length && /^HTTP\/[\d.]+\s/i.test(lines[0])) {
      statusLine = lines.shift().trim();
    }

    const headers = parseHeaderLines(lines.join("\n"));

    if (!Object.keys(headers).length) {
      return { note: "No headers found." };
    }

    const rows = Object.entries(headers).map(([k, val]) =>
      `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(val)}</td></tr>`
    ).join("");

    return {
      html:
        (statusLine ? `<h3>${escapeHtml(statusLine)}</h3>` : "") +
        `<table><tr><th>Header</th><th>Value</th></tr>${rows}</table>` +
        `<h3 style="margin-top:16px">JSON</h3><pre>${escapeHtml(JSON.stringify(headers, null, 2))}</pre>`
    };
  }
});


/*
URL Parser
*/

Tools.add({
  id: "url-parser",
  cat: "API",
  name: "URL Parser",
  desc: "Break a URL into its parts and list its query parameters.",
  outputLabel: "URL parts",
  example: { url: "https://user:pw@api.example.com:8443/v1/users?page=2&limit=50&q=hello%20world#results" },
  inputs: [
    { key: "url", label: "URL", type: "textarea", placeholder: "https://api.example.com/v1/users?page=2" }
  ],
  run(v) {

    if (!v.url.trim()) return { note: "Paste a URL." };

    let url;

    try {
      url = new URL(v.url.trim());
    } catch {
      throw new Error("Not a valid absolute URL (include the scheme, e.g. https://).");
    }

    const parts = {
      protocol: url.protocol.replace(":", ""),
      username: url.username,
      password: url.password,
      hostname: url.hostname,
      port: url.port || "(default)",
      path: url.pathname,
      query: url.search,
      hash: url.hash
    };

    const partRows = Object.entries(parts).map(([k, val]) =>
      `<tr><td>${k}</td><td>${escapeHtml(val || "—")}</td></tr>`
    ).join("");

    const params = [...url.searchParams.entries()];

    const paramRows = params.length
      ? params.map(([k, val]) =>
          `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(val)}</td></tr>`
        ).join("")
      : '<tr><td colspan="2" class="muted">No query parameters</td></tr>';

    const segments = url.pathname.split("/").filter(Boolean);

    return {
      html:
        `<table><tr><th>Part</th><th>Value</th></tr>${partRows}</table>` +
        `<h3 style="margin-top:16px">Path segments</h3>` +
        `<pre>${escapeHtml(JSON.stringify(segments, null, 2))}</pre>` +
        `<h3 style="margin-top:16px">Query parameters</h3>` +
        `<table><tr><th>Key</th><th>Value</th></tr>${paramRows}</table>`
    };
  }
});


/*
Query Parameter Parser
*/

Tools.add({
  id: "query-parser",
  cat: "API",
  name: "Query Parameter Parser",
  desc: "Convert a query string to JSON, or JSON back to a query string.",
  outputLabel: "Result",
  example: { input: "page=2&limit=50&tags=a&tags=b&q=hello%20world" },
  inputs: [
    {
      key: "input",
      label: "Query string or JSON object",
      type: "textarea",
      placeholder: "page=2&limit=50   or   {\"page\":2}"
    },
    {
      key: "mode",
      label: "Direction",
      type: "select",
      options: [
        { value: "toJson", label: "Query string → JSON" },
        { value: "toQuery", label: "JSON → query string" }
      ]
    }
  ],
  run(v) {

    const text = v.input.trim();

    if (!text) return { note: "Paste a query string." };

    if (v.mode === "toQuery") {

      const object = parseJson(text, "JSON object");
      const params = new URLSearchParams();

      for (const [k, val] of Object.entries(object)) {

        if (Array.isArray(val)) {
          val.forEach(item => params.append(k, item));
        } else {
          params.append(k, val === null ? "" : String(val));
        }
      }

      return params.toString();
    }

    const query = text.includes("?") ? text.slice(text.indexOf("?") + 1) : text;
    const params = new URLSearchParams(query);
    const result = {};

    for (const [k, val] of params.entries()) {

      if (k in result) {
        result[k] = [].concat(result[k], val);
      } else {
        result[k] = val;
      }
    }

    return JSON.stringify(result, null, 2);
  }
});


/*
Response Formatter
*/

Tools.add({
  id: "response-formatter",
  cat: "API",
  name: "Response Formatter",
  desc: "Split a raw HTTP response into status, headers and a pretty body.",
  outputLabel: "Formatted response",
  example: {
    raw: 'HTTP/1.1 201 Created\nContent-Type: application/json\nLocation: /v1/users/42\n\n{"id":42,"name":"Aman","tags":["a","b"],"active":true}'
  },
  inputs: [
    { key: "raw", label: "Raw response", type: "textarea", tall: true, placeholder: "HTTP/1.1 200 OK\n..." }
  ],
  run(v) {

    const raw = v.raw.replace(/\r\n/g, "\n");

    if (!raw.trim()) return { note: "Paste a raw HTTP response." };

    const split = raw.indexOf("\n\n");

    let head = split === -1 ? raw : raw.slice(0, split);
    let body = split === -1 ? "" : raw.slice(split + 2);

    /* body only, no headers */
    if (!/^HTTP\/|:/.test(head.split("\n")[0])) {
      body = raw;
      head = "";
    }

    const lines = head.split("\n").filter(l => l.trim());

    let statusHtml = "";

    if (lines.length && /^HTTP\//i.test(lines[0])) {

      const statusLine = lines.shift().trim();
      const code = parseInt(statusLine.split(/\s+/)[1], 10);
      const known = HTTP_STATUS[code];

      statusHtml =
        `<h3 class="${statusClass(code)}">${escapeHtml(statusLine)}</h3>` +
        (known ? `<p class="muted" style="margin:0 0 12px">${escapeHtml(known[1])}</p>` : "");
    }

    const headers = parseHeaderLines(lines.join("\n"));

    const headerHtml = Object.keys(headers).length
      ? `<table><tr><th>Header</th><th>Value</th></tr>` +
        Object.entries(headers).map(([k, val]) =>
          `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(val)}</td></tr>`
        ).join("") + "</table>"
      : '<p class="muted">No headers.</p>';

    let bodyText = body.trim();

    if (bodyText) {

      try {
        bodyText = JSON.stringify(JSON.parse(bodyText), null, 2);
      } catch {
        /* leave as-is */
      }
    }

    return {
      html:
        statusHtml +
        headerHtml +
        `<h3 style="margin-top:16px">Body</h3>` +
        `<pre>${escapeHtml(bodyText || "(empty)")}</pre>`
    };
  }
});
