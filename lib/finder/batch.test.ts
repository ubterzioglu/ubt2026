import assert from "node:assert/strict";
import test from "node:test";

import { parseClassifierBatchOutput } from "@/lib/finder/batch";

test("maps batch entries by their one-based source index", () => {
  const first = { is_match: false };
  const second = { is_match: true };

  const parsed = parseClassifierBatchOutput(
    {
      results: [
        { source_index: 2, candidate: second },
        { source_index: 1, candidate: first }
      ]
    },
    2
  );

  assert.equal(parsed.errorMessage, undefined);
  assert.deepEqual(parsed.candidates, [first, second]);
});

test("rejects duplicate and out-of-range source indexes", () => {
  const parsed = parseClassifierBatchOutput(
    {
      results: [
        { source_index: 1, candidate: { name: "first" } },
        { source_index: 1, candidate: { name: "duplicate" } },
        { source_index: 4, candidate: { name: "outside" } }
      ]
    },
    3
  );

  assert.deepEqual(parsed.candidates, [{ name: "first" }, null, null]);
  assert.match(parsed.errorMessage ?? "", /eksik veya geçersiz/);
});

test("rejects a non-object batch response", () => {
  const parsed = parseClassifierBatchOutput("invalid", 2);

  assert.deepEqual(parsed.candidates, [null, null]);
  assert.equal(parsed.errorMessage, "Toplu yanıt bir JSON nesnesi değil");
});
