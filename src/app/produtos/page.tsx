import { Suspense } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ProductCard } from "@/components/commerce/product-card";
import { CatalogFilters } from "@/components/commerce/catalog-filters";
import { CatalogPagination } from "@/components/commerce/catalog-pagination";
import {
  getCategories,
  getProducts,
  getCategoryBySlug,
  type GetProductsParams,
} from "@/services/catalog.service";
import { PackageX, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { Metadata } from "next";

interface ProdutosPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: ProdutosPageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const categorySlug = typeof resolved.categoria === "string" ? resolved.categoria : undefined;

  if (categorySlug) {
    const category = await getCategoryBySlug(categorySlug);
    if (category) {
      return {
        title: `${category.name} | Catálogo Isis Store`,
        description: `Explore produtos selecionados da categoria ${category.name} na Isis Store.`,
      };
    }
  }

  return {
    title: "Catálogo de Produtos | Isis Store",
    description: "Confira nossa linha completa de produtos selecionados, presentes e personalizados.",
  };
}

export default async function ProdutosPage({ searchParams }: ProdutosPageProps) {
  const resolved = await searchParams;
  const categorySlug = typeof resolved.categoria === "string" ? resolved.categoria : undefined;
  const search = typeof resolved.busca === "string" ? resolved.busca : undefined;
  const sort =
    typeof resolved.ordem === "string"
      ? (resolved.ordem as GetProductsParams["sort"])
      : "newest";
  const page = typeof resolved.page === "string" ? parseInt(resolved.page, 10) || 1 : 1;

  const [categories, { products, total, totalPages }] = await Promise.all([
    getCategories(),
    getProducts({
      categorySlug,
      search,
      sort,
      page,
      limit: 12,
    }),
  ]);

  const activeCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : null;

  return (
    <div className="min-h-screen bg-fundo text-texto-escuro flex flex-col justify-between selection:bg-primaria-soft selection:text-primaria">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Navegação estrutural" className="mb-4">
          <ol className="flex items-center gap-2 text-xs text-texto-claro">
            <li>
              <Link href="/" className="hover:text-primaria transition-colors">
                Início
              </Link>
            </li>
            <li>&gt;</li>
            <li>
              <Link href="/produtos" className="hover:text-primaria transition-colors">
                Produtos
              </Link>
            </li>
            {activeCategory && (
              <>
                <li>&gt;</li>
                <li className="font-semibold text-texto-escuro" aria-current="page">
                  {activeCategory.name}
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-texto-escuro tracking-tight">
            {activeCategory ? activeCategory.name : "Catálogo de Produtos"}
          </h1>
          <p className="text-xs sm:text-sm text-texto-claro mt-1.5 max-w-2xl">
            {activeCategory?.description ||
              "Peças exclusivas, presentes personalizados e itens selecionados com o mais alto padrão de acabamento."}
          </p>
        </div>

        {/* Filters and Controls */}
        <Suspense fallback={<div className="h-24 bg-white rounded-2xl animate-pulse" />}>
          <CatalogFilters categories={categories} totalProducts={total} />
        </Suspense>

        {/* Product Grid or Empty State */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-borda p-12 text-center flex flex-col items-center justify-center my-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-fundo text-texto-claro flex items-center justify-center mb-4">
              <PackageX className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-texto-escuro">
              Nenhum produto encontrado
            </h2>
            <p className="text-xs text-texto-claro mt-1.5 max-w-md">
              Não encontramos resultados com os filtros ou termo de busca informado. Tente redefinir sua busca.
            </p>
            <div className="mt-6">
              <Link
                href="/produtos"
                className={buttonVariants({
                  variant: "default",
                  size: "default",
                  className: "flex items-center gap-2",
                })}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ver Todos os Produtos</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const primaryImage =
                product.product_images.find((img) => img.is_primary) ||
                product.product_images[0];

              const discount =
                product.sale_price_cents && product.sale_price_cents < product.price_cents
                  ? Math.round(
                      ((product.price_cents - product.sale_price_cents) /
                        product.price_cents) *
                        100
                    )
                  : undefined;

              return (
                <div key={product.id} className="flex flex-col">
                  <Link href={`/produtos/${product.slug}`} className="block h-full group">
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      category={product.categories?.name}
                      price={product.sale_price_cents || product.price_cents}
                      originalPrice={
                        product.sale_price_cents ? product.price_cents : undefined
                      }
                      discountPercent={discount}
                      imageUrl={primaryImage?.public_url || ""}
                      badgeText={product.featured ? "Destaque" : undefined}
                      className="h-full"
                    />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <Suspense fallback={null}>
          <CatalogPagination currentPage={page} totalPages={totalPages} />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-xs text-texto-claro border-t border-borda/60 bg-white">
        <p>&copy; {new Date().getFullYear()} Isis Store. Todos os direitos reservados.</p>
      </footer>

      <BottomNav />
    </div>
  );
}
