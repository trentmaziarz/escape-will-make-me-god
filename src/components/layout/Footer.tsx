import Link from "next/link";

const NAV_LINKS = [
  { href: "/detonate", label: "Detonate" },
  { href: "/database", label: "Database" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/donate", label: "Donate" },
];

const LEGAL_LINKS = [
  { href: "/about/privacy", label: "Privacy" },
  { href: "/about/terms", label: "Terms" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-border mt-auto">
      <div className="mx-auto max-w-[680px] px-4 py-8 sm:px-6">
        {/* Nav links */}
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[10px] tracking-[3px] uppercase text-text-muted hover:text-text-secondary transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Legal + meta */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {LEGAL_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[9px] tracking-[2px] uppercase text-text-muted hover:text-text-secondary transition-colors"
            >
              {label}
            </Link>
          ))}
          <a
            href="https://github.com/DEINDEX-ME/deindex.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] tracking-[2px] uppercase text-text-muted hover:text-text-secondary transition-colors"
          >
            GitHub
          </a>
          <span className="text-[9px] tracking-[1px] text-text-muted ml-auto">
            MIT License
          </span>
        </div>
      </div>
    </footer>
  );
}
