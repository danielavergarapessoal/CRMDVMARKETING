import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type Props = {
  inviterName: string;
  orgName: string;
  acceptUrl: string;
  logoUrl?: string;
};

const DEFAULT_LOGO = "https://crm.dvmkt.com.br/logodv-verde.png";

export function InvitationEmail({
  inviterName,
  orgName,
  acceptUrl,
  logoUrl = DEFAULT_LOGO,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>
        {inviterName} te convidou para {orgName}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img src={logoUrl} alt="DV Marketing" width="130" style={logo} />
          </Section>
          <Heading style={heading}>Você foi convidado! 🎉</Heading>
          <Text style={paragraph}>
            <strong>{inviterName}</strong> te convidou para fazer parte de{" "}
            <strong>{orgName}</strong>.
          </Text>
          <Section style={btnSection}>
            <Button href={acceptUrl} style={button}>
              Aceitar convite
            </Button>
          </Section>
          <Text style={paragraphMuted}>Ou copie e cole esse endereço no navegador:</Text>
          <Text style={code}>
            <Link href={acceptUrl} style={codeLink}>
              {acceptUrl}
            </Link>
          </Text>
          <Text style={footer}>
            Esse link expira em 7 dias. Se você não esperava esse convite, pode ignorar este
            e-mail.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f3f1ef",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  margin: 0,
  padding: "24px 0",
};
const container = {
  maxWidth: "520px",
  margin: "0 auto",
  padding: "40px",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  border: "1px solid #e4e0db",
};
const logoSection = { textAlign: "center" as const, marginBottom: "20px" };
const logo = { margin: "0 auto" };
const heading = {
  color: "#4e6055",
  fontSize: "22px",
  fontWeight: 700,
  textAlign: "center" as const,
  marginBottom: "8px",
};
const paragraph = { fontSize: "16px", lineHeight: "24px", color: "#4a564e" };
const paragraphMuted = { fontSize: "14px", lineHeight: "22px", color: "#6e8676" };
const btnSection = { textAlign: "center" as const, margin: "28px 0" };
const button = {
  backgroundColor: "#6e8676",
  color: "#ffffff",
  padding: "13px 30px",
  borderRadius: "10px",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "15px",
  display: "inline-block",
};
const code = {
  backgroundColor: "#f3f1ef",
  padding: "10px 14px",
  borderRadius: "8px",
  fontSize: "13px",
  wordBreak: "break-all" as const,
};
const codeLink = { color: "#6e8676" };
const footer = {
  fontSize: "12px",
  color: "#9aa69d",
  marginTop: "28px",
  textAlign: "center" as const,
};

export default InvitationEmail;
