import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { NewCategoryForm } from "@/components/admin/new-category-form";

export const metadata = {
  title: "Cadastrar Nova Categoria — Isis Store Admin",
  description: "Crie novos departamentos e categorias para organizar os produtos no catálogo.",
};

export default function AdminNovaCategoriaPage() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#1E1518] p-6 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro dark:text-[#988087] mb-1">
            <Link href="/admin" className="hover:text-primaria transition-colors">
              Painel
            </Link>
            <span>&gt;</span>
            <Link
              href="/admin/categorias"
              className="hover:text-primaria transition-colors"
            >
              Categorias
            </Link>
            <span>&gt;</span>
            <span className="text-texto-escuro dark:text-[#F8EFF1] font-medium">Novo</span>
          </div>

          <h1 className="font-serif text-2xl font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2.5">
            <PlusCircle className="w-6 h-6 text-primaria" />
            <span>Cadastrar Nova Categoria</span>
          </h1>
          <p className="text-xs text-texto-claro dark:text-[#988087] mt-0.5">
            Preencha os dados abaixo para publicar um novo departamento no catálogo da Isis Store.
          </p>
        </div>

        <Link
          href="/admin/categorias"
          className={buttonVariants({ variant: "white", size: "sm" })}
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Voltar</span>
        </Link>
      </div>

      {/* Formulário Completo */}
      <NewCategoryForm />
    </div>
  );
}
