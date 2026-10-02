import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
  serverExternalPackages: ["bcryptjs"],
  turbopack: {
    // OneDrive folders can sit outside the git root; pin it so Turbopack
    // does not warn about the ignored package-lock.json.
    root: __dirname,
  },
};

export default withNextIntl(nextConfig);

