import { artSvg, isBuiltinArt } from "@/lib/art";

/**
 * A cover or page drawing: built-in sample art is inlined as SVG (so the colouring studio can fill it),
 * uploaded art is shown from a short-lived URL.
 */
export function Art({ path, url, mode = "color", alt = "", id }: { path: string | null; url?: string; mode?: "color" | "line"; alt?: string; id?: string }) {
  if (isBuiltinArt(path)) {
    // display: contents keeps the SVG sized by its container, as in the design system's CSS.
    return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: artSvg(path.slice(8), mode, id) }} />;
  }
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element -- signed storage URLs change hourly; next/image adds nothing here
    return <img src={url} alt={alt} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "contain" }} />;
  }
  return null;
}
