/*
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
    .trim();
}


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
      continue;
    }

    if (token === "-X" || token === "--request") {
      result.method = stripQuotes(tokens[++i]).toUpperCase();
      continue;
    }

    if (token === "--url") {
      result.url = stripQuotes(tokens[++i]);
      continue;
    }

    if (token === "-H" || token === "--header") {

      const header = stripQuotes(tokens[++i]);
      const separator = header.indexOf(":");

      if (separator !== -1) {
        result.headers[header.slice(0, separator).trim()] =
          header.slice(separator + 1).trim();
      }

      continue;
    }

    if (token === "-A" || token === "--user-agent") {
      result.headers["User-Agent"] = stripQuotes(tokens[++i]);
      continue;
    }

    if (token === "-b" || token === "--cookie") {
      result.headers["Cookie"] = stripQuotes(tokens[++i]);
      continue;
    }

    if (token === "-u" || token === "--user") {

      const pair = stripQuotes(tokens[++i]);
      const at = pair.indexOf(":");

      result.auth = {
        user: at === -1 ? pair : pair.slice(0, at),
        pass: at === -1 ? "" : pair.slice(at + 1)
      };

      continue;
    }

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

  return result;
}


function hasHeaders(data) {
  return Object.keys(data.headers).length > 0;
}


function esc(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}


/*
---------------------------------------------------
Generators
---------------------------------------------------
*/

function genFetch(data) {

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
}


function genNode(data) {

  return `// Node.js 18+ (global fetch)

async function main() {

${genFetch(data).split("\n").map(l => l ? "  " + l : l).join("\n")}
}

main().catch(console.error);`;
}


function genAxios(data) {

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
  lines.push("");
  lines.push("print(response.status_code)");
  lines.push("print(response.json())");

  return lines.join("\n");
}


function genGo(data) {

  const lines = [
    "package main",
    "",
    "import (",
    '\t"fmt"',
    '\t"io"',
    data.body !== null ? '\t"strings"' : null,
    '\t"net/http"',
    ")",
    "",
    "func main() {",
    ""
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

  return lines.join("\n");
}


function genJava(data) {

  const lines = [
    "import java.net.URI;",
    "import java.net.http.HttpClient;",
    "import java.net.http.HttpRequest;",
    "import java.net.http.HttpResponse;",
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

  return lines.join("\n");
}


function phpString(value) {
  return "'" + String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
}


function genPhp(data) {

  const lines = ["<?php", "", "$ch = curl_init();", ""];

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

  return lines.join("\n");
}


function genCsharp(data) {

  const lines = [
    "using System;",
    "using System.Net.Http;",
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

  return lines.join("\n");
}


function rubyString(value) {
  return JSON.stringify(value);
}


function genRuby(data) {

  const lines = [
    'require "uri"',
    'require "net/http"',
    'require "json"',
    "",
    `url = URI(${rubyString(data.url)})`,
    "",
    "http = Net::HTTP.new(url.host, url.port)",
    'http.use_ssl = url.scheme == "https"',
    ""
  ];

  const klass = {
    GET: "Get", POST: "Post", PUT: "Put", PATCH: "Patch",
    DELETE: "Delete", HEAD: "Head", OPTIONS: "Options"
  }[data.method];

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

  return lines.join("\n");
}


/*
---------------------------------------------------
Register one tool per target language
---------------------------------------------------
*/

const CURL_TARGETS = [
  ["curl-javascript", "cURL → JavaScript", "Browser fetch() with async/await.", genFetch],
  ["curl-python",     "cURL → Python",     "Python requests library.",          genPython],
  ["curl-axios",      "cURL → Axios",      "Axios request config.",             genAxios],
  ["curl-go",         "cURL → Go",         "Go net/http client.",               genGo],
  ["curl-java",       "cURL → Java",       "Java 11+ java.net.http client.",    genJava],
  ["curl-php",        "cURL → PHP",        "PHP cURL extension.",               genPhp],
  ["curl-csharp",     "cURL → C#",         "C# HttpClient.",                    genCsharp],
  ["curl-ruby",       "cURL → Ruby",       "Ruby Net::HTTP.",                   genRuby],
  ["curl-node",       "cURL → Node.js",    "Node 18+ global fetch.",            genNode]
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

      if (!v.curl.trim()) return "Paste a cURL command first.";

      return generator(parseCurl(v.curl));
    }
  });
}
