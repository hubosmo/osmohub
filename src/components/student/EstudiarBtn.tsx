"use client";

import { useState } from "react";

export function EstudiarBtn({ accentColor }: { accentColor: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      className="text-xs font-semibold px-3 py-1 rounded-lg border transition-colors cursor-pointer"
      style={{
        borderColor: accentColor,
        backgroundColor: hovered ? accentColor : "transparent",
        color: hovered ? "#fff" : accentColor,
        transition: "background-color 0.15s ease, color 0.15s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      Estudiar
    </span>
  );
}
