import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Lock } from "lucide-react";
import { CheckoutForm } from "@/components/commerce/checkout-form";

export const metadata = {
  title: "Checkout Seguro | Isis Store",
  description: "Finalize sua compra com total segurança e envio para todo o Brasil.",
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/checkout");
  }

  // 1. Buscar Perfil do Usuário
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  // 2. Buscar Endereços de Entrega do Usuário
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("profile_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  const displayName =
    profile?.full_name || user.email?.split("@")[0] || "Cliente";

  return (
    <div className="min-h-screen bg-fundo text-texto-escuro flex flex-col justify-between selection:bg-primaria-soft selection:text-primaria">
      {/* Top Header Simplificado de Checkout Seguro */}
      <header className="bg-white border-b border-borda sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-primaria/20 shadow-xs transition-transform group-hover:scale-105">
              <Image
                src="/images/logo/logo.jpeg"
                alt="Isis Store"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-tight text-texto-escuro group-hover:text-primaria transition-colors leading-none">
                Isis Store
              </span>
              <span className="text-[10px] text-texto-claro tracking-widest uppercase mt-0.5">
                Checkout Seguro
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-sucesso bg-sucesso/10 py-1.5 px-3 rounded-full border border-sucesso/20">
            <Lock className="w-3.5 h-3.5" />
            <span>Ambiente 100% Protegido</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-texto-escuro tracking-tight">
            Finalizar Pedido
          </h1>
          <p className="text-xs sm:text-sm text-texto-claro mt-1">
            Revise seu endereço, escolha o frete e confirme o seu pagamento.
          </p>
        </div>

        <CheckoutForm
          addresses={addresses || []}
          userEmail={user.email || ""}
          userName={displayName}
        />
      </main>

      {/* Footer Minimalista de Checkout */}
      <footer className="w-full py-6 text-center text-xs text-texto-claro border-t border-borda/60 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-texto-medio">
            <ShieldCheck className="w-4 h-4 text-sucesso" />
            <span>Seus dados são protegidos conforme a LGPD e criptografados de ponta a ponta.</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Isis Store. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
