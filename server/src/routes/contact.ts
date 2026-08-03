import { Router } from "express";
import { contactSchema } from "../lib/validation.js";
import { sendEmail } from "../lib/email.js";

export const contactRouter = Router();

contactRouter.post("/", async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "Invalid input.", issues: parsed.error.flatten().fieldErrors });
  }

  if (parsed.data.website) {
    // Honeypot tripped — pretend success so bots don't learn anything.
    return res.json({ success: true });
  }

  const { name, email, topic, message } = parsed.data;

  await sendEmail({
    to: process.env.SUPPORT_EMAIL ?? "support@cognisprint.com",
    subject: `[${topic}] New contact form submission from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });

  res.json({ success: true });
});
