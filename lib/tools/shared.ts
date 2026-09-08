import { Values } from "./types";

export const str = (values: Values, key: string) => String(values[key] ?? "");

export const bool = (values: Values, key: string) => values[key] === true;

export function parseJson(input: string, what = "JSON"): unknown {
  if (!input.trim()) throw new Error(`Paste some ${what} first.`);

  try {
    return JSON.parse(input);
  } catch (error) {
    throw new Error(`That is not valid ${what}. ${(error as Error).message}`);
  }
}

export function pascalCase(name: string) {
  const out = name
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return out || "Model";
}

export function singular(name: string) {
  if (/ies$/i.test(name)) return name.slice(0, -3) + "y";
  if (/ses$/i.test(name)) return name.slice(0, -2);
  if (/s$/i.test(name) && !/ss$/i.test(name)) return name.slice(0, -1);
  return name;
}

export const isSafeIdentifier = (key: string) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);

export function base64Encode(input: string) {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

export function base64Decode(input: string) {
  const clean = input.trim().replace(/\s+/g, "");
  const padded =
    clean.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (clean.length % 4)) % 4);

  return new TextDecoder().decode(Uint8Array.from(atob(padded), (char) => char.charCodeAt(0)));
}

export function parseHeaderLines(input: string) {
  const headers: Record<string, string> = {};

  for (const raw of input.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    const at = line.indexOf(":");
    if (at === -1) continue;

    headers[line.slice(0, at).trim()] = line.slice(at + 1).trim();
  }

  return headers;
}

export const pretty = (value: unknown) => JSON.stringify(value, null, 2);
