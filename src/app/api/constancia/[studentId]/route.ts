import { NextRequest, NextResponse } from "next/server"
import chromium from "@sparticuz/chromium-min"
import puppeteerCore from "puppeteer-core"
import puppeteer from "puppeteer"
import { requireAdmin } from "@/lib/auth"
import connectDB from "@/lib/db/connection"
import { User, Grade, Attendance, OfficialDocument } from "@/lib/db/models"
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
    // Verify admin
    const admin = await requireAdmin()
    await connectDB()

    const { studentId } = await context.params
    const { searchParams } = new URL(request.url)
    const customName = searchParams.get("name") || ""
    const customPhone = searchParams.get("phone") || ""
    const addressee = searchParams.get("addressee") || "A QUIEN CORRESPONDA"
    const gender = searchParams.get("gender") || "male" // male or female
    const issuerName = searchParams.get("issuerName") || ""
    const issuerRole = searchParams.get("issuerRole") || "director"

    // Get student data
    const student = await User.findById(studentId).populate("group").lean()
    if (!student || student.role !== "student") {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 })
    }

    // Use custom values if provided
    const nameToUse = customName || student.name
    const phoneToUse = customPhone || student.phone || ""
    const issuerNameToUse = issuerName || admin.name

    // Map role codes to Spanish titles
    const roleMap: Record<string, string> = {
      director: "Director Académico",
      coordinator: "Coordinador Académico",
      administrator: "Administrador",
    }
    const issuerRoleToUse = roleMap[issuerRole] || issuerRole // If custom, use as-is

    // Get grades and attendance
    const [grades, attendance] = await Promise.all([
      Grade.find({ student: studentId }).sort({ lesson: 1 }).lean(),
      Attendance.find({ student: studentId }).sort({ lesson: 1 }).lean(),
    ])

    // Calculate statistics
    const completedLessons = student.currentLesson - 1
    const totalProgress = Math.round((completedLessons / 150) * 100)

    const classGrades = grades.filter((g) => g.type === "class")
    const averageGrade =
      classGrades.length > 0
        ? Math.round(classGrades.reduce((sum, g) => sum + g.score, 0) / classGrades.length)
        : 0

    const attendedCount = attendance.filter((a) => a.attended).length
    const totalAttendance = attendance.length
    const attendancePercentage =
      totalAttendance > 0 ? Math.round((attendedCount / totalAttendance) * 100) : 0

    // Generate unique verification hash
    const verificationHash = crypto.randomBytes(16).toString("hex")
    const issuedAt = new Date()

    // Create verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://vrevia.com"}/verify/${verificationHash}`

    // Generate QR code as data URL
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
        level: student.level,
        averageGrade,
        totalProgress,
        attendancePercentage,
      },
      isValid: true,
    })

    // Generate HTML
    const html = generateConstanciaHTML({
      studentName: nameToUse,
      studentEmail: student.email,
      studentPhone: phoneToUse,
      level: student.level,
      currentLesson: student.currentLesson,
      completedLessons,
      totalProgress,
      averageGrade,
      attendancePercentage,
      addressee,
      qrCodeDataUrl,
      verificationHash,
      issuedAt,
      issuedBy: issuerNameToUse,
      issuedByRole: issuerRoleToUse,
      startDate: student.startDate,
      gender,
    })

    // Generate PDF
    const browserInstance = await getBrowser()
    const page = await browserInstance.newPage()
    await page.setContent(html, { waitUntil: "networkidle0" })

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "25mm",
        right: "20mm",
        bottom: "25mm",
        left: "20mm",
      },
    })

    await page.close()

    const fileName = `Constancia_${nameToUse.replace(/\s+/g, "_")}.pdf`

    // Return PDF
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("Error generating constancia:", error)
    return NextResponse.json(
      { error: "Error al generar la constancia" },
      { status: 500 }
    )
  }
}

