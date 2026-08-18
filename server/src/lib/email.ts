/**
 * Thin Resend wrapper. Falls back to logging when RESEND_API_KEY isn't set,
 * so the app degrades to an honest dev experience instead of throwing.
 */
export async function sendEmail(options: { to: string; subject: string; text: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info("[email] not sent (no RESEND_API_KEY configured):", options);
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "CogniSprint <hello@cognisprint.com>",
      to: options.to,
      subject: options.subject,
      text: options.text,
    }),
  });

  if (!response.ok) {
    console.error("[email] Resend request failed:", response.status, await response.text());
    return false;
  }
  return true;
}

export async function deliverEmail(options: { to: string; subject: string; text: string }): Promise<{ sent: boolean; providerMessageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, error: "RESEND_API_KEY is not configured" };
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.EMAIL_FROM ?? "CogniSprint <hello@cognisprint.com>", to: options.to, subject: options.subject, text: options.text }) });
  if (!response.ok) return { sent: false, error: `Resend ${response.status}: ${(await response.text()).slice(0, 300)}` };
  const data = await response.json() as { id?: string };
  return { sent: true, providerMessageId: data.id };
}
