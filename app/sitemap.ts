import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://ninefold-chord-lightfall.vercel.app",
      lastModified: "2026-08-18",
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
