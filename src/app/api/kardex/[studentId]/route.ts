import { NextRequest, NextResponse } from "next/server"
import chromium from "@sparticuz/chromium-min"
import puppeteerCore from "puppeteer-core"
import puppeteer from "puppeteer"
import { requireAdmin } from "@/lib/auth"
import connectDB from "@/lib/db/connection"
import { User, Grade, Attendance, OfficialDocument } from "@/lib/db/models"
import { LEVELS, LEVEL_DETAILS, CURRICULUM } from "@/lib/constants"
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
    const type = searchParams.get("type") || "unofficial" // official or unofficial
    const customName = searchParams.get("name") || ""
    const customPhone = searchParams.get("phone") || ""
    const addressee = searchParams.get("addressee") || ""

    // Get student data
    const student = await User.findById(studentId).populate("group").lean()
    if (!student || student.role !== "student") {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 })
    }

    // Use custom values if provided, otherwise use student's data
    const nameToUse = customName || student.name
    const phoneToUse = customPhone || student.phone || "—"

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

    let qrCodeDataUrl = ""
    let verificationHash = ""
    let issuedAt = new Date()

    // For official documents, generate QR code and create database record
    if (type === "official") {
      // Generate unique verification hash
      verificationHash = crypto.randomBytes(16).toString("hex")

      // Create verification URL
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://vrevia.com"}/verify/${verificationHash}`

      // Generate QR code as data URL
      qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 150,
        margin: 1,
        color: {
          dark: "#1e3a5f",
          light: "#ffffff",
        },
      })

      // Create official document record
      await OfficialDocument.create({
        student: studentId,
        documentType: "kardex",
        verificationHash,
        issuedAt,
        issuedBy: admin.id,
        metadata: {
          studentName: student.name,
          studentEmail: student.email,
          currentLesson: student.currentLesson,
          level: student.level,
          averageGrade,
          totalProgress,
          attendancePercentage,
        },
        isValid: true,
      })
    }

    // Generate HTML
    const html = generateKardexHTML({
      student,
      grades,
      attendance,
      completedLessons,
      totalProgress,
      averageGrade,
      attendancePercentage,
      type,
      qrCodeDataUrl,
      verificationHash,
      issuedAt,
      issuedBy: admin.name,
      studentName: nameToUse,
      phone: phoneToUse,
      addressee,
    })

    // Generate PDF
    const browserInstance = await getBrowser()
    const page = await browserInstance.newPage()
    await page.setContent(html, { waitUntil: "networkidle0" })

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
    })

    await page.close()

    const fileName = type === "official"
      ? `Kardex_Oficial_${student.name.replace(/\s+/g, "_")}.pdf`
      : `Kardex_${student.name.replace(/\s+/g, "_")}.pdf`

    // Return PDF
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("Error generating kardex:", error)
    return NextResponse.json(
      { error: "Error al generar el kardex" },
      { status: 500 }
    )
  }
}

