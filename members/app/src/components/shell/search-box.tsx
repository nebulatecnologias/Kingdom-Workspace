"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

/** Top-bar search. A plain GET form to the library, so it works without JavaScript; keeps the current query. */
export function SearchBox({ label, action }: { label: string; action: string }) {
  const params = useSearchParams();
  return (
    <form className="search" role="search" action={action}>
      <Search className="icon" aria-hidden="true" />
      <label className="sr" htmlFor="top-search">
        {label}
      </label>
      <input id="top-search" name="q" type="search" placeholder={label} defaultValue={params.get("q") ?? ""} autoComplete="off" />
      {params.get("filter") ? <input type="hidden" name="filter" value={params.get("filter")!} /> : null}
    </form>
  );
}
