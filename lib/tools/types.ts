export type Category = "cURL" | "JSON" | "Auth" | "API" | "Webhooks" | "Utilities";

export type ToolInput = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox";
  placeholder?: string;
  hint?: string;
  tall?: boolean;
  value?: string | boolean;
  options?: { value: string; label: string }[];
};

export type Values = Record<string, string | boolean>;

export type Tone = "ok" | "warn" | "error";

export type Cell = string | { text: string; tone?: Tone; muted?: boolean };

export type Block =
  | { kind: "heading"; text: string; tone?: Tone }
  | { kind: "text"; text: string; muted?: boolean }
  | { kind: "code"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; head?: string[]; rows: Cell[][] };

/**
 * Tools return data, never markup. The Output component decides how to draw
 * it, so no tool has to escape anything and React handles it for us.
 */
export type ToolResult =
  | { kind: "text"; text: string; notes?: string[] }
  | { kind: "blocks"; blocks: Block[]; copy?: string }
  | { kind: "empty"; message: string };

export type Doc = { heading: string; html: string };

export type Faq = { q: string; a: string };

export type Tool = {
  slug: string;
  name: string;
  category: Category;
  /** One line on the card and in the meta description. Written for a beginner. */
  summary: string;
  /** The paragraph under the H1: what the tool does and when you would want it. */
  description: string;
  title: string;
  inputs: ToolInput[];
  run: (values: Values) => ToolResult | Promise<ToolResult>;
  example?: Values;
  outputLabel?: string;
  download?: string | ((values: Values) => string);
  /** Tools that send a request or generate fresh output only run when asked. */
  manual?: boolean;
  docs?: Doc[];
  faqs?: Faq[];
};

export const text = (value: string, notes?: string[]): ToolResult => ({
  kind: "text",
  text: value,
  ...(notes && notes.length ? { notes } : {}),
});

export const blocks = (list: Block[], copy?: string): ToolResult => ({
  kind: "blocks",
  blocks: list,
  ...(copy !== undefined ? { copy } : {}),
});

export const empty = (message: string): ToolResult => ({ kind: "empty", message });
