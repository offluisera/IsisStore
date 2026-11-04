import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import os from "os";
import path from "path";

const MIME_MAP: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  m4v: "video/mp4",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  aac: "audio/aac",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

const PRESET_AUDIO_CACHE = new Map<string, Buffer>();

/**
 * Sintetizador de trilhas instrumentais afetivas em formato WAV PCM 16-bit padrão
 * para reprodução imediata em qualquer navegador (Desktop, iOS, Android) sem depender de CDN externa.
 */
function buildPresetInstrumentalWav(presetName: string): Buffer {
  const cached = PRESET_AUDIO_CACHE.get(presetName);
  if (cached) return cached;

  const sampleRate = 22050;
  const durationSeconds = 16;
  const numSamples = sampleRate * durationSeconds;
  const dataSize = numSamples * 2; // 16-bit mono = 2 bytes por sample
  const buffer = Buffer.alloc(44 + dataSize);

  // Cabeçalho RIFF WAVE padrão
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat = 1 (PCM)
  buffer.writeUInt16LE(1, 22); // NumChannels = 1
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32); // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Definição de notas e progressões harmônicas por estilo
  const progressions: Record<
    string,
    { tempoBpm: number; harmonicWeight: number; notes: number[][] }
  > = {
    "preset-caixinha-musica.wav": {
      tempoBpm: 92,
      harmonicWeight: 0.45,
      // Arpejos delicados estilo caixinha de música (C5, E5, G5, B5 / A4, C5, E5, A5 / F4, A4, C5, F5 / G4, B4, D5, G5)
      notes: [
        [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 783.99, 987.77],
        [440.0, 523.25, 659.25, 880.0, 659.25, 523.25, 659.25, 783.99],
        [349.23, 440.0, 523.25, 698.46, 523.25, 440.0, 523.25, 659.25],
        [392.0, 493.88, 587.33, 783.99, 587.33, 493.88, 587.33, 659.25],
      ],
    },
    "preset-piano-romantico.wav": {
      tempoBpm: 76,
      harmonicWeight: 0.3,
      notes: [
        [261.63, 329.63, 392.0, 523.25, 659.25, 523.25, 392.0, 329.63],
        [220.0, 261.63, 329.63, 440.0, 523.25, 440.0, 329.63, 261.63],
        [174.61, 261.63, 349.23, 440.0, 523.25, 440.0, 349.23, 261.63],
        [196.0, 246.94, 293.66, 392.0, 493.88, 392.0, 293.66, 246.94],
      ],
    },
    "preset-violao-afetivo.wav": {
      tempoBpm: 84,
      harmonicWeight: 0.55,
      notes: [
        [293.66, 369.99, 440.0, 587.33, 440.0, 369.99, 440.0, 587.33],
        [246.94, 329.63, 392.0, 493.88, 392.0, 329.63, 392.0, 493.88],
        [196.0, 293.66, 392.0, 587.33, 392.0, 293.66, 392.0, 493.88],
        [220.0, 277.18, 329.63, 440.0, 554.37, 440.0, 329.63, 277.18],
      ],
    },
    "preset-serenata-doce.wav": {
      tempoBpm: 80,
      harmonicWeight: 0.38,
      notes: [
        [349.23, 440.0, 523.25, 698.46, 880.0, 698.46, 523.25, 440.0],
        [293.66, 349.23, 440.0, 587.33, 698.46, 587.33, 440.0, 349.23],
        [233.08, 293.66, 349.23, 466.16, 587.33, 466.16, 349.23, 293.66],
        [261.63, 329.63, 392.0, 523.25, 659.25, 523.25, 392.0, 329.63],
      ],
    },
  };

  const config =
    progressions[presetName] || progressions["preset-caixinha-musica.wav"];
  const totalSteps = 32;
  const stepDuration = durationSeconds / totalSteps;

  const floatSamples = new Float32Array(numSamples);

  for (let step = 0; step < totalSteps; step++) {
    const barIdx = Math.floor(step / 8) % config.notes.length;
    const noteInBar = step % 8;
    const freq = config.notes[barIdx][noteInBar];
    const bassFreq = config.notes[barIdx][0] * 0.5;

    const startSample = Math.floor(step * stepDuration * sampleRate);
    // Sustentação suave que se sobrepõe (reverb natural)
    const noteLengthSamples = Math.floor(stepDuration * 2.6 * sampleRate);

    for (let i = 0; i < noteLengthSamples; i++) {
      const sampleIdx = startSample + i;
      if (sampleIdx >= numSamples) break;

      const t = i / sampleRate;
      const attack = Math.min(1, t / 0.018);
      const decay = Math.exp(-t * 2.4);
      const env = attack * decay;

      // Fundamental + 2º e 3º harmônicos suaves
      let signal =
        Math.sin(2 * Math.PI * freq * t) +
        config.harmonicWeight * Math.sin(2 * Math.PI * freq * 2 * t) * Math.exp(-t * 4) +
        0.15 * Math.sin(2 * Math.PI * freq * 3 * t) * Math.exp(-t * 6);

      // Nota de baixo sustentada no início de cada compasso
      if (noteInBar === 0 || noteInBar === 4) {
        signal += 0.45 * Math.sin(2 * Math.PI * bassFreq * t) * Math.exp(-t * 1.2);
      }

      floatSamples[sampleIdx] += signal * env * 0.22;
    }
  }

  // Normalização suave e escrita 16-bit signed integer
  for (let i = 0; i < numSamples; i++) {
    // Fade-in inicial e fade-out final para loop sem estalos
    let fade = 1;
    if (i < sampleRate * 0.15) {
      fade = i / (sampleRate * 0.15);
    } else if (i > numSamples - sampleRate * 0.4) {
      fade = (numSamples - i) / (sampleRate * 0.4);
    }

    const clamped = Math.max(-0.95, Math.min(0.95, floatSamples[i] * fade));
    const intVal = Math.round(clamped * 32767);
    buffer.writeInt16LE(intVal, 44 + i * 2);
  }

  PRESET_AUDIO_CACHE.set(presetName, buffer);
  return buffer;
}

