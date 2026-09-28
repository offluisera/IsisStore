/**
 * Utilitário de Conversão Client-Side de Imagens para .webp
 * Executa 100% no navegador antes do upload para economizar banda e acelerar carregamentos.
 */

export interface WebPConversionOptions {
  quality?: number; // 0.1 a 1.0 (padrão 0.85)
  maxWidth?: number; // Largura máxima para redimensionamento proporcional (ex: 2000)
  maxHeight?: number; // Altura máxima proporcional (ex: 2000)
}

export async function convertFileToWebP(
  file: File,
  options: WebPConversionOptions = {}
): Promise<File> {
  const { quality = 0.88, maxWidth = 2000, maxHeight = 2000 } = options;

  if (typeof window === "undefined") {
    return file;
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Redimensionamento proporcional inteligente caso ultrapasse resolução máxima
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      // Renderiza com interpolação suave
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // Substitui extensão por .webp
          const cleanName = file.name.replace(/\.[^/.]+$/, "");
          const webpFileName = `${cleanName}.webp`;

          const webpFile = new File([blob], webpFileName, {
            type: "image/webp",
            lastModified: Date.now(),
          });

          resolve(webpFile);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Falha ao decodificar a imagem "${file.name}".`));
    };

    img.src = objectUrl;
  });
}

/**
 * Converte um lote de arquivos para .webp concorrentemente
 */
export async function convertBatchToWebP(
  files: File[],
  options?: WebPConversionOptions
): Promise<File[]> {
  const tasks = files.map((f) => convertFileToWebP(f, options));
  return Promise.all(tasks);
}
