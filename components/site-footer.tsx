import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="px-4 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl border-t border-line/70 py-8 text-center text-ink/55">
        <nav aria-label="Footer" className="mb-4">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-ink/60 sm:text-sm">
            <li>
              <Link href="/#about-me" className="transition hover:text-accent">
                About
              </Link>
            </li>
            <li>
              <Link href="/blog" className="transition hover:text-accent">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/geo" className="transition hover:text-accent">
                Locations
              </Link>
            </li>
            <li>
              <Link href="/#contact" className="transition hover:text-accent">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="transition hover:text-accent">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </nav>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.5rem] leading-tight sm:text-[0.65rem]">
          <span>| ©2026 | UBT | All rights reserved. | Without a test you cannot be the best! |</span>
        </div>
      </div>
    </footer>
  );
}
