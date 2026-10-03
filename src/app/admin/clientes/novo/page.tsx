import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { NewCustomerForm } from "@/components/admin/new-customer-form";

export const metadata = {
  title: "Registrar Novo Cliente — Isis Store Admin",
  description: "Cadastre clientes manualmente com dados de contato, permissões e endereço.",
};

export default function AdminNovoClientePage() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header com Breadcrumbs */}
      <div className="flex items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-borda shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro mb-1">
            <Link href="/admin" className="hover:text-primaria transition-colors">
              Painel
            </Link>
            <span>&gt;</span>
            <Link
              href="/admin/clientes"
              className="hover:text-primaria transition-colors"
            >
              Clientes
            </Link>
            <span>&gt;</span>
            <span className="text-texto-escuro font-medium">Novo</span>
          </div>

          <h1 className="font-serif text-2xl font-semibold text-texto-escuro flex items-center gap-2.5">
            <UserPlus className="w-6 h-6 text-primaria" />
            <span>Registrar Novo Cliente</span>
          </h1>
          <p className="text-xs text-texto-claro mt-0.5">
            Cadastre contas de clientes manualmente com dados pessoais, nível de acesso e endereço.
          </p>
        </div>

        <Link
          href="/admin/clientes"
          className={buttonVariants({ variant: "white", size: "sm" })}
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Voltar</span>
        </Link>
      </div>

      {/* Formulário Completo */}
      <NewCustomerForm />
    </div>
  );
}
