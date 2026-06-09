import { ImageResponse } from "next/og";
import { appConfig } from "@/config/app.config";

export const alt = `${appConfig.name} — ${appConfig.description}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background:
          "radial-gradient(circle at 80% 0%, rgba(212,147,122,0.20) 0%, rgba(30,37,33,0) 55%), #1e2521",
        color: "#fafafa",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Header: logo + label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "#6E8676",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            DV
          </div>
          <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5 }}>
            {appConfig.name}
          </span>
        </div>
        <span
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 18,
            color: "#a3a3a3",
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          / crm
        </span>
      </div>

      {/* Headline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1000 }}>
        <span
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 22,
            color: "#D4937A",
            textTransform: "uppercase",
            letterSpacing: 3,
          }}
        >
          / DV Marketing
        </span>
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Seus clientes,</span>
          <span>
            no <span style={{ color: "#D4937A" }}>controle.</span>
          </span>
        </div>
      </div>

      {/* Footer: stack */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          borderTop: "1px solid #262626",
          paddingTop: 28,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 20,
          color: "#a3a3a3",
        }}
      >
        <span>next.js 16 · supabase · tailwind 4 · shadcn/ui</span>
        <span style={{ color: "#D4937A" }}>construído com claude code</span>
      </div>
    </div>,
    size,
  );
}
