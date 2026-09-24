import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0F1117",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg viewBox="0 0 76 76" width={128} height={128} xmlns="http://www.w3.org/2000/svg">
          <path
            d="M 7 38 A 31 31 0 1 1 38 69"
            stroke="#00A6FF"
            strokeWidth={7}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 38 55 A 17 17 0 0 1 21 38"
            stroke="#00A6FF"
            strokeWidth={7}
            strokeLinecap="round"
            fill="none"
          />
          <circle cx={38} cy={38} r={7} fill="#00A6FF" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
