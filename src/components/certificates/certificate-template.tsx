import React from "react"
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"

// Define styles for the certificate
const styles = StyleSheet.create({
  page: {
    padding: 60,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  border: {
    border: "4pt solid #2563eb",
    padding: 40,
    height: "100%",
    position: "relative",
  },
  innerBorder: {
    border: "1pt solid #60a5fa",
    padding: 30,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  header: {
    textAlign: "center",
    marginBottom: 30,
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  certificateTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e293b",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  body: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  certifyText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#475569",
  },
  studentName: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e293b",
    marginBottom: 30,
    borderBottom: "2pt solid #2563eb",
    paddingBottom: 10,
  },
  achievementText: {
    fontSize: 14,
    textAlign: "center",
    color: "#475569",
    marginBottom: 10,
  },
  level: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2563eb",
    marginBottom: 30,
  },
  footer: {
    marginTop: 40,
  },
  detailsRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  detailBlock: {
    width: "45%",
  },
  detailLabel: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 12,
    color: "#1e293b",
    fontWeight: "bold",
  },
  signature: {
    borderTop: "1pt solid #cbd5e1",
    paddingTop: 5,
  },
  certificateNumber: {
    fontSize: 9,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 10,
  },
})

interface CertificateTemplateProps {
  studentName: string
  level: string
  levelName: string
  issueDate: string
  certificateNumber: string
  issuedBy: string
}

export function CertificateTemplate({
  studentName,
  level,
  levelName,
  issueDate,
  certificateNumber,
  issuedBy,
}: CertificateTemplateProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <View style={styles.innerBorder}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.logo}>Vrevia</Text>
              <Text style={styles.subtitle}>English Academy</Text>
            </View>

            {/* Certificate Title */}
            <Text style={styles.certificateTitle}>Certificado de Nivel</Text>

            {/* Body */}
            <View style={styles.body}>
              <Text style={styles.certifyText}>Se certifica que</Text>

              <Text style={styles.studentName}>{studentName}</Text>

              <Text style={styles.achievementText}>
                ha completado satisfactoriamente el nivel
              </Text>

              <Text style={styles.level}>{levelName}</Text>

              <Text style={styles.achievementText}>
                demostrando competencia en las habilidades del idioma inglés
                correspondientes a este nivel del Marco Común Europeo de Referencia.
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.detailsRow}>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Fecha de emisión</Text>
                  <Text style={styles.detailValue}>{issueDate}</Text>
                </View>

                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Emitido por</Text>
                  <Text style={styles.detailValue}>{issuedBy}</Text>
                  <View style={styles.signature}>
                    <Text style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                      Firma autorizada
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.certificateNumber}>
                Número de certificado: {certificateNumber}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
