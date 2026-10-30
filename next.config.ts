import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone", // minimal server bundle for the Docker image
  cacheComponents: true,
  // Decks (10 MB) and videos (25 MB) go through Server Actions; the default limit is 1 MB. Cloud Run caps a request at 32 MiB.
  experimental: {
    serverActions: { bodySizeLimit: "27mb" },
    // proxy.ts (the sign-in gate) reads request bodies and CUTS THEM OFF at 10 MB by default, which turned every upload over
    // ~10 MB into "Unexpected end of form" and a full-page server error. 30 MB covers the 25 MB video plus form overhead.
    proxyClientMaxBodySize: "30mb",
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
