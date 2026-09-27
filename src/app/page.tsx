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
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ProductCard } from "@/components/commerce/product-card";
import { CategoryPill, OFFICIAL_CATEGORIES } from "@/components/commerce/category-pill";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Toast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { CartItemData } from "@/components/commerce/cart-drawer";

// Produtos oficiais de demonstração baseados no catálogo oficial
const SAMPLE_PRODUCTS = [
  {
    id: "p1",
    slug: "headphone-bluetooth-rosa-soft",
    name: "Headphone Bluetooth Rosa Soft",
    category: "Casa / Eletrônicos",
    price: 19990,
    originalPrice: 24990,
    discountPercent: 20,
    rating: 4.8,
    reviewCount: 124,
    imageUrl: "/images/products/headphone-bluetooth-rosa-soft.jpg",
    colors: ["#E08CA3", "#F9C7D4", "#574240"],
  },
  {
    id: "p2",
    slug: "ursinho-de-pelucia-carinho",
    name: "Ursinho de Pelúcia Carinho",
    category: "Infantil / Baby",
    price: 8990,
    badgeText: "Novo",
    rating: 4.9,
    reviewCount: 89,
    imageUrl: "/images/products/ursinho-de-pelucia-carinho.jpg",
    colors: ["#D4A373", "#E08CA3"],
  },
  {
    id: "p3",
    slug: "mochila-feminina-elegante",
    name: "Mochila Feminina Elegante",
    category: "Acessórios",
    price: 16990,
    originalPrice: 19990,
    discountPercent: 15,
    rating: 4.7,
    reviewCount: 67,
    imageUrl: "/images/products/mochila-feminina-elegante.jpg",
    colors: ["#E08CA3", "#574240"],
  },
  {
    id: "p4",
    slug: "colar-coracao-delicado-ouro-rosa",
    name: "Colar Coração Delicado Ouro Rosa",
    category: "Acessórios",
    price: 5990,
    badgeText: "Mais vendido",
    rating: 4.9,
    reviewCount: 156,
    imageUrl: "/images/products/colar-coracao-delicado-ouro-rosa.jpg",
  },
];

