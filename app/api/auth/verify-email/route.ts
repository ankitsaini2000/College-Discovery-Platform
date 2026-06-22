export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")

  if (!token) {
    return new Response(
      "<html><body style='font-family:sans-serif;text-align:center;padding:80px 20px'><h1 style='color:#dc2626'>Invalid verification link</h1><p>No verification token provided.</p></body></html>",
      { status: 400, headers: { "Content-Type": "text/html" } }
    )
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!verificationToken) {
    return new Response(
      "<html><body style='font-family:sans-serif;text-align:center;padding:80px 20px'><h1 style='color:#dc2626'>Invalid or expired link</h1><p>This verification token does not exist.</p></body></html>",
      { status: 400, headers: { "Content-Type": "text/html" } }
    )
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } })
    return new Response(
      "<html><body style='font-family:sans-serif;text-align:center;padding:80px 20px'><h1 style='color:#dc2626'>Link expired</h1><p>This verification link has expired. Please sign up again to receive a new link.</p></body></html>",
      { status: 400, headers: { "Content-Type": "text/html" } }
    )
  }

  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  })

  await prisma.verificationToken.delete({ where: { token } })

  return new Response(
    `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:80px 20px">
<tr><td align="center">
<table role="presentation" width="420" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
<tr><td style="padding:48px 36px;text-align:center">
<div style="width:56px;height:56px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
</div>
<h1 style="font-size:22px;color:#1a1a2e;margin:0 0 8px">Email verified!</h1>
<p style="font-size:14px;color:#64748b;line-height:1.6;margin:0 0 24px">Your account is now active. You can log in with your email and password.</p>
<a href="${process.env.AUTH_URL || "http://localhost:3000"}/login" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:10px">Go to Login</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`,
    { status: 200, headers: { "Content-Type": "text/html" } }
  )
}
