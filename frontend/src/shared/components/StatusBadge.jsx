import React from 'react';

export function StatusBadge({ status, size = "md" }) {
  let bg = "#F4EFE6";
  let color = "#4B5752";
  let border = "#DFD8CA";

  const lower = (status || "").toLowerCase();

  if (lower.includes("active") || lower.includes("vegetative")) {
    bg = "#EAF4ED";
    color = "#2A6740";
    border = "#C8E2D0";
  } else if (lower.includes("flower") || lower.includes("maturing")) {
    bg = "#F2EFE9";
    color = "#3D4944";
    border = "#DFD9CE";
  } else if (lower.includes("plant") || lower.includes("due")) {
    bg = "#FEF3C7";
    color = "#92400E";
    border = "#FDE68A";
  } else if (lower.includes("completed")) {
    bg = "#F1F5F9";
    color = "#475569";
    border = "#E2E8F0";
  }

  const padding = size === "sm" ? "2px 8px" : "4px 10px";
  const fontSize = size === "sm" ? "0.7rem" : "0.75rem";

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      backgroundColor: bg,
      color: color,
      border: `1px solid ${border}`,
      borderRadius: '9999px',
      padding: padding,
      fontSize: fontSize,
      fontWeight: 500,
      letterSpacing: '0.01em',
      whiteSpace: 'nowrap'
    }}>
      {status}
    </span>
  );
}
