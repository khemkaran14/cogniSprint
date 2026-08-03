import { Router } from "express";
import { newsletterSchema } from "../lib/validation.js";
import { sendEmail } from "../lib/email.js";

export const newsletterRouter = Router();

newsletterRouter.post("/", async (req, res) => {
  const parsed = newsletterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "Invalid input.", issues: parsed.error.flatten().fieldErrors });
  }

  await sendEmail({
    to: process.env.SUPPORT_EMAIL ?? "support@cognisprint.com",
    subject: "New newsletter signup",
    text: `New newsletter signup: ${parsed.data.email}`,
  });

  res.json({ success: true });
});
