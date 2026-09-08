/*
---------------------------------------------------
Webhook tools
---------------------------------------------------
*/

const WEBHOOK_EXAMPLE = JSON.stringify({
  id: "evt_1a2b3c",
  type: "invoice.paid",
  created: 1735689600,
  data: {
    object: {
      id: "in_998",
      amount_paid: 4200,
      currency: "eur",
      customer: { id: "cus_77", email: "aman@example.com" }
    }
  }
});


async function hmacDigest(algorithm, secret, message, encoding) {

  if (!window.crypto || !window.crypto.subtle) {
    throw new Error("Web Crypto is unavailable here — open the page over http://localhost instead of file://");
  }

  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: algorithm },
    false,
    ["sign"]
  );

  const buffer = await crypto.subtle.sign("HMAC", key, encoder.encode(message));

  const bytes = new Uint8Array(buffer);

  if (encoding === "base64") {

    let binary = "";
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });

    return btoa(binary);
  }

  return [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
}


/*
Webhook Payload Formatter
*/

Tools.add({
  id: "webhook-formatter",
  cat: "Webhooks",
  name: "Webhook Payload Formatter",
  desc: "Pretty-print a webhook payload and summarise its event fields.",
  outputLabel: "Formatted payload",
  example: { input: WEBHOOK_EXAMPLE },
  inputs: [
    {
      key: "input",
      label: "Raw payload (JSON, form-encoded, or a JSON string)",
      type: "textarea",
      tall: true,
      placeholder: WEBHOOK_EXAMPLE
    }
  ],
  run(v) {

    const text = v.input.trim();

    if (!text) return "Paste a webhook payload.";

    let data;

    if (text.startsWith("{") || text.startsWith("[")) {

      data = parseJson(text, "payload");

    } else if (text.includes("=")) {

      data = {};

      for (const [k, value] of new URLSearchParams(text).entries()) {

        try {
          data[k] = JSON.parse(value);
        } catch {
          data[k] = value;
        }
      }

    } else {

      throw new Error("Unrecognised payload — expected JSON or form-encoded data.");
    }

    /* unwrap a JSON string that was itself JSON-encoded */
    if (typeof data === "string") data = parseJson(data, "payload");

    const guess = key => data && typeof data === "object" ? data[key] : undefined;

    const summaryFields = [
      ["Event type", guess("type") || guess("event") || guess("event_type") || guess("action")],
      ["Event id", guess("id") || guess("event_id")],
      ["Created", guess("created") || guess("timestamp") || guess("created_at")]
    ].filter(([, value]) => value !== undefined && value !== null);

    const summary = summaryFields.length
      ? "<h3>Summary</h3><table>" +
        summaryFields.map(([label, value]) => {

          let shown = typeof value === "object" ? JSON.stringify(value) : String(value);

          if (label === "Created" && /^\d{9,10}$/.test(shown)) {
            shown += "  (" + new Date(+shown * 1000).toISOString() + ")";
          }

          return `<tr><th>${label}</th><td>${escapeHtml(shown)}</td></tr>`;
        }).join("") + "</table>"
      : "";

    return {
      html:
        summary +
        '<h3 style="margin-top:16px">Payload</h3>' +
        `<pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`
    };
  }
});


/*
Signature Generator (provider styles)
*/

Tools.add({
  id: "webhook-signature",
  cat: "Webhooks",
  name: "Signature Generator",
  desc: "Build a provider-style webhook signature header from a payload and secret.",
  outputLabel: "Signature header",
  example: {
    payload: WEBHOOK_EXAMPLE,
    secret: "whsec_test_secret",
    style: "stripe"
  },
  inputs: [
    { key: "payload", label: "Raw payload (signed exactly as sent)", type: "textarea", tall: true, placeholder: WEBHOOK_EXAMPLE },
    { key: "secret", label: "Signing secret", type: "text", placeholder: "whsec_..." },
    {
      key: "style",
      label: "Provider style",
      type: "select",
      options: [
        { value: "stripe", label: "Stripe (t=…,v1=… over 't.payload')" },
        { value: "github", label: "GitHub (X-Hub-Signature-256: sha256=…)" },
        { value: "shopify", label: "Shopify (base64 HMAC-SHA256)" },
        { value: "plain", label: "Plain hex HMAC-SHA256" }
      ]
    },
    {
      key: "timestamp",
      label: "Timestamp (Stripe only, blank = now)",
      type: "text",
      placeholder: "1735689600"
    }
  ],
  async run(v) {

    if (!v.payload.trim()) return "Paste the payload to sign.";
    if (!v.secret) return "Enter the signing secret.";

    const payload = v.payload;

    if (v.style === "stripe") {

      const timestamp = v.timestamp.trim() || String(Math.floor(Date.now() / 1000));

      const signed = `${timestamp}.${payload}`;
      const signature = await hmacDigest("SHA-256", v.secret, signed, "hex");

      return `Stripe-Signature: t=${timestamp},v1=${signature}

Signed string:
${timestamp}.<raw body>

Verify by recomputing HMAC-SHA256 over "<timestamp>.<raw body>" and
comparing with a constant-time equality check.`;
    }

    if (v.style === "github") {

      const signature = await hmacDigest("SHA-256", v.secret, payload, "hex");

      return `X-Hub-Signature-256: sha256=${signature}`;
    }

    if (v.style === "shopify") {

      const signature = await hmacDigest("SHA-256", v.secret, payload, "base64");

      return `X-Shopify-Hmac-Sha256: ${signature}`;
    }

    return await hmacDigest("SHA-256", v.secret, payload, "hex");
  }
});


