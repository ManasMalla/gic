import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/sponsors", "/register"].map((path) => ({ url: `${site.url}${path}` }));
}
