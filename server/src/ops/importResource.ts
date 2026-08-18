import "dotenv/config";
import { basename, resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import { GridFSBucket, ObjectId } from "mongodb";
import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import { validatePdfResource } from "../lib/resourceFiles.js";
import { LearningResource } from "../models/LearningResource.js";
import { Product } from "../models/Product.js";

function option(name: string) { const index = process.argv.indexOf(`--${name}`); return index >= 0 ? process.argv[index + 1] : undefined; }
const file = option("file"); const productSlug = option("product"); const slug = option("slug"); const title = option("title"); const kind = option("kind"); const description = option("description");
if (!file || !productSlug || !slug || !title || !description || !["workbook", "worksheet"].includes(kind ?? "")) throw new Error("Usage: npm run resource:import -- --file <pdf> --product <slug> --slug <slug> --title <title> --kind workbook|worksheet --description <text>");

await connectDB();
try {
  const product = await Product.findOne({ slug: productSlug }).orFail(); const buffer = await readFile(resolve(file)); const metadata = validatePdfResource(buffer);
  const bucket = new GridFSBucket(mongoose.connection.db!, { bucketName: "learningResources" }); const upload = bucket.openUploadStream(basename(file), { contentType: "application/pdf", metadata: { productSlug, slug } });
  Readable.from([buffer]).pipe(upload); await finished(upload);
  const existing = await LearningResource.findOne({ slug });
  let resource;
  try {
    resource = await LearningResource.findOneAndUpdate({ slug }, { productId: product._id, slug, title, description, kind, version: (existing?.version ?? 0) + 1, gridFsFileId: upload.id, filename: basename(file), mimeType: "application/pdf", ...metadata, status: "draft", publishedAt: null, archivedAt: null, releaseNote: null, releasedBy: null }, { upsert: true, new: true, runValidators: true });
  } catch (error) { await bucket.delete(upload.id); throw error; }
  if (existing?.gridFsFileId) { try { await bucket.delete(new ObjectId(String(existing.gridFsFileId))); } catch (error) { console.warn("Old resource version could not be removed", error); } }
  console.info(JSON.stringify({ type: "learning_resource_import", id: resource._id, slug: resource.slug, version: resource.version, status: resource.status, sizeBytes: resource.sizeBytes }));
} finally { await mongoose.disconnect(); }
