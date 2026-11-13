import crypto from "crypto";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import {
  type QrHomenagem,
  type QrIconStyle,
  type CreateQrHomenagemInput,
  SEED_QR_HOMENAGENS,
} from "./types";

const LOCAL_STORE_PATH = path.join(process.cwd(), "data", "qr-homenagens.json");
const TMP_STORE_PATH = path.join(os.tmpdir(), "isis-qr-homenagens.json");

export function generateHashAcesso(): string {
  return crypto.randomUUID();
}

export function generateChaveSeguranca(): string {
  const alphabet = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.randomBytes(10);
  let token = "";
  for (let i = 0; i < 10; i++) {
    token += alphabet[bytes[i] % alphabet.length];
  }
  return token;
}

export function verifyChaveSeguranca(expected: string, provided?: string | null): boolean {
  if (!expected || !provided) return false;
  const a = Buffer.from(expected.trim());
  const b = Buffer.from(provided.trim());
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function normalizeRow(row: Record<string, unknown>): QrHomenagem {
  const rawGaleria = row.galeria_fotos;
  let galeria: string[] = [];
  if (Array.isArray(rawGaleria)) {
    galeria = rawGaleria.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
  } else if (typeof rawGaleria === "string") {
    try {
      const parsed = JSON.parse(rawGaleria);
      if (Array.isArray(parsed)) {
        galeria = parsed.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
      }
    } catch {
      galeria = [];
    }
  }

  const iconStyle = String(row.estilo_icone_qr || "coracao") as QrIconStyle;
  const validStyles: QrIconStyle[] = ["coracao", "estrela", "logo", "nenhum"];

  return {
    id: String(row.id),
    hash_acesso: String(row.hash_acesso),
    chave_seguranca: String(row.chave_seguranca),
    identificacao_pedido: String(row.identificacao_pedido || ""),
    titulo_homenagem: String(row.titulo_homenagem || "Para Sempre em Nossos Corações"),
    nome_homenageado: String(row.nome_homenageado || ""),
    mensagem_texto: String(row.mensagem_texto || ""),
    foto_principal: row.foto_principal ? String(row.foto_principal) : null,
    galeria_fotos: galeria,
    arquivo_video: row.arquivo_video ? String(row.arquivo_video) : null,
    arquivo_audio: row.arquivo_audio ? String(row.arquivo_audio) : null,
    estilo_icone_qr: validStyles.includes(iconStyle) ? iconStyle : "coracao",
    cor_qr: String(row.cor_qr || "#000000"),
    visualizacoes: Number(row.visualizacoes || 0),
    criado_em: String(row.criado_em || new Date().toISOString()),
    atualizado_em: row.atualizado_em ? String(row.atualizado_em) : undefined,
  };
}

async function readLocalStore(): Promise<QrHomenagem[]> {
  const pathsToTry = process.env.VERCEL
    ? [TMP_STORE_PATH, LOCAL_STORE_PATH]
    : [LOCAL_STORE_PATH, TMP_STORE_PATH];

  for (const storePath of pathsToTry) {
    try {
      const content = await fs.readFile(storePath, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        let updatedSeed = false;
        const items = parsed.map((item) => {
          const norm = normalizeRow(item as Record<string, unknown>);
          if (norm.id === "f47ac10b-58cc-4372-a567-0e02b2c3d479") {
            if (!norm.arquivo_audio) {
              norm.arquivo_audio = "/api/media/homenagens/preset-caixinha-musica.wav";
              updatedSeed = true;
            }
            if (!norm.arquivo_video) {
              norm.arquivo_video = "slideshow://auto";
              updatedSeed = true;
            }
          }
          return norm;
        });
        if (updatedSeed) {
          await writeLocalStore(items);
        }
        return items;
      }
    } catch {
      // Tenta próximo caminho
    }
  }

  await writeLocalStore(SEED_QR_HOMENAGENS);
  return [...SEED_QR_HOMENAGENS];
}

async function writeLocalStore(items: QrHomenagem[]): Promise<void> {
  const payload = JSON.stringify(items, null, 2);
  try {
    const dir = path.dirname(LOCAL_STORE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(LOCAL_STORE_PATH, payload, "utf-8");
  } catch {
    try {
      await fs.writeFile(TMP_STORE_PATH, payload, "utf-8");
    } catch (err) {
      console.warn("Aviso ao persistir cache de QR Homenagens:", err);
    }
  }
}

export async function listQrHomenagens(client?: any): Promise<QrHomenagem[]> {
  const localItems = await readLocalStore();

  try {
    const supabase = client || (await createClient());
    const { data, error } = await supabase
      .from("qr_homenagens")
      .select("*")
      .order("criado_em", { ascending: false });

    if (!error && data) {
      const dbItems = data.map((r: any) => normalizeRow(r as unknown as Record<string, unknown>));
      // Mesclar itens do banco com itens locais ainda não sincronizados
      const dbIds = new Set(dbItems.map((i: any) => i.id));
      const merged = [...dbItems, ...localItems.filter((l) => !dbIds.has(l.id))];
      merged.sort(
        (a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
      );
      return merged;
    }
  } catch {
    // Fallback silencioso para store local
  }

  return localItems.sort(
    (a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
  );
}

export async function getQrHomenagemById(id: string, client?: any): Promise<QrHomenagem | null> {
  try {
    const supabase = client || (await createClient());
    const { data, error } = await supabase
      .from("qr_homenagens")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      return normalizeRow(data as unknown as Record<string, unknown>);
    }
  } catch {
    // Continua para busca local
  }

  const localItems = await readLocalStore();
  return localItems.find((item) => item.id === id) || null;
}

export async function getQrHomenagemByHash(hashAcesso: string, client?: any): Promise<QrHomenagem | null> {
  try {
    const supabase = client || (await createClient());
    const { data, error } = await supabase
      .from("qr_homenagens")
      .select("*")
      .eq("hash_acesso", hashAcesso)
      .maybeSingle();

    if (!error && data) {
      return normalizeRow(data as unknown as Record<string, unknown>);
    }
  } catch {
    // Continua para busca local
  }

  const localItems = await readLocalStore();
  return localItems.find((item) => item.hash_acesso === hashAcesso) || null;
}

export async function incrementQrHomenagemViews(
  hashAcesso: string,
  chaveSeguranca: string
): Promise<number> {
  let updatedViews = 0;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("increment_qr_homenagem_views", {
      p_hash_acesso: hashAcesso,
      p_chave_seguranca: chaveSeguranca,
    });

    if (!error && typeof data === "number" && data > 0) {
      updatedViews = data;
    }
  } catch {
    // Fallback para atualização local
  }

  const localItems = await readLocalStore();
  const idx = localItems.findIndex(
    (item) =>
      item.hash_acesso === hashAcesso &&
      verifyChaveSeguranca(item.chave_seguranca, chaveSeguranca)
  );

  if (idx !== -1) {
    localItems[idx].visualizacoes =
      updatedViews > 0 ? updatedViews : (localItems[idx].visualizacoes || 0) + 1;
    localItems[idx].atualizado_em = new Date().toISOString();
    updatedViews = localItems[idx].visualizacoes;
    await writeLocalStore(localItems);
  }

  return updatedViews;
}

export async function saveQrHomenagem(
  input: CreateQrHomenagemInput,
  client?: any
): Promise<QrHomenagem> {
  const localItems = await readLocalStore();
  const now = new Date().toISOString();

  const existing = input.id
    ? (await getQrHomenagemById(input.id, client)) || localItems.find((i) => i.id === input.id)
    : null;

  const record: QrHomenagem = {
    id: existing?.id || input.id || crypto.randomUUID(),
    hash_acesso: existing?.hash_acesso || generateHashAcesso(),
    chave_seguranca: existing?.chave_seguranca || generateChaveSeguranca(),
    identificacao_pedido: input.identificacao_pedido.trim(),
    titulo_homenagem: input.titulo_homenagem.trim(),
    nome_homenageado: input.nome_homenageado.trim(),
    mensagem_texto: input.mensagem_texto.trim(),
    foto_principal: input.foto_principal?.trim() || null,
    galeria_fotos: (input.galeria_fotos || []).filter((u) => Boolean(u && u.trim())),
    arquivo_video: input.arquivo_video?.trim() || null,
    arquivo_audio: input.arquivo_audio?.trim() || null,
    estilo_icone_qr: input.estilo_icone_qr || "coracao",
    cor_qr: input.cor_qr || "#000000",
    visualizacoes: existing?.visualizacoes ?? 0,
    criado_em: existing?.criado_em || now,
    atualizado_em: now,
  };

  try {
    const supabase = client || (await createClient());
    const { data, error } = await supabase
      .from("qr_homenagens")
      .upsert({
        id: record.id,
        hash_acesso: record.hash_acesso,
        chave_seguranca: record.chave_seguranca,
        identificacao_pedido: record.identificacao_pedido,
        titulo_homenagem: record.titulo_homenagem,
        nome_homenageado: record.nome_homenageado,
        mensagem_texto: record.mensagem_texto,
        foto_principal: record.foto_principal,
        galeria_fotos: record.galeria_fotos,
        arquivo_video: record.arquivo_video,
        arquivo_audio: record.arquivo_audio,
        estilo_icone_qr: record.estilo_icone_qr,
        cor_qr: record.cor_qr,
        visualizacoes: record.visualizacoes,
        criado_em: record.criado_em,
        atualizado_em: record.atualizado_em,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Erro ao salvar no Supabase qr_homenagens:", error);
      const isMissingTable =
        error.code === "42P01" ||
        error.code === "PGRST205" ||
        error.message?.includes("schema cache") ||
        error.message?.includes("does not exist");

      if (isMissingTable) {
        throw new Error(
          "A tabela 'qr_homenagens' ainda não foi criada no banco de dados Supabase. Execute a migration '20261104200000_qr_homenagens.sql' no SQL Editor do painel Supabase."
        );
      }
      throw new Error(`Erro ao salvar no Supabase: ${error.message}`);
    }

    if (data) {
      const saved = normalizeRow(data as unknown as Record<string, unknown>);
      const nextLocal = localItems.some((i) => i.id === saved.id)
        ? localItems.map((i) => (i.id === saved.id ? saved : i))
        : [saved, ...localItems];
      await writeLocalStore(nextLocal);
      return saved;
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Supabase")) {
      throw err;
    }
    console.error("Exceção ao persistir QR Homenagem no Supabase:", err);
    throw err;
  }

  const nextLocal = localItems.some((i) => i.id === record.id)
    ? localItems.map((i) => (i.id === record.id ? record : i))
    : [record, ...localItems];

  await writeLocalStore(nextLocal);
  return record;
}

export async function deleteQrHomenagem(id: string, client?: any): Promise<boolean> {
  try {
    const supabase = client || (await createClient());
    await supabase.from("qr_homenagens").delete().eq("id", id);
  } catch {
    // Ignora erro caso tabela remota não exista
  }

  const localItems = await readLocalStore();
  const filtered = localItems.filter((item) => item.id !== id);
  await writeLocalStore(filtered);
  return true;
}

export async function uploadQrHomenagemFile(
  file: File,
  mediaCategory: "foto" | "galeria" | "video" | "audio"
): Promise<{ success: boolean; url?: string; message: string }> {
  const maxBytes =
    mediaCategory === "video"
      ? 100 * 1024 * 1024 // 100MB para vídeo .mp4 / .webm / .mov
      : mediaCategory === "audio"
      ? 35 * 1024 * 1024 // 35MB para áudio .mp3 / .wav / .m4a
      : 15 * 1024 * 1024; // 15MB para fotos

  if (file.size > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    return {
      success: false,
      message: `O arquivo excede o limite máximo de ${maxMb}MB para ${mediaCategory}.`,
    };
  }

  let ext = (file.name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!ext) {
    if (file.type.includes("webm")) ext = "webm";
    else if (file.type.includes("mp4")) ext = mediaCategory === "audio" ? "m4a" : "mp4";
    else if (file.type.includes("mpeg") || file.type.includes("mp3")) ext = "mp3";
    else if (file.type.includes("wav")) ext = "wav";
    else if (file.type.includes("ogg")) ext = "ogg";
    else ext = mediaCategory === "video" ? "mp4" : mediaCategory === "audio" ? "mp3" : "jpg";
  }

  const allowedByCategory: Record<typeof mediaCategory, string[]> = {
    foto: ["jpg", "jpeg", "png", "webp", "gif", "avif"],
    galeria: ["jpg", "jpeg", "png", "webp", "gif", "avif"],
    video: ["mp4", "webm", "mov", "m4v", "ogg", "3gp"],
    audio: ["mp3", "wav", "ogg", "m4a", "aac", "webm", "flac", "opus", "mp4"],
  };

  if (!allowedByCategory[mediaCategory].includes(ext)) {
    return {
      success: false,
      message: `Formato .${ext || "desconhecido"} inválido para ${mediaCategory}. Formatos aceitos: ${allowedByCategory[mediaCategory].join(", ")}.`,
    };
  }

  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(4).toString("hex");
  const safeFileName = `${mediaCategory}-${timestamp}-${randomSuffix}.${ext}`;
  const storagePath = `qr-homenagens/${safeFileName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const contentType =
    file.type && file.type !== "application/octet-stream"
      ? file.type.split(";")[0]
      : mediaCategory === "video"
      ? `video/${ext === "mov" ? "quicktime" : ext}`
      : mediaCategory === "audio"
      ? `audio/${ext === "mp3" ? "mpeg" : ext === "m4a" ? "mp4" : ext}`
      : `image/${ext === "jpg" ? "jpeg" : ext}`;

  // 1. Garante cópia local em public/uploads/homenagens (ou /tmp na Vercel) servida com HTTP 206 Range via /api/media/homenagens
  let localStreamingUrl: string | undefined;
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "homenagens");
    await fs.mkdir(uploadDir, { recursive: true });
    const fullFilePath = path.join(uploadDir, safeFileName);
    await fs.writeFile(fullFilePath, buffer);
    localStreamingUrl = `/api/media/homenagens/${safeFileName}`;
  } catch {
    try {
      const tmpUploadDir = path.join(os.tmpdir(), "homenagens");
      await fs.mkdir(tmpUploadDir, { recursive: true });
      await fs.writeFile(path.join(tmpUploadDir, safeFileName), buffer);
      localStreamingUrl = `/api/media/homenagens/${safeFileName}`;
    } catch (err) {
      console.warn("Aviso ao gravar arquivo de homenagem:", err);
    }
  }

  // 2. Tenta enviar também para o bucket dedicado "homenagens" ou "products" no Supabase Storage
  try {
    const supabase = await createClient();
    const { error: homenagensErr } = await supabase.storage
      .from("homenagens")
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
      });

    if (!homenagensErr) {
      const { data: urlData } = supabase.storage
        .from("homenagens")
        .getPublicUrl(storagePath);
      return {
        success: true,
        url: urlData.publicUrl,
        message: "Arquivo enviado com sucesso!",
      };
    }

    const { error: prodErr } = await supabase.storage
      .from("products")
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
      });

    if (!prodErr) {
      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(storagePath);
      return {
        success: true,
        url: urlData.publicUrl,
        message: "Arquivo enviado com sucesso!",
      };
    }
  } catch {
    // Usa localStreamingUrl abaixo
  }

  if (localStreamingUrl) {
    return {
      success: true,
      url: localStreamingUrl,
      message: "Mídia carregada e pronta para reprodução!",
    };
  }

  return {
    success: false,
    message: "Não foi possível armazenar o arquivo de mídia.",
  };
}

