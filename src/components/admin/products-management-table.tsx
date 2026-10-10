"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Edit3,
  ExternalLink,
  CheckCircle2,
  Search,
  FileText,
  Boxes,
  TrendingUp,
  Sparkles,
  Loader2,
  Layers,
  ArrowRight,
  ShieldCheck,
  EyeOff,
  Globe,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-context";
import { QuickProductEditor } from "@/components/admin/quick-product-editor";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import {
  EditProductModal,
  EditableProduct,
} from "@/components/admin/edit-product-modal";
import { updateProductStatusAction } from "@/features/admin/actions";
import type { CatalogCategory } from "@/services/catalog.service";

interface ProductsManagementTableProps {
  products: EditableProduct[];
  categories: CatalogCategory[];
  isDraftView?: boolean;
  publishedCount: number;
  draftCount: number;
}

export function ProductsManagementTable({
  products: initialProducts,
  categories,
  isDraftView = false,
  publishedCount,
  draftCount,
}: ProductsManagementTableProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [editingProduct, setEditingProduct] = React.useState<EditableProduct | null>(null);
  const [isPublishingId, setIsPublishingId] = React.useState<string | null>(null);

  // Filtragem no cliente para busca instantânea
  const filteredProducts = React.useMemo(() => {
    return initialProducts.filter((item) => {
      const matchSearch =
        search.trim() === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        selectedCategory === "all" || item.category_id === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [initialProducts, search, selectedCategory]);

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Ação rápida para publicar rascunho com 1 clique
  const handlePublishDraft = async (productId: string, productName: string) => {
    setIsPublishingId(productId);
    try {
      const res = await updateProductStatusAction(productId, "published");
      if (res.success) {
        toast.success(
          "Produto Publicado!",
          `"${productName}" agora está visível e disponível para compra na loja pública.`
        );
        router.refresh();
      } else {
        toast.error(
          "Falha ao publicar",
          res.message || "Não foi possível publicar o item."
        );
      }
    } catch {
      toast.error(
        "Erro de conexão",
        "Falha ao publicar o produto."
      );
    } finally {
      setIsPublishingId(null);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Navegação por Guias / Abas & Barra de Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-borda dark:border-[#38262C] pb-3">
        {/* Abas */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0 shrink-0">
          <Link
            href="/admin/produtos"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              !isDraftView
                ? "bg-primaria text-white shadow-xs"
                : "text-texto-medio dark:text-[#D4BFC5] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-fundo dark:hover:bg-[#251A1E]"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Publicados</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                !isDraftView
                  ? "bg-white/20 text-white"
                  : "bg-fundo dark:bg-[#251A1E] text-texto-claro dark:text-[#988087]"
              }`}
            >
              {publishedCount}
            </span>
          </Link>

          <Link
            href="/admin/produtos/rascunhos"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              isDraftView
                ? "bg-amber-600 dark:bg-amber-500 text-white shadow-xs"
                : "text-texto-medio dark:text-[#D4BFC5] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-fundo dark:hover:bg-[#251A1E]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Rascunhos</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isDraftView
                  ? "bg-white/25 text-white"
                  : draftCount > 0
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold"
                  : "bg-fundo dark:bg-[#251A1E] text-texto-claro dark:text-[#988087]"
              }`}
            >
              {draftCount}
            </span>
          </Link>

          <Link
            href="/admin/produtos/estoque"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-texto-medio dark:text-[#D4BFC5] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-fundo dark:hover:bg-[#251A1E] flex items-center gap-1.5 transition-all shrink-0"
          >
            <Boxes className="w-3.5 h-3.5 text-primaria" />
            <span>Estoque</span>
          </Link>

          <Link
            href="/admin/produtos/relatorios"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-texto-medio dark:text-[#D4BFC5] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-fundo dark:hover:bg-[#251A1E] flex items-center gap-1.5 transition-all shrink-0"
          >
            <TrendingUp className="w-3.5 h-3.5 text-primaria" />
            <span>Relatórios</span>
          </Link>
        </div>

        {/* Busca e Categoria */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full md:w-auto">
          <div className="relative flex-1 sm:w-60 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-texto-claro dark:text-[#988087] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou SKU..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#151012] border border-borda dark:border-[#38262C] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro dark:placeholder:text-[#988087] outline-none focus:border-primaria"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#151012] border border-borda dark:border-[#38262C] text-texto-escuro dark:text-[#F8EFF1] outline-none focus:border-primaria shrink-0"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Produtos Responsiva */}
      <div className="bg-white dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#38262C] shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-fundo/80 dark:bg-[#151012] border-b border-borda dark:border-[#38262C] text-texto-claro dark:text-[#988087] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5 min-w-[210px] max-w-[280px]">Produto</th>
                <th className="px-3 py-3.5 min-w-[100px] whitespace-nowrap">Categoria</th>
                <th className="px-3 py-3.5 min-w-[85px] whitespace-nowrap">Preço</th>
                <th className="px-3 py-3.5 min-w-[170px] whitespace-nowrap">Estoque &amp; Status</th>
                <th className="px-3 py-3.5 min-w-[90px] whitespace-nowrap">Fotos (.webp)</th>
                <th className="px-4 py-3.5 text-right min-w-[130px] whitespace-nowrap sticky right-0 z-20 bg-fundo dark:bg-[#151012] border-l border-borda/40 dark:border-[#38262C]/40 shadow-[-8px_0_12px_-6px_rgba(0,0,0,0.18)]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borda/60 dark:divide-[#38262C]/60 text-texto-escuro dark:text-[#F8EFF1]">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((item) => {
                  const primaryImg =
                    item.product_images?.find((img) => img.is_primary) ||
                    item.product_images?.[0];
                  const thumb = primaryImg?.public_url;
                  const isDraft = item.status === "draft";

                  return (
                    <tr
                      key={item.id}
                      className="group hover:bg-fundo/40 dark:hover:bg-[#251A1E]/40 transition-colors"
                    >
                      {/* Produto com imagem e identificadores */}
                      <td className="px-4 py-3.5 min-w-[210px] max-w-[280px]">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(item)}
                            className="w-11 h-11 rounded-xl overflow-hidden bg-fundo dark:bg-[#251A1E] border border-borda dark:border-[#38262C] shrink-0 relative flex items-center justify-center cursor-pointer hover:border-primaria transition-colors group/thumb"
                            title="Clique para editar este produto"
                          >
                            {thumb ? (
                              <Image
                                src={thumb}
                                alt={item.name}
                                fill
                                className="object-cover group-hover/thumb:scale-105 transition-transform"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-primaria" />
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setEditingProduct(item)}
                                className="font-semibold text-texto-escuro dark:text-[#F8EFF1] leading-snug line-clamp-2 hover:text-primaria text-left transition-colors cursor-pointer"
                                title={`Clique para editar: ${item.name}`}
                              >
                                {item.name}
                              </button>
                              {isDraft && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
                                  Rascunho
                                </span>
                              )}
                              {item.featured && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-primaria/10 text-primaria border border-primaria/20 flex items-center gap-0.5 shrink-0">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  <span>Destaque</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-texto-claro dark:text-[#988087] font-mono">
                                SKU: {item.sku}
                              </span>
                              <button
                                type="button"
                                onClick={() => setEditingProduct(item)}
                                className="text-[10px] text-primaria hover:underline font-semibold cursor-pointer"
                              >
                                Editar
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="px-3 py-3.5 min-w-[100px] whitespace-nowrap text-texto-medio dark:text-[#D4BFC5]">
                        {item.categories?.name || "Sem categoria"}
                      </td>

                      {/* Preço e Promoção */}
                      <td className="px-3 py-3.5 min-w-[85px] whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-primaria">
                            {formatPrice(item.price_cents)}
                          </span>
                          {item.sale_price_cents && (
                            <span className="text-[10px] text-sucesso font-mono">
                              Promo: {formatPrice(item.sale_price_cents)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Estoque e Status Rápido */}
                      <td className="px-3 py-3.5 min-w-[170px] whitespace-nowrap">
                        <QuickProductEditor
                          productId={item.id}
                          initialStock={item.stock}
                          initialStatus={item.status}
                        />
                      </td>

                      {/* Fotos (.webp) */}
                      <td className="px-3 py-3.5 min-w-[90px] whitespace-nowrap">
                        <ProductImageManager
                          productId={item.id}
                          productName={item.name}
                          productSlug={item.sku}
                          initialImages={item.product_images || []}
                        />
                      </td>

                      {/* Ações: Editar destacado e Loja / Publicar (Sticky Right) */}
                      <td className="px-4 py-3.5 text-right min-w-[130px] whitespace-nowrap sticky right-0 z-10 bg-white dark:bg-[#1E1518] group-hover:bg-[#FCF9FA] dark:group-hover:bg-[#251A1E] border-l border-borda/40 dark:border-[#38262C]/40 shadow-[-8px_0_12px_-6px_rgba(0,0,0,0.18)] transition-colors">
                        <div className="flex items-center justify-end gap-2 shrink-0">
                          {/* Botão de Edição Completa com alto destaque visual */}
                          <button
                            type="button"
                            onClick={() => setEditingProduct(item)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primaria text-white hover:bg-primaria-hover active:scale-95 text-xs font-bold transition-all shadow-sm hover:shadow-primaria/25 shrink-0 cursor-pointer"
                            title="Editar informações completas e fotos do produto"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-white" />
                            <span>Editar</span>
                          </button>

                          {/* Se for rascunho, oferece Publicar com 1 clique */}
                          {isDraft ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handlePublishDraft(item.id, item.name)}
                              isLoading={isPublishingId === item.id}
                              className="h-8 text-xs gap-1 font-semibold border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500 hover:text-white shrink-0"
                              title="Publicar este rascunho imediatamente na loja"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span>Publicar</span>
                            </Button>
                          ) : (
                            /* Se estiver publicado, link para ver na loja */
                            <Link
                              href={`/produtos/${(item as { slug?: string }).slug || ""}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-primaria hover:underline font-semibold text-xs px-2 py-1 shrink-0"
                              title="Visualizar produto na vitrine pública"
                            >
                              <span>Ver</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center text-texto-claro dark:text-[#988087]"
                  >
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                      <div className="w-12 h-12 rounded-2xl bg-fundo dark:bg-[#251A1E] border border-borda dark:border-[#38262C] flex items-center justify-center text-primaria mb-3">
                        {isDraftView ? (
                          <FileText className="w-6 h-6 text-amber-500" />
                        ) : (
                          <Package className="w-6 h-6" />
                        )}
                      </div>
                      <p className="font-semibold text-sm text-texto-escuro dark:text-[#F8EFF1]">
                        {isDraftView
                          ? "Nenhum produto em rascunho no momento"
                          : "Nenhum produto cadastrado nesta visualização"}
                      </p>
                      <p className="text-xs text-texto-claro dark:text-[#988087] mt-1 mb-4 leading-relaxed">
                        {isDraftView
                          ? "Todos os seus itens cadastrados estão publicados e disponíveis no catálogo da loja pública."
                          : "Cadastre novos produtos para exibi-los no catálogo e começar a vender."}
                      </p>
                      <Link
                        href="/admin/produtos/novo"
                        className={buttonVariants({
                          variant: "default",
                          size: "sm",
                        })}
                      >
                        <span>Cadastrar Novo Produto</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição com Galeria de Fotos Integrada */}
      <EditProductModal
        product={editingProduct}
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        categories={categories}
        onSuccess={() => {
          setEditingProduct(null);
          router.refresh();
        }}
      />
    </div>
  );
}
