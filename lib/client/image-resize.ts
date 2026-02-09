/**
 * Resize an image file in the browser using <canvas>.
 * Returns a Blob in WebP format.
 */
export async function resizeImage(
  file: File,
  maxWidth: number,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas 2d context");
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.convertToBlob({ type: "image/webp", quality: 0.82 });
}

/**
 * Generate preview (~1600px) and thumb (~400px) variants from a file.
 */
export async function generateVariants(file: File): Promise<{
  preview: Blob;
  thumb: Blob;
}> {
  const [preview, thumb] = await Promise.all([
    resizeImage(file, 1600),
    resizeImage(file, 400),
  ]);

  return { preview, thumb };
}
