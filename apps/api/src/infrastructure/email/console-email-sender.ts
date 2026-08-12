import type { IEmailSender } from "../../domain/ports/email.port.js";

/** Dev/fallback sender: no real email provider is configured yet (RESEND_API_KEY /
 *  EMAIL_FROM_ADDRESS unset), so the OTP is logged to the server console instead of silently
 *  failing or blocking signup entirely. Swapped for ResendEmailSender automatically once those
 *  env vars are set -- see infrastructure/container.ts's createEmailSender(). */
export class ConsoleEmailSender implements IEmailSender {
  async sendOtpEmail(to: string, code: string): Promise<void> {
    console.log(`\n[dev email -- no provider configured] OTP for ${to}: ${code}\n`);
  }
}
