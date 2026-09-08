import Link from "next/link";
import { ToolCard } from "@/components/ToolCard";
import { TOOL_COUNT, getTool } from "@/lib/tools";

const FEATURED = [
  "curl-to-code",
  "json-formatter",
  "jwt-decoder",
  "json-to-typescript",
  "regex-tester",
  "cron-expression-generator",
];

export default function Home() {
  const featured = FEATURED.map((slug) => getTool(slug)!);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Free developer tools that run in your browser
        </h1>

        <p className="mt-4 text-dim">
          {TOOL_COUNT} small tools for working with HTTP APIs: convert a cURL command into code in
          nine languages, format and compare JSON, decode a JWT, test a regular expression, explain
          a cron schedule. No accounts, no limits, and nothing you paste is uploaded.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/tools/curl-to-code"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
          >
            Open the cURL converter
          </Link>
          <Link
            href="/tools"
            className="rounded-lg border border-line px-4 py-2 text-sm hover:border-accent/50"
          >
            Browse all tools
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold">Start here</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} featured={tool.slug === "curl-to-code"} />
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-8 md:grid-cols-3">
        <div>
          <h2 className="mb-2 font-semibold">API docs show cURL. Your project is not cURL.</h2>
          <p className="text-sm text-dim">
            Every quickstart is a cURL command, and turning it into a real request means
            transcribing headers and guessing how the body should be encoded. The converter does
            that for you and gets the details right, including the ones that only surface in
            production.
          </p>
        </div>

        <div>
          <h2 className="mb-2 font-semibold">The small lookups add up.</h2>
          <p className="text-sm text-dim">
            Reading a JWT, checking what 422 means, formatting a payload from a ticket, generating
            an id. Each is trivial on its own and collectively a steady drain of attention. These
            are one page each and load instantly.
          </p>
        </div>

        <div>
          <h2 className="mb-2 font-semibold">Pasting a token somewhere should not be a risk.</h2>
          <p className="text-sm text-dim">
            Most online converters send your input to a server. Here every tool is JavaScript
            running in your tab, so the command, the token and the payload stay on your machine.
            Open your network panel and check.
          </p>
        </div>
      </section>
    </div>
  );
}
