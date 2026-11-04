export type QrIconStyle = "coracao" | "estrela" | "logo" | "nenhum";

export interface QrHomenagem {
  id: string;
  hash_acesso: string;
  chave_seguranca: string;
  identificacao_pedido: string;
  titulo_homenagem: string;
  nome_homenageado: string;
  mensagem_texto: string;
  foto_principal: string | null;
  galeria_fotos: string[];
  arquivo_video: string | null;
  arquivo_audio: string | null;
  estilo_icone_qr: QrIconStyle;
  cor_qr: string;
  visualizacoes: number;
  criado_em: string;
  atualizado_em?: string;
}

export interface CreateQrHomenagemInput {
  id?: string;
  identificacao_pedido: string;
  titulo_homenagem: string;
  nome_homenageado: string;
  mensagem_texto: string;
  foto_principal?: string | null;
  galeria_fotos?: string[];
  arquivo_video?: string | null;
  arquivo_audio?: string | null;
  estilo_icone_qr: QrIconStyle;
  cor_qr: string;
}

export const QR_ICON_STYLE_OPTIONS: {
  id: QrIconStyle;
  label: string;
  description: string;
}[] = [
  {
    id: "coracao",
    label: "Coração Afetivo",
    description: "Coração rosa estilo estampa (ideal para canecas e presentes)",
  },
  {
    id: "estrela",
    label: "Estrela Dourada",
    description: "Estrela delicada para datas comemorativas e conquistas",
  },
  {
    id: "logo",
    label: "Selo Isis Store",
    description: "Monograma minimalista da marca no centro do QR Code",
  },
  {
    id: "nenhum",
    label: "Sem Ícone (Puro)",
    description: "Matriz limpa para etiquetas pequenas de roupas (< 2cm)",
  },
];

export const QR_COLOR_PRESETS: { label: string; hex: string }[] = [
  { label: "Preto Sublimação (Padrão)", hex: "#000000" },
  { label: "Vinho Profundo Isis", hex: "#5C1D2E" },
  { label: "Marrom Café Gourmet", hex: "#3E2723" },
  { label: "Rosa Intenso Estampa", hex: "#AD1457" },
  { label: "Azul Noite Clássico", hex: "#1A237E" },
  { label: "Verde Musgo Editorial", hex: "#1B4332" },
];

export const TITULO_SUGESTOES: string[] = [
  "Para Sempre em Nossos Corações",
  "Momentos que Ficam para Sempre",
  "Com Todo o Meu Amor para Você",
  "Uma Lembrança Especial do Nosso Dia",
  "Parabéns por Existir na Minha Vida",
];

export const PRESET_AUDIO_TRACKS: {
  id: string;
  label: string;
  subtitle: string;
  url: string;
}[] = [
  {
    id: "caixinha",
    label: "Caixinha de Música Afetiva",
    subtitle: "Melodia doce e nostálgica (Ideal para mães, avós e família)",
    url: "/api/media/homenagens/preset-caixinha-musica.wav",
  },
  {
    id: "piano",
    label: "Piano Romântico Suave",
    subtitle: "Acordes lentos e emocionantes (Ideal para casais e namorados)",
    url: "/api/media/homenagens/preset-piano-romantico.wav",
  },
  {
    id: "violao",
    label: "Acordes Doces Recordações",
    subtitle: "Harmonia acolhedora e alegre (Ideal para amigos e aniversários)",
    url: "/api/media/homenagens/preset-violao-afetivo.wav",
  },
  {
    id: "serenata",
    label: "Serenata de Amor & Carinho",
    subtitle: "Trilha delicada estilo harpa/piano para homenagens eternas",
    url: "/api/media/homenagens/preset-serenata-doce.wav",
  },
];

export function extractYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ];
  for (const regex of patterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) return match[1];
  }
  return null;
}

export function extractVimeoVideoId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.trim().match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match && match[1] ? match[1] : null;
}

export function buildQrHomenagemPath(hashAcesso: string, chaveSeguranca: string): string {
  return `/homenagem/${encodeURIComponent(hashAcesso)}?k=${encodeURIComponent(chaveSeguranca)}`;
}

export function buildQrHomenagemFullUrl(
  hashAcesso: string,
  chaveSeguranca: string,
  baseUrl?: string
): string {
  const origin =
    baseUrl ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://isisstore.com.br");
  const cleanOrigin = origin.replace(/\/$/, "");
  return `${cleanOrigin}${buildQrHomenagemPath(hashAcesso, chaveSeguranca)}`;
}

export const SEED_QR_HOMENAGENS: QrHomenagem[] = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    hash_acesso: "a8f9d2e1-4b7c-49a3-9e21-7c6d5a4b3f10",
    chave_seguranca: "vm2026k9",
    identificacao_pedido: "Pedido #1042 - Caneca Vó Maria",
    titulo_homenagem: "Para Sempre em Nossos Corações",
    nome_homenageado: "Vó Maria",
    mensagem_texto:
      "Querida Vó Maria,\n\nCada gole de café nesta caneca carrega o abraço quentinho que só a senhora sabe dar. Obrigado por todas as histórias na mesa da cozinha, pelo bolo de chuva nas tardes de domingo e por ensinar que o amor mora nos pequenos gestos.\n\nNós te amamos infinitamente! ❤️✨🌹",
    foto_principal: "/images/products/colar-coracao-delicado-ouro-rosa.jpg",
    galeria_fotos: [
      "/images/products/ursinho-de-pelucia-carinho.jpg",
      "/images/products/colar-coracao-delicado-ouro-rosa.jpg",
    ],
    arquivo_video: "slideshow://auto",
    arquivo_audio: "/api/media/homenagens/preset-caixinha-musica.wav",
    estilo_icone_qr: "coracao",
    cor_qr: "#000000",
    visualizacoes: 14,
    criado_em: new Date(Date.now() - 86400000 * 2).toISOString(),
    atualizado_em: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];
