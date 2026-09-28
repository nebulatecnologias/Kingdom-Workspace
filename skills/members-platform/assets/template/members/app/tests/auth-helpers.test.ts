import { describe, expect, it } from "vitest";
import { generateToken, hashToken, looksLikeToken } from "@/lib/tokens";
import { safeNext } from "@/lib/request";
import { renderInviteEmail, renderResetEmail, renderSignInEmail } from "@/lib/email/templates";
import { locales } from "@/i18n/config";

describe("tokens", () => {
  it("are 256-bit URL-safe strings stored only as a hash", () => {
    const { token, hash } = generateToken();
    expect(looksLikeToken(token)).toBe(true);
    expect(hash).toMatch(/^\\x[0-9a-f]{64}$/);
    expect(hash).toBe(hashToken(token));
    expect(hash).not.toContain(token);
  });
  it("are unique", () => {
    const seen = new Set(Array.from({ length: 200 }, () => generateToken().token));
    expect(seen.size).toBe(200);
  });
  it("rejects malformed tokens before any lookup", () => {
    expect(looksLikeToken("abc")).toBe(false);
    expect(looksLikeToken("../../etc/passwd")).toBe(false);
  });
});

describe("safeNext", () => {
  it("keeps same-site paths", () => expect(safeNext("/products/money?x=1")).toBe("/products/money?x=1"));
  it("blocks open redirects", () => {
    for (const bad of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", ""]) {
      expect(safeNext(bad)).toBe("/library");
    }
  });
});

describe("email templates", () => {
  const url = "https://members.example.co.za/invite/abc?lang=en";
  for (const locale of locales) {
    it(`render every template in ${locale} without missing strings`, () => {
      const emails = [
        renderInviteEmail({ locale, siteUrl: "https://m.example", name: "Thandi", url, expiresAt: new Date("2026-09-30T10:00:00Z"), productTitles: ["Noah", "Money"] }),
        renderSignInEmail({ locale, siteUrl: "https://m.example", name: "Thandi", url }),
        renderResetEmail({ locale, siteUrl: "https://m.example", name: "Thandi", url }),
      ];
      for (const e of emails) {
        expect(e.subject.length).toBeGreaterThan(5);
        expect(e.html).toContain(url.replace(/&/g, "&amp;"));
        expect(e.text).toContain(url);
        expect(e.html).not.toMatch(/\b(mail|inv|err)_[a-z_]+\b/); // an untranslated key would leak like this
        expect(e.html).toContain("Thandi");
      }
      expect(emails[0].html).toContain("Money");
    });
  }
  it("escapes names", () => {
    const e = renderSignInEmail({ locale: "en", siteUrl: "https://m.example", name: "<script>", url });
    expect(e.html).not.toContain("<script>");
  });
});
