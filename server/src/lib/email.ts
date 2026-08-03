/**
 * Thin Resend wrapper. Falls back to logging when RESEND_API_KEY isn't set,
 * so the app degrades to an honest dev experience instead of throwing.
 */
export async function sendEmail(options: { to: string; subject: string; text: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info("[email] not sent (no RESEND_API_KEY configured):", options);
    return;
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
  }
}
