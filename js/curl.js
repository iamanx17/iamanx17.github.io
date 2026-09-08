/*
<<<<<<< HEAD
---------------------------------------------------
cURL parser (shared by all cURL tools)
---------------------------------------------------
*/

const CURL_EXAMPLE = `curl 'https://api.example.com/v1/users' \\
  -X POST \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer YOUR_TOKEN' \\
  -d '{"name":"Aman","email":"aman@example.com"}'`;


function normalizeCurl(curl) {

  return curl
    .replace(/\\\r?\n/g, " ")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
=======
============================================================
curl2code — cURL parser and code generators

Everything here runs in the browser. A pasted command is never
sent anywhere, which is why the tool is safe to use with real
Authorization headers and API keys.
============================================================
*/

const CURL_EXAMPLE = `curl 'https://api.example.com/v1/users?limit=20' \\
  -X POST \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer YOUR_TOKEN' \\
  -d '{"name":"Ada Lovelace","email":"ada@example.com","admin":false}'`;


/*
------------------------------------------------------------
Tokeniser

cURL commands are pasted from terminals, READMEs and browser
"Copy as cURL" menus, so the input can contain line
continuations, smart quotes, a leading shell prompt and
Windows-style `^` continuations.
------------------------------------------------------------
*/

function normalizeCurl(curl) {

  return String(curl)
    /* smart quotes from docs and blog posts */
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    /* a copied shell prompt */
    .replace(/^\s*(?:\$|>|PS [^\n>]*>)\s+/gm, "")
    /* line continuations: POSIX \, PowerShell `, cmd ^ */
    .replace(/\\\r?\n/g, " ")
    .replace(/`\r?\n/g, " ")
    .replace(/\^\r?\n/g, " ")
    .replace(/\r?\n/g, " ")
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
    .trim();
}


<<<<<<< HEAD
function stripQuotes(value) {

  if (!value) return value;

  if (
    (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
    (value.startsWith("'") && value.endsWith("'") && value.length > 1)
  ) {
    return value.slice(1, -1);
  }

  return value;
}


function parseCurl(curl) {

  curl = normalizeCurl(curl);

  if (!curl) {
    throw new Error("Paste a cURL command first.");
  }

  if (!/^curl\b/.test(curl)) {
    throw new Error("Input does not appear to be a cURL command.");
  }

  const tokens = curl.match(/(?:[^\s"'`]+|"(?:\\.|[^"])*"|'(?:\\.|[^'])*')+/g);

  if (!tokens) {
    throw new Error("Unable to parse cURL command.");
  }

  const result = {
    url: "",
    method: "",
    headers: {},
    body: null,
    form: [],
    auth: null,
    insecure: false
  };

  for (let i = 0; i < tokens.length; i++) {

    const token = tokens[i];

    if (token === "curl") continue;

    /* flags with no value */
    if (
      token === "--compressed" ||
      token === "-s" || token === "--silent" ||
      token === "-L" || token === "--location" ||
      token === "-i" || token === "--include" ||
      token === "-v" || token === "--verbose" ||
      token === "-g"
    ) {
      continue;
    }

    if (token === "-k" || token === "--insecure") {
      result.insecure = true;
=======
/*
Splits a command line into tokens, honouring single quotes,
double quotes and backslash escapes, and reporting whether a
quote was left open (the most common paste mistake).
*/
function tokenizeCurl(line) {

  const tokens = [];

  let current = "";
  let quote = null;
  let started = false;

  for (let i = 0; i < line.length; i++) {

    const char = line[i];

    if (quote === "'") {

      if (char === "'") { quote = null; continue; }

      current += char;
      continue;
    }

    if (quote === '"') {

      if (char === "\\" && i + 1 < line.length && /["\\$`]/.test(line[i + 1])) {
        current += line[++i];
        continue;
      }

      if (char === '"') { quote = null; continue; }

      current += char;
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      started = true;
      continue;
    }

    if (char === "\\" && i + 1 < line.length) {
      current += line[++i];
      started = true;
      continue;
    }

    if (/\s/.test(char)) {

      if (current || started) { tokens.push(current); current = ""; started = false; }
      continue;
    }

    current += char;
    started = true;
  }

  if (current || started) tokens.push(current);

  if (quote) {
    throw new Error(
      "Unbalanced " + (quote === "'" ? "single" : "double") +
      " quote — the command looks truncated. Copy the whole line, including the closing quote."
    );
  }

  return tokens;
}


/*
------------------------------------------------------------
Flag tables
------------------------------------------------------------
*/

/* flags that never take a value */
const CURL_BOOL_FLAGS = new Set([
  "-s", "--silent", "-S", "--show-error", "-v", "--verbose", "-#", "--progress-bar",
  "-L", "--location", "-i", "--include", "-I", "--head", "-k", "--insecure",
  "-g", "--globoff", "-f", "--fail", "--fail-with-body", "--compressed",
  "-G", "--get", "-N", "--no-buffer", "--http1.1", "--http2", "--http3",
  "-4", "--ipv4", "-6", "--ipv6", "-O", "--remote-name", "-J", "--remote-header-name",
  "--no-progress-meter", "-q", "--disable", "--tlsv1.2", "--tlsv1.3", "--raw",
  "--path-as-is", "--anyauth", "--basic", "--digest", "--ntlm", "--negotiate", "--tcp-nodelay"
]);

/* flags that take a value we do not model — the value must still be consumed */
const CURL_IGNORED_VALUE_FLAGS = new Set([
  "-o", "--output", "-w", "--write-out", "--connect-timeout", "-m", "--max-time",
  "--retry", "--retry-delay", "--retry-max-time", "--limit-rate", "-x", "--proxy",
  "--proxy-user", "--cacert", "--capath", "--cert", "--key", "--cert-type",
  "--resolve", "--interface", "--dns-servers", "--cookie-jar", "-c",
  "--max-redirs", "--stderr", "--trace", "--trace-ascii", "--config", "-K",
  "--unix-socket", "--form-string-encoder", "--tls-max", "--ciphers"
]);


/*
------------------------------------------------------------
Parser
------------------------------------------------------------
*/

function looksLikeUrl(token) {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(token) || /^[\w.-]+\.[a-z]{2,}(?:[:/?#]|$)/i.test(token);
}


function splitPair(text) {

  const at = text.indexOf("=");

  return at === -1 ? [text, ""] : [text.slice(0, at), text.slice(at + 1)];
}


function parseCurl(input) {

  const line = normalizeCurl(input);

  if (!line) {
    throw new Error("Paste a cURL command first.");
  }

  const tokens = tokenizeCurl(line);

  if (!tokens.length) {
    throw new Error("Nothing to parse.");
  }

  if (!/^curl(\.exe)?$/i.test(tokens[0])) {
    throw new Error(
      'This does not start with "curl". Paste the full command, for example: curl https://api.example.com -H "Accept: application/json"'
    );
  }

  const data = {
    method: "",
    url: "",
    headers: {},
    dataParts: [],      /* { value, urlencode } */
    formParts: [],      /* { name, value, isFile, type } */
    auth: null,
    bearer: null,
    insecure: false,
    compressed: false,
    followRedirects: false,
    asQuery: false,     /* -G */
    warnings: []
  };

  const nextValue = (i, flag) => {

    if (i + 1 >= tokens.length) {
      throw new Error(flag + " is missing its value.");
    }

    return tokens[i + 1];
  };

  for (let i = 1; i < tokens.length; i++) {

    let token = tokens[i];

    if (!token) continue;

    /* --header=value form */
    if (/^--[a-z0-9-]+=/i.test(token)) {

      const at = token.indexOf("=");

      tokens.splice(i + 1, 0, token.slice(at + 1));
      token = token.slice(0, at);
    }

    if (CURL_BOOL_FLAGS.has(token)) {

      if (token === "-k" || token === "--insecure") data.insecure = true;
      if (token === "--compressed") data.compressed = true;
      if (token === "-L" || token === "--location") data.followRedirects = true;
      if (token === "-G" || token === "--get") data.asQuery = true;
      if ((token === "-I" || token === "--head") && !data.method) data.method = "HEAD";

      continue;
    }

    if (CURL_IGNORED_VALUE_FLAGS.has(token)) {

      data.warnings.push("Ignored " + token + " " + (tokens[i + 1] || "") + " — it has no equivalent in code.");
      i++;

>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
      continue;
    }

    if (token === "-X" || token === "--request") {
<<<<<<< HEAD
      result.method = stripQuotes(tokens[++i]).toUpperCase();
=======
      data.method = nextValue(i, token).toUpperCase();
      i++;
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
      continue;
    }

    if (token === "--url") {
<<<<<<< HEAD
      result.url = stripQuotes(tokens[++i]);
=======
      data.url = nextValue(i, token);
      i++;
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
      continue;
    }

    if (token === "-H" || token === "--header") {

<<<<<<< HEAD
      const header = stripQuotes(tokens[++i]);
      const separator = header.indexOf(":");

      if (separator !== -1) {
        result.headers[header.slice(0, separator).trim()] =
          header.slice(separator + 1).trim();
      }

=======
      const header = nextValue(i, token);
      i++;

      const at = header.indexOf(":");

      if (at === -1) {
        data.warnings.push('Ignored header "' + header + '" — it has no colon.');
        continue;
      }

      const name = header.slice(0, at).trim();
      const value = header.slice(at + 1).trim();

      /* `-H "Header;"` is curl's way of sending an empty header */
      if (name) data.headers[name] = value;

>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
      continue;
    }

    if (token === "-A" || token === "--user-agent") {
<<<<<<< HEAD
      result.headers["User-Agent"] = stripQuotes(tokens[++i]);
=======
      data.headers["User-Agent"] = nextValue(i, token);
      i++;
      continue;
    }

    if (token === "-e" || token === "--referer") {
      data.headers["Referer"] = nextValue(i, token).replace(/;auto$/, "");
      i++;
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
      continue;
    }

    if (token === "-b" || token === "--cookie") {
<<<<<<< HEAD
      result.headers["Cookie"] = stripQuotes(tokens[++i]);
=======

      const value = nextValue(i, token);
      i++;

      if (value.includes("=")) {
        data.headers["Cookie"] = value;
      } else {
        data.warnings.push("Ignored --cookie " + value + " — reading cookies from a file has no code equivalent.");
      }

>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
      continue;
    }

    if (token === "-u" || token === "--user") {

<<<<<<< HEAD
      const pair = stripQuotes(tokens[++i]);
      const at = pair.indexOf(":");

      result.auth = {
=======
      const pair = nextValue(i, token);
      i++;

      const at = pair.indexOf(":");

      data.auth = {
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
        user: at === -1 ? pair : pair.slice(0, at),
        pass: at === -1 ? "" : pair.slice(at + 1)
      };

      continue;
    }

<<<<<<< HEAD
    if (
      token === "-d" || token === "--data" ||
      token === "--data-raw" || token === "--data-binary" ||
      token === "--data-ascii" || token === "--data-urlencode"
    ) {

      const value = stripQuotes(tokens[++i]);

      result.body = result.body === null ? value : result.body + "&" + value;

      if (!result.method) result.method = "POST";

      continue;
    }

    if (token === "-F" || token === "--form") {

      result.form.push(stripQuotes(tokens[++i]));

      if (!result.method) result.method = "POST";

      continue;
    }

    /* unknown flag that takes a value we do not model */
    if (token.startsWith("-") && token.length > 1) {

      if (token === "-o" || token === "--output" || token === "-e" || token === "--referer") {
        i++;
      }

      continue;
    }

    if (!result.url) {
      result.url = stripQuotes(token);
    }
  }

  if (!result.url) {
    throw new Error("Could not find a URL in the command.");
  }

  if (!result.method) result.method = "GET";

  if (result.auth) {
    result.headers["Authorization"] =
      "Basic " + btoa(result.auth.user + ":" + result.auth.pass);
  }

  if (result.form.length && result.body === null) {
    result.body = result.form.join("&");
  }

=======
    if (token === "--oauth2-bearer") {
      data.bearer = nextValue(i, token);
      i++;
      continue;
    }

    if (token === "--json") {

      data.dataParts.push({ value: nextValue(i, token), urlencode: false });
      i++;

      if (!data.headers["Content-Type"]) data.headers["Content-Type"] = "application/json";
      if (!data.headers["Accept"]) data.headers["Accept"] = "application/json";

      continue;
    }

    if (
      token === "-d" || token === "--data" || token === "--data-raw" ||
      token === "--data-binary" || token === "--data-ascii" || token === "--data-urlencode"
    ) {

      const value = nextValue(i, token);
      i++;

      if (value.startsWith("@") && token !== "--data-urlencode") {
        data.warnings.push(
          "Ignored " + token + " " + value + " — the body was read from a file. Paste the file contents inline instead."
        );
        continue;
      }

      data.dataParts.push({ value, urlencode: token === "--data-urlencode" });

      continue;
    }

    if (token === "-F" || token === "--form" || token === "--form-string") {

      const value = nextValue(i, token);
      i++;

      const [name, rest] = splitPair(value);

      /* name=@file;type=image/png  or  name=<file */
      const isFile = token !== "--form-string" && /^[@<]/.test(rest);
      const typeMatch = rest.match(/;type=([^;]+)/);

      data.formParts.push({
        name,
        value: isFile ? rest.slice(1).split(";")[0] : rest,
        isFile,
        type: typeMatch ? typeMatch[1] : null
      });

      continue;
    }

    /* combined short flags such as -sL or -sSL */
    if (/^-[a-zA-Z]{2,}$/.test(token)) {

      const letters = token.slice(1).split("");

      if (letters.every(letter => CURL_BOOL_FLAGS.has("-" + letter))) {

        tokens.splice(i + 1, 0, ...letters.map(letter => "-" + letter));
        continue;
      }
    }

    if (token.startsWith("-") && token.length > 1) {
      data.warnings.push("Ignored unsupported option " + token + ".");
      continue;
    }

    if (!data.url) {
      data.url = token;
      continue;
    }

    if (looksLikeUrl(token)) {
      data.warnings.push("Ignored extra URL " + token + " — only the first URL is converted.");
    }
  }

  if (!data.url) {
    throw new Error("No URL found in the command. cURL needs a URL, for example: curl https://api.example.com/v1/users");
  }

  return finalizeCurl(data);
}


/*
Turns the raw flag soup into the normalised shape the
generators consume.
*/
function finalizeCurl(data) {

  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(data.url)) {
    data.url = "https://" + data.url.replace(/^\/+/, "");
  }

  const rawBody = data.dataParts
    .map(part => part.urlencode ? encodeDataUrlencode(part.value) : part.value)
    .join("&");

  const hasData = data.dataParts.length > 0;

  /* -G moves the data onto the query string */
  if (data.asQuery && hasData) {
    data.url += (data.url.includes("?") ? "&" : "?") + rawBody;
  }

  const result = {
    method: "",
    url: data.url,
    headers: { ...data.headers },
    query: [],
    body: null,
    insecure: data.insecure,
    compressed: data.compressed,
    followRedirects: data.followRedirects,
    warnings: data.warnings
  };

  /* split the query string out so generators can show it separately */
  const questionMark = result.url.indexOf("?");

  if (questionMark !== -1) {

    result.base = result.url.slice(0, questionMark);

    const search = result.url.slice(questionMark + 1);

    for (const pair of search.split("&")) {

      if (!pair) continue;

      const [key, value] = splitPair(pair);

      result.query.push([safeDecode(key), safeDecode(value)]);
    }

  } else {
    result.base = result.url;
  }

  /* authentication */
  if (data.auth) {
    result.headers["Authorization"] = "Basic " + b64(data.auth.user + ":" + data.auth.pass);
    result.basic = data.auth;
  }

  if (data.bearer) {
    result.headers["Authorization"] = "Bearer " + data.bearer;
  }

  /* body */
  if (data.formParts.length) {

    result.body = { kind: "multipart", parts: data.formParts };

    /* the boundary is generated by the HTTP client, so drop any pasted one */
    for (const name of Object.keys(result.headers)) {
      if (name.toLowerCase() === "content-type" && /multipart\/form-data/i.test(result.headers[name])) {
        delete result.headers[name];
      }
    }

  } else if (hasData && !data.asQuery) {

    const contentType = headerValue(result.headers, "content-type") || "";

    let kind = "raw";
    let json = null;

    if (/json/i.test(contentType) || (!contentType && looksLikeJson(rawBody))) {

      try {
        json = JSON.parse(rawBody);
        kind = "json";
      } catch {
        kind = "raw";
      }

    } else if (/x-www-form-urlencoded/i.test(contentType) || (!contentType && looksLikeFormPairs(rawBody))) {
      kind = "form";
    }

    result.body = {
      kind,
      raw: rawBody,
      json,
      pairs: kind === "form"
        ? rawBody.split("&").filter(Boolean).map(pair => {
            const [key, value] = splitPair(pair);
            return [safeDecode(key), safeDecode(value)];
          })
        : []
    };

    /* curl sends this content type by default for -d */
    if (kind === "form" && !contentType) {
      result.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
  }

  /* method defaults, mirroring curl's own rules */
  result.method = data.method || (result.body && !data.asQuery ? "POST" : "GET");

  if (data.asQuery && !data.method) result.method = "GET";

>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
  return result;
}


<<<<<<< HEAD
=======
function encodeDataUrlencode(value) {

  /* --data-urlencode accepts name=value, =value and plain content */
  if (value.startsWith("=")) return encodeURIComponent(value.slice(1));

  const at = value.indexOf("=");

  if (at === -1) return encodeURIComponent(value);

  return value.slice(0, at) + "=" + encodeURIComponent(value.slice(at + 1));
}


function safeDecode(value) {

  try {
    return decodeURIComponent(String(value).replace(/\+/g, " "));
  } catch {
    return value;
  }
}


function looksLikeJson(text) {
  return /^\s*[[{]/.test(text);
}


function looksLikeFormPairs(text) {
  return /^[^=&\s]+=[^&]*(?:&[^=&\s]+=[^&]*)*$/.test(text);
}


function headerValue(headers, name) {

  const key = Object.keys(headers).find(header => header.toLowerCase() === name.toLowerCase());

  return key ? headers[key] : null;
}


>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
function hasHeaders(data) {
  return Object.keys(data.headers).length > 0;
}


<<<<<<< HEAD
function esc(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
=======
function b64(text) {

  const bytes = new TextEncoder().encode(text);

  let binary = "";

  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary);
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
}


/*
<<<<<<< HEAD
---------------------------------------------------
Generators
---------------------------------------------------
=======
============================================================
Code generators

Each generator takes the normalised object from parseCurl()
and returns a runnable snippet. They deliberately include
error handling — copied code that silently swallows a 500 is
worse than no code at all.
============================================================
*/

/* JSON-style escaping is valid for JS, Python, Go, Java, C# and Ruby literals */
function q(value) {
  return JSON.stringify(String(value));
}


function phpStr(value) {
  return "'" + String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
}


function indent(text, pad) {
  return text.split("\n").map(line => (line ? pad + line : line)).join("\n");
}


/* JSON value -> JavaScript object literal */
function toJs(value, pad) {

  pad = pad || "";

  if (value === null) return "null";

  if (Array.isArray(value)) {

    if (!value.length) return "[]";

    return "[\n" +
      value.map(item => pad + "  " + toJs(item, pad + "  ")).join(",\n") +
      "\n" + pad + "]";
  }

  if (typeof value === "object") {

    const keys = Object.keys(value);

    if (!keys.length) return "{}";

    return "{\n" +
      keys.map(key => pad + "  " + safeJsKey(key) + ": " + toJs(value[key], pad + "  ")).join(",\n") +
      "\n" + pad + "}";
  }

  return JSON.stringify(value);
}


function safeJsKey(key) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}


/* JSON value -> Python literal */
function toPython(value, pad) {

  pad = pad || "";

  if (value === null) return "None";
  if (value === true) return "True";
  if (value === false) return "False";

  if (Array.isArray(value)) {

    if (!value.length) return "[]";

    return "[\n" +
      value.map(item => pad + "    " + toPython(item, pad + "    ")).join(",\n") +
      "\n" + pad + "]";
  }

  if (typeof value === "object") {

    const keys = Object.keys(value);

    if (!keys.length) return "{}";

    return "{\n" +
      keys.map(key => pad + "    " + q(key) + ": " + toPython(value[key], pad + "    ")).join(",\n") +
      "\n" + pad + "}";
  }

  return JSON.stringify(value);
}


function jsonText(data) {
  return JSON.stringify(data.body.json, null, 2);
}


function bodyText(data) {
  return data.body.kind === "json" ? jsonText(data) : data.body.raw;
}


/* for languages that embed the body as an escaped one-line literal,
   pretty-printed JSON turns into a wall of \n — keep it compact */
function bodyTextCompact(data) {
  return data.body.kind === "json" ? JSON.stringify(data.body.json) : data.body.raw;
}


function isMultipart(data) {
  return !!data.body && data.body.kind === "multipart";
}


function headerLines(data, format, join) {
  return Object.entries(data.headers).map(format).join(join);
}


/*
------------------------------------------------------------
JavaScript — fetch
------------------------------------------------------------
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
*/

function genFetch(data) {

<<<<<<< HEAD
  const options = [`method: "${data.method}"`];

  if (hasHeaders(data)) {

    const headers = Object.entries(data.headers)
      .map(([k, v]) => `    "${esc(k)}": "${esc(v)}"`)
      .join(",\n");

    options.push(`headers: {\n${headers}\n  }`);
  }

  if (data.body !== null) {
    options.push(`body: ${JSON.stringify(data.body)}`);
  }

  return `const response = await fetch("${esc(data.url)}", {
  ${options.join(",\n  ")}
});

const result = await response.json();

console.log(result);`;
=======
  const lines = [];
  const options = [`method: ${q(data.method)}`];

  if (isMultipart(data)) {

    lines.push("const form = new FormData();");

    for (const part of data.body.parts) {

      if (part.isFile) {
        lines.push(`// pick this file from an <input type="file"> element`);
        lines.push(`form.append(${q(part.name)}, fileInput.files[0], ${q(part.value.split(/[\\/]/).pop())});`);
      } else {
        lines.push(`form.append(${q(part.name)}, ${q(part.value)});`);
      }
    }

    lines.push("");
  }

  if (hasHeaders(data)) {
    options.push("headers: {\n" + headerLines(data, ([k, v]) => `    ${q(k)}: ${q(v)}`, ",\n") + "\n  }");
  }

  if (data.body) {

    if (data.body.kind === "json") {
      options.push("body: JSON.stringify(" + indent(toJs(data.body.json, "  "), "").replace(/^\s+/, "") + ")");
    } else if (data.body.kind === "form") {
      options.push("body: new URLSearchParams({\n" +
        data.body.pairs.map(([k, v]) => `    ${q(k)}: ${q(v)}`).join(",\n") + "\n  })");
    } else if (data.body.kind === "multipart") {
      options.push("body: form");
    } else {
      options.push(`body: ${q(data.body.raw)}`);
    }
  }

  lines.push(`const response = await fetch(${q(data.url)}, {`);
  lines.push("  " + options.join(",\n  "));
  lines.push("});");
  lines.push("");
  lines.push("if (!response.ok) {");
  lines.push("  throw new Error(`Request failed with ${response.status} ${response.statusText}`);");
  lines.push("}");
  lines.push("");
  lines.push("const data = await response.json();");
  lines.push("");
  lines.push("console.log(data);");

  return lines.join("\n");
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
}


function genNode(data) {

<<<<<<< HEAD
  return `// Node.js 18+ (global fetch)

async function main() {

${genFetch(data).split("\n").map(l => l ? "  " + l : l).join("\n")}
}

main().catch(console.error);`;
=======
  const header = [
    "// Node.js 18 or newer — fetch is built in, no packages needed.",
    "// On Node 16 and older, install undici and add:",
    "//   import { fetch, FormData } from 'undici';",
    "",
    ""
  ].join("\n");

  return header +
    "async function main() {\n\n" +
    indent(genFetch(data), "  ") +
    "\n}\n\nmain().catch(error => {\n  console.error(error);\n  process.exitCode = 1;\n});";
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
}


function genAxios(data) {

<<<<<<< HEAD
  const config = [
    `method: "${data.method.toLowerCase()}"`,
    `url: "${esc(data.url)}"`
  ];

  if (hasHeaders(data)) {

    const headers = Object.entries(data.headers)
      .map(([k, v]) => `    "${esc(k)}": "${esc(v)}"`)
      .join(",\n");

    config.push(`headers: {\n${headers}\n  }`);
  }

  if (data.body !== null) {
    config.push(`data: ${JSON.stringify(data.body)}`);
  }

  return `const axios = require("axios");

async function main() {

  const response = await axios({
    ${config.join(",\n    ")}
  });

  console.log(response.data);
}

main().catch(console.error);`;
}


function genPython(data) {

  const lines = ["import requests", "", `url = ${JSON.stringify(data.url)}`];

  if (hasHeaders(data)) {

    lines.push("", "headers = {");

    for (const [k, v] of Object.entries(data.headers)) {
      lines.push(`    ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
    }

    lines.push("}");
  }

  if (data.body !== null) {
    lines.push("", `payload = ${JSON.stringify(data.body)}`);
  }

  const args = ["url"];

  if (hasHeaders(data)) args.push("headers=headers");
  if (data.body !== null) args.push("data=payload");

  lines.push("");
  lines.push(`response = requests.${data.method.toLowerCase()}(${args.join(", ")})`);
=======
  const lines = ['import axios from "axios";', ""];
  const config = [`method: ${q(data.method.toLowerCase())}`, `url: ${q(data.url)}`];

  if (isMultipart(data)) {

    lines.push("const form = new FormData();");

    for (const part of data.body.parts) {
      lines.push(part.isFile
        ? `form.append(${q(part.name)}, fileInput.files[0]);`
        : `form.append(${q(part.name)}, ${q(part.value)});`);
    }

    lines.push("");
  }

  if (hasHeaders(data)) {
    config.push("headers: {\n" + headerLines(data, ([k, v]) => `      ${q(k)}: ${q(v)}`, ",\n") + "\n    }");
  }

  if (data.body) {

    if (data.body.kind === "json") {
      config.push("data: " + toJs(data.body.json, "    "));
    } else if (data.body.kind === "form") {
      config.push("data: new URLSearchParams({\n" +
        data.body.pairs.map(([k, v]) => `      ${q(k)}: ${q(v)}`).join(",\n") + "\n    })");
    } else if (data.body.kind === "multipart") {
      config.push("data: form");
    } else {
      config.push(`data: ${q(data.body.raw)}`);
    }
  }

  lines.push("try {");
  lines.push("");
  lines.push("  const response = await axios({");
  lines.push("    " + config.join(",\n    "));
  lines.push("  });");
  lines.push("");
  lines.push("  console.log(response.data);");
  lines.push("");
  lines.push("} catch (error) {");
  lines.push("  // axios throws on any non-2xx status");
  lines.push("  console.error(error.response?.status, error.response?.data ?? error.message);");
  lines.push("}");

  return lines.join("\n");
}


/*
------------------------------------------------------------
Python — requests
------------------------------------------------------------
*/

function genPython(data) {

  const lines = ["import requests", ""];
  const args = ["url", "headers=headers"];

  lines.push(`url = ${q(data.url)}`);
  lines.push("");

  lines.push("headers = " + (hasHeaders(data)
    ? "{\n" + headerLines(data, ([k, v]) => `    ${q(k)}: ${q(v)}`, ",\n") + "\n}"
    : "{}"));

  lines.push("");

  if (data.body) {

    if (data.body.kind === "json") {
      lines.push("payload = " + toPython(data.body.json, ""));
      lines.push("");
      args.push("json=payload");
    } else if (data.body.kind === "form") {
      lines.push("payload = {\n" + data.body.pairs.map(([k, v]) => `    ${q(k)}: ${q(v)}`).join(",\n") + "\n}");
      lines.push("");
      args.push("data=payload");
    } else if (data.body.kind === "multipart") {

      const fields = data.body.parts.filter(part => !part.isFile);
      const files = data.body.parts.filter(part => part.isFile);

      if (fields.length) {
        lines.push("payload = {\n" + fields.map(part => `    ${q(part.name)}: ${q(part.value)}`).join(",\n") + "\n}");
        lines.push("");
        args.push("data=payload");
      }

      if (files.length) {
        lines.push("files = {\n" + files.map(part =>
          `    ${q(part.name)}: (${q(part.value.split(/[\\/]/).pop())}, open(${q(part.value)}, "rb")${part.type ? ", " + q(part.type) : ""})`
        ).join(",\n") + "\n}");
        lines.push("");
        args.push("files=files");
      }

    } else {
      lines.push(`payload = ${q(data.body.raw)}`);
      lines.push("");
      args.push("data=payload");
    }
  }

  args.push("timeout=30");

  if (data.insecure) args.push("verify=False");

  lines.push(`response = requests.${data.method.toLowerCase() === "delete" ? "delete" : data.method.toLowerCase()}(${args.join(", ")})`);
  lines.push("");
  lines.push("response.raise_for_status()");
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
  lines.push("");
  lines.push("print(response.status_code)");
  lines.push("print(response.json())");

  return lines.join("\n");
}


<<<<<<< HEAD
function genGo(data) {

=======
/*
------------------------------------------------------------
Go — net/http
------------------------------------------------------------
*/

function genGo(data) {

  const imports = new Set(['"fmt"', '"io"', '"net/http"', '"time"']);
  const setup = [];

  let bodyArg = "nil";

  if (isMultipart(data)) {

    imports.add('"bytes"');
    imports.add('"mime/multipart"');
    imports.add('"os"');

    setup.push("var buf bytes.Buffer");
    setup.push("writer := multipart.NewWriter(&buf)");
    setup.push("");

    for (const part of data.body.parts) {

      if (part.isFile) {
        setup.push(`file, err := os.Open(${q(part.value)})`);
        setup.push("if err != nil {");
        setup.push("\tpanic(err)");
        setup.push("}");
        setup.push(`part, err := writer.CreateFormFile(${q(part.name)}, ${q(part.value.split(/[\\/]/).pop())})`);
        setup.push("if err != nil {");
        setup.push("\tpanic(err)");
        setup.push("}");
        setup.push("io.Copy(part, file)");
        setup.push("file.Close()");
      } else {
        setup.push(`writer.WriteField(${q(part.name)}, ${q(part.value)})`);
      }
    }

    setup.push("writer.Close()");
    setup.push("");
    bodyArg = "&buf";

  } else if (data.body) {

    imports.add('"strings"');

    const text = bodyText(data);

    setup.push("payload := strings.NewReader(" +
      (text.includes("`") ? q(text) : "`" + text + "`") + ")");
    setup.push("");
    bodyArg = "payload";
  }

>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
  const lines = [
    "package main",
    "",
    "import (",
<<<<<<< HEAD
    '\t"fmt"',
    '\t"io"',
    data.body !== null ? '\t"strings"' : null,
    '\t"net/http"',
=======
    ...[...imports].sort().map(name => "\t" + name),
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
    ")",
    "",
    "func main() {",
    ""
<<<<<<< HEAD
  ].filter(l => l !== null);

  if (data.body !== null) {
    lines.push(`\tpayload := strings.NewReader(${JSON.stringify(data.body)})`);
    lines.push("");
    lines.push(`\treq, err := http.NewRequest("${data.method}", ${JSON.stringify(data.url)}, payload)`);
  } else {
    lines.push(`\treq, err := http.NewRequest("${data.method}", ${JSON.stringify(data.url)}, nil)`);
  }

  lines.push("\tif err != nil {", "\t\tpanic(err)", "\t}", "");

  for (const [k, v] of Object.entries(data.headers)) {
    lines.push(`\treq.Header.Set(${JSON.stringify(k)}, ${JSON.stringify(v)})`);
  }

  if (hasHeaders(data)) lines.push("");

  lines.push(
    "\tres, err := http.DefaultClient.Do(req)",
    "\tif err != nil {",
    "\t\tpanic(err)",
    "\t}",
    "\tdefer res.Body.Close()",
    "",
    "\tbody, _ := io.ReadAll(res.Body)",
    "",
    "\tfmt.Println(res.Status)",
    "\tfmt.Println(string(body))",
    "}"
  );
=======
  ];

  for (const line of setup) lines.push(line ? "\t" + line : "");

  lines.push(`\treq, err := http.NewRequest(${q(data.method)}, ${q(data.url)}, ${bodyArg})`);
  lines.push("\tif err != nil {");
  lines.push("\t\tpanic(err)");
  lines.push("\t}");
  lines.push("");

  for (const [key, value] of Object.entries(data.headers)) {
    lines.push(`\treq.Header.Set(${q(key)}, ${q(value)})`);
  }

  if (isMultipart(data)) {
    lines.push('\treq.Header.Set("Content-Type", writer.FormDataContentType())');
  }

  if (Object.keys(data.headers).length || isMultipart(data)) lines.push("");

  lines.push("\tclient := &http.Client{Timeout: 30 * time.Second}");
  lines.push("");
  lines.push("\tres, err := client.Do(req)");
  lines.push("\tif err != nil {");
  lines.push("\t\tpanic(err)");
  lines.push("\t}");
  lines.push("\tdefer res.Body.Close()");
  lines.push("");
  lines.push("\tbody, err := io.ReadAll(res.Body)");
  lines.push("\tif err != nil {");
  lines.push("\t\tpanic(err)");
  lines.push("\t}");
  lines.push("");
  lines.push("\tfmt.Println(res.Status)");
  lines.push("\tfmt.Println(string(body))");
  lines.push("}");
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)

  return lines.join("\n");
}


<<<<<<< HEAD
=======
/*
------------------------------------------------------------
Java — java.net.http (JDK 11+)
------------------------------------------------------------
*/

>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
function genJava(data) {

  const lines = [
    "import java.net.URI;",
    "import java.net.http.HttpClient;",
    "import java.net.http.HttpRequest;",
    "import java.net.http.HttpResponse;",
<<<<<<< HEAD
    "",
    "public class Main {",
    "",
    "    public static void main(String[] args) throws Exception {",
    "",
    "        HttpClient client = HttpClient.newHttpClient();",
    "",
    "        HttpRequest request = HttpRequest.newBuilder()",
    `                .uri(URI.create(${JSON.stringify(data.url)}))`
  ];

  for (const [k, v] of Object.entries(data.headers)) {
    lines.push(`                .header(${JSON.stringify(k)}, ${JSON.stringify(v)})`);
  }

  if (data.body !== null) {
    lines.push(`                .method(${JSON.stringify(data.method)}, HttpRequest.BodyPublishers.ofString(${JSON.stringify(data.body)}))`);
  } else {
    lines.push(`                .method(${JSON.stringify(data.method)}, HttpRequest.BodyPublishers.noBody())`);
  }

  lines.push(
    "                .build();",
    "",
    "        HttpResponse<String> response =",
    "                client.send(request, HttpResponse.BodyHandlers.ofString());",
    "",
    "        System.out.println(response.statusCode());",
    "        System.out.println(response.body());",
    "    }",
    "}"
  );
=======
    "import java.time.Duration;",
    ""
  ];

  let publisher = "HttpRequest.BodyPublishers.noBody()";
  const pre = [];

  if (isMultipart(data)) {

    const boundary = "----curl2codeBoundary";

    pre.push(`String boundary = ${q(boundary)};`);
    pre.push("StringBuilder form = new StringBuilder();");

    for (const part of data.body.parts) {

      if (part.isFile) {
        pre.push('// Reading files needs binary parts; see the note under the tool for a Files.readAllBytes() variant.');
      }

      pre.push(`form.append("--").append(boundary).append("\\r\\n")`);
      pre.push(`    .append("Content-Disposition: form-data; name=\\"${part.name}\\"\\r\\n\\r\\n")`);
      pre.push(`    .append(${q(part.value)}).append("\\r\\n");`);
    }

    pre.push('form.append("--").append(boundary).append("--\\r\\n");');
    pre.push("");
    publisher = "HttpRequest.BodyPublishers.ofString(form.toString())";

  } else if (data.body) {

    const text = bodyText(data);

    /* a text block interprets \n and \" — only safe when the body has neither */
    if (/[\\]|"""/.test(text)) {

      pre.push("String payload = " + q(text) + ";");

    } else {

      pre.push('String payload = """');

      for (const line of text.split("\n")) pre.push("    " + line);

      pre.push('    """;');
    }

    pre.push("");
    publisher = "HttpRequest.BodyPublishers.ofString(payload)";
  }

  lines.push("public class Main {");
  lines.push("");
  lines.push("    public static void main(String[] args) throws Exception {");
  lines.push("");

  for (const line of pre) lines.push(line ? "        " + line : "");

  lines.push("        HttpClient client = HttpClient.newBuilder()");
  lines.push("            .connectTimeout(Duration.ofSeconds(30))");
  lines.push(data.followRedirects
    ? "            .followRedirects(HttpClient.Redirect.NORMAL)"
    : "            .followRedirects(HttpClient.Redirect.NEVER)");
  lines.push("            .build();");
  lines.push("");
  lines.push("        HttpRequest request = HttpRequest.newBuilder()");
  lines.push(`            .uri(URI.create(${q(data.url)}))`);

  for (const [key, value] of Object.entries(data.headers)) {
    lines.push(`            .header(${q(key)}, ${q(value)})`);
  }

  if (isMultipart(data)) {
    lines.push('            .header("Content-Type", "multipart/form-data; boundary=" + boundary)');
  }

  lines.push(`            .method(${q(data.method)}, ${publisher})`);
  lines.push("            .build();");
  lines.push("");
  lines.push("        HttpResponse<String> response =");
  lines.push("            client.send(request, HttpResponse.BodyHandlers.ofString());");
  lines.push("");
  lines.push("        System.out.println(response.statusCode());");
  lines.push("        System.out.println(response.body());");
  lines.push("    }");
  lines.push("}");
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)

  return lines.join("\n");
}


<<<<<<< HEAD
function phpString(value) {
  return "'" + String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
}

=======
/*
------------------------------------------------------------
PHP — cURL extension
------------------------------------------------------------
*/
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)

function genPhp(data) {

  const lines = ["<?php", "", "$ch = curl_init();", ""];
<<<<<<< HEAD

  lines.push(`curl_setopt($ch, CURLOPT_URL, ${phpString(data.url)});`);
  lines.push("curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);");
  lines.push(`curl_setopt($ch, CURLOPT_CUSTOMREQUEST, ${phpString(data.method)});`);

  if (hasHeaders(data)) {

    lines.push("");
    lines.push("curl_setopt($ch, CURLOPT_HTTPHEADER, [");

    for (const [k, v] of Object.entries(data.headers)) {
      lines.push(`    ${phpString(k + ": " + v)},`);
    }

    lines.push("]);");
  }

  if (data.body !== null) {
    lines.push("");
    lines.push(`curl_setopt($ch, CURLOPT_POSTFIELDS, ${phpString(data.body)});`);
  }

  lines.push(
    "",
    "$response = curl_exec($ch);",
    "$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);",
    "",
    "curl_close($ch);",
    "",
    "echo $status . PHP_EOL;",
    "echo $response . PHP_EOL;"
  );
=======
  const options = [
    `CURLOPT_URL => ${phpStr(data.url)}`,
    "CURLOPT_RETURNTRANSFER => true",
    "CURLOPT_TIMEOUT => 30",
    `CURLOPT_CUSTOMREQUEST => ${phpStr(data.method)}`
  ];

  if (data.followRedirects) options.push("CURLOPT_FOLLOWLOCATION => true");
  if (data.insecure) options.push("CURLOPT_SSL_VERIFYPEER => false");

  if (hasHeaders(data)) {
    options.push("CURLOPT_HTTPHEADER => [\n" +
      headerLines(data, ([k, v]) => "        " + phpStr(k + ": " + v), ",\n") + "\n    ]");
  }

  if (isMultipart(data)) {
    options.push("CURLOPT_POSTFIELDS => [\n" +
      data.body.parts.map(part => "        " + phpStr(part.name) + " => " +
        (part.isFile ? "new CURLFile(" + phpStr(part.value) + ")" : phpStr(part.value))).join(",\n") +
      "\n    ]");
  } else if (data.body) {
    options.push("CURLOPT_POSTFIELDS => " + phpStr(bodyText(data)));
  }

  lines.push("curl_setopt_array($ch, [");
  lines.push("    " + options.join(",\n    "));
  lines.push("]);");
  lines.push("");
  lines.push("$response = curl_exec($ch);");
  lines.push("$status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);");
  lines.push("");
  lines.push("if ($response === false) {");
  lines.push("    throw new RuntimeException(curl_error($ch));");
  lines.push("}");
  lines.push("");
  lines.push("curl_close($ch);");
  lines.push("");
  lines.push("echo $status . PHP_EOL;");
  lines.push("echo $response . PHP_EOL;");
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)

  return lines.join("\n");
}


<<<<<<< HEAD
=======
/*
------------------------------------------------------------
C# — HttpClient
------------------------------------------------------------
*/

>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
function genCsharp(data) {

  const lines = [
    "using System;",
    "using System.Net.Http;",
<<<<<<< HEAD
    "using System.Text;",
    "using System.Threading.Tasks;",
    "",
    "class Program",
    "{",
    "    static async Task Main()",
    "    {",
    "        using var client = new HttpClient();",
    "",
    `        var request = new HttpRequestMessage(new HttpMethod("${data.method}"), ${JSON.stringify(data.url)});`
  ];

  const contentType = Object.entries(data.headers)
    .find(([k]) => k.toLowerCase() === "content-type");

  for (const [k, v] of Object.entries(data.headers)) {

    if (k.toLowerCase() === "content-type") continue;

    lines.push(`        request.Headers.TryAddWithoutValidation(${JSON.stringify(k)}, ${JSON.stringify(v)});`);
  }

  if (data.body !== null) {

    lines.push("");
    lines.push(
      `        request.Content = new StringContent(${JSON.stringify(data.body)}, Encoding.UTF8, ${JSON.stringify(contentType ? contentType[1].split(";")[0] : "application/json")});`
    );
  }

  lines.push(
    "",
    "        var response = await client.SendAsync(request);",
    "        var body = await response.Content.ReadAsStringAsync();",
    "",
    "        Console.WriteLine((int)response.StatusCode);",
    "        Console.WriteLine(body);",
    "    }",
    "}"
  );
=======
    "using System.Threading.Tasks;",
    ""
  ];

  const setup = [];

  lines.push("class Program");
  lines.push("{");
  lines.push("    static async Task Main()");
  lines.push("    {");
  lines.push("        using var client = new HttpClient();");
  lines.push("        client.Timeout = TimeSpan.FromSeconds(30);");
  lines.push("");
  lines.push(`        var request = new HttpRequestMessage(new HttpMethod(${q(data.method)}), ${q(data.url)});`);
  lines.push("");

  for (const [key, value] of Object.entries(data.headers)) {

    if (/^content-/i.test(key)) continue;

    lines.push(`        request.Headers.TryAddWithoutValidation(${q(key)}, ${q(value)});`);
  }

  const contentType = headerValue(data.headers, "content-type");

  if (isMultipart(data)) {

    lines.push("");
    lines.push("        var form = new MultipartFormDataContent();");

    for (const part of data.body.parts) {
      lines.push(part.isFile
        ? `        form.Add(new ByteArrayContent(System.IO.File.ReadAllBytes(${q(part.value)})), ${q(part.name)}, ${q(part.value.split(/[\\/]/).pop())});`
        : `        form.Add(new StringContent(${q(part.value)}), ${q(part.name)});`);
    }

    lines.push("        request.Content = form;");

  } else if (data.body) {

    lines.push("");
    lines.push(`        request.Content = new StringContent(${q(bodyTextCompact(data))}, System.Text.Encoding.UTF8, ${q(contentType ? contentType.split(";")[0] : "text/plain")});`);
  }

  lines.push("");
  lines.push("        var response = await client.SendAsync(request);");
  lines.push("        var body = await response.Content.ReadAsStringAsync();");
  lines.push("");
  lines.push("        Console.WriteLine((int)response.StatusCode);");
  lines.push("        Console.WriteLine(body);");
  lines.push("");
  lines.push("        response.EnsureSuccessStatusCode();");
  lines.push("    }");
  lines.push("}");
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)

  return lines.join("\n");
}


