"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  Eye,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Monitor,
  ExternalLink,
  Save,
  RotateCcw,
  Image as ImageIcon,
  Layers,
  ArrowRight,
  Palette,
  Sliders,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HomeSlide, SlideBgTheme, SlideType } from "@/lib/slides/types";
import { DEFAULT_HOME_SLIDES } from "@/lib/slides/types";
import { getThemeClasses } from "@/components/commerce/home-hero-slider";
import {
  saveSlideAction,
  deleteSlideAction,
  toggleSlideActiveAction,
  reorderSlidesAction,
} from "@/features/admin/slide-actions";

interface HomeSlidesManagerProps {
  initialSlides?: HomeSlide[];
}

const PRESET_IMAGES = [
  { label: "Banner Isis Oficial", url: "/images/banner-rosto.jpeg" },
  {
    label: "Colar Coração Ouro",
    url: "/images/products/colar-coracao-delicado-ouro-rosa.jpg",
  },
  {
    label: "Ursinho Pelúcia Carinho",
    url: "/images/products/ursinho-de-pelucia-carinho.jpg",
  },
  {
    label: "Headphone Bluetooth Rosa",
    url: "/images/products/headphone-bluetooth-rosa-soft.jpg",
  },
];

const THEME_OPTIONS: { id: SlideBgTheme; label: string; previewColor: string }[] =
  [
    {
      id: "default",
      label: "Rosé Suave (Padrão)",
      previewColor: "bg-gradient-to-r from-[#FBF3F5] to-[#ECD5DB]",
    },
    {
      id: "dark_rose",
      label: "Vinho Escuro Elegante",
      previewColor: "bg-gradient-to-r from-[#2A151C] to-[#361B24]",
    },
    {
      id: "soft_pink",
      label: "Rosa Delicado & Doce",
      previewColor: "bg-gradient-to-r from-[#FFF0F3] to-[#FCE7F3]",
    },
    {
      id: "gold_luxury",
      label: "Dourado Champagne Nobre",
      previewColor: "bg-gradient-to-r from-[#FDFBF7] to-[#EFE4CE]",
    },
    {
      id: "deep_wine",
      label: "Vinho Profundo Acetinado",
      previewColor: "bg-gradient-to-r from-[#3B1420] to-[#1C090F]",
    },
  ];

const EMPTY_SLIDE: Partial<HomeSlide> = {
  id: undefined,
  title: "Novo Destaque Exclusivo",
  title_highlight: "com Amor! ♡",
  subtitle: "Apresente suas novidades, promoções ou presentes especiais aqui.",
  badge_text: "Novidade",
  image_url: "/images/banner-rosto.jpeg",
  slide_type: "editorial",
  primary_button_text: "Ver Coleção",
  primary_button_url: "/produtos",
  secondary_button_text: "Saiba Mais",
  secondary_button_url: "/sobre",
  bg_theme: "default",
  is_active: true,
  sort_order: 1,
};

