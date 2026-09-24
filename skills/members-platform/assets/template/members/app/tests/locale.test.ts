import { describe, expect, it } from "vitest";
import { resolveLocale, toLocale } from "@/i18n/config";
import { formatZar } from "@/lib/format";

describe("resolveLocale", () => {
  it("prefers the saved profile language", () => {
    expect(resolveLocale({ profile: "pt", cookie: "es", acceptLanguage: "en-ZA" })).toBe("pt");
  });
  it("falls back to the cookie", () => {
    expect(resolveLocale({ cookie: "es", acceptLanguage: "pt-PT" })).toBe("es");
  });
  it("reads Accept-Language by quality", () => {
    expect(resolveLocale({ acceptLanguage: "fr-FR,fr;q=0.9,pt-BR;q=0.8,en;q=0.5" })).toBe("pt");
  });
  it("defaults to South African English", () => {
    expect(resolveLocale({ acceptLanguage: "zu-ZA,af;q=0.8" })).toBe("en");
    expect(resolveLocale({})).toBe("en");
  });
  it("ignores unknown values", () => {
    expect(resolveLocale({ profile: "fr", cookie: "<script>" })).toBe("en");
  });
  it("maps Intl tags back to app locales", () => {
    expect(toLocale("pt-PT")).toBe("pt");
    expect(toLocale("de")).toBe("en");
  });
});

describe("formatZar", () => {
  it("formats cents as rand", () => {
    expect(formatZar(14900)).toMatch(/^R\s?149[,.]00$/);
  });
});
