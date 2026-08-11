import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Entitlement } from "../models/Entitlement.js";

export const entitlementsRouter = Router();

entitlementsRouter.get("/", requireAuth, async (_req, res, next) => {
  try {
    const entitlements = await Entitlement.find({ userId: res.locals.user._id })
      .populate("productId", "name slug description")
      .sort({ grantedAt: -1 })
      .lean();
    res.json({
      entitlements: entitlements.map((item) => ({
        id: String(item._id),
        status: item.status,
        grantedAt: item.grantedAt,
        product: item.productId,
      })),
    });
  } catch (error) { next(error); }
});