export function HomeSlidesManager({
  initialSlides = DEFAULT_HOME_SLIDES,
}: HomeSlidesManagerProps) {
  const [slides, setSlides] = React.useState<HomeSlide[]>(initialSlides);
  const [editingSlide, setEditingSlide] = React.useState<Partial<HomeSlide>>(
    initialSlides[0] ? { ...initialSlides[0] } : { ...EMPTY_SLIDE }
  );
  const [isNewSlide, setIsNewSlide] = React.useState(false);
  const [previewMode, setPreviewMode] = React.useState<"desktop" | "mobile">(
    "desktop"
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Manipular upload local ou URL
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setFeedback({
          type: "error",
          message: "A imagem não pode ser maior que 3MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setEditingSlide((prev) => ({ ...prev, image_url: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Salvar slide atual
  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const payload = {
        id: editingSlide.id,
        title: editingSlide.title || "Destaque Isis Store",
        title_highlight: editingSlide.title_highlight || "",
        subtitle: editingSlide.subtitle || "",
        badge_text: editingSlide.badge_text || "",
        image_url: editingSlide.image_url || "/images/banner-rosto.jpeg",
        slide_type: editingSlide.slide_type || "editorial",
        primary_button_text: editingSlide.primary_button_text || "",
        primary_button_url: editingSlide.primary_button_url || "",
        secondary_button_text: editingSlide.secondary_button_text || "",
        secondary_button_url: editingSlide.secondary_button_url || "",
        bg_theme: editingSlide.bg_theme || "default",
        is_active: editingSlide.is_active ?? true,
        sort_order: editingSlide.sort_order || slides.length + 1,
      };

      const res = await saveSlideAction(payload);
      if (res.success && res.slide) {
        setFeedback({ type: "success", message: res.message });
        if (isNewSlide) {
          setSlides((prev) => [...prev, res.slide!]);
          setIsNewSlide(false);
        } else {
          setSlides((prev) =>
            prev.map((s) => (s.id === res.slide!.id ? res.slide! : s))
          );
        }
        setEditingSlide(res.slide);
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Erro ao salvar slide.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Falha na comunicação ao salvar slide.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Excluir slide
  const handleDeleteSlide = async (id: string) => {
    if (!confirm("Tem certeza de que deseja remover este slide?")) return;

    try {
      const res = await deleteSlideAction(id);
      if (res.success) {
        const remaining = slides.filter((s) => s.id !== id);
        setSlides(remaining);
        if (editingSlide.id === id) {
          setEditingSlide(remaining[0] || { ...EMPTY_SLIDE });
          setIsNewSlide(remaining.length === 0);
        }
        setFeedback({ type: "success", message: "Slide excluído com sucesso!" });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch {
      setFeedback({ type: "error", message: "Falha ao excluir slide." });
    }
  };

  // Alternar ativo/inativo
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      const res = await toggleSlideActiveAction(id, newStatus);
      if (res.success) {
        setSlides((prev) =>
          prev.map((s) => (s.id === id ? { ...s, is_active: newStatus } : s))
        );
        if (editingSlide.id === id) {
          setEditingSlide((prev) => ({ ...prev, is_active: newStatus }));
        }
        setFeedback({ type: "success", message: res.message });
      }
    } catch {
      setFeedback({ type: "error", message: "Erro ao alterar status." });
    }
  };

  // Mover na ordenação
  const handleMoveSlide = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    setSlides(newSlides);
    const orderedIds = newSlides.map((s) => s.id);
    await reorderSlidesAction(orderedIds);
  };

  // Iniciar criação de novo slide
  const handleStartNewSlide = () => {
    setIsNewSlide(true);
    setEditingSlide({
      ...EMPTY_SLIDE,
      sort_order: slides.length + 1,
    });
  };

  const themeStyle = getThemeClasses(editingSlide.bg_theme || "default");

  return (
    <div className="space-y-10">
      {/* Topo informativo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0E5E7] dark:border-[#38262C]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-texto-escuro dark:text-[#F8EFF1]">
              Carrossel de Slides da Página Inicial
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primaria/10 text-primaria border border-primaria/20">
              {slides.filter((s) => s.is_active).length} ativos
            </span>
          </div>
          <p className="mt-1 text-sm text-texto-medio dark:text-[#C5B0B6]">
            Configure os banners no estilo Magazine Luiza com títulos, imagens,
            links e pré-visualização ao vivo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 dark:border-[#422933] dark:text-[#F8EFF1]"
            >
              <ExternalLink className="w-4 h-4 text-primaria" />
              Ver na Loja
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={handleStartNewSlide}
            className="gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Adicionar Novo Slide
          </Button>
        </div>
      </div>

      {/* FEEDBACK MENSAGEM */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-75 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* ÁREA DE PRÉ-VISUALIZAÇÃO EM TEMPO REAL (LIVE PREVIEW) */}
      <div className="rounded-2xl bg-white dark:bg-[#1C1417] border border-[#F0E5E7] dark:border-[#38262C] p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F7EFF1] dark:border-[#2C1D23]">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primaria" />
            <h3 className="font-bold text-sm sm:text-base text-texto-escuro dark:text-[#F8EFF1]">
              Pré-visualização em Tempo Real (WYSIWYG)
            </h3>
            {isNewSlide && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Novo Slide
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center p-1 rounded-xl bg-[#F7EFF1] dark:bg-[#25181E] border border-[#ECD9DE] dark:border-[#3D252E]">
              <button
                type="button"
                onClick={() => setPreviewMode("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  previewMode === "desktop"
                    ? "bg-white dark:bg-[#151012] text-primaria shadow-2xs"
                    : "text-texto-medio dark:text-[#A8969B] hover:text-primaria"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  previewMode === "mobile"
                    ? "bg-white dark:bg-[#151012] text-primaria shadow-2xs"
                    : "text-texto-medio dark:text-[#A8969B] hover:text-primaria"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Mobile
              </button>
            </div>
          </div>
        </div>

        {/* CONTAINER DO SLIDE SIMULADO COM DESIGN IDÊNTICO À HOME (FULL-WIDTH) */}
        <div
          className={`mx-auto transition-all duration-300 ${
            previewMode === "mobile" ? "max-w-[420px]" : "w-full"
          }`}
        >
          <div
            className={`relative overflow-hidden ${
              previewMode === "mobile"
                ? "rounded-3xl border shadow-md"
                : "rounded-xl border-y shadow-none"
            } ${
              editingSlide.slide_type === "full_banner"
                ? "bg-[#151012] border-transparent"
                : `${themeStyle.border} ${themeStyle.container}`
            } transition-all`}
          >
            {editingSlide.slide_type === "full_banner" ? (
              /* Pré-visualização de Full Banner */
              <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] min-h-[220px] sm:min-h-[340px] flex items-center">
                <Image
                  src={editingSlide.image_url || "/images/banner-rosto.jpeg"}
                  alt={editingSlide.title || "Preview"}
                  fill
                  className="object-cover object-center w-full h-full"
                />
                {(editingSlide.title || editingSlide.primary_button_text) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent flex items-center p-5 sm:p-10">
                    <div className="max-w-md text-left text-white z-10">
                      {editingSlide.badge_text && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider mb-2">
                          <Sparkles className="w-3 h-3 text-primaria-soft" />
                          {editingSlide.badge_text}
                        </div>
                      )}
                      <h4 className="font-serif text-xl sm:text-3xl font-normal leading-tight">
                        {editingSlide.title}{" "}
                        {editingSlide.title_highlight && (
                          <span className="italic font-bold text-primaria-soft">
                            {editingSlide.title_highlight}
                          </span>
                        )}
                      </h4>
                      {editingSlide.subtitle && (
                        <p className="mt-2 text-xs sm:text-sm text-white/90 line-clamp-2">
                          {editingSlide.subtitle}
                        </p>
                      )}
                      {editingSlide.primary_button_text && (
                        <div className="mt-4">
                          <Button size="sm" className="gap-2 font-semibold shadow-xs">
                            {editingSlide.primary_button_text}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Pré-visualização Editorial Oficial (Texto + Imagem) */
              <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 p-5 sm:p-10">
                {/* Lado Esquerdo */}
                <div className="md:col-span-7 flex flex-col items-start text-left z-10">
                  {editingSlide.badge_text && (
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${themeStyle.badge} border text-[11px] font-bold uppercase tracking-wider mb-3`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {editingSlide.badge_text}
                    </div>
                  )}

                  <h3
                    className={`font-serif text-xl sm:text-4xl lg:text-5xl font-normal ${themeStyle.title} tracking-tight leading-[1.15]`}
                  >
                    {editingSlide.title}{" "}
                    {editingSlide.title_highlight && (
                      <span className={`italic font-bold ${themeStyle.highlight}`}>
                        {editingSlide.title_highlight}
                      </span>
                    )}
                  </h3>

                  {editingSlide.subtitle && (
                    <p
                      className={`mt-3 text-xs sm:text-sm ${themeStyle.subtitle} max-w-lg leading-relaxed`}
                    >
                      {editingSlide.subtitle}
                    </p>
                  )}

                  {(editingSlide.primary_button_text ||
                    editingSlide.secondary_button_text) && (
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      {editingSlide.primary_button_text && (
                        <Button
                          size="sm"
                          className="gap-2 shadow-xs font-semibold"
                        >
                          {editingSlide.primary_button_text}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      )}

                      {editingSlide.secondary_button_text && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-semibold border-current/30 hover:bg-black/5 dark:hover:bg-white/10"
                        >
                          {editingSlide.secondary_button_text}
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Lado Direito */}
                <div className="md:col-span-5 relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-sm border border-white/60 dark:border-white/10">
                  <Image
                    src={editingSlide.image_url || "/images/banner-rosto.jpeg"}
                    alt="Preview"
                    fill
                    className="object-cover object-center"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FORMULÁRIO DE EDIÇÃO DO SLIDE */}
      <form
        onSubmit={handleSaveSlide}
        className="rounded-2xl bg-white dark:bg-[#1C1417] border border-[#F0E5E7] dark:border-[#38262C] p-6 sm:p-8 shadow-xs space-y-8"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#F7EFF1] dark:border-[#2C1D23]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primaria" />
            <h3 className="font-serif font-bold text-lg text-texto-escuro dark:text-[#F8EFF1]">
              {isNewSlide ? "Configurar Novo Slide" : "Editar Conteúdo do Slide"}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-texto-medio dark:text-[#C5B0B6] cursor-pointer">
              <input
                type="checkbox"
                checked={editingSlide.is_active ?? true}
                onChange={(e) =>
                  setEditingSlide((prev) => ({
                    ...prev,
                    is_active: e.target.checked,
                  }))
                }
                className="rounded border-[#D4C3C7] text-primaria focus:ring-primaria"
              />
              Slide Ativo na Loja
            </label>
          </div>
        </div>

        {/* Tipo de Slide & Paleta de Cores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de Slide */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1] uppercase tracking-wider">
              Tipo de Slide
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setEditingSlide((prev) => ({
                    ...prev,
                    slide_type: "editorial",
                  }))
                }
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  editingSlide.slide_type !== "full_banner"
                    ? "border-primaria bg-primaria/5 text-primaria font-semibold"
                    : "border-[#ECD9DE] dark:border-[#3D252E] text-texto-medio dark:text-[#A8969B] hover:border-primaria/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span className="text-xs font-bold">Editorial Oficial</span>
                </div>
                <p className="mt-1 text-[11px] opacity-80">
                  Texto elegante à esquerda + imagem em destaque à direita (Anexo 1).
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setEditingSlide((prev) => ({
                    ...prev,
                    slide_type: "full_banner",
                  }))
                }
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  editingSlide.slide_type === "full_banner"
                    ? "border-primaria bg-primaria/5 text-primaria font-semibold"
                    : "border-[#ECD9DE] dark:border-[#3D252E] text-texto-medio dark:text-[#A8969B] hover:border-primaria/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-xs font-bold">Full Banner (Magalu)</span>
                </div>
                <p className="mt-1 text-[11px] opacity-80">
                  Imagem panorâmica preenchendo 100% da área do card.
                </p>
              </button>
            </div>
          </div>

          {/* Tema Visual / Paleta de Fundo */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1] uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-primaria" />
              Estilo / Cor de Fundo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    setEditingSlide((prev) => ({ ...prev, bg_theme: opt.id }))
                  }
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    editingSlide.bg_theme === opt.id
                      ? "border-primaria ring-2 ring-primaria/20 font-bold"
                      : "border-[#ECD9DE] dark:border-[#3D252E] hover:border-primaria/40"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full shrink-0 border border-black/10 ${opt.previewColor}`}
                  />
                  <span className="text-xs truncate dark:text-[#F8EFF1]">
                    {opt.label.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Textos: Badge, Título e Destaque */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1]">
              Tag / Badge Superior (Opcional)
            </label>
            <Input
              value={editingSlide.badge_text || ""}
              onChange={(e) =>
                setEditingSlide((prev) => ({
                  ...prev,
                  badge_text: e.target.value,
                }))
              }
              placeholder="ex: ✨ Coleção Especial"
              className="dark:bg-[#151012] dark:border-[#3D252E] dark:text-[#F8EFF1]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1]">
              Título Principal *
            </label>
            <Input
              required
              value={editingSlide.title || ""}
              onChange={(e) =>
                setEditingSlide((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="ex: Produtos que fazem"
              className="dark:bg-[#151012] dark:border-[#3D252E] dark:text-[#F8EFF1]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1]">
              Palavras em Destaque (Itálico & Rosé)
            </label>
            <Input
              value={editingSlide.title_highlight || ""}
              onChange={(e) =>
                setEditingSlide((prev) => ({
                  ...prev,
                  title_highlight: e.target.value,
                }))
              }
              placeholder="ex: você sorrir! ♡"
              className="dark:bg-[#151012] dark:border-[#3D252E] dark:text-[#F8EFF1]"
            />
          </div>
        </div>

        {/* Subtítulo / Legenda */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1]">
            Legenda / Descrição
          </label>
          <textarea
            rows={2}
            value={editingSlide.subtitle || ""}
            onChange={(e) =>
              setEditingSlide((prev) => ({ ...prev, subtitle: e.target.value }))
            }
            placeholder="Texto explicativo para convencer o cliente a clicar..."
            className="w-full rounded-xl border border-[#ECD9DE] dark:border-[#3D252E] bg-white dark:bg-[#151012] px-3 py-2 text-sm text-texto-escuro dark:text-[#F8EFF1] focus:outline-hidden focus:ring-2 focus:ring-primaria/30"
          />
        </div>

        {/* Imagem do Slide & Presets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1] uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-primaria" />
              Imagem do Slide *
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-primaria hover:underline font-semibold inline-flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              Carregar do Computador
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFileUpload}
            />
          </div>

          <Input
            required
            value={editingSlide.image_url || ""}
            onChange={(e) =>
              setEditingSlide((prev) => ({
                ...prev,
                image_url: e.target.value,
              }))
            }
            placeholder="URL da imagem (ex: /images/banner-rosto.jpeg ou link HTTPS)"
            className="dark:bg-[#151012] dark:border-[#3D252E] dark:text-[#F8EFF1]"
          />

          {/* Atalhos com imagens oficiais */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] text-texto-medio dark:text-[#A8969B] shrink-0 font-medium">
              Imagens Rápidas:
            </span>
            {PRESET_IMAGES.map((preset) => (
              <button
                key={preset.url}
                type="button"
                onClick={() =>
                  setEditingSlide((prev) => ({
                    ...prev,
                    image_url: preset.url,
                  }))
                }
                className={`text-[11px] px-2.5 py-1 rounded-lg border shrink-0 transition-colors ${
                  editingSlide.image_url === preset.url
                    ? "bg-primaria text-white border-primaria font-bold"
                    : "bg-[#FBF3F5] dark:bg-[#25181E] border-[#ECD9DE] dark:border-[#3D252E] text-texto-escuro dark:text-[#D1BAC1] hover:border-primaria"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Botões do Slide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-[#ECD9DE] dark:border-[#3D252E] bg-[#FDFBFB] dark:bg-[#161012] space-y-3">
            <h4 className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1] uppercase tracking-wider">
              Botão Principal (Destaque)
            </h4>
            <div className="space-y-2">
              <Input
                value={editingSlide.primary_button_text || ""}
                onChange={(e) =>
                  setEditingSlide((prev) => ({
                    ...prev,
                    primary_button_text: e.target.value,
                  }))
                }
                placeholder="Texto (ex: Ver Coleção)"
                className="dark:bg-[#1A1316] dark:border-[#3D252E] dark:text-[#F8EFF1]"
              />
              <Input
                value={editingSlide.primary_button_url || ""}
                onChange={(e) =>
                  setEditingSlide((prev) => ({
                    ...prev,
                    primary_button_url: e.target.value,
                  }))
                }
                placeholder="Link (ex: #produtos-destaque ou /produtos)"
                className="dark:bg-[#1A1316] dark:border-[#3D252E] dark:text-[#F8EFF1]"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#ECD9DE] dark:border-[#3D252E] bg-[#FDFBFB] dark:bg-[#161012] space-y-3">
            <h4 className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1] uppercase tracking-wider">
              Botão Secundário (Opcional)
            </h4>
            <div className="space-y-2">
              <Input
                value={editingSlide.secondary_button_text || ""}
                onChange={(e) =>
                  setEditingSlide((prev) => ({
                    ...prev,
                    secondary_button_text: e.target.value,
                  }))
                }
                placeholder="Texto (ex: Nossa História)"
                className="dark:bg-[#1A1316] dark:border-[#3D252E] dark:text-[#F8EFF1]"
              />
              <Input
                value={editingSlide.secondary_button_url || ""}
                onChange={(e) =>
                  setEditingSlide((prev) => ({
                    ...prev,
                    secondary_button_url: e.target.value,
                  }))
                }
                placeholder="Link (ex: /sobre)"
                className="dark:bg-[#1A1316] dark:border-[#3D252E] dark:text-[#F8EFF1]"
              />
            </div>
          </div>
        </div>

        {/* Barra de Submissão do Formulário */}
        <div className="flex items-center justify-between pt-4 border-t border-[#F7EFF1] dark:border-[#2C1D23]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (slides.length > 0) {
                setEditingSlide({ ...slides[0] });
                setIsNewSlide(false);
              }
            }}
            className="gap-2 dark:border-[#3D252E] dark:text-[#F8EFF1]"
          >
            <RotateCcw className="w-4 h-4" />
            Cancelar / Restaurar
          </Button>

          <Button
            type="submit"
            disabled={isSaving}
            className="gap-2 font-bold px-6 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {isSaving
              ? "Salvando..."
              : isNewSlide
              ? "Adicionar Slide à Loja"
              : "Salvar Alterações do Slide"}
          </Button>
        </div>
      </form>

      {/* LISTA DE SLIDES CADASTRADOS */}
      <div className="rounded-2xl bg-white dark:bg-[#1C1417] border border-[#F0E5E7] dark:border-[#38262C] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#F7EFF1] dark:border-[#2C1D23]">
          <div>
            <h3 className="font-serif font-bold text-lg text-texto-escuro dark:text-[#F8EFF1]">
              Slides Cadastrados no Carrossel ({slides.length})
            </h3>
            <p className="text-xs text-texto-medio dark:text-[#A8969B]">
              Arraste ou use as setas para definir a ordem em que aparecem na home.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {slides.map((s, idx) => (
            <div
              key={s.id || idx}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                editingSlide.id === s.id && !isNewSlide
                  ? "border-primaria bg-primaria/5 shadow-2xs"
                  : "border-[#ECD9DE] dark:border-[#3D252E] bg-[#FAFAFA] dark:bg-[#151012] hover:border-primaria/40"
              }`}
            >
              {/* Miniatura + Detalhes */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-black/10 shrink-0 bg-black/5">
                  <Image
                    src={s.image_url || "/images/banner-rosto.jpeg"}
                    alt={s.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1]">
                      #{idx + 1} — {s.title}
                    </span>
                    {s.is_active ? (
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Ativo
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-zinc-500/10 text-zinc-500">
                        Pausado
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-texto-medio dark:text-[#A8969B] line-clamp-1">
                    {s.title_highlight
                      ? `${s.title_highlight} • `
                      : ""}
                    {s.slide_type === "full_banner"
                      ? "Full Banner"
                      : "Editorial com Texto"}
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="flex items-center border border-[#ECD9DE] dark:border-[#3D252E] rounded-lg overflow-hidden bg-white dark:bg-[#1C1417]">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveSlide(idx, "up")}
                    title="Mover para cima"
                    className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-texto-medio dark:text-[#C5B0B6]" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === slides.length - 1}
                    onClick={() => handleMoveSlide(idx, "down")}
                    title="Mover para baixo"
                    className="p-1.5 border-l border-[#ECD9DE] dark:border-[#3D252E] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-texto-medio dark:text-[#C5B0B6]" />
                  </button>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsNewSlide(false);
                    setEditingSlide({ ...s });
                    window.scrollTo({ top: 300, behavior: "smooth" });
                  }}
                  className="gap-1.5 text-xs dark:border-[#3D252E] dark:text-[#F8EFF1]"
                >
                  <Edit className="w-3.5 h-3.5 text-primaria" />
                  Editar
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(s.id, s.is_active)}
                  className="text-xs dark:border-[#3D252E] dark:text-[#F8EFF1]"
                >
                  {s.is_active ? "Pausar" : "Ativar"}
                </Button>

                {slides.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(s.id)}
                    title="Excluir slide"
                    className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
