"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Pause,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HomeSlide, SlideBgTheme } from "@/lib/slides/types";

interface HomeHeroSliderProps {
  slides: HomeSlide[];
  autoPlayIntervalMs?: number;
}

export function getThemeClasses(theme: SlideBgTheme): {
  container: string;
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  border: string;
} {
  switch (theme) {
    case "dark_rose":
      return {
        container:
          "bg-gradient-to-r from-[#2A151C] via-[#1E0F14] to-[#361B24] text-white",
        badge:
          "bg-[#3D1E28] border-[#5A2C3C] text-[#F9A8D4] dark:bg-[#3D1E28] dark:border-[#5A2C3C]",
        title: "text-white",
        highlight: "text-[#F472B6]",
        subtitle: "text-[#E5D0D5]",
        border: "border-[#4A2432]/60",
      };
    case "soft_pink":
      return {
        container:
          "bg-gradient-to-r from-[#FFF0F3] via-[#FEE2E8] to-[#FCE7F3] dark:from-[#321B23] dark:via-[#25141A] dark:to-[#221319]",
        badge:
          "bg-white/90 border-[#FBCFE8] text-[#BE185D] dark:bg-[#1E1217] dark:border-[#522938] dark:text-[#F472B6]",
        title: "text-[#3D1220] dark:text-[#FDF2F4]",
        highlight: "text-primaria",
        subtitle: "text-[#704250] dark:text-[#D1BAC1]",
        border: "border-[#FBCFE8]/60 dark:border-[#522938]/60",
      };
    case "gold_luxury":
      return {
        container:
          "bg-gradient-to-r from-[#FDFBF7] via-[#F7F2E7] to-[#EFE4CE] dark:from-[#262016] dark:via-[#1D1811] dark:to-[#1B1710]",
        badge:
          "bg-white/90 border-[#D4AF37]/40 text-[#854D0E] dark:bg-[#1E1911] dark:border-[#71581D] dark:text-[#EAB308]",
        title: "text-[#292011] dark:text-[#FBF7EE]",
        highlight: "text-[#B45309] dark:text-[#F59E0B]",
        subtitle: "text-[#695537] dark:text-[#CBBFA8]",
        border: "border-[#D4AF37]/30 dark:border-[#71581D]/40",
      };
    case "deep_wine":
      return {
        container:
          "bg-gradient-to-r from-[#3B1420] via-[#2D0F18] to-[#1C090F] text-white",
        badge:
          "bg-[#4D1C2B] border-[#6E2A3F] text-[#FBCFE8] dark:bg-[#4D1C2B] dark:border-[#6E2A3F]",
        title: "text-white",
        highlight: "text-[#FDA4AF]",
        subtitle: "text-[#E6CDD4]",
        border: "border-[#5E2234]/70",
      };
    case "default":
    default:
      return {
        container:
          "bg-gradient-to-r from-secundaria-clara/60 via-fundo-card to-secundaria/40 dark:from-[#2A1D22] dark:via-[#1F1519] dark:to-[#26181E]",
        badge:
          "bg-fundo-card/90 border-primaria-border text-primaria dark:bg-[#1C1417] dark:border-[#422933]",
        title: "text-texto-escuro dark:text-[#FAF0F2]",
        highlight: "text-primaria",
        subtitle: "text-texto-medio dark:text-[#C5B0B6]",
        border: "border-primaria-border/40 dark:border-[#422933]/50",
      };
  }
}

