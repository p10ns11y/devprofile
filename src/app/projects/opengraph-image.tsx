import { ImageResponse } from "next/og";

export const alt = "Projects — technical and architectural walkthroughs";
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
          width: "100%",
          padding: "56px 64px 52px",
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
          Projects · walkthroughs
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 54,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              fontWeight: 400,
            }}
          >
            Architecture for systems that shipped
          </div>
          <div
            style={{
              fontSize: 24,
              lineHeight: 1.4,
              color: "#4a4038",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            }}
          >
            collab-finder · thepulimaangani · Adaptate · agent-prompt-tuning-lab
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
          <span style={{ color: "#c2410c", fontWeight: 600 }}>Projects</span>
        </div>
      </div>
    </div>,
    { ...size }
  );
}
