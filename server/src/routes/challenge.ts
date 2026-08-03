import { Router } from "express";
import { challengeReportSchema } from "../lib/validation.js";
import { sendEmail } from "../lib/email.js";

export const challengeRouter = Router();

challengeRouter.post("/report", async (req, res) => {
  const parsed = challengeReportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "Invalid input.", issues: parsed.error.flatten().fieldErrors });
  }

  const { email, overallScore, durationSeconds } = parsed.data;

  await sendEmail({
    to: email,
    subject: "Your CogniSprint Brain Skills Snapshot",
    text: `You scored ${overallScore}/100 in ${durationSeconds} seconds. This is a practice snapshot, not an intelligence assessment. See the full curriculum: ${process.env.CLIENT_URL ?? "https://cognisprint.divyrs.com"}/brain-training-course`,
  });

  res.json({ success: true });
});
