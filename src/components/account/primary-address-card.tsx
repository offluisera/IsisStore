import Link from "next/link";
import { MapPin, Plus } from "lucide-react";

interface AddressData {
  id?: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  recipient_name?: string;
}

interface PrimaryAddressCardProps {
  address?: AddressData | null;
}

export function PrimaryAddressCard({ address }: PrimaryAddressCardProps) {
  return (
    <div className="bg-fundo-card dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#332228] p-5 shadow-xs select-none">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F7EFF1] dark:border-[#2C1D23]">
        <h3 className="font-serif font-bold text-sm sm:text-base text-texto-escuro dark:text-[#F8EFF1]">
          Endereço principal
        </h3>

        {address && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF5F6] dark:bg-[#2C1A20] text-primaria border border-primaria/20">
            Casa
          </span>
        )}
      </div>

      <div className="pt-4">
        {address ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primaria/10 text-primaria flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>

              <div className="text-xs text-texto-escuro dark:text-[#F8EFF1] space-y-0.5 min-w-0">
                <p className="font-semibold truncate">
                  {address.street}, {address.number}
                  {address.complement ? ` - ${address.complement}` : ""}
                </p>
                <p className="text-texto-claro dark:text-[#A89299]">
                  {address.neighborhood}
                </p>
                <p className="text-texto-claro dark:text-[#A89299]">
                  {address.city} - {address.state}
                </p>
                <p className="text-[11px] font-mono text-texto-claro/80 dark:text-[#7A6369]">
                  CEP {address.postal_code}
                </p>
              </div>
            </div>

            <Link
              href="/conta/enderecos"
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-center border border-primaria/30 text-primaria hover:bg-[#FFF5F6] dark:hover:bg-[#2C1D23] transition-colors block mt-3"
            >
              Gerenciar endereços &rarr;
            </Link>
          </div>
        ) : (
          <div className="text-center py-4 space-y-2">
            <p className="text-xs text-texto-claro dark:text-[#A89299]">
              Nenhum endereço cadastrado ainda.
            </p>
            <Link
              href="/conta/enderecos"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primaria hover:underline pt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar endereço</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
