import { getCategories } from "@/services/catalog.service";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { NewProductForm } from "@/features/admin/components/NewProductForm";

export default async function NovoProdutoPage() {
  const categories = await getCategories();

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-borda shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro mb-1">
            <Link href="/admin" className="hover:text-primaria transition-colors">
              Painel
            </Link>
            <span>&gt;</span>
            <Link
              href="/admin/produtos"
              className="hover:text-primaria transition-colors"
            >
              Produtos
            </Link>
            <span>&gt;</span>
            <span className="text-texto-escuro font-medium">Novo</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-texto-escuro">
            Cadastrar Novo Produto
          </h1>
          <p className="text-xs text-texto-claro mt-0.5">
            Preencha os dados abaixo para publicar um item no catálogo da Isis Store.
          </p>
        </div>

        <Link
          href="/admin/produtos"
          className={buttonVariants({ variant: "white", size: "sm" })}
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Voltar</span>
        </Link>
      </div>

      {/* Form Container */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-borda shadow-xs">
        <NewProductForm categories={categories} />
      </div>
    </div>
  );
}
