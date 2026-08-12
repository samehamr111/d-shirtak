export interface IEmailSender {
  sendOtpEmail(to: string, code: string): Promise<void>;
}
