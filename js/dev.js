/*
---------------------------------------------------
Everyday utilities

UUIDs, regex matching and timestamp conversion — the
three lookups that otherwise cost a tab and a search.
---------------------------------------------------
*/

/*
UUID Generator
*/

function uuidV4() {

  if (crypto.randomUUID) return crypto.randomUUID();

  const bytes = crypto.getRandomValues(new Uint8Array(16));

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return formatUuid(bytes);
}


/*
UUID v7 (RFC 9562): 48 bits of Unix milliseconds followed by
random bits, so freshly generated ids sort by creation time.
That makes them far friendlier as database primary keys than v4.
*/
function uuidV7() {

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const millis = Date.now();

  bytes[0] = (millis / 2 ** 40) & 0xff;
  bytes[1] = (millis / 2 ** 32) & 0xff;
  bytes[2] = (millis / 2 ** 24) & 0xff;
  bytes[3] = (millis / 2 ** 16) & 0xff;
  bytes[4] = (millis / 2 ** 8) & 0xff;
  bytes[5] = millis & 0xff;

  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return formatUuid(bytes);
}


function formatUuid(bytes) {

  const hex = [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");

  return [
    hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16),
    hex.slice(16, 20), hex.slice(20)
  ].join("-");
}


Tools.add({

  id: "uuid-generator",
  cat: "Utilities",
  name: "UUID Generator",
  desc: "Generate RFC 4122 v4 or time-ordered v7 UUIDs in bulk.",
  outputLabel: "UUIDs",

  inputs: [
    {
      key: "version",
      label: "Version",
      type: "select",
      options: [
        { value: "4", label: "v4 — random" },
        { value: "7", label: "v7 — time-ordered (RFC 9562)" },
        { value: "nil", label: "Nil UUID" }
      ]
    },
    { key: "count", label: "How many", type: "text", value: "10", hint: "1 to 500." },
    { key: "upper", label: "Uppercase", type: "checkbox" },
    { key: "nodash", label: "Remove hyphens", type: "checkbox" }
  ],

  run(values) {

    const count = Math.min(Math.max(parseInt(values.count, 10) || 1, 1), 500);
    const list = [];

    for (let i = 0; i < count; i++) {

      let id = values.version === "nil"
        ? "00000000-0000-0000-0000-000000000000"
        : values.version === "7" ? uuidV7() : uuidV4();

      if (values.nodash) id = id.replace(/-/g, "");
      if (values.upper) id = id.toUpperCase();

      list.push(id);
    }

    return list.join("\n");
  }
});


/*
Regex Tester
*/

Tools.add({

  id: "regex-tester",
  cat: "Utilities",
  name: "Regex Tester",
  desc: "Test a JavaScript regular expression and inspect every match and capture group.",
  outputLabel: "Matches",

  example: {
    pattern: "(\\w+)@(\\w+\\.\\w+)",
    flags: "g",
    text: "Mail ada@example.com or grace@example.org for access."
  },

  inputs: [
    { key: "pattern", label: "Pattern", type: "text", placeholder: "(\\d{4})-(\\d{2})-(\\d{2})" },
    { key: "flags", label: "Flags", type: "text", value: "g", placeholder: "gim", hint: "Any of g i m s u y d." },
    { key: "text", label: "Test string", type: "textarea", tall: true, placeholder: "Text to search…" }
  ],

  run(values) {

    if (!values.pattern) return { note: "Enter a pattern to start matching." };
    if (!values.text) return { note: "Add a test string below the pattern." };

    let regex;

    try {
      regex = new RegExp(values.pattern, values.flags.includes("g") ? values.flags : values.flags + "g");
    } catch (error) {
      throw new Error("Invalid regular expression — " + error.message);
    }

    const matches = [...values.text.matchAll(regex)];

    if (!matches.length) {
      return { html: '<h3 class="warn">No matches</h3><p class="muted">The pattern is valid but nothing in the test string matched it.</p>' };
    }

    let html = '<h3 class="ok">' + matches.length + " match" + (matches.length === 1 ? "" : "es") + "</h3>";

    html += "<table><tr><th>#</th><th>Index</th><th>Match</th><th>Groups</th></tr>";

    for (const [index, match] of matches.entries()) {

      const groups = match.slice(1).map((value, position) => {

        const name = match.groups
          ? Object.keys(match.groups).find(key => match.groups[key] === value)
          : null;

        return (name || position + 1) + ": " + (value === undefined ? "—" : escapeHtml(value));
      });

      html += "<tr><td>" + (index + 1) + "</td><td>" + match.index +
        "</td><td><code>" + escapeHtml(match[0]) + "</code></td><td>" +
        (groups.length ? groups.join("<br>") : '<span class="muted">none</span>') + "</td></tr>";
    }

    html += "</table>";

    return { html };
  }
});


