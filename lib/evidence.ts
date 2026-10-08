export const MAX_EVIDENCE_BYTES = 25 * 1024 * 1024;

export const allowedMimeTypes = new Set([
  "image/jpeg","image/png","image/webp","video/mp4","application/pdf","text/plain"
]);

export function validateEvidenceFile(file: File) {
  if (file.size <= 0) throw new Error("EMPTY_FILE");
  if (file.size > MAX_EVIDENCE_BYTES) throw new Error("FILE_TOO_LARGE");
  if (!allowedMimeTypes.has(file.type)) throw new Error("UNSUPPORTED_FILE_TYPE");
}