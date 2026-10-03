"use client";

import React from "react";

interface HandDrawnBorderProps {
  children: React.ReactNode;
  className?: string;
  annotation?: string;
  annotationPosition?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  variant?: "maroon" | "cream" | "dashed";
}

export function HandDrawnBorder({
  children,
  className = "",
  annotation,
  annotationPosition = "top-right",
  variant = "maroon",
}: HandDrawnBorderProps) {
  const borderStyles =
    variant === "cream"
      ? "border-[#F4EDE4]/40 shadow-[4px_5px_0px_#110304]"
      : variant === "dashed"
      ? "border-dashed border-[#8E2630] shadow-[3px_4px_0px_#110304]"
      : "border-[#4A1017] shadow-[4px_5px_0px_#110304]";

  const annotationPosClass =
    annotationPosition === "top-right"
      ? "-top-3 right-4 rotate-2"
      : annotationPosition === "top-left"
      ? "-top-3 left-4 -rotate-3"
      : annotationPosition === "bottom-right"
      ? "-bottom-3 right-4 -rotate-1"
      : "-bottom-3 left-4 rotate-2";

  return (
    <div
      className={`relative bg-[#320B10] border ${borderStyles} transition-all duration-200 ${className}`}
      style={{ borderRadius: "3px 8px 4px 7px" }}
    >
      {annotation && (
        <span
          className={`absolute ${annotationPosClass} bg-[#4A1017] text-[#D9C9BC] text-xs font-handwritten px-2.5 py-0.5 rounded border border-[#8E2630] pointer-events-none z-10 shadow-xs`}
        >
          {annotation}
        </span>
      )}
      {children}
    </div>
  );
}

export default HandDrawnBorder;
