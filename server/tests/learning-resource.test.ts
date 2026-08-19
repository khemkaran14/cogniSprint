import { describe, expect, it } from "vitest";
import { MAX_RESOURCE_BYTES, validatePdfResource } from "../src/lib/resourceFiles.js";
import { LearningResource } from "../src/models/LearningResource.js";
import { ResourceDownload } from "../src/models/ResourceDownload.js";

describe("entitlement-protected learning resources", () => {
  it("accepts bounded PDFs and computes an integrity digest", () => {
    const result = validatePdfResource(Buffer.from("%PDF-1.7\nworkbook"));
    expect(result.sizeBytes).toBe(17); expect(result.sha256).toMatch(/^[a-f\d]{64}$/);
  });
  it("rejects non-PDF and oversized assets", () => {
    expect(() => validatePdfResource(Buffer.from("not a pdf"))).toThrow(/PDF/);
    expect(() => validatePdfResource(Buffer.concat([Buffer.from("%PDF-"), Buffer.alloc(MAX_RESOURCE_BYTES)]))).toThrow(/25 MB/);
  });
  it("indexes published resources and download history", () => {
    expect(LearningResource.schema.path("kind").options.enum).toEqual(["workbook", "worksheet"]);
    expect(LearningResource.schema.indexes()).toEqual(expect.arrayContaining([[{ productId: 1, status: 1, kind: 1 }, expect.any(Object)]]));
    expect(ResourceDownload.schema.indexes()).toEqual(expect.arrayContaining([[{ userId: 1, downloadedAt: -1 }, expect.any(Object)]]));
  });
});
