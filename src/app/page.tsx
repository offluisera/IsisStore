"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Truck,
  ShieldCheck,
  Headphones,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Clock,
  Package,
  Award,
  Gift,
  Heart,
  Copy,
  Gem,
  MessageCircle,
  Check,
  Gamepad2,
  Baby,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ProductCard } from "@/components/commerce/product-card";
import { CategoryPill, OFFICIAL_CATEGORIES } from "@/components/commerce/category-pill";
import { RecentlyViewedSection } from "@/components/commerce/recently-viewed-section";
import { DailyDealsSection } from "@/components/commerce/daily-deals-section";
import { CategoryShowcaseSection } from "@/components/commerce/category-showcase-section";
import { getDailyDealsProducts } from "@/lib/deals/daily-deals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import type { CartItemData } from "@/components/commerce/cart-drawer";
import { useCart } from "@/features/cart/context/cart-context";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/lib/settings/store-settings-context";
import { HomeHeroSlider } from "@/components/commerce/home-hero-slider";
import { DEFAULT_HOME_SLIDES, HomeSlide } from "@/lib/slides/types";
import { FeatureIcon } from "@/components/commerce/feature-icon";
import { DEFAULT_BRAND_FEATURE_CARDS } from "@/lib/settings/types";

interface HomeProduct {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  sale_price_cents?: number | null;
  stock: number;
  featured: boolean;
  category_id?: string | null;
  categories?: { id?: string; name: string; slug?: string } | null;
  product_images?: { public_url: string; is_primary: boolean }[];
}

