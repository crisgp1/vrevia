import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { CertificateTemplate } from "@/components/certificates/certificate-template"
import connectDB from "@/lib/db/connection"
import { Certificate } from "@/lib/db/models"
import { LEVELS } from "@/lib/constants"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectDB()

    // Get certificate with populated student and issuedBy
    const certificate = await Certificate.findById(id)
      .populate("student", "name email")
      .populate("issuedBy", "name")
      .lean()

    if (!certificate) {
      return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 })
    }

    const student = certificate.student as unknown as { name: string; email: string }
    const issuedBy = certificate.issuedBy as unknown as { name: string }

    // Format date
    const issueDate = format(new Date(certificate.issueDate), "dd 'de' MMMM 'de' yyyy", {
      locale: es,
    })

    // Get level name
    const levelName = LEVELS[certificate.level as keyof typeof LEVELS]

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      CertificateTemplate({
        studentName: student.name,
        level: certificate.level,
        levelName,
        issueDate,
        certificateNumber: certificate.certificateNumber,
        issuedBy: issuedBy.name,
      })
    )

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer)

    // Return PDF as downloadable file
    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificado-${certificate.certificateNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating certificate PDF:", error)
    return NextResponse.json(
      { error: "Error al generar el certificado" },
      { status: 500 }
    )
  }
}
