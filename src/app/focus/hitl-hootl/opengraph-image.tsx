import { ImageResponse } from "next/og";

export const alt =
  "HITL and HOOTL for ensembly — automate the digital, surface the physical, wait only for permission";
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
          Focus · ensembly
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 50,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              fontWeight: 400,
            }}
          >
            HITL and HOOTL
          </div>
          <div
            style={{
              fontSize: 24,
              lineHeight: 1.4,
              color: "#4a4038",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            }}
          >
            Automate the digital. Surface the physical. Wait only for permission.
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
          <span style={{ color: "#c2410c", fontWeight: 600 }}>kernel → swarm</span>
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
            border: "1px solid rgba(194, 65, 12, 0.35)",
            background: "#fff",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: "#c2410c" }}>Runtime</div>
          <div style={{ fontSize: 15, color: "#4a4038" }}>
            Graph · critical path · HITL escalation
          </div>
        </div>
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
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1e3a5f" }}>HOOTL swarm</div>
          <div style={{ fontSize: 15, color: "#1e3a5f" }}>
            Clear digital thrash under kernel law
          </div>
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
          <div style={{ fontSize: 16, fontWeight: 700, color: "#92400e" }}>HITL</div>
          <div style={{ fontSize: 15, color: "#92400e" }}>
            Optional verification — deliberate join
          </div>
        </div>
      </div>
    </div>,
    { ...size }
  );
}
