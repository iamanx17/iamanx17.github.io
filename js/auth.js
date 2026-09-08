/*
---------------------------------------------------
Auth tools
---------------------------------------------------
*/

const JWT_EXAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFtYW4iLCJhZG1pbiI6dHJ1ZSwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9." +
  "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";


function base64UrlDecode(value) {

  let text = value.replace(/-/g, "+").replace(/_/g, "/");

  while (text.length % 4) text += "=";

  const binary = atob(text);

  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}


function base64Encode(text) {

  const bytes = new TextEncoder().encode(text);

  let binary = "";

  bytes.forEach(byte => { binary += String.fromCharCode(byte); });

  return btoa(binary);
}


function base64Decode(text) {

  const clean = text.trim().replace(/\s+/g, "");

  const binary = atob(clean.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - clean.length % 4) % 4));

  return new TextDecoder().decode(
    Uint8Array.from(binary, char => char.charCodeAt(0))
  );
}


function splitJwt(token) {

  const parts = token.trim().replace(/^Bearer\s+/i, "").split(".");

  if (parts.length < 2) {
    throw new Error("Not a JWT — expected header.payload.signature");
  }

  let header, payload;

  try {
    header = JSON.parse(base64UrlDecode(parts[0]));
  } catch {
    throw new Error("Could not decode the JWT header.");
  }

  try {
    payload = JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    throw new Error("Could not decode the JWT payload.");
  }

  return { header, payload, signature: parts[2] || "" };
}


function formatTimestamp(seconds) {

  const date = new Date(seconds * 1000);

  if (isNaN(date.getTime())) return "invalid";

  return date.toISOString().replace("T", " ").replace(".000Z", " UTC");
}


function humanDelta(seconds) {

  const abs = Math.abs(seconds);

  const days = Math.floor(abs / 86400);
  const hours = Math.floor((abs % 86400) / 3600);
  const minutes = Math.floor((abs % 3600) / 60);

  const parts = [];

  if (days) parts.push(days + "d");
  if (hours) parts.push(hours + "h");
  if (minutes || !parts.length) parts.push(minutes + "m");

  return parts.join(" ");
}


/*
JWT Decoder
*/

Tools.add({
  id: "jwt-decoder",
  cat: "Auth",
  name: "JWT Decoder",
  desc: "Decode the header and payload of a JWT (no signature verification).",
  outputLabel: "Decoded token",
  example: { token: JWT_EXAMPLE },
  inputs: [
    { key: "token", label: "JWT", type: "textarea", tall: true, placeholder: "eyJhbGciOi..." }
  ],
  run(v) {

    if (!v.token.trim()) return { note: "Paste a JWT." };

    const { header, payload, signature } = splitJwt(v.token);

    const claimNotes = {
      iss: "issuer", sub: "subject", aud: "audience",
      exp: "expires at", nbf: "not valid before", iat: "issued at",
      jti: "token id", scope: "scopes", azp: "authorized party"
    };

    const rows = Object.entries(payload).map(([key, value]) => {

      let extra = claimNotes[key] || "";

      if (["exp", "iat", "nbf", "auth_time"].includes(key) && typeof value === "number") {
        extra = (extra ? extra + " — " : "") + formatTimestamp(value);
      }

      return `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(JSON.stringify(value))}</td><td class="muted">${escapeHtml(extra)}</td></tr>`;
    }).join("");

    return {
      html:
        "<h3>Header</h3>" +
        `<pre>${escapeHtml(JSON.stringify(header, null, 2))}</pre>` +
        '<h3 style="margin-top:16px">Payload</h3>' +
        `<pre>${escapeHtml(JSON.stringify(payload, null, 2))}</pre>` +
        '<h3 style="margin-top:16px">Claims</h3>' +
        `<table><tr><th>Claim</th><th>Value</th><th>Note</th></tr>${rows}</table>` +
        '<h3 style="margin-top:16px">Signature</h3>' +
        `<pre>${escapeHtml(signature || "(none)")}</pre>` +
        '<p class="muted">The signature is not verified here — decoding only.</p>'
    };
  }
});


/*
JWT Expiry Checker
*/

