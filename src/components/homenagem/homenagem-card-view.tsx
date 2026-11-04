"use client";

import * as React from "react";
import {
  Heart,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  Film,
  Images,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import {
  PRESET_AUDIO_TRACKS,
  extractYouTubeVideoId,
  extractVimeoVideoId,
} from "@/lib/qrcodes/types";

export interface HomenagemDisplayData {
  titulo_homenagem: string;
  nome_homenageado: string;
  mensagem_texto: string;
  foto_principal?: string | null;
  galeria_fotos?: string[];
  arquivo_video?: string | null;
  arquivo_audio?: string | null;
  criado_em?: string;
}

interface HomenagemCardViewProps {
  data: HomenagemDisplayData;
  storeName?: string;
  isPreview?: boolean;
}

function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function normalizeLegacyMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/uploads/homenagens/")) {
    const fileName = trimmed.replace("/uploads/homenagens/", "");
    return `/api/media/homenagens/${fileName}`;
  }
  return trimmed;
}

export function HomenagemCardView({
  data,
  storeName = "Isis Store",
  isPreview = false,
}: HomenagemCardViewProps) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [audioError, setAudioError] = React.useState<string | null>(null);

  // Estados do Cine-Memória (Slideshow de Vídeo Animado)
  const [isSlideshowPlaying, setIsSlideshowPlaying] = React.useState(false);
  const [slideshowSlideIdx, setSlideshowSlideIdx] = React.useState(0);
  const [slideshowProgress, setSlideshowProgress] = React.useState(0);

  // Estado do Lightbox da Galeria
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  const resolvedAudioUrl = React.useMemo(
    () => normalizeLegacyMediaUrl(data.arquivo_audio),
    [data.arquivo_audio]
  );

  const resolvedVideoUrl = React.useMemo(
    () => normalizeLegacyMediaUrl(data.arquivo_video),
    [data.arquivo_video]
  );

  const galeria = React.useMemo(
    () =>
      (data.galeria_fotos || [])
        .map((u) => normalizeLegacyMediaUrl(u))
        .filter((u): u is string => Boolean(u)),
    [data.galeria_fotos]
  );

  const slideshowImages = React.useMemo(() => {
    const main = normalizeLegacyMediaUrl(data.foto_principal);
    const all = [
      ...(main ? [main] : []),
      ...galeria.filter((g) => g !== main),
    ];
    return all.length > 0
      ? all
      : ["/images/products/colar-coracao-delicado-ouro-rosa.jpg"];
  }, [data.foto_principal, galeria]);

  const audioTrackTitle = React.useMemo(() => {
    if (!resolvedAudioUrl) return "Trilha Especial da Homenagem";
    const preset = PRESET_AUDIO_TRACKS.find((p) => p.url === resolvedAudioUrl);
    if (preset) return preset.label;
    return "Trilha Sonora Especial";
  }, [resolvedAudioUrl]);

  const youtubeAudioId = React.useMemo(
    () => extractYouTubeVideoId(resolvedAudioUrl),
    [resolvedAudioUrl]
  );

  const youtubeVideoId = React.useMemo(
    () =>
      resolvedVideoUrl === "slideshow://auto"
        ? null
        : extractYouTubeVideoId(resolvedVideoUrl),
    [resolvedVideoUrl]
  );

  const vimeoVideoId = React.useMemo(
    () =>
      resolvedVideoUrl === "slideshow://auto"
        ? null
        : extractVimeoVideoId(resolvedVideoUrl),
    [resolvedVideoUrl]
  );

  const isSlideshowVideo = resolvedVideoUrl === "slideshow://auto";

  // Resetar player se a URL do áudio mudar
  React.useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setAudioError(null);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [resolvedAudioUrl]);

  // Timer do Cine-Memória (Slideshow Animado)
  React.useEffect(() => {
    if (!isSlideshowPlaying) return;
    const slideDurationMs = 4000;
    const totalDurationMs = slideshowImages.length * slideDurationMs;
    const startTime = Date.now() - (slideshowProgress / 100) * totalDurationMs;

    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= totalDurationMs) {
        setSlideshowProgress(100);
        setIsSlideshowPlaying(false);
        return;
      }
      const pct = Math.min(100, (elapsed / totalDurationMs) * 100);
      setSlideshowProgress(pct);
      const nextIdx = Math.min(
        slideshowImages.length - 1,
        Math.floor(elapsed / slideDurationMs)
      );
      setSlideshowSlideIdx(nextIdx);
    }, 80);

    return () => window.clearInterval(timer);
  }, [isSlideshowPlaying, slideshowImages.length, slideshowProgress]);

  const togglePlayAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setAudioError(null);
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch {
      setIsPlaying(false);
      setAudioError("Não foi possível reproduzir este arquivo de áudio.");
    }
  };

  const toggleMuteAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeekAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextTime = Number(e.target.value);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const toggleSlideshowVideo = async () => {
    if (isSlideshowPlaying) {
      setIsSlideshowPlaying(false);
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      if (slideshowProgress >= 99) {
        setSlideshowProgress(0);
        setSlideshowSlideIdx(0);
      }
      setIsSlideshowPlaying(true);
      // Toca a música de fundo junto com o filme de recordações se houver áudio
      if (audioRef.current && !isPlaying) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch {
          // Ignora bloqueio de autoplay se ocorrer
        }
      }
    }
  };

  const progressPercent =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <article
      className={`relative w-full mx-auto overflow-hidden transition-all ${
        isPreview
          ? "bg-[#FDF8F6] text-[#4A3533]"
          : "max-w-[480px] bg-[#FDF8F6] text-[#4A3533] rounded-[32px] border border-[#EFE0DC] shadow-[0_20px_60px_-15px_rgba(87,66,64,0.14)]"
      }`}
    >
      {/* Ornamentos Afetivos Sutis de Fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[#F9D5DF]/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -left-24 w-56 h-56 rounded-full bg-[#F7E3D4]/40 blur-3xl"
      />

      {/* Faixa Superior de Acabamento Editorial */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#E8A5B5] via-[#D47992] to-[#E8A5B5]" />

      <div
        className={`${
          isPreview ? "p-5 space-y-6" : "p-6 sm:p-8 space-y-7"
        } relative z-10`}
      >
        {/* 1. CABEÇALHO COM TÍTULO EM FONTE MANUSCRITA/CURSIVA */}
        <header className="text-center space-y-2 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBECEE] border border-[#F2D5DC] text-[#B85D76] text-[10px] font-semibold uppercase tracking-[0.18em]">
            <Heart className="w-2.5 h-2.5 fill-[#D47992] text-[#D47992]" />
            <span>Homenagem Especial</span>
            <Heart className="w-2.5 h-2.5 fill-[#D47992] text-[#D47992]" />
          </div>

          <h1
            className={`font-cursive text-[#573A38] leading-[1.15] tracking-wide px-2 ${
              isPreview ? "text-3xl" : "text-4xl sm:text-[42px]"
            }`}
          >
            {data.titulo_homenagem || "Para Sempre em Nossos Corações"}
          </h1>

          <div className="flex items-center justify-center gap-2 pt-0.5">
            <span className="h-px w-10 bg-[#E6C8CF]" />
            <Sparkles className="w-3 h-3 text-[#D47992]" />
            <span className="h-px w-10 bg-[#E6C8CF]" />
          </div>
        </header>

        {/* 2. FOTO DE DESTAQUE EM MOLDURA PORTA-RETRATO */}
        {data.foto_principal && (
          <section aria-label="Foto de destaque" className="relative">
            <div className="p-2.5 sm:p-3 bg-white rounded-[24px] border border-[#EFE0DC] shadow-[0_10px_30px_rgba(87,66,64,0.08)]">
              <div className="relative w-full aspect-square rounded-[18px] overflow-hidden bg-[#F7ECEE]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={normalizeLegacyMediaUrl(data.foto_principal) || ""}
                  alt={data.nome_homenageado || "Foto da Homenagem"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[18px] pointer-events-none" />
              </div>

              {/* Selo flutuante de carinho na moldura */}
              <div className="mt-2.5 flex items-center justify-between px-1 text-[11px] text-[#8C6D6B]">
                <span className="font-serif italic">
                  Com carinho para {data.nome_homenageado || "você"}
                </span>
                <Heart className="w-3.5 h-3.5 fill-[#E08CA3] text-[#E08CA3]" />
              </div>
            </div>
          </section>
        )}

        {/* 3. PLAYER DE ÁUDIO / MÚSICA ESTILIZADO (NATIVO OU YOUTUBE) */}
        {resolvedAudioUrl && (
          <section
            aria-label="Trilha sonora da homenagem"
            className="bg-white/95 backdrop-blur-xs rounded-2xl p-4 border border-[#EDD8DD] shadow-[0_6px_20px_rgba(212,121,146,0.08)] space-y-2.5"
          >
            {youtubeAudioId ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#573A38]">
                  <Music className="w-3.5 h-3.5 text-[#D47992]" />
                  <span>Música Especial (YouTube)</span>
                </div>
                <div className="relative w-full aspect-[16/7] rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeAudioId}?rel=0`}
                    title="Trilha Sonora da Homenagem"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            ) : (
              <>
                <audio
                  ref={audioRef}
                  src={resolvedAudioUrl}
                  loop
                  preload="metadata"
                  onLoadedMetadata={(e) => {
                    const dur = e.currentTarget.duration;
                    if (Number.isFinite(dur)) setDuration(dur);
                  }}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onError={() =>
                    setAudioError("Formato de áudio indisponível neste dispositivo.")
                  }
                />

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlayAudio}
                    aria-label={
                      isPlaying ? "Pausar música" : "Tocar música da homenagem"
                    }
                    className="w-11 h-11 rounded-full bg-[#D47992] hover:bg-[#C46881] active:scale-95 text-white flex items-center justify-center shadow-sm transition-all shrink-0 cursor-pointer"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-white" />
                    ) : (
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Music
                          className={`w-3.5 h-3.5 text-[#D47992] shrink-0 ${
                            isPlaying ? "animate-bounce" : ""
                          }`}
                        />
                        <span className="text-xs font-semibold text-[#573A38] truncate">
                          {audioTrackTitle}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#8C6D6B] shrink-0">
                        {formatAudioTime(currentTime)} /{" "}
                        {formatAudioTime(duration || 16)}
                      </span>
                    </div>

                    {/* Barra de Progresso Interativa */}
                    <div className="relative flex items-center">
                      <div className="w-full h-1.5 bg-[#F4E3E7] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#E08CA3] to-[#C46881] rounded-full transition-all duration-150"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={duration || 16}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeekAudio}
                        aria-label="Progresso do áudio"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={toggleMuteAudio}
                    aria-label={isMuted ? "Ativar som" : "Silenciar som"}
                    className="p-2 rounded-full text-[#8C6D6B] hover:text-[#573A38] hover:bg-[#F9EFF1] transition-colors shrink-0 cursor-pointer"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {audioError && (
                  <p className="text-[11px] text-rose-600 text-center pt-1">
                    {audioError}
                  </p>
                )}
              </>
            )}
          </section>
        )}

        {/* 4. NOME DO HOMENAGEADO E MENSAGEM ESPECIAL */}
        <section
          aria-label="Mensagem de homenagem"
          className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#EFE0DC] shadow-[0_8px_28px_rgba(87,66,64,0.05)] space-y-4 relative"
        >
          <div className="text-center border-b border-[#F5E8EB] pb-3.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A38280] block mb-1">
              Dedicado Especialmente a
            </span>
            <h2
              className={`font-serif font-bold text-[#4A3533] tracking-tight ${
                isPreview ? "text-xl" : "text-2xl"
              }`}
            >
              {data.nome_homenageado || "Quem Você Mais Ama"}
            </h2>
          </div>

          <div
            className={`text-[#574240] leading-[1.75] whitespace-pre-line font-sans ${
              isPreview ? "text-xs" : "text-[15px]"
            }`}
          >
            {data.mensagem_texto ||
              "Escreva sua mensagem especial ao lado para visualizar como ela ficará eternizada nesta página exclusiva..."}
          </div>

          <div className="pt-2 flex justify-center">
            <Heart className="w-4 h-4 text-[#E08CA3] fill-[#F9C7D4]" />
          </div>
        </section>

        {/* 5. VÍDEO ESPECIAL (ARQUIVO MP4/WEBM, YOUTUBE, VIMEO OU CINE-MEMÓRIA ANIMADO) */}
        {resolvedVideoUrl && (
          <section aria-label="Vídeo da homenagem" className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[#D47992]" />
                <h3 className="font-serif text-sm font-bold text-[#4A3533]">
                  {isSlideshowVideo
                    ? "Filme de Recordações"
                    : "Vídeo de Recordação"}
                </h3>
              </div>
              {isSlideshowVideo && (
                <span className="text-[10px] font-semibold text-[#B85D76] bg-[#FBECEE] px-2 py-0.5 rounded-full">
                  Cine-Memória ♡
                </span>
              )}
            </div>

            <div className="p-2 bg-white rounded-[24px] border border-[#EFE0DC] shadow-[0_8px_25px_rgba(87,66,64,0.07)]">
              {youtubeVideoId ? (
                <div className="relative w-full aspect-video rounded-[16px] overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0`}
                    title="Vídeo da Homenagem"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : vimeoVideoId ? (
                <div className="relative w-full aspect-video rounded-[16px] overflow-hidden bg-black">
                  <iframe
                    src={`https://player.vimeo.com/video/${vimeoVideoId}`}
                    title="Vídeo da Homenagem"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : isSlideshowVideo ? (
                /* Player Cine-Memória Animado (Transforma fotos + dedicatória em filme emocionante) */
                <div className="relative w-full aspect-[4/3] rounded-[16px] overflow-hidden bg-[#221619] select-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={slideshowImages[slideshowSlideIdx]}
                    src={slideshowImages[slideshowSlideIdx]}
                    alt={`Cena ${slideshowSlideIdx + 1}`}
                    className={`w-full h-full object-cover transition-transform duration-[4000ms] ease-out ${
                      isSlideshowPlaying ? "scale-110" : "scale-100"
                    }`}
                  />

                  {/* Gradiente cinematográfico com legenda poética */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 flex flex-col justify-between p-4 text-white">
                    <div className="flex items-center justify-between text-[11px] font-medium text-white/90">
                      <span className="inline-flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
                        <Heart className="w-3 h-3 fill-[#E08CA3] text-[#E08CA3]" />
                        {data.nome_homenageado || "Memórias"}
                      </span>
                      <span className="font-mono text-[10px] bg-black/40 px-2 py-0.5 rounded-full">
                        Cena {slideshowSlideIdx + 1}/{slideshowImages.length}
                      </span>
                    </div>

                    {/* Botão central Play quando pausado */}
                    {!isSlideshowPlaying && (
                      <button
                        type="button"
                        onClick={toggleSlideshowVideo}
                        aria-label="Assistir Filme de Recordações"
                        className="mx-auto my-auto w-14 h-14 rounded-full bg-[#D47992]/95 hover:bg-[#C46881] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </button>
                    )}

                    <div className="space-y-2">
                      <p className="font-cursive text-2xl text-center text-white drop-shadow-xs">
                        {data.titulo_homenagem || "Para Sempre em Nossos Corações"}
                      </p>

                      {/* Controles inferiores do vídeo animado */}
                      <div className="flex items-center gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={toggleSlideshowVideo}
                          className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                          aria-label={isSlideshowPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
                        >
                          {isSlideshowPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-white" />
                          ) : slideshowProgress >= 99 ? (
                            <RotateCcw className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                          )}
                        </button>

                        <div className="flex-1 h-1.5 bg-white/25 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#E08CA3] rounded-full transition-all duration-100"
                            style={{ width: `${slideshowProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Player de Vídeo Nativo (.mp4 / .webm / .mov) */
                <video
                  ref={videoRef}
                  key={resolvedVideoUrl}
                  src={resolvedVideoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  onPlay={() => {
                    // Pausa a música de fundo automaticamente ao dar play no vídeo para não misturar os áudios
                    if (audioRef.current && isPlaying) {
                      audioRef.current.pause();
                      setIsPlaying(false);
                    }
                  }}
                  className="w-full rounded-[16px] bg-black max-h-[420px] object-contain"
                >
                  Seu navegador não suporta a reprodução de vídeo.
                </video>
              )}
            </div>
          </section>
        )}

        {/* 6. GALERIA DE FOTOS ADICIONAIS (SE HOUVER) */}
        {galeria.length > 0 && (
          <section aria-label="Galeria de momentos" className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Images className="w-4 h-4 text-[#D47992]" />
                <h3 className="font-serif text-sm font-bold text-[#4A3533]">
                  Nossos Momentos ({galeria.length})
                </h3>
              </div>
              {!isPreview && (
                <span className="text-[11px] text-[#9A7B79]">
                  Toque para ampliar
                </span>
              )}
            </div>

            <div
              className={`grid gap-2.5 ${
                galeria.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {galeria.map((fotoUrl, index) => (
                <button
                  key={`${fotoUrl}-${index}`}
                  type="button"
                  onClick={() => !isPreview && setLightboxIndex(index)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-white p-1.5 border border-[#EFE0DC] shadow-2xs transition-transform active:scale-98 cursor-pointer"
                >
                  <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#F7ECEE]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fotoUrl}
                      alt={`Momento ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 7. RODAPÉ DISCRETO DA MARCA */}
        <footer className="pt-4 pb-1 text-center space-y-1 border-t border-[#EFE0DC]/80">
          <div className="inline-flex items-center justify-center gap-1.5 text-xs font-serif italic text-[#7A615F]">
            <span>Eternizado com amor por</span>
            <strong className="font-semibold not-italic text-[#573A38]">
              {storeName}
            </strong>
            <Heart className="w-3 h-3 fill-[#E08CA3] text-[#E08CA3]" />
          </div>
          <p className="text-[10px] text-[#A38B89] tracking-wide">
            Presente Personalizado Exclusivo &bull; Lembrança Digital Protegida
          </p>
        </footer>
      </div>

      {/* LIGHTBOX DE GALERIA (TELA CHEIA NA PÁGINA PÚBLICA) */}
      {!isPreview && lightboxIndex !== null && galeria[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Fechar foto ampliada"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {galeria.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) =>
                    prev === null
                      ? 0
                      : (prev - 1 + galeria.length) % galeria.length
                  );
                }}
                aria-label="Foto anterior"
                className="absolute left-3 sm:left-6 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) =>
                    prev === null ? 0 : (prev + 1) % galeria.length
                  );
                }}
                aria-label="Próxima foto"
                className="absolute right-3 sm:right-6 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={galeria[lightboxIndex]}
            alt={`Foto ${lightboxIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </article>
  );
}
