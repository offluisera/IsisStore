import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Package, Plus, CheckCircle2, ArrowLeft, ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { QuickProductEditor } from "@/components/admin/quick-product-editor";

interface AdminProdutosProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminProdutosPage({
  searchParams,
}: AdminProdutosProps) {
  const supabase = await createClient();
  const resolved = await searchParams;
  const isCreated = resolved.created === "1";

  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name), product_images(public_url)")
    .order("created_at", { ascending: false });

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Feedback de sucesso */}
      {isCreated && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-sucesso/10 border border-sucesso/20 flex items-center gap-3 text-sucesso text-xs font-semibold animate-in fade-in"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>
            Produto cadastrado com sucesso! Ele já está disponível no catálogo e na vitrine da loja.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-borda shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro mb-1">
            <Link href="/admin" className="hover:text-primaria transition-colors">
              Painel
            </Link>
            <span>&gt;</span>
            <span className="text-texto-escuro font-medium">Produtos</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-texto-escuro">
            Gerenciamento de Produtos
          </h1>
          <p className="text-xs text-texto-claro mt-0.5">
            Total de {products?.length ?? 0} produtos cadastrados no catálogo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className={buttonVariants({ variant: "white", size: "sm" })}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Voltar</span>
          </Link>
          <Link
            href="/admin/produtos/novo"
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "flex items-center gap-1.5",
            })}
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </Link>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-2xl border border-borda shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-fundo/60 border-b border-borda text-texto-claro uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Produto</th>
                <th className="px-5 py-3.5">Categoria</th>
                <th className="px-5 py-3.5">Preço</th>
                <th className="px-5 py-3.5">Gestão de Estoque &amp; Status</th>
                <th className="px-5 py-3.5 text-right">Loja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borda/60 text-texto-escuro">
              {products && products.length > 0 ? (
                products.map((item) => {
                  const thumb = item.product_images?.[0]?.public_url;
                  return (
                    <tr key={item.id} className="hover:bg-fundo/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-fundo border border-borda shrink-0 relative flex items-center justify-center">
                            {thumb ? (
                              <Image
                                src={thumb}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-primaria" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-texto-escuro">{item.name}</p>
                            <p className="text-[11px] text-texto-claro font-mono">
                              SKU: {item.sku}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-texto-medio">
                        {item.categories?.name || "Sem categoria"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-primaria">
                        {formatPrice(item.price_cents)}
                      </td>
                      <td className="px-5 py-4">
                        <QuickProductEditor
                          productId={item.id}
                          initialStock={item.stock}
                          initialStatus={
                            (item.status as "published" | "draft" | "archived") ||
                            "published"
                          }
                        />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/produtos/${item.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-primaria hover:underline font-semibold text-[11px]"
                        >
                          <span>Ver</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-texto-claro">
                    Nenhum produto cadastrado no catálogo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
