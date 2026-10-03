import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/account/profile-form";
import { UserPreferencesCard } from "@/components/account/user-preferences-card";
import { SecurityPasswordForm } from "@/components/account/security-password-form";
import { PrivacyDataCard } from "@/components/account/privacy-data-card";

export const metadata = {
  title: "Configurações da Conta | Isis Store",
  description: "Gerencie seus dados pessoais, preferências de tema e segurança na Isis Store.",
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
      <div className="pb-4 border-b border-[#F0E5E7] dark:border-[#38262C]">
        <h1 className="font-serif text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1]">
          Configurações da Conta
        </h1>
        <p className="text-xs text-texto-claro dark:text-[#A89299] mt-1">
          Gerencie seus dados cadastrais, canais de comunicação, tema visual e segurança.
        </p>
      </div>

      <div className="space-y-6">
        {/* Bloco 1: Dados Cadastrais (Nome, CPF, Telefone, E-mail) */}
        <ProfileForm
          initialFullName={profile?.full_name || ""}
          initialPhone={profile?.phone || ""}
          initialCpf={profile?.cpf || ""}
          email={user.email || ""}
        />

        {/* Bloco 2: Preferências de Aparência & Notificações */}
        <UserPreferencesCard />

        {/* Bloco 3: Segurança da Conta & Alteração de Senha */}
        <SecurityPasswordForm />

        {/* Bloco 4: Privacidade & LGPD */}
        <PrivacyDataCard />
      </div>
    </div>
  );
}
