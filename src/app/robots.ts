import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://isisstore.com.br";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/produtos", "/produtos/*", "/categorias", "/categorias/*"],
        disallow: [
          "/admin",
          "/admin/*",
          "/conta",
          "/conta/*",
          "/checkout",
          "/checkout/*",
          "/api/*",
          "/auth/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
