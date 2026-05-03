const MAX_DIMENSION = 1600;
const QUALITY = 0.85;

export async function compressImage(file: File | Blob, max = MAX_DIMENSION, quality = QUALITY): Promise<Blob> {
  const img = await loadImage(file);
  const { width, height } = scaleDimensions(img.width, img.height, max);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context unavailable");
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("image compression failed"))),
      "image/jpeg",
      quality
    );
  });
}

function loadImage(source: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

function scaleDimensions(w: number, h: number, max: number): { width: number; height: number } {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w / h;
  return ratio > 1
    ? { width: max, height: Math.round(max / ratio) }
    : { width: Math.round(max * ratio), height: max };
}

export function blobToObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}
