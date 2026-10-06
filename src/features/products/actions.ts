"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface UploadCustomizationImageResult {
  success: boolean;
  message?: string;
  publicUrl?: string;
  storagePath?: string;
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/avif",
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Server Action segura para upload de imagem de personalização de produto.
 * Salva a imagem enviada pelo cliente no Supabase Storage na pasta 'customizations/'.
 */
export async function uploadCustomizationImageAction(
  formData: FormData
): Promise<UploadCustomizationImageResult> {
  try {
    const file = formData.get("file") as File | null;

    if (!file) {
      return {
        success: false,
        message: "Nenhum arquivo enviado.",
      };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        message:
          "Formato de imagem inválido. Formatos suportados: JPG, PNG, WEBP e HEIC.",
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        message: "A imagem não pode ultrapassar o limite de 5MB.",
      };
    }

    const adminSupabase = createAdminClient();

    // Sanitizar e gerar nome seguro
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const cleanExt = ["jpg", "jpeg", "png", "webp", "heic", "avif"].includes(fileExt)
      ? fileExt
      : "jpg";
    const randomId = Math.random().toString(36).slice(2, 10);
    const fileName = `customizations/${Date.now()}-${randomId}.${cleanExt}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await adminSupabase.storage
      .from("products")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Erro no upload da imagem de personalização:", uploadError);
      return {
        success: false,
        message: "Falha ao enviar a imagem. Tente novamente.",
      };
    }

    const { data: publicUrlData } = adminSupabase.storage
      .from("products")
      .getPublicUrl(fileName);

    return {
      success: true,
      publicUrl: publicUrlData.publicUrl,
      storagePath: fileName,
    };
  } catch (error) {
    console.error("Erro inesperado em uploadCustomizationImageAction:", error);
    return {
      success: false,
      message: "Erro interno no servidor ao processar a imagem.",
    };
  }
}