export function HomeHeroSlider({
  slides,
  autoPlayIntervalMs = 5000,
}: HomeHeroSliderProps) {
  const activeSlides = React.useMemo(() => {
    const filtered = slides.filter((s) => s.is_active);
    return filtered.length > 0 ? filtered : slides;
  }, [slides]);

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  // Navegação
  const handlePrev = React.useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  }, [activeSlides.length]);

  const handleNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev === activeSlides.length - 1 ? 0 : prev + 1));
  }, [activeSlides.length]);

  const handleSelect = (index: number) => {
    setCurrentIndex(index);
  };

  // Autoplay com pausa em hover ou quando pausado manualmente
  React.useEffect(() => {
    if (!isPlaying || isHovered || activeSlides.length <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, autoPlayIntervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, activeSlides.length, autoPlayIntervalMs, handleNext]);

  // Touch swipe para dispositivos móveis
  const minSwipeDistance = 50;
  const onTouchStartHandler = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMoveHandler = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  if (!activeSlides || activeSlides.length === 0) return null;

  return (
    <section
      aria-label="Carrossel Principal de Destaques"
      aria-roledescription="carousel"
      className="relative w-full overflow-hidden select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={onTouchStartHandler}
      onTouchMove={onTouchMoveHandler}
      onTouchEnd={onTouchEndHandler}
    >
      <div className="relative w-full overflow-hidden">
        {/* Trilho de Slides com transição suave horizontal */}
        <div
          className="flex transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {activeSlides.map((slide, idx) => {
            const themeStyle = getThemeClasses(slide.bg_theme);
            const isCurrent = idx === currentIndex;

            return (
              <div
                key={slide.id || idx}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${idx + 1} de ${activeSlides.length}: ${slide.title}`}
                className={`w-full shrink-0 flex flex-col justify-center relative overflow-hidden ${
                  slide.slide_type === "full_banner"
                    ? "bg-[#151012] border-y border-transparent"
                    : `${themeStyle.container} border-y ${themeStyle.border}`
                }`}
              >
                {slide.slide_type === "full_banner" ? (
                  /* Modo Full Banner (Estilo Magalu Arte Promocional de Ponta a Ponta) */
                  <div className="relative w-full h-full min-h-[340px] sm:min-h-[440px] lg:min-h-[520px] flex items-center grow">
                    <Image
                      src={slide.image_url}
                      alt={slide.title}
                      fill
                      priority={idx === 0}
                      sizes="100vw"
                      className="object-cover object-center w-full h-full"
                    />

                    {/* Overlay sutil para garantir legibilidade se houver texto */}
                    {(slide.title || slide.primary_button_text) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent flex items-center">
                        <div className="max-w-7xl mx-auto w-full px-12 sm:px-16 lg:px-20">
                          <div className="max-w-xl text-left text-white z-10">
                            {slide.badge_text && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold uppercase tracking-wider mb-3">
                                <Sparkles className="w-3.5 h-3.5 text-primaria-soft" />
                                {slide.badge_text}
                              </div>
                            )}

                            <h2 className="font-serif text-2xl min-[360px]:text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight leading-[1.15]">
                              {slide.title}{" "}
                              {slide.title_highlight && (
                                <span className="italic font-bold text-primaria-soft">
                                  {slide.title_highlight}
                                </span>
                              )}
                            </h2>

                            {slide.subtitle && (
                              <p className="mt-3 text-xs sm:text-base text-white/90 max-w-lg leading-relaxed font-normal">
                                {slide.subtitle}
                              </p>
                            )}

                            {slide.primary_button_text && (
                              <div className="mt-6 flex flex-wrap gap-3">
                                {slide.primary_button_url?.startsWith("#") ? (
                                  <Button
                                    size="lg"
                                    onClick={() => {
                                      const id = slide.primary_button_url?.replace("#", "");
                                      document.getElementById(id || "")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="gap-2 shadow-sm font-semibold touch-manipulation"
                                  >
                                    {slide.primary_button_text}
                                    <ArrowRight className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <Link href={slide.primary_button_url || "/produtos"}>
                                    <Button size="lg" className="gap-2 shadow-sm font-semibold touch-manipulation">
                                      {slide.primary_button_text}
                                      <ArrowRight className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Modo Editorial Oficial (Fundo Full-Width + Conteúdo Centralizado) */
                  <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 min-h-[340px] sm:min-h-[420px]">
                      {/* Lado Esquerdo: Conteúdo Editorial */}
                      <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
                        {slide.badge_text && (
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${themeStyle.badge} border text-xs font-semibold uppercase tracking-wider mb-4 shadow-xs`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            {slide.badge_text}
                          </div>
                        )}


                      <h2
                        className={`font-serif text-2xl min-[360px]:text-3xl sm:text-5xl lg:text-6xl font-normal ${themeStyle.title} tracking-tight leading-[1.15]`}
                      >
                        {slide.title}{" "}
                        {slide.title_highlight && (
                          <span className={`italic font-bold ${themeStyle.highlight}`}>
                            {slide.title_highlight}
                          </span>
                        )}
                      </h2>

                      {slide.subtitle && (
                        <p
                          className={`mt-4 sm:mt-5 text-xs sm:text-base ${themeStyle.subtitle} max-w-lg leading-relaxed font-normal`}
                        >
                          {slide.subtitle}
                        </p>
                      )}

                      {(slide.primary_button_text || slide.secondary_button_text) && (
                        <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
                          {slide.primary_button_text && (
                            <>
                              {slide.primary_button_url?.startsWith("#") ? (
                                <Button
                                  size="lg"
                                  onClick={() => {
                                    const id = slide.primary_button_url?.replace("#", "");
                                    document.getElementById(id || "")?.scrollIntoView({ behavior: "smooth" });
                                  }}
                                  className="gap-2 shadow-sm font-semibold flex-1 min-[420px]:flex-initial touch-manipulation"
                                >
                                  {slide.primary_button_text}
                                  <ArrowRight className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Link
                                  href={slide.primary_button_url || "/produtos"}
                                  className="flex-1 min-[420px]:flex-initial"
                                >
                                  <Button
                                    size="lg"
                                    className="gap-2 shadow-sm font-semibold w-full touch-manipulation"
                                  >
                                    {slide.primary_button_text}
                                    <ArrowRight className="w-4 h-4" />
                                  </Button>
                                </Link>
                              )}
                            </>
                          )}

                          {slide.secondary_button_text && (
                            <Link
                              href={slide.secondary_button_url || "/sobre"}
                              className="flex-1 min-[420px]:flex-initial"
                            >
                              <Button
                                variant="outline"
                                size="lg"
                                className="font-semibold w-full touch-manipulation border-current/30 hover:bg-black/5 dark:hover:bg-white/10"
                              >
                                {slide.secondary_button_text}
                              </Button>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Lado Direito: Imagem com moldura delicada */}
                    <div className="lg:col-span-5 relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-white/60 dark:border-white/10">
                      <Image
                        src={slide.image_url}
                        alt={`${slide.title} — Isis Store`}
                        fill
                        priority={idx === 0}
                        sizes="(max-width: 1024px) 100vw, 42vw"
                        className="object-cover object-center transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                  </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Botões de Navegação Lateral estilo Magazine Luiza (Setas Transparentes e Discretas) */}
        {activeSlides.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Slide anterior"
              className="absolute left-2 sm:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/15 hover:bg-black/35 text-white border border-white/25 backdrop-blur-xs shadow-xs flex items-center justify-center opacity-45 hover:opacity-100 hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-primaria/50"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Próximo slide"
              className="absolute right-2 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/15 hover:bg-black/35 text-white border border-white/25 backdrop-blur-xs shadow-xs flex items-center justify-center opacity-45 hover:opacity-100 hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-primaria/50"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]" />
            </button>
          </>
        )}

        {/* Barra Inferior com Indicadores estilo Magalu + Controle de Pausa */}
        {activeSlides.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 dark:bg-black/50 backdrop-blur-md border border-white/20">
            {activeSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(i)}
                aria-label={`Ir para slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full h-2 ${
                  i === currentIndex
                    ? "w-7 sm:w-8 bg-primaria shadow-xs"
                    : "w-2 bg-white/60 hover:bg-white"
                }`}
              />
            ))}

            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pausar carrossel" : "Iniciar carrossel"}
              className="ml-1 text-white/70 hover:text-white transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3" />
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
