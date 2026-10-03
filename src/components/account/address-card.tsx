"use client";

import * as React from "react";
import { MapPin, Trash2, CheckCircle2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/features/account/actions";

interface AddressCardProps {
  id: string;
  recipientName: string;
  postalCode: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  isDefault: boolean;
}

export function AddressCard({
  id,
  recipientName,
  postalCode,
  street,
  number,
  complement,
  neighborhood,
  city,
  state,
  isDefault,
}: AddressCardProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isSettingDefault, setIsSettingDefault] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm("Tem certeza de que deseja remover este endereço?")) return;
    setIsDeleting(true);
    await deleteAddressAction(id);
    setIsDeleting(false);
  };

  const handleSetDefault = async () => {
    setIsSettingDefault(true);
    await setDefaultAddressAction(id);
    setIsSettingDefault(false);
  };

  return (
    <div className="bg-fundo-card dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#332228] p-6 shadow-xs hover:border-primaria/40 dark:hover:border-primaria/50 transition-colors flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primaria-soft dark:bg-[#381F27] text-primaria flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1] line-clamp-1">
                {recipientName}
              </p>
              <p className="text-[11px] text-texto-claro dark:text-[#A89299] font-mono">
                CEP {postalCode}
              </p>
            </div>
          </div>

          {isDefault && (
            <Badge
              variant="secondary"
              className="bg-primaria-soft dark:bg-[#381F27] text-primaria font-semibold border-primaria-border dark:border-[#633342] text-[10px]"
            >
              Principal
            </Badge>
          )}
        </div>

        <div className="text-xs text-texto-medio dark:text-[#D1C0C5] space-y-0.5 leading-relaxed pt-2 border-t border-[#F0E5E7] dark:border-[#332228]">
          <p>
            {street}, {number}
            {complement ? ` — ${complement}` : ""}
          </p>
          <p>
            {neighborhood} &bull; {city} - {state}
          </p>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-[#F0E5E7] dark:border-[#332228] flex items-center justify-between text-xs">
        <div>
          {!isDefault && (
            <button
              type="button"
              onClick={handleSetDefault}
              disabled={isSettingDefault}
              className="text-texto-claro dark:text-[#A89299] hover:text-primaria font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <Star className="w-3.5 h-3.5" />
              <span>{isSettingDefault ? "Salvando..." : "Tornar padrão"}</span>
            </button>
          )}
          {isDefault && (
            <span className="text-sucesso flex items-center gap-1 text-[11px] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Endereço de entrega padrão</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-texto-claro dark:text-[#A89299] hover:text-erro p-1.5 rounded-lg hover:bg-erro/10 transition-colors disabled:opacity-50"
          aria-label="Excluir endereço"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
