/*
---------------------------------------------------
JSON tools
---------------------------------------------------
*/

const JSON_EXAMPLE = JSON.stringify({
  id: 42,
  name: "Aman",
  email: "aman@example.com",
  active: true,
  score: 9.5,
  tags: ["api", "tools"],
  profile: { city: "Berlin", zip: null },
  posts: [{ id: 1, title: "Hello", views: 10 }]
}, null, 2);


function indentOf(value) {

  if (value === "tab") return "\t";
  if (value === "minify") return null;

  return parseInt(value, 10);
}


function sortDeep(value) {

  if (Array.isArray(value)) return value.map(sortDeep);

  if (value && typeof value === "object") {

    const out = {};

    for (const key of Object.keys(value).sort()) {
      out[key] = sortDeep(value[key]);
    }

    return out;
  }

  return value;
}


/*
JSON Formatter
*/

Tools.add({
  id: "json-formatter",
  cat: "JSON",
  name: "JSON Formatter",
  desc: "Pretty-print or minify JSON, optionally sorting keys.",
  outputLabel: "Formatted JSON",
  example: { input: '{"b":2,"a":[1,2,{"c":3}],"d":{"e":"f"}}' },
  inputs: [
    { key: "input", label: "JSON", type: "textarea", tall: true, placeholder: '{"hello":"world"}' },
    {
      key: "indent",
      label: "Indent",
      type: "select",
      options: [
        { value: "2", label: "2 spaces" },
        { value: "4", label: "4 spaces" },
        { value: "tab", label: "Tab" },
        { value: "minify", label: "Minify" }
      ]
    },
    { key: "sort", label: "Sort keys alphabetically", type: "checkbox" }
  ],
  run(v) {

    if (!v.input.trim()) return { note: "Paste some JSON to format." };

    let data = parseJson(v.input);

    if (v.sort) data = sortDeep(data);

    const indent = indentOf(v.indent);

    return indent === null
      ? JSON.stringify(data)
      : JSON.stringify(data, null, indent);
  }
});


/*
JSON Validator
*/

Tools.add({
  id: "json-validator",
  cat: "JSON",
  name: "JSON Validator",
  desc: "Check whether JSON is valid and show where it breaks.",
  outputLabel: "Result",
  example: { input: '{"a":1,"b":[1,2,}' },
  inputs: [
    { key: "input", label: "JSON", type: "textarea", tall: true, placeholder: '{"hello":"world"}' }
  ],
  run(v) {

    const text = v.input;

    if (!text.trim()) return { note: "Paste some JSON." };

    try {

      const data = JSON.parse(text);

      const stats = { objects: 0, arrays: 0, keys: 0, values: 0, maxDepth: 0 };

      (function walk(node, depth) {

        stats.maxDepth = Math.max(stats.maxDepth, depth);

        if (Array.isArray(node)) {

          stats.arrays++;
          node.forEach(item => walk(item, depth + 1));

        } else if (node && typeof node === "object") {

          stats.objects++;

          for (const key of Object.keys(node)) {
            stats.keys++;
            walk(node[key], depth + 1);
          }

        } else {
          stats.values++;
        }
      })(data, 1);

      return {
        html:
          '<h3 class="ok">Valid JSON</h3>' +
          `<table>
            <tr><th>Root type</th><td>${Array.isArray(data) ? "array" : typeof data}</td></tr>
            <tr><th>Objects</th><td>${stats.objects}</td></tr>
            <tr><th>Arrays</th><td>${stats.arrays}</td></tr>
            <tr><th>Keys</th><td>${stats.keys}</td></tr>
            <tr><th>Primitive values</th><td>${stats.values}</td></tr>
            <tr><th>Max depth</th><td>${stats.maxDepth}</td></tr>
            <tr><th>Size</th><td>${text.length} chars</td></tr>
          </table>`
      };

    } catch (error) {

      const match = /position (\d+)/.exec(error.message);

      let where = "";

      if (match) {

        const position = +match[1];
        const before = text.slice(0, position);
        const line = before.split("\n").length;
        const column = position - before.lastIndexOf("\n");

        const snippet = text.slice(Math.max(0, position - 40), position + 40);

        where =
          `<p>Line <b>${line}</b>, column <b>${column}</b> (offset ${position})</p>` +
          `<pre>${escapeHtml(snippet)}</pre>`;
      }

      return {
        html:
          '<h3 class="error">Invalid JSON</h3>' +
          `<p>${escapeHtml(error.message)}</p>` + where
      };
    }
  }
});


