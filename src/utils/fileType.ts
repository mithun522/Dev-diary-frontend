export type FilePreviewKind = "pdf" | "image" | "csv" | "text" | "other";

export const getFilePreviewKind = (
  fileName: string,
  contentType?: string
): FilePreviewKind => {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (contentType === "application/pdf" || extension === "pdf") return "pdf";
  if (contentType?.startsWith("image/") || IMAGE_EXTENSIONS.has(extension))
    return "image";
  if (contentType === "text/csv" || extension === "csv") return "csv";
  if (
    contentType?.startsWith("text/") ||
    TEXT_EXTENSIONS.has(extension)
  )
    return "text";

  return "other";
};

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg"]);
const TEXT_EXTENSIONS = new Set(["txt", "md", "markdown", "json", "log"]);

export const formatFileSize = (bytes: number): string => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const size = bytes / Math.pow(1024, exponent);
  return `${exponent === 0 ? size : size.toFixed(1)} ${units[exponent]}`;
};
