import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

const NAV_KEYS = [
  { href: "/detonate" as const, key: "detonate" },
  { href: "/database" as const, key: "database" },
  { href: "/blog" as const, key: "blog" },
  { href: "/about" as const, key: "about" },
  { href: "/donate" as const, key: "donate" },
];

const LEGAL_KEYS = [
  { href: "/about/privacy" as const, key: "privacy" },
  { href: "/about/terms" as const, key: "terms" },
];

export default async function Footer() {
  const t = await getTranslations("nav");

  return (
    <footer className="w-full border-t border-border mt-auto">
      <div className="mx-auto max-w-[680px] px-4 py-8 sm:px-6">
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-x-6 gap-y-2 mb-6"
        >
          {NAV_KEYS.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className="text-[10px] tracking-[3px] uppercase text-text-muted hover:text-text-secondary transition-colors"
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {LEGAL_KEYS.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className="text-[9px] tracking-[2px] uppercase text-text-muted hover:text-text-secondary transition-colors"
            >
              {t(key)}
            </Link>
          ))}
          <a
            href="https://github.com/DEINDEX-ME/deindex.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] tracking-[2px] uppercase text-text-muted hover:text-text-secondary transition-colors"
          >
            {t("github")}
          </a>
          <LanguageSwitcher />
          <span className="text-[9px] tracking-[1px] text-text-muted ml-auto">
            {t("mitLicense")}
          </span>
        </div>
      </div>
    </footer>
  );
}
