"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser, logAdminAudit, type AdminActionResult } from "./actions";
import { saveQrHomenagemSchema } from "@/schemas/qrcode";
import {
  listQrHomenagens,
  saveQrHomenagem,
  deleteQrHomenagem,
  uploadQrHomenagemFile,
  getQrHomenagemById,
} from "@/lib/qrcodes/qrcode-store";
import type { QrHomenagem, CreateQrHomenagemInput } from "@/lib/qrcodes/types";

export async function listQrHomenagensAction(): Promise<{
  success: boolean;
  items: QrHomenagem[];
  message?: string;
}> {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return {
      success: false,
      items: [],
      message: auth.error || "Acesso negado.",
    };
  }

  const items = await listQrHomenagens();
  return { success: true, items };
}

export async function saveQrHomenagemAction(
  rawInput: CreateQrHomenagemInput
): Promise<AdminActionResult & { item?: QrHomenagem }> {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  const parsed = saveQrHomenagemSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ||
        "Verifique os campos obrigatórios da homenagem.",
    };
  }

  try {
    const isUpdate = Boolean(parsed.data.id);
    const saved = await saveQrHomenagem({
      id: parsed.data.id || undefined,
      identificacao_pedido: parsed.data.identificacao_pedido,
      titulo_homenagem: parsed.data.titulo_homenagem,
      nome_homenageado: parsed.data.nome_homenageado,
      mensagem_texto: parsed.data.mensagem_texto,
      foto_principal: parsed.data.foto_principal || null,
      galeria_fotos: parsed.data.galeria_fotos || [],
      arquivo_video: parsed.data.arquivo_video || null,
      arquivo_audio: parsed.data.arquivo_audio || null,
      estilo_icone_qr: parsed.data.estilo_icone_qr,
      cor_qr: parsed.data.cor_qr,
    });

    await logAdminAudit(
      auth.supabase,
      auth.user.id,
      isUpdate ? "update_qr_homenagem" : "create_qr_homenagem",
      "qr_homenagens",
      saved.id,
      {
        identificacao_pedido: saved.identificacao_pedido,
        nome_homenageado: saved.nome_homenageado,
        hash_acesso: saved.hash_acesso,
        estilo_icone_qr: saved.estilo_icone_qr,
      }
    );

    revalidatePath("/admin/configuracoes");
    revalidatePath(`/homenagem/${saved.hash_acesso}`);

    return {
      success: true,
      message: isUpdate
        ? `QR Code de "${saved.identificacao_pedido}" atualizado com sucesso!`
        : `QR Code exclusivo de "${saved.identificacao_pedido}" gerado com sucesso!`,
      item: saved,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Falha ao salvar QR Code de homenagem: ${msg}`,
    };
  }
}

export async function deleteQrHomenagemAction(
  id: string
): Promise<AdminActionResult> {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  if (!id) {
    return { success: false, message: "ID do QR Code não informado." };
  }

  const existing = await getQrHomenagemById(id);
  await deleteQrHomenagem(id);

  await logAdminAudit(
    auth.supabase,
    auth.user.id,
    "delete_qr_homenagem",
    "qr_homenagens",
    id,
    {
      identificacao_pedido: existing?.identificacao_pedido || id,
      nome_homenageado: existing?.nome_homenageado || "",
    }
  );

  revalidatePath("/admin/configuracoes");
  if (existing?.hash_acesso) {
    revalidatePath(`/homenagem/${existing.hash_acesso}`);
  }

  return {
    success: true,
    message: "QR Code de homenagem excluído permanentemente.",
  };
}

export async function uploadQrMediaAction(
  formData: FormData
): Promise<AdminActionResult & { url?: string }> {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  const file = formData.get("file");
  const mediaTypeRaw = String(formData.get("mediaType") || "foto");
  const validTypes = ["foto", "galeria", "video", "audio"] as const;
  const mediaCategory = (
    validTypes.includes(mediaTypeRaw as (typeof validTypes)[number])
      ? mediaTypeRaw
      : "foto"
  ) as "foto" | "galeria" | "video" | "audio";

  if (!file || !(file instanceof File) || file.size === 0) {
    return {
      success: false,
      message: "Nenhum arquivo válido foi selecionado para upload.",
    };
  }

  const res = await uploadQrHomenagemFile(file, mediaCategory);
  if (res.success && res.url) {
    await logAdminAudit(
      auth.supabase,
      auth.user.id,
      "upload_qr_media",
      "qr_homenagens_storage",
      res.url,
      {
        media_category: mediaCategory,
        file_name: file.name,
        file_size: file.size,
      }
    );
  }

  return res;
}

