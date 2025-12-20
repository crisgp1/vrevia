import { NextRequest, NextResponse } from "next/server"
import chromium from "@sparticuz/chromium-min"
import puppeteerCore from "puppeteer-core"
import puppeteer from "puppeteer"
import { requireAdmin } from "@/lib/auth"
import connectDB from "@/lib/db/connection"
import { User, Grade, OfficialDocument } from "@/lib/db/models"
import { LEVELS } from "@/lib/constants"
import QRCode from "qrcode"
import crypto from "crypto"

export const dynamic = "force-dynamic"

const remoteExecutablePath =
  "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar"

let browser: any

async function getBrowser() {
  if (browser) return browser

  if (process.env.VERCEL_ENV === "production") {
    browser = await puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(remoteExecutablePath),
      headless: true,
    })
  } else {
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    })
  }
  return browser
}

interface RouteContext {
  params: Promise<{ studentId: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireAdmin()
    await connectDB()

    const { studentId } = await context.params
    const { searchParams } = new URL(request.url)
    const customName = searchParams.get("name") || ""
    const level = searchParams.get("level") || ""
    const issuerName = searchParams.get("issuerName") || ""
    const issuerRole = searchParams.get("issuerRole") || "director"

    if (!level) {
      return NextResponse.json({ error: "Nivel no especificado" }, { status: 400 })
    }

    const student = await User.findById(studentId).lean()
    if (!student || student.role !== "student") {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 })
    }

    const nameToUse = customName || student.name
    const issuerNameToUse = issuerName || admin.name

    const roleMap: Record<string, string> = {
      director: "Director Académico",
      coordinator: "Coordinador Académico",
      administrator: "Administrador",
    }
    const issuerRoleToUse = roleMap[issuerRole] || issuerRole

    // Get level grades
    const levelGrades = await Grade.find({
      student: studentId,
      type: "final",
    }).lean()

    // Find the grade for this level (assuming level corresponds to lesson ranges)
    const levelRanges: Record<string, number> = {
      a1: 30,
      a2: 60,
      b1: 90,
      b2: 120,
      c1: 135,
      c2: 150,
    }

    const finalLesson = levelRanges[level.toLowerCase()] || 30
    const levelGrade = levelGrades.find((g) => g.lesson === finalLesson)
    const finalScore = levelGrade?.score || 0

    // Generate verification hash
    const verificationHash = crypto.randomBytes(16).toString("hex")
    const issuedAt = new Date()

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://vrevia.com"}/verify/${verificationHash}`

    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 120,
      margin: 1,
      color: {
        dark: "#1e3a5f",
        light: "#ffffff",
      },
    })

    // Create official document record
    await OfficialDocument.create({
      student: studentId,
      documentType: "certificate",
      verificationHash,
      issuedAt,
      issuedBy: admin.id,
      metadata: {
        studentName: nameToUse,
        studentEmail: student.email,
        currentLesson: student.currentLesson,
        level: level.toUpperCase(),
        averageGrade: finalScore,
      },
      isValid: true,
    })

    const html = generateCertificateHTML({
      studentName: nameToUse,
      level: level.toUpperCase(),
      finalScore,
      qrCodeDataUrl,
      verificationHash,
      issuedAt,
      issuedBy: issuerNameToUse,
      issuedByRole: issuerRoleToUse,
    })

    const browserInstance = await getBrowser()
    const page = await browserInstance.newPage()
    await page.setContent(html, { waitUntil: "networkidle0" })

    const pdf = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: {
        top: "15mm",
        right: "15mm",
        bottom: "15mm",
        left: "15mm",
      },
    })

    await page.close()

    const fileName = `Certificate_${level.toUpperCase()}_${nameToUse.replace(/\s+/g, "_")}.pdf`

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("Error generating certificate:", error)
    return NextResponse.json(
      { error: "Error al generar el certificado" },
      { status: 500 }
    )
  }
}

