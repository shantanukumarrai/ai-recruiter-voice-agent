import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface InterviewInvitationEmailProps {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  recruiterName: string;
  interviewUrl: string;
  location: string;
  employmentTypeLabel: string;
}

export default function InterviewInvitationEmail({
  candidateName,
  jobTitle,
  companyName,
  recruiterName,
  interviewUrl,
  location,
  employmentTypeLabel,
}: InterviewInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;re invited to interview for {jobTitle} at {companyName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>You&apos;re invited to an AI voice interview</Heading>

          <Text style={paragraph}>Hi {candidateName},</Text>

          <Text style={paragraph}>
            Thanks for applying to <strong>{jobTitle}</strong>
            {companyName ? ` at ${companyName}` : ""}. We&apos;d like to invite you to a short
            AI-guided voice interview as the next step.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailLine}>
              <strong>Role:</strong> {jobTitle}
            </Text>
            <Text style={detailLine}>
              <strong>Location:</strong> {location}
            </Text>
            <Text style={detailLine}>
              <strong>Type:</strong> {employmentTypeLabel}
            </Text>
          </Section>

          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <Link href={interviewUrl} style={button}>
              Start Your Interview
            </Link>
          </Section>

          <Text style={paragraph}>
            The interview takes about 15-20 minutes. Find a quiet spot with a stable internet
            connection, and make sure your microphone is enabled. You can start whenever you&apos;re
            ready — the link doesn&apos;t expire.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Sent by {recruiterName} via AI Recruiter Voice Agent. If you weren&apos;t expecting this,
            you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "32px",
  maxWidth: "560px",
  borderRadius: "12px",
};

const heading = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#111827",
  marginBottom: "16px",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#374151",
};

const detailsBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "20px 0",
};

const detailLine = {
  fontSize: "13px",
  color: "#374151",
  margin: "4px 0",
};

const button = {
  backgroundColor: "#4f46e5",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "12px 28px",
  display: "inline-block",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const footer = {
  fontSize: "12px",
  color: "#9ca3af",
};
