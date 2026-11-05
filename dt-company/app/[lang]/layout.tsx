import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getDict, languages, type Lang } from "@/lib/content";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDict(lang);
  return {
    title: {
      default: dict.meta.title,
      template: `%s — DT Company`,
    },
    description: dict.meta.description,
    alternates: {
      languages: { pt: "/pt/", en: "/en/" },
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <html lang={getDict(lang).htmlLang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Nav lang={lang as Lang} />
        <main>{children}</main>
        <Footer lang={lang as Lang} />
      </body>
    </html>
  );
}
