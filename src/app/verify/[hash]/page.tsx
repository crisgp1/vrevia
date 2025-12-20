import { notFound } from "next/navigation"
import connectDB from "@/lib/db/connection"
import { OfficialDocument, User } from "@/lib/db/models"
import { CheckCircle2, XCircle, Shield, Calendar, User as UserIcon, GraduationCap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PageProps {
  params: Promise<{ hash: string }>
}

export default async function VerifyDocumentPage({ params }: PageProps) {
  const { hash } = await params

  await connectDB()

  // Find the document
  const document = await OfficialDocument.findOne({ verificationHash: hash })
    .populate("student", "name email")
    .populate("issuedBy", "name")
    .lean()

  if (!document) {
    notFound()
  }

  const isValid = document.isValid && !document.revokedAt
  const documentTypeLabel = {
    kardex: "Academic Transcript (Kardex)",
    certificate: "Certificate",
    transcript: "Official Transcript",
  }[document.documentType]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#0d9488] mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Document Verification
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Vrevia Professional English Official Document System
          </p>
        </div>

        {/* Status Card */}
        <Card className={`mb-8 border-2 ${isValid ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-red-500 bg-red-50 dark:bg-red-950/20'}`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              {isValid ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
              <div>
                <CardTitle className={isValid ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}>
                  {isValid ? 'Valid Document' : 'Invalid Document'}
                </CardTitle>
                <p className={`text-sm ${isValid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {isValid
                    ? 'This document has been officially issued by Vrevia Professional English'
                    : document.revokedAt
                    ? `This document was revoked on ${new Date(document.revokedAt).toLocaleDateString()}`
                    : 'This document is not valid'}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Document Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Document Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Type */}
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Document Type
              </label>
              <div className="mt-1">
                <Badge variant="secondary" className="text-base">
                  {documentTypeLabel}
                </Badge>
              </div>
            </div>

            {/* Verification Hash */}
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Verification Code
              </label>
              <p className="mt-1 font-mono text-sm bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded">
                {document.verificationHash.toUpperCase()}
              </p>
            </div>

            {/* Issue Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Issued On
                </label>
                <p className="mt-1 text-lg font-semibold">
                  {new Date(document.issuedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Issued By
                </label>
                <p className="mt-1 text-lg font-semibold">
                  {typeof document.issuedBy === 'object' && document.issuedBy !== null
                    ? (document.issuedBy as any).name
                    : 'Vrevia Staff'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Student Name
                </label>
                <p className="mt-1 text-lg font-semibold">
                  {document.metadata.studentName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Email
                </label>
                <p className="mt-1 text-lg">
                  {document.metadata.studentEmail}
                </p>
              </div>
            </div>

            {document.metadata.level && (
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Level
                </label>
                <p className="mt-1 text-lg font-semibold">
                  {document.metadata.level}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              {document.metadata.currentLesson && (
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e3a5f] dark:text-[#0d9488]">
                    {document.metadata.currentLesson}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Current Lesson
                  </p>
                </div>
              )}
              {document.metadata.averageGrade !== undefined && (
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e3a5f] dark:text-[#0d9488]">
                    {document.metadata.averageGrade}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Average Grade
                  </p>
                </div>
              )}
              {document.metadata.attendancePercentage !== undefined && (
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e3a5f] dark:text-[#0d9488]">
                    {document.metadata.attendancePercentage}%
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Attendance
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revocation Info */}
        {document.revokedAt && (
          <Card className="border-red-500 bg-red-50 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="text-red-900 dark:text-red-100">
                Document Revoked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>Revoked on:</strong>{" "}
                  {new Date(document.revokedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                {document.revokedReason && (
                  <p className="text-sm text-red-700 dark:text-red-300">
                    <strong>Reason:</strong> {document.revokedReason}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>
            This verification page is provided by Vrevia Professional English to
            confirm the authenticity of official documents.
          </p>
          <p className="mt-2">
            For questions or concerns, please contact{" "}
            <a
              href="mailto:info@vrevia.com"
              className="text-[#1e3a5f] dark:text-[#0d9488] hover:underline"
            >
              info@vrevia.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