Tools.add({
  id: "jwt-expiry",
  cat: "Auth",
  name: "JWT Expiry Checker",
  desc: "Check whether a JWT is expired, not yet valid, or still good.",
  outputLabel: "Expiry status",
  example: { token: JWT_EXAMPLE },
  inputs: [
    { key: "token", label: "JWT", type: "textarea", placeholder: "eyJhbGciOi..." }
  ],
  run(v) {

    if (!v.token.trim()) return { note: "Paste a JWT." };

    const { payload } = splitJwt(v.token);

    const now = Math.floor(Date.now() / 1000);

    const lines = [];

    if (payload.iat !== undefined) {
      lines.push(`<tr><td>iat (issued)</td><td>${formatTimestamp(payload.iat)}</td><td class="muted">${humanDelta(now - payload.iat)} ago</td></tr>`);
    }

    if (payload.nbf !== undefined) {

      const active = now >= payload.nbf;

      lines.push(`<tr><td>nbf (not before)</td><td>${formatTimestamp(payload.nbf)}</td><td class="${active ? "ok" : "warn"}">${active ? "active" : "not valid yet (" + humanDelta(payload.nbf - now) + ")"}</td></tr>`);
    }

    let verdict;

    if (payload.exp === undefined) {

      verdict = '<h3 class="warn">No exp claim — this token does not expire.</h3>';

    } else {

      const remaining = payload.exp - now;

      lines.push(`<tr><td>exp (expires)</td><td>${formatTimestamp(payload.exp)}</td><td class="${remaining > 0 ? "ok" : "error"}">${remaining > 0 ? "in " + humanDelta(remaining) : humanDelta(remaining) + " ago"}</td></tr>`);

      verdict = remaining > 0
        ? `<h3 class="ok">Valid — expires in ${humanDelta(remaining)}</h3>`
        : `<h3 class="error">Expired ${humanDelta(remaining)} ago</h3>`;
    }

    return {
      html:
        verdict +
        `<table><tr><th>Claim</th><th>Time (UTC)</th><th>Status</th></tr>${lines.join("")}</table>` +
        `<p class="muted">Now: ${formatTimestamp(now)}</p>`
    };
  }
});


/*
Base64 Encoder / Decoder
*/

Tools.add({
  id: "base64",
  cat: "Auth",
  name: "Base64 Encoder/Decoder",
  desc: "Encode or decode Base64 and Base64URL text.",
  outputLabel: "Result",
  example: { input: "hello world", mode: "encode" },
  inputs: [
    { key: "input", label: "Text", type: "textarea", tall: true, placeholder: "hello world" },
    {
      key: "mode",
      label: "Mode",
      type: "select",
      options: [
        { value: "encode", label: "Encode" },
        { value: "decode", label: "Decode" }
      ]
    },
    { key: "urlsafe", label: "URL-safe alphabet (encode, no padding)", type: "checkbox" }
  ],
  run(v) {

    if (!v.input) return { note: "Enter some text." };

    if (v.mode === "decode") {

      try {
        return base64Decode(v.input);
      } catch {
        throw new Error("Input is not valid Base64.");
      }
    }

    const encoded = base64Encode(v.input);

    return v.urlsafe
      ? encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
      : encoded;
  }
});


/*
URL Encoder / Decoder
*/

Tools.add({
  id: "url-encoder",
  cat: "Auth",
  name: "URL Encoder/Decoder",
  desc: "Percent-encode or decode text for use in URLs.",
  outputLabel: "Result",
  example: { input: "name=Aman & role=admin/dev?x=1", mode: "encode" },
  inputs: [
    { key: "input", label: "Text", type: "textarea", tall: true, placeholder: "hello world & more" },
    {
      key: "mode",
      label: "Mode",
      type: "select",
      options: [
        { value: "encode", label: "Encode" },
        { value: "decode", label: "Decode" }
      ]
    },
    {
      key: "component",
      label: "Encode as component (escapes & = ? / :)",
      type: "checkbox",
      value: true
    }
  ],
  run(v) {

    if (!v.input) return { note: "Enter some text." };

    try {

      if (v.mode === "decode") {
        return v.component ? decodeURIComponent(v.input) : decodeURI(v.input);
      }

      return v.component ? encodeURIComponent(v.input) : encodeURI(v.input);

    } catch {
      throw new Error("Input contains an invalid percent-encoding sequence.");
    }
  }
});


/*
Basic Auth Generator
*/

Tools.add({
  id: "basic-auth",
  cat: "Auth",
  name: "Basic Auth Generator",
  desc: "Build (or read back) an HTTP Basic Authorization header.",
  outputLabel: "Header",
  example: { user: "admin", pass: "s3cret" },
  inputs: [
    { key: "user", label: "Username", type: "text", placeholder: "admin" },
    { key: "pass", label: "Password", type: "text", placeholder: "s3cret" },
    {
      key: "decode",
      label: "Existing header / Base64 to decode (optional)",
      type: "text",
      placeholder: "Basic YWRtaW46czNjcmV0"
    }
  ],
  run(v) {

    if (v.decode.trim()) {

      const value = v.decode.trim().replace(/^Basic\s+/i, "");

      let decoded;

      try {
        decoded = base64Decode(value);
      } catch {
        throw new Error("That is not valid Base64.");
      }

      const at = decoded.indexOf(":");

      return {
        html:
          "<h3>Decoded</h3>" +
          `<table>
            <tr><th>Username</th><td>${escapeHtml(at === -1 ? decoded : decoded.slice(0, at))}</td></tr>
            <tr><th>Password</th><td>${escapeHtml(at === -1 ? "(none)" : decoded.slice(at + 1))}</td></tr>
          </table>`
      };
    }

    if (!v.user && !v.pass) return { note: "Enter a username and password." };

    const encoded = base64Encode(v.user + ":" + v.pass);

    return `Authorization: Basic ${encoded}

# curl
curl -H 'Authorization: Basic ${encoded}' https://api.example.com

# curl (shorthand)
curl -u '${v.user}:${v.pass}' https://api.example.com`;
  }
});
