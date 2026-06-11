import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type Props = {
  userName: string;
  appName: string;
  appUrl: string;
  logoUrl?: string;
};

const DEFAULT_LOGO = "https://crm.dvmkt.com.br/logodv-verde.png";

export function WelcomeEmail({ userName, appName, appUrl, logoUrl = DEFAULT_LOGO }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Bem-vindo ao {appName}!</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img src={logoUrl} alt="DV Marketing" width="130" style={logo} />
          </Section>
          <Heading style={heading}>Bem-vindo, {userName}! 🎉</Heading>
          <Text style={paragraph}>
            Sua conta foi criada com sucesso no <strong>{appName}</strong>.
          </Text>
          <Text style={paragraph}>
            Para começar, clique no botão abaixo e crie seu primeiro workspace.
          </Text>
          <Section style={btnSection}>
            <Button href={appUrl} style={button}>
              Acessar o CRM
            </Button>
          </Section>
          <Text style={footer}>Se você não criou essa conta, ignore este e-mail.</Text>
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
const footer = {
  fontSize: "12px",
  color: "#9aa69d",
  marginTop: "28px",
  textAlign: "center" as const,
};

export default WelcomeEmail;
