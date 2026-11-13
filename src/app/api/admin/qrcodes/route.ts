import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, logAdminAudit } from "@/features/admin/actions";
import { listQrHomenagens, saveQrHomenagem } from "@/lib/qrcodes/qrcode-store";
import { saveQrHomenagemSchema } from "@/schemas/qrcode";

export async function GET() {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return NextResponse.json(
      { success: false, message: auth.error || "Não autorizado." },
      { status: 401 }
    );
  }

  const items = await listQrHomenagens(auth.supabase);
  return NextResponse.json({ success: true, items });
}

export async function POST(request: NextRequest) {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return NextResponse.json(
      { success: false, message: auth.error || "Não autorizado." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const parsed = saveQrHomenagemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            parsed.error.issues[0]?.message ||
            "Dados inválidos para criação do QR Code.",
        },
        { status: 400 }
      );
    }

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
    }, auth.supabase);

    await logAdminAudit(
      auth.supabase,
      auth.user.id,
      parsed.data.id ? "update_qr_homenagem" : "create_qr_homenagem",
      "qr_homenagens",
      saved.id,
      {
        identificacao_pedido: saved.identificacao_pedido,
        nome_homenageado: saved.nome_homenageado,
        hash_acesso: saved.hash_acesso,
      }
    );

    return NextResponse.json({
      success: true,
      message: "QR Code salvo com sucesso!",
      item: saved,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, message: `Erro interno: ${msg}` },
      { status: 500 }
    );
  }
}

