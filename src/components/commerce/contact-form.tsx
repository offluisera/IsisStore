"use client";

import * as React from "react";
import { Send, CheckCircle2, AlertCircle, Loader2, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-context";

interface ContactFormProps {
  supportPhone?: string;
}

export function ContactForm({ supportPhone }: ContactFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    subject: "duvida-produto",
    message: "",
  });
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const cleanPhone = (supportPhone || "17992495308").replace(/\D/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim()) {
      setErrorMsg("Por favor, preencha seu nome completo.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMsg("Por favor, informe um e-mail válido.");
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setErrorMsg("Sua mensagem deve conter no mínimo 10 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulação de envio com feedback tátil de alta qualidade
      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsSuccess(true);
      toast.success(
        "Mensagem recebida com carinho! ✨",
        "Nossa equipe entrará em contato em até 24 horas úteis."
      );
    } catch {
      setErrorMsg("Ocorreu uma falha ao enviar sua mensagem. Tente pelo WhatsApp!");
      toast.error(
        "Erro ao enviar",
        "Por favor, utilize o botão do WhatsApp para atendimento imediato."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Olá Isis Store! Meu nome é ${formData.name || "Cliente"}, estou entrando em contato pelo site sobre ${
        formData.subject === "status-pedido"
          ? "o status do meu pedido"
          : formData.subject === "troca-devolucao"
          ? "troca ou devolução"
          : "dúvidas de produtos"
      }. Mensagem: ${formData.message || "Gostaria de atendimento."}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  if (isSuccess) {
    return (
      <div className="rounded-3xl border border-primaria/20 bg-gradient-to-br from-fundo via-white to-primaria/5 dark:from-[#201518] dark:via-[#1A1215] dark:to-[#22161A] p-8 sm:p-10 text-center shadow-sm space-y-5 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="font-serif text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1]">
            Mensagem Enviada!
          </h3>
          <p className="text-sm text-texto-claro dark:text-[#BFAEB3] leading-relaxed">
            Muito obrigada pelo seu contato, <strong className="text-texto-escuro dark:text-white">{formData.name}</strong>. Nossa equipe de atendimento responderá o mais breve possível no e-mail <strong>{formData.email}</strong>.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsSuccess(false);
              setFormData({
                name: "",
                email: "",
                phone: "",
                subject: "duvida-produto",
                message: "",
              });
            }}
            className="w-full sm:w-auto"
          >
            Enviar Nova Mensagem
          </Button>

          <Button
            type="button"
            onClick={handleOpenWhatsAppDirect}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Falar no WhatsApp Agora</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-borda-suave dark:border-[#38262C] bg-white dark:bg-[#1A1215] p-6 sm:p-10 shadow-xs space-y-6"
    >
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primaria/10 text-primaria text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Atendimento Humanizado</span>
        </div>
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1]">
          Envie sua Mensagem
        </h3>
        <p className="text-xs sm:text-sm text-texto-claro dark:text-[#A89299]">
          Preencha o formulário abaixo e retornaremos rapidamente.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nome */}
        <div className="space-y-1.5">
          <label
            htmlFor="contact-name"
            className="block text-xs font-semibold text-texto-escuro dark:text-[#E8DCE0]"
          >
            Seu Nome Completo <span className="text-primaria">*</span>
          </label>
          <Input
            id="contact-name"
            type="text"
            placeholder="Ex: Maria Silva"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="h-11"
          />
        </div>

        {/* E-mail */}
        <div className="space-y-1.5">
          <label
            htmlFor="contact-email"
            className="block text-xs font-semibold text-texto-escuro dark:text-[#E8DCE0]"
          >
            Seu E-mail <span className="text-primaria">*</span>
          </label>
          <Input
            id="contact-email"
            type="email"
            placeholder="Ex: maria@exemplo.com.br"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="h-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Telefone/WhatsApp */}
        <div className="space-y-1.5">
          <label
            htmlFor="contact-phone"
            className="block text-xs font-semibold text-texto-escuro dark:text-[#E8DCE0]"
          >
            WhatsApp / Telefone (Opcional)
          </label>
          <Input
            id="contact-phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="h-11"
          />
        </div>

        {/* Assunto */}
        <div className="space-y-1.5">
          <label
            htmlFor="contact-subject"
            className="block text-xs font-semibold text-texto-escuro dark:text-[#E8DCE0]"
          >
            Assunto Principal <span className="text-primaria">*</span>
          </label>
          <select
            id="contact-subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full h-11 px-3 text-sm rounded-xl border border-borda-suave dark:border-[#38262C] bg-white dark:bg-[#201518] text-texto-escuro dark:text-[#F8EFF1] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primaria transition-all"
          >
            <option value="duvida-produto">Dúvida sobre Produto ou Numeração</option>
            <option value="status-pedido">Status ou Rastreamento de Pedido</option>
            <option value="troca-devolucao">Troca, Garantia ou Devolução</option>
            <option value="pagamento">Dúvidas sobre Formas de Pagamento</option>
            <option value="sugestao-elogio">Sugestão, Parceria ou Elogio</option>
            <option value="outro">Outro Assunto</option>
          </select>
        </div>
      </div>

      {/* Mensagem */}
      <div className="space-y-1.5">
        <label
          htmlFor="contact-message"
          className="block text-xs font-semibold text-texto-escuro dark:text-[#E8DCE0]"
        >
          Sua Mensagem <span className="text-primaria">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={4}
          placeholder="Escreva sua dúvida ou solicitação com detalhes para que possamos te ajudar da melhor forma..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
          className="w-full p-3.5 text-sm rounded-xl border border-borda-suave dark:border-[#38262C] bg-white dark:bg-[#201518] text-texto-escuro dark:text-[#F8EFF1] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primaria transition-all resize-y"
        />
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className="text-xs text-texto-claro dark:text-[#9A868C]">
          Respeitamos sua privacidade conforme nossa Política de Dados.
        </p>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto min-w-[160px] gap-2 h-11"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Enviar Mensagem</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
