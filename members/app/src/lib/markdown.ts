/**
 * The chapter editor uses a small Markdown: "## " and "### " headings, "> " quotes, "- " and "1. " lists,
 * **bold**, *italic*, [links](https://…) and blank lines between paragraphs.
 * Everything is escaped first, so typed HTML shows as text; the result is sanitised again before saving.
 */

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function inline(s: string) {
  return escape(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(((?:https:\/\/|mailto:)[^\s)]+)\)/g, '<a href="$2">$1</a>');
}

export function markdownToHtml(md: string): string {
  const blocks = md.replace(/\r\n?/g, "\n").trim().split(/\n{2,}/);
  const out: string[] = [];
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trimEnd());
    if (!lines.join("").trim()) continue;
    const first = lines[0];
    if (/^###\s+/.test(first) && lines.length === 1) out.push(`<h3>${inline(first.replace(/^###\s+/, ""))}</h3>`);
    else if (/^##\s+/.test(first) && lines.length === 1) out.push(`<h2>${inline(first.replace(/^##\s+/, ""))}</h2>`);
    else if (lines.every((l) => /^>\s?/.test(l))) out.push(`<blockquote><p>${lines.map((l) => inline(l.replace(/^>\s?/, ""))).join("<br>")}</p></blockquote>`);
    else if (lines.every((l) => /^[-*]\s+/.test(l))) out.push(`<ul>${lines.map((l) => `<li>${inline(l.replace(/^[-*]\s+/, ""))}</li>`).join("")}</ul>`);
    else if (lines.every((l) => /^\d+[.)]\s+/.test(l))) out.push(`<ol>${lines.map((l) => `<li>${inline(l.replace(/^\d+[.)]\s+/, ""))}</li>`).join("")}</ol>`);
    else out.push(`<p>${lines.map(inline).join("<br>")}</p>`);
  }
  return out.join("\n");
}

const decode = (s: string) =>
  s.replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&rsquo;/g, "’").replace(/&amp;/g, "&");

/** Best-effort way back, for chapters that were written as HTML before the editor existed. */
export function htmlToMarkdown(html: string): string {
  const text = (s: string) =>
    decode(
      s
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, "**$2**")
        .replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, "*$2*")
        .replace(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
        .replace(/<[^>]+>/g, ""),
    ).trim();
  const out: string[] = [];
  const re = /<(h2|h3|h4|p|blockquote|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const [, tag, inner] = m;
    const t = tag.toLowerCase();
    if (t === "h2") out.push(`## ${text(inner)}`);
    else if (t === "h3" || t === "h4") out.push(`### ${text(inner)}`);
    else if (t === "blockquote") out.push(text(inner.replace(/<\/p>\s*<p[^>]*>/gi, "<br>")).split("\n").map((l) => `> ${l}`).join("\n"));
    else if (t === "ul" || t === "ol") {
      const items = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((x) => text(x[1]));
      out.push(items.map((it, i) => (t === "ul" ? `- ${it}` : `${i + 1}. ${it}`)).join("\n"));
    } else out.push(text(inner));
  }
  return out.length ? out.join("\n\n") : text(html);
}

/** Reading time at 200 words a minute, at least one minute. */
export function readingMinutes(md: string) {
  const words = md.replace(/[#>*_\-[\]()]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