function generateConstanciaHTML(data: any) {
  const {
    studentName,
    studentEmail,
    studentPhone,
    level,
    currentLesson,
    completedLessons,
    totalProgress,
    averageGrade,
    attendancePercentage,
    addressee,
    qrCodeDataUrl,
    verificationHash,
    issuedAt,
    issuedBy,
    issuedByRole = "Director Académico",
    startDate,
    gender = "male",
  } = data

  const levelName = level ? LEVELS[level as keyof typeof LEVELS] : "Sin asignar"
  const formattedDate = new Date(issuedAt).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const formattedStartDate = startDate
    ? new Date(startDate).toLocaleDateString("es-MX", {
        month: "long",
        year: "numeric",
      })
    : "la fecha de inicio"

  // Gender-specific pronouns
  const enrolled = gender === "male" ? "inscrito" : "inscrita"
  const article = gender === "male" ? "el" : "la"
  const studentLabel = gender === "male" ? "el estudiante" : "la estudiante"
  const interested = gender === "male" ? "al interesado" : "a la interesada"

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', sans-serif;
      color: #374151;
      line-height: 1.7;
      background: #fff;
      font-size: 11px;
    }

    .page {
      width: 210mm;
      height: 297mm;
      padding: 50px 60px;
      display: flex;
      flex-direction: column;
    }

    /* Header */
    .header {
      text-align: center;
      padding-bottom: 24px;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 24px;
    }

    .logo {
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 6px;
      color: #1e3a5f;
      margin-bottom: 4px;
    }

    .tagline {
      font-size: 8px;
      letter-spacing: 2px;
      color: #9ca3af;
      text-transform: uppercase;
    }

    /* Document title */
    .doc-title {
      text-align: center;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 3px;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    /* Meta info */
    .meta {
      text-align: right;
      font-size: 10px;
      color: #9ca3af;
      margin-bottom: 20px;
    }

    .addressee {
      font-size: 11px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 20px;
    }

    /* Body */
    .body {
      flex: 1;
    }

    .body p {
      margin-bottom: 14px;
      text-align: justify;
    }

    .name {
      font-weight: 600;
      color: #1e3a5f;
    }

    .highlight {
      font-weight: 500;
      color: #1e3a5f;
    }

    /* Stats */
    .stats {
      margin: 20px 0;
      padding: 16px;
      background: #f9fafb;
      border-left: 3px solid #1e3a5f;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
    }

    .stat-label {
      font-size: 10px;
      color: #6b7280;
    }

    .stat-value {
      font-size: 10px;
      font-weight: 600;
      color: #1e3a5f;
    }

    /* Signature */
    .signature {
      margin-top: 40px;
      text-align: center;
    }

    .sig-line {
      width: 180px;
      height: 1px;
      background: #d1d5db;
      margin: 0 auto 10px;
    }

    .sig-name {
      font-size: 12px;
      font-weight: 600;
      color: #374151;
    }

    .sig-role {
      font-size: 9px;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 2px;
    }

    /* Footer */
    .footer {
      margin-top: 30px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-info {
      flex: 1;
    }

    .footer-text {
      font-size: 7px;
      color: #9ca3af;
    }

    .verify-code {
      font-size: 6px;
      color: #d1d5db;
      font-family: monospace;
      margin-top: 2px;
    }

    .qr {
      text-align: center;
    }

    .qr-label {
      font-size: 6px;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .qr img {
      width: 50px;
      height: 50px;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo">VREVIA</div>
      <div class="tagline">Professional English Institute</div>
    </div>

    <div class="doc-title">Constancia de Estudios</div>

    <div class="meta">${formattedDate}</div>

    <div class="addressee">${addressee}</div>

    <div class="body">
      <p>
        Por medio de la presente, <strong>VREVIA Professional English Institute</strong> hace constar que
        <span class="name">${studentName}</span>, con correo electrónico ${studentEmail}${studentPhone ? `, teléfono ${studentPhone}` : ''},
        se encuentra <strong>${enrolled}</strong> en nuestro programa de inglés profesional desde ${formattedStartDate}.
      </p>

      <p>
        ${article.charAt(0).toUpperCase() + article.slice(1)} estudiante actualmente cursa <span class="highlight">${levelName}</span>
        y ha completado <span class="highlight">${completedLessons} de 150 lecciones</span>
        del programa completo, representando un avance del <span class="highlight">${totalProgress}%</span>.
      </p>

      <div class="stats">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Nivel actual</span>
            <span class="stat-value">${levelName}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Lección actual</span>
            <span class="stat-value">${currentLesson} / 150</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Promedio académico</span>
            <span class="stat-value">${averageGrade} / 100</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Asistencia</span>
            <span class="stat-value">${attendancePercentage}%</span>
          </div>
        </div>
      </div>

      <p>
        Durante su trayectoria académica en nuestra institución, ${studentLabel} ha demostrado
        ${averageGrade >= 80 ? 'un excelente' : averageGrade >= 70 ? 'un buen' : 'un'} desempeño académico.
      </p>

      <p>
        Se extiende la presente constancia para los fines que ${interested} convengan.
      </p>
    </div>

    <div class="signature">
      <div class="sig-line"></div>
      <div class="sig-name">${issuedBy}</div>
      <div class="sig-role">${issuedByRole}</div>
    </div>

    <div class="footer">
      <div class="footer-info">
        <div class="footer-text">Documento oficial verificable en vrevia.com</div>
        <div class="verify-code">${verificationHash.toUpperCase()}</div>
      </div>
      <div class="qr">
        <div class="qr-label">Verificar</div>
        <img src="${qrCodeDataUrl}" alt="QR" />
      </div>
    </div>
  </div>
</body>
</html>
  `
}
