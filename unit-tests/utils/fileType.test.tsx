import { getFilePreviewKind, formatFileSize } from "../../src/utils/fileType";

describe("getFilePreviewKind", () => {
  test("detects pdf by content type", () => {
    expect(getFilePreviewKind("report", "application/pdf")).toBe("pdf");
  });

  test("detects pdf by extension when content type is absent", () => {
    expect(getFilePreviewKind("report.pdf")).toBe("pdf");
  });

  test("detects image by content type prefix", () => {
    expect(getFilePreviewKind("photo", "image/png")).toBe("image");
  });

  test("detects image by extension (png/jpg/jpeg/gif/webp/svg)", () => {
    for (const ext of ["png", "jpg", "jpeg", "gif", "webp", "svg"]) {
      expect(getFilePreviewKind(`file.${ext}`)).toBe("image");
    }
  });

  test("detects csv by content type", () => {
    expect(getFilePreviewKind("data", "text/csv")).toBe("csv");
  });

  test("detects csv by extension", () => {
    expect(getFilePreviewKind("data.csv")).toBe("csv");
  });

  test("detects text by content type prefix (excluding csv, already handled)", () => {
    expect(getFilePreviewKind("notes", "text/plain")).toBe("text");
  });

  test("detects text by extension (txt/md/markdown/json/log)", () => {
    for (const ext of ["txt", "md", "markdown", "json", "log"]) {
      expect(getFilePreviewKind(`file.${ext}`)).toBe("text");
    }
  });

  test("falls back to 'other' for an unrecognized extension/content type", () => {
    expect(getFilePreviewKind("archive.zip", "application/zip")).toBe("other");
  });

  test("falls back to 'other' for a file name with no extension", () => {
    expect(getFilePreviewKind("README")).toBe("other");
  });

  test("is case-insensitive on extension", () => {
    expect(getFilePreviewKind("PHOTO.PNG")).toBe("image");
  });

  test("content type takes priority when extension disagrees", () => {
    expect(getFilePreviewKind("mystery.zip", "application/pdf")).toBe("pdf");
  });
});

describe("formatFileSize", () => {
  test("returns '0 B' for 0 bytes", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });

  test("formats bytes below 1024 as whole bytes", () => {
    expect(formatFileSize(512)).toBe("512 B");
  });

  test("formats kilobytes with one decimal place", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });

  test("formats megabytes with one decimal place", () => {
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB");
  });

  test("formats gigabytes with one decimal place", () => {
    expect(formatFileSize(2 * 1024 * 1024 * 1024)).toBe("2.0 GB");
  });

  test("clamps anything at or above the largest unit to GB rather than throwing", () => {
    expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toMatch(/ GB$/);
  });
});
