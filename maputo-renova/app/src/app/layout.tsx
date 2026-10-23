import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { LiveProvider } from "@/components/live";
import { Shell } from "@/components/shell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Maputo Renova · Cobranças", template: "%s · Maputo Renova" },
  description: "Facturação de quotas de condomínio, pagamentos M-Pesa e e-Mola, reconciliação e inadimplência. Protótipo com dados fictícios.",
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-MZ" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <LiveProvider>
          <Shell>{children}</Shell>
        </LiveProvider>
      </body>
    </html>
  );
}