function serveBufferWithRange(
  request: NextRequest,
  fileBuffer: Buffer,
  contentType: string
): NextResponse {
  const totalLength = fileBuffer.length;
  const rangeHeader = request.headers.get("range");

  if (rangeHeader) {
    const match = rangeHeader.replace(/bytes=/, "").split("-");
    const start = parseInt(match[0], 10) || 0;
    const end = match[1] ? parseInt(match[1], 10) : totalLength - 1;
    const safeStart = Math.max(0, Math.min(start, totalLength - 1));
    const safeEnd = Math.max(safeStart, Math.min(end, totalLength - 1));
    const chunkSize = safeEnd - safeStart + 1;
    const chunk = fileBuffer.subarray(safeStart, safeEnd + 1);

    return new NextResponse(new Uint8Array(chunk), {
      status: 206,
      headers: {
        "Content-Range": `bytes ${safeStart}-${safeEnd}/${totalLength}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(chunkSize),
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      "Accept-Ranges": "bytes",
      "Content-Length": String(totalLength),
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;
  const safeName = path.basename(filename);

  // 1. Verifica se é uma das trilhas instrumentais prontas da loja
  if (safeName.startsWith("preset-") && safeName.endsWith(".wav")) {
    const wavBuffer = buildPresetInstrumentalWav(safeName);
    return serveBufferWithRange(request, wavBuffer, "audio/wav");
  }

  // 2. Busca o arquivo enviado pelo Admin em public/uploads/homenagens, data/uploads/homenagens ou /tmp/homenagens
  const candidatePaths = [
    path.join(process.cwd(), "public", "uploads", "homenagens", safeName),
    path.join(process.cwd(), "data", "uploads", "homenagens", safeName),
    path.join(os.tmpdir(), "homenagens", safeName),
  ];

  for (const filePath of candidatePaths) {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const ext = (safeName.split(".").pop() || "").toLowerCase();
      const contentType = MIME_MAP[ext] || "application/octet-stream";
      return serveBufferWithRange(request, fileBuffer, contentType);
    } catch {
      // Tenta próximo caminho
    }
  }

  return NextResponse.json(
    { error: "Mídia não encontrada." },
    { status: 404 }
  );
}

