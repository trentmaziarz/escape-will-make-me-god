import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// --- Shared i18n helpers for mock translators ---

function resolve(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce(
      (o, k) =>
        typeof o === "object" && o !== null
          ? (o as Record<string, unknown>)[k]
          : undefined,
      obj
    );
}

function resolveICU(str: string, params: Record<string, unknown>): string {
  // Handle {param, number} — format with locale commas
  let result = str.replace(/\{(\w+),\s*number\}/g, (_match, paramName) => {
    const num = Number(params[paramName] ?? 0);
    return num.toLocaleString("en-US");
  });
  // Handle {param, plural, one {...} other {...}}
  result = result.replace(
    /\{(\w+),\s*plural,\s*((?:[^{}]|\{[^}]*\})*)\}/g,
    (_match, paramName, branches) => {
      const count = Number(params[paramName] ?? 0);
      const branchMap: Record<string, string> = {};
      const branchRe = /(\w+)\s*\{([^}]*)\}/g;
      let m: RegExpExecArray | null;
      while ((m = branchRe.exec(branches)) !== null) {
        branchMap[m[1]] = m[2];
      }
      const branch =
        (count === 1 ? branchMap["one"] : null) ??
        branchMap["other"] ??
        "";
      return branch.replace(/#/g, String(count));
    }
  );
  return result;
}

function replaceSimple(
  str: string,
  params: Record<string, unknown>
): string {
  return Object.entries(params).reduce(
    (s, [k, v]) =>
      typeof v === "function"
        ? s
        : s.replace(new RegExp(`\\{${k}[^}]*\\}`, "g"), String(v)),
    str
  );
}

function createTranslator(
  en: Record<string, unknown>,
  namespace: string
) {
  const ns = namespace ? resolve(en, namespace) : en;

  const t = Object.assign(
    (key: string, params?: Record<string, unknown>) => {
      const value = resolve(ns, key);
      if (typeof value !== "string") return `${namespace}.${key}`;
      if (!params) return value;
      return replaceSimple(resolveICU(value, params), params);
    },
    {
      rich: (key: string, params?: Record<string, unknown>) => {
        const value = resolve(ns, key);
        if (typeof value !== "string") return `${namespace}.${key}`;
        let str = params ? resolveICU(value, params) : value;
        // Replace simple {param} placeholders first
        if (params) {
          for (const [k, v] of Object.entries(params)) {
            if (typeof v !== "function") {
              str = str.replace(
                new RegExp(`\\{${k}[^}]*\\}`, "g"),
                String(v)
              );
            }
          }
        }
        // Split on rich text tags and invoke function params
        if (!params) return str;
        const tagNames = Object.entries(params)
          .filter(([, v]) => typeof v === "function")
          .map(([k]) => k);
        if (tagNames.length === 0) return str;
        const tagPattern = new RegExp(
          `(<(?:${tagNames.join("|")})>[\\s\\S]*?</(?:${tagNames.join("|")})>)`,
          "g"
        );
        const parts = str.split(tagPattern);
        const result: (string | React.ReactNode)[] = [];
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          const tagMatch = part.match(
            /^<(\w+)>([\s\S]*?)<\/\w+>$/
          );
          if (tagMatch && typeof params[tagMatch[1]] === "function") {
            result.push(
              (params[tagMatch[1]] as (chunks: string) => React.ReactNode)(
                tagMatch[2]
              )
            );
          } else {
            result.push(part);
          }
        }
        return result;
      },
    }
  );

  return t;
}

// --- Global mock for next-intl (client) ---

vi.mock("next-intl", async () => {
  const en: Record<string, unknown> = (
    await import("@/i18n/messages/en.json")
  ).default;

  return {
    useTranslations: (namespace: string) => createTranslator(en, namespace),
    useLocale: () => "en",
    NextIntlClientProvider: ({
      children,
    }: {
      children: React.ReactNode;
    }) => children,
  };
});

// --- Global mock for next-intl/server ---

vi.mock("next-intl/server", async () => {
  const en: Record<string, unknown> = (
    await import("@/i18n/messages/en.json")
  ).default;

  return {
    getTranslations: async (
      config: string | { locale?: string; namespace?: string }
    ) => {
      const namespace =
        typeof config === "string" ? config : config.namespace || "";
      return createTranslator(en, namespace);
    },
    getMessages: async () => en,
  };
});

// --- Mock @/i18n/navigation — render Link as plain <a> ---

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => {
    const { locale: _locale, ...rest } = props;
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
  usePathname: () => "/",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  getPathname: () => "/",
  redirect: vi.fn(),
}));
