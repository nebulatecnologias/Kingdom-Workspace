import { Google_Sans } from "next/font/google";

export const googleSans = Google_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-google-sans",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Product Sans", "Segoe UI", "Roboto", "system-ui", "sans-serif"],
});
