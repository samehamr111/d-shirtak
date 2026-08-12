import type { IEmailSender } from "../../domain/ports/email.port.js";

/** Sends via Resend's HTTP API directly (no SDK dependency needed for one call). */
export class ResendEmailSender implements IEmailSender {
  constructor(
    private readonly apiKey: string,
    private readonly fromAddress: string,
  ) {}

  async sendOtpEmail(to: string, code: string): Promise<void> {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.fromAddress,
        to,
        subject: `Your D-Shirtak verification code: ${code}`,
        html: [
          `<p>Your D-Shirtak verification code is:</p>`,
          `<p style="font-size:28px;font-weight:700;letter-spacing:6px;">${code}</p>`,
          `<p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>`,
        ].join(""),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Failed to send OTP email via Resend (${res.status}): ${body}`);
    }
  }
}
