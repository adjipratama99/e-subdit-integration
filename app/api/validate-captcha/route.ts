// /api/validate-captcha.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from 'next/headers'
import { formatIp } from "@/lib/utils"

let ipAttempts: Record<string, number> = {} // Simple memory store. In prod: Redis.

export async function POST(req: NextRequest) {
  const { token } = await req.json()
  const ip = formatIp(req.headers.get('x-forwarded-for') || '')

  console.log(ip)

  // Skip if IP is invalid
  if (ip === 'unknown') return NextResponse.json({ success: false })

  // Check with Google
  const result = await fetch(`https://recaptchaenterprise.googleapis.com/v1/projects/YOUR_PROJECT_ID/assessments?key=${process.env.RECAPTCHA_SECRET}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      event: {
        token,
        siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
        expectedAction: "login"
      }
    })
  });

  const data = await result.json();

  const success = data.tokenProperties?.valid === true && data.riskAnalysis?.score > 0.5

  if (success) {
    ipAttempts[ip] = 0 // Reset on success
    return NextResponse.json({ success: true })
  } else {
    ipAttempts[ip] = (ipAttempts[ip] || 0) + 1
    return NextResponse.json({ success: false })
  }
}
