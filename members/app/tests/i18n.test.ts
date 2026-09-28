import { describe, expect, it } from "vitest";
import en from "../messages/en.json";
import pt from "../messages/pt.json";
import es from "../messages/es.json";

const catalogues = { en, pt, es } as Record<string, Record<string, string>>;
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const tags = (s: string) => [...s.matchAll(/<(\w+)>/g)].map((m) => m[1]).sort();

describe("translations", () => {
  const keys = Object.keys(en).sort();

  for (const [locale, messages] of Object.entries(catalogues)) {
    it(`${locale} has exactly the same keys as en`, () => {
      expect(Object.keys(messages).sort()).toEqual(keys);
    });
    it(`${locale} has no empty strings`, () => {
      expect(Object.entries(messages).filter(([, v]) => !v.trim())).toEqual([]);
    });
    it(`${locale} uses the same placeholders and rich-text tags as en`, () => {
      const mismatches = keys.filter(
        (k) =>
          placeholders(messages[k]).join() !== placeholders(en[k as keyof typeof en]).join() ||
          tags(messages[k]).join() !== tags(en[k as keyof typeof en]).join(),
      );
      expect(mismatches).toEqual([]);
    });
  }

  it("contains no raw HTML (use rich-text tags instead)", () => {
    const html = Object.entries(catalogues).flatMap(([l, m]) =>
      Object.entries(m).filter(([, v]) => /<(a|br|b|p|span)[\s>/]/i.test(v)).map(([k]) => `${l}:${k}`),
    );
    expect(html).toEqual([]);
  });
});
