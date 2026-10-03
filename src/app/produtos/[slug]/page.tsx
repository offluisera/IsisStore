import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ProductGallery } from "@/components/commerce/product-gallery";
import { ProductActions } from "@/components/commerce/product-actions";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductViewTracker } from "@/components/commerce/product-view-tracker";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/services/catalog.service";
import { createClient } from "@/lib/supabase/server";
import { Star, ShieldCheck, RefreshCw, Sparkles } from "lucide-react";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Produto não encontrado | Isis Store",
    };
  }

  const primaryImage =
    product.product_images.find((img) => img.is_primary) ||
    product.product_images[0];

  return {
    title: `${product.name} | Isis Store`,
    description:
      product.short_description ||
      product.description?.slice(0, 160) ||
      `Compre ${product.name} na Isis Store com segurança e envio para todo o Brasil.`,
    openGraph: {
      title: product.name,
      description: product.short_description || undefined,
      images: primaryImage ? [{ url: primaryImage.public_url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryImage =
    product.product_images.find((img) => img.is_primary) ||
    product.product_images[0];

  const relatedProducts = await getRelatedProducts(
    product.category_id,
    product.id,
    4
  );

  const priceCents = product.sale_price_cents || product.price_cents;
  const originalPriceCents = product.sale_price_cents
    ? product.price_cents
    : undefined;

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const installment10x = (priceCents / 1000).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const pixPrice = ((priceCents * 0.95) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const supabase = await createClient();

  const [{ data: gateways }] = await Promise.all([
    supabase
      .from("payment_gateways")
      .select("name, is_active")
      .eq("is_active", true),
  ]);

  const activeGatewayNames = gateways?.map((g) => g.name) || [];
  const isMercadoPagoActive = activeGatewayNames.includes("mercadopago");
  const isWhatsAppActive = activeGatewayNames.includes("whatsapp");

  return (
    <div className="min-h-screen bg-fundo text-texto-escuro flex flex-col justify-between selection:bg-primaria-soft selection:text-primaria">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Registro do Histórico de Visualização do Cliente */}
        <ProductViewTracker
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            price_cents: product.price_cents,
            sale_price_cents: product.sale_price_cents,
            category_name: product.categories?.name,
            image_url: primaryImage?.public_url,
          }}
        />

        {/* Breadcrumb */}
        <nav aria-label="Navegação estrutural" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-texto-claro">
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
            {product.categories && (
              <>
                <li>&gt;</li>
                <li>
                  <Link
                    href={`/produtos?categoria=${product.categories.slug}`}
                    className="hover:text-primaria transition-colors"
                  >
                    {product.categories.name}
                  </Link>
                </li>
              </>
            )}
            <li>&gt;</li>
            <li className="font-semibold text-texto-escuro truncate max-w-[200px] sm:max-w-none" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Hero Grid (Gallery + Details Actions) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Coluna Esquerda: Galeria de Imagens */}
          <div className="lg:col-span-7">
            <ProductGallery
              images={product.product_images}
              productName={product.name}
            />
          </div>

          {/* Coluna Direita: Informações e Ações */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              {product.categories && (
                <Link
                  href={`/produtos?categoria=${product.categories.slug}`}
                  className="text-xs font-semibold uppercase tracking-wider text-primaria hover:underline inline-block mb-1.5"
                >
                  {product.categories.name}
                </Link>
              )}

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-texto-escuro tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mt-2 text-xs text-texto-claro">
                <span>SKU: {product.sku}</span>
                <span>&bull;</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-semibold text-texto-escuro">4.9</span>
                  <span className="text-texto-claro">(86 avaliações)</span>
                </div>
              </div>
            </div>

            {/* Bloco de Preço */}
            <div className="p-5 rounded-2xl bg-fundo-card border border-borda shadow-xs">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-primaria">
                  {formatPrice(priceCents)}
                </span>
                {originalPriceCents && (
                  <span className="text-sm text-texto-claro line-through">
                    {formatPrice(originalPriceCents)}
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-col gap-1 text-xs text-texto-medio">
                {isMercadoPagoActive && (
                  <>
                    <p>
                      ou até <strong>10x de {installment10x}</strong> sem juros no cartão
                    </p>
                    <p className="text-sucesso font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{pixPrice} no Pix (5% de desconto exclusivo)</span>
                    </p>
                  </>
                )}
                {isWhatsAppActive && !isMercadoPagoActive && (
                  <p className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Fechamento direto e exclusivo via WhatsApp oficial</span>
                  </p>
                )}
              </div>
            </div>

            {/* Ações de Compra e Frete */}
            <ProductActions
              productId={product.id}
              productName={product.name}
              priceCents={priceCents}
              stock={product.stock}
              imageUrl={primaryImage?.public_url}
              slug={product.slug}
              isMercadoPagoActive={isMercadoPagoActive}
              isWhatsAppActive={isWhatsAppActive}
            />
          </div>
        </div>

        {/* Detalhes do Produto / Descrição */}
        <section className="mt-16 bg-fundo-card rounded-2xl border border-borda p-6 sm:p-10 shadow-xs">
          <div className="border-b border-borda pb-4 mb-6">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro">
              Detalhes do Produto
            </h2>
          </div>

          <div className="prose max-w-none text-sm text-texto-medio leading-relaxed space-y-4">
            {product.short_description && (
              <p className="font-medium text-texto-escuro text-base">
                {product.short_description}
              </p>
            )}

            <p>
              {product.description ||
                "Este produto foi confeccionado com matérias-primas selecionadas e acabamento refinado, refletindo a excelência e o compromisso da Isis Store com produtos duráveis, elegantes e sofisticados."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-borda/60">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-texto-escuro">Qualidade Premium</h3>
                  <p className="text-[11px] text-texto-claro mt-0.5">
                    Materiais duráveis de alto padrão de acabamento.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-texto-escuro">Troca Descomplicada</h3>
                  <p className="text-[11px] text-texto-claro mt-0.5">
                    Até 7 dias após o recebimento com suporte total.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-sucesso shrink-0" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-texto-escuro">Compra 100% Segura</h3>
                  <p className="text-[11px] text-texto-claro mt-0.5">
                    Pagamento protegido e dados criptografados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Produtos Relacionados */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-2xl font-bold text-texto-escuro">
                  Você Também Pode Gostar
                </h2>
                <p className="text-xs text-texto-claro mt-1">
                  Outras opções selecionadas da mesma categoria
                </p>
              </div>

              {product.categories && (
                <Link
                  href={`/produtos?categoria=${product.categories.slug}`}
                  className="text-xs font-semibold text-primaria hover:underline"
                >
                  Ver mais &rarr;
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => {
                const primaryImage =
                  rel.product_images.find((img) => img.is_primary) ||
                  rel.product_images[0];

                return (
                  <Link
                    key={rel.id}
                    href={`/produtos/${rel.slug}`}
                    className="block h-full group"
                  >
                    <ProductCard
                      id={rel.id}
                      name={rel.name}
                      slug={rel.slug}
                      category={rel.categories?.name}
                      price={rel.sale_price_cents || rel.price_cents}
                      originalPrice={
                        rel.sale_price_cents ? rel.price_cents : undefined
                      }
                      imageUrl={primaryImage?.public_url || ""}
                      badgeText={rel.featured ? "Destaque" : undefined}
                      className="h-full"
                    />
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer />

      <BottomNav />
    </div>
  );
}
