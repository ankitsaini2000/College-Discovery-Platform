import { Resend } from "resend"

function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY || "")
}

const FROM_EMAIL = process.env.EMAIL_FROM || "CollegeCompass <noreply@collegecompass.app>"

export function generateVerificationToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

export function sendVerificationEmail(
  email: string,
  name: string | null,
  token: string
): Promise<boolean> {
  const baseUrl = process.env.AUTH_URL || "http://localhost:3000"
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:40px 20px">
<tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
<tr><td style="padding:40px 36px 20px;text-align:center">
<img src="${baseUrl}/logo.png" alt="CollegeCompass" width="48" height="48" style="border-radius:12px">
<h1 style="font-size:22px;color:#1a1a2e;margin:16px 0 4px">Verify your email</h1>
<p style="font-size:14px;color:#64748b;margin:0">Hi ${name || "there"}, thanks for signing up!</p>
</td></tr>
<tr><td style="padding:0 36px 20px;text-align:center">
<p style="font-size:14px;color:#475569;line-height:1.6">Please click the button below to verify your email address and activate your account.</p>
<a href="${verifyUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:10px;margin:16px 0">Verify Email</a>
<p style="font-size:13px;color:#94a3b8;margin:8px 0">Or copy this link:</p>
<p style="font-size:12px;color:#64748b;word-break:break-all;background:#f8fafc;padding:12px;border-radius:8px;border:1px solid #e2e8f0">${verifyUrl}</p>
</td></tr>
<tr><td style="padding:0 36px 24px;text-align:center">
<p style="font-size:12px;color:#94a3b8;line-height:1.5">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
</td></tr>
<tr><td style="padding:20px 36px;border-top:1px solid #e2e8f0;text-align:center">
<p style="font-size:12px;color:#94a3b8;margin:0">CollegeCompass — Find your perfect college</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`

  return getResend().emails
    .send({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify your CollegeCompass account",
      html,
    })
    .then(() => true)
    .catch((err) => {
      console.error("Failed to send verification email:", err)
      return false
    })
}
