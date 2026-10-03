"use client";

import * as React from "react";
import {
  Sparkles,
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
  Layers,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FeatureIcon,
  AVAILABLE_FEATURE_ICONS,
} from "@/components/commerce/feature-icon";
import type {
  BrandFeatureCard,
  FeatureCardIcon,
  FeatureCardBadgeVariant,
} from "@/lib/settings/types";
import {
  DEFAULT_BRAND_FEATURE_CARDS,
  DEFAULT_STORE_SETTINGS,
} from "@/lib/settings/types";
import { updateBrandFeaturesAction } from "@/features/admin/actions";

interface BrandFeaturesManagerProps {
  initialBadge?: string;
  initialTitle?: string;
  initialSubtitle?: string;
  initialCards?: BrandFeatureCard[];
  storeName?: string;
}

export function BrandFeaturesManager({
  initialBadge = DEFAULT_STORE_SETTINGS.brand_features_badge,
  initialTitle = DEFAULT_STORE_SETTINGS.brand_features_title,
  initialSubtitle = DEFAULT_STORE_SETTINGS.brand_features_subtitle,
  initialCards = DEFAULT_BRAND_FEATURE_CARDS,
  storeName = "Isis Store",
}: BrandFeaturesManagerProps) {
  const [badgeText, setBadgeText] = React.useState(initialBadge);
  const [titleText, setTitleText] = React.useState(initialTitle);
  const [subtitleText, setSubtitleText] = React.useState(initialSubtitle);
  const [cards, setCards] = React.useState<BrandFeatureCard[]>(
    initialCards && initialCards.length > 0
      ? initialCards
      : DEFAULT_BRAND_FEATURE_CARDS
  );

  const [previewDevice, setPreviewDevice] = React.useState<"desktop" | "mobile">(
    "desktop"
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Manipulação de Cards
  const handleAddCard = () => {
    const newCard: BrandFeatureCard = {
      id: "card_" + Date.now(),
      title: "Novo Diferencial",
      description: "Descreva aqui o diferencial e benefício para sua cliente.",
      badge_text: "Destaque",
      badge_variant: "default",
      icon: "sparkles",
    };
    setCards((prev) => [...prev, newCard]);
  };

  const handleUpdateCard = (
    index: number,
    field: keyof BrandFeatureCard,
    value: any
  ) => {
    setCards((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleMoveCard = (index: number, direction: "up" | "down") => {
    setCards((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleRemoveCard = (index: number) => {
    if (cards.length <= 1) {
      alert("A seção precisa de pelo menos 1 card para exibição.");
      return;
    }
    setCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetToDefault = () => {
    if (
      window.confirm(
        "Tem certeza que deseja restaurar os diferenciais originais da Isis Store?"
      )
    ) {
      setBadgeText(DEFAULT_STORE_SETTINGS.brand_features_badge);
      setTitleText(DEFAULT_STORE_SETTINGS.brand_features_title);
      setSubtitleText(DEFAULT_STORE_SETTINGS.brand_features_subtitle);
      setCards(DEFAULT_BRAND_FEATURE_CARDS);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("brand_features_badge", badgeText.trim());
    formData.append("brand_features_title", titleText.trim());
    formData.append("brand_features_subtitle", subtitleText.trim());
    formData.append("brand_features_cards", JSON.stringify(cards));

    try {
      const res = await updateBrandFeaturesAction(formData);
      if (res.success) {
        setFeedback({
          type: "success",
          message:
            res.message ||
            "Diferenciais da loja atualizados com sucesso! A Home já reflete as novas alterações.",
        });
        setTimeout(() => setFeedback(null), 6000);
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Erro ao salvar diferenciais.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "Falha de conexão com o servidor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Top Banner de Controles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-borda shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primaria-soft text-primaria">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="font-serif text-xl font-bold text-texto-escuro">
              Editor de Diferenciais da Marca (Padrão de Excelência)
            </h2>
          </div>
          <p className="text-xs text-texto-claro mt-1">
            Personalize textos, badges, ícones e adicione novos cards com visualização ao vivo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetToDefault}
            className="text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Restaurar Padrão
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleAddCard}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Adicionar Novo Card
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            isLoading={isSubmitting}
            className="text-xs bg-primaria hover:bg-primaria/90 text-white font-semibold shadow-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Salvar no Site
          </Button>
        </div>
      </div>

      {/* Feedback Toast / Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-sucesso-fundo text-sucesso border border-sucesso/30"
              : "bg-erro-fundo text-erro border border-erro/30"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Container Principal: PREVIEW AO VIVO EM TEMPO REAL */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-texto-escuro uppercase tracking-wider">
              Preview em Tempo Real — Exatamente como visto na Home
            </span>
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs">
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                previewDevice === "desktop"
                  ? "bg-white text-texto-escuro shadow-2xs"
                  : "text-texto-claro hover:text-texto-escuro"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                previewDevice === "mobile"
                  ? "bg-white text-texto-escuro shadow-2xs"
                  : "text-texto-claro hover:text-texto-escuro"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile
            </button>
          </div>
        </div>

        {/* Quadro de Simulação da Home */}
        <div className="p-4 sm:p-8 rounded-3xl bg-fundo border-2 border-dashed border-primaria/30 overflow-hidden shadow-inner">
          <div
            className={`transition-all duration-300 mx-auto ${
              previewDevice === "mobile"
                ? "max-w-sm bg-white p-4 rounded-3xl shadow-xl border border-borda"
                : "max-w-7xl"
            }`}
          >
            {/* Header da Seção */}
            <div className="text-center max-w-2xl mx-auto mb-8">
              {badgeText && (
                <Badge
                  variant="default"
                  className="mb-3 uppercase tracking-wider text-[11px]"
                >
                  {badgeText}
                </Badge>
              )}
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-texto-escuro">
                {titleText || "Título da Seção"}
              </h2>
              {subtitleText && (
                <p className="text-xs sm:text-sm text-texto-claro mt-2 leading-relaxed">
                  {subtitleText}
                </p>
              )}
            </div>

            {/* Grid dos Cards de Diferencial */}
            <div
              className={`grid gap-5 ${
                previewDevice === "mobile"
                  ? "grid-cols-1"
                  : cards.length === 1
                  ? "grid-cols-1 max-w-md mx-auto"
                  : cards.length === 2
                  ? "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto"
                  : cards.length === 3
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              }`}
            >
              {cards.map((card, i) => (
                <div
                  key={card.id || i}
                  className="p-6 rounded-3xl bg-fundo-card border border-borda shadow-xs hover:border-primaria/40 hover:shadow-md transition-all duration-300 flex flex-col items-start gap-4 text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primaria-soft text-primaria flex items-center justify-center shadow-xs shrink-0">
                    <FeatureIcon name={card.icon} className="w-6 h-6" />
                  </div>
                  <div className="w-full">
                    <h3 className="font-serif text-lg font-bold text-texto-escuro">
                      {card.title || "Título do Diferencial"}
                    </h3>
                    <p className="text-xs sm:text-sm text-texto-claro mt-2 leading-relaxed">
                      {card.description || "Descrição do diferencial..."}
                    </p>
                  </div>
                  {card.badge_text && (
                    <Badge
                      variant={card.badge_variant}
                      className="mt-auto text-[10px]"
                    >
                      {card.badge_text}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Edição Completa */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna 1: Textos da Seção */}
        <div className="lg:col-span-4 p-6 bg-white rounded-2xl border border-borda shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-borda-suave">
            <Palette className="w-4 h-4 text-primaria" />
            <h3 className="font-serif text-base font-bold text-texto-escuro">
              Textos Principais da Seção
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-texto-escuro mb-1.5">
              Tag / Badge Superior
            </label>
            <Input
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="Ex: Padrão de Excelência"
            />
            <span className="text-[10px] text-texto-claro mt-1 block">
              Pílula de destaque exibida acima do título principal.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-texto-escuro mb-1.5">
              Título da Seção
            </label>
            <Input
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              placeholder="Ex: Por que escolher a Isis Store?"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-texto-escuro mb-1.5">
              Subtítulo / Descrição da Seção
            </label>
            <textarea
              value={subtitleText}
              onChange={(e) => setSubtitleText(e.target.value)}
              rows={3}
              placeholder="Descreva o propósito e compromisso com o cliente..."
              className="w-full text-xs p-3 rounded-xl border border-borda bg-fundo focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primaria/40 transition-colors"
            />
          </div>
        </div>

        {/* Coluna 2: Edição dos Cards Individuais */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primaria" />
              <h3 className="font-serif text-base font-bold text-texto-escuro">
                Cards de Destaque ({cards.length})
              </h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCard}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Adicionar Card
            </Button>
          </div>

          <div className="space-y-4">
            {cards.map((card, index) => (
              <div
                key={card.id || index}
                className="p-5 bg-white rounded-2xl border border-borda shadow-xs flex flex-col gap-4 transition-all hover:border-primaria/30"
              >
                {/* Header do Card com Botões de Posição & Remoção */}
                <div className="flex items-center justify-between pb-3 border-b border-borda-suave">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-primaria-soft text-primaria font-bold text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-serif font-bold text-sm text-texto-escuro">
                      {card.title || `Card #${index + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveCard(index, "up")}
                      className="p-1.5 rounded-lg border border-borda hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent text-texto-escuro transition-colors"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === cards.length - 1}
                      onClick={() => handleMoveCard(index, "down")}
                      className="p-1.5 rounded-lg border border-borda hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent text-texto-escuro transition-colors"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCard(index)}
                      className="p-1.5 rounded-lg border border-erro/30 text-erro hover:bg-erro-fundo transition-colors ml-1"
                      title="Excluir card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Seletor de Ícone Visual */}
                <div>
                  <label className="block text-[11px] font-semibold text-texto-escuro mb-1.5">
                    Ícone do Card
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_FEATURE_ICONS.map((iconOpt) => {
                      const isSelected = card.icon === iconOpt.id;
                      return (
                        <button
                          key={iconOpt.id}
                          type="button"
                          onClick={() =>
                            handleUpdateCard(index, "icon", iconOpt.id)
                          }
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs transition-all ${
                            isSelected
                              ? "bg-primaria-soft border-primaria text-primaria font-bold shadow-2xs"
                              : "bg-fundo border-borda hover:bg-white text-texto-claro hover:text-texto-escuro"
                          }`}
                        >
                          <FeatureIcon name={iconOpt.id} className="w-4 h-4" />
                          <span className="text-[11px]">{iconOpt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Campos de Título e Descrição */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-texto-escuro mb-1">
                      Título do Card
                    </label>
                    <Input
                      value={card.title}
                      onChange={(e) =>
                        handleUpdateCard(index, "title", e.target.value)
                      }
                      placeholder="Ex: Banhos Nobres 18k & Prata"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-texto-escuro mb-1">
                      Texto do Badge Inferior
                    </label>
                    <Input
                      value={card.badge_text}
                      onChange={(e) =>
                        handleUpdateCard(index, "badge_text", e.target.value)
                      }
                      placeholder="Ex: Alta Durabilidade"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div>
                    <label className="block text-[11px] font-semibold text-texto-escuro mb-1">
                      Descrição Detalhada
                    </label>
                    <textarea
                      value={card.description}
                      onChange={(e) =>
                        handleUpdateCard(index, "description", e.target.value)
                      }
                      rows={2}
                      placeholder="Detalhes sobre este benefício..."
                      className="w-full text-xs p-2.5 rounded-xl border border-borda bg-fundo focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primaria/40 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-texto-escuro mb-1">
                      Estilo do Badge
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {[
                        { id: "default", label: "Padrão (Rosa)", variant: "default" as const },
                        { id: "success", label: "Sucesso (Verde)", variant: "success" as const },
                        { id: "warning", label: "Alerta (Dourado)", variant: "warning" as const },
                        { id: "discount", label: "Destaque (Intenso)", variant: "discount" as const },
                      ].map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() =>
                            handleUpdateCard(index, "badge_variant", v.id)
                          }
                          className={`p-2 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                            card.badge_variant === v.id
                              ? "border-primaria bg-primaria-soft/40 font-semibold"
                              : "border-borda hover:bg-fundo"
                          }`}
                        >
                          <span className="text-[11px]">{v.label}</span>
                          <Badge variant={v.variant} className="text-[9px] py-0 px-1.5">
                            Tag
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botão de Salvar no Rodapé */}
          <div className="flex justify-end pt-4">
            <Button
              type="button"
              onClick={handleSave}
              isLoading={isSubmitting}
              className="bg-primaria hover:bg-primaria/90 text-white font-semibold shadow-xs"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações dos Diferenciais
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
