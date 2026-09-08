import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { TOOLS } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/tools", "/about", "/contact", "/privacy", "/terms"];

  return [
    ...pages.map((path) => ({
      url: `${SITE.url}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...TOOLS.map((tool) => ({
      url: `${SITE.url}/tools/${tool.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