/*
JSON Diff
*/

function diffJson(a, b, path, out) {

  const isObject = value => value && typeof value === "object";

  if (!isObject(a) || !isObject(b) || Array.isArray(a) !== Array.isArray(b)) {

    if (JSON.stringify(a) !== JSON.stringify(b)) {
      out.push({ type: "chg", path, from: a, to: b });
    }

    return;
  }

  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (const key of keys) {

    const child = Array.isArray(a) ? `${path}[${key}]` : (path ? `${path}.${key}` : key);

    if (!(key in a)) {
      out.push({ type: "add", path: child, to: b[key] });
    } else if (!(key in b)) {
      out.push({ type: "del", path: child, from: a[key] });
    } else {
      diffJson(a[key], b[key], child, out);
    }
  }
}


Tools.add({
  id: "json-diff",
  cat: "JSON",
  name: "JSON Diff",
  desc: "Compare two JSON documents key by key.",
  outputLabel: "Differences",
  example: {
    left: '{"name":"Aman","age":25,"tags":["a","b"],"city":"Berlin"}',
    right: '{"name":"Aman","age":26,"tags":["a","c"],"country":"DE"}'
  },
  inputs: [
    { key: "left", label: "Left (original)", type: "textarea", placeholder: '{"a":1}' },
    { key: "right", label: "Right (changed)", type: "textarea", placeholder: '{"a":2}' }
  ],
  run(v) {

    if (!v.left.trim() || !v.right.trim()) {
      return { note: "Paste JSON into both fields." };
    }

    const left = parseJson(v.left, "left JSON");
    const right = parseJson(v.right, "right JSON");

    const changes = [];

    diffJson(left, right, "", changes);

    if (!changes.length) {
      return { html: '<h3 class="ok">No differences — the documents are equal.</h3>' };
    }

    const show = value => escapeHtml(JSON.stringify(value));

    const rows = changes.map(change => {

      if (change.type === "add") {
        return `<tr><td class="add">added</td><td>${escapeHtml(change.path)}</td><td class="add">${show(change.to)}</td></tr>`;
      }

      if (change.type === "del") {
        return `<tr><td class="del">removed</td><td>${escapeHtml(change.path)}</td><td class="del">${show(change.from)}</td></tr>`;
      }

      return `<tr><td class="chg">changed</td><td>${escapeHtml(change.path)}</td><td><span class="del">${show(change.from)}</span> → <span class="add">${show(change.to)}</span></td></tr>`;
    }).join("");

    return {
      html:
        `<h3>${changes.length} difference${changes.length === 1 ? "" : "s"}</h3>` +
        `<table><tr><th>Type</th><th>Path</th><th>Value</th></tr>${rows}</table>`
    };
  }
});


/*
---------------------------------------------------
Shared type inference for the code generators
---------------------------------------------------
*/

function pascalCase(name) {

  return String(name)
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join("") || "Model";
}


function singular(name) {

  if (/ies$/i.test(name)) return name.slice(0, -3) + "y";
  if (/ses$/i.test(name)) return name.slice(0, -2);
  if (/s$/i.test(name) && !/ss$/i.test(name)) return name.slice(0, -1);

  return name;
}


