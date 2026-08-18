import { GridFSBucket, ObjectId } from "mongodb";
import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { Entitlement } from "../models/Entitlement.js";
import { LearningResource } from "../models/LearningResource.js";
import { ResourceDownload } from "../models/ResourceDownload.js";

export const resourcesRouter = Router();
resourcesRouter.use(requireAuth);

resourcesRouter.get("/", async (_req, res, next) => {
  try {
    const entitlements = await Entitlement.find({ userId: res.locals.user._id, status: "active" }).select("productId").lean();
    const resources = await LearningResource.find({ productId: { $in: entitlements.map((item) => item.productId) }, status: "published" }).select("slug title description kind version filename sizeBytes publishedAt").sort({ kind: 1, title: 1 }).lean();
    res.json({ resources });
  } catch (error) { next(error); }
});

resourcesRouter.get("/:slug/download", async (req, res, next) => {
  try {
    const resource = await LearningResource.findOne({ slug: req.params.slug, status: "published" }).lean();
    if (!resource) return res.status(404).json({ error: "Resource not found." });
    const entitlement = await Entitlement.findOne({ userId: res.locals.user._id, productId: resource.productId, status: "active" }).lean();
    if (!entitlement) return res.status(403).json({ error: "An active purchase for this resource is required." });
    await ResourceDownload.create({ resourceId: resource._id, userId: res.locals.user._id, entitlementId: entitlement._id, resourceVersion: resource.version, ipAddress: req.ip || "Unknown", userAgent: req.get("user-agent")?.slice(0, 500) });
    res.setHeader("Content-Type", resource.mimeType);
    res.setHeader("Content-Length", String(resource.sizeBytes));
    res.setHeader("Content-Disposition", `attachment; filename="${resource.filename.replace(/[^a-zA-Z0-9._-]/g, "-")}"`);
    res.setHeader("Cache-Control", "private, no-store");
    const bucket = new GridFSBucket(mongoose.connection.db!, { bucketName: "learningResources" });
    bucket.openDownloadStream(new ObjectId(String(resource.gridFsFileId))).on("error", next).pipe(res);
  } catch (error) { next(error); }
});
