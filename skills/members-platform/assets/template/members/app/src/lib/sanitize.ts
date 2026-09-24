import "server-only";
import sanitizeHtml from "sanitize-html";

/** Chapter HTML is written by admins; still, only simple text formatting ever reaches the page. */
export function sanitizeChapter(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "blockquote", "ul", "ol", "li", "a", "hr", "sup", "sub"],
    allowedAttributes: { a: ["href"] },
    allowedSchemes: ["https", "mailto"],
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }) },
  });
}
