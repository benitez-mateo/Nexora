import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 30% 30%, #1f3a8a 0%, #0b0d12 60%, #050608 100%)",
          color: "#f5f3ee",
          fontSize: 110,
          fontWeight: 600,
          fontFamily: "Georgia, serif",
          letterSpacing: "-0.04em",
        }}
      >
        N
        <span style={{ color: "#5b8def", marginLeft: -3 }}>.</span>
      </div>
    ),
    { ...size },
  );
}
