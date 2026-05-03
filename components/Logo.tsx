"use client"
import React from "react";

type Props = {
  width?: number | string;
  className?: string;
};

export default function Logo({ width = "220", className = "" }: Props) {
  return (
    <svg
      width={width}
      viewBox="0 0 600 120"
      role="img"
      aria-label="Just Your Choice logo"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>Just Your Choice</title>
      <rect width="100%" height="100%" fill="none" />

      <text
        x="0"
        y="74"
        style={{
          fontFamily: "var(--font-pacifico), Pacifico, sans-serif",
          fontSize: 72,
          fill: "#b30000",
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        Just Your
      </text>

      <text
        x="220"
        y="102"
        style={{
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          fontSize: 16,
          fill: "#b30000",
          fontWeight: 800,
          letterSpacing: 1.5,
        }}
      >
        CHOICE
      </text>
    </svg>
  );
}
