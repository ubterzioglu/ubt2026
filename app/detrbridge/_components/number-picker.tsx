"use client";

import { useState } from "react";
import { DETRBRIDGE_BRAND_GRADIENT } from "@/app/detrbridge/_components/theme";

interface NumberPickerProps {
  name: string;
  defaultValue?: number;
  min?: number;
  max?: number;
}

/**
 * 1–max clickable number picker — replaces the native <select> for rating
 * input so the dropdown never falls back to the browser's unstyled default
 * (white background, no theme) on any platform. Renders a hidden input so
 * the surrounding <form action={...}> keeps working unchanged.
 */
export function NumberPicker({
  name,
  defaultValue = 5,
  min = 1,
  max = 10
}: NumberPickerProps) {
  const [selected, setSelected] = useState(defaultValue);
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const rowSize = Math.ceil(values.length / 2);
  const rows = [values.slice(0, rowSize), values.slice(rowSize)];

  return (
    <div className="flex flex-col gap-1">
      <input type="hidden" name={name} value={selected} />
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex flex-wrap items-center gap-1">
          {row.map((value) => {
            const isSelected = value === selected;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setSelected(value)}
                aria-pressed={isSelected}
                title={`${value}/${max}`}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.4rem] text-[11px] font-bold transition ${
                  isSelected
                    ? "text-black ring-1 ring-inset ring-white/20"
                    : "border border-white/10 bg-white/[0.04] text-white/60 hover:border-white/25 hover:text-white"
                }`}
                style={isSelected ? { backgroundImage: DETRBRIDGE_BRAND_GRADIENT } : undefined}
              >
                {value}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
