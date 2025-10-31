const DATA_URL_REGEX = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/i;
const MAX_BYTES = 400_000; // roughly 400 KB

export function sanitizeImageData(dataUrl) {
  if (typeof dataUrl !== "string") return null;
  const trimmed = dataUrl.trim();
  if (!DATA_URL_REGEX.test(trimmed)) return null;
  const base64 = trimmed.split(",")[1] || "";
  const byteLength = Math.ceil((base64.length * 3) / 4);
  if (byteLength > MAX_BYTES) return null;
  return trimmed;
}

export function hasSafeImage(dataUrl) {
  return Boolean(sanitizeImageData(dataUrl));
}

export function sanitizePublicImage(src) {
  if (!src) return null;
  if (src.startsWith("data:image/")) {
    return sanitizeImageData(src);
  }
  if (/^https?:\/\//i.test(src)) {
    if (src.length > 2048) return null;
    return src;
  }
  return null;
}
