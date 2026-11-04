import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, logAdminAudit } from "@/features/admin/actions";
import { uploadQrHomenagemFile } from "@/lib/qrcodes/qrcode-store";

export async function POST(request: NextRequest) {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return NextResponse.json(
      { success: false, message: auth.error || "Não autorizado." },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const mediaTypeRaw = String(formData.get("mediaType") || "foto");
    const validTypes = ["foto", "galeria", "video", "audio"] as const;
    const mediaCategory = (
      validTypes.includes(mediaTypeRaw as (typeof validTypes)[number])
        ? mediaTypeRaw
        : "foto"
    ) as "foto" | "galeria" | "video" | "audio";

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { success: false, message: "Nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    const res = await uploadQrHomenagemFile(file, mediaCategory);
    if (!res.success || !res.url) {
      return NextResponse.json(
        { success: false, message: res.message },
        { status: 400 }
      );
    }

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

    return NextResponse.json(res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, message: `Falha no upload: ${msg}` },
      { status: 500 }
    );
  }
}

