import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { KeyRound, ShieldCheck } from "lucide-react";
import { ProfileForm } from "@/components/account/profile-form";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Dados Cadastrais | Isis Store",
  description: "Gerencie seus dados pessoais e de acesso na Isis Store.",
};

export default async function DadosCadastraisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/conta/dados");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="pb-4 border-b border-borda/60">
        <h1 className="font-serif text-2xl font-bold text-texto-escuro">
          Dados Cadastrais
        </h1>
        <p className="text-xs text-texto-claro mt-1">
          Mantenha seus dados e informações de contato atualizados para um atendimento personalizado.
        </p>
      </div>

      <div className="space-y-8">
        {/* Formulário de Perfil */}
        <ProfileForm
          initialFullName={profile?.full_name || ""}
          initialPhone={profile?.phone || ""}
          email={user.email || ""}
        />

        {/* Bloco de Segurança & Senha */}
        <div className="bg-white rounded-3xl border border-borda p-6 sm:p-8 shadow-xs max-w-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-base font-bold text-texto-escuro">
                Segurança da Conta
              </h2>
              <p className="text-xs text-texto-claro mt-1 leading-relaxed">
                Recomendamos o uso de senhas fortes com números e caracteres especiais para proteção dos seus dados.
              </p>

              <div className="mt-4 pt-4 border-t border-borda/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-sucesso font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sua conta está protegida por criptografia SSL</span>
                </div>

                <Link
                  href="/recuperar-senha"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "text-xs font-semibold self-start sm:self-auto",
                  })}
                >
                  Alterar Senha
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