/* merge every object in an array so optional keys are visible */
function mergeSamples(items) {

  const objects = items.filter(item => item && typeof item === "object" && !Array.isArray(item));

  if (!objects.length) return null;

  const merged = {};
  const counts = {};

  for (const object of objects) {

    for (const [key, value] of Object.entries(object)) {

      counts[key] = (counts[key] || 0) + 1;

      if (!(key in merged) || merged[key] === null) merged[key] = value;
    }
  }

  const optional = new Set(
    Object.keys(counts).filter(key => counts[key] < objects.length)
  );

  return { merged, optional };
}


function isSafeIdentifier(key) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}


/*
JSON → TypeScript
*/

function toTypeScript(value, name, defs, optionalKeys) {

  if (value === null) return "null";

  if (Array.isArray(value)) {

    if (!value.length) return "unknown[]";

    const sample = mergeSamples(value);

    if (sample) {
      return toTypeScript(sample.merged, singular(name), defs, sample.optional) + "[]";
    }

    const types = [...new Set(value.map(item => toTypeScript(item, singular(name), defs)))];

    return (types.length === 1 ? types[0] : "(" + types.join(" | ") + ")") + "[]";
  }

  if (typeof value === "object") {

    const typeName = pascalCase(name);

    const lines = Object.entries(value).map(([key, child]) => {

      const type = toTypeScript(child, key, defs);
      const optional = optionalKeys && optionalKeys.has(key) ? "?" : "";
      const safeKey = isSafeIdentifier(key) ? key : JSON.stringify(key);

      return `  ${safeKey}${optional}: ${type};`;
    });

    defs.push(`export interface ${typeName} {\n${lines.join("\n")}\n}`);

    return typeName;
  }

  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";

  return "string";
}


Tools.add({
  id: "json-to-typescript",
  cat: "JSON",
  name: "JSON → TypeScript",
  desc: "Generate TypeScript interfaces from a JSON sample.",
  outputLabel: "TypeScript",
  example: { input: JSON_EXAMPLE, name: "User" },
  inputs: [
    { key: "input", label: "JSON", type: "textarea", tall: true, placeholder: JSON_EXAMPLE },
    { key: "name", label: "Root type name", type: "text", value: "Root", placeholder: "Root" }
  ],
  run(v) {

    if (!v.input.trim()) return { note: "Paste a JSON sample to generate types." };

    const data = parseJson(v.input);
    const defs = [];

    const rootType = toTypeScript(data, v.name.trim() || "Root", defs);

    if (!defs.length) {
      return `export type ${pascalCase(v.name || "Root")} = ${rootType};`;
    }

    if (rootType.endsWith("[]")) {
      defs.push(`export type ${pascalCase(v.name || "Root")}List = ${rootType};`);
    }

    return defs.join("\n\n");
  }
});


/*
JSON → Zod
*/

function toZod(value, name, defs, optionalKeys) {

  if (value === null) return "z.null()";

  if (Array.isArray(value)) {

    if (!value.length) return "z.array(z.unknown())";

    const sample = mergeSamples(value);

    if (sample) {
      return `z.array(${toZod(sample.merged, singular(name), defs, sample.optional)})`;
    }

    return `z.array(${toZod(value[0], singular(name), defs)})`;
  }

  if (typeof value === "object") {

    const lines = Object.entries(value).map(([key, child]) => {

      let type = toZod(child, key, defs);

      if (optionalKeys && optionalKeys.has(key)) type += ".optional()";

      const safeKey = isSafeIdentifier(key) ? key : JSON.stringify(key);

      return `  ${safeKey}: ${type},`;
    });

    return `z.object({\n${lines.join("\n")}\n})`;
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? "z.number().int()" : "z.number()";
  }

  if (typeof value === "boolean") return "z.boolean()";

  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return "z.string().email()";
  if (/^https?:\/\//.test(value)) return "z.string().url()";
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return "z.string().datetime()";

  return "z.string()";
}


/* indent a nested schema so the output stays readable */
function reindentZod(text) {

  const lines = text.split("\n");

  let depth = 0;

  return lines.map(line => {

    const trimmed = line.trim();

    if (/^\}\)/.test(trimmed)) depth--;

    const out = "  ".repeat(Math.max(0, depth)) + trimmed;

    if (/\{$/.test(trimmed)) depth++;

    return out;
  }).join("\n");
}


