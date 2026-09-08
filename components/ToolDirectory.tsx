"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type DirectoryTool = { slug: string; name: string; summary: string };
export type DirectoryGroup = { name: string; blurb: string; tools: DirectoryTool[] };

export function ToolDirectory({ groups }: { groups: DirectoryGroup[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return groups;

    return groups
      .map((group) => ({
        ...group,
        tools: group.tools.filter((tool) =>
          `${tool.name} ${tool.summary}`.toLowerCase().includes(term),
        ),
      }))
      .filter((group) => group.tools.length);
  }, [groups, query]);

  return (
    <>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Filter tools — try “json” or “jwt”"
        aria-label="Filter tools"
        className="mt-6 w-full max-w-md rounded-lg border border-line bg-bg px-3 py-2 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none"
      />

      {!filtered.length && <p className="mt-8 text-sm text-dim">No tools match that filter.</p>}

      {filtered.map((group) => (
        <section key={group.name} className="mt-10">
          <h2 id={group.name.toLowerCase()} className="text-lg font-semibold">
            {group.name}
          </h2>
          <p className="mt-1 mb-4 text-sm text-dim">{group.blurb}</p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="block rounded-xl border border-line bg-panel p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-panel-2"
              >
                <strong className="block text-sm font-semibold">{tool.name}</strong>
                <span className="mt-1 block text-sm text-dim">{tool.summary}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