export default function Home() {
  const [cart, setCart] = React.useState<CartItemData[]>([
    {
      id: "p1",
      name: "Headphone Bluetooth Rosa Soft",
      price: 19990,
      quantity: 1,
      imageUrl: "/images/banner-rosto.jpeg",
    },
  ]);
  const [wishlistCount, setWishlistCount] = React.useState(2);
  const [activeTab, setActiveTab] = React.useState<"mais-vendidos" | "novidades" | "promocoes">(
    "mais-vendidos"
  );
  const [notification, setNotification] = React.useState<{
    title: string;
    description: string;
    variant: "success" | "warning" | "error" | "info";
  } | null>(null);

  const handleAddToCart = (productId: string) => {
    const existing = cart.find((i) => i.id === productId);
    if (existing) {
      setCart(cart.map((i) => (i.id === productId ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      const prod = SAMPLE_PRODUCTS.find((p) => p.id === productId);
      if (prod) {
        setCart([...cart, { id: prod.id, name: prod.name, price: prod.price, quantity: 1, imageUrl: prod.imageUrl }]);
      }
    }
    setNotification({
      title: "Mimo adicionado ao carrinho! ♡",
      description: "Seu produto foi reservado com carinho.",
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

  return (
    <div className="min-h-screen flex flex-col bg-fundo text-texto-escuro pb-20 lg:pb-0">
      {/* Header oficial com Drawer de Carrinho integrado */}
      <Header
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        cartItems={cart}
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
        {/* Hero Banner Oficial (tela.png e banner-rosto.jpeg) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-secundaria-clara/60 via-fundo-card to-secundaria/40 border border-primaria-border/40 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 p-8 sm:p-12 lg:p-14">
              {/* Lado Esquerdo: Conteúdo Editorial */}
              <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-primaria-border text-primaria text-xs font-semibold uppercase tracking-wider mb-4 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  Coleção Especial
                </div>

                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-texto-escuro tracking-tight leading-[1.12]">
                  Produtos que fazem{" "}
                  <span className="italic font-bold text-primaria">você sorrir! ♡</span>
                </h1>

                <p className="mt-5 text-sm sm:text-base text-texto-medio max-w-lg leading-relaxed font-normal">
                  Beleza, estilo, conforto e muito afeto para o seu dia a dia. Conheça nossa seleção de mimos pensados com amor em cada detalhe.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Button
                    size="lg"
                    onClick={() => {
                      const el = document.getElementById("produtos-destaque");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="gap-2 shadow-sm font-semibold"
                  >
                    Ver Coleção
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <Link href="/sobre">
                    <Button variant="outline" size="lg" className="font-semibold">
                      Nossa História
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Lado Direito: Banner Oficial com Imagem */}
              <div className="lg:col-span-5 relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-white">
                <Image
                  src="/images/banner-rosto.jpeg"
                  alt="Isis Store — Coleção Especial"
                  fill
                  className="object-cover object-center"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Barra de 4 Benefícios Oficiais (tela.png) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-borda flex items-center gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0 border border-primaria-border">
                <Truck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs sm:text-sm font-bold text-texto-escuro">Frete Grátis</h4>
                <p className="text-[11px] text-texto-claro">Acima de R$ 199,00</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-borda flex items-center gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0 border border-primaria-border">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs sm:text-sm font-bold text-texto-escuro">Pagamento Seguro</h4>
                <p className="text-[11px] text-texto-claro">Via Mercado Pago</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-borda flex items-center gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0 border border-primaria-border">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs sm:text-sm font-bold text-texto-escuro">Compra Garantida</h4>
                <p className="text-[11px] text-texto-claro">Seus dados protegidos</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-borda flex items-center gap-3.5 shadow-xs">
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
            <div className="inline-flex rounded-xl bg-white border border-borda p-1 self-start sm:self-auto shadow-xs">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {SAMPLE_PRODUCTS.map((product) => (
              <Link
                key={product.id}
                href={`/produtos/${product.slug}`}
                className="block h-full group"
              >
                <ProductCard
                  {...product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  className="h-full"
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Vitrine do Design System: Componentes e Estados (design-1.png & design-2.png) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 border-t border-borda-suave">
          <div className="text-center max-w-xl mx-auto mb-10">
            <Badge variant="default" className="mb-2">
              Design System Showcase — Fase 02
            </Badge>
            <h2 className="font-serif text-3xl font-bold text-texto-escuro">
              Guia Visual & Componentes Reutilizáveis
            </h2>
            <p className="text-xs sm:text-sm text-texto-claro mt-2">
              Componentes atômicos testados e integrados às referências de design do cliente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bloco 1: Botões & Badges */}
            <div className="p-6 rounded-3xl bg-white border border-borda shadow-xs flex flex-col gap-4 text-left">
              <h3 className="font-serif text-lg font-bold text-texto-escuro border-b border-borda-suave pb-2">
                Botões e Badges
              </h3>
              <div className="flex flex-wrap gap-2.5">
                <Button size="sm">Primário</Button>
                <Button size="sm" variant="secondary">Secundário</Button>
                <Button size="sm" variant="outline">Outline</Button>
                <Button size="sm" variant="ghost">Ghost</Button>
                <Button size="sm" isLoading>Carregando</Button>
              </div>

              <div className="pt-3 border-t border-borda-suave flex flex-wrap gap-2">
                <Badge variant="success">Em estoque</Badge>
                <Badge variant="warning">Últimas unidades</Badge>
                <Badge variant="destructive">Esgotado</Badge>
                <Badge variant="discount">-20% OFF</Badge>
              </div>
            </div>

            {/* Bloco 2: Formulários e Inputs */}
            <div className="p-6 rounded-3xl bg-white border border-borda shadow-xs flex flex-col gap-4 text-left">
              <h3 className="font-serif text-lg font-bold text-texto-escuro border-b border-borda-suave pb-2">
                Formulários & Estados
              </h3>
              <Input
                label="E-mail ou Usuário"
                placeholder="exemplo@seuemail.com"
                isRequired
              />
              <Input
                label="Senha com Erro"
                type="password"
                placeholder="Digite sua senha"
                error="Campo obrigatório"
                isRequired
              />
              <Checkbox label="Lembrar meus dados neste dispositivo" defaultChecked />
            </div>

            {/* Bloco 3: Timeline de Pedido e Skeletons */}
            <div className="p-6 rounded-3xl bg-white border border-borda shadow-xs flex flex-col gap-4 text-left">
              <h3 className="font-serif text-lg font-bold text-texto-escuro border-b border-borda-suave pb-2">
                Timeline do Pedido (design-2.png)
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-sucesso-fundo text-sucesso flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-texto-escuro">Pedido realizado</p>
                    <p className="text-[10px] text-texto-claro">12/04/2026 • 10:24</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primaria-soft text-primaria flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-texto-escuro">Pagamento aprovado</p>
                    <p className="text-[10px] text-texto-claro">12/04/2026 • 10:37</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-borda-suave text-texto-claro flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-texto-claro">Em separação</p>
                    <p className="text-[10px] text-texto-claro">Aguardando envio</p>
                  </div>
                </div>
              </div>

              {/* Skeleton Preview */}
              <div className="pt-3 border-t border-borda-suave">
                <p className="text-[11px] font-semibold text-texto-claro mb-2">Skeleton Loading:</p>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Oficial */}
      <footer className="w-full bg-white border-t border-borda-suave mt-12 py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-left text-sm">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative h-10 w-10 rounded-full overflow-hidden border border-primaria-border">
                <Image src="/images/logo/logo.jpeg" alt="Logo Isis Store" fill className="object-cover" />
              </div>
              <span className="font-serif text-xl font-bold text-texto-escuro">Isis Store</span>
            </div>
            <p className="text-xs text-texto-claro leading-relaxed mb-4">
              Tudo o que você ama, em um só lugar! ♡ Entregamos afeto, elegância e mimos especiais em cada pedido.
            </p>
            <p className="text-xs text-texto-medio font-semibold">Beleza • Estilo • Você</p>
          </div>

          <div>
            <h4 className="font-serif text-base font-bold text-texto-escuro mb-3">Navegação</h4>
            <ul className="space-y-2 text-xs text-texto-medio">
              <li><Link href="/" className="hover:text-primaria">Início</Link></li>
              <li><Link href="/produtos" className="hover:text-primaria">Todos os Produtos</Link></li>
              <li><Link href="/categorias" className="hover:text-primaria">Categorias</Link></li>
              <li><Link href="/conta" className="hover:text-primaria">Minha Conta</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-base font-bold text-texto-escuro mb-3">Categorias Oficiais</h4>
            <ul className="space-y-2 text-xs text-texto-medio">
              <li><Link href="/categoria/personalizados" className="hover:text-primaria">Personalizados</Link></li>
              <li><Link href="/categoria/infantil-baby" className="hover:text-primaria">Infantil / Baby</Link></li>
              <li><Link href="/categoria/masculino-feminino" className="hover:text-primaria">Masculino / Feminino</Link></li>
              <li><Link href="/categoria/casa-eletronicos" className="hover:text-primaria">Casa / Eletrônicos</Link></li>
              <li><Link href="/categoria/acessorios" className="hover:text-primaria">Acessórios</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-base font-bold text-texto-escuro mb-3">Atendimento</h4>
            <p className="text-xs text-texto-claro leading-relaxed mb-2">
              Segunda a Sexta: 09h às 18h<br />
              Sábado: 09h às 13h
            </p>
            <p className="text-xs text-texto-medio font-semibold">contato@isisstore.com.br</p>
            <p className="text-xs text-primaria font-semibold mt-1">WhatsApp: (11) 99999-9999</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-borda-suave flex flex-col sm:flex-row items-center justify-between text-xs text-texto-claro gap-3">
          <p>© 2026 Isis Store. Todos os direitos reservados. CNPJ: 00.000.000/0001-00</p>
          <div className="flex items-center gap-4">
            <Link href="/termos" className="hover:text-primaria">Termos de Uso</Link>
            <span>•</span>
            <Link href="/privacidade" className="hover:text-primaria">Privacidade</Link>
          </div>
        </div>
      </footer>

      {/* Navegação Mobile Inferior Fixa */}
      <BottomNav cartCount={cart.reduce((a, b) => a + b.quantity, 0)} />
    </div>
  );
}
