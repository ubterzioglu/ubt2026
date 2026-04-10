"use client";

import { useState } from "react";

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London (GMT / BST)" },
  { value: "Europe/Berlin", label: "Berlin (CET / CEST)" },
  { value: "Europe/Paris", label: "Paris (CET / CEST)" },
  { value: "Europe/Istanbul", label: "Istanbul (TRT +3)" },
  { value: "Europe/Moscow", label: "Moscow (MSK +3)" },
  { value: "America/New_York", label: "New York (EST / EDT)" },
  { value: "America/Chicago", label: "Chicago (CST / CDT)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST / PDT)" },
  { value: "Asia/Dubai", label: "Dubai (GST +4)" },
  { value: "Asia/Kolkata", label: "Mumbai / Kolkata (IST +5:30)" },
  { value: "Asia/Shanghai", label: "Beijing / Shanghai (CST +8)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST +9)" },
  { value: "Australia/Sydney", label: "Sydney (AEST / AEDT)" },
] as const;

const PRESET_DURATIONS = [
  { mins: 15, label: "15 minutes" },
  { mins: 30, label: "30 minutes" },
  { mins: 45, label: "45 minutes" },
  { mins: 60, label: "1 hour" },
  { mins: 90, label: "1 hour 30 min" },
  { mins: 120, label: "2 hours" },
] as const;

function getOffsetMinutes(timezone: string, date: Date): number {
  const toMs = (tz: string) =>
    new Date(date.toLocaleString("en-US", { timeZone: tz })).getTime();
  return (toMs(timezone) - toMs("UTC")) / 60000;
}

function localDtToIso(localDt: string, timezone: string): string {
  if (!localDt) return "";
  const approx = new Date(localDt + ":00Z");
  const offset = getOffsetMinutes(timezone, approx);
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  const [datePart = "", timePart = "00:00"] = localDt.split("T");
  return `${datePart}T${timePart}:00${sign}${hh}:${mm}`;
}

function addMinutesToLocalDt(localDt: string, mins: number): string {
  if (!localDt) return "";
  const d = new Date(localDt + ":00Z");
  d.setTime(d.getTime() + mins * 60_000);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${y}-${mo}-${day}T${h}:${m}`;
}

function isoToLocalDt(iso: string, timezone: string): string {
  const d = new Date(iso);
  const formatted = new Intl.DateTimeFormat("sv-SE", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return formatted.replace(" ", "T");
}

const INPUT_CLS =
  "w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15";

interface SlotDatePickerProps {
  defaultStartsAt?: string;
  defaultEndsAt?: string;
  defaultTimezone?: string;
}

export function SlotDatePicker({
  defaultStartsAt,
  defaultEndsAt,
  defaultTimezone = "Europe/Berlin",
}: Readonly<SlotDatePickerProps>) {
  const initTz = defaultTimezone;
  const initLocalStart = defaultStartsAt ? isoToLocalDt(defaultStartsAt, initTz) : "";
  const initDuration =
    defaultStartsAt && defaultEndsAt
      ? Math.round(
          (new Date(defaultEndsAt).getTime() - new Date(defaultStartsAt).getTime()) / 60_000
        )
      : 45;

  const isPreset = (d: number) => PRESET_DURATIONS.some((p) => p.mins === d);

  const [timezone, setTimezone] = useState(initTz);
  const [localStart, setLocalStart] = useState(initLocalStart);
  const [duration, setDuration] = useState(isPreset(initDuration) ? initDuration : 45);
  const [customDuration, setCustomDuration] = useState(initDuration);
  const [showCustom, setShowCustom] = useState(!isPreset(initDuration));

  const activeDuration = showCustom ? customDuration : duration;
  const localEnd = localStart ? addMinutesToLocalDt(localStart, activeDuration) : "";
  const startsAtIso = localDtToIso(localStart, timezone);
  const endsAtIso = localDtToIso(localEnd, timezone);

  function handleDurationChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (val === "custom") {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      setDuration(parseInt(val));
    }
  }

  return (
    <div className="lg:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <input type="hidden" name="startsAt" value={startsAtIso} />
      <input type="hidden" name="endsAt" value={endsAtIso} />
      <input type="hidden" name="timezone" value={timezone} />

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-ink">Date &amp; start time</span>
        <input
          type="datetime-local"
          required
          value={localStart}
          onChange={(e) => setLocalStart(e.target.value)}
          className={INPUT_CLS}
        />
      </label>

      <div className="block">
        <span className="mb-2 block text-sm font-medium text-ink">Duration</span>
        <select
          value={showCustom ? "custom" : String(duration)}
          onChange={handleDurationChange}
          className={INPUT_CLS}
        >
          {PRESET_DURATIONS.map((p) => (
            <option key={p.mins} value={String(p.mins)}>
              {p.label}
            </option>
          ))}
          <option value="custom">Custom…</option>
        </select>
        {showCustom && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min={5}
              max={480}
              step={5}
              value={customDuration}
              onChange={(e) =>
                setCustomDuration(Math.max(5, parseInt(e.target.value) || 5))
              }
              className="w-24 rounded-[0.75rem] border border-line/80 bg-white px-3 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
            />
            <span className="text-sm text-ink/60">minutes</span>
          </div>
        )}
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-ink">Timezone</span>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className={INPUT_CLS}
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </label>

      {localEnd ? (
        <div className="flex items-center rounded-[1rem] border border-accent/20 bg-accent/5 px-5 py-3.5">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent/70">
              Ends at
            </p>
            <p className="text-sm font-bold text-ink">{localEnd.split("T")[1]}</p>
            <p className="mt-0.5 text-xs text-ink/55">{localEnd.split("T")[0]}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center rounded-[1rem] border border-dashed border-line/50 px-5 py-3.5">
          <p className="text-sm text-ink/40">Select a start time to preview the end time</p>
        </div>
      )}
    </div>
  );
}
