"use client";

import * as React from "react";
import Link from "next/link";
import {
  QrCode,
  Plus,
  Heart,
  Star,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Film,
  Music,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Eye,
  Download,
  Trash2,
  Edit3,
  Printer,
  Smartphone,
  Search,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Layers,
  RefreshCw,
  Mic,
  Square,
  Video,
  Play,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type QrHomenagem,
  type QrIconStyle,
  QR_ICON_STYLE_OPTIONS,
  QR_COLOR_PRESETS,
  TITULO_SUGESTOES,
  PRESET_AUDIO_TRACKS,
  extractYouTubeVideoId,
  extractVimeoVideoId,
  buildQrHomenagemPath,
  buildQrHomenagemFullUrl,
} from "@/lib/qrcodes/types";
import {
  saveQrHomenagemAction,
  deleteQrHomenagemAction,
} from "@/features/admin/qrcode-actions";
import {
  QrCodeStyledPreview,
  downloadQrCodeHighResPng,
  downloadQrCodeVectorSvg,
} from "./qr-code-renderer";
import { HomenagemCardView } from "@/components/homenagem/homenagem-card-view";

interface QrCodesManagerProps {
  initialItems?: QrHomenagem[];
  storeName?: string;
}

const EMOJI_SHORTCUTS = ["❤️", "✨", "🌹", "🥰", "🙏", "🎂", "🥂", "🕊️", "🌸", "♾️"];

function slugifyFileName(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "homenagem"
  );
}

async function uploadMediaViaApi(
  file: File,
  mediaType: "foto" | "galeria" | "video" | "audio"
): Promise<{ success: boolean; url?: string; message: string }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("mediaType", mediaType);

  const response = await fetch("/api/admin/qrcodes/upload", {
    method: "POST",
    body: fd,
  });

  const data = await response.json();
  return {
    success: Boolean(data?.success),
    url: data?.url,
    message: data?.message || "Erro ao processar arquivo.",
  };
}

