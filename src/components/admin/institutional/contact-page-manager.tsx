"use client";

import * as React from "react";
import {
  MessageCircle,
  Mail,
  Clock,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Monitor,
  Smartphone,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ContactPageSettings, ContactFaqItem } from "@/lib/settings/types";
import { DEFAULT_CONTACT_PAGE_SETTINGS } from "@/lib/settings/types";
import { updateContactPageSettingsAction } from "@/features/admin/actions";

interface ContactPageManagerProps {
  initialSettings?: ContactPageSettings;
  storeName?: string;
}

export function ContactPageManager({
  initialSettings = DEFAULT_CONTACT_PAGE_SETTINGS,
  storeName = "Isis Store",
}: ContactPageManagerProps) {
  const [settings, setSettings] = React.useState<ContactPageSettings>(() => ({
    ...DEFAULT_CONTACT_PAGE_SETTINGS,
    ...(initialSettings || {}),
    faq_items:
      initialSettings?.faq_items && initialSettings.faq_items.length > 0
        ? initialSettings.faq_items
        : DEFAULT_CONTACT_PAGE_SETTINGS.faq_items,
  }));

  const [activeTab, setActiveTab] = React.useState<"hero" | "channels" | "faq">("hero");
  const [previewDevice, setPreviewDevice] = React.useState<"desktop" | "mobile">("desktop");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Manipulação de FAQ
  const handleAddFaq = () => {
    const newItem: ContactFaqItem = {
      id: "faq_" + Date.now(),
      question: "Nova Pergunta Frequente",
      answer: "Escreva aqui a resposta detalhada e explicativa para suas clientes.",
    };
    setSettings((prev) => ({
      ...prev,
      faq_items: [...prev.faq_items, newItem],
    }));
  };

  const handleUpdateFaq = (id: string, field: "question" | "answer", value: string) => {
    setSettings((prev) => ({
      ...prev,
      faq_items: prev.faq_items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleRemoveFaq = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      faq_items: prev.faq_items.filter((item) => item.id !== id),
    }));
  };

  const handleMoveFaq = (index: number, direction: "up" | "down") => {
    setSettings((prev) => {
      const items = [...prev.faq_items];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
      return { ...prev, faq_items: items };
    });
  };

  const handleResetDefaults = () => {
    if (confirm("Deseja realmente restaurar as configurações padrão da página de contato?")) {
      setSettings(DEFAULT_CONTACT_PAGE_SETTINGS);
      setFeedback({
        type: "success",
        message: "Configurações padrão restauradas na tela. Clique em salvar para persistir.",
      });
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.set("payload", JSON.stringify(settings));

      const res = await updateContactPageSettingsAction(formData);

      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message || "Página de Contato salva com sucesso!",
        });
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Erro ao salvar página de contato.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "Erro de conexão ao salvar.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cleanPhone = (settings.whatsapp_number || "").replace(/\D/g, "");

  return (
    <div className="space-y-6">
      {/* Barra de Ações Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#1A1215] border border-borda-suave dark:border-[#38262C] shadow-xs">
        <div>
          <h2 className="font-serif font-bold text-xl text-texto-escuro dark:text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primaria" />
            <span>Gerenciador da Página de Contato (`/contato`)</span>
          </h2>
          <p className="text-xs text-texto-claro dark:text-[#A89299]">
            Edite textos, canais oficiais, horários e FAQ com visualização instantânea em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            disabled={isSubmitting}
            className="text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Restaurar Padrão
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting}
            className="text-xs bg-primaria hover:bg-primaria/90 text-white shadow-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
              : "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/40"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Grid Principal: Formulário à Esquerda e Live Preview à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna de Edição */}
        <div className="lg:col-span-6 space-y-5">
          {/* Sub-abas de Edição */}
          <div className="flex border-b border-borda-suave dark:border-[#38262C] gap-2 pb-1">
            <button
              type="button"
              onClick={() => setActiveTab("hero")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "hero"
                  ? "bg-primaria text-white"
                  : "text-texto-claro dark:text-[#A89299] hover:bg-fundo dark:hover:bg-[#201518]"
              }`}
            >
              1. Hero & Textos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("channels")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "channels"
                  ? "bg-primaria text-white"
                  : "text-texto-claro dark:text-[#A89299] hover:bg-fundo dark:hover:bg-[#201518]"
              }`}
            >
              2. Canais de Atendimento
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("faq")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "faq"
                  ? "bg-primaria text-white"
                  : "text-texto-claro dark:text-[#A89299] hover:bg-fundo dark:hover:bg-[#201518]"
              }`}
            >
              3. FAQ ({settings.faq_items.length})
            </button>
          </div>

          {/* Aba 1: Hero */}
          {activeTab === "hero" && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1215] border border-borda-suave dark:border-[#38262C] space-y-4 shadow-xs">
              <h3 className="font-bold text-sm text-texto-escuro dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primaria" />
                <span>Cabeçalho Editorial</span>
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-texto-escuro dark:text-white">
                  Badge de Destaque
                </label>
                <Input
                  value={settings.hero_badge}
                  onChange={(e) => setSettings({ ...settings, hero_badge: e.target.value })}
                  placeholder="Ex: Estamos Aqui por Você"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-texto-escuro dark:text-white">
                  Título Principal
                </label>
                <Input
                  value={settings.hero_title}
                  onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                  placeholder="Ex: Fale Conosco"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-texto-escuro dark:text-white">
                  Texto de Apoio
                </label>
                <textarea
                  rows={3}
                  value={settings.hero_description}
                  onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })}
                  className="w-full text-xs rounded-xl border border-borda-suave dark:border-[#38262C] bg-white dark:bg-[#1C1417] p-3 text-texto-escuro dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primaria"
                  placeholder="Descreva o acolhimento do suporte..."
                />
              </div>

              <div className="pt-2 border-t border-borda-suave/60 dark:border-[#2C1D22] space-y-3">
                <h4 className="text-xs font-bold text-texto-escuro dark:text-white">
                  Formulário de Mensagem
                </h4>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-texto-escuro dark:text-white">
                    Título do Formulário
                  </label>
                  <Input
                    value={settings.form_title}
                    onChange={(e) => setSettings({ ...settings, form_title: e.target.value })}
                    placeholder="Ex: Como podemos te ajudar hoje?"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Aba 2: Canais de Atendimento */}
          {activeTab === "channels" && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1215] border border-borda-suave dark:border-[#38262C] space-y-5 shadow-xs">
              {/* WhatsApp */}
              <div className="space-y-3 p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4" />
                  <span>Canal WhatsApp</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-texto-escuro dark:text-white">
                      Título
                    </label>
                    <Input
                      value={settings.whatsapp_title}
                      onChange={(e) => setSettings({ ...settings, whatsapp_title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-texto-escuro dark:text-white">
                      Número (com DDD)
                    </label>
                    <Input
                      value={settings.whatsapp_number}
                      onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                      placeholder="Ex: 5517992495308"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-texto-escuro dark:text-white">
                      Texto do Botão
                    </label>
                    <Input
                      value={settings.whatsapp_button_text}
                      onChange={(e) => setSettings({ ...settings, whatsapp_button_text: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-texto-escuro dark:text-white">
                      Descrição Curta
                    </label>
                    <Input
                      value={settings.whatsapp_description}
                      onChange={(e) => setSettings({ ...settings, whatsapp_description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* E-mail */}
              <div className="space-y-3 p-3.5 rounded-xl bg-fundo dark:bg-[#201518] border border-borda-suave dark:border-[#38262C]">
                <h4 className="text-xs font-bold text-texto-escuro dark:text-white flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-primaria" />
                  <span>Canal E-mail</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-texto-escuro dark:text-white">
                      Título
                    </label>
                    <Input
                      value={settings.email_title}
                      onChange={(e) => setSettings({ ...settings, email_title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-texto-escuro dark:text-white">
                      E-mail de Contato
                    </label>
                    <Input
                      value={settings.email_address}
                      onChange={(e) => setSettings({ ...settings, email_address: e.target.value })}
                      placeholder="contato@isisstore.com.br"
                    />
                  </div>
                </div>
              </div>

              {/* Horário */}
              <div className="space-y-3 p-3.5 rounded-xl bg-fundo dark:bg-[#201518] border border-borda-suave dark:border-[#38262C]">
                <h4 className="text-xs font-bold text-texto-escuro dark:text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Horários de Operação</span>
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-semibold text-texto-escuro dark:text-white">
                      Horários Exibidos
                    </label>
                    <Input
                      value={settings.hours_text}
                      onChange={(e) => setSettings({ ...settings, hours_text: e.target.value })}
                      placeholder="Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-texto-escuro dark:text-white">
                      Aviso de Fora do Horário
                    </label>
                    <Input
                      value={settings.hours_description}
                      onChange={(e) => setSettings({ ...settings, hours_description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Garantia */}
              <div className="space-y-3 p-3.5 rounded-xl bg-fundo dark:bg-[#201518] border border-borda-suave dark:border-[#38262C]">
                <h4 className="text-xs font-bold text-texto-escuro dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  <span>Card de Garantia & Trocas</span>
                </h4>
                <div>
                  <label className="text-[11px] font-semibold text-texto-escuro dark:text-white">
                    Descrição do Card
                  </label>
                  <Input
                    value={settings.guarantee_description}
                    onChange={(e) => setSettings({ ...settings, guarantee_description: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Aba 3: FAQ */}
          {activeTab === "faq" && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1215] border border-borda-suave dark:border-[#38262C] space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-texto-escuro dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primaria" />
                    <span>Perguntas Frequentes</span>
                  </h3>
                  <p className="text-xs text-texto-claro dark:text-[#A89299]">
                    Adicione, edite ou reordene as perguntas da página.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddFaq}
                  className="text-xs bg-primaria text-white"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Nova Pergunta
                </Button>
              </div>

              <div className="space-y-3 pt-2">
                {settings.faq_items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-borda-suave dark:border-[#38262C] bg-fundo/40 dark:bg-[#201518] space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-primaria">
                        Item #{index + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveFaq(index, "up")}
                          className="p-1 rounded text-texto-claro hover:text-primaria disabled:opacity-30"
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === settings.faq_items.length - 1}
                          onClick={() => handleMoveFaq(index, "down")}
                          className="p-1 rounded text-texto-claro hover:text-primaria disabled:opacity-30"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(item.id)}
                          className="p-1 rounded text-red-500 hover:text-red-700 ml-1"
                          title="Remover pergunta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-texto-escuro dark:text-white">
                        Pergunta
                      </label>
                      <Input
                        value={item.question}
                        onChange={(e) => handleUpdateFaq(item.id, "question", e.target.value)}
                        placeholder="Qual a pergunta?"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-texto-escuro dark:text-white">
                        Resposta
                      </label>
                      <textarea
                        rows={2}
                        value={item.answer}
                        onChange={(e) => handleUpdateFaq(item.id, "answer", e.target.value)}
                        className="w-full text-xs rounded-xl border border-borda-suave dark:border-[#38262C] bg-white dark:bg-[#1C1417] p-2.5 text-texto-escuro dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primaria"
                        placeholder="Qual a resposta?"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Coluna do Live Preview em Tempo Real */}
        <div className="lg:col-span-6 space-y-3 sticky top-6">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#1A1215] border border-borda-suave dark:border-[#38262C]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-texto-escuro dark:text-white">
                Preview em Tempo Real
              </span>
            </div>

            <div className="flex items-center gap-1 bg-fundo dark:bg-[#201518] p-1 rounded-lg border border-borda-suave dark:border-[#38262C]">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded text-xs flex items-center gap-1 font-semibold transition-colors ${
                  previewDevice === "desktop"
                    ? "bg-white dark:bg-[#2A1D22] text-primaria shadow-xs"
                    : "text-texto-claro dark:text-[#A89299]"
                }`}
                title="Modo Desktop"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded text-xs flex items-center gap-1 font-semibold transition-colors ${
                  previewDevice === "mobile"
                    ? "bg-white dark:bg-[#2A1D22] text-primaria shadow-xs"
                    : "text-texto-claro dark:text-[#A89299]"
                }`}
                title="Modo Mobile"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
          </div>

          {/* Container do Preview */}
          <div
            className={`transition-all mx-auto overflow-hidden rounded-2xl border-2 border-borda-suave dark:border-[#38262C] bg-fundo/40 dark:bg-[#140D10] ${
              previewDevice === "mobile"
                ? "max-w-[375px] shadow-2xl ring-8 ring-black/10 dark:ring-white/5"
                : "w-full shadow-md"
            }`}
          >
            {/* Barra simulada do navegador */}
            <div className="px-3 py-2 bg-white dark:bg-[#1C1417] border-b border-borda-suave dark:border-[#38262C] flex items-center justify-between text-[11px] text-texto-claro dark:text-[#8E797F]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <span className="font-mono text-[10px] truncate max-w-[200px]">
                isisstore.com.br/contato
              </span>
              <a
                href="/contato"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primaria"
                title="Abrir página real"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Conteúdo Renderizado ao Vivo */}
            <div className="p-4 sm:p-6 space-y-6 max-h-[650px] overflow-y-auto">
              {/* Hero */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primaria/10 text-primaria text-[11px] font-semibold">
                  <Sparkles className="w-3 h-3" />
                  <span>{settings.hero_badge || "Estamos Aqui por Você"}</span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-white">
                  {settings.hero_title || "Fale Conosco"}
                </h2>
                <p className="text-xs text-texto-claro dark:text-[#BFAEB3] leading-relaxed">
                  {settings.hero_description || "Como podemos te ajudar hoje?"}
                </p>
              </div>

              {/* Grid dos Cards Rápidos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* WhatsApp */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1C1417] border border-emerald-100 dark:border-emerald-950/40 shadow-2xs space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-texto-escuro dark:text-white">
                      {settings.whatsapp_title || "WhatsApp Oficial"}
                    </h4>
                    <p className="text-[11px] text-texto-claro dark:text-[#A89299]">
                      {settings.whatsapp_description}
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 pt-1">
                    <span>{settings.whatsapp_button_text}</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>

                {/* E-mail */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1C1417] border border-borda-suave dark:border-[#38262C] shadow-2xs space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-primaria/10 text-primaria flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-texto-escuro dark:text-white">
                      {settings.email_title || "E-mail de Suporte"}
                    </h4>
                    <p className="text-[11px] text-texto-claro dark:text-[#A89299]">
                      {settings.email_description}
                    </p>
                  </div>
                  <div className="text-[10px] font-bold text-primaria truncate pt-1">
                    {settings.email_address}
                  </div>
                </div>

                {/* Horário */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1C1417] border border-borda-suave dark:border-[#38262C] shadow-2xs space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-texto-escuro dark:text-white">
                      {settings.hours_title || "Atendimento"}
                    </h4>
                    <p className="text-[11px] text-texto-claro dark:text-[#A89299]">
                      {settings.hours_text}
                    </p>
                  </div>
                </div>

                {/* Garantia */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1C1417] border border-borda-suave dark:border-[#38262C] shadow-2xs space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-texto-escuro dark:text-white">
                      {settings.guarantee_title || "Garantia"}
                    </h4>
                    <p className="text-[11px] text-texto-claro dark:text-[#A89299]">
                      {settings.guarantee_description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview FAQ */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1417] border border-borda-suave dark:border-[#38262C] space-y-3 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-texto-escuro dark:text-white">
                  <HelpCircle className="w-3.5 h-3.5 text-primaria" />
                  <span>{settings.faq_title || "Perguntas Frequentes"}</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {settings.faq_items.slice(0, 3).map((item, idx) => (
                    <div key={item.id || idx} className="space-y-0.5">
                      <h5 className="font-semibold text-texto-escuro dark:text-white text-[11px]">
                        {item.question}
                      </h5>
                      <p className="text-[10px] text-texto-claro dark:text-[#A89299] leading-tight line-clamp-2">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                  {settings.faq_items.length > 3 && (
                    <p className="text-[10px] text-primaria font-semibold pt-1">
                      + {settings.faq_items.length - 3} outras perguntas na página completa
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
