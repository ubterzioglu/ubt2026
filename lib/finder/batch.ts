export interface ClassifierBatchOutcome {
  candidates: Array<unknown | null>;
  errorMessage?: string;
}

export function parseClassifierBatchOutput(
  raw: unknown,
  expectedCount: number
): ClassifierBatchOutcome {
  const candidates = Array<unknown | null>(expectedCount).fill(null);
  if (typeof raw !== "object" || raw === null) {
    return {
      candidates,
      errorMessage: "Toplu yanıt bir JSON nesnesi değil"
    };
  }

  const results = (raw as Record<string, unknown>).results;
  if (!Array.isArray(results)) {
    return {
      candidates,
      errorMessage: "Toplu yanıtta results dizisi yok"
    };
  }

  for (const entry of results) {
    if (typeof entry !== "object" || entry === null) continue;
    const record = entry as Record<string, unknown>;
    const sourceIndex = Number(record.source_index);
    const arrayIndex = sourceIndex - 1;
    if (
      !Number.isInteger(sourceIndex) ||
      arrayIndex < 0 ||
      arrayIndex >= expectedCount ||
      candidates[arrayIndex] !== null ||
      typeof record.candidate !== "object" ||
      record.candidate === null
    ) {
      continue;
    }
    candidates[arrayIndex] = record.candidate;
  }

  if (candidates.some((candidate) => candidate === null)) {
    return {
      candidates,
      errorMessage: "Toplu yanıtta eksik veya geçersiz kaynak indeksleri var"
    };
  }
  return { candidates };
}