<<<<<<< HEAD
function rubyString(value) {
  return JSON.stringify(value);
}

=======
/*
------------------------------------------------------------
Ruby — Net::HTTP
------------------------------------------------------------
*/
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)

function genRuby(data) {

  const lines = [
    'require "uri"',
    'require "net/http"',
    'require "json"',
    "",
<<<<<<< HEAD
    `url = URI(${rubyString(data.url)})`,
    "",
    "http = Net::HTTP.new(url.host, url.port)",
    'http.use_ssl = url.scheme == "https"',
    ""
  ];

  const klass = {
=======
    `url = URI(${q(data.url)})`,
    "",
    "http = Net::HTTP.new(url.host, url.port)",
    'http.use_ssl = url.scheme == "https"',
    "http.read_timeout = 30"
  ];

  if (data.insecure) {
    lines.push("http.verify_mode = OpenSSL::SSL::VERIFY_NONE");
  }

  lines.push("");

  const methodClass = {
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
    GET: "Get", POST: "Post", PUT: "Put", PATCH: "Patch",
    DELETE: "Delete", HEAD: "Head", OPTIONS: "Options"
  }[data.method];

<<<<<<< HEAD
  if (klass) {
    lines.push(`request = Net::HTTP::${klass}.new(url)`);
  } else {
    lines.push(`request = Net::HTTPGenericRequest.new(${rubyString(data.method)}, true, true, url)`);
  }

  for (const [k, v] of Object.entries(data.headers)) {
    lines.push(`request[${rubyString(k)}] = ${rubyString(v)}`);
  }

  if (data.body !== null) {
    lines.push("");
    lines.push(`request.body = ${rubyString(data.body)}`);
  }

  lines.push(
    "",
    "response = http.request(request)",
    "",
    "puts response.code",
    "puts response.read_body"
  );
=======
  if (methodClass) {
    lines.push(`request = Net::HTTP::${methodClass}.new(url)`);
  } else {
    lines.push(`request = Net::HTTPGenericRequest.new(${q(data.method)}, true, true, url)`);
  }

  lines.push("");

  for (const [key, value] of Object.entries(data.headers)) {
    lines.push(`request[${q(key)}] = ${q(value)}`);
  }

  if (isMultipart(data)) {

    lines.push("");
    lines.push("request.set_form([");

    for (const part of data.body.parts) {
      lines.push(part.isFile
        ? `  [${q(part.name)}, File.open(${q(part.value)})]`
        : `  [${q(part.name)}, ${q(part.value)}]`);
    }

    lines.push('], "multipart/form-data")');

  } else if (data.body) {
    lines.push("");
    lines.push(`request.body = ${q(bodyTextCompact(data))}`);
  }

  lines.push("");
  lines.push("response = http.request(request)");
  lines.push("");
  lines.push("puts response.code");
  lines.push("puts response.read_body");
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)

  return lines.join("\n");
}