Tools.add({
  id: "json-to-zod",
  cat: "JSON",
  name: "JSON → Zod",
  desc: "Generate a Zod schema from a JSON sample.",
  outputLabel: "Zod schema",
  example: { input: JSON_EXAMPLE, name: "User" },
  inputs: [
    { key: "input", label: "JSON", type: "textarea", tall: true, placeholder: JSON_EXAMPLE },
    { key: "name", label: "Schema name", type: "text", value: "Root", placeholder: "Root" }
  ],
  run(v) {

    if (!v.input.trim()) return { note: "Paste a JSON sample to generate a schema." };

    const data = parseJson(v.input);
    const name = pascalCase(v.name.trim() || "Root");

    const schema = reindentZod(toZod(data, name, []));

    return `import { z } from "zod";

export const ${name}Schema = ${schema};

export type ${name} = z.infer<typeof ${name}Schema>;`;
  }
});


/*
JSON → Pydantic
*/

function toPydantic(value, name, defs, optionalKeys) {

  if (value === null) return "Optional[Any]";

  if (Array.isArray(value)) {

    if (!value.length) return "List[Any]";

    const sample = mergeSamples(value);

    if (sample) {
      return `List[${toPydantic(sample.merged, singular(name), defs, sample.optional)}]`;
    }

    return `List[${toPydantic(value[0], singular(name), defs)}]`;
  }

  if (typeof value === "object") {

    const className = pascalCase(name);

    const lines = Object.entries(value).map(([key, child]) => {

      let type = toPydantic(child, key, defs);

      const safeKey = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) ? key : null;

      if (child === null || (optionalKeys && optionalKeys.has(key))) {

        if (!type.startsWith("Optional[")) type = `Optional[${type}]`;

        return safeKey
          ? `    ${safeKey}: ${type} = None`
          : `    ${key.replace(/[^a-zA-Z0-9_]/g, "_")}: ${type} = Field(None, alias=${JSON.stringify(key)})`;
      }

      return safeKey
        ? `    ${safeKey}: ${type}`
        : `    ${key.replace(/[^a-zA-Z0-9_]/g, "_")}: ${type} = Field(..., alias=${JSON.stringify(key)})`;
    });

    defs.push(`class ${className}(BaseModel):\n${lines.join("\n") || "    pass"}`);

    return className;
  }

  if (typeof value === "number") return Number.isInteger(value) ? "int" : "float";
  if (typeof value === "boolean") return "bool";

  return "str";
}


Tools.add({
  id: "json-to-pydantic",
  cat: "JSON",
  name: "JSON → Pydantic",
  desc: "Generate Pydantic v2 models from a JSON sample.",
  outputLabel: "Pydantic models",
  example: { input: JSON_EXAMPLE, name: "User" },
  inputs: [
    { key: "input", label: "JSON", type: "textarea", tall: true, placeholder: JSON_EXAMPLE },
    { key: "name", label: "Root model name", type: "text", value: "Root", placeholder: "Root" }
  ],
  run(v) {

    if (!v.input.trim()) return { note: "Paste a JSON sample to generate models." };

    const data = parseJson(v.input);
    const defs = [];

    const rootType = toPydantic(data, v.name.trim() || "Root", defs);

    const body = defs.length
      ? defs.join("\n\n\n")
      : `${pascalCase(v.name || "Root")} = ${rootType}`;

    const needsField = body.includes("Field(");

    return `from typing import Any, List, Optional

from pydantic import BaseModel${needsField ? ", Field" : ""}


${body}`;
  }
});
