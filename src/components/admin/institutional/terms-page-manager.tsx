"use client";

import * as React from "react";
import {
  Scale,
  ShieldCheck,
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
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TermsPageSettings, LegalSectionItem } from "@/lib/settings/types";
import { DEFAULT_TERMS_PAGE_SETTINGS } from "@/lib/settings/types";
import { updateTermsPageSettingsAction } from "@/features/admin/actions";

interface TermsPageManagerProps {
  initialSettings?: TermsPageSettings;
  storeName?: string;
}

export function TermsPageManager({
  initialSettings = DEFAULT_TERMS_PAGE_SETTINGS,
  storeName = "Isis Store",
}: TermsPageManagerProps) {
  const [settings, setSettings] = React.useState<TermsPageSettings>(() => ({
    ...DEFAULT_TERMS_PAGE_SETTINGS,
    ...(initialSettings || {}),
    sections:
      initialSettings?.sections && initialSettings.sections.length > 0
        ? initialSettings.sections
        : DEFAULT_TERMS_PAGE_SETTINGS.sections,
  }));

  const [activeTab, setActiveTab] = React.useState<"hero" | "sections">("hero");
  const [previewDevice, setPreviewDevice] = React.useState<"desktop" | "mobile">("desktop");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Manipulação de Seções
  const handleAddSection = () => {
    const nextNumber = settings.sections.length + 1;
    const newSection: LegalSectionItem = {
      id: "sec_" + Date.now(),
      title: `${nextNumber}. Nova Cláusula`,
      content: "Insira aqui o texto explicativo da cláusula ou termo de serviço.",
      highlight: "",
    };
    setSettings((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const handleUpdateSection = (
    id: string,
    field: "title" | "content" | "highlight",
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      sections: prev.sections.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleRemoveSection = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      sections: prev.sections.filter((item) => item.id !== id),
    }));
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    setSettings((prev) => {
      const items = [...prev.sections];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
      return { ...prev, sections: items };
    });
  };

  const handleResetDefaults = () => {
    if (confirm("Deseja realmente restaurar as cláusulas e textos padrão dos Termos de Uso?")) {
      setSettings(DEFAULT_TERMS_PAGE_SETTINGS);
      setFeedback({
        type: "success",
        message: "Termos padrão restaurados na tela. Clique em salvar para persistir.",
      });
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.set("payload", JSON.stringify(settings));

      const res = await updateTermsPageSettingsAction(formData);

      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message || "Termos de Uso salvos com sucesso!",
        });
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Erro ao salvar termos de uso.",
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

  return (
    <div className="space-y-6">
      {/* Barra de Ações Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#1A1215] border border-borda-suave dark:border-[#38262C] shadow-xs">
        <div>
          <h2 className="font-serif font-bold text-xl text-texto-escuro dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-primaria" />
            <span>Gerenciador dos Termos e Condições (`/termos`)</span>
          </h2>
          <p className="text-xs text-texto-claro dark:text-[#A89299]">
            Configure as cláusulas do CDC, garantia de semijoias e direitos do consumidor com preview em tempo real.
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

      {/* Grid Principal */}
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
              1. Cabeçalho & CDC
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sections")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "sections"
                  ? "bg-primaria text-white"
                  : "text-texto-claro dark:text-[#A89299] hover:bg-fundo dark:hover:bg-[#201518]"
              }`}
            >
              2. Cláusulas ({settings.sections.length})
            </button>
          </div>

          {/* Aba 1: Hero & CDC */}
          {activeTab === "hero" && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1215] border border-borda-suave dark:border-[#38262C] space-y-4 shadow-xs">
              <h3 className="font-bold text-sm text-texto-escuro dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-primaria" />
                <span>Cabeçalho Editorial</span>
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-texto-escuro dark:text-white">
                  Badge Superior
                </label>
                <Input
                  value={settings.hero_badge}
                  onChange={(e) => setSettings({ ...settings, hero_badge: e.target.value })}
                  placeholder="Ex: Transparência & Conformidade Legal"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-texto-escuro dark:text-white">
                  Título dos Termos
                </label>
                <Input
                  value={settings.hero_title}
                  onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                  placeholder="Ex: Termos e Condições de Uso"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-texto-escuro dark:text-white">
                  Data de Revisão / Versão
                </label>
                <Input
                  value={settings.last_updated_text}
                  onChange={(e) => setSettings({ ...settings, last_updated_text: e.target.value })}
                  placeholder="Ex: Última atualização: Outubro de 2026 • Versão 2.0"
                />
              </div>

              {/* Destaque CDC */}
              <div className="pt-3 border-t border-borda-suave/60 dark:border-[#2C1D22] space-y-3">
                <h4 className="text-xs font-bold text-texto-escuro dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primaria" />
                  <span>Card de Compromisso com o CDC</span>
                </h4>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-texto-escuro dark:text-white">
                    Título do Card CDC
                  </label>
                  <Input
                    value={settings.cdc_banner_title}
                    onChange={(e) =>
                      setSettings({ ...settings, cdc_banner_title: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-texto-escuro dark:text-white">
                    Texto do Card CDC
                  </label>
                  <textarea
                    rows={3}
                    value={settings.cdc_banner_text}
                    onChange={(e) =>
                      setSettings({ ...settings, cdc_banner_text: e.target.value })
                    }
                    className="w-full text-xs rounded-xl border border-borda-suave dark:border-[#38262C] bg-white dark:bg-[#1C1417] p-3 text-texto-escuro dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primaria"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Aba 2: Cláusulas */}
          {activeTab === "sections" && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1215] border border-borda-suave dark:border-[#38262C] space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-texto-escuro dark:text-white">
                    Cláusulas Contratuais
                  </h3>
                  <p className="text-xs text-texto-claro dark:text-[#A89299]">
                    Adicione ou edite as seções legais dos termos.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddSection}
                  className="text-xs bg-primaria text-white"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Nova Cláusula
                </Button>
              </div>

              <div className="space-y-3 pt-2">
                {settings.sections.map((sec, index) => (
                  <div
                    key={sec.id}
                    className="p-3.5 rounded-xl border border-borda-suave dark:border-[#38262C] bg-fundo/40 dark:bg-[#201518] space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-primaria">
                        Cláusula #{index + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveSection(index, "up")}
                          className="p-1 rounded text-texto-claro hover:text-primaria disabled:opacity-30"
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === settings.sections.length - 1}
                          onClick={() => handleMoveSection(index, "down")}
                          className="p-1 rounded text-texto-claro hover:text-primaria disabled:opacity-30"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(sec.id)}
                          className="p-1 rounded text-red-500 hover:text-red-700 ml-1"
                          title="Remover cláusula"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-texto-escuro dark:text-white">
                        Título da Cláusula
                      </label>
                      <Input
                        value={sec.title}
                        onChange={(e) => handleUpdateSection(sec.id, "title", e.target.value)}
                        placeholder="Ex: 1. Aceitação e Objeto"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-texto-escuro dark:text-white">
                        Conteúdo
                      </label>
                      <textarea
                        rows={4}
                        value={sec.content}
                        onChange={(e) => handleUpdateSection(sec.id, "content", e.target.value)}
                        className="w-full text-xs rounded-xl border border-borda-suave dark:border-[#38262C] bg-white dark:bg-[#1C1417] p-2.5 text-texto-escuro dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primaria"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-texto-escuro dark:text-white">
                        Destaque Especial (opcional)
                      </label>
                      <Input
                        value={sec.highlight || ""}
                        onChange={(e) => handleUpdateSection(sec.id, "highlight", e.target.value)}
                        placeholder="Ex: Artigo 49 do CDC: Devolução grátis em até 7 dias corridos"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Coluna do Live Preview */}
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
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
          </div>

          <div
            className={`transition-all mx-auto overflow-hidden rounded-2xl border-2 border-borda-suave dark:border-[#38262C] bg-fundo/40 dark:bg-[#140D10] ${
              previewDevice === "mobile"
                ? "max-w-[375px] shadow-2xl ring-8 ring-black/10 dark:ring-white/5"
                : "w-full shadow-md"
            }`}
          >
            <div className="px-3 py-2 bg-white dark:bg-[#1C1417] border-b border-borda-suave dark:border-[#38262C] flex items-center justify-between text-[11px] text-texto-claro dark:text-[#8E797F]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <span className="font-mono text-[10px] truncate max-w-[200px]">
                isisstore.com.br/termos
              </span>
              <a
                href="/termos"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primaria"
                title="Abrir página real"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-4 sm:p-6 space-y-6 max-h-[650px] overflow-y-auto">
              {/* Header */}
              <div className="space-y-1.5 border-b border-borda-suave dark:border-[#38262C] pb-4">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primaria/10 text-primaria text-[11px] font-semibold">
                  <Scale className="w-3 h-3" />
                  <span>{settings.hero_badge}</span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-texto-escuro dark:text-white">
                  {settings.hero_title}
                </h3>
                <p className="text-[11px] text-texto-claro dark:text-[#A89299]">
                  {settings.last_updated_text}
                </p>
              </div>

              {/* Destaque CDC */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-primaria/10 to-transparent border border-primaria/20 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primaria text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="font-serif font-bold text-xs text-texto-escuro dark:text-white">
                    {settings.cdc_banner_title}
                  </h5>
                  <p className="text-[11px] text-texto-claro dark:text-[#BFAEB3] leading-relaxed">
                    {settings.cdc_banner_text}
                  </p>
                </div>
              </div>

              {/* Seções */}
              <div className="space-y-4">
                {settings.sections.slice(0, 4).map((sec, idx) => (
                  <div
                    key={sec.id || idx}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#1A1215] border border-borda-suave dark:border-[#38262C] space-y-1.5 shadow-2xs"
                  >
                    <h5 className="font-serif font-bold text-xs text-texto-escuro dark:text-white">
                      {sec.title}
                    </h5>
                    {sec.highlight && (
                      <p className="text-[10px] font-semibold text-primaria bg-primaria/5 p-1.5 rounded-lg">
                        {sec.highlight}
                      </p>
                    )}
                    <p className="text-[11px] text-texto-claro dark:text-[#A89299] line-clamp-3 leading-relaxed whitespace-pre-line">
                      {sec.content}
                    </p>
                  </div>
                ))}
                {settings.sections.length > 4 && (
                  <p className="text-center text-[10px] text-primaria font-semibold pt-1">
                    + {settings.sections.length - 4} outras cláusulas na página completa
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
