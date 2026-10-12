import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone", // minimal server bundle for the Docker image
  cacheComponents: true,
  // Decks (10 MB) and videos (25 MB) go through Server Actions; the default limit is 1 MB. Cloud Run caps a request at 32 MiB.
  experimental: { serverActions: { bodySizeLimit: "27mb" } },
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
