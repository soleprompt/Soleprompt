import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #22d3ee 0%, #0066ff 45%, #a855f7 100%)",
          borderRadius: 8,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
          <path
            d="M26.5 11.5c-2.2 0-4.1 1.1-5.2 2.8-.6-.9-1.6-1.5-2.8-1.5-1.8 0-3.3 1.5-3.3 3.3 0 .5.1 1 .3 1.4-1.5.8-2.5 2.4-2.5 4.2 0 2.6 2.1 4.7 4.7 4.7h1.2c2.4 0 4.4-1.7 4.8-4 .8.4 1.7.6 2.6.6 2.8 0 5-2.2 5-5s-2.2-5-5-5Z"
            fill="white"
            fillOpacity="0.95"
          />
          <path
            d="M13 10.5c-.8 0-1.5.7-1.5 1.5v.2c-.9.5-1.5 1.5-1.5 2.6v8.2c0 1.7 1.3 3 3 3h.8"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
