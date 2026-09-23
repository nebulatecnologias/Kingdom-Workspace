import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // This app lives in members/app inside a larger workspace; keep Turbopack scoped to it.
  turbopack: { root: process.cwd() },
  outputFileTracingRoot: process.cwd(),
};

export default withNextIntl(nextConfig);
