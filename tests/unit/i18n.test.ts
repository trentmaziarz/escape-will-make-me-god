import { describe, it, expect } from "vitest";
import { locales, defaultLocale } from "@/i18n/config";
import en from "@/i18n/messages/en.json";

// Dynamically import all locale files
async function loadMessages(locale: string): Promise<Record<string, unknown>> {
  return (await import(`@/i18n/messages/${locale}.json`)).default;
}

// Recursively extract all leaf keys from a nested object
function getLeafKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys.push(...getLeafKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe("i18n configuration", () => {
  it("has English as the default locale", () => {
    expect(defaultLocale).toBe("en");
  });

  it("supports exactly 7 locales", () => {
    expect(locales).toEqual(["en", "fr", "de", "es", "it", "nl", "pt"]);
    expect(locales).toHaveLength(7);
  });

  it("en.json has required top-level namespaces", () => {
    const expectedNamespaces = [
      "metadata",
      "common",
      "nav",
      "counter",
      "landing",
      "detonator",
      "database",
      "about",
      "privacy",
      "terms",
      "blog",
      "donate",
    ];
    for (const ns of expectedNamespaces) {
      expect(en).toHaveProperty(ns);
    }
  });
});

describe("i18n key consistency", () => {
  const enKeys = getLeafKeys(en as Record<string, unknown>);

  for (const locale of locales) {
    if (locale === "en") continue;

    it(`${locale}.json has exactly the same keys as en.json`, async () => {
      const messages = await loadMessages(locale);
      const localeKeys = getLeafKeys(messages);

      const missingInLocale = enKeys.filter((k) => !localeKeys.includes(k));
      const extraInLocale = localeKeys.filter((k) => !enKeys.includes(k));

      if (missingInLocale.length > 0) {
        expect.fail(
          `${locale}.json is missing keys:\n  ${missingInLocale.join("\n  ")}`
        );
      }

      if (extraInLocale.length > 0) {
        expect.fail(
          `${locale}.json has extra keys not in en.json:\n  ${extraInLocale.join("\n  ")}`
        );
      }

      expect(localeKeys.sort()).toEqual(enKeys.sort());
    });
  }
});

describe("i18n placeholder consistency", () => {
  // Extract placeholder names: simple {name} and ICU {name, plural, ...}
  function getPlaceholders(str: string): string[] {
    const names: string[] = [];
    // Match ICU plural/select: {paramName, plural, ...} or {paramName, select, ...}
    const icuRe = /\{(\w+),\s*(?:plural|select|selectordinal),/g;
    let m: RegExpExecArray | null;
    const icuParams = new Set<string>();
    while ((m = icuRe.exec(str)) !== null) {
      names.push(`{${m[1]},icu}`);
      icuParams.add(m[1]);
    }
    // Match simple placeholders: {paramName} (skip those already captured as ICU)
    const simpleRe = /\{(\w+)\}/g;
    while ((m = simpleRe.exec(str)) !== null) {
      if (!icuParams.has(m[1])) {
        names.push(`{${m[1]}}`);
      }
    }
    return names.sort();
  }

  const enEntries: [string, string][] = [];
  function collectStrings(
    obj: Record<string, unknown>,
    prefix = ""
  ): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "string") {
        enEntries.push([fullKey, value]);
      } else if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        collectStrings(value as Record<string, unknown>, fullKey);
      }
    }
  }
  collectStrings(en as Record<string, unknown>);

  for (const locale of locales) {
    if (locale === "en") continue;

    it(`${locale}.json preserves all ICU placeholders from en.json`, async () => {
      const messages = await loadMessages(locale);
      const mismatches: string[] = [];

      for (const [key, enValue] of enEntries) {
        const enPlaceholders = getPlaceholders(enValue);
        if (enPlaceholders.length === 0) continue;

        // Navigate to the value in the locale messages
        const parts = key.split(".");
        let localeValue: unknown = messages;
        for (const part of parts) {
          if (
            typeof localeValue === "object" &&
            localeValue !== null
          ) {
            localeValue = (localeValue as Record<string, unknown>)[part];
          }
        }

        if (typeof localeValue !== "string") continue;

        const localePlaceholders = getPlaceholders(localeValue);

        if (
          JSON.stringify(enPlaceholders) !==
          JSON.stringify(localePlaceholders)
        ) {
          mismatches.push(
            `  ${key}: en=${JSON.stringify(enPlaceholders)} ${locale}=${JSON.stringify(localePlaceholders)}`
          );
        }
      }

      if (mismatches.length > 0) {
        expect.fail(
          `${locale}.json has placeholder mismatches:\n${mismatches.join("\n")}`
        );
      }
    });
  }
});

describe("i18n rich text tag consistency", () => {
  const tagRegex = /<(\w+)>/g;

  function getTags(str: string): string[] {
    const tags: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = tagRegex.exec(str)) !== null) {
      tags.push(match[1]);
    }
    return tags.sort();
  }

  const enEntries: [string, string][] = [];
  function collectStrings(
    obj: Record<string, unknown>,
    prefix = ""
  ): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "string") {
        enEntries.push([fullKey, value]);
      } else if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        collectStrings(value as Record<string, unknown>, fullKey);
      }
    }
  }
  collectStrings(en as Record<string, unknown>);

  for (const locale of locales) {
    if (locale === "en") continue;

    it(`${locale}.json preserves all rich text tags from en.json`, async () => {
      const messages = await loadMessages(locale);
      const mismatches: string[] = [];

      for (const [key, enValue] of enEntries) {
        const enTags = getTags(enValue);
        if (enTags.length === 0) continue;

        const parts = key.split(".");
        let localeValue: unknown = messages;
        for (const part of parts) {
          if (
            typeof localeValue === "object" &&
            localeValue !== null
          ) {
            localeValue = (localeValue as Record<string, unknown>)[part];
          }
        }

        if (typeof localeValue !== "string") continue;

        const localeTags = getTags(localeValue);

        if (JSON.stringify(enTags) !== JSON.stringify(localeTags)) {
          mismatches.push(
            `  ${key}: en=[${enTags}] ${locale}=[${localeTags}]`
          );
        }
      }

      if (mismatches.length > 0) {
        expect.fail(
          `${locale}.json has rich text tag mismatches:\n${mismatches.join("\n")}`
        );
      }
    });
  }
});
