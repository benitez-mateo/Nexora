import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0d12",
          color: "#f5f3ee",
          fontSize: 220,
          fontWeight: 600,
          fontFamily: "Georgia, serif",
          letterSpacing: "-0.04em",
          padding: 96,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(circle at 30% 30%, #1f3a8a 0%, #0b0d12 60%, #050608 100%)",
            borderRadius: 9999,
          }}
        >
          N<span style={{ color: "#5b8def", marginLeft: -6 }}>.</span>
        </div>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
