import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, logAdminAudit } from "@/features/admin/actions";
import {
  getQrHomenagemById,
  deleteQrHomenagem,
} from "@/lib/qrcodes/qrcode-store";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return NextResponse.json(
      { success: false, message: auth.error || "Não autorizado." },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const item = await getQrHomenagemById(id, auth.supabase);

  if (!item) {
    return NextResponse.json(
      { success: false, message: "QR Code não encontrado." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, item });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return NextResponse.json(
      { success: false, message: auth.error || "Não autorizado." },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const existing = await getQrHomenagemById(id, auth.supabase);
  await deleteQrHomenagem(id, auth.supabase);

  await logAdminAudit(
    auth.supabase,
    auth.user.id,
    "delete_qr_homenagem",
    "qr_homenagens",
    id,
    {
      identificacao_pedido: existing?.identificacao_pedido || id,
    }
  );

  return NextResponse.json({
    success: true,
    message: "QR Code excluído com sucesso.",
  });
}

