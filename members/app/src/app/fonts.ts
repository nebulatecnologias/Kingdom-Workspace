import { Google_Sans } from "next/font/google";

export const googleSans = Google_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-google-sans",
  display: "swap",
  // A size-adjusted fallback keeps text the same size while the font loads, so nothing jumps (CLS).
  adjustFontFallback: true,
  fallback: ["Product Sans", "Segoe UI", "Roboto", "system-ui", "sans-serif"],
});
