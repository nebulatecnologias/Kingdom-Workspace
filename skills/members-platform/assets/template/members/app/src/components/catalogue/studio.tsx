"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Download, RotateCcw, X } from "lucide-react";

export const CRAYONS = ["#f2594b", "#ff9f43", "#ffd54a", "#6cc56a", "#5ab0e6", "#5e8fd6", "#b69cff", "#ff8fb1", "#a8743f", "#8a8f98", "#2e2a26"];
const ERASER = "#ffffff";

type Labels = { crayon: string; eraser: string; reset: string; download: string; done: string; palette: string };

/**
 * Colouring studio. Built-in art is SVG with fillable regions (class "r"): tap a region to fill it.
 * Uploaded art (any image) is drawn on a canvas and filled with a flood fill that stops at the dark lines.
 * Colours are remembered on this device.
 */
export function Studio(props: {
  svg?: string;
  imageUrl?: string;
  storageKey: string;
  fileName: string;
  doneHref: string;
  labels: Labels;
}) {
  const [crayon, setCrayon] = useState(CRAYONS[0]);
  const paperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const regions = useCallback(() => [...(paperRef.current?.querySelectorAll<SVGElement>("svg .r") ?? [])], []);

  const saveSvg = useCallback(() => {
    const fills: Record<number, string> = {};
    regions().forEach((el, i) => {
      const f = el.getAttribute("fill");
      if (f && f !== ERASER) fills[i] = f;
    });
    try {
      localStorage.setItem(props.storageKey, JSON.stringify(fills));
    } catch {
      /* storage full or blocked */
    }
  }, [props.storageKey, regions]);

  const drawBlank = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, []);

  // Restore saved colours (SVG) or load the image into the canvas.
  useEffect(() => {
    if (props.svg) {
      try {
        const saved = JSON.parse(localStorage.getItem(props.storageKey) ?? "{}") as Record<string, string>;
        regions().forEach((el, i) => {
          if (saved[i]) el.setAttribute("fill", saved[i]);
        });
      } catch {
        /* nothing saved */
      }
      return;
    }
    if (!props.imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current!;
      const scale = Math.min(1, 1400 / Math.max(img.naturalWidth, img.naturalHeight));
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      drawBlank();
      try {
        const saved = localStorage.getItem(props.storageKey);
        if (saved) {
          const prev = new Image();
          prev.onload = () => canvas.getContext("2d")!.drawImage(prev, 0, 0, canvas.width, canvas.height);
          prev.src = saved;
        }
      } catch {
        /* nothing saved */
      }
    };
    img.src = props.imageUrl;
  }, [props.svg, props.imageUrl, props.storageKey, regions, drawBlank]);

  const onSvgClick = (e: React.MouseEvent) => {
    const region = (e.target as Element).closest?.("svg .r");
    if (!region) return;
    region.setAttribute("fill", crayon);
    saveSvg();
  };

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);
    floodFill(canvas.getContext("2d", { willReadFrequently: true })!, x, y, hex(crayon));
    try {
      localStorage.setItem(props.storageKey, canvas.toDataURL("image/png"));
    } catch {
      /* too large to keep: colours stay until the page is closed */
    }
  };

  const reset = () => {
    if (props.svg) {
      regions().forEach((el) => el.setAttribute("fill", "#fff"));
    } else {
      drawBlank();
    }
    try {
      localStorage.removeItem(props.storageKey);
    } catch {
      /* ignore */
    }
  };

  const download = async () => {
    let canvas = canvasRef.current;
    if (props.svg) {
      const svgEl = paperRef.current!.querySelector("svg")!;
      const clone = svgEl.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("width", "1600");
      clone.setAttribute("height", "1600");
      const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" }));
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.src = url;
      });
      canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1600;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, 1600, 1600);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
    }
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = props.fileName;
    a.click();
  };

  return (
    <div className="studio">
      <div className="paper" ref={paperRef}>
        {props.svg ? (
          // Built-in art is static markup from src/lib/art.ts.
          <div onClick={onSvgClick} style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: props.svg }} />
        ) : (
          <canvas ref={canvasRef} onClick={onCanvasClick} style={{ width: "100%", height: "auto", cursor: "crosshair", touchAction: "manipulation" }} />
        )}
      </div>
      <div className="stack" style={{ alignContent: "start" }}>
        <div className="crayons" role="group" aria-label={props.labels.palette}>
          {CRAYONS.map((c, i) => (
            <button
              key={c}
              type="button"
              className="crayon"
              style={{ background: c }}
              aria-pressed={crayon === c}
              aria-label={props.labels.crayon.replace("{n}", String(i + 1))}
              onClick={() => setCrayon(c)}
            />
          ))}
          <button type="button" className="crayon eraser" aria-pressed={crayon === ERASER} aria-label={props.labels.eraser} onClick={() => setCrayon(ERASER)}>
            <X className="icon icon-sm" aria-hidden="true" />
          </button>
        </div>
        <button type="button" className="btn btn-ghost btn-block" onClick={reset}>
          <RotateCcw className="icon icon-sm" aria-hidden="true" />
          {props.labels.reset}
        </button>
        <button type="button" className="btn btn-ghost btn-block" onClick={download}>
          <Download className="icon icon-sm" aria-hidden="true" />
          {props.labels.download}
        </button>
        <Link className="btn btn-primary btn-block" href={props.doneHref}>
          {props.labels.done}
        </Link>
      </div>
    </div>
  );
}

function hex(c: string): [number, number, number] {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Scanline flood fill from (x, y). Dark pixels are the drawing's lines and stop the fill. */
function floodFill(ctx: CanvasRenderingContext2D, x: number, y: number, [fr, fg, fb]: [number, number, number]) {
  const { width: w, height: h } = ctx.canvas;
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const image = ctx.getImageData(0, 0, w, h);
  const d = image.data;
  const at = (px: number, py: number) => (py * w + px) * 4;
  const i0 = at(x, y);
  const [tr, tg, tb] = [d[i0], d[i0 + 1], d[i0 + 2]];
  const isLine = (i: number) => d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114 < 110;
  if (isLine(i0) || (tr === fr && tg === fg && tb === fb)) return;
  const tolerance = 60;
  const matches = (i: number) => !isLine(i) && Math.abs(d[i] - tr) + Math.abs(d[i + 1] - tg) + Math.abs(d[i + 2] - tb) <= tolerance;
  const seen = new Uint8Array(w * h);
  const stack: [number, number][] = [[x, y]];
  while (stack.length) {
    const [sx, sy] = stack.pop()!;
    let lx = sx;
    while (lx > 0 && !seen[sy * w + lx - 1] && matches(at(lx - 1, sy))) lx--;
    let rx = sx;
    while (rx < w - 1 && !seen[sy * w + rx + 1] && matches(at(rx + 1, sy))) rx++;
    for (let px = lx; px <= rx; px++) {
      const i = at(px, sy);
      seen[sy * w + px] = 1;
      d[i] = fr;
      d[i + 1] = fg;
      d[i + 2] = fb;
      d[i + 3] = 255;
      for (const ny of [sy - 1, sy + 1]) {
        if (ny >= 0 && ny < h && !seen[ny * w + px] && matches(at(px, ny))) stack.push([px, ny]);
      }
    }
  }
  ctx.putImageData(image, 0, 0);
}
