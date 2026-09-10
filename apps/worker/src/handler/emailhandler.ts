import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailHandler {
  to: string | string[];
  subject: string;
  html: string;
}

export async function emailhandler({ to, subject, html }: EmailHandler) {
  /*
   * Validate Resend configuration
   */
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!process.env.RESEND_FROM) {
    throw new Error("RESEND_FROM is not configured");
  }

  /*
   * Validate email payload
   */
  if (!to || (Array.isArray(to) && to.length === 0)) {
    throw new Error("Email recipient is required");
  }

  if (!subject?.trim()) {
    throw new Error("Email subject is required");
  }

  if (!html?.trim()) {
    throw new Error("Email HTML content is required");
  }

  /*
   * Build Resend request
   */
  const emailOptions: Parameters<typeof resend.emails.send>[0] = {
    from: process.env.RESEND_FROM,
    to,
    subject,
    html,
  };

  /*
   * Send email
   */
  const { data, error } = await resend.emails.send(emailOptions);

  /*
   * Resend returned an error
   */
  if (error) {
    throw new Error(`Email sending failed: ${error.message}`);
  }

  /*
   * Resend should return an email ID
   */
  if (!data?.id) {
    throw new Error("Email sending failed: Resend did not return an email ID");
  }

  return data;
}
