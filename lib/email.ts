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
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f9;padding:48px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:20px;box-shadow:0 4px 24px rgba(0,0,0,0.06);max-width:100%">

          <!-- Header gradient bar -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);border-radius:20px 20px 0 0;padding:0">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:36px 40px 28px;text-align:center">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">
                      <tr>
                        <td style="background-color:rgba(255,255,255,0.15);border-radius:14px;padding:10px 18px 10px 14px;vertical-align:middle">
                          <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px">CollegeCompass</span>
                        </td>
                      </tr>
                    </table>
                    <h1 style="font-size:24px;font-weight:700;color:#ffffff;margin:24px 0 0;letter-spacing:-0.5px">Verify your email address</h1>
                    <p style="font-size:15px;color:rgba(255,255,255,0.8);margin:8px 0 0;line-height:1.5">Welcome to CollegeCompass, ${name || "explorer"}!</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body content -->
          <tr>
            <td style="padding:36px 40px 16px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:15px;color:#334155;line-height:1.7">
                    <p style="margin:0 0 16px">Thanks for signing up! You're just one step away from exploring <strong style="color:#1e293b">23 IITs and 31 NITs</strong> with real-time cutoffs, placements, and rankings.</p>
                    <p style="margin:0 0 20px">Click the button below to verify your account and get started:</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 20px;text-align:center">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">
                <tr>
                  <td style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);border-radius:12px;box-shadow:0 4px 14px rgba(37,99,235,0.3)">
                    <a href="${verifyUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:16px 40px;border-radius:12px;letter-spacing:0.2px">Verify Account</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alternative link -->
          <tr>
            <td style="padding:0 40px 28px;text-align:center">
              <p style="font-size:13px;color:#94a3b8;margin:0 0 8px">Button not working? Copy and paste this link in your browser:</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;max-width:100%">
                <tr>
                  <td style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 16px;word-break:break-all">
                    <a href="${verifyUrl}" target="_blank" style="color:#2563eb;font-size:13px;text-decoration:underline;word-break:break-all;line-height:1.4">${verifyUrl}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #e2e8f0;height:1px;line-height:1px">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 32px;text-align:center">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">
                <tr>
                  <td style="padding:0 4px">
                    <a href="${baseUrl}/colleges" target="_blank" style="color:#64748b;font-size:12px;text-decoration:none;padding:0 8px">Browse Colleges</a>
                  </td>
                  <td style="padding:0 4px;color:#cbd5e1">&#183;</td>
                  <td style="padding:0 4px">
                    <a href="${baseUrl}/predict" target="_blank" style="color:#64748b;font-size:12px;text-decoration:none;padding:0 8px">JEE Predictor</a>
                  </td>
                  <td style="padding:0 4px;color:#cbd5e1">&#183;</td>
                  <td style="padding:0 4px">
                    <a href="${baseUrl}/compare" target="_blank" style="color:#64748b;font-size:12px;text-decoration:none;padding:0 8px">Compare</a>
                  </td>
                </tr>
              </table>
              <p style="font-size:12px;color:#94a3b8;margin:16px 0 0;line-height:1.5">This link expires in <strong style="color:#64748b">24 hours</strong>. If you didn't create this account, please ignore this email.</p>
              <p style="font-size:11px;color:#cbd5e1;margin:12px 0 0">&copy; 2024 CollegeCompass. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
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
