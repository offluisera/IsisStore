import Link from "next/link";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { getCategories } from "@/services/catalog.service";
import { createClient } from "@/lib/supabase/server";
import {
  Sparkles,
  Baby,
  Users,
  Tv,
  Gem,
  ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categorias | Isis Store",
  description: "Navegue pelas categorias oficiais da Isis Store e encontre o produto ideal.",
};

const categoryIconMap: Record<string, React.ReactNode> = {
  personalizados: <Sparkles className="w-6 h-6 text-primaria" />,
  "infantil-baby": <Baby className="w-6 h-6 text-primaria" />,
  "masculino-feminino": <Users className="w-6 h-6 text-primaria" />,
  "casa-eletronicos": <Tv className="w-6 h-6 text-primaria" />,
  acessorios: <Gem className="w-6 h-6 text-primaria" />,
};

export default async function CategoriasPage() {
  const categories = await getCategories();
  const supabase = await createClient();

  // Buscar contagem de produtos por categoria
  const { data: productsData } = await supabase
    .from("products")
    .select("category_id")
    .eq("status", "published");

  const productCountMap = (productsData || []).reduce<Record<string, number>>(
    (acc, cur) => {
      if (cur.category_id) {
        acc[cur.category_id] = (acc[cur.category_id] || 0) + 1;
      }
      return acc;
    },
    {}
  );

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
            <li className="font-semibold text-texto-escuro" aria-current="page">
              Categorias
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-texto-escuro tracking-tight">
            Nossas Categorias
          </h1>
          <p className="text-xs sm:text-sm text-texto-claro mt-2">
            Navegue pelos nossos departamentos e descubra itens especialmente pensados para você ou para presentear.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const count = productCountMap[cat.id] || 0;
            const icon =
              categoryIconMap[cat.slug] || <Sparkles className="w-6 h-6 text-primaria" />;

            return (
              <Link
                key={cat.id}
                href={`/produtos?categoria=${cat.slug}`}
                className="group bg-white rounded-2xl border border-borda p-6 sm:p-8 shadow-xs hover:border-primaria hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-secundaria flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-primaria-soft transition-all duration-300">
                    {icon}
                  </div>

                  <h2 className="font-serif text-xl font-bold text-texto-escuro group-hover:text-primaria transition-colors">
                    {cat.name}
                  </h2>

                  <p className="text-xs text-texto-claro mt-2 leading-relaxed">
                    {cat.description || "Produtos selecionados de alta qualidade e design diferenciado."}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-borda/60 flex items-center justify-between text-xs">
                  <span className="text-texto-claro font-medium">
                    {count} {count === 1 ? "produto" : "produtos"}
                  </span>
                  <span className="font-semibold text-primaria flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Explorar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-xs text-texto-claro border-t border-borda/60 bg-white">
        <p>&copy; {new Date().getFullYear()} Isis Store. Todos os direitos reservados.</p>
      </footer>

      <BottomNav />
    </div>
  );
}
