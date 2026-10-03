"use client";

import * as React from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAddressAction } from "@/features/account/actions";

export function AddressForm() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSearchingCep, setIsSearchingCep] = React.useState(false);
  const [cepError, setCepError] = React.useState<string | null>(null);

  // Form Fields
  const [recipientName, setRecipientName] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");
  const [street, setStreet] = React.useState("");
  const [number, setNumber] = React.useState("");
  const [complement, setComplement] = React.useState("");
  const [neighborhood, setNeighborhood] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [isDefault, setIsDefault] = React.useState(false);

  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Busca automática por CEP via ViaCEP
  const handleCepBlur = async () => {
    const cleanCep = postalCode.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    setIsSearchingCep(true);
    setCepError(null);

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();

      if (data.erro) {
        setCepError("CEP não encontrado. Por favor preencha os campos manualmente.");
      } else {
        setStreet(data.logradouro || "");
        setNeighborhood(data.bairro || "");
        setCity(data.localidade || "");
        setState(data.uf || "");
      }
    } catch {
      setCepError("Erro ao buscar CEP. Preencha manualmente.");
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData();
    formData.append("recipientName", recipientName);
    formData.append("postalCode", postalCode);
    formData.append("street", street);
    formData.append("number", number);
    formData.append("complement", complement);
    formData.append("neighborhood", neighborhood);
    formData.append("city", city);
    formData.append("state", state);
    if (isDefault) {
      formData.append("isDefault", "true");
    }

    const result = await createAddressAction(null, formData);

    setIsSubmitting(false);

    if (result.success) {
      setIsOpen(false);
      // Reset form
      setRecipientName("");
      setPostalCode("");
      setStreet("");
      setNumber("");
      setComplement("");
      setNeighborhood("");
      setCity("");
      setState("");
      setIsDefault(false);
    } else {
      setFormError(result.message || "Erro ao salvar endereço.");
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="default"
        size="sm"
        className="text-xs font-semibold gap-1.5 shadow-xs"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Novo Endereço</span>
      </Button>
    );
  }

  return (
    <div className="bg-fundo-card dark:bg-[#1E1518] rounded-3xl border border-primaria/30 dark:border-primaria/40 p-6 sm:p-8 shadow-sm animate-in fade-in duration-300 mb-6 transition-colors">
      <div className="flex items-center justify-between pb-4 border-b border-[#F0E5E7] dark:border-[#332228] mb-6">
        <div>
          <h2 className="font-serif text-lg font-bold text-texto-escuro dark:text-[#F8EFF1]">
            Cadastrar Novo Endereço
          </h2>
          <p className="text-xs text-texto-claro dark:text-[#A89299] mt-0.5">
            Preencha os dados de entrega. O CEP preenche automaticamente a rua e bairro.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-xs text-texto-claro dark:text-[#A89299] hover:text-texto-escuro dark:hover:text-[#F8EFF1] font-semibold"
        >
          Cancelar
        </button>
      </div>

      {formError && (
        <div className="p-3.5 rounded-xl bg-erro/10 border border-erro/20 text-xs text-erro font-medium mb-5">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Destinatário */}
        <div>
          <label className="block text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-1.5">
            Nome do Destinatário *
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Isis Lima"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-borda dark:border-[#38262C] text-xs outline-none focus:border-primaria bg-input-fundo dark:bg-[#251A1E] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro/70 dark:placeholder:text-[#8C767D] focus:bg-fundo-card transition-all"
          />
        </div>

        {/* CEP com busca automática */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-1.5">
              CEP *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={9}
                placeholder="00000-000"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                onBlur={handleCepBlur}
                className="w-full h-11 px-3.5 rounded-xl border border-borda dark:border-[#38262C] text-xs outline-none focus:border-primaria bg-input-fundo dark:bg-[#251A1E] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro/70 dark:placeholder:text-[#8C767D] focus:bg-fundo-card transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-texto-claro dark:text-[#8C767D]">
                {isSearchingCep ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primaria" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </div>
            </div>
            {cepError && (
              <p className="text-[11px] text-erro mt-1">{cepError}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-1.5">
              Rua / Logradouro *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Rua das Flores"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-borda dark:border-[#38262C] text-xs outline-none focus:border-primaria bg-input-fundo dark:bg-[#251A1E] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro/70 dark:placeholder:text-[#8C767D] focus:bg-fundo-card transition-all"
            />
          </div>
        </div>

        {/* Número e Complemento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-1.5">
              Número *
            </label>
            <input
              type="text"
              required
              placeholder="123"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-borda dark:border-[#38262C] text-xs outline-none focus:border-primaria bg-input-fundo dark:bg-[#251A1E] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro/70 dark:placeholder:text-[#8C767D] focus:bg-fundo-card transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-1.5">
              Complemento (Opcional)
            </label>
            <input
              type="text"
              placeholder="Apto 42, Bloco B"
              value={complement}
              onChange={(e) => setComplement(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-borda dark:border-[#38262C] text-xs outline-none focus:border-primaria bg-input-fundo dark:bg-[#251A1E] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro/70 dark:placeholder:text-[#8C767D] focus:bg-fundo-card transition-all"
            />
          </div>
        </div>

        {/* Bairro, Cidade e UF */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-1.5">
              Bairro *
            </label>
            <input
              type="text"
              required
              placeholder="Centro"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-borda dark:border-[#38262C] text-xs outline-none focus:border-primaria bg-input-fundo dark:bg-[#251A1E] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro/70 dark:placeholder:text-[#8C767D] focus:bg-fundo-card transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-1.5">
              Cidade *
            </label>
            <input
              type="text"
              required
              placeholder="São Paulo"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-borda dark:border-[#38262C] text-xs outline-none focus:border-primaria bg-input-fundo dark:bg-[#251A1E] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro/70 dark:placeholder:text-[#8C767D] focus:bg-fundo-card transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-1.5">
              UF *
            </label>
            <input
              type="text"
              required
              maxLength={2}
              placeholder="SP"
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              className="w-full h-11 px-3.5 rounded-xl border border-borda dark:border-[#38262C] text-xs outline-none focus:border-primaria uppercase bg-input-fundo dark:bg-[#251A1E] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro/70 dark:placeholder:text-[#8C767D] focus:bg-fundo-card text-center transition-all"
            />
          </div>
        </div>

        {/* Opção Endereço Padrão */}
        <div className="pt-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="isDefaultCheck"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-4 h-4 rounded border-[#F0E5E7] dark:border-[#38262C] text-primaria focus:ring-primaria"
          />
          <label htmlFor="isDefaultCheck" className="text-xs text-texto-medio dark:text-[#D1C0C5] cursor-pointer">
            Definir como meu endereço principal de entrega
          </label>
        </div>

        {/* Botões de Ação */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F0E5E7] dark:border-[#332228]">
          <Button
            type="button"
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="text-xs text-texto-claro dark:text-[#A89299] hover:text-texto-escuro dark:hover:text-[#F8EFF1]"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="default"
            size="sm"
            isLoading={isSubmitting}
            className="text-xs font-semibold px-5 shadow-xs"
          >
            Salvar Endereço
          </Button>
        </div>
      </form>
    </div>
  );
}