export default function Home() {
  const storeSettings = useStoreSettings();
  const [slides, setSlides] = React.useState<HomeSlide[]>(DEFAULT_HOME_SLIDES);
  const [products, setProducts] = React.useState<HomeProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(true);
  let cartCtx: ReturnType<typeof useCart> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    cartCtx = useCart();
  } catch {
    cartCtx = null;
  }
  const [wishlistCount, setWishlistCount] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState<
    "mais-vendidos" | "novidades" | "promocoes"
  >("mais-vendidos");
  const [notification, setNotification] = React.useState<{
    title: string;
    description: string;
    variant: "success" | "warning" | "error" | "info";
  } | null>(null);
  const [copiedCoupon, setCopiedCoupon] = React.useState(false);
  const [newsletterEmail, setNewsletterEmail] = React.useState("");
  const [isSubscribing, setIsSubscribing] = React.useState(false);

  React.useEffect(() => {
    async function loadHomeData() {
      try {
        const supabase = createClient();

        // 1. Carregar slides do carrossel principal
        const { data: slidesData } = await supabase
          .from("home_slides")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (slidesData && slidesData.length > 0) {
          setSlides(slidesData as HomeSlide[]);
        }

        // 2. Carregar produtos para as vitrines e ofertas
        const { data: prodsData } = await supabase
          .from("products")
          .select(
            "id, slug, name, price_cents, sale_price_cents, stock, featured, category_id, categories(id, name, slug), product_images(public_url, is_primary)"
          )
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(100);

        setProducts((prodsData as unknown as HomeProduct[]) || []);
      } catch (err) {
        console.error("Erro ao carregar dados da home:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadHomeData();
  }, []);

  // 15 produtos de ofertas do dia selecionados deterministicamente todo dia
  const dailyDealsProducts = React.useMemo(() => {
    return getDailyDealsProducts(
      products,
      storeSettings.daily_deals_product_limit || 15
    );
  }, [products, storeSettings.daily_deals_product_limit]);

  // Vitrines das categorias (até 15 produtos cada)
  const brinquedosProducts = React.useMemo(() => {
    return products
      .filter((p) => {
        const cat = `${p.categories?.slug || ""} ${p.categories?.name || ""}`.toLowerCase();
        return cat.includes("brinqued");
      })
      .slice(0, 15);
  }, [products]);

  const personalizadosProducts = React.useMemo(() => {
    return products
      .filter((p) => {
        const cat = `${p.categories?.slug || ""} ${p.categories?.name || ""}`.toLowerCase();
        return cat.includes("personaliz");
      })
      .slice(0, 15);
  }, [products]);

  const infantilProducts = React.useMemo(() => {
    return products
      .filter((p) => {
        const cat = `${p.categories?.slug || ""} ${p.categories?.name || ""}`.toLowerCase();
        return cat.includes("infantil") || cat.includes("baby") || cat.includes("beb");
      })
      .slice(0, 15);
  }, [products]);

  const semijoiasProducts = React.useMemo(() => {
    return products
      .filter((p) => {
        const cat = `${p.categories?.slug || ""} ${p.categories?.name || ""}`.toLowerCase();
        return (
          cat.includes("joia") ||
          cat.includes("semijoia") ||
          cat.includes("acessori") ||
          cat.includes("bijuteri")
        );
      })
      .slice(0, 15);
  }, [products]);

  // Produtos filtrados por tab para a seção "Produtos em alta"
  const filteredHighProducts = React.useMemo(() => {
    if (activeTab === "promocoes") {
      const promos = products.filter(
        (p) => p.sale_price_cents && p.sale_price_cents < p.price_cents
      );
      return (promos.length > 0 ? promos : products).slice(0, 8);
    }
    if (activeTab === "novidades") {
      return [...products]
        .sort((a, b) => b.id.localeCompare(a.id))
        .slice(0, 8);
    }
    const featured = products.filter((p) => p.featured);
    const nonFeatured = products.filter((p) => !p.featured);
    return [...featured, ...nonFeatured].slice(0, 8);
  }, [products, activeTab]);

  const handleAddToCart = (productId: string, customPriceCents?: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const primaryImg =
      prod.product_images?.find((i) => i.is_primary) ||
      prod.product_images?.[0];

    if (cartCtx) {
      cartCtx.addItem(
        {
          id: prod.id,
          name: prod.name,
          price: customPriceCents ?? (prod.sale_price_cents || prod.price_cents),
          imageUrl: primaryImg?.public_url || "/images/logo/logo.jpeg",
          slug: prod.slug,
          stock: prod.stock,
        },
        1
      );
      cartCtx.openCart();
    }

    setNotification({
      title: "Mimo adicionado ao carrinho! ♡",
      description: `${prod.name} já está na sua sacola de compras.`,
      variant: "success",
    });
  };

  const handleToggleWishlist = () => {
    setWishlistCount((prev) => prev + 1);
    setNotification({
      title: "Salvo nos seus favoritos!",
      description: "Você pode ver seus itens salvos a qualquer momento.",
      variant: "info",
    });
  };

  const handleCopyCoupon = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCoupon(true);
    setNotification({
      title: "Cupom copiado! ✨",
      description: `Código ${code} copiado. Cole no carrinho para garantir 10% OFF.`,
      variant: "success",
    });
    setTimeout(() => setCopiedCoupon(false), 3000);
  };

  const handleSubscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      setNotification({
        title: "E-mail inválido",
        description: "Por favor, digite um e-mail válido para se cadastrar.",
        variant: "warning",
      });
      return;
    }
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setNewsletterEmail("");
      setNotification({
        title: "Bem-vinda ao Clube Isis Lovers! ♡",
        description: "Você receberá mimos exclusivos e novidades em primeira mão.",
        variant: "success",
      });
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-fundo text-texto-escuro pb-20 lg:pb-0">
      {/* Header oficial com Drawer de Carrinho integrado */}
      <Header
        wishlistCount={wishlistCount}
      />

      {/* Toast flutuante de notificação */}
      {notification && (
        <div className="fixed bottom-24 lg:bottom-8 right-6 z-50 animate-in slide-in-from-bottom duration-300">
          <Toast
            variant={notification.variant}
            title={notification.title}
            description={notification.description}
            onClose={() => setNotification(null)}
          />
        </div>
      )}

      <main className="flex-1">
        {/* Carrossel Principal de Destaques — Estilo Magazine Luiza */}
        <HomeHeroSlider slides={slides} />

        {/* Barra de 4 Benefícios Oficiais (tela.png) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-5 rounded-2xl bg-fundo-card border border-borda flex items-center gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0 border border-primaria-border">
                <Truck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs sm:text-sm font-bold text-texto-escuro">Frete Grátis</h4>
                <p className="text-[11px] text-texto-claro">
                  Acima de{" "}
                  {((storeSettings.free_shipping_threshold_cents || 19900) / 100).toLocaleString(
                    "pt-BR",
                    { style: "currency", currency: "BRL" }
                  )}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-fundo-card border border-borda flex items-center gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0 border border-primaria-border">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs sm:text-sm font-bold text-texto-escuro">Pagamento Seguro</h4>
                <p className="text-[11px] text-texto-claro">Via Mercado Pago</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-fundo-card border border-borda flex items-center gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0 border border-primaria-border">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs sm:text-sm font-bold text-texto-escuro">Compra Garantida</h4>
                <p className="text-[11px] text-texto-claro">Seus dados protegidos</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-fundo-card border border-borda flex items-center gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0 border border-primaria-border">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs sm:text-sm font-bold text-texto-escuro">Atendimento com Amor</h4>
                <p className="text-[11px] text-texto-claro">Sempre com você</p>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de Categorias Oficiais (logo.jpeg & tela.png) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 text-center">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-texto-escuro text-left">
                Categorias <span className="text-primaria font-normal italic">em destaque</span>
              </h2>
              <p className="text-xs sm:text-sm text-texto-claro text-left mt-0.5">
                Navegue pelas principais famílias de produtos Isis Store
              </p>
            </div>
            <Link
              href="/categorias"
              className="text-xs sm:text-sm font-semibold text-primaria hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8">
            {OFFICIAL_CATEGORIES.map((cat) => (
              <CategoryPill key={cat.id} category={cat} />
            ))}
          </div>
        </section>

        {/* Histórico de visualização por último do cliente (Visto recentemente) */}
        <RecentlyViewedSection
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
        />

        {/* Ofertas do dia (Estilo Anexo 2 com 15 produtos aleatórios diários e desconto configurável) */}
        {storeSettings.daily_deals_active !== false && (
          <DailyDealsSection
            products={dailyDealsProducts}
            discountPercent={storeSettings.daily_deals_discount_percent ?? 15}
            title={storeSettings.daily_deals_title || "Ofertas do dia"}
            bgColor={storeSettings.daily_deals_bg_color || "#D9480F"}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {/* Vitrine: Brinquedos (até 15 produtos) */}
        <CategoryShowcaseSection
          categoryName="Brinquedos"
          categorySlug="brinquedos"
          subtitle="Diversão, criatividade e alegria garantida para a criançada"
          icon={<Gamepad2 className="w-4 h-4 text-primaria" />}
          products={brinquedosProducts}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
        />

        {/* Vitrine: Personalizados (até 15 produtos) */}
        <CategoryShowcaseSection
          categoryName="Personalizados"
          categorySlug="personalizados"
          subtitle="Presentes únicos e customizados que tocam o coração"
          icon={<Sparkles className="w-4 h-4 text-primaria" />}
          products={personalizadosProducts}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
        />

        {/* Vitrine: Infantil (até 15 produtos) */}
        <CategoryShowcaseSection
          categoryName="Infantil"
          categorySlug="infantil-baby"
          subtitle="Tudo pensado com delicadeza e carinho para os pequenos"
          icon={<Baby className="w-4 h-4 text-primaria" />}
          products={infantilProducts}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
        />

        {/* Vitrine: Joias e Semijoias (até 15 produtos) */}
        <CategoryShowcaseSection
          categoryName="Joias e Semijoias"
          categorySlug="joias-e-semijoias"
          subtitle="Brilho, sofisticação e acabamento premium para marcar momentos"
          icon={<Gem className="w-4 h-4 text-primaria" />}
          products={semijoiasProducts}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
        />

        {/* Seção de Produtos em Destaque (tela.png) */}
        <section id="produtos-destaque" className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-texto-escuro">
                Produtos <span className="text-primaria font-normal italic">em alta</span>
              </h2>
              <p className="text-xs sm:text-sm text-texto-claro mt-0.5">
                Os queridinhos escolhidos pelas nossas clientes
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="inline-flex rounded-xl bg-fundo-card border border-borda p-1 self-start sm:self-auto shadow-xs">
              <button
                onClick={() => setActiveTab("mais-vendidos")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "mais-vendidos"
                    ? "bg-primaria text-white shadow-xs"
                    : "text-texto-medio hover:text-primaria"
                }`}
              >
                Mais vendidos
              </button>
              <button
                onClick={() => setActiveTab("novidades")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "novidades"
                    ? "bg-primaria text-white shadow-xs"
                    : "text-texto-medio hover:text-primaria"
                }`}
              >
                Novidades
              </button>
              <button
                onClick={() => setActiveTab("promocoes")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "promocoes"
                    ? "bg-primaria text-white shadow-xs"
                    : "text-texto-medio hover:text-primaria"
                }`}
              >
                Promoções
              </button>
            </div>
          </div>

          {isLoadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl border border-borda bg-fundo-card p-4 h-84 animate-pulse flex flex-col justify-between"
                >
                  <div className="aspect-square bg-fundo rounded-xl w-full" />
                  <div className="space-y-2 mt-4">
                    <div className="h-4 bg-fundo rounded w-3/4" />
                    <div className="h-4 bg-fundo rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredHighProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredHighProducts.map((product) => {
                const primaryImg =
                  product.product_images?.find((i) => i.is_primary) ||
                  product.product_images?.[0];
                const discount =
                  product.sale_price_cents &&
                  product.sale_price_cents < product.price_cents
                    ? Math.round(
                        ((product.price_cents - product.sale_price_cents) /
                          product.price_cents) *
                          100
                      )
                    : undefined;

                return (
                  <Link
                    key={product.id}
                    href={`/produtos/${product.slug}`}
                    className="block h-full group"
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      slug={product.slug}
                      category={product.categories?.name}
                      price={product.sale_price_cents || product.price_cents}
                      originalPrice={
                        product.sale_price_cents ? product.price_cents : undefined
                      }
                      discountPercent={discount}
                      imageUrl={primaryImg?.public_url || ""}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      badgeText={product.featured ? "Destaque" : undefined}
                      className="h-full"
                    />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-fundo-card rounded-2xl border border-borda p-12 text-center flex flex-col items-center justify-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-primaria-soft text-primaria flex items-center justify-center mb-3">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-texto-escuro">
                Catálogo em Atualização
              </h3>
              <p className="text-xs text-texto-claro mt-1 max-w-sm">
                Nenhum produto cadastrado no momento. Cadastre as peças reais da loja pelo Painel Admin.
              </p>
              <div className="mt-4">
                <Link
                  href="/admin/produtos/novo"
                  className="text-xs font-semibold text-primaria hover:underline"
                >
                  Cadastrar Primeiro Produto no Admin &rarr;
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* 1. Diferenciais de Qualidade & Confiança da Isis Store (100% Editável no Admin com Live Preview) */}
        {(() => {
          const badge = storeSettings.brand_features_badge || "Padrão de Excelência";
          const title = storeSettings.brand_features_title || "Por que escolher a Isis Store?";
          const subtitle =
            storeSettings.brand_features_subtitle ||
            "Cada semijoia e presente especial é produzido com carinho, durabilidade e acabamento impecável.";
          const featureCards =
            storeSettings.brand_features_cards &&
            storeSettings.brand_features_cards.length > 0
              ? storeSettings.brand_features_cards
              : DEFAULT_BRAND_FEATURE_CARDS;

          return (
            <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 border-t border-borda-suave">
              <div className="text-center max-w-2xl mx-auto mb-10">
                {badge && (
                  <Badge variant="default" className="mb-3 uppercase tracking-wider text-[11px]">
                    {badge}
                  </Badge>
                )}
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-texto-escuro">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-texto-claro mt-2">
                    {subtitle}
                  </p>
                )}
              </div>

              <div
                className={`grid gap-6 ${
                  featureCards.length === 1
                    ? "grid-cols-1 max-w-md mx-auto"
                    : featureCards.length === 2
                    ? "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto"
                    : featureCards.length === 3
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                }`}
              >
                {featureCards.map((card, i) => (
                  <div
                    key={card.id || i}
                    className="p-6 rounded-3xl bg-fundo-card border border-borda shadow-xs hover:border-primaria/40 hover:shadow-md transition-all duration-300 flex flex-col items-start gap-4 text-left"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primaria-soft text-primaria flex items-center justify-center shadow-xs shrink-0">
                      <FeatureIcon name={card.icon} className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-texto-escuro">
                        {card.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-texto-claro mt-2 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                    {card.badge_text && (
                      <Badge variant={card.badge_variant} className="mt-auto text-[10px]">
                        {card.badge_text}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* 2. Banner Editorial de Presentes & Cupom */}
        {storeSettings.editorial_banner_active !== false && (
          <section className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primaria-soft/40 via-fundo-card to-primaria-soft/20 border border-primaria/30 p-8 sm:p-12 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4 text-left">
                  {storeSettings.editorial_banner_badge && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primaria/10 text-primaria text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      {storeSettings.editorial_banner_badge}
                    </div>
                  )}
                  <h3 className="font-serif text-2xl sm:text-4xl font-bold text-texto-escuro leading-tight">
                    {storeSettings.editorial_banner_title || "A Arte de Presentear quem você mais Ama"}
                  </h3>
                  <p className="text-sm sm:text-base text-texto-claro leading-relaxed max-w-xl">
                    {storeSettings.editorial_banner_description ||
                      "Seja para um aniversário, data marcante ou simplesmente um gesto de carinho, a Isis Store cuida de cada detalhe: personalizamos o cartão de dedicatória e enviamos na embalagem de luxo pronta para encantar."}
                  </p>

                  {/* Bloco de Cupom de Boas-Vindas */}
                  {storeSettings.editorial_banner_coupon_active !== false && (
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 bg-fundo px-4 py-2 rounded-2xl border border-borda-suave shadow-2xs">
                        <span className="text-xs font-medium text-texto-claro">Cupom 1ª Compra:</span>
                        <span className="font-mono font-bold text-primaria text-sm sm:text-base tracking-wider">
                          {storeSettings.editorial_banner_coupon_code || "ISIS10"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyCoupon(storeSettings.editorial_banner_coupon_code || "ISIS10")
                          }
                          className="ml-2 p-1.5 rounded-lg hover:bg-primaria-soft text-texto-claro hover:text-primaria transition-colors"
                          title="Copiar cupom"
                        >
                          {copiedCoupon ? (
                            <Check className="w-4 h-4 text-sucesso" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {storeSettings.editorial_banner_coupon_text && (
                        <span className="text-xs text-texto-claro">
                          {storeSettings.editorial_banner_coupon_text}
                        </span>
                      )}
                    </div>
                  )}

                  {/* CTAs */}
                  <div className="pt-3 flex flex-wrap items-center gap-3">
                    <Link href={storeSettings.editorial_banner_button_link || "/produtos"}>
                      <Button size="lg" className="rounded-2xl gap-2 font-medium shadow-sm">
                        {storeSettings.editorial_banner_button_text || "Explorar Coleção Completa"}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>

                    <a
                      href={`https://wa.me/${storeSettings.support_phone || "5517992495308"}?text=${encodeURIComponent(
                        "Olá! Gostaria de ajuda para escolher um presente especial na Isis Store."
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="lg" className="rounded-2xl gap-2 font-medium bg-fundo hover:bg-primaria-soft/30">
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        {storeSettings.editorial_banner_whatsapp_button_text || "Personal Shopper no WhatsApp"}
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Imagem / Destaque de Produto Real */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden border border-borda shadow-lg">
                    <Image
                      src={
                        storeSettings.editorial_banner_image_url ||
                        "/images/products/colar-coracao-delicado-ouro-rosa.jpg"
                      }
                      alt={storeSettings.editorial_banner_image_title || "Semijoia delicada Isis Store"}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover hover:scale-105 transition-transform duration-700"
                      unoptimized={
                        storeSettings.editorial_banner_image_url?.startsWith("data:") ||
                        storeSettings.editorial_banner_image_url?.startsWith("blob:")
                      }
                    />
                    {(storeSettings.editorial_banner_image_tag ||
                      storeSettings.editorial_banner_image_title ||
                      storeSettings.editorial_banner_image_subtitle) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                        <div className="text-white">
                          {storeSettings.editorial_banner_image_tag && (
                            <p className="text-xs uppercase tracking-widest text-white/80 font-medium">
                              {storeSettings.editorial_banner_image_tag}
                            </p>
                          )}
                          {storeSettings.editorial_banner_image_title && (
                            <p className="font-serif text-lg font-bold text-white">
                              {storeSettings.editorial_banner_image_title}
                            </p>
                          )}
                          {storeSettings.editorial_banner_image_subtitle && (
                            <p className="text-xs text-white/90">
                              {storeSettings.editorial_banner_image_subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. Cuidados com a Semijoia & Clube VIP Isis Lovers */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Guia de Cuidados */}
            <div className="lg:col-span-7 p-8 rounded-3xl bg-fundo-card border border-borda shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primaria" />
                  <span className="text-xs font-semibold text-primaria uppercase tracking-wider">
                    Dicas de Conservação
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-texto-escuro">
                  Como Cuidar da sua Semijoia
                </h3>
                <p className="text-xs sm:text-sm text-texto-claro mt-1">
                  Com pequenos cuidados você preserva o brilho e a elegância das suas peças por muitos anos.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-fundo border border-borda-suave">
                    <span className="font-serif text-xl font-bold text-primaria">01</span>
                    <div>
                      <h4 className="text-sm font-bold text-texto-escuro">
                        Evite Contato com Produtos Químicos
                      </h4>
                      <p className="text-xs text-texto-claro mt-0.5 leading-relaxed">
                        Aplique perfumes, loções e cosméticos antes de colocar a sua semijoia, esperando a absorção completa.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-fundo border border-borda-suave">
                    <span className="font-serif text-xl font-bold text-primaria">02</span>
                    <div>
                      <h4 className="text-sm font-bold text-texto-escuro">
                        Armazene em Local Seco e Individual
                      </h4>
                      <p className="text-xs text-texto-claro mt-0.5 leading-relaxed">
                        Guarde em compartimentos individuais ou no saquinho Isis para evitar o atrito entre diferentes metais.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-fundo border border-borda-suave">
                    <span className="font-serif text-xl font-bold text-primaria">03</span>
                    <div>
                      <h4 className="text-sm font-bold text-texto-escuro">
                        Limpeza Suave com Flanela Seca
                      </h4>
                      <p className="text-xs text-texto-claro mt-0.5 leading-relaxed">
                        Após o uso, passe suavemente uma flanela macia para remover a oleosidade natural da pele e renovar o brilho.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-borda-suave flex items-center justify-between text-xs text-texto-claro">
                <span>Dúvidas sobre manutenção e garantia?</span>
                <Link href="/contato" className="text-primaria font-semibold hover:underline">
                  Fale com nosso suporte &rarr;
                </Link>
              </div>
            </div>

            {/* Newsletter Clube VIP */}
            <div className="lg:col-span-5 p-8 rounded-3xl bg-linear-to-b from-fundo-card to-primaria-soft/20 border border-primaria/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primaria-soft text-primaria flex items-center justify-center mb-4 shadow-2xs">
                  <Heart className="w-6 h-6 fill-primaria/20" />
                </div>
                <Badge variant="default" className="mb-2 text-[10px]">
                  Clube VIP Isis Lovers
                </Badge>
                <h3 className="font-serif text-2xl font-bold text-texto-escuro">
                  Mimos & Lançamentos Exclusivos
                </h3>
                <p className="text-xs sm:text-sm text-texto-claro mt-2 leading-relaxed">
                  Cadastre seu e-mail para receber lançamentos antecipados, benefícios secretos e um presente no mês do seu aniversário.
                </p>

                <form onSubmit={handleSubscribeNewsletter} className="mt-6 space-y-3">
                  <Input
                    label="Seu melhor e-mail"
                    type="email"
                    placeholder="voce@exemplo.com"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    isRequired
                  />
                  <Button
                    type="submit"
                    className="w-full rounded-2xl font-medium shadow-sm"
                    isLoading={isSubscribing}
                  >
                    Fazer Parte do Clube VIP
                  </Button>
                </form>
              </div>

              <div className="mt-6 pt-4 border-t border-borda-suave text-center">
                <p className="text-[11px] text-texto-claro">
                  Prometemos zero spam. Cancele sua inscrição quando desejar.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Oficial */}
      <Footer />

      {/* Navegação Mobile Inferior Fixa */}
      <BottomNav />
    </div>
  );
}
