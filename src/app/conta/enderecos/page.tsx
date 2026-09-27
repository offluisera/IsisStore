import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import { AddressForm } from "@/components/account/address-form";
import { AddressCard } from "@/components/account/address-card";

export const metadata = {
  title: "Endereços de Entrega | Isis Store",
  description: "Gerencie seus endereços para compras rápidas e seguras.",
};

export default async function EnderecosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/conta/enderecos");
  }

  // Buscar endereços estritamente do usuário atual (RLS isolado)
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("profile_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-borda/60">
        <div>
          <h1 className="font-serif text-2xl font-bold text-texto-escuro">
            Endereços de Entrega
          </h1>
          <p className="text-xs text-texto-claro mt-1">
            Cadastre seus locais de recebimento para acelerar o processo de finalização de compra.
          </p>
        </div>

        <div>
          <AddressForm />
        </div>
      </div>

      {/* Grid de Endereços ou Empty State */}
      {!addresses || addresses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-borda p-12 sm:p-16 text-center flex flex-col items-center justify-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-primaria-soft text-primaria flex items-center justify-center mb-4 border border-primaria/20 shadow-xs">
            <MapPin className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h2 className="font-serif text-xl font-bold text-texto-escuro">
            Nenhum endereço cadastrado
          </h2>
          <p className="text-xs sm:text-sm text-texto-claro max-w-sm mt-1 mb-6 leading-relaxed">
            Adicione seu endereço para calcular fretes com exatidão e receber seus pedidos com conforto.
          </p>
          <AddressForm />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              id={addr.id}
              recipientName={addr.recipient_name}
              postalCode={addr.postal_code}
              street={addr.street}
              number={addr.number}
              complement={addr.complement}
              neighborhood={addr.neighborhood}
              city={addr.city}
              state={addr.state}
              isDefault={addr.is_default}
            />
          ))}
        </div>
      )}
    </div>
  );
}
