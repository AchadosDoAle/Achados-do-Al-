import type { MetadataRoute } from "next";

const URL_SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://achadosdoale.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/login", "/api/", "/r/", "/favoritos"],
    },
    sitemap: `${URL_SITE}/sitemap.xml`,
    host: URL_SITE,
  };
}