export function QrCodesManager({
  initialItems = [],
  storeName = "Isis Store",
}: QrCodesManagerProps) {
  const [items, setItems] = React.useState<QrHomenagem[]>(initialItems);
  const [activeSubTab, setActiveSubTab] = React.useState<"create" | "list">("create");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Estado do Formulário de Criação / Edição
  const [editingId, setEditingId] = React.useState<string | undefined>(undefined);
  const [previewHash, setPreviewHash] = React.useState<string>("amostra-exclusiva");
  const [previewKey, setPreviewKey] = React.useState<string>("isis2026");

  const [identificacaoPedido, setIdentificacaoPedido] = React.useState("");
  const [tituloHomenagem, setTituloHomenagem] = React.useState(
    "Para Sempre em Nossos Corações"
  );
  const [nomeHomenageado, setNomeHomenageado] = React.useState("");
  const [mensagemTexto, setMensagemTexto] = React.useState("");
  const [fotoPrincipal, setFotoPrincipal] = React.useState("");
  const [galeriaFotos, setGaleriaFotos] = React.useState<string[]>([]);
  const [novaUrlGaleria, setNovaUrlGaleria] = React.useState("");
  const [arquivoVideo, setArquivoVideo] = React.useState("slideshow://auto");
  const [arquivoAudio, setArquivoAudio] = React.useState(
    "/api/media/homenagens/preset-caixinha-musica.wav"
  );
  const [estiloIconeQr, setEstiloIconeQr] = React.useState<QrIconStyle>("coracao");
  const [corQr, setCorQr] = React.useState("#000000");

  // Estados de Gravação Direta (Microfone p/ Voz e Webcam p/ Vídeo)
  const [isRecordingAudio, setIsRecordingAudio] = React.useState(false);
  const [audioRecordSeconds, setAudioRecordSeconds] = React.useState(0);
  const audioRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  const [isRecordingVideo, setIsRecordingVideo] = React.useState(false);
  const [videoRecordSeconds, setVideoRecordSeconds] = React.useState(0);
  const videoRecorderRef = React.useRef<MediaRecorder | null>(null);
  const videoStreamRef = React.useRef<MediaStream | null>(null);
  const liveCameraPreviewRef = React.useRef<HTMLVideoElement | null>(null);
  const videoChunksRef = React.useRef<Blob[]>([]);

  // Estados de Upload e Submissão
  const [isSaving, setIsSaving] = React.useState(false);
  const [uploadingType, setUploadingType] = React.useState<
    "foto" | "galeria" | "video" | "audio" | null
  >(null);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Estado de cópia de links e Modal de Detalhes / Impressão
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [selectedQrModal, setSelectedQrModal] = React.useState<QrHomenagem | null>(
    null
  );
  const [pngTransparentBg, setPngTransparentBg] = React.useState(false);
  const [isDownloadingPng, setIsDownloadingPng] = React.useState(false);

  // Refs para inputs de arquivo ocultos
  const fotoInputRef = React.useRef<HTMLInputElement>(null);
  const galeriaInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const audioInputRef = React.useRef<HTMLInputElement>(null);

  // Cronômetro de gravação de áudio
  React.useEffect(() => {
    if (!isRecordingAudio) {
      setAudioRecordSeconds(0);
      return;
    }
    const timer = window.setInterval(() => {
      setAudioRecordSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRecordingAudio]);

  // Cronômetro de gravação de vídeo
  React.useEffect(() => {
    if (!isRecordingVideo) {
      setVideoRecordSeconds(0);
      return;
    }
    const timer = window.setInterval(() => {
      setVideoRecordSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRecordingVideo]);

  const resetForm = () => {
    setEditingId(undefined);
    setPreviewHash("amostra-exclusiva");
    setPreviewKey("isis2026");
    setIdentificacaoPedido("");
    setTituloHomenagem("Para Sempre em Nossos Corações");
    setNomeHomenageado("");
    setMensagemTexto("");
    setFotoPrincipal("");
    setGaleriaFotos([]);
    setNovaUrlGaleria("");
    setArquivoVideo("slideshow://auto");
    setArquivoAudio("/api/media/homenagens/preset-caixinha-musica.wav");
    setEstiloIconeQr("coracao");
    setCorQr("#000000");
  };

  const handleEditItem = (item: QrHomenagem) => {
    setEditingId(item.id);
    setPreviewHash(item.hash_acesso);
    setPreviewKey(item.chave_seguranca);
    setIdentificacaoPedido(item.identificacao_pedido);
    setTituloHomenagem(item.titulo_homenagem);
    setNomeHomenageado(item.nome_homenageado);
    setMensagemTexto(item.mensagem_texto);
    setFotoPrincipal(item.foto_principal || "");
    setGaleriaFotos(item.galeria_fotos || []);
    setArquivoVideo(item.arquivo_video || "");
    setArquivoAudio(item.arquivo_audio || "");
    setEstiloIconeQr(item.estilo_icone_qr || "coracao");
    setCorQr(item.cor_qr || "#000000");
    setActiveSubTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUploadMedia = async (
    e: React.ChangeEvent<HTMLInputElement>,
    mediaType: "foto" | "galeria" | "video" | "audio"
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingType(mediaType);
    setFeedback(null);

    try {
      if (mediaType === "galeria") {
        const uploadedUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const res = await uploadMediaViaApi(files[i], "galeria");
          if (res.success && res.url) {
            uploadedUrls.push(res.url);
          } else {
            setFeedback({
              type: "error",
              message: res.message || "Falha ao enviar uma das fotos da galeria.",
            });
          }
        }
        if (uploadedUrls.length > 0) {
          setGaleriaFotos((prev) => [...prev, ...uploadedUrls].slice(0, 12));
          setFeedback({
            type: "success",
            message: `${uploadedUrls.length} foto(s) adicionada(s) à galeria!`,
          });
        }
      } else {
        const file = files[0];
        // Preview instantâneo com ObjectURL enquanto envia para o servidor
        const localObjectUrl = URL.createObjectURL(file);
        if (mediaType === "foto") setFotoPrincipal(localObjectUrl);
        if (mediaType === "video") setArquivoVideo(localObjectUrl);
        if (mediaType === "audio") setArquivoAudio(localObjectUrl);

        const res = await uploadMediaViaApi(file, mediaType);
        if (res.success && res.url) {
          if (mediaType === "foto") setFotoPrincipal(res.url);
          if (mediaType === "video") setArquivoVideo(res.url);
          if (mediaType === "audio") setArquivoAudio(res.url);
          setFeedback({
            type: "success",
            message: res.message || "Arquivo enviado e pronto para reprodução!",
          });
        } else {
          setFeedback({
            type: "error",
            message: res.message || "Erro ao enviar arquivo para o servidor.",
          });
        }
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Falha de conexão durante o envio do arquivo.",
      });
    } finally {
      setUploadingType(null);
      e.target.value = "";
    }
  };

  // Gravação de Mensagem de Voz pelo Microfone
  const handleStartAudioRecording = async () => {
    try {
      setFeedback(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const ext = (recorder.mimeType || "").includes("mp4") ? "m4a" : "webm";
        const recordedFile = new File([blob], `voz-homenagem-${Date.now()}.${ext}`, {
          type: blob.type || "audio/webm",
        });

        setUploadingType("audio");
        const localUrl = URL.createObjectURL(blob);
        setArquivoAudio(localUrl);

        const res = await uploadMediaViaApi(recordedFile, "audio");
        setUploadingType(null);
        if (res.success && res.url) {
          setArquivoAudio(res.url);
          setFeedback({
            type: "success",
            message: "Mensagem de voz gravada e salva com sucesso!",
          });
        }
      };

      audioRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingAudio(true);
    } catch {
      setFeedback({
        type: "error",
        message:
          "Permissão de microfone negada ou microfone indisponível neste computador.",
      });
    }
  };

  const handleStopAudioRecording = () => {
    if (audioRecorderRef.current && isRecordingAudio) {
      audioRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  // Gravação de Vídeo pela Câmera / Webcam
  const handleStartVideoRecording = async () => {
    try {
      setFeedback(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      videoStreamRef.current = stream;
      if (liveCameraPreviewRef.current) {
        liveCameraPreviewRef.current.srcObject = stream;
        liveCameraPreviewRef.current.play().catch(() => {});
      }

      const recorder = new MediaRecorder(stream);
      videoChunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) videoChunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        videoStreamRef.current = null;
        const blob = new Blob(videoChunksRef.current, {
          type: recorder.mimeType || "video/webm",
        });
        const ext = (recorder.mimeType || "").includes("mp4") ? "mp4" : "webm";
        const recordedFile = new File(
          [blob],
          `video-homenagem-${Date.now()}.${ext}`,
          {
            type: blob.type || "video/webm",
          }
        );

        setUploadingType("video");
        const localUrl = URL.createObjectURL(blob);
        setArquivoVideo(localUrl);

        const res = await uploadMediaViaApi(recordedFile, "video");
        setUploadingType(null);
        if (res.success && res.url) {
          setArquivoVideo(res.url);
          setFeedback({
            type: "success",
            message: "Vídeo gravado pela câmera e salvo com sucesso!",
          });
        }
      };

      videoRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingVideo(true);
    } catch {
      setFeedback({
        type: "error",
        message:
          "Permissão de câmera negada ou webcam indisponível neste dispositivo.",
      });
    }
  };

  const handleStopVideoRecording = () => {
    if (videoRecorderRef.current && isRecordingVideo) {
      videoRecorderRef.current.stop();
      setIsRecordingVideo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await saveQrHomenagemAction({
        id: editingId,
        identificacao_pedido: identificacaoPedido,
        titulo_homenagem: tituloHomenagem,
        nome_homenageado: nomeHomenageado,
        mensagem_texto: mensagemTexto,
        foto_principal: fotoPrincipal || null,
        galeria_fotos: galeriaFotos,
        arquivo_video: arquivoVideo || null,
        arquivo_audio: arquivoAudio || null,
        estilo_icone_qr: estiloIconeQr,
        cor_qr: corQr,
      });

      if (res.success && res.item) {
        const saved = res.item;
        setItems((prev) =>
          prev.some((i) => i.id === saved.id)
            ? prev.map((i) => (i.id === saved.id ? saved : i))
            : [saved, ...prev]
        );
        setFeedback({
          type: "success",
          message: res.message,
        });
        setSelectedQrModal(saved);
        resetForm();
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Não foi possível salvar o QR Code.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Erro de comunicação ao salvar o QR Code.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: QrHomenagem) => {
    const confirmed = window.confirm(
      `Deseja realmente excluir o QR Code "${item.identificacao_pedido}" (${item.nome_homenageado})? O link deixará de funcionar.`
    );
    if (!confirmed) return;

    const res = await deleteQrHomenagemAction(item.id);
    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (selectedQrModal?.id === item.id) {
        setSelectedQrModal(null);
      }
      setFeedback({ type: "success", message: res.message });
    } else {
      setFeedback({ type: "error", message: res.message });
    }
  };

  const handleCopyLink = (item: QrHomenagem) => {
    const fullUrl = buildQrHomenagemFullUrl(item.hash_acesso, item.chave_seguranca);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2200);
    }
  };

  const handleAddGalleryUrl = () => {
    const trimmed = novaUrlGaleria.trim();
    if (!trimmed) return;
    setGaleriaFotos((prev) => [...prev, trimmed].slice(0, 12));
    setNovaUrlGaleria("");
  };

  const filteredItems = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.identificacao_pedido.toLowerCase().includes(q) ||
        item.nome_homenageado.toLowerCase().includes(q) ||
        item.titulo_homenagem.toLowerCase().includes(q) ||
        item.hash_acesso.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const totalScans = React.useMemo(
    () => items.reduce((acc, cur) => acc + (cur.visualizacoes || 0), 0),
    [items]
  );

  const liveQrUrl = React.useMemo(
    () => buildQrHomenagemFullUrl(previewHash, previewKey),
    [previewHash, previewKey]
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo de Estamparia & Presentes Afetivos */}
      <div className="bg-white dark:bg-[#1E1518] p-4 sm:p-6 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
        <div className="space-y-1.5 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primaria-soft dark:bg-primaria-soft/30 text-primaria text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            <QrCode className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Módulo de Sublimação & Presentes Personalizados</span>
          </div>
          <h2 className="font-serif text-lg sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1]">
            QR Codes Personalizados para Estamparia
          </h2>
          <p className="text-xs text-texto-claro dark:text-[#988087] max-w-2xl leading-relaxed">
            Crie páginas secretas de homenagem com texto, fotos, vídeo e música para estampar em{" "}
            <strong className="text-texto-escuro dark:text-[#F8EFF1]">
              canecas, copos térmicos, camisetas, almofadas e etiquetas de roupas
            </strong>
            . Exportação com correção Nível H (30%) em 2048px (300 DPI) e SVG Vetorizado.
          </p>
        </div>

        {/* KPIs rápidos + Seletor de Seção */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="flex-1 sm:flex-initial px-3.5 py-2 rounded-2xl bg-fundo dark:bg-[#151012] border border-borda dark:border-[#38262C] text-xs min-w-[115px]">
            <span className="text-texto-claro dark:text-[#988087] block text-[10px]">
              QR Codes Ativos
            </span>
            <strong className="text-sm font-mono font-bold text-texto-escuro dark:text-[#F8EFF1]">
              {items.length}
            </strong>
          </div>

          <div className="flex-1 sm:flex-initial px-3.5 py-2 rounded-2xl bg-fundo dark:bg-[#151012] border border-borda dark:border-[#38262C] text-xs min-w-[115px]">
            <span className="text-texto-claro dark:text-[#988087] block text-[10px]">
              Total de Scans
            </span>
            <strong className="text-sm font-mono font-bold text-primaria">
              {totalScans} leituras
            </strong>
          </div>

          <div className="w-full sm:w-auto flex items-center p-1 rounded-2xl bg-fundo dark:bg-[#151012] border border-borda dark:border-[#38262C]">
            <button
              type="button"
              onClick={() => setActiveSubTab("create")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === "create"
                  ? "bg-primaria text-white shadow-2xs"
                  : "text-texto-medio dark:text-[#C5B0B6] hover:text-texto-escuro"
              }`}
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{editingId ? "Editar QR Code" : "Criar QR Code"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab("list")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === "list"
                  ? "bg-primaria text-white shadow-2xs"
                  : "text-texto-medio dark:text-[#C5B0B6] hover:text-texto-escuro"
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Lista Criados ({items.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 animate-fade-in shadow-xs ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/50"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800/50"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Inputs Ocultos de Upload */}
      <input
        ref={fotoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={(e) => handleUploadMedia(e, "foto")}
        className="hidden"
      />
      <input
        ref={galeriaInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={(e) => handleUploadMedia(e, "galeria")}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.m4v"
        onChange={(e) => handleUploadMedia(e, "video")}
        className="hidden"
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/x-m4a,audio/aac,audio/webm,.mp3,.wav,.ogg,.m4a,.aac"
        onChange={(e) => handleUploadMedia(e, "audio")}
        className="hidden"
      />

      {/* =====================================================================
          SEÇÃO A: FORMULÁRIO DE CRIAÇÃO + PREVIEW AO VIVO (CELULAR + QR CODE)
         ===================================================================== */}
      {activeSubTab === "create" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda: Formulário Completo (7 colunas) */}
          <form
            onSubmit={handleSave}
            className="xl:col-span-7 bg-white dark:bg-[#1E1518] p-6 sm:p-7 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-borda/60 dark:border-[#38262C]/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primaria-soft dark:bg-primaria-soft/30 text-primaria flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-texto-escuro dark:text-[#F8EFF1]">
                    {editingId
                      ? "Editar QR Code e Página de Homenagem"
                      : "1. Configurar Nova Homenagem & QR Code"}
                  </h3>
                  <p className="text-[11px] text-texto-claro dark:text-[#988087]">
                    Preencha os dados escolhidos pelo cliente para gerar o link exclusivo e a matriz de estampa.
                  </p>
                </div>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-texto-claro hover:text-primaria transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Cancelar Edição</span>
                </button>
              )}
            </div>

            {/* 1. Identificação do Pedido e Homenageado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                  Identificação do Pedido / Cliente <span className="text-primaria">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={identificacaoPedido}
                  onChange={(e) => setIdentificacaoPedido(e.target.value)}
                  placeholder="Ex: Pedido #1042 - Caneca Vó Maria"
                  className="bg-white dark:bg-[#151012] text-xs font-medium"
                />
                <span className="text-[10px] text-texto-claro dark:text-[#988087] block">
                  Controle interno do Admin para localizar a arte da encomenda.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                  Nome do Homenageado(a) <span className="text-primaria">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={nomeHomenageado}
                  onChange={(e) => setNomeHomenageado(e.target.value)}
                  placeholder="Ex: Vó Maria / Amor da Minha Vida"
                  className="bg-white dark:bg-[#151012] text-xs font-medium"
                />
                <span className="text-[10px] text-texto-claro dark:text-[#988087] block">
                  Aparece em destaque no cartão de dedicatória da página.
                </span>
              </div>
            </div>

            {/* 2. Título da Homenagem com Sugestões Rápidas */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                Título da Homenagem (Fonte Manuscrita no Topo) <span className="text-primaria">*</span>
              </label>
              <Input
                type="text"
                required
                value={tituloHomenagem}
                onChange={(e) => setTituloHomenagem(e.target.value)}
                placeholder="Ex: Para Sempre em Nossos Corações"
                className="bg-white dark:bg-[#151012] text-xs"
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-texto-claro dark:text-[#988087]">
                  Sugestões:
                </span>
                {TITULO_SUGESTOES.map((sugestao) => (
                  <button
                    key={sugestao}
                    type="button"
                    onClick={() => setTituloHomenagem(sugestao)}
                    className={`text-[10px] px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                      tituloHomenagem === sugestao
                        ? "bg-primaria text-white border-primaria font-semibold"
                        : "bg-fundo dark:bg-[#151012] text-texto-medio dark:text-[#C5B0B6] border-borda dark:border-[#38262C] hover:border-primaria"
                    }`}
                  >
                    {sugestao}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Mensagem Especial (Texto longo + Emojis) */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                  Mensagem Especial <span className="text-primaria">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-1">
                  {EMOJI_SHORTCUTS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setMensagemTexto((prev) => `${prev}${emoji}`)}
                      className="w-6 h-6 rounded-lg hover:bg-primaria-soft dark:hover:bg-[#2C1D23] text-xs flex items-center justify-center transition-colors cursor-pointer"
                      title={`Inserir ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                required
                rows={5}
                value={mensagemTexto}
                onChange={(e) => setMensagemTexto(e.target.value)}
                placeholder="Escreva a mensagem escolhida pelo cliente... Suporta parágrafos, quebras de linha e emojis ❤️✨"
                className="w-full rounded-2xl border border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] p-3.5 text-xs text-texto-escuro dark:text-[#F8EFF1] leading-relaxed focus:border-primaria focus:ring-1 focus:ring-primaria/20 outline-none resize-y"
              />
            </div>

            {/* 4. FOTOS DA HOMENAGEM (Foto Principal + Galeria) */}
            <div className="space-y-4 pt-2 border-t border-borda/60 dark:border-[#38262C]/60">
              <h4 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primaria" />
                <span>Fotos da Homenagem (Porta-Retrato & Galeria)</span>
              </h4>

              {/* Foto Principal */}
              <div className="p-4 rounded-2xl bg-fundo/60 dark:bg-[#151012] border border-borda dark:border-[#38262C] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-primaria" />
                    <span>Foto Principal em Destaque (Porta-Retrato)</span>
                  </label>
                  {fotoPrincipal && (
                    <button
                      type="button"
                      onClick={() => setFotoPrincipal("")}
                      className="text-[11px] text-rose-600 hover:underline font-medium"
                    >
                      Remover foto
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => fotoInputRef.current?.click()}
                    disabled={uploadingType === "foto"}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-primaria text-white text-xs font-semibold hover:bg-primaria-hover transition-colors shrink-0 disabled:opacity-60 cursor-pointer"
                  >
                    {uploadingType === "foto" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {uploadingType === "foto" ? "Enviando..." : "Enviar Foto do PC"}
                    </span>
                  </button>

                  <Input
                    type="text"
                    value={fotoPrincipal}
                    onChange={(e) => setFotoPrincipal(e.target.value)}
                    placeholder="Ou cole a URL da foto principal (https://...)"
                    className="bg-white dark:bg-[#1E1518] text-xs flex-1"
                  />
                </div>
              </div>

              {/* Galeria de Fotos Extras */}
              <div className="p-4 rounded-2xl bg-fundo/60 dark:bg-[#151012] border border-borda dark:border-[#38262C] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primaria" />
                    <span>Galeria de Fotos Extras ({galeriaFotos.length}/12)</span>
                  </label>
                  {galeriaFotos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setGaleriaFotos([])}
                      className="text-[11px] text-rose-600 hover:underline font-medium"
                    >
                      Limpar galeria
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => galeriaInputRef.current?.click()}
                    disabled={uploadingType === "galeria"}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E1518] border border-primaria/40 text-primaria text-xs font-semibold hover:bg-primaria-soft transition-colors shrink-0 disabled:opacity-60 cursor-pointer"
                  >
                    {uploadingType === "galeria" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {uploadingType === "galeria"
                        ? "Enviando Fotos..."
                        : "Adicionar Fotos do PC"}
                    </span>
                  </button>

                  <div className="flex gap-1.5 flex-1">
                    <Input
                      type="text"
                      value={novaUrlGaleria}
                      onChange={(e) => setNovaUrlGaleria(e.target.value)}
                      placeholder="Ou cole uma URL de foto extra e clique em +"
                      className="bg-white dark:bg-[#1E1518] text-xs flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddGalleryUrl}
                      className="shrink-0 px-3"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {galeriaFotos.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                    {galeriaFotos.map((url, idx) => (
                      <div
                        key={`${url}-${idx}`}
                        className="relative group aspect-square rounded-xl overflow-hidden border border-borda bg-white"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Galeria ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setGaleriaFotos((prev) =>
                              prev.filter((_, itemIdx) => itemIdx !== idx)
                            )
                          }
                          aria-label="Remover foto da galeria"
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 5. SISTEMA COMPLETO DE MÚSICA & ÁUDIO DA HOMENAGEM */}
            <div className="space-y-4 pt-3 border-t border-borda/60 dark:border-[#38262C]/60">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
                  <Music className="w-4 h-4 text-primaria" />
                  <span>Sistema de Música & Mensagem de Voz</span>
                </h4>
                {arquivoAudio ? (
                  <button
                    type="button"
                    onClick={() => setArquivoAudio("")}
                    className="text-[11px] text-rose-600 hover:underline font-semibold"
                  >
                    Remover áudio
                  </button>
                ) : (
                  <span className="text-[10px] text-texto-claro">Sem música</span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-fundo/60 dark:bg-[#151012] border border-borda dark:border-[#38262C] space-y-4">
                {/* Catálogo de Trilhas Instrumentais Afetivas Prontas */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                    A) Escolher Melodia Instrumental Pronta (1 Clique):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRESET_AUDIO_TRACKS.map((track) => {
                      const isSelected = arquivoAudio === track.url;
                      return (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => setArquivoAudio(track.url)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                            isSelected
                              ? "border-primaria bg-primaria-soft/70 dark:bg-primaria-soft/20 ring-2 ring-primaria/20"
                              : "border-borda dark:border-[#38262C] bg-white dark:bg-[#1E1518] hover:border-primaria/50"
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected
                                ? "bg-primaria text-white"
                                : "bg-primaria-soft text-primaria"
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1] block truncate">
                              {track.label}
                            </span>
                            <span className="text-[10px] text-texto-claro dark:text-[#988087] leading-tight block">
                              {track.subtitle}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Upload de Arquivo MP3/WAV do PC + Gravação de Voz pelo Microfone */}
                <div className="space-y-2 pt-2 border-t border-borda/50 dark:border-[#38262C]/50">
                  <span className="text-[11px] font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                    B) Enviar Música do Computador (.mp3, .wav, .m4a) ou Gravar Voz:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => audioInputRef.current?.click()}
                      disabled={uploadingType === "audio"}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primaria text-white hover:bg-primaria-hover text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {uploadingType === "audio" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {uploadingType === "audio"
                          ? "Enviando Áudio..."
                          : "Upload de Música (.mp3 / .wav)"}
                      </span>
                    </button>

                    {!isRecordingAudio ? (
                      <button
                        type="button"
                        onClick={handleStartAudioRecording}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E1518] border border-borda dark:border-[#38262C] hover:border-primaria text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] transition-colors cursor-pointer"
                      >
                        <Mic className="w-3.5 h-3.5 text-rose-500" />
                        <span>Gravar Mensagem de Voz</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStopAudioRecording}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold animate-pulse cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5 fill-white" />
                        <span>Parar Gravação ({audioRecordSeconds}s)</span>
                      </button>
                    )}
                  </div>

                  <Input
                    type="text"
                    value={arquivoAudio}
                    onChange={(e) => setArquivoAudio(e.target.value)}
                    placeholder="Ou cole o link de um áudio .mp3 ou link do YouTube..."
                    className="bg-white dark:bg-[#1E1518] text-xs"
                  />
                </div>

                {/* Player de Teste Imediato no Painel Admin */}
                {arquivoAudio && !extractYouTubeVideoId(arquivoAudio) && (
                  <div className="p-3 rounded-xl bg-white dark:bg-[#1E1518] border border-primaria/30 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-primaria flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5" />
                        Teste o Áudio Selecionado Agora:
                      </span>
                      <span className="text-[10px] font-mono text-texto-claro truncate max-w-[200px]">
                        {arquivoAudio}
                      </span>
                    </div>
                    <audio
                      key={arquivoAudio}
                      src={arquivoAudio}
                      controls
                      preload="metadata"
                      className="w-full h-9"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 6. SISTEMA COMPLETO DE VÍDEO DA HOMENAGEM */}
            <div className="space-y-4 pt-3 border-t border-borda/60 dark:border-[#38262C]/60">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
                  <Film className="w-4 h-4 text-primaria" />
                  <span>Sistema de Vídeo da Homenagem (.mp4, Webcam, Cine-Memória ou YouTube)</span>
                </h4>
                {arquivoVideo ? (
                  <button
                    type="button"
                    onClick={() => setArquivoVideo("")}
                    className="text-[11px] text-rose-600 hover:underline font-semibold"
                  >
                    Remover vídeo
                  </button>
                ) : (
                  <span className="text-[10px] text-texto-claro">Sem vídeo</span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-fundo/60 dark:bg-[#151012] border border-borda dark:border-[#38262C] space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Botão 1: Upload de arquivo .mp4 / .webm */}
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={uploadingType === "video"}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primaria text-white hover:bg-primaria-hover text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {uploadingType === "video" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {uploadingType === "video"
                        ? "Enviando Vídeo..."
                        : "Upload de Vídeo (.mp4 / .webm / .mov)"}
                    </span>
                  </button>

                  {/* Botão 2: Gravar Vídeo pela Webcam */}
                  {!isRecordingVideo ? (
                    <button
                      type="button"
                      onClick={handleStartVideoRecording}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E1518] border border-borda dark:border-[#38262C] hover:border-primaria text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] transition-colors cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5 text-rose-500" />
                      <span>Gravar Vídeo na Câmera</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopVideoRecording}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold animate-pulse cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>Parar Gravação ({videoRecordSeconds}s)</span>
                    </button>
                  )}

                  {/* Botão 3: Cine-Memória Automático */}
                  <button
                    type="button"
                    onClick={() => setArquivoVideo("slideshow://auto")}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      arquivoVideo === "slideshow://auto"
                        ? "border-primaria bg-primaria-soft text-primaria font-bold"
                        : "bg-white dark:bg-[#1E1518] border-borda dark:border-[#38262C] text-texto-medio hover:border-primaria"
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Usar Cine-Memória (Filme Animado das Fotos)</span>
                  </button>
                </div>

                {/* Preview da Webcam durante gravação */}
                {isRecordingVideo && (
                  <div className="p-2 rounded-xl bg-black">
                    <video
                      ref={liveCameraPreviewRef}
                      muted
                      playsInline
                      className="w-full max-h-56 rounded-lg object-contain"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <Input
                    type="text"
                    value={arquivoVideo}
                    onChange={(e) => setArquivoVideo(e.target.value)}
                    placeholder="Ou cole o link de um vídeo do YouTube, YouTube Shorts, Vimeo ou .mp4..."
                    className="bg-white dark:bg-[#1E1518] text-xs"
                  />
                  <span className="text-[10px] text-texto-claro dark:text-[#988087] block">
                    Aceita arquivos <code>.mp4</code>, <code>.webm</code>, <code>.mov</code> do computador, links do <strong>YouTube / Shorts / Vimeo</strong> ou o modo <code>slideshow://auto</code>.
                  </span>
                </div>

                {/* Preview de teste do vídeo quando for arquivo nativo .mp4/.webm */}
                {arquivoVideo &&
                  arquivoVideo !== "slideshow://auto" &&
                  !extractYouTubeVideoId(arquivoVideo) &&
                  !extractVimeoVideoId(arquivoVideo) && (
                    <div className="p-3 rounded-xl bg-white dark:bg-[#1E1518] border border-primaria/30 space-y-1.5">
                      <span className="text-[11px] font-semibold text-primaria flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5" />
                        Preview do Arquivo de Vídeo Carregado:
                      </span>
                      <video
                        key={arquivoVideo}
                        src={arquivoVideo}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full max-h-52 rounded-lg bg-black object-contain"
                      />
                    </div>
                  )}
              </div>
            </div>

            {/* 7. Customização do QR Code para Estamparia */}
            <div className="space-y-4 pt-3 border-t border-borda/60 dark:border-[#38262C]/60">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
                  <Printer className="w-4 h-4 text-primaria shrink-0" />
                  <span>Customização da Matriz QR Code (Nível H - 30%)</span>
                </h4>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  Alta Leitura p/ Sublimação
                </span>
              </div>

              {/* Seletor de Ícone Central */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                  Ícone Central da Estampa
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {QR_ICON_STYLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setEstiloIconeQr(opt.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        estiloIconeQr === opt.id
                          ? "border-primaria bg-primaria-soft/60 dark:bg-primaria-soft/20 ring-2 ring-primaria/20"
                          : "border-borda dark:border-[#38262C] bg-fundo/40 dark:bg-[#151012] hover:border-primaria/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1]">
                          {opt.label}
                        </span>
                        {opt.id === "coracao" && (
                          <Heart className="w-3.5 h-3.5 fill-[#E05A7A] text-[#E05A7A] shrink-0" />
                        )}
                        {opt.id === "estrela" && (
                          <Star className="w-3.5 h-3.5 fill-[#D99B26] text-[#D99B26] shrink-0" />
                        )}
                        {opt.id === "logo" && (
                          <Sparkles className="w-3.5 h-3.5 text-primaria shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-texto-claro dark:text-[#988087] leading-snug">
                        {opt.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seletor de Cor do QR Code */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                  Cor da Matriz do QR Code
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-fundo dark:bg-[#151012] border border-borda dark:border-[#38262C]">
                    <input
                      type="color"
                      value={corQr}
                      onChange={(e) => setCorQr(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                      title="Escolher cor do QR Code"
                    />
                    <Input
                      type="text"
                      value={corQr}
                      onChange={(e) => setCorQr(e.target.value)}
                      className="w-24 h-7 text-xs font-mono uppercase bg-white dark:bg-[#1E1518]"
                    />
                  </div>

                  {QR_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setCorQr(preset.hex)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium border transition-all cursor-pointer ${
                        corQr.toLowerCase() === preset.hex.toLowerCase()
                          ? "border-primaria bg-primaria-soft/50 text-texto-escuro dark:text-white font-bold"
                          : "border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] text-texto-medio dark:text-[#C5B0B6]"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span>{preset.label.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Botão Salvar e Gerar QR Code */}
            <div className="pt-4 border-t border-borda dark:border-[#38262C] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-texto-claro dark:text-[#988087]">
                <ShieldCheck className="w-4 h-4 text-sucesso shrink-0" />
                <span>
                  Gera automaticamente <code>hash_acesso</code> + <code>?k=chave_seguranca</code> únicos.
                </span>
              </div>

              <Button
                type="submit"
                isLoading={isSaving}
                className="w-full sm:w-auto h-auto min-h-11 whitespace-normal text-center leading-snug px-5 py-2.5 text-xs font-semibold gap-2 shadow-sm"
              >
                <QrCode className="w-4 h-4 shrink-0" />
                <span>
                  {editingId
                    ? "Salvar Alterações do QR Code"
                    : "Gerar QR Code Exclusivo p/ Impressão"}
                </span>
              </Button>
            </div>
          </form>

          {/* Coluna Direita: Preview Ao Vivo (Mockup de Celular + Preview do QR Code) (5 colunas) */}
          <div className="xl:col-span-5 space-y-5 xl:sticky xl:top-6 min-w-0">
            {/* Card 1: Preview do QR Code que será impresso */}
            <div className="bg-white dark:bg-[#1E1518] p-4 sm:p-5 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
              <div className="p-3 rounded-2xl bg-white border border-borda shadow-2xs shrink-0">
                <QrCodeStyledPreview
                  value={liveQrUrl}
                  color={corQr}
                  iconStyle={estiloIconeQr}
                  className="w-28 h-28 sm:w-32 sm:h-32"
                />
              </div>

              <div className="space-y-2 text-center sm:text-left min-w-0 w-full">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primaria-soft dark:bg-primaria-soft/30 text-primaria text-[10px] font-bold uppercase">
                  <Printer className="w-3 h-3 shrink-0" />
                  <span>Preview da Estampa</span>
                </div>
                <h4 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                  QR Code Nível H (30% Tolerância)
                </h4>
                <p className="text-[11px] text-texto-claro dark:text-[#988087] leading-relaxed">
                  Projetado para leitura rápida mesmo em superfícies curvas de canecas, copos e etiquetas de tecido.
                </p>
                <div className="text-[10px] font-mono text-texto-medio dark:text-[#D4BFC5] bg-fundo dark:bg-[#151012] px-2.5 py-1 rounded-lg border border-borda dark:border-[#38262C] truncate max-w-full">
                  /homenagem/{previewHash.slice(0, 8)}...?k={previewKey}
                </div>
              </div>
            </div>

            {/* Card 2: Mockup de Celular Exibindo a Página Pública em Tempo Real */}
            <div className="bg-white dark:bg-[#1E1518] p-4 sm:p-5 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Smartphone className="w-4 h-4 text-primaria shrink-0" />
                  <h4 className="font-serif text-xs sm:text-sm font-bold text-texto-escuro dark:text-[#F8EFF1] truncate">
                    Preview Interativo no Celular (Teste o Play!)
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shrink-0">
                  Tempo Real
                </span>
              </div>

              {/* Moldura de Smartphone Realista */}
              <div className="mx-auto w-full max-w-[360px] rounded-[34px] sm:rounded-[40px] p-2.5 sm:p-3 bg-[#23191C] shadow-xl border-4 border-[#3A2B30]">
                {/* Notch / Dynamic Island */}
                <div className="w-24 h-4 bg-[#140E10] rounded-full mx-auto mb-2.5 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-[#2D2226] mr-2" />
                </div>

                {/* Tela Rolável do Celular */}
                <div className="rounded-[28px] overflow-y-auto max-h-[580px] scrollbar-thin bg-[#FDF8F6]">
                  <HomenagemCardView
                    isPreview={true}
                    storeName={storeName}
                    data={{
                      titulo_homenagem:
                        tituloHomenagem || "Para Sempre em Nossos Corações",
                      nome_homenageado: nomeHomenageado || "Vó Maria",
                      mensagem_texto:
                        mensagemTexto ||
                        "Sua mensagem especial aparecerá aqui com formatação delicada, emojis e todo o carinho que o presente merece... ❤️✨",
                      foto_principal:
                        fotoPrincipal ||
                        "/images/products/colar-coracao-delicado-ouro-rosa.jpg",
                      galeria_fotos: galeriaFotos,
                      arquivo_video: arquivoVideo || null,
                      arquivo_audio: arquivoAudio || null,
                    }}
                  />
                </div>

                {/* Barra Home Inferior do Celular */}
                <div className="w-28 h-1 bg-white/30 rounded-full mx-auto mt-2.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SEÇÃO B: LISTA DE QR CODES CRIADOS + ACESSO DIRETO E DETALHES
         ===================================================================== */}
      <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-borda/60 dark:border-[#38262C]/60">
          <div>
            <h3 className="font-serif text-lg font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primaria" />
              <span>QR Codes Criados & Arquivos de Impressão ({items.length})</span>
            </h3>
            <p className="text-xs text-texto-claro dark:text-[#988087]">
              Acesse o link exclusivo de cada cliente ou clique em <strong>Detalhes & Impressão</strong> para baixar em 2048px (300 DPI) e SVG Vetorizado.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-texto-claro absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pedido, cliente ou homenageado..."
              className="pl-9 bg-fundo dark:bg-[#151012] text-xs"
            />
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primaria-soft/60 dark:bg-primaria-soft/20 text-primaria flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                Nenhum QR Code encontrado
              </p>
              <p className="text-xs text-texto-claro dark:text-[#988087]">
                Crie o primeiro QR Code personalizado no formulário acima para estampar em canecas, copos ou etiquetas.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-borda dark:border-[#38262C] text-[11px] font-bold uppercase tracking-wider text-texto-claro dark:text-[#988087]">
                  <th className="py-3 px-3">Identificação do Pedido</th>
                  <th className="py-3 px-3">Data de Criação</th>
                  <th className="py-3 px-3">Tipos de Mídia</th>
                  <th className="py-3 px-3 text-center">Scans</th>
                  <th className="py-3 px-3">Link Exclusivo (?k=)</th>
                  <th className="py-3 px-3 text-right">Ações & Impressão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borda/60 dark:divide-[#38262C]/60 text-xs">
                {filteredItems.map((item) => {
                  const privatePath = buildQrHomenagemPath(
                    item.hash_acesso,
                    item.chave_seguranca
                  );
                  const fullUrl = buildQrHomenagemFullUrl(
                    item.hash_acesso,
                    item.chave_seguranca
                  );
                  const createdDate = new Date(item.criado_em).toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-fundo/60 dark:hover:bg-[#251A1E]/50 transition-colors"
                    >
                      {/* Coluna 1: Pedido + Homenageado + Mini QR */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedQrModal(item)}
                            className="p-1 rounded-xl bg-white border border-borda shadow-2xs shrink-0 hover:scale-105 transition-transform cursor-pointer"
                            title="Clique para ampliar e baixar para impressão"
                          >
                            <QrCodeStyledPreview
                              value={fullUrl}
                              color={item.cor_qr}
                              iconStyle={item.estilo_icone_qr}
                              className="w-11 h-11"
                            />
                          </button>
                          <div className="min-w-0">
                            <p className="font-bold text-texto-escuro dark:text-[#F8EFF1] truncate">
                              {item.identificacao_pedido}
                            </p>
                            <p className="text-[11px] text-primaria font-medium truncate">
                              Homenageado(a): {item.nome_homenageado}
                            </p>
                            <p className="text-[10px] text-texto-claro dark:text-[#988087] truncate">
                              &ldquo;{item.titulo_homenagem}&rdquo;
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Coluna 2: Data */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-texto-medio dark:text-[#D4BFC5] font-mono text-[11px]">
                        {createdDate}
                      </td>

                      {/* Coluna 3: Badges de Mídia */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-[#2C1E23] text-texto-escuro dark:text-[#F8EFF1]">
                            <FileText className="w-2.5 h-2.5 text-primaria" />
                            Texto
                          </span>
                          {item.foto_principal && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40">
                              <ImageIcon className="w-2.5 h-2.5" />
                              Foto
                            </span>
                          )}
                          {item.galeria_fotos && item.galeria_fotos.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                              <Layers className="w-2.5 h-2.5" />
                              +{item.galeria_fotos.length} Fotos
                            </span>
                          )}
                          {item.arquivo_video && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40">
                              <Film className="w-2.5 h-2.5" />
                              Vídeo
                            </span>
                          )}
                          {item.arquivo_audio && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                              <Music className="w-2.5 h-2.5" />
                              Áudio
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Coluna 4: Contador de Visualizações */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primaria-soft/70 dark:bg-primaria-soft/20 text-primaria font-mono font-bold text-xs">
                          <Eye className="w-3 h-3" />
                          {item.visualizacoes || 0}
                        </span>
                      </td>

                      {/* Coluna 5: Link Direto (Copiar + Abrir em Nova Aba) */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(item)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-fundo dark:bg-[#151012] hover:bg-primaria-soft dark:hover:bg-[#2C1D23] border border-borda dark:border-[#38262C] text-[11px] font-semibold text-texto-escuro dark:text-[#F8EFF1] transition-colors cursor-pointer"
                            title="Copiar Link Exclusivo com Chave de Segurança"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-sucesso" />
                                <span className="text-sucesso">Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-primaria" />
                                <span>Copiar Link</span>
                              </>
                            )}
                          </button>

                          <Link
                            href={privatePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-fundo dark:bg-[#151012] hover:bg-neutral-100 dark:hover:bg-[#2C1D23] border border-borda dark:border-[#38262C] text-[11px] font-semibold text-texto-medio dark:text-[#D4BFC5] transition-colors"
                            title="Abrir página pública da homenagem em nova aba"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Abrir</span>
                          </Link>
                        </div>
                      </td>

                      {/* Coluna 6: Ações (Detalhes & Impressão, Editar, Excluir) */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedQrModal(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primaria text-white hover:bg-primaria-hover text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Detalhes & Impressão</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditItem(item)}
                            className="p-1.5 rounded-xl border border-borda dark:border-[#38262C] text-texto-medio hover:text-primaria hover:bg-fundo dark:hover:bg-[#251A1E] transition-colors cursor-pointer"
                            title="Editar conteúdo da homenagem"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-xl border border-borda dark:border-[#38262C] text-texto-claro hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="Excluir QR Code"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================================
          MODAL DE DETALHES E EXPORTAÇÃO EM ALTA RESOLUÇÃO (ESTAMPARIA 300 DPI)
         ===================================================================== */}
      {selectedQrModal && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-fade-in"
          onClick={() => setSelectedQrModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-white dark:bg-[#1E1518] rounded-3xl border border-borda dark:border-[#38262C] shadow-2xl overflow-hidden my-4 sm:my-8"
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 bg-fundo dark:bg-[#151012] border-b border-borda dark:border-[#38262C]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-primaria text-white flex items-center justify-center shadow-xs shrink-0">
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primaria block truncate">
                    Central de Impressão & Detalhes da Homenagem
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-texto-escuro dark:text-[#F8EFF1] truncate">
                    {selectedQrModal.identificacao_pedido}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedQrModal(null)}
                aria-label="Fechar modal"
                className="w-9 h-9 rounded-xl bg-white dark:bg-[#251A1E] border border-borda dark:border-[#38262C] flex items-center justify-center text-texto-medio hover:text-texto-escuro shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Corpo do Modal */}
            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 max-h-[84vh] overflow-y-auto">
              {/* Lado Esquerdo: Matriz de Alta Resolução + Downloads p/ Máquinas (5 cols) */}
              <div className="lg:col-span-5 bg-fundo/70 dark:bg-[#151012] p-4 sm:p-5 rounded-2xl border border-borda dark:border-[#38262C] flex flex-col items-center text-center space-y-4 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-bold uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Correção de Erro Nível H (30%) Ativa</span>
                </div>

                <div className="p-3.5 sm:p-4 rounded-3xl bg-white border-2 border-borda shadow-sm">
                  <QrCodeStyledPreview
                    value={buildQrHomenagemFullUrl(
                      selectedQrModal.hash_acesso,
                      selectedQrModal.chave_seguranca
                    )}
                    color={selectedQrModal.cor_qr}
                    iconStyle={selectedQrModal.estilo_icone_qr}
                    transparentBackground={pngTransparentBg}
                    className="w-44 h-44 sm:w-52 sm:h-52"
                  />
                </div>

                {/* Seletor de Fundo: Branco vs Transparente */}
                <div className="w-full space-y-1.5">
                  <span className="text-[11px] font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                    Fundo da Exportação p/ Máquina:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPngTransparentBg(false)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all whitespace-normal leading-tight cursor-pointer ${
                        !pngTransparentBg
                          ? "bg-primaria text-white border-primaria shadow-2xs"
                          : "bg-white dark:bg-[#1E1518] text-texto-medio dark:text-[#C5B0B6] border-borda dark:border-[#38262C]"
                      }`}
                    >
                      Fundo Branco (Canecas)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPngTransparentBg(true)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all whitespace-normal leading-tight cursor-pointer ${
                        pngTransparentBg
                          ? "bg-primaria text-white border-primaria shadow-2xs"
                          : "bg-white dark:bg-[#1E1518] text-texto-medio dark:text-[#C5B0B6] border-borda dark:border-[#38262C]"
                      }`}
                    >
                      Transparente (DTF/Têxtil)
                    </button>
                  </div>
                </div>

                {/* Botões de Download Profissional (Com quebra de linha responsiva e zero overflow) */}
                <div className="w-full space-y-2.5 pt-1">
                  <Button
                    type="button"
                    isLoading={isDownloadingPng}
                    onClick={async () => {
                      setIsDownloadingPng(true);
                      try {
                        const slug = slugifyFileName(
                          selectedQrModal.identificacao_pedido
                        );
                        await downloadQrCodeHighResPng({
                          value: buildQrHomenagemFullUrl(
                            selectedQrModal.hash_acesso,
                            selectedQrModal.chave_seguranca
                          ),
                          color: selectedQrModal.cor_qr,
                          iconStyle: selectedQrModal.estilo_icone_qr,
                          transparentBackground: pngTransparentBg,
                          fileName: `qrcode-${slug}-2048px-300dpi.png`,
                        });
                      } finally {
                        setIsDownloadingPng(false);
                      }
                    }}
                    className="w-full h-auto min-h-12 whitespace-normal text-center leading-snug px-4 py-2.5 text-xs font-bold gap-2.5 shadow-sm"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span className="flex flex-col items-center">
                      <span>Baixar PNG Alta Resolução</span>
                      <span className="text-[10px] font-semibold opacity-90">
                        2048×2048px • 300 DPI
                      </span>
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const slug = slugifyFileName(
                        selectedQrModal.identificacao_pedido
                      );
                      downloadQrCodeVectorSvg({
                        value: buildQrHomenagemFullUrl(
                          selectedQrModal.hash_acesso,
                          selectedQrModal.chave_seguranca
                        ),
                        color: selectedQrModal.cor_qr,
                        iconStyle: selectedQrModal.estilo_icone_qr,
                        transparentBackground: pngTransparentBg,
                        fileName: `qrcode-${slug}-vetor.svg`,
                      });
                    }}
                    className="w-full h-auto min-h-12 whitespace-normal text-center leading-snug px-4 py-2.5 text-xs font-bold gap-2.5 bg-white dark:bg-[#1E1518]"
                  >
                    <Download className="w-4 h-4 text-primaria shrink-0" />
                    <span className="flex flex-col items-center">
                      <span>Baixar SVG Vetorizado Puro</span>
                      <span className="text-[10px] font-semibold opacity-85">
                        Arquivo .svg p/ Gravação & Laser
                      </span>
                    </span>
                  </Button>
                </div>

                <div className="w-full p-3 rounded-xl bg-white dark:bg-[#1E1518] border border-borda dark:border-[#38262C] text-left text-[11px] text-texto-claro dark:text-[#988087] space-y-1">
                  <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                    Especificações Técnicas de Estamparia:
                  </p>
                  <p>• Resolução Nativa: 2048×2048px (300 DPI embutido no chunk pHYs).</p>
                  <p>• Nível ECC: High (30% de recuperação contra dobras e prensa térmica).</p>
                  <p>
                    • Ícone Central:{" "}
                    <strong className="uppercase">{selectedQrModal.estilo_icone_qr}</strong>{" "}
                    | Cor: <strong className="font-mono">{selectedQrModal.cor_qr}</strong>
                  </p>
                </div>
              </div>

              {/* Lado Direito: Informações Completas + Preview das Mídias (7 cols) */}
              <div className="lg:col-span-7 space-y-4 min-w-0">
                {/* Bloco de Link Privado e Segurança */}
                <div className="p-4 rounded-2xl bg-fundo/50 dark:bg-[#151012] border border-borda dark:border-[#38262C] space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1]">
                      Link Privado Exclusivo do QR Code
                    </span>
                    <span className="text-[11px] font-mono font-bold text-primaria">
                      {selectedQrModal.visualizacoes || 0} visualizações registradas
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={buildQrHomenagemFullUrl(
                        selectedQrModal.hash_acesso,
                        selectedQrModal.chave_seguranca
                      )}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E1518] border border-borda dark:border-[#38262C] text-[11px] font-mono text-texto-medio dark:text-[#D4BFC5] min-w-0"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyLink(selectedQrModal)}
                        className="flex-1 sm:flex-initial shrink-0 gap-1.5 text-xs"
                      >
                        {copiedId === selectedQrModal.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-sucesso" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </Button>
                      <Link
                        href={buildQrHomenagemPath(
                          selectedQrModal.hash_acesso,
                          selectedQrModal.chave_seguranca
                        )}
                        target="_blank"
                        className="flex-1 sm:flex-initial"
                      >
                        <Button type="button" size="sm" className="w-full shrink-0 gap-1.5 text-xs">
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Abrir Página</span>
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-texto-claro dark:text-[#988087] pt-1 break-all">
                    <div>
                      Hash URL: <code className="font-mono text-texto-escuro dark:text-[#F8EFF1]">{selectedQrModal.hash_acesso}</code>
                    </div>
                    <div>
                      Chave (?k=): <code className="font-mono text-primaria font-bold">{selectedQrModal.chave_seguranca}</code>
                    </div>
                  </div>
                </div>

                {/* Detalhes do Conteúdo */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#151012] border border-borda dark:border-[#38262C] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-borda/60 dark:border-[#38262C]/60">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-texto-claro block">
                        Título da Homenagem
                      </span>
                      <p className="font-serif font-bold text-sm text-texto-escuro dark:text-[#F8EFF1]">
                        {selectedQrModal.titulo_homenagem}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-texto-claro block">
                        Nome do Homenageado(a)
                      </span>
                      <p className="font-serif font-bold text-sm text-primaria">
                        {selectedQrModal.nome_homenageado}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-texto-claro block mb-1">
                      Mensagem Escolhida
                    </span>
                    <div className="p-3 rounded-xl bg-fundo/60 dark:bg-[#1E1518] border border-borda/60 dark:border-[#38262C] text-xs text-texto-escuro dark:text-[#F8EFF1] whitespace-pre-line max-h-36 overflow-y-auto leading-relaxed">
                      {selectedQrModal.mensagem_texto}
                    </div>
                  </div>

                  {/* Preview das Mídias Cadastradas */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] uppercase font-bold text-texto-claro block">
                      Mídias Vinculadas à Homenagem
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {selectedQrModal.foto_principal && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-texto-medio block">
                            Foto Principal
                          </span>
                          <div className="aspect-square rounded-xl overflow-hidden border border-borda bg-fundo">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={selectedQrModal.foto_principal}
                              alt="Foto Principal"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {selectedQrModal.galeria_fotos?.map((gUrl, idx) => (
                        <div key={`${gUrl}-${idx}`} className="space-y-1">
                          <span className="text-[10px] font-semibold text-texto-claro block">
                            Galeria #{idx + 1}
                          </span>
                          <div className="aspect-square rounded-xl overflow-hidden border border-borda bg-fundo">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={gUrl}
                              alt={`Galeria ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedQrModal.arquivo_audio && (
                      <div className="p-2.5 rounded-xl bg-fundo dark:bg-[#1E1518] border border-borda dark:border-[#38262C] space-y-1.5">
                        <span className="text-[10px] font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-1.5">
                          <Music className="w-3.5 h-3.5 text-primaria" />
                          Áudio / Música Cadastrada:
                        </span>
                        {extractYouTubeVideoId(selectedQrModal.arquivo_audio) ? (
                          <div className="aspect-[16/7] w-full rounded-lg overflow-hidden bg-black">
                            <iframe
                              src={`https://www.youtube.com/embed/${extractYouTubeVideoId(
                                selectedQrModal.arquivo_audio
                              )}`}
                              title="Áudio YouTube"
                              className="w-full h-full border-0"
                            />
                          </div>
                        ) : (
                          <audio
                            src={selectedQrModal.arquivo_audio}
                            controls
                            className="w-full h-8"
                          />
                        )}
                      </div>
                    )}

                    {selectedQrModal.arquivo_video && (
                      <div className="p-2.5 rounded-xl bg-fundo dark:bg-[#1E1518] border border-borda dark:border-[#38262C] space-y-1.5">
                        <span className="text-[10px] font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-primaria" />
                          Vídeo Cadastrado:
                        </span>
                        {selectedQrModal.arquivo_video === "slideshow://auto" ? (
                          <p className="text-xs text-primaria font-medium">
                            ✨ Cine-Memória Ativo (Filme Animado das Fotos da Homenagem)
                          </p>
                        ) : extractYouTubeVideoId(selectedQrModal.arquivo_video) ? (
                          <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                            <iframe
                              src={`https://www.youtube.com/embed/${extractYouTubeVideoId(
                                selectedQrModal.arquivo_video
                              )}`}
                              title="Vídeo YouTube"
                              allowFullScreen
                              className="w-full h-full border-0"
                            />
                          </div>
                        ) : (
                          <video
                            src={selectedQrModal.arquivo_video}
                            controls
                            playsInline
                            className="w-full max-h-44 rounded-lg bg-black"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
