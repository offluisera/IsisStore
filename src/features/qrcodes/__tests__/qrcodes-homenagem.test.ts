import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generateHashAcesso,
  generateChaveSeguranca,
  verifyChaveSeguranca,
} from "@/lib/qrcodes/qrcode-store";
import {
  buildQrHomenagemPath,
  buildQrHomenagemFullUrl,
  extractYouTubeVideoId,
  extractVimeoVideoId,
  PRESET_AUDIO_TRACKS,
} from "@/lib/qrcodes/types";
import { saveQrHomenagemSchema } from "@/schemas/qrcode";
import {
  generateQrMatrixLevelH,
  buildQrVectorSvgString,
} from "@/components/admin/qrcodes/qr-code-renderer";

describe("Módulo QR Codes Personalizados para Presentes & Estamparia", () => {
  it("deve gerar hash_acesso UUID v4 não sequencial e chave_seguranca única", () => {
    const hash1 = generateHashAcesso();
    const hash2 = generateHashAcesso();
    const key1 = generateChaveSeguranca();
    const key2 = generateChaveSeguranca();

    assert.notEqual(hash1, hash2);
    assert.match(
      hash1,
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    assert.equal(key1.length, 10);
    assert.notEqual(key1, key2);
  });

  it("deve validar corretamente a chave_seguranca (?k=) e bloquear acessos sem chave ou com chave incorreta", () => {
    const secret = generateChaveSeguranca();
    assert.equal(verifyChaveSeguranca(secret, secret), true);
    assert.equal(verifyChaveSeguranca(secret, `${secret}x`), false);
    assert.equal(verifyChaveSeguranca(secret, "chaveerrada"), false);
    assert.equal(verifyChaveSeguranca(secret, null), false);
    assert.equal(verifyChaveSeguranca(secret, ""), false);
  });

  it("deve construir o link privado exclusivo /homenagem/:hash?k=:chave corretamente", () => {
    const hash = "a8f9d2e1-4b7c-49a3-9e21-7c6d5a4b3f10";
    const key = "vm2026k9";
    const path = buildQrHomenagemPath(hash, key);
    const fullUrl = buildQrHomenagemFullUrl(hash, key, "https://isisstore.com.br");

    assert.equal(
      path,
      "/homenagem/a8f9d2e1-4b7c-49a3-9e21-7c6d5a4b3f10?k=vm2026k9"
    );
    assert.equal(
      fullUrl,
      "https://isisstore.com.br/homenagem/a8f9d2e1-4b7c-49a3-9e21-7c6d5a4b3f10?k=vm2026k9"
    );
  });

  it("deve validar os dados completos da homenagem com texto, emojis, fotos, vídeo e áudio", () => {
    const validPayload = {
      identificacao_pedido: "Pedido #1042 - Caneca Vó Maria",
      titulo_homenagem: "Para Sempre em Nossos Corações",
      nome_homenageado: "Vó Maria",
      mensagem_texto: "Querida Vó Maria,\nTe amamos muito! ❤️✨🌹",
      foto_principal: "/uploads/homenagens/foto-1.jpg",
      galeria_fotos: [
        "/uploads/homenagens/galeria-1.jpg",
        "/uploads/homenagens/galeria-2.jpg",
      ],
      arquivo_video: "/uploads/homenagens/video-1.mp4",
      arquivo_audio: "/uploads/homenagens/musica-1.mp3",
      estilo_icone_qr: "coracao" as const,
      cor_qr: "#5C1D2E",
    };

    const parsed = saveQrHomenagemSchema.safeParse(validPayload);
    assert.equal(parsed.success, true);
  });

  it("deve gerar matriz QR Code Nível H (30%) e exportar SVG vetorizado em 2048x2048px", () => {
    const url =
      "https://isisstore.com.br/homenagem/a8f9d2e1-4b7c-49a3-9e21-7c6d5a4b3f10?k=vm2026k9";
    const matrix = generateQrMatrixLevelH(url);
    assert.ok(matrix.size >= 29);

    const svgWithHeart = buildQrVectorSvgString({
      value: url,
      color: "#000000",
      iconStyle: "coracao",
      transparentBackground: false,
      sizePx: 2048,
    });

    assert.ok(svgWithHeart.includes('viewBox="0 0 2048 2048"'));
    assert.ok(svgWithHeart.includes('fill="#E05A7A"'));
    assert.ok(svgWithHeart.includes('fill="#FFFFFF"'));

    const svgTransparentNoIcon = buildQrVectorSvgString({
      value: url,
      color: "#5C1D2E",
      iconStyle: "nenhum",
      transparentBackground: true,
      sizePx: 2048,
    });

    assert.ok(svgTransparentNoIcon.includes('fill="#5C1D2E"'));
    assert.ok(!svgTransparentNoIcon.includes('<rect width="2048" height="2048" fill="#FFFFFF" />'));
  });

  it("deve extrair IDs do YouTube/Vimeo e fornecer trilhas instrumentais pré-configuradas", () => {
    assert.equal(
      extractYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
      "dQw4w9WgXcQ"
    );
    assert.equal(
      extractYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ?si=123"),
      "dQw4w9WgXcQ"
    );
    assert.equal(
      extractYouTubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
      "dQw4w9WgXcQ"
    );
    assert.equal(
      extractVimeoVideoId("https://vimeo.com/76979871"),
      "76979871"
    );
    assert.equal(PRESET_AUDIO_TRACKS.length, 4);
    assert.ok(
      PRESET_AUDIO_TRACKS.every((track) =>
        track.url.startsWith("/api/media/homenagens/preset-")
      )
    );
  });
});

