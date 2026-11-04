import type { Metadata } from "next";
import Link from "next/link";
import { Lock, QrCode, Heart, ShieldAlert, ArrowLeft } from "lucide-react";
import {
  getQrHomenagemByHash,
  incrementQrHomenagemViews,
  verifyChaveSeguranca,
} from "@/lib/qrcodes/qrcode-store";
import { getStoreSettings } from "@/lib/settings/store-settings";
import { HomenagemCardView } from "@/components/homenagem/homenagem-card-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ hash: string }>;
  searchParams: Promise<{ k?: string }>;
}): Promise<Metadata> {
  const { hash } = await params;
  const { k } = await searchParams;
  const item = await getQrHomenagemByHash(hash);
  const isAuthorized = Boolean(
    item && verifyChaveSeguranca(item.chave_seguranca, k)
  );

  return {
    title: isAuthorized && item
      ? `${item.titulo_homenagem} — ${item.nome_homenageado}`
      : "Acesso Restrito — Conteúdo Exclusivo QR Code",
    description: isAuthorized
      ? "Uma homenagem especial preparada exclusivamente para você."
      : "Este conteúdo é exclusivo e só pode ser acessado escaneando o QR Code original do produto.",
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  };
}

export default async function PublicHomenagemPage({
  params,
  searchParams,
}: {
  params: Promise<{ hash: string }>;
  searchParams: Promise<{ k?: string }>;
}) {
  const [{ hash }, { k }, settings] = await Promise.all([
    params,
    searchParams,
    getStoreSettings(),
  ]);

  const item = await getQrHomenagemByHash(hash);
  const isAuthorized = Boolean(
    item && verifyChaveSeguranca(item.chave_seguranca, k)
  );

  if (!isAuthorized || !item) {
    return (
      <main className="min-h-screen w-full bg-[#FAF3F0] flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-[#F9C7D4] selection:text-[#4A3533]">
        <div className="w-full max-w-[440px] bg-[#FDF8F6] rounded-[32px] border border-[#EAD8D4] p-7 sm:p-9 text-center shadow-[0_20px_50px_rgba(87,66,64,0.12)] space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#FBECEE] border border-[#F2D5DC] flex items-center justify-center text-[#C46881] shadow-2xs">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBECEE] text-[#B85D76] text-[10px] font-bold uppercase tracking-widest">
              <ShieldAlert className="w-3 h-3" />
              Lembrança Privada Protegida
            </span>

            <h1 className="font-serif text-2xl font-bold text-[#4A3533] leading-snug">
              Acesso Restrito
            </h1>

            <p className="text-sm text-[#7A615F] leading-relaxed">
              Este conteúdo é exclusivo e só pode ser acessado escaneando o{" "}
              <strong className="text-[#4A3533]">
                QR Code original do produto
              </strong>
              .
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#EFE0DC] text-left flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FDF2F4] text-[#D47992] flex items-center justify-center shrink-0 mt-0.5">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="text-xs text-[#6E5553] leading-relaxed">
              <strong className="text-[#4A3533] block mb-0.5">
                Como acessar sua homenagem?
              </strong>
              Aponte a câmera do seu celular diretamente para o QR Code
              estampado na sua caneca, copo, etiqueta ou presente personalizado.
            </div>
          </div>

          <div className="pt-2 border-t border-[#EFE0DC] flex flex-col items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#C46881] hover:text-[#A85069] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Conhecer a {settings.store_name || "Isis Store"}</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Incrementar contador de visualizações de forma segura a cada acesso válido
  await incrementQrHomenagemViews(item.hash_acesso, item.chave_seguranca);

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-[#FAF1EE] via-[#FDF8F6] to-[#F7EAE6] py-6 sm:py-12 px-3 sm:px-6 flex flex-col items-center justify-center selection:bg-[#F9C7D4] selection:text-[#4A3533]">
      <HomenagemCardView
        data={{
          titulo_homenagem: item.titulo_homenagem,
          nome_homenageado: item.nome_homenageado,
          mensagem_texto: item.mensagem_texto,
          foto_principal: item.foto_principal,
          galeria_fotos: item.galeria_fotos,
          arquivo_video: item.arquivo_video,
          arquivo_audio: item.arquivo_audio,
          criado_em: item.criado_em,
        }}
        storeName={settings.store_name || "Isis Store"}
      />

      <div className="mt-5 flex items-center gap-1.5 text-[11px] text-[#9A7F7D]">
        <Heart className="w-3 h-3 fill-[#E08CA3] text-[#E08CA3]" />
        <span>Página privada protegida por chave de segurança única</span>
      </div>
    </main>
  );
}