/*
<<<<<<< HEAD
---------------------------------------------------
Register one tool per target language
---------------------------------------------------
*/

const CURL_TARGETS = [
  ["curl-javascript", "cURL → JavaScript", "Browser-ready fetch() call with async/await and JSON parsing.", genFetch],
  ["curl-python",     "cURL → Python",     "Python 3 script using the requests library.",                     genPython],
  ["curl-axios",      "cURL → Axios",      "Axios request config for Node or the browser.",                   genAxios],
  ["curl-go",         "cURL → Go",         "Idiomatic Go using net/http with error handling.",                 genGo],
  ["curl-java",       "cURL → Java",       "Java 11+ java.net.http HttpClient, no dependencies.",              genJava],
  ["curl-php",        "cURL → PHP",        "PHP using the built-in cURL extension.",                           genPhp],
  ["curl-csharp",     "cURL → C#",         "C# HttpClient with an async Main method.",                         genCsharp],
  ["curl-ruby",       "cURL → Ruby",       "Ruby standard library Net::HTTP, TLS aware.",                      genRuby],
  ["curl-node",       "cURL → Node.js",    "Node 18+ using global fetch — no packages required.",              genNode]
];


for (const [id, name, desc, generator] of CURL_TARGETS) {

  Tools.add({
    id,
    cat: "cURL",
    name,
    desc,
    outputLabel: "Generated code",
    example: { curl: CURL_EXAMPLE },
    inputs: [
      {
        key: "curl",
        label: "cURL command",
        type: "textarea",
        tall: true,
        placeholder: "curl https://api.example.com ..."
      }
    ],
    run(v) {

      if (!v.curl.trim()) return { note: "Paste a cURL command first." };

      return generator(parseCurl(v.curl));
    }
  });
}
=======
============================================================
Tool registration
============================================================
*/

