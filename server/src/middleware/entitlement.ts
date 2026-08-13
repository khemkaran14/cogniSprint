import type { NextFunction, Request, Response } from "express";
import { Entitlement } from "../models/Entitlement.js";

export async function requireActiveEntitlement(_req: Request, res: Response, next: NextFunction) {
  try {
    const entitlement = await Entitlement.findOne({ userId: res.locals.user._id, status: "active" }).lean();
    if (!entitlement) return res.status(403).json({ error: "An active course purchase is required." });
    res.locals.entitlement = entitlement;
    next();
  } catch (error) {
    next(error);
  }
}
