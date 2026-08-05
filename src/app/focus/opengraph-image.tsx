import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt =
  "Focus: from 2016 energy orchestration to 2026 agentic systems — make the learning loop more efficient";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const diagramBuffer = await readFile(
    join(process.cwd(), "public/images/IA_the_virtuous_loop.png")
  );
  const diagramSrc = `data:image/png;base64,${diagramBuffer.toString("base64")}`;

  return new ImageResponse(
    (
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
            Focus · EEaaS → agents
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
              Make the learning loop itself more efficient
            </div>
            <div
              style={{
                fontSize: 24,
                lineHeight: 1.4,
                color: "#4a4038",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
              }}
            >
              When learning gets cheaper and decisions get better, intelligence can serve more people
              for longer.
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
            <span style={{ color: "#c2410c", fontWeight: 600 }}>2016 → 2026</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44%",
            padding: "40px 40px 40px 8px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              borderRadius: 20,
              border: "1px solid rgba(194, 65, 12, 0.18)",
              background: "#ffffff",
              boxShadow: "0 18px 40px rgba(60, 40, 20, 0.12)",
              padding: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={diagramSrc}
              alt=""
              width={480}
              height={340}
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