function generateKardexHTML(data: any) {
  const {
    student,
    grades,
    attendance,
    completedLessons,
    totalProgress,
    averageGrade,
    attendancePercentage,
    type = "unofficial",
    qrCodeDataUrl = "",
    verificationHash = "",
    issuedAt = new Date(),
    issuedBy = "",
    studentName = "",
    phone = "",
    addressee = "",
  } = data

  const levelName = student.level ? LEVELS[student.level as keyof typeof LEVELS] : "Sin asignar"
  const isOfficial = type === "official"
  const formattedDate = new Date(issuedAt).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  // Limit grades and attendance to fit on one page (max 15 each)
  const displayGrades = grades.slice(-15)
  const displayAttendance = attendance.slice(-10)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', sans-serif;
      color: #374151;
      background: #fff;
      font-size: 9px;
    }

    .page {
      width: 210mm;
      height: 297mm;
      padding: 30px 40px;
      display: flex;
      flex-direction: column;
    }

    /* Watermark */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 48px;
      font-weight: 700;
      color: rgba(220, 38, 38, 0.06);
      pointer-events: none;
      white-space: nowrap;
      letter-spacing: 4px;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 12px;
      border-bottom: 2px solid #1e3a5f;
      margin-bottom: 16px;
    }

    .logo-section {
      display: flex;
      flex-direction: column;
    }

    .logo {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 4px;
      color: #1e3a5f;
    }

    .tagline {
      font-size: 7px;
      letter-spacing: 1.5px;
      color: #9ca3af;
      text-transform: uppercase;
    }

    .doc-info {
      text-align: right;
    }

    .doc-title {
      font-size: 12px;
      font-weight: 600;
      color: #1e3a5f;
      letter-spacing: 2px;
    }

    .doc-date {
      font-size: 8px;
      color: #9ca3af;
      margin-top: 2px;
    }

    /* Student info */
    .student-section {
      margin-bottom: 14px;
    }

    .student-name {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 8px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      padding: 10px;
      background: #f9fafb;
      border-left: 3px solid #1e3a5f;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .info-label {
      font-size: 6px;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 9px;
      font-weight: 500;
      color: #374151;
    }

    /* Stats */
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }

    .stat {
      text-align: center;
      padding: 10px;
      background: #f9fafb;
      border-radius: 4px;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 700;
      color: #1e3a5f;
    }

    .stat-label {
      font-size: 7px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Tables */
    .section {
      margin-bottom: 12px;
    }

    .section-title {
      font-size: 8px;
      font-weight: 600;
      color: #1e3a5f;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e5e7eb;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      padding: 4px 6px;
      text-align: left;
      font-size: 6px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    td {
      padding: 4px 6px;
      font-size: 8px;
      color: #374151;
      border-bottom: 1px solid #f3f4f6;
    }

    .badge {
      display: inline-block;
      padding: 1px 4px;
      border-radius: 2px;
      font-size: 6px;
      font-weight: 600;
    }

    .badge-pass { background: #dcfce7; color: #166534; }
    .badge-fail { background: #fee2e2; color: #991b1b; }
    .badge-attended { background: #dbeafe; color: #1e40af; }
    .badge-absent { background: #fef3c7; color: #92400e; }
    .badge-absent-unjust { background: #fee2e2; color: #991b1b; }
    .badge-type { background: #f3f4f6; color: #374151; }
    .badge-extra { background: #fef3c7; color: #92400e; }

    .more-records {
      text-align: center;
      padding: 4px;
      font-size: 7px;
      color: #9ca3af;
      font-style: italic;
    }

    /* Footer */
    .footer {
      margin-top: auto;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .footer-left {
      flex: 1;
    }

    .footer-text {
      font-size: 7px;
      color: #9ca3af;
    }

    .footer-warning {
      font-size: 7px;
      color: #dc2626;
      font-weight: 500;
      margin-top: 4px;
    }

    .verify-code {
      font-size: 5px;
      color: #d1d5db;
      font-family: monospace;
      margin-top: 2px;
    }

    .signature {
      text-align: center;
      min-width: 140px;
    }

    .sig-line {
      width: 120px;
      height: 1px;
      background: #d1d5db;
      margin: 0 auto 6px;
    }

    .sig-name {
      font-size: 9px;
      font-weight: 600;
      color: #374151;
    }

    .sig-role {
      font-size: 7px;
      color: #9ca3af;
    }

    .qr {
      text-align: center;
    }

    .qr-label {
      font-size: 5px;
      color: #9ca3af;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .qr img {
      width: 50px;
      height: 50px;
    }
  </style>
</head>
<body>
  ${!isOfficial ? '<div class="watermark">SIN VALIDEZ OFICIAL</div>' : ''}

  <div class="page">
    <div class="header">
      <div class="logo-section">
        <div class="logo">VREVIA</div>
        <div class="tagline">Professional English Institute</div>
      </div>
      <div class="doc-info">
        <div class="doc-title">KARDEX ACADÉMICO</div>
        <div class="doc-date">${formattedDate}</div>
      </div>
    </div>

    ${addressee ? `<div style="font-size: 9px; color: #6b7280; margin-bottom: 12px;">${addressee}</div>` : ''}

    <div class="student-section">
      <div class="student-name">${studentName.toUpperCase()}</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">ID</span>
          <span class="info-value">${student._id.toString().slice(-8).toUpperCase()}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Email</span>
          <span class="info-value">${student.email}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Teléfono</span>
          <span class="info-value">${phone}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Grupo</span>
          <span class="info-value">${student.group?.name || "Individual"}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Nivel</span>
          <span class="info-value">${levelName}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Lección</span>
          <span class="info-value">${student.currentLesson} / 150</span>
        </div>
        <div class="info-item">
          <span class="info-label">Tipo</span>
          <span class="info-value">${student.classType === "group" ? "Grupal" : "Individual"}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Estado</span>
          <span class="info-value">${student.isActive ? "Activo" : "Inactivo"}</span>
        </div>
      </div>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-value">${totalProgress}%</div>
        <div class="stat-label">Avance</div>
      </div>
      <div class="stat">
        <div class="stat-value">${averageGrade}</div>
        <div class="stat-label">Promedio</div>
      </div>
      <div class="stat">
        <div class="stat-value">${attendancePercentage}%</div>
        <div class="stat-label">Asistencia</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Historial de Calificaciones</div>
      <table>
        <thead>
          <tr>
            <th style="width: 8%;">#</th>
            <th style="width: 32%;">Tema</th>
            <th style="width: 15%;">Tipo</th>
            <th style="width: 15%;">Calif.</th>
            <th style="width: 15%;">Estado</th>
            <th style="width: 15%;">Fecha</th>
          </tr>
        </thead>
        <tbody>
          ${displayGrades.length === 0
            ? '<tr><td colspan="6" style="text-align: center; padding: 8px; color: #9ca3af;">Sin calificaciones registradas</td></tr>'
            : displayGrades.map((grade: any) => {
                const lessonData = CURRICULUM[grade.lesson - 1]
                const isPassing = grade.score >= 70
                const typeLabel = grade.type === "class" ? "Clase" : grade.type === "assessment" ? "Eval" : "Final"

                return `
                  <tr>
                    <td style="font-weight: 600;">${grade.lesson}</td>
                    <td style="font-size: 7px;">${(lessonData?.grammar || "—").substring(0, 30)}${(lessonData?.grammar || "").length > 30 ? "..." : ""}</td>
                    <td><span class="badge badge-type">${typeLabel}</span>${grade.isExtraordinary ? ' <span class="badge badge-extra">EXT</span>' : ""}</td>
                    <td style="font-weight: 600;">${grade.score}/${grade.maxScore}</td>
                    <td><span class="badge ${isPassing ? "badge-pass" : "badge-fail"}">${isPassing ? "Aprob" : "Reprob"}</span></td>
                    <td>${new Date(grade.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "2-digit" })}</td>
                  </tr>
                `
              }).join("")
          }
        </tbody>
      </table>
      ${grades.length > 15 ? `<div class="more-records">Mostrando últimas 15 de ${grades.length} calificaciones</div>` : ''}
    </div>

    <div class="section">
      <div class="section-title">Registro de Asistencia</div>
      <table>
        <thead>
          <tr>
            <th style="width: 10%;">#</th>
            <th style="width: 40%;">Tema</th>
            <th style="width: 20%;">Estado</th>
            <th style="width: 15%;">Fecha</th>
            <th style="width: 15%;">Notas</th>
          </tr>
        </thead>
        <tbody>
          ${displayAttendance.length === 0
            ? '<tr><td colspan="5" style="text-align: center; padding: 8px; color: #9ca3af;">Sin registros de asistencia</td></tr>'
            : displayAttendance.map((att: any) => {
                const lessonData = CURRICULUM[att.lesson - 1]
                const statusLabel =
                  att.status === "attended" ? "Asistió" :
                  att.status === "absent_justified" ? "Justificada" :
                  "Falta"
                const statusBadge =
                  att.status === "attended" ? "badge-attended" :
                  att.status === "absent_justified" ? "badge-absent" :
                  "badge-absent-unjust"

                return `
                  <tr>
                    <td style="font-weight: 600;">${att.lesson}</td>
                    <td style="font-size: 7px;">${(lessonData?.grammar || "—").substring(0, 35)}${(lessonData?.grammar || "").length > 35 ? "..." : ""}</td>
                    <td><span class="badge ${statusBadge}">${statusLabel}</span></td>
                    <td>${new Date(att.date).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "2-digit" })}</td>
                    <td style="font-size: 7px; color: #9ca3af;">${(att.notes || "—").substring(0, 15)}</td>
                  </tr>
                `
              }).join("")
          }
        </tbody>
      </table>
      ${attendance.length > 10 ? `<div class="more-records">Mostrando últimos 10 de ${attendance.length} registros</div>` : ''}
    </div>

    <div class="footer">
      <div class="footer-left">
        <div class="footer-text">
          ${isOfficial ? 'Documento oficial emitido el' : 'Generado el'} ${formattedDate}
        </div>
        ${!isOfficial ? '<div class="footer-warning">Este documento no tiene validez oficial</div>' : ''}
        ${isOfficial ? `<div class="verify-code">${verificationHash.toUpperCase()}</div>` : ''}
      </div>

      ${isOfficial ? `
      <div class="signature">
        <div class="sig-line"></div>
        <div class="sig-name">${issuedBy}</div>
        <div class="sig-role">Director Académico</div>
      </div>

      <div class="qr">
        <div class="qr-label">Verificar</div>
        <img src="${qrCodeDataUrl}" alt="QR" />
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>
  `
}
