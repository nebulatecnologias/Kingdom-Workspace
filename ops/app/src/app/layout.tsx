import type { Metadata, Viewport } from "next";
import { googleSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Kingdom Ops", template: "%s · Kingdom Ops" },
  description: "Reuniões, pipelines e atas do escritório Kingdom.",
  applicationName: "Kingdom Ops",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#f4f6ef", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={googleSans.variable} data-theme="light">
      <body>{children}</body>
    </html>
  );
}
