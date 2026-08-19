import { createHash } from "node:crypto";

export const MAX_RESOURCE_BYTES = 25 * 1024 * 1024;

export function validatePdfResource(buffer: Buffer): { sizeBytes: number; sha256: string } {
  if (!buffer.length) throw new Error("Resource file is empty.");
  if (buffer.length > MAX_RESOURCE_BYTES) throw new Error("Resource file exceeds the 25 MB limit.");
  if (!buffer.subarray(0, 5).equals(Buffer.from("%PDF-"))) throw new Error("Resource must be a PDF file.");
  return { sizeBytes: buffer.length, sha256: createHash("sha256").update(buffer).digest("hex") };
}
