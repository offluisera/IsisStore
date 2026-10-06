import { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/services/catalog.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://isisstore.com.br";
  const now = new Date();

  // Rotas estáticas públicas fundamentais
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/produtos`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categorias`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/carrinho`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    const [categories, productsData] = await Promise.all([
      getCategories().catch(() => []),
      getProducts({ limit: 500 }).catch(() => ({ products: [] })),
    ]);

    const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
      url: `${baseUrl}/categorias/${cat.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const productRoutes: MetadataRoute.Sitemap = (productsData?.products || []).map((prod) => ({
      url: `${baseUrl}/produtos/${prod.slug}`,
      lastModified: prod.created_at ? new Date(prod.created_at) : now,
      changeFrequency: "daily",
      priority: 0.85,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error("Erro ao gerar sitemap dinâmico:", error);
    return staticRoutes;
  }
}
