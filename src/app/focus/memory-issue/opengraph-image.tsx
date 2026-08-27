import { ImageResponse } from "next/og";

export const alt =
  "Pulse instead of dump: Schrödinger’s constraints on agent memory — surgical context, not a context dump";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "linear-gradient(155deg, #fffaf7 0%, #f7f1ec 45%, #efe4d8 100%)",
        color: "#1a1410",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "56%",
          padding: "52px 48px 48px 56px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 20,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#c2410c",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#c2410c",
            }}
          />
          Focus · pulse, don’t dump
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 54,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              fontWeight: 400,
            }}
          >
            Pulse instead of dump
          </div>
          <div
            style={{
              fontSize: 24,
              lineHeight: 1.4,
              color: "#4a4038",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            }}
          >
            Schrödinger’s three constraints, applied to agent memory: surgical context, not a flood.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            fontSize: 18,
            color: "#5c524a",
          }}
        >
          <span>Peramanathan Sathyamoorthy</span>
          <span style={{ color: "#c2410c", fontWeight: 600 }}>1944 → harness</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 16,
          width: "44%",
          padding: "48px 48px 48px 8px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: "18px 20px",
            borderRadius: 16,
            border: "1px solid rgba(74, 158, 237, 0.45)",
            background: "#dbe4ff",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1e3a5f" }}>Averaging</div>
          <div style={{ fontSize: 15, color: "#1e3a5f" }}>Pre-training & scale</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: "18px 20px",
            borderRadius: 16,
            border: "1px solid rgba(139, 92, 246, 0.45)",
            background: "#e5dbff",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: "#2d1b69" }}>High-barrier states</div>
          <div style={{ fontSize: 15, color: "#2d1b69" }}>Tokens, embeddings, memory</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: "18px 20px",
            borderRadius: 16,
            border: "1px solid rgba(245, 158, 11, 0.5)",
            background: "#fff3bf",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: "#92400e" }}>Open engine</div>
          <div style={{ fontSize: 15, color: "#92400e" }}>Compute, tokens, heat</div>
        </div>
      </div>
    </div>,
    { ...size }
  );
}
