"use client";

/**
 * In-app navigation history for this tab (kept in sessionStorage so a reload doesn't lose it).
 * Back buttons and the phone tab bar read it, so "back" returns to where the person came from
 * (with its filters) instead of a fixed page, and form pages are skipped.
 */
const KEY = "ko:nav";
const MAX = 30;
const FORM = /\/(new|edit)(\/|$)/;

// `merged`: this entry absorbed same-page query changes, so the browser history has extra steps here.
type Entry = { url: string; merged?: boolean };
let entries: Entry[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) entries = (JSON.parse(raw) as Entry[]).filter((e) => typeof e?.url === "string");
  } catch {
    entries = [];
  }
}

function save() {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    /* private mode: history only lives in memory */
  }
}

const pathOf = (url: string) => url.split("?")[0];

/** Called on every navigation with the full URL (path + query). */
export function recordVisit(url: string) {
  load();
  const last = entries[entries.length - 1];
  if (last?.url === url) return;
  // Same page with another query (tabs, filters): replace instead of stacking.
  if (last && pathOf(last.url) === pathOf(url)) entries[entries.length - 1] = { url, merged: true };
  else entries.push({ url });
  if (entries.length > MAX) entries = entries.slice(-MAX);
  save();
  listeners.forEach((l) => l());
}

/** Where "back" should go from the current page: the latest earlier page that isn't a form or this same page. */
export function backTarget(current: string): { url: string; isPrevious: boolean } | null {
  load();
  const here = pathOf(current);
  for (let i = entries.length - 1; i >= 0; i--) {
    const u = entries[i].url;
    const p = pathOf(u);
    if (p === here || FORM.test(p)) continue;
    // isPrevious: the page just before this one in the browser history too, so router.back() lands exactly there.
    const cur = entries[entries.length - 1];
    const isPrevious = i === entries.length - 2 && pathOf(cur.url) === here && !cur.merged;
    return { url: u, isPrevious };
  }
  return null;
}

/** Remove the current entry once we leave it with back (keeps the stack honest). */
export function popTo(url: string) {
  load();
  const i = entries.map((e) => e.url).lastIndexOf(url);
  if (i >= 0) {
    entries = entries.slice(0, i + 1);
    save();
    listeners.forEach((l) => l());
  }
}

/** The latest visited URL whose path matches, for remembering the last pipeline or agenda filter. */
export function lastMatching(re: RegExp): string | null {
  load();
  for (let i = entries.length - 1; i >= 0; i--) if (re.test(pathOf(entries[i].url))) return entries[i].url;
  return null;
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

let version = 0;
subscribe(() => version++);
export const getVersion = () => version;
