import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import { isEnrollmentOpen } from "../lib/availability.js";
import { loadContentAvailability } from "../lib/contentAvailability.js";

await connectDB();
try {
  const inventory = await loadContentAvailability(); const unsafeEnrollment = isEnrollmentOpen() && !inventory.launchContentComplete;
  console.info(JSON.stringify({ type: "content_availability_audit", enrollmentOpen: isEnrollmentOpen(), unsafeEnrollment, ...inventory }));
  if (unsafeEnrollment) { console.error("Enrollment cannot remain open while published content is below the declared launch targets."); process.exitCode = 1; }
} finally { await mongoose.disconnect(); }