/*
HMAC Generator
*/

Tools.add({
  id: "hmac-generator",
  cat: "Webhooks",
  name: "HMAC Generator",
  desc: "Compute an HMAC digest of any message with any supported hash.",
  outputLabel: "Digest",
  example: { message: "hello world", secret: "topsecret" },
  inputs: [
    { key: "message", label: "Message", type: "textarea", tall: true, placeholder: "hello world" },
    { key: "secret", label: "Secret key", type: "text", placeholder: "topsecret" },
    {
      key: "algorithm",
      label: "Hash",
      type: "select",
      options: [
        { value: "SHA-256", label: "SHA-256" },
        { value: "SHA-1", label: "SHA-1" },
        { value: "SHA-384", label: "SHA-384" },
        { value: "SHA-512", label: "SHA-512" }
      ]
    }
  ],
  async run(v) {

    if (!v.message) return "Enter a message.";
    if (!v.secret) return "Enter a secret key.";

    const hex = await hmacDigest(v.algorithm, v.secret, v.message, "hex");
    const base64 = await hmacDigest(v.algorithm, v.secret, v.message, "base64");

    return `hex:    ${hex}

base64: ${base64}

length: ${hex.length / 2} bytes (HMAC-${v.algorithm.replace("-", "")})`;
  }
});


/*
Webhook Tester
*/

Tools.add({
  id: "webhook-tester",
  cat: "Webhooks",
  name: "Webhook Tester",
  desc: "Send a test webhook from the browser and show the response.",
  outputLabel: "Response",
  autoRun: false,
  example: {
    url: "https://webhook.site/your-unique-id",
    payload: WEBHOOK_EXAMPLE,
    headers: "Content-Type: application/json"
  },
  inputs: [
    { key: "url", label: "Target URL", type: "text", placeholder: "https://webhook.site/..." },
    {
      key: "method",
      label: "Method",
      type: "select",
      options: ["POST", "PUT", "PATCH", "GET", "DELETE"]
    },
    {
      key: "headers",
      label: "Headers (one per line)",
      type: "textarea",
      value: "Content-Type: application/json"
    },
    { key: "payload", label: "Payload", type: "textarea", tall: true, placeholder: WEBHOOK_EXAMPLE },
    {
      key: "secret",
      label: "Sign with secret (optional — adds X-Hub-Signature-256)",
      type: "text",
      placeholder: "leave blank to skip",
      hint: "Requests go out from your browser, so CORS rules apply. Press Run to send."
    }
  ],
  async run(v) {

    if (!v.url.trim()) {
      return "Enter a target URL, fill in the payload, then press Run to send.";
    }

    const headers = parseHeaderLines(v.headers);

    const hasBody = !["GET", "HEAD"].includes(v.method);
    const body = hasBody && v.payload.trim() ? v.payload : undefined;

    if (v.secret && body !== undefined) {
      headers["X-Hub-Signature-256"] =
        "sha256=" + await hmacDigest("SHA-256", v.secret, body, "hex");
    }

    const started = performance.now();

    let response;

    try {

      response = await fetch(v.url.trim(), {
        method: v.method,
        headers,
        body
      });

    } catch (error) {

      return {
        html:
          '<h3 class="error">Request failed</h3>' +
          `<p>${escapeHtml(error.message)}</p>` +
          '<p class="muted">Usually this is CORS or an unreachable host. The request may still have arrived at the server even when the browser blocks the response.</p>'
      };
    }

    const elapsed = Math.round(performance.now() - started);

    let text = await response.text();

    try {
      text = JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      /* leave as-is */
    }

    const responseHeaders = [...response.headers.entries()];

    const headerRows = responseHeaders.length
      ? responseHeaders.map(([k, val]) =>
          `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(val)}</td></tr>`
        ).join("")
      : '<tr><td colspan="2" class="muted">No readable headers (CORS-restricted)</td></tr>';

    return {
      html:
        `<h3 class="${statusClass(response.status)}">${response.status} ${escapeHtml(response.statusText || "")}</h3>` +
        `<p class="muted">${elapsed} ms${response.type === "opaque" ? " — opaque response" : ""}</p>` +
        `<table><tr><th>Header</th><th>Value</th></tr>${headerRows}</table>` +
        '<h3 style="margin-top:16px">Body</h3>' +
        `<pre>${escapeHtml(text || "(empty)")}</pre>`
    };
  }
});
