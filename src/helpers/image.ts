const SHRINK_MAX_SIDE = 2000;
const SHRINK_QUALITY = 0.85;

/**
 * A photo as a JPEG with its longest side at most `maxSide` (a phone photo is
 * 4000 px+ and several MB). Not an image (PDF), already small, or a format the
 * browser can't decode (e.g. HEIC on Chrome): the file goes as it is.
 */
export async function shrinkImage(
  file: File,
  maxSide = SHRINK_MAX_SIDE,
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.type === "image/jpeg") {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", SHRINK_QUALITY),
  );
  if (!blob) return file;
  const name = file.name.replace(/\.[^.]+$/, "") || "documento";
  return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
}
