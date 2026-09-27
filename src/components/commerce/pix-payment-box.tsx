"use client";

import * as React from "react";
import Image from "next/image";
import { QrCode, Copy, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PixPaymentBoxProps {
  qrCode: string;
  qrCodeBase64?: string | null;
  amountFormatted: string;
}

export function PixPaymentBox({
  qrCode,
  qrCodeBase64,
  amountFormatted,
}: PixPaymentBoxProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      setCopied(true);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/50 border border-amber-200/80 text-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/60">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <QrCode className="w-5 h-5 text-amber-700" />
          <span>Pagamento via Pix Pendente</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-medium bg-amber-100/70 px-2.5 py-1 rounded-full w-fit">
          <Clock className="w-3.5 h-3.5" />
          <span>Válido por 30 minutos</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
        {/* Imagem do QR Code se disponível */}
        {qrCodeBase64 && (
          <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-amber-200/70 shadow-xs">
            <div className="relative w-36 h-36">
              <Image
                src={
                  qrCodeBase64.startsWith("data:")
                    ? qrCodeBase64
                    : `data:image/png;base64,${qrCodeBase64}`
                }
                alt="QR Code Pix Isis Store"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <span className="text-[10px] text-texto-claro mt-2">
              Aponte a câmera do seu banco
            </span>
          </div>
        )}

        {/* Instruções e Chave Copia e Cola */}
        <div className={qrCodeBase64 ? "sm:col-span-8 space-y-3" : "sm:col-span-12 space-y-3"}>
          <p className="text-amber-900 leading-relaxed text-xs">
            Abra o aplicativo do seu banco, escolha <strong>Pix</strong> e selecione <strong>Pagar com QR Code</strong> ou cole o código abaixo:
          </p>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white p-3 rounded-xl border border-amber-200 text-texto-medio font-mono text-[11px] truncate select-all">
              {qrCode}
            </div>
            <Button
              type="button"
              onClick={handleCopy}
              variant="default"
              size="sm"
              className="text-xs font-semibold px-4 gap-1.5 shadow-xs shrink-0"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-sucesso" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Código</span>
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-amber-800 pt-1">
            <span>Total com 5% de desconto no Pix:</span>
            <strong className="text-sm font-serif text-amber-950 font-bold">
              {amountFormatted}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
