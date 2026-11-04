import { NextRequest, NextResponse } from "next/server";
import {
  getQrHomenagemByHash,
  incrementQrHomenagemViews,
  verifyChaveSeguranca,
} from "@/lib/qrcodes/qrcode-store";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ hash: string }> }
) {
  const { hash } = await context.params;
  const keyParam = request.nextUrl.searchParams.get("k");

  const item = await getQrHomenagemByHash(hash);
  if (!item || !verifyChaveSeguranca(item.chave_seguranca, keyParam)) {
    return NextResponse.json(
      {
        authorized: false,
        message:
          "Acesso Restrito: Este conteúdo é exclusivo e só pode ser acessado escaneando o QR Code original do produto.",
      },
      {
        status: 403,
        headers: {
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      }
    );
  }

  const newViews = await incrementQrHomenagemViews(hash, item.chave_seguranca);

  return NextResponse.json(
    {
      authorized: true,
      homenagem: {
        titulo_homenagem: item.titulo_homenagem,
        nome_homenageado: item.nome_homenageado,
        mensagem_texto: item.mensagem_texto,
        foto_principal: item.foto_principal,
        galeria_fotos: item.galeria_fotos,
        arquivo_video: item.arquivo_video,
        arquivo_audio: item.arquivo_audio,
        visualizacoes: newViews || item.visualizacoes + 1,
        criado_em: item.criado_em,
      },
    },
    {
      headers: {
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    }
  );
}

