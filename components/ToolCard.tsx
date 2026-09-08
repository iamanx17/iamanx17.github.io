import Link from "next/link";
import { Tool } from "@/lib/tools/types";

export function ToolCard({ tool, featured }: { tool: Tool; featured?: boolean }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={`block rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-panel-2 ${
        featured
          ? "border-accent/40 bg-linear-160 from-accent/8 to-panel"
          : "border-line bg-panel"
      }`}
    >
      <strong className="block text-sm font-semibold">{tool.name}</strong>
      <span className="mt-1 block text-sm text-dim">{tool.summary}</span>
    </Link>
  );
}