function generateCertificateHTML(data: any) {
  const {
    studentName,
    level,
    finalScore,
    qrCodeDataUrl,
    verificationHash,
    issuedAt,
    issuedBy,
    issuedByRole,
  } = data

  const levelName = LEVELS[level.toLowerCase() as keyof typeof LEVELS] || level
  const formattedDate = new Date(issuedAt).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  // Level color accents
  const levelColors: Record<string, string> = {
    A1: "#0891b2",
    A2: "#059669",
    B1: "#d97706",
    B2: "#7c3aed",
    C1: "#dc2626",
    C2: "#1d4ed8",
  }

  const accentColor = levelColors[level] || "#1e3a5f"

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', sans-serif;
      background: #fff;
    }

    .page {
      width: 297mm;
      height: 210mm;
      position: relative;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .certificate {
      width: 100%;
      height: 100%;
      position: relative;
      padding: 40px 60px;
      display: flex;
      flex-direction: column;
    }

    /* Border */
    .border {
      position: absolute;
      inset: 20px;
      border: 1px solid #e5e7eb;
      pointer-events: none;
    }

    .border-inner {
      position: absolute;
      inset: 4px;
      border: 1px solid #e5e7eb;
    }

    /* Accent line */
    .accent-top {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 3px;
      background: ${accentColor};
    }

    .accent-bottom {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 3px;
      background: ${accentColor};
    }

    /* Header */
    .header {
      text-align: center;
      padding-top: 20px;
    }

    .logo {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 8px;
      color: ${accentColor};
      margin-bottom: 4px;
    }

    .tagline {
      font-size: 8px;
      letter-spacing: 3px;
      color: #9ca3af;
      text-transform: uppercase;
    }

    /* Title */
    .title-section {
      text-align: center;
      margin: 30px 0 20px;
    }

    .title {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      font-weight: 600;
      color: #1f2937;
      letter-spacing: 6px;
      margin-bottom: 8px;
    }

    .subtitle {
      font-size: 11px;
      letter-spacing: 4px;
      color: #6b7280;
      text-transform: uppercase;
    }

    /* Content */
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .intro-text {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 16px;
    }

    .student-name {
      font-family: 'Playfair Display', serif;
      font-size: 36px;
      font-weight: 500;
      color: #111827;
      margin-bottom: 20px;
      letter-spacing: 1px;
    }

    .completion-text {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 24px;
    }

    .level-badge {
      display: inline-block;
      background: ${accentColor};
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 3px;
      padding: 14px 48px;
      border-radius: 4px;
    }

    .score {
      margin-top: 16px;
      font-size: 13px;
      color: #374151;
    }

    .score strong {
      color: ${accentColor};
    }

    /* Footer */
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 0 40px 20px;
    }

    .signature-block {
      text-align: center;
      min-width: 180px;
    }

    .signature-line {
      width: 160px;
      height: 1px;
      background: #d1d5db;
      margin: 0 auto 8px;
    }

    .signature-name {
      font-size: 11px;
      font-weight: 600;
      color: #374151;
    }

    .signature-role {
      font-size: 8px;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 2px;
    }

    .date-block {
      text-align: center;
      min-width: 140px;
    }

    .date-label {
      font-size: 7px;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .date-value {
      font-size: 10px;
      color: #374151;
    }

    .qr-block {
      text-align: center;
    }

    .qr-label {
      font-size: 6px;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .qr-code {
      width: 60px;
      height: 60px;
    }

    .verify-code {
      font-size: 5px;
      color: #d1d5db;
      margin-top: 3px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="certificate">
      <div class="border"><div class="border-inner"></div></div>
      <div class="accent-top"></div>
      <div class="accent-bottom"></div>

      <div class="header">
        <div class="logo">VREVIA</div>
        <div class="tagline">Professional English Institute</div>
      </div>

      <div class="title-section">
        <div class="title">CERTIFICATE</div>
        <div class="subtitle">of Completion</div>
      </div>

      <div class="content">
        <div class="intro-text">This is to certify that</div>
        <div class="student-name">${studentName}</div>
        <div class="completion-text">has successfully completed the</div>
        <div class="level-badge">${levelName}</div>
        ${finalScore > 0 ? `<div class="score">Final Score: <strong>${finalScore}/100</strong></div>` : ''}
      </div>

      <div class="footer">
        <div class="signature-block">
          <div class="signature-line"></div>
          <div class="signature-name">${issuedBy}</div>
          <div class="signature-role">${issuedByRole}</div>
        </div>

        <div class="date-block">
          <div class="date-label">Fecha de Expedición</div>
          <div class="date-value">${formattedDate}</div>
        </div>

        <div class="qr-block">
          <div class="qr-label">Verificar</div>
          <img src="${qrCodeDataUrl}" alt="QR" class="qr-code" />
          <div class="verify-code">${verificationHash.slice(0, 12).toUpperCase()}</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `
}
