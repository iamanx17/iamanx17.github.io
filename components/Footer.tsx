import Link from "next/link";
import { FOOTER, SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto max-w-6xl space-y-3 px-4 py-8 text-sm text-faint">
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {FOOTER.map((item) => (
            <Link key={item.href} href={item.href} className="text-dim hover:text-fg">
              {item.label}
            </Link>
          ))}
        </nav>

        <p className="max-w-2xl">
          Every tool here runs in your browser. Commands, tokens and payloads you paste are not
          uploaded. The one exception is the webhook tester, which sends a request because that is
          its purpose.
        </p>

        <p>
          © {new Date().getFullYear()} {SITE.name}
        </p>
      </div>
    </footer>
  );
}
