import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default async function FavoritosPage() {
  const supabase = await createClient();

  // Buscar produtos publicados para sugestão caso ainda não tenha favoritos no banco
  const { data: suggestedProducts } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price_cents,
      product_images (public_url, is_primary)
    `)
    .eq("status", "published")
    .limit(4);

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="space-y-6 select-none">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#F0E5E7] dark:border-[#38262C]">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primaria fill-primaria" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-texto-escuro dark:text-[#F8EFF1]">
              Meus Favoritos
            </h1>
          </div>
          <p className="text-xs text-texto-claro dark:text-[#A89299] mt-1">
            Peças que você salvou com carinho para acompanhar e adquirir quando quiser.
          </p>
        </div>

        <Link
          href="/produtos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primaria hover:text-primaria-hover transition-colors"
        >
          <span>Explorar mais produtos</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Sugestões de Favoritos / Catálogo em Destaque */}
      {suggestedProducts && suggestedProducts.length > 0 ? (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-texto-claro dark:text-[#A89299] mb-4">
            Itens que combinam com o seu estilo
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {suggestedProducts.map((p) => {
              const primaryImage =
                p.product_images?.find((img) => img.is_primary) ||
                p.product_images?.[0];

              return (
                <div
                  key={p.id}
                  className="bg-fundo-card dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#332228] p-4 shadow-xs hover:shadow-md hover:border-primaria/40 transition-all flex flex-col justify-between group"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-fundo dark:bg-[#251A1E] mb-3">
                    {primaryImage?.public_url ? (
                      <Image
                        src={primaryImage.public_url}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 250px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primaria/40">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}

                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-fundo-card/90 dark:bg-[#1E1518]/90 text-primaria flex items-center justify-center shadow-xs">
                      <Heart className="w-4 h-4 fill-primaria" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1] truncate group-hover:text-primaria transition-colors">
                      {p.name}
                    </h3>
                    <p className="font-serif text-base font-bold text-primaria mt-1">
                      {formatPrice(p.price_cents)}
                    </p>
                  </div>

                  <Link
                    href={`/produtos/${p.slug}`}
                    className="mt-3 w-full py-2 rounded-xl text-xs font-semibold text-center border border-primaria/30 text-primaria hover:bg-primaria hover:text-white transition-all shadow-2xs"
                  >
                    Ver detalhes
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-fundo-card dark:bg-[#1E1518] rounded-3xl border border-borda dark:border-[#332228] p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-primaria-soft dark:bg-[#2C1A20] text-primaria flex items-center justify-center mx-auto mb-3">
            <Heart className="w-7 h-7 fill-primaria/20" />
          </div>
          <h2 className="font-serif text-lg font-bold text-texto-escuro dark:text-[#F8EFF1]">
            Você ainda não adicionou favoritos
          </h2>
          <p className="text-xs text-texto-claro dark:text-[#A89299] max-w-sm mx-auto mt-1 mb-5">
            Ao navegar pelo catálogo, clique no coração para salvar suas peças preferidas e encontrá-las rapidamente aqui.
          </p>
          <Link
            href="/produtos"
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "text-xs font-semibold gap-2 shadow-xs",
            })}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Explorar Produtos</span>
          </Link>
        </div>
      )}
    </div>
  );
}
