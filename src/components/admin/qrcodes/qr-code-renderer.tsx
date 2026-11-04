"use client";

import * as React from "react";
import QRCode from "qrcode";
import type { QrIconStyle } from "@/lib/qrcodes/types";

interface QrMatrixData {
  size: number;
  data: Uint8Array | boolean[];
}

export function generateQrMatrixLevelH(value: string): QrMatrixData {
  const safeValue = value.trim() || "https://isisstore.com.br";
  const qr = QRCode.create(safeValue, {
    errorCorrectionLevel: "H",
  });
  return {
    size: qr.modules.size,
    data: qr.modules.data,
  };
}

/**
 * Injetor de chunk pHYs (300 DPI = 11811 pixels/metro) no binário PNG
 * para uso profissional em softwares de sublimação, CorelDRAW, Illustrator e Photoshop.
 */
function injectPng300DpiMetadata(pngBytes: Uint8Array): Uint8Array {
  // 300 DPI = 300 / 0.0254 = 11811 pixels por metro (0x00002E23)
  const ppm = 11811;
  const physChunk = new Uint8Array(4 + 4 + 9 + 4);
  const view = new DataView(physChunk.buffer);

  // Length = 9
  view.setUint32(0, 9, false);
  // Type = "pHYs" (0x70, 0x48, 0x59, 0x73)
  physChunk[4] = 0x70;
  physChunk[5] = 0x48;
  physChunk[6] = 0x59;
  physChunk[7] = 0x73;
  // X pixels per unit
  view.setUint32(8, ppm, false);
  // Y pixels per unit
  view.setUint32(12, ppm, false);
  // Unit specifier = 1 (meter)
  physChunk[16] = 1;

  // Cálculo de CRC32 para o chunk (Type + Data)
  let crc = 0xffffffff;
  for (let i = 4; i < 17; i++) {
    crc ^= physChunk[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  view.setUint32(17, (crc ^ 0xffffffff) >>> 0, false);

  // Insere logo após o cabeçalho PNG (8 bytes) + chunk IHDR (25 bytes) = offset 33
  const ihdrEnd = 33;
  if (pngBytes.length < ihdrEnd) return pngBytes;

  const output = new Uint8Array(pngBytes.length + physChunk.length);
  output.set(pngBytes.subarray(0, ihdrEnd), 0);
  output.set(physChunk, ihdrEnd);
  output.set(pngBytes.subarray(ihdrEnd), ihdrEnd + physChunk.length);
  return output;
}

function isModuleInCenterIconZone(
  row: number,
  col: number,
  matrixSize: number,
  iconStyle: QrIconStyle
): boolean {
  if (iconStyle === "nenhum") return false;
  const center = matrixSize / 2;
  // Zona reservada de ~20% no centro (segura dentro dos 30% do nível H)
  const halfZone = Math.max(2.6, matrixSize * 0.105);
  return (
    row >= center - halfZone &&
    row <= center + halfZone - 0.5 &&
    col >= center - halfZone &&
    col <= center + halfZone - 0.5
  );
}

/**
 * Gera string SVG vetorial pura (.svg) em 2048x2048 com Nível de Correção H (30%).
 */
export function buildQrVectorSvgString({
  value,
  color = "#000000",
  iconStyle = "coracao",
  transparentBackground = false,
  sizePx = 2048,
}: {
  value: string;
  color?: string;
  iconStyle?: QrIconStyle;
  transparentBackground?: boolean;
  sizePx?: number;
}): string {
  const matrix = generateQrMatrixLevelH(value);
  const quietZoneModules = 4;
  const totalModules = matrix.size + quietZoneModules * 2;
  const cellSize = sizePx / totalModules;

  const paths: string[] = [];

  for (let r = 0; r < matrix.size; r++) {
    for (let c = 0; c < matrix.size; c++) {
      const isDark = Boolean(matrix.data[r * matrix.size + c]);
      if (!isDark) continue;
      if (isModuleInCenterIconZone(r, c, matrix.size, iconStyle)) continue;

      const x = ((c + quietZoneModules) * cellSize).toFixed(2);
      const y = ((r + quietZoneModules) * cellSize).toFixed(2);
      const s = cellSize.toFixed(2);
      paths.push(`M${x},${y}h${s}v${s}h-${s}z`);
    }
  }

  const centerPx = sizePx / 2;
  const badgeRadius = sizePx * 0.1;

  let centerIconSvg = "";
  if (iconStyle !== "nenhum") {
    const badgeBg = `<rect x="${(centerPx - badgeRadius).toFixed(2)}" y="${(
      centerPx - badgeRadius
    ).toFixed(2)}" width="${(badgeRadius * 2).toFixed(2)}" height="${(
      badgeRadius * 2
    ).toFixed(2)}" rx="${(badgeRadius * 0.36).toFixed(
      2
    )}" fill="#FFFFFF" stroke="${color}" stroke-width="${(sizePx * 0.006).toFixed(2)}" />`;

    if (iconStyle === "coracao") {
      const scale = (badgeRadius * 1.15) / 24;
      centerIconSvg = `
        <g>
          ${badgeBg}
          <g transform="translate(${(centerPx - 12 * scale).toFixed(2)}, ${(
        centerPx -
        12 * scale
      ).toFixed(2)}) scale(${scale.toFixed(4)})">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#E05A7A"/>
          </g>
        </g>
      `;
    } else if (iconStyle === "estrela") {
      const scale = (badgeRadius * 1.15) / 24;
      centerIconSvg = `
        <g>
          ${badgeBg}
          <g transform="translate(${(centerPx - 12 * scale).toFixed(2)}, ${(
        centerPx -
        12 * scale
      ).toFixed(2)}) scale(${scale.toFixed(4)})">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#D99B26"/>
          </g>
        </g>
      `;
    } else if (iconStyle === "logo") {
      const fontSize = (badgeRadius * 0.62).toFixed(2);
      centerIconSvg = `
        <g>
          ${badgeBg}
          <text x="${centerPx.toFixed(2)}" y="${(centerPx + badgeRadius * 0.18).toFixed(
        2
      )}" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-style="italic" font-size="${fontSize}" fill="${color}">Isis</text>
        </g>
      `;
    }
  }

  const bgRect = transparentBackground
    ? ""
    : `<rect width="${sizePx}" height="${sizePx}" fill="#FFFFFF" />`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sizePx} ${sizePx}" width="${sizePx}" height="${sizePx}" shape-rendering="crispEdges">
  ${bgRect}
  <path d="${paths.join(" ")}" fill="${color}" />
  <g shape-rendering="geometricPrecision">
    ${centerIconSvg}
  </g>
</svg>`;
}

/**
 * Renderiza e faz o download do QR Code em PNG Alta Resolução (2048x2048px @ 300 DPI real)
 */
export async function downloadQrCodeHighResPng({
  value,
  color = "#000000",
  iconStyle = "coracao",
  transparentBackground = false,
  fileName = "qrcode-homenagem-2048px-300dpi.png",
}: {
  value: string;
  color?: string;
  iconStyle?: QrIconStyle;
  transparentBackground?: boolean;
  fileName?: string;
}): Promise<void> {
  const sizePx = 2048;
  const matrix = generateQrMatrixLevelH(value);
  const quietZoneModules = 4;
  const totalModules = matrix.size + quietZoneModules * 2;
  const cellSize = sizePx / totalModules;

  const canvas = document.createElement("canvas");
  canvas.width = sizePx;
  canvas.height = sizePx;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, sizePx, sizePx);

  if (!transparentBackground) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, sizePx, sizePx);
  }

  ctx.fillStyle = color;
  for (let r = 0; r < matrix.size; r++) {
    for (let c = 0; c < matrix.size; c++) {
      const isDark = Boolean(matrix.data[r * matrix.size + c]);
      if (!isDark) continue;
      if (isModuleInCenterIconZone(r, c, matrix.size, iconStyle)) continue;

      const x = Math.round((c + quietZoneModules) * cellSize);
      const y = Math.round((r + quietZoneModules) * cellSize);
      const nextX = Math.round((c + quietZoneModules + 1) * cellSize);
      const nextY = Math.round((r + quietZoneModules + 1) * cellSize);
      ctx.fillRect(x, y, nextX - x, nextY - y);
    }
  }

  if (iconStyle !== "nenhum") {
    const centerPx = sizePx / 2;
    const badgeRadius = sizePx * 0.1;
    const boxX = centerPx - badgeRadius;
    const boxY = centerPx - badgeRadius;
    const boxSize = badgeRadius * 2;
    const cornerRadius = badgeRadius * 0.36;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxSize, boxSize, cornerRadius);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.lineWidth = sizePx * 0.006;
    ctx.strokeStyle = color;
    ctx.stroke();

    if (iconStyle === "coracao") {
      const scale = (badgeRadius * 1.15) / 24;
      ctx.translate(centerPx - 12 * scale, centerPx - 12 * scale);
      ctx.scale(scale, scale);
      const heartPath = new Path2D(
        "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      );
      ctx.fillStyle = "#E05A7A";
      ctx.fill(heartPath);
    } else if (iconStyle === "estrela") {
      const scale = (badgeRadius * 1.15) / 24;
      ctx.translate(centerPx - 12 * scale, centerPx - 12 * scale);
      ctx.scale(scale, scale);
      const starPath = new Path2D(
        "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      );
      ctx.fillStyle = "#D99B26";
      ctx.fill(starPath);
    } else if (iconStyle === "logo") {
      ctx.fillStyle = color;
      ctx.font = `italic bold ${Math.round(badgeRadius * 0.62)}px Georgia, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Isis", centerPx, centerPx + badgeRadius * 0.04);
    }
    ctx.restore();
  }

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png", 1.0)
  );
  if (!blob) return;

  const rawBuffer = new Uint8Array(await blob.arrayBuffer());
  const dpiBuffer = injectPng300DpiMetadata(rawBuffer);
  const finalBlob = new Blob([dpiBuffer.buffer as ArrayBuffer], {
    type: "image/png",
  });

  const url = URL.createObjectURL(finalBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Faz o download do arquivo SVG Vetorizado puro (.svg)
 */
export function downloadQrCodeVectorSvg({
  value,
  color = "#000000",
  iconStyle = "coracao",
  transparentBackground = false,
  fileName = "qrcode-homenagem-vetor.svg",
}: {
  value: string;
  color?: string;
  iconStyle?: QrIconStyle;
  transparentBackground?: boolean;
  fileName?: string;
}): void {
  const svgContent = buildQrVectorSvgString({
    value,
    color,
    iconStyle,
    transparentBackground,
    sizePx: 2048,
  });

  const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface QrCodeStyledPreviewProps {
  value: string;
  color?: string;
  iconStyle?: QrIconStyle;
  transparentBackground?: boolean;
  className?: string;
}

export function QrCodeStyledPreview({
  value,
  color = "#000000",
  iconStyle = "coracao",
  transparentBackground = false,
  className = "w-48 h-48",
}: QrCodeStyledPreviewProps) {
  const svgMarkup = React.useMemo(
    () =>
      buildQrVectorSvgString({
        value,
        color,
        iconStyle,
        transparentBackground,
        sizePx: 512,
      }),
    [value, color, iconStyle, transparentBackground]
  );

  const dataUri = React.useMemo(
    () => `data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup)}`,
    [svgMarkup]
  );

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden select-none ${
        transparentBackground
          ? "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:10px_10px]"
          : "bg-white"
      } ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dataUri}
        alt="QR Code Personalizado Nível H"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

