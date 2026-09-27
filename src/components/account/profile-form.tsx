"use client";

import * as React from "react";
import { User, Phone, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateProfileAction } from "@/features/account/actions";

interface ProfileFormProps {
  initialFullName: string;
  initialPhone: string;
  email: string;
}

export function ProfileForm({
  initialFullName,
  initialPhone,
  email,
}: ProfileFormProps) {
  const [fullName, setFullName] = React.useState(initialFullName);
  const [phone, setPhone] = React.useState(initialPhone);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Formatação amigável de telefone brasileiro
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);

    if (val.length > 6) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    } else if (val.length > 2) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    } else if (val.length > 0) {
      val = `(${val}`;
    }
    setPhone(val);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("phone", phone);

    const result = await updateProfileAction(null, formData);
    setIsSubmitting(false);

    if (result.success) {
      setStatusMessage({
        type: "success",
        text: result.message || "Dados atualizados com sucesso!",
      });
    } else {
      setStatusMessage({
        type: "error",
        text: result.message || "Erro ao salvar dados.",
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-borda p-6 sm:p-8 shadow-xs max-w-2xl">
      {statusMessage && (
        <div
          role="status"
          className={`p-4 rounded-2xl mb-6 text-xs flex items-center gap-2.5 ${
            statusMessage.type === "success"
              ? "bg-sucesso/10 border border-sucesso/20 text-sucesso font-semibold"
              : "bg-erro/10 border border-erro/20 text-erro font-medium"
          }`}
        >
          {statusMessage.type === "success" && (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* E-mail (somente leitura) */}
        <div>
          <label className="block text-xs font-semibold text-texto-escuro mb-1.5">
            E-mail Cadastrado
          </label>
          <div className="relative">
            <input
              type="email"
              disabled
              value={email}
              className="w-full h-11 px-3.5 rounded-xl border border-borda text-xs text-texto-claro bg-fundo cursor-not-allowed"
            />
            <Lock className="w-3.5 h-3.5 text-texto-claro absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[11px] text-texto-claro mt-1">
            O e-mail de acesso não pode ser alterado diretamente por motivos de segurança.
          </p>
        </div>

        {/* Nome Completo */}
        <div>
          <label className="block text-xs font-semibold text-texto-escuro mb-1.5">
            Nome Completo *
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-borda text-xs outline-none focus:border-primaria bg-fundo/30"
            />
            <User className="w-4 h-4 text-texto-claro absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Telefone / WhatsApp */}
        <div>
          <label className="block text-xs font-semibold text-texto-escuro mb-1.5">
            Telefone / WhatsApp
          </label>
          <div className="relative">
            <input
              type="text"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(11) 98765-4321"
              maxLength={15}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-borda text-xs outline-none focus:border-primaria bg-fundo/30"
            />
            <Phone className="w-4 h-4 text-texto-claro absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[11px] text-texto-claro mt-1">
            Utilizado para envio de atualizações e notificações importantes sobre seus pedidos.
          </p>
        </div>

        {/* Botão de Envio */}
        <div className="pt-4 border-t border-borda/60 flex items-center justify-end">
          <Button
            type="submit"
            variant="default"
            size="default"
            isLoading={isSubmitting}
            className="text-xs font-semibold px-6 shadow-xs"
          >
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