/*
Timestamp Converter
*/

const TIME_UNITS = [
  ["year", 31536000], ["month", 2592000], ["day", 86400],
  ["hour", 3600], ["minute", 60], ["second", 1]
];


function relativeTime(millis) {

  const seconds = Math.round((millis - Date.now()) / 1000);
  const absolute = Math.abs(seconds);

  for (const [unit, size] of TIME_UNITS) {

    if (absolute >= size || unit === "second") {

      const amount = Math.round(absolute / size);
      const plural = amount === 1 ? "" : "s";

      return seconds < 0
        ? amount + " " + unit + plural + " ago"
        : "in " + amount + " " + unit + plural;
    }
  }

  return "now";
}


function parseTimestamp(input) {

  const text = input.trim();

  if (!text || text.toLowerCase() === "now") return Date.now();

  if (/^-?\d+$/.test(text)) {

    const number = Number(text);

    /* 10 digits is seconds, 13 is milliseconds, 16 is microseconds */
    if (Math.abs(number) >= 1e15) return Math.round(number / 1000);
    if (Math.abs(number) >= 1e11) return number;

    return number * 1000;
  }

  const parsed = Date.parse(text);

  if (Number.isNaN(parsed)) {
    throw new Error('Could not read "' + text + '". Try a Unix timestamp, an ISO 8601 date, or "now".');
  }

  return parsed;
}


Tools.add({

  id: "timestamp-converter",
  cat: "Utilities",
  name: "Unix Timestamp Converter",
  desc: "Convert between Unix timestamps, ISO 8601 and human-readable dates.",
  outputLabel: "Conversions",

  example: { input: "1735689600" },

  inputs: [
    {
      key: "input",
      label: "Timestamp or date",
      type: "text",
      placeholder: "1735689600, 2025-01-01T00:00:00Z, or now",
      hint: "Seconds, milliseconds and microseconds are detected automatically."
    }
  ],

  run(values) {

    if (!values.input.trim()) return { note: 'Enter a timestamp, a date, or "now".' };

    const millis = parseTimestamp(values.input);
    const date = new Date(millis);

    if (Number.isNaN(date.getTime())) {
      throw new Error("That value is outside the range JavaScript dates can represent.");
    }

    const rows = [
      ["Unix seconds", Math.floor(millis / 1000)],
      ["Unix milliseconds", millis],
      ["ISO 8601 (UTC)", date.toISOString()],
      ["UTC", date.toUTCString()],
      ["Local time", date.toString()],
      ["Local time zone", Intl.DateTimeFormat().resolvedOptions().timeZone],
      ["Relative", relativeTime(millis)],
      ["Day of week", date.toLocaleDateString(undefined, { weekday: "long" })]
    ];

    return {
      html: "<table>" + rows.map(([label, value]) =>
        "<tr><th>" + label + "</th><td>" + escapeHtml(value) + "</td></tr>"
      ).join("") + "</table>"
    };
  }
});
