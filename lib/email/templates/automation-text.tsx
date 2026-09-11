import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface Props {
  preview: string;
  heading?: string;
  body: string;
}

const main = {
  background: "#f3f0ec",
  color: "#344b40",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};
const container = { maxWidth: "560px", margin: "0 auto", padding: "32px 24px" };
const headingStyle = {
  color: "#52705e",
  fontSize: "24px",
  margin: "0 0 16px 0",
};
const text = {
  color: "#344b40",
  fontSize: "14px",
  lineHeight: "1.5",
  whiteSpace: "pre-wrap" as const,
};

export default function AutomationTextEmail({ preview, heading, body }: Props) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            {heading && <Heading style={headingStyle}>{heading}</Heading>}
            <Text style={text}>{body.split(/(https:\/\/[^\s]+)/g).map((part,index) => part.startsWith("https://") ? <Link key={`${index}-${part}`} href={part} style={{color:"#52705e",textDecoration:"underline"}}>{part}</Link> : part)}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
