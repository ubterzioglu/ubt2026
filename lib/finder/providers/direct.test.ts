import assert from "node:assert/strict";
import test from "node:test";

import { htmlToText } from "@/lib/finder/providers/direct";

test("converts HTML content to compact readable text", () => {
  const text = htmlToText(`
    <html>
      <head><style>.hidden { display: none; }</style></head>
      <body>
        <h1>Club &amp; Sauna</h1>
        <script>window.secret = "ignore";</script>
        <p>Hauptstraße&nbsp;12<br>12345 Mannheim</p>
      </body>
    </html>
  `);

  assert.equal(text, "Club & Sauna Hauptstraße 12 12345 Mannheim");
});

test("preserves plain text responses", () => {
  assert.equal(htmlToText("First line\nSecond line"), "First line Second line");
});
