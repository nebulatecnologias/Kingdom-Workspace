import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { googleSans } from "./fonts";
import "./globals.css";

const description = "Your Christian resources, all in one place.";

// Shared links (WhatsApp, Facebook, X, LinkedIn) show the Kingdom Library logo: opengraph-image.png and
// twitter-image.png in this folder. metadataBase makes their URLs absolute on the public domain.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")),
  title: { default: "Kingdom Library", template: "%s · Kingdom Library" },
  description,
  applicationName: "Kingdom Library",
  openGraph: { type: "website", siteName: "Kingdom Library", title: "Kingdom Library", description },
  // The logo is square, so the "summary" card shows it whole instead of cropping it.
  twitter: { card: "summary", title: "Kingdom Library", description },
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={googleSans.variable}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
