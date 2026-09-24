import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { googleSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Kingdom Library", template: "%s · Kingdom Library" },
  description: "Your Christian resources, all in one place.",
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
