import { ImageResponse } from "next/og";

export const alt =
  "Archive is not memory: the admissions rule for agent recall — sparse, sourced, dated traces, not residue";
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
          Focus · admissions rule
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 48,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              fontWeight: 400,
            }}
          >
            Archive is not memory
          </div>
          <div
            style={{
              fontSize: 24,
              lineHeight: 1.4,
              color: "#4a4038",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            }}
          >
            The second constraint on agent recall: reuse, not form, decides what may pulse back in.
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
          <span style={{ color: "#c2410c", fontWeight: 600 }}>archive → memory</span>
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
            border: "1px solid rgba(100, 116, 139, 0.45)",
            background: "#e2e8f0",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: "#334155" }}>Archive</div>
          <div style={{ fontSize: 15, color: "#475569" }}>Outside the live path</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: "18px 20px",
            borderRadius: 16,
            border: "1px solid rgba(34, 197, 94, 0.45)",
            background: "#d3f9d8",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: "#14532d" }}>Memory</div>
          <div style={{ fontSize: 15, color: "#15803d" }}>Sparse · sourced · dated</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: "18px 20px",
            borderRadius: 16,
            border: "1px solid rgba(194, 65, 12, 0.5)",
            background: "#ffedd5",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: "#9a3412" }}>Three locks</div>
          <div style={{ fontSize: 15, color: "#c2410c" }}>Source · time · uncertainty</div>
        </div>
      </div>
    </div>,
    { ...size }
  );
}
