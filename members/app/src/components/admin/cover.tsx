import { Art } from "@/components/catalogue/art";

/** A small product cover on its field colour, for admin lists. */
export function MiniCover({ path, url, colour, size, className = "sc-thumb", line }: { path: string | null; url?: string; colour: string; size?: number; className?: string; line?: boolean }) {
  return (
    <span className={className} style={{ background: colour, ...(size ? { width: size, height: size, borderRadius: Math.round(size / 3.4) } : {}) }} aria-hidden="true">
      <Art path={path} url={url} mode={line ? "line" : "color"} />
    </span>
  );
}
