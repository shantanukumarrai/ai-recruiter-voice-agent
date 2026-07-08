import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { recommendationLabels } from "@/validators/report.validator";
import type { Recommendation } from "@prisma/client";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#1f2937" },
  h1: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#6b7280", marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: 700, marginTop: 16, marginBottom: 8 },
  recommendationBox: {
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bigNumber: { fontSize: 28, fontWeight: 700 },
  label: { fontSize: 9, color: "#6b7280" },
  metricRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  metricLabel: { width: 110, fontSize: 10 },
  metricValue: { width: 30, fontSize: 10, textAlign: "right", marginRight: 8 },
  barTrack: {
    width: 260,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e5e7eb",
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  paragraph: { fontSize: 10.5, lineHeight: 1.5, marginBottom: 8 },
  bullet: { fontSize: 10.5, lineHeight: 1.5, marginBottom: 3 },
});

function colorForScore(score: number) {
  if (score >= 75) return "#16a34a";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}

function MetricBarPdf({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{pct}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: colorForScore(value) }]} />
      </View>
    </View>
  );
}

export interface InterviewReportPdfProps {
  candidateName: string;
  jobTitle: string;
  generatedDate: string;
  overallRating: number;
  recommendation: Recommendation;
  communication: number;
  confidence: number;
  problemSolving: number;
  technicalSkill: number;
  behavior: number;
  leadership: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

export function InterviewReportPdf(props: InterviewReportPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Interview Report — {props.candidateName}</Text>
        <Text style={styles.subtitle}>
          {props.jobTitle} · Generated {props.generatedDate}
        </Text>

        <View style={styles.recommendationBox}>
          <View>
            <Text style={styles.bigNumber}>{Math.round(props.overallRating)}</Text>
            <Text style={styles.label}>Overall Rating</Text>
          </View>
          <Text style={{ fontSize: 14, fontWeight: 700, color: colorForScore(props.overallRating) }}>
            {recommendationLabels[props.recommendation]}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Evaluation Scores</Text>
        <MetricBarPdf label="Communication" value={props.communication} />
        <MetricBarPdf label="Confidence" value={props.confidence} />
        <MetricBarPdf label="Problem Solving" value={props.problemSolving} />
        <MetricBarPdf label="Technical Skill" value={props.technicalSkill} />
        <MetricBarPdf label="Behavior" value={props.behavior} />
        <MetricBarPdf label="Leadership" value={props.leadership} />

        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.paragraph}>{props.summary}</Text>

        <Text style={styles.sectionTitle}>Strengths</Text>
        {props.strengths.map((s, i) => (
          <Text key={i} style={styles.bullet}>
            + {s}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Weaknesses</Text>
        {props.weaknesses.map((w, i) => (
          <Text key={i} style={styles.bullet}>
            − {w}
          </Text>
        ))}
      </Page>
    </Document>
  );
}
