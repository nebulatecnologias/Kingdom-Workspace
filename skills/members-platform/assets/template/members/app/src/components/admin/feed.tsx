import { IntentLink as Link } from "@/components/shell/intent-link";
import { getLocale, getTranslations } from "next-intl/server";
import type { FeedItem } from "@/lib/admin/activity";
import { timeOrDate } from "@/lib/admin/time";

/** Activity lines: the person as an @mention, codes and product names as chips, the admin in bold. */
export async function Feed({ items }: { items: FeedItem[] }) {
  const t = await getTranslations();
  const intlTag = await getLocale();
  return (
    <div className="feed">
      {items.map((f) => {
        const line = t.rich(f.key, {
          ...f.values,
          m: (c) => <span className="chip-mention">@{c}</span>,
          c: (c) => <span className="chip-code">{c}</span>,
          adm: (c) => <b style={{ fontWeight: 500 }}>{c}</b>,
        });
        return (
          <div className="feed-item" key={f.id}>
            <span>{f.href ? <Link className="feed-link" href={f.href}>{line}</Link> : line}</span>
            <time dateTime={f.at}>{timeOrDate(f.at, intlTag)}</time>
          </div>
        );
      })}
    </div>
  );
}