const CURL_LANGUAGES = [
  { id: "javascript", label: "JavaScript (fetch)", gen: genFetch },
  { id: "node",       label: "Node.js (fetch)",    gen: genNode },
  { id: "axios",      label: "Axios",              gen: genAxios },
  { id: "python",     label: "Python (requests)",  gen: genPython },
  { id: "go",         label: "Go (net/http)",      gen: genGo },
  { id: "java",       label: "Java (HttpClient)",  gen: genJava },
  { id: "php",        label: "PHP (cURL)",         gen: genPhp },
  { id: "csharp",     label: "C# (HttpClient)",    gen: genCsharp },
  { id: "ruby",       label: "Ruby (Net::HTTP)",   gen: genRuby }
];


Tools.add({

  id: "curl-to-code",
  cat: "cURL",
  name: "cURL → Code Converter",
  desc: "Paste a cURL command and get a runnable request in nine languages.",
  outputLabel: "Generated code",
  example: { curl: CURL_EXAMPLE },

  inputs: [
    {
      key: "lang",
      label: "Target language",
      type: "select",
      options: CURL_LANGUAGES.map(language => ({ value: language.id, label: language.label }))
    },
    {
      key: "curl",
      label: "cURL command",
      type: "textarea",
      tall: true,
      placeholder: "curl https://api.example.com/v1/users -H 'Authorization: Bearer ...'",
      hint: "Parsed in your browser. Nothing — including tokens — is uploaded."
    }
  ],

  run(values) {

    if (!values.curl.trim()) {
      return { note: "Paste a cURL command to see the generated code." };
    }

    const language = CURL_LANGUAGES.find(item => item.id === values.lang) || CURL_LANGUAGES[0];
    const parsed = parseCurl(values.curl);

    return {
      code: language.gen(parsed),
      lang: language.id,
      notes: parsed.warnings
    };
  }
});
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
