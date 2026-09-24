import { describe, expect, it } from "vitest";
import { effectiveStatus, searchTerm } from "../src/lib/admin/queries";
import { relativeDays, timeLeft, withinADay } from "../src/lib/admin/time";
import { formatZar } from "../src/lib/format";
import { htmlToMarkdown, markdownToHtml, readingMinutes } from "../src/lib/markdown";

describe("chapter markdown", () => {
  it("turns the editor's markdown into simple HTML", () => {
    const html = markdownToHtml("## Monday\n\nWork is **worship** and *rest*.\nNew line.\n\n> Whatever you do\n> work at it\n\n- one\n- two\n\n1. first\n2. second\n\n[Read more](https://example.com)");
    expect(html).toContain("<h2>Monday</h2>");
    expect(html).toContain("<p>Work is <strong>worship</strong> and <em>rest</em>.<br>New line.</p>");
    expect(html).toContain("<blockquote><p>Whatever you do<br>work at it</p></blockquote>");
    expect(html).toContain("<ul><li>one</li><li>two</li></ul>");
    expect(html).toContain("<ol><li>first</li><li>second</li></ol>");
    expect(html).toContain('<a href="https://example.com">Read more</a>');
  });

  it("escapes typed HTML and refuses unsafe links", () => {
    const html = markdownToHtml('<script>alert(1)</script>\n\n[x](javascript:alert(1)) <img src=x onerror="y">');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    expect(html).not.toContain('href="javascript');
    expect(html).toContain("&lt;script&gt;");
  });

  it("brings older HTML chapters back to markdown", () => {
    const md = htmlToMarkdown("<h2>Title</h2><p>Some <strong>bold</strong> and <em>soft</em> text&nbsp;here.</p><ul><li>a</li><li>b</li></ul><blockquote><p>Quote</p></blockquote>");
    expect(md).toBe("## Title\n\nSome **bold** and *soft* text here.\n\n- a\n- b\n\n> Quote");
    expect(markdownToHtml(md)).toContain("<strong>bold</strong>");
  });

  it("estimates reading time at 200 words a minute", () => {
    expect(readingMinutes("word ".repeat(1000))).toBe(5);
    expect(readingMinutes("")).toBe(1);
  });
});

describe("admin helpers", () => {
  const now = new Date("2026-09-23T12:00:00Z");

  it("shows a pending invite past its date as expired", () => {
    expect(effectiveStatus("sent", "2026-09-01T00:00:00Z")).toBe("expired");
    expect(effectiveStatus("opened", "2999-01-01T00:00:00Z")).toBe("opened");
    expect(effectiveStatus("revoked", "2026-09-01T00:00:00Z")).toBe("revoked");
  });

  it("keeps search text safe for PostgREST filters", () => {
    expect(searchTerm("thandi@example.co.za")).toBe("thandi@example.co.za");
    expect(searchTerm("a,b)or(c*%")).toBe("a b or c");
    expect(searchTerm(["x"])).toBe("");
  });

  it("formats time left and relative days", () => {
    const days = (n: number) => `${n} days`;
    expect(timeLeft("2026-09-28T12:00:00Z", days, now)).toBe("5 days");
    expect(timeLeft("2026-09-23T19:05:00Z", days, now)).toBe("7 h 05 min");
    expect(timeLeft("2026-09-01T00:00:00Z", days, now)).toBe("0 h 00 min");
    expect(withinADay("2026-09-24T06:00:00Z", now)).toBe(true);
    expect(relativeDays("2026-09-22T11:00:00Z", "en", now)).toBe("yesterday");
    expect(relativeDays(null, "en", now)).toBeNull();
  });

  it("prints rand the South African way in every language", () => {
    expect(formatZar(14900, "pt-PT")).toBe(formatZar(14900, "en-ZA"));
    expect(formatZar(14900).replace(/\s/g, " ")).toBe("R 149,00");
  });
});
